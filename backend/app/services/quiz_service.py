"""
Quiz and Assessment Management Service
Coordinates diagnostic quizzes, adaptive question generation, deterministic & rubric grading,
concept mastery updates, and secure attempt persistence.
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import UnauthorizedAccessError
from app.models.graph import Concept
from app.models.quiz import Quiz, QuizAttempt, QuizAttemptAnswer, QuizOption, QuizQuestion
from app.models.tutor import Citation
from app.quiz.generator import QuizGenerationService
from app.quiz.grading import QuizGradingService
from app.rag.retrieval import RetrievalService
from app.schemas.graph import SourceCitationOut
from app.schemas.quiz import (
    AnswerFeedbackOut,
    QuizAnswerSubmission,
    QuizAttemptReviewOut,
    QuizGenerateRequest,
    QuizOptionOut,
    QuizOut,
    QuizQuestionOut,
    QuizSubmissionResponse,
    UpdatedConceptMastery,
)


class QuizService:
    """Production quiz assessment service supporting multi-format evaluation and adaptive review."""

    @classmethod
    async def get_diagnostic_questions(
        cls,
        db: AsyncSession,
        course_id: str
    ) -> List[QuizQuestionOut]:
        """Fetch diagnostic questions for the course (backward compatible)."""
        result = await db.execute(
            select(QuizQuestion)
            .join(Quiz, Quiz.id == QuizQuestion.quiz_id)
            .where(Quiz.course_id == course_id)
            .order_by(QuizQuestion.created_at)
        )
        questions = result.scalars().all()
        if not questions:
            return []

        output: List[QuizQuestionOut] = []
        for q in questions:
            opt_res = await db.execute(
                select(QuizOption)
                .where(QuizOption.question_id == q.id)
                .order_by(QuizOption.sort_order)
            )
            options = opt_res.scalars().all()
            opt_outs = [
                QuizOptionOut(
                    id=opt.id,
                    text=opt.text,
                    is_correct=opt.is_correct,
                    misconception_explanation=opt.misconception_explanation,
                )
                for opt in options
            ]

            concept_res = await db.execute(
                select(Concept).where(Concept.id == q.concept_id)
            )
            concept = concept_res.scalar_one_or_none()
            concept_name = concept.name if concept else "General Concept"

            citation_out = None
            if q.citation_id:
                cite_res = await db.execute(
                    select(Citation).where(Citation.id == q.citation_id)
                )
                cite = cite_res.scalar_one_or_none()
                if cite:
                    citation_out = SourceCitationOut(
                        id=cite.id,
                        document_id=cite.document_id,
                        source_title=cite.source_title,
                        source_type=cite.source_type,
                        location_label=cite.location_label,
                        page_number=cite.page_number,
                        slide_number=cite.slide_number,
                        timestamp_seconds=cite.timestamp_seconds,
                        excerpt=cite.excerpt,
                        context_snippet=cite.context_snippet,
                        verification_confidence=cite.verification_confidence,
                    )

            output.append(
                QuizQuestionOut(
                    id=q.id,
                    concept_id=q.concept_id,
                    concept_name=concept_name,
                    prompt=q.prompt,
                    code_snippet=q.code_snippet,
                    question_type=q.question_type or "multiple_choice",
                    difficulty=q.difficulty,
                    options=opt_outs,
                    numerical_unit=q.numerical_unit,
                    hint=q.hint,
                    explanation=q.explanation,
                    citation=citation_out,
                )
            )

        return output

    @classmethod
    async def generate_adaptive_quiz(
        cls,
        db: AsyncSession,
        user_id: str,
        course_id: str,
        request: QuizGenerateRequest
    ) -> QuizOut:
        """Generate a verified, evidence-grounded adaptive quiz."""
        return await QuizGenerationService.generate_adaptive_quiz(
            db=db,
            user_id=user_id,
            course_id=course_id,
            concept_ids=request.concept_ids,
            difficulty=request.difficulty or "Intermediate",
            question_types=request.question_types,
            count=request.count or 3,
            allow_revision=request.allow_revision or False
        )

    @classmethod
    async def get_quiz_by_id(
        cls,
        db: AsyncSession,
        user_id: str,
        quiz_id: str
    ) -> QuizOut:
        """Fetch a quiz by ID and verify user authorization for its course."""
        quiz_res = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
        quiz = quiz_res.scalar_one_or_none()
        if not quiz:
            raise ValueError(f"Quiz '{quiz_id}' not found.")

        await RetrievalService.verify_course_access(db, user_id, quiz.course_id)

        q_res = await db.execute(
            select(QuizQuestion).where(QuizQuestion.quiz_id == quiz.id).order_by(QuizQuestion.id)
        )
        questions = q_res.scalars().all()

        out_questions: List[QuizQuestionOut] = []
        for q in questions:
            opt_res = await db.execute(
                select(QuizOption).where(QuizOption.question_id == q.id).order_by(QuizOption.sort_order)
            )
            options = opt_res.scalars().all()
            opt_outs = [
                QuizOptionOut(
                    id=opt.id,
                    text=opt.text,
                    is_correct=opt.is_correct,
                    misconception_explanation=opt.misconception_explanation,
                )
                for opt in options
            ]

            c_res = await db.execute(select(Concept).where(Concept.id == q.concept_id))
            concept = c_res.scalar_one_or_none()
            cname = concept.name if concept else "Concept"

            cite_out = None
            if q.citation_id:
                cite_res = await db.execute(select(Citation).where(Citation.id == q.citation_id))
                cite = cite_res.scalar_one_or_none()
                if cite:
                    cite_out = SourceCitationOut(
                        id=cite.id,
                        document_id=cite.document_id,
                        source_title=cite.source_title,
                        source_type=cite.source_type,
                        location_label=cite.location_label,
                        page_number=cite.page_number,
                        slide_number=cite.slide_number,
                        timestamp_seconds=cite.timestamp_seconds,
                        excerpt=cite.excerpt,
                        context_snippet=cite.context_snippet,
                        verification_confidence=cite.verification_confidence or "verified"
                    )

            out_questions.append(
                QuizQuestionOut(
                    id=q.id,
                    concept_id=q.concept_id,
                    concept_name=cname,
                    prompt=q.prompt,
                    code_snippet=q.code_snippet,
                    question_type=q.question_type,
                    difficulty=q.difficulty,
                    options=opt_outs,
                    numerical_unit=q.numerical_unit,
                    hint=q.hint,
                    explanation=q.explanation,
                    citation=cite_out
                )
            )

        return QuizOut(
            id=quiz.id,
            course_id=quiz.course_id,
            title=quiz.title,
            difficulty=quiz.difficulty or "Intermediate",
            questions=out_questions
        )

    @classmethod
    async def submit_quiz(
        cls,
        db: AsyncSession,
        user_id: str,
        quiz_id: str,
        answers: List[QuizAnswerSubmission]
    ) -> QuizSubmissionResponse:
        """Grade quiz submission with deterministic rubrics, update mastery, and generate feedback."""
        now = datetime.now(timezone.utc)

        # 1. Fetch quiz and verify tenant access
        quiz_res = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
        quiz = quiz_res.scalar_one_or_none()
        if not quiz:
            raise ValueError(f"Quiz '{quiz_id}' not found.")

        # Enforce authorization
        await RetrievalService.verify_course_access(db, user_id, quiz.course_id)

        course_id = quiz.course_id
        total_questions = len(answers)
        correct_count = 0
        total_score_sum = 0.0
        weak_concepts: List[str] = []
        updated_concepts: List[UpdatedConceptMastery] = []
        feedback_list: List[AnswerFeedbackOut] = []

        # 2. Record Quiz Attempt
        attempt = QuizAttempt(
            id=f"att-{uuid.uuid4().hex[:8]}",
            quiz_id=quiz_id,
            user_id=user_id,
            course_id=course_id,
            started_at=now,
            completed_at=now,
            status="completed",
        )
        db.add(attempt)
        await db.flush()

        # 3. Grade each submitted answer
        for ans in answers:
            # Fetch question
            q_res = await db.execute(select(QuizQuestion).where(QuizQuestion.id == ans.question_id))
            question = q_res.scalar_one_or_none()
            if not question:
                continue

            # Fetch options
            opt_res = await db.execute(
                select(QuizOption).where(QuizOption.question_id == question.id).order_by(QuizOption.sort_order)
            )
            options = opt_res.scalars().all()

            # Fetch citation
            citation = None
            if question.citation_id:
                cite_res = await db.execute(select(Citation).where(Citation.id == question.citation_id))
                citation = cite_res.scalar_one_or_none()

            # Fetch concept
            c_res = await db.execute(select(Concept).where(Concept.id == question.concept_id))
            concept = c_res.scalar_one_or_none()

            # Grade question
            feedback = QuizGradingService.grade_question(
                question=question,
                options=options,
                submission=ans,
                citation=citation,
                concept=concept
            )
            feedback_list.append(feedback)

            total_score_sum += feedback.score
            if feedback.is_correct:
                correct_count += 1
            else:
                if question.concept_id:
                    weak_concepts.append(question.concept_id)

            # Persist answer record
            db_ans = QuizAttemptAnswer(
                id=str(uuid.uuid4()),
                attempt_id=attempt.id,
                question_id=ans.question_id,
                selected_option_id=ans.selected_option_id,
                submitted_text=ans.submitted_text,
                score=feedback.score,
                is_correct=feedback.is_correct,
                feedback=feedback.explanation,
                misconception_tag=feedback.misconception_explanation[:100] if feedback.misconception_explanation else None,
                grading_method=feedback.grading_method
            )
            db.add(db_ans)

            # Update concept mastery
            if concept:
                if feedback.score >= 0.8:
                    concept.mastery_percent = min(100, concept.mastery_percent + 15)
                    if concept.mastery_percent >= 80:
                        concept.status = "mastered"
                    elif concept.mastery_percent >= 40:
                        concept.status = "learning"
                elif feedback.score > 0.0:
                    concept.mastery_percent = min(100, concept.mastery_percent + 5)
                else:
                    concept.mastery_percent = max(0, concept.mastery_percent - 5)
                    concept.status = "attention"

                updated_concepts.append(
                    UpdatedConceptMastery(
                        concept_id=concept.id,
                        new_mastery_percent=concept.mastery_percent,
                        new_status=concept.status,
                    )
                )

        score_percent = round((total_score_sum / max(1, total_questions)) * 100)
        mastery_gain = 12 if score_percent > 60 else 0

        attempt.score_percent = score_percent
        attempt.total_questions = total_questions
        attempt.correct_count = correct_count
        attempt.mastery_gain_percent = mastery_gain
        await db.commit()

        return QuizSubmissionResponse(
            attempt_id=attempt.id,
            score_percent=score_percent,
            total_questions=total_questions,
            correct_count=correct_count,
            mastery_gain_percent=mastery_gain,
            weak_concepts_identified=list(set(weak_concepts)),
            updated_concepts=updated_concepts,
            feedback_list=feedback_list,
        )

    @classmethod
    async def get_attempt_review(
        cls,
        db: AsyncSession,
        user_id: str,
        attempt_id: str
    ) -> QuizAttemptReviewOut:
        """Review past attempt results, answers, feedback, and citations."""
        att_res = await db.execute(select(QuizAttempt).where(QuizAttempt.id == attempt_id))
        attempt = att_res.scalar_one_or_none()
        if not attempt:
            raise ValueError(f"Quiz attempt '{attempt_id}' not found.")

        # Ensure user owns the attempt
        if attempt.user_id != user_id:
            raise UnauthorizedAccessError("You are not authorized to view this quiz attempt.")

        quiz_res = await db.execute(select(Quiz).where(Quiz.id == attempt.quiz_id))
        quiz = quiz_res.scalar_one_or_none()
        quiz_title = quiz.title if quiz else "Assessment Review"

        ans_res = await db.execute(
            select(QuizAttemptAnswer).where(QuizAttemptAnswer.attempt_id == attempt.id)
        )
        answers = ans_res.scalars().all()

        feedback_list: List[AnswerFeedbackOut] = []
        for ans in answers:
            q_res = await db.execute(select(QuizQuestion).where(QuizQuestion.id == ans.question_id))
            question = q_res.scalar_one_or_none()
            if not question:
                continue

            cite_out = None
            if question.citation_id:
                c_res = await db.execute(select(Citation).where(Citation.id == question.citation_id))
                cite = c_res.scalar_one_or_none()
                if cite:
                    cite_out = SourceCitationOut(
                        id=cite.id,
                        document_id=cite.document_id,
                        source_title=cite.source_title,
                        source_type=cite.source_type,
                        location_label=cite.location_label,
                        page_number=cite.page_number,
                        slide_number=cite.slide_number,
                        timestamp_seconds=cite.timestamp_seconds,
                        excerpt=cite.excerpt,
                        context_snippet=cite.context_snippet,
                        verification_confidence=cite.verification_confidence or "verified"
                    )

            opt_res = await db.execute(
                select(QuizOption).where(QuizOption.question_id == question.id)
            )
            options = opt_res.scalars().all()
            correct_opt = next((o for o in options if o.is_correct), None)
            correct_answer_str = correct_opt.text if correct_opt else (question.expected_answer or "")

            user_ans_str = ans.submitted_text
            if ans.selected_option_id:
                chosen_opt = next((o for o in options if o.id == ans.selected_option_id), None)
                if chosen_opt:
                    user_ans_str = chosen_opt.text

            feedback_list.append(
                AnswerFeedbackOut(
                    question_id=question.id,
                    is_correct=ans.is_correct,
                    score=ans.score,
                    user_answer=user_ans_str,
                    correct_answer=correct_answer_str,
                    explanation=ans.feedback or question.explanation,
                    citation=cite_out,
                    hint=question.hint,
                    misconception_explanation=ans.misconception_tag,
                    recommended_activity="Review corresponding materials in the Knowledge Map.",
                    grading_method=ans.grading_method
                )
            )

        start_str = attempt.started_at.strftime("%b %d, %Y %I:%M %p") if attempt.started_at else "N/A"
        comp_str = attempt.completed_at.strftime("%b %d, %Y %I:%M %p") if attempt.completed_at else None

        return QuizAttemptReviewOut(
            attempt_id=attempt.id,
            quiz_id=attempt.quiz_id,
            quiz_title=quiz_title,
            course_id=attempt.course_id,
            started_at=start_str,
            completed_at=comp_str,
            score_percent=attempt.score_percent,
            total_questions=attempt.total_questions,
            correct_count=attempt.correct_count,
            mastery_gain_percent=attempt.mastery_gain_percent,
            feedback_list=feedback_list
        )
