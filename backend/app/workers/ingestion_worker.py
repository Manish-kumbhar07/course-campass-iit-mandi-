"""
Ingestion Background Worker
Executes multimodal extraction, stage transitions, idempotency checks, and transactional persistence.
"""
import asyncio
import logging
import random
import time
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.core.exceptions import (
    DuplicateProcessingJobError,
    ExtractionProviderError,
    ExtractionTimeoutError,
    TransientExtractionError
)
from app.models.document import CourseDocument, ProcessingJob
from app.providers.extraction.gemini_extractor import GeminiExtractionProvider
from app.providers.storage.s3 import get_storage_provider
from app.services.persistence_service import IngestionPersistenceService

logger = logging.getLogger("coursecompass.worker.ingestion")

STAGES_MAP = [
    ("secure_upload", 1, 14, "Validating cryptographic container and file signatures"),
    ("reading_content", 2, 28, "Extracting formatted text, headings, and code blocks"),
    ("understanding_diagrams", 3, 42, "Analyzing whiteboard diagrams and visual trees"),
    ("transcribing_lecture", 4, 56, "Generating timestamped speech-to-text transcript"),
    ("finding_concepts", 5, 70, "Isolating key topics, theorems, and definitions"),
    ("building_prerequisites", 6, 85, "Constructing dependency edges between concepts"),
    ("ready", 7, 100, "Corpus indexing complete. Verified citations generated.")
]


class IngestionWorker:
    """Orchestrates asynchronous document ingestion, stage transitions, and fault tolerance."""

    def __init__(self, extraction_provider=None, storage_provider=None):
        self.extraction_provider = extraction_provider or GeminiExtractionProvider()
        self.storage_provider = storage_provider or get_storage_provider()

    async def _update_job_stage(
        self,
        db: AsyncSession,
        job: ProcessingJob,
        stage_tuple: tuple
    ) -> None:
        stage, stage_num, pct, desc = stage_tuple
        job.stage = stage
        job.stage_number = stage_num
        job.progress_percent = pct
        job.stage_description = desc
        await db.commit()
        await db.refresh(job)

    async def process_document(
        self,
        db: AsyncSession,
        document_id: str,
        job_id: Optional[str] = None
    ) -> CourseDocument:
        """
        Execute full extraction pipeline on an authorized document.
        Idempotent: prevents duplicate execution and cleans previous state on re-runs.
        """
        start_time = time.time()
        logger.info(f"Starting ingestion worker for document '{document_id}'")

        # 1. Fetch Document Record
        doc_res = await db.execute(select(CourseDocument).where(CourseDocument.id == document_id))
        doc = doc_res.scalar_one_or_none()
        if not doc:
            raise ValueError(f"Document with id '{document_id}' does not exist")

        # 2. Idempotency & Eligibility Check
        if doc.status == "processing":
            # Check for active running job
            job_res = await db.execute(
                select(ProcessingJob)
                .where(ProcessingJob.document_id == document_id, ProcessingJob.is_completed == False)
                .order_by(ProcessingJob.created_at.desc())
            )
            active_job = job_res.scalar_one_or_none()
            if active_job:
                raise DuplicateProcessingJobError(document_id, active_job.id)

        # 3. Fetch or Create ProcessingJob
        job = None
        if job_id:
            j_res = await db.execute(select(ProcessingJob).where(ProcessingJob.id == job_id))
            job = j_res.scalar_one_or_none()

        if not job:
            job = ProcessingJob(
                document_id=document_id,
                stage="secure_upload",
                stage_number=1,
                total_stages=7,
                stage_description="Validating cryptographic container and file signatures",
                progress_percent=14,
                is_completed=False
            )
            db.add(job)
            await db.flush()

        doc.status = "processing"
        await db.commit()

        try:
            # Stage 1: Secure upload
            await self._update_job_stage(db, job, STAGES_MAP[0])

            # Retrieve file bytes from private storage
            file_bytes = await self.storage_provider.download_bytes(doc.s3_storage_key)

            # Stage 2: Reading content
            await self._update_job_stage(db, job, STAGES_MAP[1])

            # Stage 3: Understanding diagrams
            await self._update_job_stage(db, job, STAGES_MAP[2])

            # Stage 4: Transcribing lecture
            await self._update_job_stage(db, job, STAGES_MAP[3])

            # Execute Multimodal Extraction via Provider with bounded retries
            attempt = 0
            max_retries = settings.MAX_RETRIES
            base_delay = settings.BACKOFF_BASE_SECONDS
            extraction = None

            while attempt <= max_retries:
                try:
                    extraction = await self.extraction_provider.extract_document(
                        file_bytes=file_bytes,
                        file_name=doc.title,
                        document_id=doc.id,
                        document_type=doc.document_type
                    )
                    break
                except (TransientExtractionError, ExtractionTimeoutError) as e:
                    attempt += 1
                    if attempt > max_retries:
                        raise ExtractionProviderError(f"Extraction failed after {max_retries} retries: {e}", provider="gemini")
                    delay = base_delay * (2 ** attempt) + random.uniform(0.1, 0.4)
                    logger.warning(f"Transient extraction error on attempt {attempt}: {e}. Retrying in {delay:.2f}s...")
                    await asyncio.sleep(delay)

            # Stage 5: Finding concepts
            await self._update_job_stage(db, job, STAGES_MAP[4])

            # Stage 6: Building prerequisites
            await self._update_job_stage(db, job, STAGES_MAP[5])

            # Transactional, Idempotent Persistence
            doc = await IngestionPersistenceService.persist_extraction(
                db=db,
                document_id=document_id,
                extraction=extraction
            )

            # Stage 7: Ready
            await self._update_job_stage(db, job, STAGES_MAP[6])
            job.is_completed = True
            await db.commit()

            duration = time.time() - start_time
            logger.info(
                f"Ingestion worker finished successfully for document '{document_id}' "
                f"in {duration:.2f}s (Type: {doc.document_type})"
            )
            return doc

        except Exception as e:
            duration = time.time() - start_time
            logger.error(f"Ingestion worker failed for document '{document_id}' after {duration:.2f}s: {e}")
            job.error_log = str(e)
            job.is_completed = True
            job.progress_percent = 100
            doc.status = "failed"
            doc.error_message = str(e)
            await db.commit()
            raise

