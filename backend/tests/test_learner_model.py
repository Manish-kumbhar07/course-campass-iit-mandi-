"""
Learner Model & Mastery Engine Test Suite

Validates:
1. Deterministic mastery algorithm with repeated correct answers (bounds, consistency bonus)
2. Repeated incorrect answers and mastery floor (clamping at 0, attention status)
3. Partial credit handling and damping on sparse attempts
4. Time decay penalty for inactive concepts
5. Full mastery recalculation from attempt history (grading corrections)
6. Prerequisite gap detection across concept DAG
7. Misconception classification and frequency-weighted confidence
8. End-to-end APIs: concept mastery details, diagnostic summary, study-next recommendations
9. Dynamic study-plan generation with time budget and overflow handling
"""
from datetime import datetime, timezone, timedelta
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker

from app.core.database import get_db
from app.main import app
from app.services.seed_service import seed_demo_course
from app.learner.mastery_engine import MasteryAlgorithmV1, MasteryWeights
from app.learner.misconception_classifier import (
    DeterministicMisconceptionClassifier,
    get_misconception_classifier,
)
from app.learner.recommendation import RecommendationService
from app.learner.study_plan_service import StudyPlanGenerator


@pytest_asyncio.fixture
async def learner_client(test_engine):
    session_factory = async_sessionmaker(test_engine, expire_on_commit=False)

    async def override_db():
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_db

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


@pytest.mark.asyncio
async def test_01_repeated_correct_answers_and_consistency_bonus():
    """Test 1: Repeated correct answers steadily increase mastery, trigger consistency bonus, and clamp at 100."""
    engine = MasteryAlgorithmV1()
    now = datetime.now(timezone.utc)
    
    mastery = 30
    streak_correct = 0
    
    # 1st correct answer (sparse damping: 0.6 * 15 = 9)
    mastery, status = engine.calculate_update(
        current_mastery=mastery,
        score=1.0,
        is_correct=True,
        streak_correct=streak_correct,
        streak_incorrect=0,
        total_attempts=0,
        now=now,
    )
    assert mastery == 39
    assert status == "attention"
    streak_correct += 1

    # 2nd correct answer (sparse damping: 0.6 * 15 = 9)
    mastery, status = engine.calculate_update(
        current_mastery=mastery,
        score=1.0,
        is_correct=True,
        streak_correct=streak_correct,
        streak_incorrect=0,
        total_attempts=1,
        now=now,
    )
    assert mastery == 48
    assert status == "learning"
    streak_correct += 1

    # 3rd correct answer (normal gain 15 + consistency bonus 5 = 20)
    mastery, status = engine.calculate_update(
        current_mastery=mastery,
        score=1.0,
        is_correct=True,
        streak_correct=streak_correct,
        streak_incorrect=0,
        total_attempts=2,
        now=now,
    )
    assert mastery == 68
    assert status == "learning"
    streak_correct += 1

    # 4th correct answer (15 + 5 = 20 -> 88 -> mastered)
    mastery, status = engine.calculate_update(
        current_mastery=mastery,
        score=1.0,
        is_correct=True,
        streak_correct=streak_correct,
        streak_incorrect=0,
        total_attempts=3,
        now=now,
    )
    assert mastery == 88
    assert status == "mastered"
    streak_correct += 1

    # 5th correct answer (clamps at 100)
    mastery, status = engine.calculate_update(
        current_mastery=mastery,
        score=1.0,
        is_correct=True,
        streak_correct=streak_correct,
        streak_incorrect=0,
        total_attempts=4,
        now=now,
    )
    assert mastery == 100
    assert status == "mastered"


