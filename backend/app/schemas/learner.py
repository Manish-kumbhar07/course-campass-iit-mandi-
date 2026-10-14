"""
API-facing schemas for learner model endpoints.
"""
from typing import List, Optional
from datetime import datetime
from app.schemas.common import ApiSchema


class ConceptMasteryDetail(ApiSchema):
    concept_id: str
    concept_name: str
    mastery_percent: int
    status: str
    total_attempts: int = 0
    correct_count: int = 0
    incorrect_count: int = 0
    streak_correct: int = 0
    last_attempt_at: Optional[datetime] = None
    algorithm_version: str = "v1"


class MisconceptionOut(ApiSchema):
    concept_id: str
    concept_name: str
    misconception_tag: str
    frequency: int
    classifier_confidence: float
    diagnostic_advice: str = ""


class PrerequisiteGapOut(ApiSchema):
    concept_id: str
    concept_name: str
    mastery_percent: int
    required_by: List[str]
    priority_score: float


class DiagnosticSummary(ApiSchema):
    course_id: str
    overall_mastery: int
    concepts_mastered: int
    concepts_learning: int
    concepts_attention: int
    concepts_total: int
    prerequisite_gaps: List[PrerequisiteGapOut]
    top_misconceptions: List[MisconceptionOut]
    weakest_concept_id: Optional[str] = None
    weakest_concept_name: Optional[str] = None


class StudyRecommendationOut(ApiSchema):
    concept_id: str
    concept_name: str
    priority_rank: int
    reason: str
    recommended_activity: str
    estimated_minutes: int = 15
    current_mastery: int
    target_mastery: int = 80


class StudyPlanOut(ApiSchema):
    course_id: str
    total_minutes_available: int
    total_minutes_allocated: int
    days_until_exam: Optional[int] = None
    recommendations: List[StudyRecommendationOut]
    overflow_concepts: List[str] = []
    algorithm_version: str = "v1"


class MasteryRecalcResult(ApiSchema):
    concept_id: str
    old_mastery: int
    new_mastery: int
    old_status: str
    new_status: str
    attempts_replayed: int

