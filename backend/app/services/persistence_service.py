"""
Transactional Persistence Service for Normalized Extraction Output
Guarantees idempotency and prevents duplicate pages, chunks, and visual elements.
"""
import json
import logging
from typing import List
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.document import (
    ChunkEmbedding,
    CourseDocument,
    DocumentChunk,
    DocumentPage,
    ProcessingJob,
    VisualElement
)
from app.schemas.extraction import NormalizedDocumentExtraction
from app.rag.embeddings.factory import get_embedding_provider

logger = logging.getLogger("coursecompass.persistence")


class IngestionPersistenceService:
    """Handles atomic, idempotent database persistence of extracted document structures."""

    @staticmethod
    async def persist_extraction(
        db: AsyncSession,
        document_id: str,
        extraction: NormalizedDocumentExtraction
    ) -> CourseDocument:
        """
        Atomically persist all pages, visual elements, and chunks.
        Idempotent: removes any previous extraction remnants for this document.
        """
        # 1. Fetch document record
        result = await db.execute(select(CourseDocument).where(CourseDocument.id == document_id))
        doc = result.scalar_one_or_none()
        if not doc:
            raise ValueError(f"CourseDocument with id '{document_id}' not found")

        # 2. Idempotency Cleanup: Remove existing pages, visual elements, and chunks for this doc
        # (Cascades handle visual elements and chunk embeddings automatically)
        await db.execute(delete(DocumentPage).where(DocumentPage.document_id == document_id))
        await db.execute(delete(DocumentChunk).where(DocumentChunk.document_id == document_id))

        # 3. Insert fresh pages & visual elements
        created_pages: List[DocumentPage] = []
        created_chunks: List[DocumentChunk] = []

        chunk_counter = 0

        for seg in extraction.segments:
            page_record = DocumentPage(
                document_id=document_id,
                page_number=seg.page_number or 1,
                slide_number=seg.slide_number,
                timestamp_seconds=seg.timestamp_seconds,
                location_label=seg.location_label,
                raw_text=seg.raw_text,
                cleaned_text=seg.cleaned_text,
                uncertainty_confidence=seg.uncertainty_confidence,
                uncertainty_notes=seg.uncertainty_notes
            )
            db.add(page_record)
            await db.flush()  # Flush to generate page_record.id

            created_pages.append(page_record)

            # Visual elements linked to this page
            for vis in seg.visual_elements:
                vis_record = VisualElement(
                    page_id=page_record.id,
                    element_type=vis.element_type,
                    caption=vis.caption,
                    ocr_extracted_text=vis.ocr_extracted_text,
                    s3_image_key=vis.image_storage_key,
                    bounding_box_json=json.dumps(vis.bounding_box) if vis.bounding_box else None
                )
                db.add(vis_record)

            # Generate semantic chunk for this segment
            chunk_record = DocumentChunk(
                document_id=document_id,
                course_id=doc.course_id,
                page_id=page_record.id,
                chunk_index=chunk_counter,
                content=seg.cleaned_text,
                token_count=len(seg.cleaned_text.split()),
                location_label=seg.location_label,
                page_number=seg.page_number,
                slide_number=seg.slide_number,
                timestamp_seconds=seg.timestamp_seconds
            )
            db.add(chunk_record)
            await db.flush()

            # Generate 768-dim normalized embedding vector for hybrid retrieval
            try:
                embedding_provider = get_embedding_provider()
                emb_vec = await embedding_provider.embed_query(chunk_record.content)
                emb_model = embedding_provider.model_name
            except Exception as emb_err:
                logger.warning(f"Could not compute dense embedding for chunk {chunk_record.id}: {emb_err}")
                emb_vec = [0.0] * 768
                emb_model = "deterministic-fallback"

            embedding_record = ChunkEmbedding(
                chunk_id=chunk_record.id,
                embedding_model=emb_model,
                embedding_json=json.dumps(emb_vec)
            )
            db.add(embedding_record)

            created_chunks.append(chunk_record)
            chunk_counter += 1

        # 4. Update CourseDocument metadata
        doc.status = "indexed"
        doc.page_count_or_duration = extraction.total_pages_or_duration
        doc.summary = extraction.summary
        doc.extracted_concepts = extraction.key_concepts
        doc.error_message = None

        await db.commit()
        await db.refresh(doc)
        logger.info(
            f"Successfully persisted extraction for document '{document_id}': "
            f"{len(created_pages)} pages, {len(created_chunks)} chunks"
        )
        return doc

