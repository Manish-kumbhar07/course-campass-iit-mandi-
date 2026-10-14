"""
Automated Evaluation Suite for CourseCompass Adaptive Assessment Engine
Covers:
1. Ambiguous MCQs (multiple correct options, no correct options, duplicate distractors).
2. Incorrect numerical calculations (arithmetic formula mismatch with numerical_value).
3. Unsupported questions (missing citations, ungrounded prompts).
4. Duplicate question detection via SHA-256 fingerprinting and revision bypass.
5. Partially correct numerical (missing unit) and short-answer (partial rubric) grading.
6. Missing citation rejection.
7. Unauthorized quiz generation and attempt submission prevention (tenant isolation).
8. End-to-end adaptive quiz generation, multi-format submission, and mastery updates.
9. Secure attempt persistence and historical review API.
"""
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker

from app.core.database import get_db
from app.main import app
from app.models.course import Course
from app.models.quiz import Quiz, QuizOption, QuizQuestion
from app.models.user import User
from app.quiz.grading import QuizGradingService
from app.quiz.schemas import RawGeneratedMCQOption, RawGeneratedQuestion
from app.quiz.verifier import QuizQuestionVerifier
from app.rag.retrieval import RetrievalResult
from app.schemas.quiz import QuizAnswerSubmission
from app.services.seed_service import seed_demo_course


@pytest_asyncio.fixture
async def assessment_client(test_engine):
    session_factory = async_sessionmaker(test_engine, expire_on_commit=False)

    async def override_db():
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_db

    # Seed demo data in the test database
    async with session_factory() as session:
        await seed_demo_course(session)

    from app.core.rate_limit import LocalRateLimiter
    app.state.rate_limiter = LocalRateLimiter()

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://testserver"
    ) as client:
        yield client, session_factory

    app.dependency_overrides.clear()


@pytest.fixture
def mock_retrieved_evidence():
    return [
        RetrievalResult(
            chunk_id="chunk-test-rec-1",
            document_id="doc-1",
            document_title="Algorithms Textbook",
            document_type="pdf",
            course_id="course-cs204",
            location_label="Chapter 4, Page 112",
            page_number=112,
            slide_number=None,
            timestamp_seconds=None,
            content="Every recursive function must contain a base case to halt recursion. Without base cases, activation records overflow stack memory.",
            score=0.92,
            dense_score=0.92,
            keyword_score=0.92
        )
    ]


def test_01_ambiguous_mcq_rejection(mock_retrieved_evidence):
    """Test 1: Verifier rejects ambiguous MCQs with multiple correct options, zero correct options, or duplicate choices."""
    # Case A: 2 correct options
    q_two_correct = RawGeneratedQuestion(
        prompt="Which condition halts recursion?",
        question_type="multiple_choice",
        difficulty="Foundational",
        options=[
            RawGeneratedMCQOption(id="o1", text="Base case reached", is_correct=True),
            RawGeneratedMCQOption(id="o2", text="Halting state satisfied", is_correct=True),
            RawGeneratedMCQOption(id="o3", text="Heap overflow", is_correct=False),
        ],
        explanation="Base cases stop recursion.",
        hint="Halting state.",
        cited_chunk_id="chunk-test-rec-1",
        concept_id="c-base-cases"
    )
    rep_a = QuizQuestionVerifier.verify(q_two_correct, mock_retrieved_evidence)
    assert rep_a.is_valid is False
    assert rep_a.ambiguity_detected is True
    assert any("must contain exactly one correct answer" in r for r in rep_a.failure_reasons)

    # Case B: 0 correct options
    q_no_correct = RawGeneratedQuestion(
        prompt="Which condition halts recursion?",
        question_type="multiple_choice",
        difficulty="Foundational",
        options=[
            RawGeneratedMCQOption(id="o1", text="Option A", is_correct=False),
            RawGeneratedMCQOption(id="o2", text="Option B", is_correct=False),
            RawGeneratedMCQOption(id="o3", text="Option C", is_correct=False),
        ],
        explanation="Base cases stop recursion.",
        hint="Halting state.",
        cited_chunk_id="chunk-test-rec-1",
        concept_id="c-base-cases"
    )
    rep_b = QuizQuestionVerifier.verify(q_no_correct, mock_retrieved_evidence)
    assert rep_b.is_valid is False
    assert rep_b.ambiguity_detected is True

    # Case C: Duplicate option text
    q_dup_options = RawGeneratedQuestion(
        prompt="Which condition halts recursion?",
        question_type="multiple_choice",
        difficulty="Foundational",
        options=[
            RawGeneratedMCQOption(id="o1", text="Base case reached", is_correct=True),
            RawGeneratedMCQOption(id="o2", text="Heap memory expands", is_correct=False),
            RawGeneratedMCQOption(id="o3", text="Heap memory expands", is_correct=False),
        ],
        explanation="Base cases stop recursion.",
        hint="Halting state.",
        cited_chunk_id="chunk-test-rec-1",
        concept_id="c-base-cases"
    )
    rep_c = QuizQuestionVerifier.verify(q_dup_options, mock_retrieved_evidence)
    assert rep_c.is_valid is False
    assert rep_c.ambiguity_detected is True
    assert any("Duplicate distractor option text" in r for r in rep_c.failure_reasons)


