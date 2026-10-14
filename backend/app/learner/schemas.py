from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class ConceptAttemptRecord(BaseModel):
    """Single quiz answer record for a concept."""
    attempt_id: str
    question_id: str
    score: float = Field(ge=0.0, le=1.0)
    is_correct: bool
    misconception_tag: Optional[str] = None
    grading_method: str = "deterministic"
    answered_at: datetime


class MasterySnapshot(BaseModel):
    """Point-in-time mastery state for one concept."""
    concept_id: str
    concept_name: str
    mastery_percent: int = Field(ge=0, le=100)
    status: str  # mastered, learning, attention, locked
    total_attempts: int = 0
    correct_count: int = 0
    incorrect_count: int = 0
    partial_count: int = 0
    streak_correct: int = 0
    streak_incorrect: int = 0
    last_attempt_at: Optional[datetime] = None
    algorithm_version: str = "v1"


class PrerequisiteGap(BaseModel):
    """A missing prerequisite that blocks progress."""
    concept_id: str
    concept_name: str
    mastery_percent: int
    required_by: List[str]  # concept IDs that need this
    priority_score: float  # higher = more urgent


class MisconceptionReport(BaseModel):
    """Classified misconception for a concept."""
    concept_id: str
    concept_name: str
    misconception_tag: str
    frequency: int  # how many times this misconception appeared
    classifier_confidence: float = Field(ge=0.0, le=1.0)
    supporting_evidence: List[str] = []  # attempt IDs
    diagnostic_advice: str = ""


class StudyRecommendation(BaseModel):
    """A single study recommendation with explanation."""
    concept_id: str
    concept_name: str
    priority_rank: int
    reason: str  # why this was recommended
    recommended_activity: str  # 'review', 'practice', 'quiz', 'tutor'
    estimated_minutes: int = 15
    current_mastery: int
    target_mastery: int = 80


class GeneratedStudyPlan(BaseModel):
    """A time-bounded study plan."""
    course_id: str
    user_id: str
    total_minutes_available: int
    total_minutes_allocated: int
    days_until_exam: Optional[int] = None
    recommendations: List[StudyRecommendation]
    overflow_concepts: List[str] = []  # concepts that didn't fit in time budget
    algorithm_version: str = "v1"

