"""
FastAPI Quiz and Assessment Endpoints
Handles diagnostic quizzes, adaptive question generation,
multi-format submission grading, and attempt review.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.schemas.quiz import (
    QuizAttemptReviewOut,
    QuizGenerateRequest,
    QuizOut,
    QuizQuestionOut,
    QuizSubmissionRequest,
    QuizSubmissionResponse,
)
from app.services.quiz_service import QuizService

router = APIRouter(tags=["quizzes"])


@router.get("/courses/{course_id}/quizzes/diagnostic", response_model=List[QuizQuestionOut])
async def get_diagnostic_quiz(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Retrieve adaptive diagnostic quiz questions mapped to weak concepts and citations.
    """
    return await QuizService.get_diagnostic_questions(db, course_id)


@router.post("/courses/{course_id}/quizzes/generate", response_model=QuizOut)
async def generate_adaptive_quiz(
    course_id: str,
    request: QuizGenerateRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Generate an adaptive quiz targeting learner weak concepts or specified topics.
    Enforces independent verification of every question and duplicate detection.
    """
    return await QuizService.generate_adaptive_quiz(
        db=db,
        user_id=user_id,
        course_id=course_id,
        request=request
    )


@router.get("/quizzes/{quiz_id}", response_model=QuizOut)
async def get_quiz(
    quiz_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Retrieve a quiz by ID.
    Enforces course authorization.
    """
    return await QuizService.get_quiz_by_id(db, user_id, quiz_id)


@router.post("/quizzes/{quiz_id}/submit", response_model=QuizSubmissionResponse)
async def submit_quiz(
    quiz_id: str,
    submission: QuizSubmissionRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Submit quiz answers (MCQ, Short Answer, Numerical) for deterministic & rubric-based grading.
    Returns supportive feedback, citations, hints, and updates concept mastery.
    """
    return await QuizService.submit_quiz(
        db=db,
        user_id=user_id,
        quiz_id=quiz_id,
        answers=submission.answers,
    )


@router.get("/quizzes/{quiz_id}/attempts/{attempt_id}", response_model=QuizAttemptReviewOut)
async def review_quiz_attempt(
    quiz_id: str,
    attempt_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Review previous quiz attempt results, submitted answers, and diagnostic feedback.
    """
    return await QuizService.get_attempt_review(db, user_id, attempt_id)
