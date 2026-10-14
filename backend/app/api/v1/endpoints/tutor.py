"""
FastAPI Tutor Endpoints
Handles interactive student chat, grounded response generation,
conversation history, and independent citation verification.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.tutor import Conversation, TutorMessage, Citation
from app.rag.retrieval import RetrievalService
from app.schemas.graph import SourceCitationOut
from app.schemas.tutor import (
    TutorChatRequest,
    TutorMessageOut,
    VerificationClaimReport,
    VerifyCitationRequest,
)
from app.services.tutor_service import TutorService
from app.tutor.citation_validator import get_grounding_verifier

router = APIRouter(tags=["tutor"])


@router.post("/courses/{course_id}/tutor/chat", response_model=TutorMessageOut)
async def tutor_chat(
    course_id: str,
    request: TutorChatRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Ask the Socratic AI tutor a grounded question with verifiable citations.
    Enforces student authentication, course isolation, and independent citation verification.
    """
    return await TutorService.process_student_question(
        db=db,
        user_id=user_id,
        course_id=course_id,
        request=request,
    )


@router.get("/courses/{course_id}/tutor/history", response_model=List[TutorMessageOut])
async def get_tutor_history(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Retrieve chat history for the user in the specified course.
    Verifies that the student owns or is authorized for the course.
    """
    await RetrievalService.verify_course_access(db, user_id, course_id)

    conv_res = await db.execute(
        select(Conversation)
        .where(Conversation.course_id == course_id, Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
    )
    conversation = conv_res.scalars().first()
    if not conversation:
        return []

    msg_res = await db.execute(
        select(TutorMessage)
        .where(TutorMessage.conversation_id == conversation.id)
        .order_by(TutorMessage.created_at)
    )
    messages = msg_res.scalars().all()

    output: List[TutorMessageOut] = []
    for m in messages:
        cite_res = await db.execute(select(Citation).where(Citation.message_id == m.id))
        citations = cite_res.scalars().all()
        cite_outs = [
            SourceCitationOut(
                id=c.id,
                document_id=c.document_id,
                source_title=c.source_title,
                source_type=c.source_type,
                location_label=c.location_label,
                page_number=c.page_number,
                slide_number=c.slide_number,
                timestamp_seconds=c.timestamp_seconds,
                excerpt=c.excerpt,
                context_snippet=c.context_snippet,
                verification_confidence=c.verification_confidence,
            )
            for c in citations
        ]

        time_str = m.created_at.strftime("%I:%M %p") if m.created_at else "02:30 PM"
        output.append(
            TutorMessageOut(
                id=m.id,
                sender=m.sender,
                text=m.text,
                timestamp=time_str,
                answer_state=m.answer_state,
                citations=cite_outs,
                unsupported_warning=m.unsupported_warning,
                concept_id=m.concept_id,
            )
        )

    return output


@router.get("/citations/{citation_id}", response_model=SourceCitationOut)
async def get_citation_by_id(
    citation_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Inspect full context and verification proof for an individual citation.
    """
    cite_res = await db.execute(select(Citation).where(Citation.id == citation_id))
    c = cite_res.scalar_one_or_none()
    if not c:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Citation '{citation_id}' not found",
        )

    return SourceCitationOut(
        id=c.id,
        document_id=c.document_id,
        source_title=c.source_title,
        source_type=c.source_type,
        location_label=c.location_label,
        page_number=c.page_number,
        slide_number=c.slide_number,
        timestamp_seconds=c.timestamp_seconds,
        excerpt=c.excerpt,
        context_snippet=c.context_snippet,
        verification_confidence=c.verification_confidence,
    )


@router.post("/courses/{course_id}/tutor/verify-citation", response_model=VerificationClaimReport)
async def verify_single_citation(
    course_id: str,
    payload: VerifyCitationRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Independently verify a specific citation or claim against its underlying course text.
    """
    await RetrievalService.verify_course_access(db, user_id, course_id)

    cite_res = await db.execute(select(Citation).where(Citation.id == payload.citation_id))
    citation = cite_res.scalar_one_or_none()
    if not citation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Citation '{payload.citation_id}' not found",
        )

    claim_to_check = payload.claim_text or citation.excerpt
    verifier = get_grounding_verifier()
    score, reason = await verifier.verify_claim(claim_to_check, citation.excerpt)

    status_str = "verified" if score >= 0.65 else ("partial" if score >= 0.35 else "unsupported")
    return VerificationClaimReport(
        claim=claim_to_check,
        cited_chunk_id=citation.chunk_id,
        is_valid_reference=True,
        grounding_score=score,
        status=status_str,
        explanation=reason
    )
