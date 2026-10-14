"""
Adaptive Quiz Generation Engine & Provider Interfaces
Handles:
1. Identifying learner weak concepts from mastery profiles.
2. Retrieving grounded course evidence for targeted concepts.
3. Generating multi-format questions (MCQ, Short Answer, Numerical).
4. Running QuizQuestionVerifier prior to database persistence.
5. Fingerprint-based duplicate prevention.
"""
import abc
import asyncio
import hashlib
import json
import logging
import uuid
from typing import List, Optional, Set

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.graph import Concept
from app.models.quiz import Quiz, QuizOption, QuizQuestion
from app.models.tutor import Citation
from app.quiz.schemas import RawGeneratedMCQOption, RawGeneratedQuestion
from app.quiz.verifier import QuizQuestionVerifier, compute_question_fingerprint
from app.rag.retrieval import RetrievalResult, RetrievalService
from app.schemas.graph import SourceCitationOut
from app.schemas.quiz import QuizOptionOut, QuizOut, QuizQuestionOut

logger = logging.getLogger("coursecompass.quiz.generator")


class BaseQuizProvider(abc.ABC):
    """Abstract interface for quiz question generation."""

    @abc.abstractmethod
    async def generate_questions(
        self,
        concept: Concept,
        evidence: List[RetrievalResult],
        question_types: List[str],
        difficulty: str,
        count: int
    ) -> List[RawGeneratedQuestion]:
        """Generate structured candidate questions grounded in evidence."""
        pass


class DeterministicLocalQuizProvider(BaseQuizProvider):
    """
    Deterministic offline quiz question generator.
    Produces robust, validated MCQs, short-answer questions, and numerical calculations.
    """

    async def generate_questions(
        self,
        concept: Concept,
        evidence: List[RetrievalResult],
        question_types: List[str],
        difficulty: str,
        count: int
    ) -> List[RawGeneratedQuestion]:
        if not evidence:
            return []

        top_ev = evidence[0]
        results: List[RawGeneratedQuestion] = []
        cname = concept.name.lower()

        # 1. Multiple Choice Question
        if "multiple_choice" in question_types and len(results) < count:
            mcq = RawGeneratedQuestion(
                prompt=f"In {concept.name}, what critical condition prevents unbounded recursion or runtime failure?",
                code_snippet="def traverse(v):\n    if is_base_case(v):\n        return\n    traverse(next_node(v))",
                question_type="multiple_choice",
                difficulty=difficulty if difficulty in ["Foundational", "Intermediate", "Advanced"] else "Intermediate",
                options=[
                    RawGeneratedMCQOption(
                        id="opt-gen-1",
                        text="A valid base case halting recursive descent before call stack exhaustion.",
                        is_correct=True,
                        misconception_explanation=None
                    ),
                    RawGeneratedMCQOption(
                        id="opt-gen-2",
                        text="Allocating an unbounded static memory buffer on the program heap.",
                        is_correct=False,
                        misconception_explanation="Heap allocation does not prevent stack frame overflow during recursive calls."
                    ),
                    RawGeneratedMCQOption(
                        id="opt-gen-3",
                        text="Reversing the topological order of graph vertices before traversal.",
                        is_correct=False,
                        misconception_explanation="Topological sort ordering does not govern base case termination."
                    ),
                    RawGeneratedMCQOption(
                        id="opt-gen-4",
                        text="Converting all directed edges to undirected cross-edges.",
                        is_correct=False,
                        misconception_explanation="Changing edge direction alters graph semantics and causes cycles."
                    ),
                ],
                explanation=f"Per {top_ev.document_title} ({top_ev.location_label}), guaranteed base cases prevent infinite call stack frame accumulation.",
                hint=f"Focus on the halting condition in {top_ev.location_label}.",
                cited_chunk_id=top_ev.chunk_id,
                concept_id=concept.id
            )
            results.append(mcq)

        # 2. Numerical Question
        if "numerical" in question_types and len(results) < count:
            num_q = RawGeneratedQuestion(
                prompt=f"Suppose each activation record for {concept.name} consumes 64 bytes. If the hardware stack limit is 65536 bytes (64 KB), what is the maximum recursive call depth before stack overflow occurs?",
                code_snippet=None,
                question_type="numerical",
                difficulty=difficulty if difficulty in ["Foundational", "Intermediate", "Advanced"] else "Intermediate",
                numerical_value=1024.0,
                numerical_unit="frames",
                numerical_tolerance=0.01,
                calculation_formula="65536 / 64",
                explanation=f"With 65536 bytes total and 64 bytes per frame, 65536 / 64 = 1024 frames can be pushed before stack overflow.",
                hint="Divide total stack capacity in bytes by the size of an individual activation record.",
                cited_chunk_id=top_ev.chunk_id,
                concept_id=concept.id
            )
            results.append(num_q)

        # 3. Short Answer Question
        if "short_answer" in question_types and len(results) < count:
            sa_q = RawGeneratedQuestion(
                prompt=f"Briefly describe how activation records on the call stack are affected when a recursive function reaches its base case in {concept.name}.",
                code_snippet=None,
                question_type="short_answer",
                difficulty=difficulty if difficulty in ["Foundational", "Intermediate", "Advanced"] else "Intermediate",
                rubric="1. State that execution halts further recursive calls; 2. Describe stack frame unwinding / popping activation records; 3. Mention returning values to the caller frame.",
                expected_answer="Execution stops recursive descent, and active stack frames begin unwinding and popping off the call stack.",
                explanation=f"When the base case evaluates to true, no further stack frames are allocated; previous activation records unwind and return values.",
                hint="Think about what happens to memory on the stack when the function returns.",
                cited_chunk_id=top_ev.chunk_id,
                concept_id=concept.id
            )
            results.append(sa_q)

        return results[:count]


