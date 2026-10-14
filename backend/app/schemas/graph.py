from typing import Optional, List
from app.schemas.common import ApiSchema


class SourceCitationOut(ApiSchema):
    id: str
    document_id: Optional[str] = None
    document_title: Optional[str] = None
    source_title: str
    document_type: Optional[str] = None
    source_type: str
    location_label: str
    page_number: Optional[int] = None
    slide_number: Optional[int] = None
    timestamp_seconds: Optional[int] = None
    excerpt: str
    context_snippet: str
    verification_confidence: Optional[str] = "verified"


class ConceptOut(ApiSchema):
    id: str
    course_id: Optional[str] = None
    topic_id: Optional[str] = None
    topic: Optional[str] = None
    name: str
    difficulty: str
    mastery_percent: int
    status: str
    summary: str
    primary_misconception: str
    prerequisite_ids: List[str] = []
    dependent_concept_ids: List[str] = []
    citations: List[SourceCitationOut] = []


class TopicOut(ApiSchema):
    id: str
    course_id: str
    title: str
    description: Optional[str] = None
    order: int = 1
    concept_ids: List[str] = []


class ConceptEdgeOut(ApiSchema):
    id: str
    source_concept_id: str
    target_concept_id: str
    relationship_type: str  # 'prerequisite' | 'part_of' | 'component' | 'extension'
    confidence: float = 1.0


class CourseMapOut(ApiSchema):
    course_id: str
    total_concepts: int
    total_topics: int
    concepts: List[ConceptOut]
    edges: List[ConceptEdgeOut]
    topics: List[TopicOut]


class RetrievalRequest(ApiSchema):
    query: str
    top_k: int = 5
    min_score: float = 0.45


class RetrievalResultOut(ApiSchema):
    chunk_id: str
    document_id: str
    document_title: str
    document_type: str
    location_label: str
    page_number: Optional[int] = None
    slide_number: Optional[int] = None
    timestamp_seconds: Optional[int] = None
    content: str
    score: float
    citation: SourceCitationOut
