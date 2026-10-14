from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.schemas.mastery import TopicMasteryOut, StudyPlanDayOut
from app.schemas.learner import (
    ConceptMasteryDetail,
    DiagnosticSummary,
    StudyRecommendationOut,
    StudyPlanOut,
    MasteryRecalcResult,
)
from app.services.mastery_service import MasteryService

router = APIRouter(prefix="/courses", tags=["mastery"])


@router.get("/{course_id}/mastery", response_model=List[TopicMasteryOut])
async def get_course_mastery(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Retrieve fine-grained topic mastery breakdown for the course."""
    return await MasteryService.get_topic_mastery(
        db=db,
        user_id=user_id,
        course_id=course_id,
    )


@router.get("/{course_id}/mastery/details", response_model=List[ConceptMasteryDetail])
async def get_concept_mastery_details(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Retrieve detailed concept mastery metrics, attempts, streaks, and timestamps."""
    return await MasteryService.get_concept_mastery_details(
        db=db,
        user_id=user_id,
        course_id=course_id,
    )


@router.get("/{course_id}/diagnostic", response_model=DiagnosticSummary)
async def get_diagnostic_summary(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Retrieve diagnostic assessment summary including prerequisite gaps and top misconceptions."""
    return await MasteryService.get_diagnostic_summary(
        db=db,
        user_id=user_id,
        course_id=course_id,
    )


@router.get("/{course_id}/recommendations", response_model=List[StudyRecommendationOut])
async def get_study_recommendations(
    course_id: str,
    available_minutes: int = Query(default=45, ge=10, le=300),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Retrieve prioritized Next Topic / Study Next recommendations."""
    return await MasteryService.get_study_recommendations(
        db=db,
        user_id=user_id,
        course_id=course_id,
        available_minutes=available_minutes,
    )


@router.get("/{course_id}/study-plan", response_model=List[StudyPlanDayOut])
async def get_course_study_plan(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Retrieve dynamic 'Study Next' personalized daily learning plan."""
    return await MasteryService.get_study_plan(
        db=db,
        user_id=user_id,
        course_id=course_id,
    )


@router.post("/{course_id}/study-plan/generate", response_model=StudyPlanOut)
async def generate_course_study_plan(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Generate dynamic time-budgeted multi-day study plan aligned with exam date."""
    return await MasteryService.generate_dynamic_study_plan(
        db=db,
        user_id=user_id,
        course_id=course_id,
    )


@router.post("/concepts/{concept_id}/recalculate-mastery", response_model=MasteryRecalcResult)
async def recalculate_concept_mastery(
    concept_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Recalculate official mastery score for a concept from past quiz attempts."""
    return await MasteryService.recalculate_concept_mastery(
        db=db,
        user_id=user_id,
        concept_id=concept_id,
    )
