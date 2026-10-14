from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.graph import Topic, Concept, ConceptRelationship
from app.models.study_plan import StudyPlan, StudyPlanTask
from app.models.tutor import Citation
from app.models.quiz import QuizAttempt, QuizAttemptAnswer, QuizQuestion
from app.models.course import Course
from app.schemas.mastery import TopicMasteryOut, StudyPlanDayOut, StudyPlanTaskOut
from app.schemas.graph import SourceCitationOut
from app.schemas.learner import (
    ConceptMasteryDetail,
    DiagnosticSummary,
    MisconceptionOut,
    PrerequisiteGapOut,
    StudyRecommendationOut,
    StudyPlanOut,
    MasteryRecalcResult,
)
from app.learner.mastery_engine import MasteryAlgorithmV1
from app.learner.misconception_classifier import get_misconception_classifier
from app.learner.recommendation import RecommendationService
from app.learner.study_plan_service import StudyPlanGenerator


class MasteryService:
    @staticmethod
    async def get_topic_mastery(
        db: AsyncSession,
        user_id: str,
        course_id: str
    ) -> List[TopicMasteryOut]:
        # Fetch topics for the course
        top_res = await db.execute(
            select(Topic)
            .where(Topic.course_id == course_id)
            .order_by(Topic.sort_order)
        )
        topics = top_res.scalars().all()
        if not topics:
            return []

        output: List[TopicMasteryOut] = []
        for t in topics:
            c_res = await db.execute(
                select(Concept).where(Concept.topic_id == t.id)
            )
            concepts = c_res.scalars().all()

            total = len(concepts)
            mastered = sum(1 for c in concepts if c.status == "mastered" or c.mastery_percent >= 80)
            developing = sum(1 for c in concepts if c.status == "learning" and c.mastery_percent < 80)
            attention = sum(1 for c in concepts if c.status == "attention")

            avg_mastery = round(sum(c.mastery_percent for c in concepts) / total) if total > 0 else 0

            output.append(
                TopicMasteryOut(
                    topic_id=t.id,
                    topic_title=t.title,
                    mastery_percent=avg_mastery,
                    concepts_total=total,
                    concepts_mastered=mastered,
                    concepts_developing=developing,
                    concepts_attention=attention,
                )
            )

        return output

    @staticmethod
    async def get_study_plan(
        db: AsyncSession,
        user_id: str,
        course_id: str
    ) -> List[StudyPlanDayOut]:
        # Fetch existing study plans from DB
        plan_res = await db.execute(
            select(StudyPlan)
            .where(StudyPlan.course_id == course_id, StudyPlan.user_id == user_id)
            .order_by(StudyPlan.day_number)
        )
        plans = plan_res.scalars().all()

        output: List[StudyPlanDayOut] = []
        for p in plans:
            task_res = await db.execute(
                select(StudyPlanTask)
                .where(StudyPlanTask.study_plan_id == p.id)
                .order_by(StudyPlanTask.id)
            )
            tasks = task_res.scalars().all()

            task_outs: List[StudyPlanTaskOut] = []
            for t in tasks:
                citation_out = None
                if t.target_citation_id:
                    cite_res = await db.execute(
                        select(Citation).where(Citation.id == t.target_citation_id)
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

                task_outs.append(
                    StudyPlanTaskOut(
                        id=t.id,
                        title=t.title,
                        duration_minutes=t.duration_minutes,
                        completed=t.completed,
                        type=t.task_type,
                        target_citation=citation_out,
                    )
                )

            output.append(
                StudyPlanDayOut(
                    day_number=p.day_number,
                    date_string=p.date_string,
                    focus_concept_id=p.focus_concept_id,
                    focus_title=p.focus_title,
                    minutes_budget=p.minutes_budget,
                    status=p.status,
                    tasks=task_outs,
                )
            )

        return output

    @classmethod
    async def get_concept_mastery_details(
        cls,
        db: AsyncSession,
        user_id: str,
        course_id: str,
    ) -> List[ConceptMasteryDetail]:
        """Fetch fine-grained per-concept mastery details and attempt statistics."""
        c_res = await db.execute(
            select(Concept).where(Concept.course_id == course_id)
        )
        concepts = c_res.scalars().all()

        details: List[ConceptMasteryDetail] = []
        for c in concepts:
            ans_res = await db.execute(
                select(QuizAttemptAnswer, QuizAttempt)
                .join(QuizAttempt, QuizAttemptAnswer.attempt_id == QuizAttempt.id)
                .join(QuizQuestion, QuizAttemptAnswer.question_id == QuizQuestion.id)
                .where(QuizAttempt.user_id == user_id, QuizQuestion.concept_id == c.id)
                .order_by(QuizAttempt.completed_at.asc())
            )
            rows = ans_res.all()

            total_attempts = len(rows)
            correct_count = sum(1 for a, _ in rows if a.is_correct)
            incorrect_count = total_attempts - correct_count

            # calculate current streak
            streak_correct = 0
            for a, _ in reversed(rows):
                if a.is_correct:
                    streak_correct += 1
                else:
                    break

            last_attempt_at = rows[-1][1].completed_at if rows else None

            details.append(
                ConceptMasteryDetail(
                    concept_id=c.id,
                    concept_name=c.name,
                    mastery_percent=c.mastery_percent,
                    status=c.status,
                    total_attempts=total_attempts,
                    correct_count=correct_count,
                    incorrect_count=incorrect_count,
                    streak_correct=streak_correct,
                    last_attempt_at=last_attempt_at,
                    algorithm_version=MasteryAlgorithmV1.VERSION,
                )
            )

        return details

    @classmethod
    async def get_diagnostic_summary(
        cls,
        db: AsyncSession,
        user_id: str,
        course_id: str,
    ) -> DiagnosticSummary:
        """Compute diagnostic assessment summary: prerequisite gaps, misconceptions, and weakest concept."""
        c_res = await db.execute(select(Concept).where(Concept.course_id == course_id))
        concepts = c_res.scalars().all()

        r_res = await db.execute(
            select(ConceptRelationship).where(
                (ConceptRelationship.course_id == course_id) | (ConceptRelationship.course_id == None)
            )
        )
        relationships = r_res.scalars().all()

        concepts_data = [
            {"id": c.id, "name": c.name, "mastery_percent": c.mastery_percent, "status": c.status}
            for c in concepts
        ]
        rels_data = [
            {
                "source_concept_id": r.source_concept_id,
                "target_concept_id": r.target_concept_id,
                "relationship_type": r.relationship_type,
            }
            for r in relationships
        ]

        # Prerequisite gaps
        gaps = RecommendationService.find_prerequisite_gaps(concepts_data, rels_data)
        prereq_gaps_out = [
            PrerequisiteGapOut(
                concept_id=g.concept_id,
                concept_name=g.concept_name,
                mastery_percent=g.mastery_percent,
                required_by=g.required_by,
                priority_score=g.priority_score,
            )
            for g in gaps
        ]

        # Classify misconceptions across answers
        ans_res = await db.execute(
            select(QuizAttemptAnswer, QuizQuestion, Concept)
            .join(QuizAttempt, QuizAttemptAnswer.attempt_id == QuizAttempt.id)
            .join(QuizQuestion, QuizAttemptAnswer.question_id == QuizQuestion.id)
            .join(Concept, QuizQuestion.concept_id == Concept.id)
            .where(QuizAttempt.user_id == user_id, Concept.course_id == course_id)
        )
        answer_rows = ans_res.all()

        classifier = get_misconception_classifier()
        concept_misconceptions: Dict[str, tuple[str, List[str], List[str]]] = {}
        for a, q, c in answer_rows:
            if a.misconception_tag:
                if c.id not in concept_misconceptions:
                    concept_misconceptions[c.id] = (c.name, [], [])
                concept_misconceptions[c.id][1].append(a.misconception_tag)
                concept_misconceptions[c.id][2].append(a.attempt_id)

        top_misconceptions: List[MisconceptionOut] = []
        for cid, (cname, tags, aids) in concept_misconceptions.items():
            reports = classifier.classify(cid, cname, tags, aids)
            for r in reports:
                top_misconceptions.append(
                    MisconceptionOut(
                        concept_id=r.concept_id,
                        concept_name=r.concept_name,
                        misconception_tag=r.misconception_tag,
                        frequency=r.frequency,
                        classifier_confidence=r.classifier_confidence,
                        diagnostic_advice=r.diagnostic_advice,
                    )
                )

        total_concepts = len(concepts)
        mastered = sum(1 for c in concepts if c.mastery_percent >= 80)
        learning = sum(1 for c in concepts if 40 <= c.mastery_percent < 80)
        attention = sum(1 for c in concepts if c.mastery_percent < 40)
        overall_mastery = round(sum(c.mastery_percent for c in concepts) / total_concepts) if total_concepts > 0 else 0

        weakest = min(concepts, key=lambda c: c.mastery_percent) if concepts else None

        return DiagnosticSummary(
            course_id=course_id,
            overall_mastery=overall_mastery,
            concepts_mastered=mastered,
            concepts_learning=learning,
            concepts_attention=attention,
            concepts_total=total_concepts,
            prerequisite_gaps=prereq_gaps_out,
            top_misconceptions=top_misconceptions,
            weakest_concept_id=weakest.id if weakest else None,
            weakest_concept_name=weakest.name if weakest else None,
        )

    @classmethod
    async def get_study_recommendations(
        cls,
        db: AsyncSession,
        user_id: str,
        course_id: str,
        available_minutes: int = 45,
    ) -> List[StudyRecommendationOut]:
        """Generate prioritized study next recommendations."""
        c_res = await db.execute(select(Concept).where(Concept.course_id == course_id))
        concepts = c_res.scalars().all()

        r_res = await db.execute(
            select(ConceptRelationship).where(
                (ConceptRelationship.course_id == course_id) | (ConceptRelationship.course_id == None)
            )
        )
        relationships = r_res.scalars().all()

        concepts_data = [
            {"id": c.id, "name": c.name, "mastery_percent": c.mastery_percent, "status": c.status}
            for c in concepts
        ]
        rels_data = [
            {
                "source_concept_id": r.source_concept_id,
                "target_concept_id": r.target_concept_id,
                "relationship_type": r.relationship_type,
            }
            for r in relationships
        ]

        recs, _ = RecommendationService.generate_recommendations(
            concepts=concepts_data,
            relationships=rels_data,
            available_minutes=available_minutes,
        )

        return [
            StudyRecommendationOut(
                concept_id=r.concept_id,
                concept_name=r.concept_name,
                priority_rank=r.priority_rank,
                reason=r.reason,
                recommended_activity=r.recommended_activity,
                estimated_minutes=r.estimated_minutes,
                current_mastery=r.current_mastery,
                target_mastery=r.target_mastery,
            )
            for r in recs
        ]

    @classmethod
    async def generate_dynamic_study_plan(
        cls,
        db: AsyncSession,
        user_id: str,
        course_id: str,
    ) -> StudyPlanOut:
        """Generate dynamic time-bounded study plan based on course daily minutes and exam date."""
        course_res = await db.execute(select(Course).where(Course.id == course_id))
        course = course_res.scalar_one_or_none()
        daily_minutes = course.daily_study_minutes if course else 45
        days_until_exam = course.exam_countdown_days if course else 7

        c_res = await db.execute(select(Concept).where(Concept.course_id == course_id))
        concepts = c_res.scalars().all()

        r_res = await db.execute(
            select(ConceptRelationship).where(
                (ConceptRelationship.course_id == course_id) | (ConceptRelationship.course_id == None)
            )
        )
        relationships = r_res.scalars().all()

        concepts_data = [
            {"id": c.id, "name": c.name, "mastery_percent": c.mastery_percent, "status": c.status}
            for c in concepts
        ]
        rels_data = [
            {
                "source_concept_id": r.source_concept_id,
                "target_concept_id": r.target_concept_id,
                "relationship_type": r.relationship_type,
            }
            for r in relationships
        ]

        plan = StudyPlanGenerator.generate(
            course_id=course_id,
            user_id=user_id,
            concepts=concepts_data,
            relationships=rels_data,
            daily_minutes=daily_minutes,
            days_until_exam=days_until_exam,
        )

        return StudyPlanOut(
            course_id=course_id,
            total_minutes_available=plan.total_minutes_available,
            total_minutes_allocated=plan.total_minutes_allocated,
            days_until_exam=plan.days_until_exam,
            recommendations=[
                StudyRecommendationOut(
                    concept_id=r.concept_id,
                    concept_name=r.concept_name,
                    priority_rank=r.priority_rank,
                    reason=r.reason,
                    recommended_activity=r.recommended_activity,
                    estimated_minutes=r.estimated_minutes,
                    current_mastery=r.current_mastery,
                    target_mastery=r.target_mastery,
                )
                for r in plan.recommendations
            ],
            overflow_concepts=plan.overflow_concepts,
            algorithm_version=plan.algorithm_version,
        )

    @classmethod
    async def recalculate_concept_mastery(
        cls,
        db: AsyncSession,
        user_id: str,
        concept_id: str,
    ) -> MasteryRecalcResult:
        """Safely recalculate a concept's mastery from scratch using historical attempts."""
        c_res = await db.execute(select(Concept).where(Concept.id == concept_id))
        concept = c_res.scalar_one_or_none()
        if not concept:
            raise ValueError(f"Concept '{concept_id}' not found.")

        old_mastery = concept.mastery_percent
        old_status = concept.status

        # Fetch attempt history
        ans_res = await db.execute(
            select(QuizAttemptAnswer, QuizAttempt)
            .join(QuizAttempt, QuizAttemptAnswer.attempt_id == QuizAttempt.id)
            .join(QuizQuestion, QuizAttemptAnswer.question_id == QuizQuestion.id)
            .where(QuizAttempt.user_id == user_id, QuizQuestion.concept_id == concept_id)
            .order_by(QuizAttempt.completed_at.asc())
        )
        rows = ans_res.all()

        attempts_data = [
            {
                "score": a.score,
                "is_correct": a.is_correct,
                "answered_at": att.completed_at,
            }
            for a, att in rows
        ]

        engine = MasteryAlgorithmV1()
        new_mastery, new_status, _, _ = engine.recalculate_from_history(
            attempts=attempts_data,
            initial_mastery=0,
        )

        concept.mastery_percent = new_mastery
        concept.status = new_status
        await db.commit()

        return MasteryRecalcResult(
            concept_id=concept_id,
            old_mastery=old_mastery,
            new_mastery=new_mastery,
            old_status=old_status,
            new_status=new_status,
            attempts_replayed=len(attempts_data),
        )