@pytest.mark.asyncio
async def test_02_repeated_mistakes_and_mastery_floor():
    """Test 2: Repeated incorrect answers decrease mastery and strictly floor at 0."""
    engine = MasteryAlgorithmV1()
    now = datetime.now(timezone.utc)
    
    mastery = 15
    # 1st mistake (sparse: -8 * 0.6 = -4.8 -> round to 10)
    mastery, status = engine.calculate_update(
        current_mastery=mastery,
        score=0.0,
        is_correct=False,
        streak_correct=0,
        streak_incorrect=0,
        total_attempts=0,
        now=now,
    )
    assert mastery == 10
    assert status == "attention"

    # Repeated mistakes drive score down to floor 0
    for i in range(1, 5):
        mastery, status = engine.calculate_update(
            current_mastery=mastery,
            score=0.0,
            is_correct=False,
            streak_correct=0,
            streak_incorrect=i,
            total_attempts=i,
            now=now,
        )

    assert mastery == 0
    assert status == "attention"


@pytest.mark.asyncio
async def test_03_partial_credit_and_sparse_damping():
    """Test 3: Partial credit awards moderate gain, damped when sparse."""
    engine = MasteryAlgorithmV1()
    now = datetime.now(timezone.utc)
    
    # Sparse attempt with partial credit (0.5 score): 7 * 0.6 = 4.2 -> 50 + 4 = 54
    mastery, status = engine.calculate_update(
        current_mastery=50,
        score=0.5,
        is_correct=False,
        streak_correct=0,
        streak_incorrect=0,
        total_attempts=1,
        now=now,
    )
    assert mastery == 54
    assert status == "learning"

    # Non-sparse attempt with partial credit: 7.0 gain -> 54 + 7 = 61
    mastery, status = engine.calculate_update(
        current_mastery=mastery,
        score=0.5,
        is_correct=False,
        streak_correct=0,
        streak_incorrect=0,
        total_attempts=5,
        now=now,
    )
    assert mastery == 61
    assert status == "learning"


@pytest.mark.asyncio
async def test_04_time_decay_on_inactivity():
    """Test 4: Inactivity past one week applies decay capped at maximum."""
    engine = MasteryAlgorithmV1()
    now = datetime.now(timezone.utc)
    
    # Last attempted 3 weeks ago: decay = 2.0 * 3.0 = 6.0
    three_weeks_ago = now - timedelta(days=21)
    mastery, _ = engine.calculate_update(
        current_mastery=70,
        score=0.9,
        is_correct=True,
        streak_correct=0,
        streak_incorrect=0,
        total_attempts=5,
        last_attempt_at=three_weeks_ago,
        now=now,
    )
    # 70 - 6 (decay) + 15 (correct) = 79
    assert mastery == 79


@pytest.mark.asyncio
async def test_05_recalculate_mastery_from_history():
    """Test 5: Full history recomputation matches sequence and safely handles corrections."""
    engine = MasteryAlgorithmV1()
    base_time = datetime(2026, 10, 1, 10, 0, 0, tzinfo=timezone.utc)
    
    # 3 attempts: correct, correct, correct
    attempts = [
        {"score": 1.0, "is_correct": True, "answered_at": base_time},
        {"score": 1.0, "is_correct": True, "answered_at": base_time + timedelta(hours=1)},
        {"score": 1.0, "is_correct": True, "answered_at": base_time + timedelta(hours=2)},
    ]
    
    mastery, status, sc, si = engine.recalculate_from_history(attempts, initial_mastery=20)
    # 20 + 9 (sparse) + 9 (sparse) + 20 (normal + streak) = 58
    assert mastery == 58
    assert status == "learning"
    assert sc == 3
    assert si == 0

    # If first answer is corrected to incorrect
    corrected_attempts = [
        {"score": 0.0, "is_correct": False, "answered_at": base_time},
        {"score": 1.0, "is_correct": True, "answered_at": base_time + timedelta(hours=1)},
        {"score": 1.0, "is_correct": True, "answered_at": base_time + timedelta(hours=2)},
    ]
    corr_mastery, corr_status, c_sc, c_si = engine.recalculate_from_history(corrected_attempts, initial_mastery=20)
    assert corr_mastery < mastery
    assert c_sc == 2


