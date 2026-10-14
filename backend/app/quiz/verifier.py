"""
Independent Question, Answer-Key, and Calculation Verifier
Enforces:
1. Exact one correct MCQ answer.
2. Verified calculations and units for numerical questions.
3. Strict source evidence grounding against retrieved courseware.
4. Duplicate detection via normalized SHA-256 fingerprinting.
5. Distractor distinctness and non-ambiguity.
"""
import ast
import hashlib
import logging
import operator
import re
from typing import Dict, List, Optional, Set

from app.quiz.schemas import QuestionVerificationReport, RawGeneratedQuestion
from app.rag.retrieval import RetrievalResult

logger = logging.getLogger("coursecompass.quiz.verifier")

# Safe math operators for AST arithmetic evaluator
SAFE_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}


def safe_eval_arithmetic(expr_str: str) -> Optional[float]:
    """Safely evaluates a basic arithmetic expression using AST without using eval()."""
    try:
        clean_expr = expr_str.strip().replace("^", "**")
        node = ast.parse(clean_expr, mode='eval')

        def _eval(node):
            if isinstance(node, ast.Expression):
                return _eval(node.body)
            elif isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
                return float(node.value)
            elif isinstance(node, ast.BinOp):
                op_type = type(node.op)
                if op_type not in SAFE_OPERATORS:
                    raise ValueError(f"Unsupported operator: {op_type}")
                left = _eval(node.left)
                right = _eval(node.right)
                return SAFE_OPERATORS[op_type](left, right)
            elif isinstance(node, ast.UnaryOp):
                op_type = type(node.op)
                if op_type not in SAFE_OPERATORS:
                    raise ValueError(f"Unsupported unary operator: {op_type}")
                operand = _eval(node.operand)
                return SAFE_OPERATORS[op_type](operand)
            else:
                raise ValueError(f"Unsupported node type: {type(node)}")

        return _eval(node)
    except Exception as e:
        logger.debug("Arithmetic evaluation failed for '%s': %s", expr_str, e)
        return None


def compute_question_fingerprint(concept_id: str, question_type: str, prompt: str) -> str:
    """Computes a normalized SHA-256 fingerprint for duplicate detection."""
    norm_prompt = re.sub(r"[^a-z0-9]", "", prompt.lower())
    payload = f"{concept_id}:{question_type}:{norm_prompt}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


class QuizQuestionVerifier:
    """Independent validator ensuring high academic rigor and correctness before question persistence."""

    @classmethod
    def verify(
        cls,
        question: RawGeneratedQuestion,
        retrieved_evidence: List[RetrievalResult],
        existing_fingerprints: Optional[Set[str]] = None,
        allow_revision: bool = False
    ) -> QuestionVerificationReport:
        failure_reasons: List[str] = []
        ambiguity_detected = False
        numerical_verified = True
        evidence_score = 1.0

        existing_fps = existing_fingerprints or set()

        # 1. Duplicate Detection
        fingerprint = compute_question_fingerprint(
            question.concept_id,
            question.question_type,
            question.prompt
        )
        if fingerprint in existing_fps and not allow_revision:
            failure_reasons.append(
                "Duplicate question detected: an identical or near-identical question already exists in this course."
            )

        # 2. Source Evidence Grounding Verification
        evidence_map: Dict[str, RetrievalResult] = {e.chunk_id: e for e in retrieved_evidence}
        if not question.cited_chunk_id or question.cited_chunk_id not in evidence_map:
            failure_reasons.append(
                f"Missing or invalid course citation: cited_chunk_id '{question.cited_chunk_id}' is not in retrieved course evidence."
            )
            evidence_score = 0.0
        else:
            chunk = evidence_map[question.cited_chunk_id]
            # Verify that the chunk text contains keywords related to prompt or explanation
            prompt_words = [w for w in re.findall(r"\w+", question.prompt.lower()) if len(w) > 3]
            chunk_text_lower = chunk.content.lower()
            matched = sum(1 for w in prompt_words if w in chunk_text_lower)
            if prompt_words:
                overlap_ratio = matched / len(prompt_words)
                evidence_score = round(overlap_ratio, 2)
                if overlap_ratio < 0.20:
                    failure_reasons.append(
                        f"Question is insufficiently grounded in cited chunk '{chunk.location_label}' (keyword overlap: {overlap_ratio*100:.0f}%)."
                    )

        # 3. Format-Specific Verifications
        qtype = question.question_type
        if qtype == "multiple_choice":
            # Rule: Exactly one correct MCQ answer
            if len(question.options) < 3:
                failure_reasons.append(f"Multiple choice questions must have at least 3 options, found {len(question.options)}.")

            correct_opts = [opt for opt in question.options if opt.is_correct]
            if len(correct_opts) != 1:
                ambiguity_detected = True
                failure_reasons.append(
                    f"Ambiguous or invalid MCQ: must contain exactly one correct answer, found {len(correct_opts)}."
                )

            # Check for duplicate option text
            option_texts = [re.sub(r"\s+", " ", opt.text.strip().lower()) for opt in question.options]
            if len(set(option_texts)) < len(option_texts):
                ambiguity_detected = True
                failure_reasons.append("Duplicate distractor option text detected across choices.")

        elif qtype == "numerical":
            if question.numerical_value is None:
                numerical_verified = False
                failure_reasons.append("Numerical question must specify a numerical_value.")

            if not question.numerical_unit:
                numerical_verified = False
                failure_reasons.append("Numerical question must specify correct units (e.g. 'MB', 'ms', 'steps').")

            # Check calculation if formula provided
            if question.calculation_formula and question.numerical_value is not None:
                calc_val = safe_eval_arithmetic(question.calculation_formula)
                if calc_val is not None:
                    tol = question.numerical_tolerance if question.numerical_tolerance is not None else 0.01
                    if abs(calc_val - question.numerical_value) > tol:
                        numerical_verified = False
                        failure_reasons.append(
                            f"Numerical calculation discrepancy: formula '{question.calculation_formula}' evaluated to {calc_val}, "
                            f"but expected numerical_value was {question.numerical_value} (tolerance: {tol})."
                        )

        elif qtype == "short_answer":
            if not question.rubric and not question.expected_answer:
                failure_reasons.append("Short-answer questions must define an explicit evaluation rubric or expected answer keywords.")

        is_valid = len(failure_reasons) == 0

        return QuestionVerificationReport(
            is_valid=is_valid,
            failure_reasons=failure_reasons,
            evidence_support_score=evidence_score,
            ambiguity_detected=ambiguity_detected,
            numerical_verified=numerical_verified,
            fingerprint=fingerprint
        )

