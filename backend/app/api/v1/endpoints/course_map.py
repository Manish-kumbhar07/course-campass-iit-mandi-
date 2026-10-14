from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.graph import Concept, ConceptRelationship, Topic
from app.rag.retrieval import RetrievalService
from app.schemas.graph import (
    ConceptEdgeOut,
    ConceptOut,
    CourseMapOut,
    RetrievalRequest,
    RetrievalResultOut,
    TopicOut,
)
from app.services.concept_service import ConceptService

router = APIRouter(prefix="/courses", tags=["course-map"])


@router.get("/{course_id}/map", response_model=CourseMapOut)
async def get_course_knowledge_map(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Retrieve the complete source-linked interactive knowledge map for a course,
    including atomic concepts, DAG prerequisite edges, and modular topics.
    """
    # 1. Authorize course access
    await RetrievalService.verify_course_access(db, user_id, course_id)

    # 2. Fetch concepts using ConceptService
    concepts = await ConceptService.get_course_concepts(db, course_id)

    # 3. Fetch topics
    t_res = await db.execute(
        select(Topic).where(Topic.course_id == course_id).order_by(Topic.sort_order)
    )
    topics = t_res.scalars().all()
    topic_outs: List[TopicOut] = []
    for t in topics:
        c_ids = [c.id for c in concepts if c.topic_id == t.id]
        topic_outs.append(
            TopicOut(
                id=t.id,
                course_id=t.course_id,
                title=t.title,
                description=t.description,
                order=t.sort_order,
                concept_ids=c_ids,
            )
        )

    # 4. Fetch directed edges (prerequisite & part_of)
    e_res = await db.execute(
        select(ConceptRelationship).where(
            (ConceptRelationship.course_id == course_id) |
            (ConceptRelationship.source_concept_id.in_([c.id for c in concepts]))
        )
    )
    edges = e_res.scalars().all()
    edge_outs = [
        ConceptEdgeOut(
            id=e.id,
            source_concept_id=e.source_concept_id,
            target_concept_id=e.target_concept_id,
            relationship_type=e.relationship_type,
            confidence=e.confidence,
        )
        for e in edges
    ]

    return CourseMapOut(
        course_id=course_id,
        total_concepts=len(concepts),
        total_topics=len(topics),
        concepts=concepts,
        edges=edge_outs,
        topics=topic_outs,
    )


@router.post("/{course_id}/retrieve", response_model=List[RetrievalResultOut])
async def retrieve_course_knowledge(
    course_id: str,
    payload: RetrievalRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Perform authorized hybrid similarity retrieval across course materials.
    Filters by course boundaries and enforces relevance thresholding.
    """
    results = await RetrievalService.retrieve(
        db=db,
        user_id=user_id,
        course_id=course_id,
        query=payload.query,
        top_k=payload.top_k,
        min_relevance_threshold=payload.min_score,
    )

    output: List[RetrievalResultOut] = []
    for r in results:
        output.append(
            RetrievalResultOut(
                chunk_id=r.chunk_id,
                document_id=r.document_id,
                document_title=r.document_title,
                document_type=r.document_type,
                location_label=r.location_label,
                page_number=r.page_number,
                slide_number=r.slide_number,
                timestamp_seconds=r.timestamp_seconds,
                content=r.content,
                score=r.score,
                citation=r.to_citation(),
            )
        )

    return output

