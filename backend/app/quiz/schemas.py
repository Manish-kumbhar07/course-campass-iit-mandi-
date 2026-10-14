"""
Internal Structured Schemas for Assessment Generation and Verification
"""
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class RawGeneratedMCQOption(BaseModel):
    """An option generated for a multiple choice question."""
    id: str = Field(description="Unique option id e.g. opt-1")
    text: str = Field(description="Option choice text")
    is_correct: bool = Field(default=False, description="True if and only if this is the correct choice")
    misconception_explanation: Optional[str] = Field(
        default=None,
        description="Pedagogical feedback explaining the misconception if this distractor is selected"
    )


class RawGeneratedQuestion(BaseModel):
    """Structured question output from generation engine."""
    prompt: str = Field(description="The clear, unambiguous question prompt")
    code_snippet: Optional[str] = Field(default=None, description="Optional algorithm/code block")
    question_type: Literal["multiple_choice", "short_answer", "numerical"] = Field(
        default="multiple_choice",
        description="Format of the question"
    )
    difficulty: Literal["Foundational", "Intermediate", "Advanced"] = Field(
        default="Intermediate",
        description="Target difficulty level"
    )
    options: List[RawGeneratedMCQOption] = Field(
        default_factory=list,
        description="List of options for multiple_choice format"
    )
    expected_answer: Optional[str] = Field(
        default=None,
        description="Expected canonical answer string or reference keywords"
    )
    numerical_value: Optional[float] = Field(
        default=None,
        description="Exact floating-point or integer expected calculation result"
    )
    numerical_unit: Optional[str] = Field(
        default=None,
        description="Required measurement unit e.g. 'MB', 'ms', 'steps', 'frames'"
    )
    numerical_tolerance: Optional[float] = Field(
        default=0.01,
        description="Absolute floating-point tolerance allowed"
    )
    calculation_formula: Optional[str] = Field(
        default=None,
        description="Arithmetic expression used to compute the numerical answer, e.g. '1024 * 4'"
    )
    rubric: Optional[str] = Field(
        default=None,
        description="Step-by-step evaluation criteria and required concept keywords for short-answer grading"
    )
    explanation: str = Field(
        description="Verified explanation of the correct solution directly grounded in course evidence"
    )
    hint: str = Field(
        description="Supportive pedagogical hint guiding the student without giving away the solution"
    )
    cited_chunk_id: Optional[str] = Field(
        default=None,
        description="ID of the retrieved course chunk validating this question and its answer"
    )
    concept_id: str = Field(
        description="ID of the concept tested"
    )


class QuestionVerificationReport(BaseModel):
    """Report produced by independent question verification."""
    is_valid: bool
    failure_reasons: List[str] = Field(default_factory=list)
    evidence_support_score: float = 1.0
    ambiguity_detected: bool = False
    numerical_verified: bool = True
    fingerprint: Optional[str] = None

