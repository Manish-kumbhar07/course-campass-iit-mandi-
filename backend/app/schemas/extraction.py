"""
Pydantic Schemas for Multimodal Normalized Extraction Output
Preserves provenance (document ID, page, slide, timestamp) and marks extraction uncertainty.
"""
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class ExtractionBaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True
    )


VisualElementType = Literal["diagram", "figure", "chart", "whiteboard", "table", "graph"]
UncertaintyConfidence = Literal["high", "medium", "low"]


class ExtractedVisualElement(ExtractionBaseSchema):
    """Visual diagram, whiteboard snapshot, or chart extracted from a page or slide."""
    element_id: str = Field(description="Deterministic element identifier")
    element_type: VisualElementType = Field(default="diagram")
    caption: str = Field(default="", description="Descriptive summary of the visual diagram")
    ocr_extracted_text: Optional[str] = Field(default=None, description="Direct text or labels inside the diagram")
    bounding_box: Optional[Dict[str, float]] = Field(default=None, description="Normalized coordinates [ymin, xmin, ymax, xmax]")
    location_label: str = Field(description="e.g. 'Slide 19 of 38' or 'Page 112, Figure 4.3'")
    page_number: Optional[int] = None
    slide_number: Optional[int] = None
    timestamp_seconds: Optional[int] = None
    image_storage_key: Optional[str] = None
    uncertainty_flags: List[str] = Field(default_factory=list, description="e.g. ['low_contrast', 'blurred_handwriting']")


class ExtractedEquation(ExtractionBaseSchema):
    """Mathematical or algorithmic equation represented in LaTeX."""
    latex: str = Field(description="LaTeX equation string, e.g. 'T(n) = 2T(n/2) + O(n)'")
    description: Optional[str] = Field(default=None, description="Brief explanation of equation terms")
    location_label: str
    page_number: Optional[int] = None


class ExtractedTable(ExtractionBaseSchema):
    """Structured tabular data extracted from document pages or slides."""
    headers: List[str] = Field(default_factory=list)
    rows: List[List[str]] = Field(default_factory=list)
    caption: Optional[str] = None
    location_label: str
    page_number: Optional[int] = None


class ExtractedSegment(ExtractionBaseSchema):
    """Atomic provenance segment: a physical page, a presentation slide, or a temporal video/audio segment."""
    segment_id: str = Field(description="Unique segment ID, e.g. 'seg-doc-1-p1'")
    document_id: str = Field(description="Source document ID")
    segment_type: Literal["page", "slide", "timestamp_block", "image_view"] = "page"
    page_number: Optional[int] = None
    slide_number: Optional[int] = None
    timestamp_seconds: Optional[int] = None
    timestamp_label: Optional[str] = None
    location_label: str = Field(description="Human-readable provenance anchor, e.g. 'Chapter 4, Page 112' or 'Timestamp 14:32'")
    raw_text: str = Field(description="Unprocessed verbatim text extracted from segment")
    cleaned_text: str = Field(description="Sanitized, markdown-formatted text")
    headings: List[str] = Field(default_factory=list, description="Section headers or slide titles present in this segment")
    extracted_concepts: List[str] = Field(default_factory=list, description="Domain concepts defined or referenced")
    equations: List[ExtractedEquation] = Field(default_factory=list)
    tables: List[ExtractedTable] = Field(default_factory=list)
    visual_elements: List[ExtractedVisualElement] = Field(default_factory=list)
    uncertainty_confidence: UncertaintyConfidence = Field(
        default="high",
        description="'high' = verified crisp transcription; 'medium' = partial OCR ambiguity; 'low' = illegible or muffled"
    )
    uncertainty_notes: Optional[str] = Field(default=None, description="Notes on why uncertainty was flagged")


class NormalizedDocumentExtraction(ExtractionBaseSchema):
    """Complete, normalized extraction output for an entire document or media file."""
    document_id: str
    title: str
    document_type: Literal["pdf", "video", "slides", "audio", "image", "notes"]
    total_pages_or_duration: str = Field(description="e.g. '34 Pages' or '48m 20s'")
    detected_language: str = Field(default="English")
    segments: List[ExtractedSegment] = Field(default_factory=list)
    summary: str = Field(default="", description="High-level pedagogical summary of the material")
    key_concepts: List[str] = Field(default_factory=list, description="Aggregated list of unique concepts across all segments")
    extraction_metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadata on provider, token count, timing")