def test_02_incorrect_numerical_calculation_rejection(mock_retrieved_evidence):
    """Test 2: Verifier detects arithmetic discrepancies between formula and numerical_value."""
    # Formula is 65536 / 64 = 1024, but numerical_value is set to 512
    q_bad_num = RawGeneratedQuestion(
        prompt="Calculate maximum frame allocation.",
        question_type="numerical",
        difficulty="Intermediate",
        numerical_value=512.0,  # Incorrect!
        numerical_unit="frames",
        numerical_tolerance=0.01,
        calculation_formula="65536 / 64",
        explanation="65536 / 64 = 1024 frames.",
        hint="Divide total memory by frame size.",
        cited_chunk_id="chunk-test-rec-1",
        concept_id="c-base-cases"
    )
    report = QuizQuestionVerifier.verify(q_bad_num, mock_retrieved_evidence)
    assert report.is_valid is False
    assert report.numerical_verified is False
    assert any("Numerical calculation discrepancy" in r for r in report.failure_reasons)


def test_03_unsupported_question_rejection(mock_retrieved_evidence):
    """Test 3: Verifier rejects questions whose citations or prompts are unsupported by course chunks."""
    # Invalid chunk ID
    q_unsupported_id = RawGeneratedQuestion(
        prompt="Explain quantum annealing states.",
        question_type="short_answer",
        difficulty="Advanced",
        expected_answer="Quantum flux qubits.",
        explanation="Quantum annealing resolves optimization.",
        hint="Qubits.",
        cited_chunk_id="chunk-non-existent-999",  # Not in evidence!
        concept_id="c-base-cases"
    )
    report_id = QuizQuestionVerifier.verify(q_unsupported_id, mock_retrieved_evidence)
    assert report_id.is_valid is False
    assert any("Missing or invalid course citation" in r for r in report_id.failure_reasons)

    # Prompt with zero keyword overlap in cited chunk
    q_ungrounded_content = RawGeneratedQuestion(
        prompt="Explain aerodynamic lift and drag coefficients in hypersonic atmospheric re-entry vehicles.",
        question_type="short_answer",
        difficulty="Advanced",
        expected_answer="Lift over drag ratio.",
        explanation="Aerodynamics formulas.",
        hint="Fluid mechanics.",
        cited_chunk_id="chunk-test-rec-1",  # Chunk is about recursion!
        concept_id="c-base-cases"
    )
    report_content = QuizQuestionVerifier.verify(q_ungrounded_content, mock_retrieved_evidence)
    assert report_content.is_valid is False
    assert any("insufficiently grounded" in r for r in report_content.failure_reasons)