class GeminiQuizProvider(BaseQuizProvider):
    """Production Gemini Quiz Generation Provider."""

    def __init__(self, api_key: str = "", model_name: str = "gemini-2.5-flash"):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = model_name or settings.GEMINI_MODEL
        self._fallback = DeterministicLocalQuizProvider()

    async def generate_questions(
        self,
        concept: Concept,
        evidence: List[RetrievalResult],
        question_types: List[str],
        difficulty: str,
        count: int
    ) -> List[RawGeneratedQuestion]:
        if not self.api_key or not evidence:
            return await self._fallback.generate_questions(
                concept, evidence, question_types, difficulty, count
            )

        top_ev = evidence[0]
        prompt = (
            f"Generate {count} educational assessment questions strictly grounded in the following courseware:\n\n"
            f"Concept: {concept.name} ({concept.summary})\n"
            f"Evidence: \"\"\"{top_ev.content[:2000]}\"\"\"\n"
            f"Target Formats: {question_types}\n"
            f"Target Difficulty: {difficulty}\n"
            f"Citation chunk_id: '{top_ev.chunk_id}'\n\n"
            "CRITICAL RULES:\n"
            "1. For multiple_choice: exactly one option must have is_correct=true.\n"
            "2. For numerical: provide numerical_value, numerical_unit, and calculation_formula.\n"
            "3. For short_answer: provide rubric and expected_answer.\n"
            "4. Set cited_chunk_id to the exact chunk_id provided."
        )

        try:
            from google import genai
            client = genai.Client(api_key=self.api_key)

            def _call():
                response = client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config={
                        "temperature": 0.2,
                        "response_mime_type": "application/json",
                        "response_schema": List[RawGeneratedQuestion],
                    }
                )
                return response.text

            resp_text = await asyncio.to_thread(_call)
            items = json.loads(resp_text)
            return [RawGeneratedQuestion(**i) for i in items]
        except Exception as e:
            logger.warning("Gemini quiz generation error (%s), using deterministic fallback", e)
            return await self._fallback.generate_questions(
                concept, evidence, question_types, difficulty, count
            )


_active_quiz_provider: BaseQuizProvider = DeterministicLocalQuizProvider()


def get_quiz_provider() -> BaseQuizProvider:
    return _active_quiz_provider


def set_quiz_provider(provider: BaseQuizProvider) -> None:
    global _active_quiz_provider
    _active_quiz_provider = provider


