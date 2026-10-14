"""
Structured Output and Verification Schemas for CourseCompass Tutor
"""
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class ClaimedFact(BaseModel):
    """An individual factual claim extracted from the tutor's response."""
    claim: str = Field(description="Individual factual statement made in the response")
    cited_chunk_id: Optional[str] = Field(default=None, description="Exact chunk_id supporting this claim")
    direct_quote: Optional[str] = Field(default=None, description="Exact or near-verbatim quote from the chunk")


class RawModelTutorOutput(BaseModel):
    """Strict structured response required from the tutoring LLM."""
    answer_text: str = Field(description="Comprehensive, clear pedagogical explanation")
    support_status: Literal["supported", "partially_supported", "not_found", "outside_materials"] = Field(
        default="supported",
        description="Self-reported support status against retrieved materials"
    )
    confidence: float = Field(
        default=0.9,
        ge=0.0,
        le=1.0,
        description="Model confidence in factual grounding (0.0 to 1.0)"
    )
    citation_chunk_ids: List[str] = Field(
        default_factory=list,
        description="List of exact chunk_ids from the retrieved evidence used to form the answer"
    )
    claimed_facts: List[ClaimedFact] = Field(
        default_factory=list,
        description="Factual assertions broken down with source chunk attribution"
    )
    suggested_follow_up: Optional[str] = Field(
        default=None,
        description="Pedagogical Socratic question guiding the student to test understanding"
    )
    unsupported_aspects: Optional[str] = Field(
        default=None,
        description="Explanation of any query components not covered in courseware"
    )


class ClaimVerificationResult(BaseModel):
    """Detailed audit report for an individual factual claim."""
    claim: str
    cited_chunk_id: Optional[str] = None
    is_valid_reference: bool = True
    grounding_score: float = 1.0
    status: Literal["verified", "partial", "unsupported", "hallucinated_reference"] = "verified"
    explanation: Optional[str] = None


class GroundingReport(BaseModel):
    """Aggregate result from independent reference & semantic grounding verification."""
    overall_grounding_score: float = 1.0
    deterministic_checks_passed: bool = True
    semantic_checks_passed: bool = True
    hallucinated_citations_detected: int = 0
    claims_verified: int = 0
    claims_unsupported: int = 0
    verifier_notes: Optional[str] = None
    claim_reports: List[ClaimVerificationResult] = Field(default_factory=list)
    final_answer_state: Literal["supported", "partially_supported", "not_found", "outside_materials"] = "supported"
    unsupported_warning: Optional[str] = None