def test_04_duplicate_question_fingerprint_rejection(mock_retrieved_evidence):
    """Test 4: Fingerprint detection rejects duplicate questions unless allow_revision is explicit."""
    q_original = RawGeneratedQuestion(
        prompt="Under what condition does recursion stop in call stack execution?",
        question_type="multiple_choice",
        difficulty="Foundational",
        options=[
            RawGeneratedMCQOption(id="o1", text="Base case reached", is_correct=True),
            RawGeneratedMCQOption(id="o2", text="Infinite loop", is_correct=False),
            RawGeneratedMCQOption(id="o3", text="Heap overflow", is_correct=False),
        ],
        explanation="Base cases stop recursion.",
        hint="Look for halting states.",
        cited_chunk_id="chunk-test-rec-1",
        concept_id="c-base-cases"
    )
    rep_orig = QuizQuestionVerifier.verify(q_original, mock_retrieved_evidence)
    assert rep_orig.is_valid is True

    existing_fps = {rep_orig.fingerprint}

    # Near-identical prompt with extra spaces, punctuation, different casing
    q_duplicate = RawGeneratedQuestion(
        prompt="  Under what condition does recursion stop in call stack execution?  ",
        question_type="multiple_choice",
        difficulty="Foundational",
        options=q_original.options,
        explanation=q_original.explanation,
        hint=q_original.hint,
        cited_chunk_id="chunk-test-rec-1",
        concept_id="c-base-cases"
    )

    # Should be rejected when allow_revision=False
    rep_dup = QuizQuestionVerifier.verify(q_duplicate, mock_retrieved_evidence, existing_fingerprints=existing_fps, allow_revision=False)
    assert rep_dup.is_valid is False
    assert any("Duplicate question detected" in r for r in rep_dup.failure_reasons)

    # Should be allowed when allow_revision=True
    rep_rev = QuizQuestionVerifier.verify(q_duplicate, mock_retrieved_evidence, existing_fingerprints=existing_fps, allow_revision=True)
    assert rep_rev.is_valid is True


def test_05_partially_correct_numerical_and_short_answer_grading():
    """Test 5: Partial credit is awarded for correct numerical magnitude with omitted unit and partial rubric coverage."""
    # 1. Numerical test
    db_num_q = QuizQuestion(
        id="q-num-test",
        quiz_id="quiz-1",
        concept_id="c-stack-mechanics",
        prompt="Calculate stack frames.",
        question_type="numerical",
        difficulty="Intermediate",
        explanation="65536 / 64 = 1024 frames.",
        numerical_value=1024.0,
        numerical_unit="frames",
        numerical_tolerance=0.01,
        hint="Divide total bytes by frame size."
    )

    # Student submits 1024 without 'frames'
    sub_num = QuizAnswerSubmission(question_id="q-num-test", submitted_text="1024")
    res_num = QuizGradingService.grade_question(db_num_q, [], sub_num)
    assert res_num.is_correct is False
    assert res_num.score == 0.5  # Partial credit!
    assert "missing or incorrect unit" in res_num.explanation
    assert res_num.misconception_explanation is not None

    # Student submits 1024 frames (full credit)
    sub_num_full = QuizAnswerSubmission(question_id="q-num-test", submitted_text="1024 frames")
    res_num_full = QuizGradingService.grade_question(db_num_q, [], sub_num_full)
    assert res_num_full.is_correct is True
    assert res_num_full.score == 1.0

    # 2. Short answer test
    db_sa_q = QuizQuestion(
        id="q-sa-test",
        quiz_id="quiz-1",
        concept_id="c-base-cases",
        prompt="Explain base case mechanics.",
        question_type="short_answer",
        difficulty="Intermediate",
        explanation="Base cases halt recursion and unwind stack frames.",
        rubric="1. Execution halts recursive descent; 2. Activation records unwind and pop off the stack.",
        expected_answer="Execution halts and stack frames unwind.",
        hint="Describe termination and memory."
    )

    # Student addresses only 1 criterion: halting
    sub_sa_partial = QuizAnswerSubmission(
        question_id="q-sa-test",
        submitted_text="The base case ensures that the function halts execution."
    )
    res_sa = QuizGradingService.grade_question(db_sa_q, [], sub_sa_partial)
    assert res_sa.is_correct is False
    assert res_sa.score == 0.5  # Partial credit!
    assert "Partially correct" in res_sa.explanation

    # Student addresses both criteria (full credit)
    sub_sa_full = QuizAnswerSubmission(
        question_id="q-sa-test",
        submitted_text="Execution halts recursive descent, and active stack frames unwind and pop off the call stack."
    )
    res_sa_full = QuizGradingService.grade_question(db_sa_q, [], sub_sa_full)
    assert res_sa_full.is_correct is True
    assert res_sa_full.score == 1.0


