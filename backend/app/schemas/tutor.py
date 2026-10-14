"""
Tutor and Citation API Schemas
Preserves complete backwards-compatibility with frontend types while exposing rich verification telemetry.
"""
from typing import List, Optional
from pydantic import model_validator
from app.schemas.common import ApiSchema
from app.schemas.graph import SourceCitationOut


class TutorChatRequest(ApiSchema):
    """Payload sent by student to chat with the grounded AI tutor."""
    text: Optional[str] = None
    question: Optional[str] = None
    explanation_level: Optional[str] = "rigorous"  # 'introductory' | 'rigorous' | 'exam_prep'
    language: Optional[str] = "English"
    concept_id: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def populate_text_or_question(cls, data):
        if isinstance(data, dict):
            if "question" in data and not data.get("text"):
                data["text"] = data["question"]
            elif "text" in data and not data.get("question"):
                data["question"] = data["text"]
        return data


class VerificationClaimReport(ApiSchema):
    """Factual claim grounding evaluation breakdown."""
    claim: str
    cited_chunk_id: Optional[str] = None
    is_valid_reference: bool = True
    grounding_score: float = 1.0
    status: str = "verified"  # 'verified' | 'partial' | 'unsupported' | 'hallucinated_reference'
    explanation: Optional[str] = None


class VerificationDetailsOut(ApiSchema):
    """Comprehensive dual-layer verification audit trail."""
    overall_grounding_score: float = 1.0
    deterministic_checks_passed: bool = True
    semantic_checks_passed: bool = True
    hallucinated_citations_detected: int = 0
    claims_verified: int = 0
    claims_unsupported: int = 0
    verifier_notes: Optional[str] = None
    claim_reports: List[VerificationClaimReport] = []


class TutorMessageOut(ApiSchema):
    """Tutor message returned to the frontend."""
    id: str
    sender: str  # 'user' | 'tutor'
    text: str
    timestamp: str
    answer_state: Optional[str] = None  # 'supported' | 'partially_supported' | 'not_found' | 'outside_materials'
    citations: List[SourceCitationOut] = []
    unsupported_warning: Optional[str] = None
    concept_id: Optional[str] = None
    suggested_follow_up: Optional[str] = None
    confidence: Optional[float] = None
    verification_details: Optional[VerificationDetailsOut] = None


class VerifyCitationRequest(ApiSchema):
    """Request to inspect or verify an individual citation claim."""
    citation_id: str
    claim_text: Optional[str] = None
