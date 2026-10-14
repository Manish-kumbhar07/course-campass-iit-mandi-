import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker

from app.core.database import get_db
from app.main import app
from app.services.seed_service import seed_demo_course


@pytest_asyncio.fixture
async def seeded_client(test_engine):
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


@pytest.mark.asyncio
async def test_01_demo_login_and_token_acquisition(seeded_client):
    """Test 1: Demo login retrieves pre-seeded session for Ananya Sharma with valid JWT."""
    client, _ = seeded_client

    response = await client.post("/api/v1/auth/demo-login")
    assert response.status_code == 200
    data = response.json()

    assert "token" in data
    assert data["user"]["id"] == "usr-ananya-sharma"
    assert data["user"]["email"] == "ananya.sharma@collegemail.edu"
    assert data["user"]["name"] == "Ananya Sharma"


@pytest.mark.asyncio
async def test_02_concept_graph_dag_retrieval(seeded_client):
    """Test 2: Concept graph retrieves all 8 concepts with DAG prerequisites and citations."""
    client, _ = seeded_client

    login_res = await client.post("/api/v1/auth/demo-login")
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = await client.get("/api/v1/courses/course-cs204/concepts", headers=headers)
    assert response.status_code == 200
    concepts = response.json()

    assert len(concepts) == 8
    concept_map = {c["id"]: c for c in concepts}

    # Verify c-base-cases has prerequisite c-stack-mechanics
    assert "c-base-cases" in concept_map
    base_case = concept_map["c-base-cases"]
    assert "c-stack-mechanics" in base_case["prerequisiteIds"]
    assert len(base_case["citations"]) >= 1

    citation = base_case["citations"][0]
    assert "locationLabel" in citation
    assert "excerpt" in citation
    assert citation["verificationConfidence"] == "verified"


@pytest.mark.asyncio
async def test_03_tutor_grounded_answer_with_citations(seeded_client):
    """Test 3: Grounded tutor returns supported answer with citations for syllabus questions."""
    client, _ = seeded_client

    login_res = await client.post("/api/v1/auth/demo-login")
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    chat_payload = {
        "text": "Why does infinite recursion cause a stack overflow in DFS?",
        "explanationLevel": "rigorous",
        "conceptId": "c-base-cases"
    }

    response = await client.post(
        "/api/v1/courses/course-cs204/tutor/chat",
        json=chat_payload,
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()

    assert data["sender"] == "tutor"
    assert data["answerState"] == "supported"
    assert len(data["citations"]) >= 1
    assert data["unsupportedWarning"] is None

    # Verify citation fields
    cite = data["citations"][0]
    assert "sourceTitle" in cite
    assert "locationLabel" in cite
    assert "excerpt" in cite
    assert cite["verificationConfidence"] == "verified"


@pytest.mark.asyncio
async def test_04_tutor_negative_boundary_control(seeded_client):
    """Test 4: Out-of-bounds question returns not_found state and syllabus boundary warning."""
    client, _ = seeded_client

    login_res = await client.post("/api/v1/auth/demo-login")
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    out_of_bounds_payload = {
        "text": "How do Red-Black tree rotations work?",
        "explanationLevel": "rigorous",
        "conceptId": None
    }

    response = await client.post(
        "/api/v1/courses/course-cs204/tutor/chat",
        json=out_of_bounds_payload,
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()

    assert data["sender"] == "tutor"
    assert data["answerState"] == "not_found"
    assert data["citations"] == []
    assert data["unsupportedWarning"] is not None
    assert "outside" in data["unsupportedWarning"].lower() or "boundaries" in data["unsupportedWarning"].lower()


@pytest.mark.asyncio
async def test_05_diagnostic_quiz_and_submission(seeded_client):
    """Test 5: Retrieve diagnostic questions, submit answers, and evaluate mastery gain."""
    client, _ = seeded_client

    login_res = await client.post("/api/v1/auth/demo-login")
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Fetch diagnostic questions
    q_res = await client.get("/api/v1/courses/course-cs204/quizzes/diagnostic", headers=headers)
    assert q_res.status_code == 200
    questions = q_res.json()
    assert len(questions) >= 1

    question = questions[0]
    assert question["id"] == "q-dfs-cycle-1"
    assert len(question["options"]) == 4

    # 2. Submit correct answer (opt-2: GRAY state)
    submission_payload = {
        "answers": [
            {"questionId": "q-dfs-cycle-1", "selectedOptionId": "opt-2"}
        ]
    }

    submit_res = await client.post(
        "/api/v1/quizzes/quiz-cs204-diag/submit",
        json=submission_payload,
        headers=headers
    )
    assert submit_res.status_code == 200
    sub_data = submit_res.json()

    assert sub_data["scorePercent"] == 100
    assert sub_data["correctCount"] == 1
    assert sub_data["masteryGainPercent"] > 0
    assert len(sub_data["weakConceptsIdentified"]) == 0


@pytest.mark.asyncio
async def test_06_mastery_and_study_plan_recommendations(seeded_client):
    """Test 6: Retrieve topic mastery breakdown and dynamic Study Next recommendations."""
    client, _ = seeded_client

    login_res = await client.post("/api/v1/auth/demo-login")
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Topic Mastery
    mastery_res = await client.get("/api/v1/courses/course-cs204/mastery", headers=headers)
    assert mastery_res.status_code == 200
    mastery_list = mastery_res.json()
    assert len(mastery_list) >= 1

    topic = mastery_list[0]
    assert "topicId" in topic
    assert "topicTitle" in topic
    assert "masteryPercent" in topic
    assert "conceptsTotal" in topic

    # 2. Study Plan
    plan_res = await client.get("/api/v1/courses/course-cs204/study-plan", headers=headers)
    assert plan_res.status_code == 200
    plan_days = plan_res.json()
    assert len(plan_days) >= 1

    day = plan_days[0]
    assert day["dayNumber"] == 1
    assert day["focusConceptId"] == "c-base-cases"
    assert len(day["tasks"]) >= 2
