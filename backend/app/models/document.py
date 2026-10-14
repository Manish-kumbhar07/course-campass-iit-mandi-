"""
Document Ingestion & Provenance Persistence Models
"""
import json
from typing import Any, Dict, List, Optional, TYPE_CHECKING
from sqlalchemy import BigInteger, Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import TimestampedModel

if TYPE_CHECKING:
    from app.models.course import Course


class CourseDocument(TimestampedModel):
    __tablename__ = "course_documents"

    course_id: Mapped[str] = mapped_column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    document_type: Mapped[str] = mapped_column(String(50), nullable=False)
    s3_storage_key: Mapped[str] = mapped_column(String(500), nullable=False)
    original_filename: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    content_type: Mapped[Optional[str]] = mapped_column(String(127), nullable=True)
    file_size_bytes: Mapped[int] = mapped_column(BigInteger, default=0)
    formatted_size: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    page_count_or_duration: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="uploaded", index=True, nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    extracted_concepts_json: Mapped[str] = mapped_column(Text, default="[]")
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    course: Mapped["Course"] = relationship("Course", back_populates="documents")
    pages: Mapped[List["DocumentPage"]] = relationship("DocumentPage", back_populates="document", cascade="all, delete-orphan")
    chunks: Mapped[List["DocumentChunk"]] = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    jobs: Mapped[List["ProcessingJob"]] = relationship("ProcessingJob", back_populates="document", cascade="all, delete-orphan")

    @property
    def extracted_concepts(self) -> List[str]:
        try:
            return json.loads(self.extracted_concepts_json)
        except Exception:
            return []

    @extracted_concepts.setter
    def extracted_concepts(self, concepts: List[str]) -> None:
        self.extracted_concepts_json = json.dumps(concepts)


class ProcessingJob(TimestampedModel):
    __tablename__ = "processing_jobs"

    document_id: Mapped[str] = mapped_column(String(36), ForeignKey("course_documents.id", ondelete="CASCADE"), index=True, nullable=False)
    stage: Mapped[str] = mapped_column(String(50), nullable=False)
    stage_number: Mapped[int] = mapped_column(Integer, default=1)
    total_stages: Mapped[int] = mapped_column(Integer, default=7)
    stage_description: Mapped[str] = mapped_column(String(255), nullable=False)
    progress_percent: Mapped[int] = mapped_column(Integer, default=0)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    error_log: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    document: Mapped["CourseDocument"] = relationship("CourseDocument", back_populates="jobs")


class DocumentPage(TimestampedModel):
    __tablename__ = "document_pages"

    document_id: Mapped[str] = mapped_column(String(36), ForeignKey("course_documents.id", ondelete="CASCADE"), index=True, nullable=False)
    page_number: Mapped[int] = mapped_column(Integer, nullable=False)
    slide_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    timestamp_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    location_label: Mapped[str] = mapped_column(String(150), nullable=False)
    raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    cleaned_text: Mapped[str] = mapped_column(Text, nullable=False)
    uncertainty_confidence: Mapped[str] = mapped_column(String(20), default="high")
    uncertainty_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    document: Mapped["CourseDocument"] = relationship("CourseDocument", back_populates="pages")
    visual_elements: Mapped[List["VisualElement"]] = relationship("VisualElement", back_populates="page", cascade="all, delete-orphan")
    chunks: Mapped[List["DocumentChunk"]] = relationship("DocumentChunk", back_populates="page")


class VisualElement(TimestampedModel):
    __tablename__ = "visual_elements"

    page_id: Mapped[str] = mapped_column(String(36), ForeignKey("document_pages.id", ondelete="CASCADE"), index=True, nullable=False)
    element_type: Mapped[str] = mapped_column(String(50), nullable=False)  # 'diagram', 'figure', 'whiteboard', 'chart', 'table'
    caption: Mapped[str] = mapped_column(Text, default="")
    ocr_extracted_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    s3_image_key: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    bounding_box_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    page: Mapped["DocumentPage"] = relationship("DocumentPage", back_populates="visual_elements")


class DocumentChunk(TimestampedModel):
    __tablename__ = "document_chunks"

    document_id: Mapped[str] = mapped_column(String(36), ForeignKey("course_documents.id", ondelete="CASCADE"), index=True, nullable=False)
    course_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), index=True, nullable=True)
    page_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("document_pages.id", ondelete="SET NULL"), nullable=True)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    token_count: Mapped[int] = mapped_column(Integer, default=0)
    location_label: Mapped[str] = mapped_column(String(150), nullable=False)
    page_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    slide_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    timestamp_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    document: Mapped["CourseDocument"] = relationship("CourseDocument", back_populates="chunks")
    page: Mapped[Optional["DocumentPage"]] = relationship("DocumentPage", back_populates="chunks")
    embedding: Mapped[Optional["ChunkEmbedding"]] = relationship("ChunkEmbedding", back_populates="chunk", uselist=False, cascade="all, delete-orphan")


class ChunkEmbedding(TimestampedModel):
    __tablename__ = "chunk_embeddings"

    chunk_id: Mapped[str] = mapped_column(String(36), ForeignKey("document_chunks.id", ondelete="CASCADE"), primary_key=True)
    embedding_model: Mapped[str] = mapped_column(String(100), default="text-embedding-004")
    # In SQLite or when pgvector is not natively linked in SQLAlchemy ORM, store as JSON serialized string, with pgvector DDL for PostgreSQL
    embedding_json: Mapped[str] = mapped_column(Text, nullable=False)

    chunk: Mapped["DocumentChunk"] = relationship("DocumentChunk", back_populates="embedding")
