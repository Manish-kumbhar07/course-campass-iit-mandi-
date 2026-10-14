"""
CourseCompass Adaptive Assessment and Quiz Engine Package
"""
from app.quiz.schemas import (
    RawGeneratedMCQOption,
    RawGeneratedQuestion,
    QuestionVerificationReport,
)
from app.quiz.verifier import (
    QuizQuestionVerifier,
    safe_eval_arithmetic,
    compute_question_fingerprint,
)
from app.quiz.grading import QuizGradingService
from app.quiz.generator import (
    QuizGenerationService,
    BaseQuizProvider,
    DeterministicLocalQuizProvider,
    GeminiQuizProvider,
    get_quiz_provider,
    set_quiz_provider,
)

__all__ = [
    "RawGeneratedMCQOption",
    "RawGeneratedQuestion",
    "QuestionVerificationReport",
    "QuizQuestionVerifier",
    "safe_eval_arithmetic",
    "compute_question_fingerprint",
    "QuizGradingService",
    "QuizGenerationService",
    "BaseQuizProvider",
    "DeterministicLocalQuizProvider",
    "GeminiQuizProvider",
    "get_quiz_provider",
    "set_quiz_provider",
]