def test_06_missing_citation_rejection(mock_retrieved_evidence):
    """Test 6: Questions with missing citation reference are rejected."""
    q_no_citation = RawGeneratedQuestion(
        prompt="What is a base case?",
        question_type="multiple_choice",
        difficulty="Foundational",
        options=[
            RawGeneratedMCQOption(id="o1", text="Base case", is_correct=True),
            RawGeneratedMCQOption(id="o2", text="Loop", is_correct=False),
            RawGeneratedMCQOption(id="o3", text="Pointer", is_correct=False),
        ],
        explanation="Base case.",
        hint="Base case.",
        cited_chunk_id=None,  # Missing citation!
        concept_id="c-base-cases"
    )
    report = QuizQuestionVerifier.verify(q_no_citation, mock_retrieved_evidence)
    assert report.is_valid is False
    assert any("Missing or invalid course citation" in r for r in report.failure_reasons)


@pytest.mark.asyncio
async def test_07_unauthorized_quiz_attempts_and_generation(assessment_client):
    """Test 7: Course authorization prevents students from generating quizzes or submitting attempts in other courses."""
    client, session_factory = assessment_client

    # Create confidential course for another user
    async with session_factory() as session:
        other_user = User(
            id="usr-other-quiz-owner",
            email="other_quiz@univ.edu",
            full_name="Other Quiz Owner",
            hashed_password="hash",
            is_active=True
        )
        session.add(other_user)
        await session.flush()

        other_course = Course(
            id="course-secret-quiz-c",
            user_id=other_user.id,
            name="Confidential Cryptography Quizzes",
            code="CS 888",
            subject="Computer Science"
        )
        session.add(other_course)
        await session.flush()

        other_quiz = Quiz(
            id="quiz-confidential-c",
            course_id=other_course.id,
            title="Secret Exam",
            difficulty="Advanced"
        )
        session.add(other_quiz)
        await session.commit()

    # Ananya logs in
    login_res = await client.post("/api/v1/auth/demo-login")
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Ananya tries to generate quiz in other course -> 403 Forbidden
    gen_res = await client.post(
        "/api/v1/courses/course-secret-quiz-c/quizzes/generate",
        json={"difficulty": "Intermediate", "count": 2},
        headers=headers
    )
    assert gen_res.status_code == 403

    # 2. Ananya tries to fetch other course quiz -> 403 Forbidden
    get_res = await client.get("/api/v1/quizzes/quiz-confidential-c", headers=headers)
    assert get_res.status_code == 403

    # 3. Ananya tries to submit to other course quiz -> 403 Forbidden
    sub_res = await client.post(
        "/api/v1/quizzes/quiz-confidential-c/submit",
        json={"answers": []},
        headers=headers
    )
    assert sub_res.status_code == 403


