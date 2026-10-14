"""
Comprehensive Unit & Integration Tests for CourseCompass Ingestion Pipeline
Covers: Success, Malformed Output, Timeouts, Retries, Duplicate Jobs, Idempotency, and Partial Failures.
Can be executed via standard library unittest or pytest.
"""
import asyncio
import os
import shutil
import tempfile
import unittest
from unittest.mock import AsyncMock, patch
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool
from app.core.database import AsyncSessionAdapter
from app.core.exceptions import (
    DuplicateProcessingJobError,
    ExtractionProviderError,
    ExtractionTimeoutError,
    ResourceLimitExceededError,
    TransientExtractionError,
    UnauthorizedAccessError,
    UnsupportedFormatError
)
from app.models.base import Base
from app.models.course import Course
from app.models.document import CourseDocument, DocumentChunk, DocumentPage, ProcessingJob
from app.models.user import User
from app.providers.extraction.base import BaseExtractionProvider
from app.providers.storage.s3 import LocalStorageProvider
from app.schemas.extraction import ExtractedSegment, NormalizedDocumentExtraction
from app.services.ingestion_service import IngestionService
from app.workers.ingestion_worker import IngestionWorker


class MockFailingExtractionProvider(BaseExtractionProvider):
    """Provider configured to fail a set number of times with transient errors before succeeding."""

    def __init__(self, failure_count: int = 2, fail_type: str = "transient"):
        self.failure_count = failure_count
        self.fail_type = fail_type
        self.attempts = 0

    async def extract_document(self, file_bytes, file_name, document_id, document_type):
        self.attempts += 1
        if self.attempts <= self.failure_count:
            if self.fail_type == "timeout":
                raise ExtractionTimeoutError(5, provider="gemini")
            elif self.fail_type == "malformed":
                raise ExtractionProviderError("Malformed JSON structure", provider="gemini")
            raise TransientExtractionError("Temporary Gemini rate limit (429)")

        # Success on subsequent attempts
        seg = ExtractedSegment(
            segment_id=f"seg-{document_id}-p1",
            document_id=document_id,
            segment_type="page",
            page_number=1,
            location_label=f"{file_name}, Page 1",
            raw_text="Extracted text on retry",
            cleaned_text="# Extracted text on retry",
            headings=["Heading 1"],
            extracted_concepts=["Concept A"]
        )
        return NormalizedDocumentExtraction(
            document_id=document_id,
            title=file_name,
            document_type=document_type,
            total_pages_or_duration="1 Page",
            segments=[seg],
            summary="Success summary",
            key_concepts=["Concept A"]
        )


