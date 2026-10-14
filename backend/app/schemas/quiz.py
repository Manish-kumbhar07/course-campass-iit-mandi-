"""
Quiz, Question, and Assessment Schemas
Provides comprehensive multi-format support (MCQ, Short Answer, Numerical),
rubric-based grading telemetry, verified citations, and previous attempt review.
"""
from typing import List, Optional
from app.schemas.common import ApiSchema
from app.schemas.graph import SourceCitationOut


class QuizOptionOut(ApiSchema):
    """Option for Multiple Choice Questions."""
    id: str
    text: str
    is_correct: Optional[bool] = False
    misconception_explanation: Optional[str] = None


class QuizQuestionOut(ApiSchema):
    """Quiz question presented to the learner."""
    id: str
    concept_id: str
    concept_name: str
    topic_name: Optional[str] = None
    prompt: str
    code_snippet: Optional[str] = None
    question_type: Optional[str] = "multiple_choice"  # 'multiple_choice' | 'short_answer' | 'numerical'
    difficulty: Optional[str] = "Intermediate"
    options: List[QuizOptionOut] = []
    numerical_unit: Optional[str] = None
    hint: Optional[str] = None
    explanation: Optional[str] = None
    citation: Optional[SourceCitationOut] = None


class QuizGenerateRequest(ApiSchema):
    """Request payload to generate an adaptive quiz."""
    concept_ids: Optional[List[str]] = None
    difficulty: Optional[str] = "Intermediate"
    question_types: Optional[List[str]] = ["multiple_choice", "short_answer", "numerical"]
    count: Optional[int] = 3
    allow_revision: Optional[bool] = False


class QuizOut(ApiSchema):
    """Full quiz container."""
    id: str
    course_id: str
    title: str
    difficulty: str
    questions: List[QuizQuestionOut] = []


class QuizAnswerSubmission(ApiSchema):
    """Individual answer item in a quiz submission."""
    question_id: str
    selected_option_id: Optional[str] = None
    submitted_text: Optional[str] = None


class QuizSubmissionRequest(ApiSchema):
    """Full submission payload for a quiz attempt."""
    answers: List[QuizAnswerSubmission]


class AnswerFeedbackOut(ApiSchema):
    """Supportive, diagnostic feedback for a single question response."""
    question_id: str
    is_correct: bool
    score: float  # 0.0 to 1.0 (supports partial credit!)
    user_answer: Optional[str] = None
    correct_answer: Optional[str] = None
    explanation: str
    citation: Optional[SourceCitationOut] = None
    hint: Optional[str] = None
    misconception_explanation: Optional[str] = None
    recommended_activity: str
    grading_method: str = "deterministic"  # 'deterministic' | 'rubric_semantic'


class UpdatedConceptMastery(ApiSchema):
    """Mastery update record triggered by quiz performance."""
    concept_id: str
    new_mastery_percent: int
    new_status: str


class QuizSubmissionResponse(ApiSchema):
    """Results reported to learner immediately upon quiz submission."""
    attempt_id: str
    score_percent: int
    total_questions: int
    correct_count: int
    mastery_gain_percent: int
    weak_concepts_identified: List[str] = []
    updated_concepts: List[UpdatedConceptMastery] = []
    feedback_list: List[AnswerFeedbackOut] = []


class QuizAttemptReviewOut(ApiSchema):
    """Review schema for inspecting previous quiz attempt results and answers."""
    attempt_id: str
    quiz_id: str
    quiz_title: str
    course_id: str
    started_at: str
    completed_at: Optional[str] = None
    score_percent: int
    total_questions: int
    correct_count: int
    mastery_gain_percent: int
    feedback_list: List[AnswerFeedbackOut] = []