@pytest.mark.asyncio
async def test_08_end_to_end_adaptive_quiz_generation_and_submission(assessment_client):
    """Test 8: End-to-end adaptive quiz generation across MCQ, Numerical, Short Answer, submission, and mastery gain."""
    client, _ = assessment_client

    login_res = await client.post("/api/v1/auth/demo-login")
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Generate adaptive quiz
    gen_payload = {
        "conceptIds": ["c-base-cases"],
        "difficulty": "Intermediate",
        "questionTypes": ["multiple_choice", "numerical", "short_answer"],
        "count": 3
    }

    gen_res = await client.post("/api/v1/courses/course-cs204/quizzes/generate", json=gen_payload, headers=headers)
    assert gen_res.status_code == 200
    quiz_data = gen_res.json()

    quiz_id = quiz_data["id"]
    questions = quiz_data["questions"]
    assert len(questions) == 3

    # Verify multi-format question presence
    qtypes = {q["questionType"] for q in questions}
    assert "multiple_choice" in qtypes
    assert "numerical" in qtypes
    assert "short_answer" in qtypes

    # Prepare answers for all 3 questions
    mcq_q = next(q for q in questions if q["questionType"] == "multiple_choice")
    num_q = next(q for q in questions if q["questionType"] == "numerical")
    sa_q = next(q for q in questions if q["questionType"] == "short_answer")

    # Find correct MCQ option
    correct_opt = next(o for o in mcq_q["options"] if o["isCorrect"])

    submission_payload = {
        "answers": [
            {
                "questionId": mcq_q["id"],
                "selectedOptionId": correct_opt["id"]
            },
            {
                "questionId": num_q["id"],
                "submittedText": "1024 frames"
            },
            {
                "questionId": sa_q["id"],
                "submittedText": "Execution halts recursive descent, stack frames begin unwinding and popping off the call stack, and return values are passed back to the caller."
            }
        ]
    }

    # 2. Submit answers
    submit_res = await client.post(
        f"/api/v1/quizzes/{quiz_id}/submit",
        json=submission_payload,
        headers=headers
    )
    assert submit_res.status_code == 200
    sub_data = submit_res.json()

    assert sub_data["scorePercent"] == 100
    assert sub_data["correctCount"] == 3
    assert sub_data["masteryGainPercent"] >= 10
    assert len(sub_data["feedbackList"]) == 3

    # Verify feedback details
    for fb in sub_data["feedbackList"]:
        assert fb["isCorrect"] is True
        assert fb["score"] == 1.0
        assert fb["explanation"] is not None
        assert fb["hint"] is not None
        assert fb["recommendedActivity"] is not None


@pytest.mark.asyncio
async def test_09_attempt_results_reporting_and_review(assessment_client):
    """Test 9: Completed attempts persist securely and can be inspected via review API."""
    client, session_factory = assessment_client

    login_res = await client.post("/api/v1/auth/demo-login")
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Submit diagnostic quiz
    submit_payload = {
        "answers": [
            {"questionId": "q-dfs-cycle-1", "selectedOptionId": "opt-2"}
        ]
    }
    submit_res = await client.post(
        "/api/v1/quizzes/quiz-cs204-diag/submit",
        json=submit_payload,
        headers=headers
    )
    assert submit_res.status_code == 200
    attempt_id = submit_res.json()["attemptId"]

    # Review attempt
    review_res = await client.get(
        f"/api/v1/quizzes/quiz-cs204-diag/attempts/{attempt_id}",
        headers=headers
    )
    assert review_res.status_code == 200
    review_data = review_res.json()

    assert review_data["attemptId"] == attempt_id
    assert review_data["scorePercent"] == 100
    assert len(review_data["feedbackList"]) == 1

    feedback = review_data["feedbackList"][0]
    assert feedback["isCorrect"] is True
    assert feedback["questionId"] == "q-dfs-cycle-1"
    assert "GRAY state" in feedback["userAnswer"]
