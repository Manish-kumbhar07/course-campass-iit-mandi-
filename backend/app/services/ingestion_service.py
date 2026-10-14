"""
Ingestion Domain Service
Handles document ownership verification, upload validation, resource limits, and job registration.
"""
import uuid
from pathlib import Path
from typing import List, Optional, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.config import settings
from app.core.exceptions import (
    DocumentNotFoundError,
    ResourceLimitExceededError,
    UnauthorizedAccessError,
    UnsupportedFormatError
)
from app.models.course import Course
from app.models.document import CourseDocument, DocumentPage, ProcessingJob
from app.core.audit import record_audit
from app.services.file_validation import (
    expected_file_type,
    validate_signature,
    validate_video_duration,
)
from app.providers.storage.s3 import get_storage_provider


class IngestionService:
    """Manages course material upload authorization, storage, and retrieval."""

    @staticmethod
    def _detect_doc_type(file_name: str, content_type: str) -> str:
        ext = Path(file_name).suffix.lower()
        if ext == ".pdf" or "pdf" in content_type:
            return "pdf"
        elif ext in [".pptx", ".ppt"] or "presentation" in content_type:
            return "slides"
        elif ext in [".png", ".jpg", ".jpeg", ".webp"] or "image" in content_type:
            return "image"
        elif ext in [".mp3", ".wav", ".m4a", ".aac"] or "audio" in content_type:
            return "audio"
        elif ext in [".mp4", ".webm", ".mov"] or "video" in content_type:
            return "video"
        return "notes"

    @classmethod
    async def validate_and_register_upload(
        cls,
        db: AsyncSession,
        user_id: str,
        course_id: str,
        file_name: str,
        file_bytes: bytes,
        content_type: str = "application/octet-stream",
        title_override: Optional[str] = None
    ) -> Tuple[CourseDocument, ProcessingJob]:
        """
        1. Verify course ownership.
        2. Validate file type and resource limits.
        3. Save file into private storage.
        4. Register CourseDocument and ProcessingJob records.
        """
        # 1. Ownership & Course Verification
        course_res = await db.execute(
            select(Course).where(Course.id == course_id, Course.user_id == user_id)
        )
        course = course_res.scalar_one_or_none()
        if not course:
            raise UnauthorizedAccessError(
                "Course not found or unauthorized"
            )

        file_size = len(file_bytes)
        # Validate the extension, declared MIME type and binary signature before storing.
        clean_filename, doc_type = expected_file_type(file_name, content_type, file_size)
        validate_signature(clean_filename, content_type, file_bytes)
        duration = await validate_video_duration(file_bytes) if doc_type == "video" else None
        safe_title = (title_override or clean_filename).strip()
        if not safe_title or len(safe_title) > 300 or any(ord(c) < 32 for c in safe_title):
            raise UnsupportedFormatError("title", ["a non-empty title of at most 300 characters"])

        # 3. Store into Private Storage
        storage_key = f"courses/{course_id}/materials/{uuid.uuid4().hex}"
        storage = get_storage_provider()
        await storage.upload_bytes(
            file_bytes, storage_key, content_type.lower().split(";", 1)[0].strip()
        )

        formatted_size = (
            f"{file_size / (1024 * 1024):.1f} MB"
            if file_size >= 1024 * 1024
            else f"{file_size / 1024:.1f} KB"
        )

        # 4. Create Document & Job Records
        doc = CourseDocument(
            course_id=course_id,
            title=safe_title,
            document_type=doc_type,
            s3_storage_key=storage_key,
            original_filename=clean_filename,
            content_type=content_type.lower().split(";", 1)[0].strip(),
            file_size_bytes=file_size,
            formatted_size=formatted_size,
            page_count_or_duration=f"{duration} seconds" if duration is not None else None,
            status="uploaded"
        )
        db.add(doc)
        await db.flush()

        job = ProcessingJob(
            document_id=doc.id,
            stage="secure_upload",
            stage_number=1,
            total_stages=7,
            stage_description="Validating cryptographic container and file signatures",
            progress_percent=14,
            is_completed=False
        )
        db.add(job)
        await record_audit(
            db, "document.upload.complete", "document", actor_user_id=user_id,
            resource_id=doc.id, metadata={"courseId": course_id, "sizeBytes": file_size},
        )
        await db.commit()
        await db.refresh(doc)
        await db.refresh(job)

        return doc, job

    @staticmethod
    async def get_course_documents(db: AsyncSession, user_id: str, course_id: str) -> List[CourseDocument]:
        """Fetch all documents for a course verifying ownership."""
        # Check course ownership
        course_res = await db.execute(select(Course).where(Course.id == course_id, Course.user_id == user_id))
        if not course_res.scalar_one_or_none():
            raise UnauthorizedAccessError("Course not found or unauthorized")

        res = await db.execute(
            select(CourseDocument)
            .where(CourseDocument.course_id == course_id)
            .order_by(CourseDocument.created_at.desc())
        )
        return list(res.scalars().all())

    @staticmethod
    async def get_job_status(db: AsyncSession, user_id: str, job_id: str) -> ProcessingJob:
        """Fetch processing job status verifying ownership through document and course."""
        res = await db.execute(
            select(ProcessingJob)
            .join(CourseDocument, ProcessingJob.document_id == CourseDocument.id)
            .join(Course, CourseDocument.course_id == Course.id)
            .where(ProcessingJob.id == job_id, Course.user_id == user_id)
        )
        job = res.scalar_one_or_none()
        if not job:
            raise UnauthorizedAccessError("Job not found or unauthorized")
        return job

    @staticmethod
    async def get_document_pages(db: AsyncSession, user_id: str, document_id: str) -> List[DocumentPage]:
        """Fetch document pages and visual elements verifying ownership."""
        res = await db.execute(
            select(DocumentPage)
            .options(selectinload(DocumentPage.visual_elements))
            .join(CourseDocument, DocumentPage.document_id == CourseDocument.id)
            .join(Course, CourseDocument.course_id == Course.id)
            .where(DocumentPage.document_id == document_id, Course.user_id == user_id)
            .order_by(DocumentPage.page_number.asc())
        )
        return list(res.scalars().all())
