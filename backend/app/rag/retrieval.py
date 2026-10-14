"""
Hybrid Retrieval Engine for CourseCompass
Combines dense semantic vector search (via pgvector / cosine similarity)
with sparse keyword relevance and strict course-level authorization boundaries.
"""
import json
import logging
import math
import re
from dataclasses import dataclass
from typing import List, Optional, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import UnauthorizedAccessError
from app.models.course import Course
from app.models.document import CourseDocument, DocumentChunk, ChunkEmbedding
from app.rag.embeddings.factory import get_embedding_provider
from app.schemas.graph import SourceCitationOut

logger = logging.getLogger("coursecompass.rag.retrieval")


@dataclass
class RetrievalResult:
    chunk_id: str
    document_id: str
    document_title: str
    document_type: str
    course_id: str
    location_label: str
    page_number: Optional[int]
    slide_number: Optional[int]
    timestamp_seconds: Optional[int]
    content: str
    score: float
    dense_score: float
    keyword_score: float

    def to_citation(self, citation_id: Optional[str] = None) -> SourceCitationOut:
        return SourceCitationOut(
            id=citation_id or f"cite-ret-{self.chunk_id[:8]}",
            document_id=self.document_id,
            document_title=self.document_title,
            source_title=self.document_title,
            document_type=self.document_type,
            source_type=self.document_type,
            location_label=self.location_label,
            page_number=self.page_number,
            slide_number=self.slide_number,
            timestamp_seconds=self.timestamp_seconds,
            excerpt=self.content[:300],
            context_snippet=f"From {self.document_title} at {self.location_label}",
            verification_confidence="verified" if self.score > 0.65 else "partial"
        )


class RetrievalService:
    """Production RAG retrieval service with tenant isolation and hybrid ranking."""

    @staticmethod
    async def verify_course_access(db: AsyncSession, user_id: str, course_id: str) -> None:
        """
        Verify that the user owns or is authorized for the course.
        Never trust client-provided course ID without verifying DB ownership.
        """
        stmt = select(Course.id).where(Course.id == course_id, Course.user_id == user_id)
        res = await db.execute(stmt)
        if res.scalar_one_or_none() is None:
            raise UnauthorizedAccessError(
                f"User '{user_id}' is not authorized to access course '{course_id}'",
                details={"courseId": course_id, "userId": user_id}
            )

    @staticmethod
    def _compute_cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
        """Compute cosine similarity between two float vectors."""
        if not vec_a or not vec_b or len(vec_a) != len(vec_b):
            return 0.0
        # Dot product
        dot = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))
        if norm_a < 1e-9 or norm_b < 1e-9:
            return 0.0
        sim = dot / (norm_a * norm_b)
        return max(0.0, min(1.0, (sim + 1.0) / 2.0))  # Map [-1, 1] to [0, 1]

    @staticmethod
    def _compute_keyword_score(query: str, text: str) -> float:
        """Compute sparse term overlap score."""
        stop_words = {
            "the", "a", "an", "is", "are", "was", "were", "what", "how", "why",
            "can", "you", "explain", "tell", "about", "for", "with", "in", "on",
            "of", "and", "or", "to", "does", "do", "mean", "define", "please"
        }
        q_words = [w for w in re.findall(r"\w+", query.lower()) if len(w) > 1 and w not in stop_words]
        if not q_words:
            q_words = [w for w in re.findall(r"\w+", query.lower()) if len(w) > 1]
        if not q_words:
            return 0.0

        t_lower = text.lower()
        # Direct multi-word phrase bonus
        cleaned_query = " ".join(q_words)
        if len(cleaned_query) > 5 and cleaned_query in t_lower:
            return 1.0

        matched = sum(1 for qw in q_words if qw in t_lower)
        return min(1.0, matched / len(q_words))

    @classmethod
    async def retrieve(
        cls,
        db: AsyncSession,
        user_id: str,
        course_id: str,
        query: str,
        top_k: int = 5,
        min_relevance_threshold: float = 0.30,
        alpha: float = 0.7  # 0.7 dense + 0.3 keyword
    ) -> List[RetrievalResult]:
        """
        Execute hybrid similarity search over authorized course chunks.
        Applies relevance filtering: does NOT return chunks below min_relevance_threshold.
        """
        # 1. Mandatory authorization check
        await cls.verify_course_access(db, user_id, course_id)

        cleaned_query = query.strip()
        if not cleaned_query:
            return []

        # 2. Generate query embedding
        provider = get_embedding_provider()
        query_vector = await provider.embed_query(cleaned_query)

        # 3. Retrieve chunks with document metadata strictly filtered by course_id
        stmt = (
            select(DocumentChunk, CourseDocument, ChunkEmbedding)
            .join(CourseDocument, CourseDocument.id == DocumentChunk.document_id)
            .outerjoin(ChunkEmbedding, ChunkEmbedding.chunk_id == DocumentChunk.id)
            .where(
                (DocumentChunk.course_id == course_id) | (CourseDocument.course_id == course_id)
            )
        )
        res = await db.execute(stmt)
        candidates = res.all()

        scored_results: List[RetrievalResult] = []

        for chunk, doc, emb in candidates:
            # Dense score
            dense_score = 0.0
            if emb and emb.embedding_json:
                try:
                    chunk_vector = json.loads(emb.embedding_json)
                    dense_score = cls._compute_cosine_similarity(query_vector, chunk_vector)
                except Exception:
                    dense_score = 0.0

            # Keyword score
            keyword_score = cls._compute_keyword_score(cleaned_query, chunk.content)

            # Blended score with keyword preservation
            if dense_score > 0.0:
                blended_score = max(
                    (alpha * dense_score) + ((1.0 - alpha) * keyword_score),
                    keyword_score * 0.85
                )
            else:
                blended_score = keyword_score

            # Apply strict relevance threshold
            if blended_score >= min_relevance_threshold:
                scored_results.append(
                    RetrievalResult(
                        chunk_id=chunk.id,
                        document_id=doc.id,
                        document_title=doc.title,
                        document_type=doc.document_type,
                        course_id=course_id,
                        location_label=chunk.location_label,
                        page_number=chunk.page_number,
                        slide_number=chunk.slide_number,
                        timestamp_seconds=chunk.timestamp_seconds,
                        content=chunk.content,
                        score=round(blended_score, 4),
                        dense_score=round(dense_score, 4),
                        keyword_score=round(keyword_score, 4)
                    )
                )

        # Sort descending by score and return top_k
        scored_results.sort(key=lambda r: r.score, reverse=True)
        return scored_results[:top_k]

