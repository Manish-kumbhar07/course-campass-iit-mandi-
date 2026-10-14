"""
Abstract Multimodal Extraction Provider Interface
"""
from abc import ABC, abstractmethod
from app.schemas.extraction import NormalizedDocumentExtraction


class BaseExtractionProvider(ABC):
    """Abstract interface for extracting text, equations, tables, and visual elements from multimodal courseware."""

    @abstractmethod
    async def extract_document(
        self,
        file_bytes: bytes,
        file_name: str,
        document_id: str,
        document_type: str
    ) -> NormalizedDocumentExtraction:
        """
        Extract structured content from document or media bytes.
        Must preserve provenance (document ID, page/slide number, or timestamp).
        Must flag uncertain or illegible content.
        """
        pass