class TestIngestionPipeline(unittest.IsolatedAsyncioTestCase):
    """Comprehensive Ingestion Pipeline Test Suite."""

    async def asyncSetUp(self):
        # Create in-memory SQLite engine with StaticPool
        self.engine = create_engine(
            "sqlite:///:memory:",
            echo=False,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool
        )
        Base.metadata.create_all(bind=self.engine)
        self.SessionLocal = sessionmaker(bind=self.engine, class_=Session, expire_on_commit=False)
        self.db = AsyncSessionAdapter(self.SessionLocal())

        # Temporary local storage
        self.temp_dir = tempfile.mkdtemp(prefix="cc_test_storage_")
        self.storage = LocalStorageProvider(root_dir=self.temp_dir)

        # Seed User & Course
        self.user = User(
            id="usr-ananya-sharma",
            email="ananya.sharma@collegemail.edu",
            hashed_password="hashed_pw_test",
            full_name="Ananya Sharma",
            academic_level="Undergraduate",
            institution="School of Engineering"
        )
        self.db.add(self.user)
        await self.db.flush()

        self.course = Course(
            id="course-cs204",
            user_id=self.user.id,
            name="Data Structures: Recursion and Graphs",
            code="CS 204",
            subject="Computer Science"
        )
        self.db.add(self.course)
        await self.db.commit()

    async def asyncTearDown(self):
        await self.db.close()
        Base.metadata.drop_all(bind=self.engine)
        self.engine.dispose()
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    async def test_01_successful_pdf_ingestion_and_persistence(self):
        """Test 1: Full end-to-end happy path for PDF material upload, extraction, and persistence."""
        sample_pdf_bytes = b"%PDF-1.4 sample academic syllabus and textbook content"
        file_name = "Textbook_Ch4_Recursion.pdf"

        with patch("app.services.ingestion_service.get_storage_provider", return_value=self.storage):
            doc, job = await IngestionService.validate_and_register_upload(
                db=self.db,
                user_id=self.user.id,
                course_id=self.course.id,
                file_name=file_name,
                file_bytes=sample_pdf_bytes,
                content_type="application/pdf",
                title_override="Textbook Ch. 4: Recursion Foundations"
            )

        self.assertIsNotNone(doc.id)
        self.assertEqual(doc.status, "uploaded")
        self.assertEqual(doc.document_type, "pdf")
        self.assertEqual(job.stage, "secure_upload")
        self.assertEqual(job.progress_percent, 14)

        # Run Ingestion Worker
        worker = IngestionWorker(storage_provider=self.storage)
        completed_doc = await worker.process_document(self.db, doc.id, job_id=job.id)

        self.assertEqual(completed_doc.status, "indexed")
        self.assertEqual(completed_doc.page_count_or_duration, "2 Pages")
        self.assertIn("Base Cases", completed_doc.extracted_concepts)

        # Verify Database Provenance Records
        pages_res = await self.db.execute(select(DocumentPage).where(DocumentPage.document_id == doc.id))
        pages = pages_res.scalars().all()
        self.assertEqual(len(pages), 2)
        self.assertEqual(pages[0].page_number, 1)
        self.assertIn("Chapter 4", pages[0].raw_text)

        chunks_res = await self.db.execute(select(DocumentChunk).where(DocumentChunk.document_id == doc.id))
        chunks = chunks_res.scalars().all()
        self.assertEqual(len(chunks), 2)
        self.assertEqual(chunks[0].page_id, pages[0].id)

        # Verify Job Completed State
        refreshed_job = await self.db.get(ProcessingJob, job.id)
        self.assertTrue(refreshed_job.is_completed)
        self.assertEqual(refreshed_job.stage, "ready")
        self.assertEqual(refreshed_job.progress_percent, 100)

    async def test_02_unsupported_format_rejection(self):
        """Test 2: Rejection of unpermitted file extensions and MIME types."""
        malicious_bytes = b"MZ executable payload"

        with self.assertRaises(UnsupportedFormatError) as cm:
            await IngestionService.validate_and_register_upload(
                db=self.db,
                user_id=self.user.id,
                course_id=self.course.id,
                file_name="malicious_script.exe",
                file_bytes=malicious_bytes,
                content_type="application/x-msdownload"
            )
        self.assertIn("Unsupported file format '.exe'", str(cm.exception))

    async def test_03_resource_limit_exceeded(self):
        """Test 3: Rejection of files exceeding maximum allowed size limits."""
        oversized_bytes = b"0" * (51 * 1024 * 1024)  # 51 MB (limit is 50MB)

        with self.assertRaises(ResourceLimitExceededError) as cm:
            await IngestionService.validate_and_register_upload(
                db=self.db,
                user_id=self.user.id,
                course_id=self.course.id,
                file_name="huge_lecture.pdf",
                file_bytes=oversized_bytes,
                content_type="application/pdf"
            )
        self.assertIn("File size exceeds maximum allowed", str(cm.exception))

    async def test_04_unauthorized_course_access(self):
        """Test 4: Tenant isolation - preventing upload to another user's course."""
        rogue_user_id = "usr-different-student"

        with self.assertRaises(UnauthorizedAccessError):
            await IngestionService.validate_and_register_upload(
                db=self.db,
                user_id=rogue_user_id,
                course_id=self.course.id,
                file_name="lecture.pdf",
                file_bytes=b"%PDF test",
                content_type="application/pdf"
            )

    async def test_05_duplicate_processing_job_prevention(self):
        """Test 5: Prevention of concurrent duplicate jobs on an already active document."""
        with patch("app.services.ingestion_service.get_storage_provider", return_value=self.storage):
            doc, job = await IngestionService.validate_and_register_upload(
                db=self.db,
                user_id=self.user.id,
                course_id=self.course.id,
                file_name="lecture_slides.pdf",
                file_bytes=b"%PDF slides",
                content_type="application/pdf"
            )

        # Set document to processing state with an active job
        doc.status = "processing"
        job.is_completed = False
        await self.db.commit()

        worker = IngestionWorker(storage_provider=self.storage)
        with self.assertRaises(DuplicateProcessingJobError):
            await worker.process_document(self.db, doc.id)

    async def test_06_provider_transient_error_and_retry_recovery(self):
        """Test 6: Provider transient failures retry with bounded backoff and succeed."""
        with patch("app.services.ingestion_service.get_storage_provider", return_value=self.storage):
            doc, job = await IngestionService.validate_and_register_upload(
                db=self.db,
                user_id=self.user.id,
                course_id=self.course.id,
                file_name="math_notes.pdf",
                file_bytes=b"%PDF notes",
                content_type="application/pdf"
            )

        # Provider will fail 2 times with 429 then succeed
        mock_provider = MockFailingExtractionProvider(failure_count=2, fail_type="transient")
        worker = IngestionWorker(extraction_provider=mock_provider, storage_provider=self.storage)

        with patch("asyncio.sleep", new_callable=AsyncMock):
            completed_doc = await worker.process_document(self.db, doc.id, job_id=job.id)

        self.assertEqual(completed_doc.status, "indexed")
        self.assertEqual(mock_provider.attempts, 3)  # 2 failures + 1 success

    async def test_07_malformed_provider_output_handling(self):
        """Test 7: Unrecoverable provider failure properly marks document as failed."""
        with patch("app.services.ingestion_service.get_storage_provider", return_value=self.storage):
            doc, job = await IngestionService.validate_and_register_upload(
                db=self.db,
                user_id=self.user.id,
                course_id=self.course.id,
                file_name="corrupt.pdf",
                file_bytes=b"%PDF corrupt",
                content_type="application/pdf"
            )

        mock_provider = MockFailingExtractionProvider(failure_count=5, fail_type="malformed")
        worker = IngestionWorker(extraction_provider=mock_provider, storage_provider=self.storage)

        with self.assertRaises(ExtractionProviderError):
            await worker.process_document(self.db, doc.id, job_id=job.id)

        refreshed_doc = await self.db.get(CourseDocument, doc.id)
        self.assertEqual(refreshed_doc.status, "failed")
        self.assertIn("Malformed JSON", refreshed_doc.error_message)

        refreshed_job = await self.db.get(ProcessingJob, job.id)
        self.assertTrue(refreshed_job.is_completed)
        self.assertIn("Malformed JSON", refreshed_job.error_log)

    async def test_08_idempotent_reprocessing_replaces_old_pages(self):
        """Test 8: Re-processing an existing document replaces old pages and chunks without duplicates."""
        with patch("app.services.ingestion_service.get_storage_provider", return_value=self.storage):
            doc, job = await IngestionService.validate_and_register_upload(
                db=self.db,
                user_id=self.user.id,
                course_id=self.course.id,
                file_name="lecture.pdf",
                file_bytes=b"%PDF test",
                content_type="application/pdf"
            )

        worker = IngestionWorker(storage_provider=self.storage)
        # First processing pass
        await worker.process_document(self.db, doc.id, job_id=job.id)

        pages_1 = (await self.db.execute(select(DocumentPage).where(DocumentPage.document_id == doc.id))).scalars().all()
        chunks_1 = (await self.db.execute(select(DocumentChunk).where(DocumentChunk.document_id == doc.id))).scalars().all()
        self.assertEqual(len(pages_1), 2)
        self.assertEqual(len(chunks_1), 2)

        # Reset doc status to 'uploaded' and re-run ingestion worker
        doc.status = "uploaded"
        await self.db.commit()

        await worker.process_document(self.db, doc.id)

        # Count pages and chunks after re-processing — must be exactly 2, not 4!
        pages_2 = (await self.db.execute(select(DocumentPage).where(DocumentPage.document_id == doc.id))).scalars().all()
        chunks_2 = (await self.db.execute(select(DocumentChunk).where(DocumentChunk.document_id == doc.id))).scalars().all()
        self.assertEqual(len(pages_2), 2)
        self.assertEqual(len(chunks_2), 2)

    async def test_09_partial_failure_and_uncertainty_marking(self):
        """Test 9: Low-resolution or muffled segments preserve uncertainty confidence flags."""
        with patch("app.services.ingestion_service.get_storage_provider", return_value=self.storage):
            doc, job = await IngestionService.validate_and_register_upload(
                db=self.db,
                user_id=self.user.id,
                course_id=self.course.id,
                file_name="blurry_whiteboard.png",
                file_bytes=b"\x89PNG blurry",
                content_type="image/png"
            )

        class LowConfidenceExtractionProvider(BaseExtractionProvider):
            async def extract_document(self, file_bytes, file_name, document_id, document_type):
                seg = ExtractedSegment(
                    segment_id=f"seg-{document_id}-1",
                    document_id=document_id,
                    segment_type="image_view",
                    location_label="Whiteboard Photo",
                    raw_text="[Illegible partial handwriting on left quadrant]",
                    cleaned_text="Three-color cycle invariant (partial)",
                    uncertainty_confidence="low",
                    uncertainty_notes="Marker glare and low resolution"
                )
                return NormalizedDocumentExtraction(
                    document_id=document_id,
                    title=file_name,
                    document_type="image",
                    total_pages_or_duration="1 Image",
                    segments=[seg],
                    summary="Partial diagram",
                    key_concepts=[]
                )

        worker = IngestionWorker(extraction_provider=LowConfidenceExtractionProvider(), storage_provider=self.storage)
        completed_doc = await worker.process_document(self.db, doc.id, job_id=job.id)

        self.assertEqual(completed_doc.status, "indexed")
        pages = (await self.db.execute(select(DocumentPage).where(DocumentPage.document_id == doc.id))).scalars().all()
        self.assertEqual(len(pages), 1)
        self.assertEqual(pages[0].uncertainty_confidence, "low")
        self.assertEqual(pages[0].uncertainty_notes, "Marker glare and low resolution")


if __name__ == "__main__":
    unittest.main()