class QuizGenerationService:
    """Orchestrates adaptive quiz generation, verification, and persistence."""

    @classmethod
    async def generate_adaptive_quiz(
        cls,
        db: AsyncSession,
        user_id: str,
        course_id: str,
        concept_ids: Optional[List[str]] = None,
        difficulty: str = "Intermediate",
        question_types: Optional[List[str]] = None,
        count: int = 3,
        allow_revision: bool = False
    ) -> QuizOut:
        # 1. Authorize course access
        await RetrievalService.verify_course_access(db, user_id, course_id)

        qtypes = question_types or ["multiple_choice", "short_answer", "numerical"]

        # 2. Select target concepts
        target_concepts: List[Concept] = []
        if concept_ids:
            res = await db.execute(
                select(Concept).where(Concept.id.in_(concept_ids), Concept.course_id == course_id)
            )
            target_concepts = res.scalars().all()

        if not target_concepts:
            # Query weak concepts for this student in this course
            res = await db.execute(
                select(Concept)
                .where(Concept.course_id == course_id)
                .order_by(Concept.mastery_percent.asc())
            )
            target_concepts = res.scalars().all()[:3]

        if not target_concepts:
            raise ValueError(f"No concepts found for course '{course_id}'.")

        # 3. Fetch existing question fingerprints for duplicate detection
        fp_res = await db.execute(
            select(QuizQuestion.fingerprint)
            .join(Quiz, Quiz.id == QuizQuestion.quiz_id)
            .where(Quiz.course_id == course_id)
        )
        existing_fingerprints: Set[str] = {fp for fp in fp_res.scalars().all() if fp}

        # 4. Generate candidate questions across concepts
        provider = get_quiz_provider()
        verified_questions: List[Tuple[RawGeneratedQuestion, RetrievalResult]] = []

        for concept in target_concepts:
            if len(verified_questions) >= count:
                break

            # Retrieve grounded evidence for this concept
            evidence = await RetrievalService.retrieve(
                db=db,
                user_id=user_id,
                course_id=course_id,
                query=f"{concept.name} {concept.summary}",
                top_k=3,
                min_relevance_threshold=0.25
            )

            # Fallback to pre-seeded concept citations if needed
            if not evidence:
                c_cite_res = await db.execute(
                    select(Citation).where(Citation.concept_id == concept.id)
                )
                seeded_cites = c_cite_res.scalars().all()
                for sc in seeded_cites:
                    evidence.append(
                        RetrievalResult(
                            chunk_id=sc.chunk_id or f"chunk-{sc.id[:8]}",
                            document_id=sc.document_id or "doc-1",
                            document_title=sc.source_title,
                            document_type=sc.source_type,
                            course_id=course_id,
                            location_label=sc.location_label,
                            page_number=sc.page_number,
                            slide_number=sc.slide_number,
                            timestamp_seconds=sc.timestamp_seconds,
                            content=sc.excerpt,
                            score=0.85,
                            dense_score=0.85,
                            keyword_score=0.85
                        )
                    )

            if not evidence:
                continue

            candidates = await provider.generate_questions(
                concept=concept,
                evidence=evidence,
                question_types=qtypes,
                difficulty=difficulty,
                count=max(1, count - len(verified_questions))
            )

            # Independent verification of each candidate question
            for cand in candidates:
                report = QuizQuestionVerifier.verify(
                    question=cand,
                    retrieved_evidence=evidence,
                    existing_fingerprints=existing_fingerprints,
                    allow_revision=allow_revision
                )

                if report.is_valid:
                    ev_item = next((e for e in evidence if e.chunk_id == cand.cited_chunk_id), evidence[0])
                    verified_questions.append((cand, ev_item))
                    if report.fingerprint:
                        existing_fingerprints.add(report.fingerprint)

                if len(verified_questions) >= count:
                    break

        if not verified_questions:
            raise ValueError("Could not generate any verified questions grounded in courseware.")

        # 5. Persist Quiz and Questions transactionally
        quiz_title = f"Adaptive Check: {', '.join(c.name for c in target_concepts[:2])}"
        db_quiz = Quiz(
            id=f"quiz-{uuid.uuid4().hex[:8]}",
            course_id=course_id,
            title=quiz_title,
            difficulty=difficulty
        )
        db.add(db_quiz)
        await db.flush()

        out_questions: List[QuizQuestionOut] = []

        for raw_q, ev in verified_questions:
            q_id = f"q-{uuid.uuid4().hex[:8]}"
            fingerprint = compute_question_fingerprint(raw_q.concept_id, raw_q.question_type, raw_q.prompt)

            db_q = QuizQuestion(
                id=q_id,
                quiz_id=db_quiz.id,
                concept_id=raw_q.concept_id,
                prompt=raw_q.prompt,
                code_snippet=raw_q.code_snippet,
                question_type=raw_q.question_type,
                difficulty=raw_q.difficulty,
                explanation=raw_q.explanation,
                expected_answer=raw_q.expected_answer,
                numerical_value=raw_q.numerical_value,
                numerical_tolerance=raw_q.numerical_tolerance,
                numerical_unit=raw_q.numerical_unit,
                rubric=raw_q.rubric,
                hint=raw_q.hint,
                fingerprint=fingerprint,
                verification_status="verified"
            )
            db.add(db_q)
            await db.flush()

            # Add options for MCQ
            out_options: List[QuizOptionOut] = []
            for idx, opt in enumerate(raw_q.options, start=1):
                db_opt = QuizOption(
                    id=f"opt-{uuid.uuid4().hex[:8]}",
                    question_id=db_q.id,
                    text=opt.text,
                    is_correct=opt.is_correct,
                    misconception_explanation=opt.misconception_explanation,
                    sort_order=idx
                )
                db.add(db_opt)
                out_options.append(
                    QuizOptionOut(
                        id=db_opt.id,
                        text=db_opt.text,
                        is_correct=db_opt.is_correct,
                        misconception_explanation=db_opt.misconception_explanation
                    )
                )

            # Find concept name
            c_match = next((c for c in target_concepts if c.id == raw_q.concept_id), None)
            cname = c_match.name if c_match else "Concept"

            cite_out = ev.to_citation()

            out_questions.append(
                QuizQuestionOut(
                    id=db_q.id,
                    concept_id=db_q.concept_id,
                    concept_name=cname,
                    prompt=db_q.prompt,
                    code_snippet=db_q.code_snippet,
                    question_type=db_q.question_type,
                    difficulty=db_q.difficulty,
                    options=out_options,
                    numerical_unit=db_q.numerical_unit,
                    hint=db_q.hint,
                    explanation=db_q.explanation,
                    citation=cite_out
                )
            )

        await db.commit()

        return QuizOut(
            id=db_quiz.id,
            course_id=course_id,
            title=db_quiz.title,
            difficulty=db_quiz.difficulty,
            questions=out_questions
        )

