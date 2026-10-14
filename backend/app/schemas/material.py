"""
Pydantic Schemas for Materials API
Directly serialized with camelCase aliases to conform to src/types/index.ts.
"""
from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

DocumentType = Literal["pdf", "video", "slides", "audio", "image", "notes"]
DocumentStatus = Literal["uploaded", "processing", "indexed", "failed", "ready", "processed"]

ProcessingStage = Literal[
    "secure_upload",
    "reading_content",
    "understanding_diagrams",
    "transcribing_lecture",
    "finding_concepts",
    "building_prerequisites",
    "ready"
]


class BaseMaterialSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True
    )


class CourseDocumentResponse(BaseMaterialSchema):
    id: str
    course_id: Optional[str] = None
    title: str
    type: DocumentType
    file_size_bytes: Optional[int] = 0
    formatted_size: Optional[str] = None
    page_count_or_duration: Optional[str] = None
    uploaded_at: Optional[str] = None
    status: DocumentStatus = "uploaded"
    extracted_concepts: List[str] = Field(default_factory=list)
    summary: Optional[str] = None
    description: Optional[str] = None


class ProcessingJobResponse(BaseMaterialSchema):
    id: str
    document_id: str
    stage: ProcessingStage
    stage_number: int
    total_stages: int = 7
    stage_description: str
    progress_percent: int
    is_completed: bool
    error: Optional[str] = None


class DocumentUploadResponse(BaseMaterialSchema):
    material: CourseDocumentResponse
    job: ProcessingJobResponse


class DocumentPageDetailResponse(BaseMaterialSchema):
    id: str
    document_id: str
    page_number: int
    slide_number: Optional[int] = None
    timestamp_seconds: Optional[int] = None
    location_label: str
    cleaned_text: str
    extracted_concepts: List[str] = Field(default_factory=list)
    visual_elements_count: int = 0