@pytest.mark.asyncio
async def test_06_prerequisite_gap_detection():
    """Test 6: Prerequisite gaps are prioritized based on dependency count and mastery gap."""
    concepts = [
        {"id": "c-prereq-1", "name": "Prerequisite Concept", "mastery_percent": 25, "status": "attention"},
        {"id": "c-dep-1", "name": "Dependent One", "mastery_percent": 50, "status": "learning"},
        {"id": "c-dep-2", "name": "Dependent Two", "mastery_percent": 60, "status": "learning"},
        {"id": "c-isolated", "name": "Isolated Concept", "mastery_percent": 30, "status": "attention"},
    ]
    relationships = [
        {"source_concept_id": "c-prereq-1", "target_concept_id": "c-dep-1", "relationship_type": "prerequisite"},
        {"source_concept_id": "c-prereq-1", "target_concept_id": "c-dep-2", "relationship_type": "prerequisite"},
    ]

    gaps = RecommendationService.find_prerequisite_gaps(concepts, relationships, mastery_threshold=40)
    assert len(gaps) == 1
    assert gaps[0].concept_id == "c-prereq-1"
    # priority = 2 dependents * (40 - 25) = 30.0
    assert gaps[0].priority_score == 30.0
    assert "c-dep-1" in gaps[0].required_by
    assert "c-dep-2" in gaps[0].required_by


@pytest.mark.asyncio
async def test_07_misconception_classification():
    """Test 7: Misconception classifier normalizes tags and weights confidence by frequency."""
    classifier = DeterministicMisconceptionClassifier()
    tags = [
        "Confusing stack frame with heap",
        "confusing stack frame with heap",
        "Omitting base case",
    ]
    attempt_ids = ["att-1", "att-2", "att-3"]

    reports = classifier.classify("c-stack-mechanics", "Call Stack Mechanics", tags, attempt_ids)
    assert len(reports) == 2
    
    # Top report should be the duplicate normalized tag
    top = reports[0]
    assert "confusing stack frame with heap" in top.misconception_tag
    assert top.frequency == 2
    assert top.classifier_confidence > reports[1].classifier_confidence
    assert len(top.supporting_evidence) == 2


@pytest.mark.asyncio
async def test_08_end_to_end_mastery_details_and_diagnostic_api(learner_client):
    """Test 8: API endpoints return detailed per-concept metrics and diagnostic summary."""
    client, _ = learner_client
    
    login_res = await client.post("/api/v1/auth/demo-login")
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Concept mastery details
    det_res = await client.get("/api/v1/courses/course-cs204/mastery/details", headers=headers)
    assert det_res.status_code == 200
    details = det_res.json()
    assert len(details) == 8
    first = details[0]
    assert "conceptId" in first
    assert "conceptName" in first
    assert "masteryPercent" in first
    assert "streakCorrect" in first
    assert first["algorithmVersion"] == "v1"

    # 2. Diagnostic summary
    diag_res = await client.get("/api/v1/courses/course-cs204/diagnostic", headers=headers)
    assert diag_res.status_code == 200
    diag = diag_res.json()
    assert diag["courseId"] == "course-cs204"
    assert diag["conceptsTotal"] == 8
    assert "prerequisiteGaps" in diag
    assert "weakestConceptId" in diag


@pytest.mark.asyncio
async def test_09_study_recommendations_and_time_bounded_plan(learner_client):
    """Test 9: Study plan generates within time budget and properly flags overflow concepts."""
    client, _ = learner_client
    
    login_res = await client.post("/api/v1/auth/demo-login")
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Study recommendations with 30-minute budget
    rec_res = await client.get("/api/v1/courses/course-cs204/recommendations?available_minutes=30", headers=headers)
    assert rec_res.status_code == 200
    recs = rec_res.json()
    assert len(recs) >= 1
    total_time = sum(r["estimatedMinutes"] for r in recs)
    assert total_time <= 30
    assert recs[0]["priorityRank"] == 1
    assert "reason" in recs[0]

    # 2. Dynamic multi-day plan generation
    plan_res = await client.post("/api/v1/courses/course-cs204/study-plan/generate", headers=headers)
    assert plan_res.status_code == 200
    plan = plan_res.json()
    assert plan["totalMinutesAllocated"] <= plan["totalMinutesAvailable"]
    assert len(plan["recommendations"]) > 0
    assert plan["algorithmVersion"] == "v1"

