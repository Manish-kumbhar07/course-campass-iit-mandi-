from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.schemas.graph import ConceptOut
from app.services.concept_service import ConceptService

router = APIRouter(prefix="/courses", tags=["concepts"])


@router.get("/{course_id}/concepts", response_model=List[ConceptOut])
async def get_course_concepts(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Retrieve the DAG prerequisite concept graph for the course."""
    return await ConceptService.get_course_concepts(db, course_id)


@router.get("/{course_id}/concepts/{concept_id}", response_model=ConceptOut)
async def get_concept_details(
    course_id: str,
    concept_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Retrieve details, prerequisites, and citations for a specific concept."""
    concept = await ConceptService.get_concept_by_id(db, course_id, concept_id)
    if not concept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Concept '{concept_id}' not found in course '{course_id}'",
        )
    return concept

