# CourseCompass: Adaptive Assessment Engine & Multi-Format Grading Architecture

**Document Version:** 1.0  
**Status:** Approved & Implemented  
**Reference Course:** CS 204: Algorithms & Data Structures (IIT Mandi)  
**Primary Student Persona:** Ananya Sharma (B.Tech CSE, 2nd Year)  

---

## 1. Architectural Overview & Pedagogical Purpose

The CourseCompass Assessment Engine generates, validates, and grades adaptive educational quizzes directly grounded in indexed course materials. The system moves beyond naive multiple-choice quizzes by supporting **multi-format assessment** (Multiple Choice, Short Answer, Numerical) paired with an **independent verification pipeline** that rejects ambiguous questions, invalid answer keys, ungrounded prompts, and arithmetic calculation errors before persistence.

### Key Pedagogical Tenets
1. **Targeted Diagnostic Testing:** Quizzes adaptively target weak concepts identified from learner mastery profiles (e.g. concepts marked `attention` or `learning`).
2. **Zero Hallucination / Strict Evidence Grounding:** Questions must cite an authentic retrieved chunk from authorized courseware; ungrounded questions are rejected.
3. **Deterministic First, Semantic Fallback:** Definite answers (MCQs, exact numerical results, unit matches) grade deterministically via Python code. Semantic rubric evaluation is used only when assessing open-ended conceptual explanations.
4. **Diagnostic Feedback & Misconception Classification:** Every answer receives supportive feedback, source citations, hints, and targeted remediation steps.

```
[Target Concepts & Mastery State]
               │
               ▼
[Tenant-Isolated Retrieval (RetrievalService)]
               │
               ▼
[Question Generator (BaseQuizProvider)]
 (MCQ, Short Answer, Numerical)
               │
               ▼
┌──────────────────────────────────────────────┐
│        QuizQuestionVerifier Engine           │
│                                              │
│ 1. Exactly 1 Correct MCQ Option Check        │
│ 2. Distractor Uniqueness & Ambiguity Check   │
│ 3. Safe AST Arithmetic & Unit Verification   │
│ 4. Course Evidence Grounding Check           │
│ 5. SHA-256 Duplicate Fingerprint Check       │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
          [Transactional Persistence]
          (Quiz, QuizQuestion, QuizOption)
                       │
                       ▼
          [Learner Takes & Submits Quiz]
                       │
                       ▼
┌──────────────────────────────────────────────┐
│         QuizGradingService Engine            │
│                                              │
│ • MCQ: Deterministic + Misconception Tag     │
│ • Numerical: Magnitude + Unit Tolerance      │
│ • Short Answer: Multi-Criterion Rubric Check │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
[Results Reporting, Mastery Updates, & Historical Review API]
```

---

## 2. Multi-Format Question Architecture

| Question Type | Format & Schema | Validation & Verification Requirements | Grading Method |
| :--- | :--- | :--- | :--- |
| **Multiple Choice (MCQ)** | 4 distinct options with pedagogical distractors. | **Rule:** Exactly 1 option must have `is_correct=true`. Options must be non-empty and pairwise distinct. | Deterministic option matching. Incorrect choices map to diagnostic `misconception_explanation`. |
| **Numerical** | Value, required measurement unit, calculation formula, and tolerance. | **Rule:** Calculation formula is parsed via Python AST arithmetic evaluator and verified against `numerical_value` within `numerical_tolerance`. | Deterministic numerical extraction. Full credit (1.0) if value and unit match; partial credit (0.5) if magnitude is correct but unit is omitted/wrong. |
| **Short Answer** | Open prompt with explicit multi-criterion rubric and expected answer string. | **Rule:** Must specify explicit grading rubric with distinct required criteria. Prompt must be grounded in source chunk. | Rubric criteria matching with stopword filtering. Full credit (1.0) for $\ge 75\%$ criteria coverage; partial credit (0.5) for $40\%-74\%$. |

---

## 3. Independent Verification Engine (`QuizQuestionVerifier`)

