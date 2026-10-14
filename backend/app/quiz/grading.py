"""
Deterministic & Rubric-Based Quiz Grading Engine
Handles:
1. Multiple choice deterministic grading with distractor misconception identification.
2. Numerical answer parsing with unit checking and partial credit for unit omissions.
3. Short-answer grading using explicit rubric item coverage.
4. Pedagogical feedback generation and citation mapping.
"""
import logging
import re
from typing import List, Optional, Tuple

from app.models.graph import Concept
from app.models.quiz import QuizOption, QuizQuestion
from app.models.tutor import Citation
from app.schemas.graph import SourceCitationOut
from app.schemas.quiz import AnswerFeedbackOut, QuizAnswerSubmission

logger = logging.getLogger("coursecompass.quiz.grading")


class QuizGradingService:
    """Evaluates student quiz submissions deterministically with rich diagnostic feedback."""

    @classmethod
    def grade_question(
        cls,
        question: QuizQuestion,
        options: List[QuizOption],
        submission: QuizAnswerSubmission,
        citation: Optional[Citation] = None,
        concept: Optional[Concept] = None
    ) -> AnswerFeedbackOut:
        qtype = question.question_type or "multiple_choice"

        citation_out: Optional[SourceCitationOut] = None
        if citation:
            citation_out = SourceCitationOut(
                id=citation.id,
                document_id=citation.document_id,
                source_title=citation.source_title,
                source_type=citation.source_type,
                location_label=citation.location_label,
                page_number=citation.page_number,
                slide_number=citation.slide_number,
                timestamp_seconds=citation.timestamp_seconds,
                excerpt=citation.excerpt,
                context_snippet=citation.context_snippet,
                verification_confidence=citation.verification_confidence or "verified"
            )

        concept_name = concept.name if concept else "this concept"

        if qtype == "multiple_choice":
            return cls._grade_mcq(question, options, submission, citation_out, concept_name)
        elif qtype == "numerical":
            return cls._grade_numerical(question, submission, citation_out, concept_name)
        elif qtype == "short_answer":
            return cls._grade_short_answer(question, submission, citation_out, concept_name)
        else:
            # Fallback to MCQ
            return cls._grade_mcq(question, options, submission, citation_out, concept_name)

    @classmethod
    def _grade_mcq(
        cls,
        question: QuizQuestion,
        options: List[QuizOption],
        submission: QuizAnswerSubmission,
        citation: Optional[SourceCitationOut],
        concept_name: str
    ) -> AnswerFeedbackOut:
        chosen_opt = next((o for o in options if o.id == submission.selected_option_id), None)
        correct_opt = next((o for o in options if o.is_correct), None)

        is_correct = chosen_opt.is_correct if chosen_opt else False
        score = 1.0 if is_correct else 0.0

        user_answer_text = chosen_opt.text if chosen_opt else "No option selected"
        correct_answer_text = correct_opt.text if correct_opt else "Correct option not configured"

        misconception_text = None
        if is_correct:
            explanation = f"Correct! {question.explanation}"
            rec_activity = f"Mastery demonstrated for {concept_name}. Proceed to advanced concepts."
        else:
            misconception_text = (
                chosen_opt.misconception_explanation
                if chosen_opt and chosen_opt.misconception_explanation
                else f"Selected option reflects a common misconception regarding {concept_name}."
            )
            explanation = f"Incorrect. {misconception_text} {question.explanation}"
            ref_label = citation.location_label if citation else "course lecture notes"
            rec_activity = f"Review {concept_name} in your Knowledge Map and inspect citations at {ref_label}."

        return AnswerFeedbackOut(
            question_id=question.id,
            is_correct=is_correct,
            score=score,
            user_answer=user_answer_text,
            correct_answer=correct_answer_text,
            explanation=explanation,
            citation=citation,
            hint=question.hint or f"Remember the core invariant for {concept_name}.",
            misconception_explanation=misconception_text,
            recommended_activity=rec_activity,
            grading_method="deterministic"
        )

    @classmethod
    def _grade_numerical(
        cls,
        question: QuizQuestion,
        submission: QuizAnswerSubmission,
        citation: Optional[SourceCitationOut],
        concept_name: str
    ) -> AnswerFeedbackOut:
        raw_text = (submission.submitted_text or "").strip()
        expected_val = question.numerical_value
        expected_unit = (question.numerical_unit or "").strip()
        tolerance = question.numerical_tolerance if question.numerical_tolerance is not None else 0.01

        correct_answer_str = f"{expected_val} {expected_unit}".strip()

        # Parse number from submission
        num_match = re.search(r"[-+]?(?:\d*\.\d+|\d+)", raw_text)
        if not num_match or expected_val is None:
            return AnswerFeedbackOut(
                question_id=question.id,
                is_correct=False,
                score=0.0,
                user_answer=raw_text or "Empty submission",
                correct_answer=correct_answer_str,
                explanation=f"Could not parse a valid numerical quantity. {question.explanation}",
                citation=citation,
                hint=question.hint or f"Compute the arithmetic value for {concept_name} and specify '{expected_unit}'.",
                misconception_explanation="Unparseable numerical input format.",
                recommended_activity=f"Review numerical formulas for {concept_name}.",
                grading_method="deterministic"
            )

        submitted_val = float(num_match.group(0))
        val_matches = abs(submitted_val - expected_val) <= tolerance

        # Check unit
        unit_matches = True
        if expected_unit:
            unit_sub = re.search(r"[a-zA-Z%]+", raw_text)
            submitted_unit = unit_sub.group(0).lower() if unit_sub else ""
            unit_matches = (submitted_unit == expected_unit.lower())

        if val_matches and unit_matches:
            is_correct = True
            score = 1.0
            explanation = f"Correct calculation! {question.explanation}"
            misconception = None
            rec_activity = f"Numerical precision verified for {concept_name}."
        elif val_matches and not unit_matches:
            # Partial credit for correct magnitude with wrong/missing unit
            is_correct = False
            score = 0.5
            explanation = (
                f"Partially correct magnitude ({submitted_val}), but missing or incorrect unit. "
                f"Expected unit was '{expected_unit}'. {question.explanation}"
            )
            misconception = f"Omission or misidentification of standard unit '{expected_unit}'."
            rec_activity = f"Always include explicit units ('{expected_unit}') when reporting numerical findings in {concept_name}."
        else:
            is_correct = False
            score = 0.0
            explanation = (
                f"Calculation error. Expected {expected_val} {expected_unit} (within ±{tolerance}). "
                f"{question.explanation}"
            )
            misconception = f"Arithmetic error in applying formula for {concept_name}."
            rec_activity = f"Review the step-by-step arithmetic derivation for {concept_name}."

        return AnswerFeedbackOut(
            question_id=question.id,
            is_correct=is_correct,
            score=score,
            user_answer=raw_text,
            correct_answer=correct_answer_str,
            explanation=explanation,
            citation=citation,
            hint=question.hint or f"Check your arithmetic operations and verify the '{expected_unit}' unit.",
            misconception_explanation=misconception,
            recommended_activity=rec_activity,
            grading_method="deterministic"
        )

    @classmethod
    def _grade_short_answer(
        cls,
        question: QuizQuestion,
        submission: QuizAnswerSubmission,
        citation: Optional[SourceCitationOut],
        concept_name: str
    ) -> AnswerFeedbackOut:
        raw_text = (submission.submitted_text or "").strip().lower()
        rubric_text = question.rubric or question.expected_answer or ""
        expected_answer_str = question.expected_answer or question.rubric or "Key concepts in syllabus"

        # Split rubric into criteria (separated by ';' or newlines)
        raw_criteria = [c.strip() for c in re.split(r"[;\n]+", rubric_text) if c.strip()]
        if not raw_criteria:
            raw_criteria = [w for w in re.findall(r"\w+", rubric_text.lower()) if len(w) > 3]

        if not raw_criteria:
            raw_criteria = ["base case", "recursion", "stack"]

        met_count = 0
        unmet_criteria: List[str] = []

        from app.tutor.citation_validator import STOPWORDS

        for crit in raw_criteria:
            crit_content_words = [w for w in re.findall(r"\w+", crit.lower()) if len(w) > 2 and w not in STOPWORDS]
            if not crit_content_words:
                crit_content_words = [w for w in re.findall(r"\w+", crit.lower()) if len(w) > 2]
            
            matched_words = [w for w in crit_content_words if w in raw_text]
            # Require at least 40% of key content words to meet this criterion
            threshold = max(1, int(len(crit_content_words) * 0.4))
            if len(matched_words) >= threshold:
                met_count += 1
            else:
                unmet_criteria.append(crit)

        total_criteria = len(raw_criteria)
        score_ratio = met_count / total_criteria if total_criteria > 0 else 0.0

        if score_ratio >= 0.75:
            is_correct = True
            score = 1.0
            explanation = f"Comprehensive answer addressing key criteria! {question.explanation}"
            misconception = None
            rec_activity = f"Solid conceptual mastery of {concept_name}."
        elif score_ratio >= 0.40:
            is_correct = False
            score = 0.5  # Partial credit
            missing_summary = ", ".join(unmet_criteria[:2])
            explanation = (
                f"Partially correct (addressed {met_count}/{total_criteria} criteria). "
                f"Your explanation lacked key coverage of: {missing_summary}. {question.explanation}"
            )
            misconception = f"Incomplete explanation of {concept_name} omitting critical structural elements."
            rec_activity = f"Review the complete formal definition of {concept_name} to strengthen conceptual completeness."
        else:
            is_correct = False
            score = 0.0
            explanation = f"Insufficient explanation. {question.explanation}"
            misconception = f"Fundamental gap in understanding the mechanics of {concept_name}."
            rec_activity = f"Re-read the primary source lecture notes on {concept_name}."

        return AnswerFeedbackOut(
            question_id=question.id,
            is_correct=is_correct,
            score=score,
            user_answer=submission.submitted_text or "Empty submission",
            correct_answer=expected_answer_str,
            explanation=explanation,
            citation=citation,
            hint=question.hint or f"Be sure to describe both the cause and the consequence regarding {concept_name}.",
            misconception_explanation=misconception,
            recommended_activity=rec_activity,
            grading_method="rubric_deterministic"
        )