Implemented in [`app/quiz/verifier.py`](file:///c:/Users/DELL/OneDrive/Desktop/ai%20study%20planner/course-campass-iit-mandi-/backend/app/quiz/verifier.py).

Every candidate question passes through an automated verification suite before it can be saved or presented to a student:

### 1. Exactly One Correct MCQ Option & Ambiguity Check
```python
correct_opts = [opt for opt in question.options if opt.is_correct]
if len(correct_opts) != 1:
    failure_reasons.append("Ambiguous or invalid MCQ: must contain exactly one correct answer.")
```
Rejects:
- Ambiguous questions with 2 or more correct options.
- Malformed questions with 0 correct options.
- Questions where distractors share identical or near-identical text.

### 2. Numerical Calculation & Unit Verification
Evaluates arithmetic expressions safely using Python's `ast` module (without executing `eval()`):
```python
def safe_eval_arithmetic(expr_str: str) -> Optional[float]:
    # AST parsing supporting BinOp, Constant, Add, Sub, Mult, Div, Pow
```
Rejects questions where the claimed `numerical_value` does not equal the arithmetic result of `calculation_formula` within `numerical_tolerance`.

### 3. Duplicate Detection via SHA-256 Fingerprinting
```python
fingerprint = hashlib.sha256(f"{concept_id}:{question_type}:{normalized_prompt}".encode()).hexdigest()
if fingerprint in existing_fingerprints and not allow_revision:
    failure_reasons.append("Duplicate question detected.")
```
Prevents repetitive questions while permitting intentional spaced-repetition revision when `allow_revision=True`.

### 4. Course Evidence Grounding Verification
Verifies that `cited_chunk_id` exists in the retrieved evidence set and that the prompt shares significant keyword overlap ($\ge 20\%$) with the cited chunk text.

---

## 4. Grading Engine & Diagnostic Feedback (`QuizGradingService`)

Implemented in [`app/quiz/grading.py`](file:///c:/Users/DELL/OneDrive/Desktop/ai%20study%20planner/course-campass-iit-mandi-/backend/app/quiz/grading.py).

### Feedback Data Contract (`AnswerFeedbackOut`)
Each graded response returns:
* `question_id`: Unique question identifier.
* `is_correct`: Boolean pass status.
* `score`: Floating-point credit ($1.0$, $0.5$, or $0.0$).
* `user_answer`: Normalized text of the learner's submission.
* `correct_answer`: Canonical solution string.
* `explanation`: Pedagogical explanation grounded in course materials.
* `citation`: Full source reference with `locationLabel`, `excerpt`, and `contextSnippet`.
* `hint`: Supportive guidance for revision.
* `misconception_explanation`: Diagnostic analysis of why a particular incorrect answer was chosen.
* `recommended_activity`: Actionable next step (e.g. *"Review Lecture 08 at 14:32"*).
* `grading_method`: Tag indicating `"deterministic"` or `"rubric_deterministic"`.

---

## 5. Security & Tenant Isolation

1. **Course Authorization Barrier:**
   Every API endpoint (`/courses/{course_id}/quizzes/generate`, `/quizzes/{quiz_id}`, `/quizzes/{quiz_id}/submit`, `/quizzes/{quiz_id}/attempts/{attempt_id}`) validates that the authenticated student owns or is authorized for the course via `RetrievalService.verify_course_access`.
2. **Pre-Submission Answer Protection:**
   Answer keys and `is_correct` flags are never trusted from client submissions. Server-side grading always queries the verified database records directly.
3. **Database Migration:**
   Alembic migration [`0003_adaptive_quiz_and_assessment.py`](file:///c:/Users/DELL/OneDrive/Desktop/ai%20study%20planner/course-campass-iit-mandi-/backend/alembic/versions/0003_adaptive_quiz_and_assessment.py) adds multi-format columns (`expected_answer`, `numerical_value`, `numerical_tolerance`, `numerical_unit`, `rubric`, `hint`, `fingerprint`, `verification_status`) and indexes to PostgreSQL.

---

## 6. API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/courses/{course_id}/quizzes/diagnostic` | Retrieve pre-seeded diagnostic assessment. |
| `POST` | `/api/v1/courses/{course_id}/quizzes/generate` | Generate adaptive quiz targeting weak concepts with verified questions. |
| `GET` | `/api/v1/quizzes/{quiz_id}` | Retrieve quiz questions for exam or practice. |
| `POST` | `/api/v1/quizzes/{quiz_id}/submit` | Submit answers for deterministic grading, feedback, and mastery updates. |
| `GET` | `/api/v1/quizzes/{quiz_id}/attempts/{attempt_id}` | Review historical attempt results with individual answer feedback. |

---

## 7. Automated Test Suite Benchmark

The test suite in [`tests/test_adaptive_quiz_engine.py`](file:///c:/Users/DELL/OneDrive/Desktop/ai%20study%20planner/course-campass-iit-mandi-/backend/tests/test_adaptive_quiz_engine.py) verifies all required assessment scenarios against the reference demo course (`CS 204: Algorithms & Data Structures`):

| Test Case | Scenario Tested | Outcome & Verification | Status |
| :---: | :--- | :--- | :---: |
| **`test_01`** | **Ambiguous MCQs** | Rejects 2-correct, 0-correct, and duplicate option questions | **PASSED** |
| **`test_02`** | **Numerical Calculation Errors** | Catches mismatch between formula ($65536/64=1024$) and claimed value ($512$) | **PASSED** |
| **`test_03`** | **Unsupported Questions** | Rejects invalid citation IDs and ungrounded off-topic prompts | **PASSED** |
| **`test_04`** | **Duplicate Detection** | Fingerprint hashing rejects duplicates; allows intentional revision | **PASSED** |
| **`test_05`** | **Partial Credit Grading** | Awards 0.5 for numerical without unit and partial rubric coverage | **PASSED** |
| **`test_06`** | **Missing Citations** | Questions without course citations are rejected | **PASSED** |
| **`test_07`** | **Tenant Authorization** | Unauthorized quiz generation, fetching, and submission return `403 Forbidden` | **PASSED** |
| **`test_08`** | **End-to-End Generation & Submit** | Generates MCQ, Numerical, Short Answer; grades 100%; updates mastery | **PASSED** |
| **`test_09`** | **Results Review API** | Previous attempt history persists and returns full feedback breakdown | **PASSED** |

**Backend Test Suite Pass Rate:** **50 / 50 tests passing (100% pass rate)** across security, ingestion, knowledge base, grounded tutoring, and adaptive assessment.
