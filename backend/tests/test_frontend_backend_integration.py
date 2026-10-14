"""
End-to-End Frontend to FastAPI Integration Test Suite

Simulates the full user journey:
1. Authentication & Session: Demo login as Ananya Sharma (/api/v1/auth/demo-login)
2. Course Ingestion: Direct material upload & processing status polling
3. Course Map & Concepts: Knowledge map retrieval with DAG prerequisite edges
4. Grounded AI Tutor: Socratic chat with verified citations
5. Citation Inspection: Citation proof endpoint verification
6. Adaptive Quiz: Multi-format diagnostic quiz generation & submission
7. Mastery Tracking: Fine-grained concept details, diagnostic summary, and recalculation
8. Study Planning: Time-budgeted multi-day study schedule generation
9. Session Expiry & Access Control: Unauthorized access rejection
"""
import io
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker

from app.core.database import get_db
from app.main import app
from app.services.seed_service import seed_demo_course


@pytest_asyncio.fixture
async def fullstack_client(test_engine):
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
async def test_01_authentication_lifecycle(fullstack_client):
    """Journey Step 1: Demo login retrieves session, user profile, and JWT token."""
    client, _ = fullstack_client

    response = await client.post("/api/v1/auth/demo-login")
    assert response.status_code == 200
    data = response.json()

    assert "token" in data
    assert data["user"]["id"] == "usr-ananya-sharma"
    assert data["user"]["email"] == "ananya.sharma@collegemail.edu"
    assert data["user"]["name"] == "Ananya Sharma"


@pytest.mark.asyncio
async def test_02_course_listing_and_creation(fullstack_client):
    """Journey Step 2: Course listing and creation for student."""
    client, _ = fullstack_client

    login_res = await client.post("/api/v1/auth/demo-login")
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. List pre-seeded course CS 204
    courses_res = await client.get("/api/v1/courses", headers=headers)
    assert courses_res.status_code == 200
    courses = courses_res.json()
    assert len(courses) >= 1
    assert any(c["code"] == "CS 204" for c in courses)

    # 2. Create new course
    new_course_payload = {
        "name": "Advanced Operating Systems",
        "code": "CS 301",
        "subject": "Computer Science",
        "exam_date": "2026-11-15",
        "daily_study_minutes": 60
    }
    create_res = await client.post("/api/v1/courses", json=new_course_payload, headers=headers)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["code"] == "CS 301"
    assert created["name"] == "Advanced Operating Systems"


@pytest.mark.asyncio
async def test_03_material_upload_and_status_polling(fullstack_client):
    """Journey Step 3: Material upload triggers background ingestion and status tracking."""
    client, _ = fullstack_client

    login_res = await client.post("/api/v1/auth/demo-login")
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Upload sample PDF textbook chapter
    file_content = b"%PDF-1.4\n1 0 obj\n<< /Title (CS 204 Recursion Invariants) >>\nendobj\ntrailer\n<<>>\n%%EOF"
    files = {
        "file": ("recursion_foundations.pdf", io.BytesIO(file_content), "application/pdf")
    }
    data = {"title": "Recursion Foundations PDF"}

    upload_res = await client.post(
        "/api/v1/courses/course-cs204/materials",
        files=files,
        data=data,
        headers=headers
    )
    assert upload_res.status_code == 202
    res_data = upload_res.json()
    assert "material" in res_data
    assert "job" in res_data
    job_id = res_data["job"]["id"]

    # Poll status
    status_res = await client.get(f"/api/v1/jobs/{job_id}/status", headers=headers)
    assert status_res.status_code == 200
    job_status = status_res.json()
    assert job_status["id"] == job_id
    assert job_status["totalStages"] == 7


@pytest.mark.asyncio
async def test_04_concept_map_retrieval(fullstack_client):
    """Journey Step 4: Knowledge map provides concepts and prerequisite relationships."""
    client, _ = fullstack_client

    login_res = await client.post("/api/v1/auth/demo-login")
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    map_res = await client.get("/api/v1/courses/course-cs204/map", headers=headers)
    assert map_res.status_code == 200
    map_data = map_res.json()

    assert map_data["totalConcepts"] == 8
    assert len(map_data["concepts"]) == 8
    assert len(map_data["edges"]) >= 7
    # Verify presence of Call Stack Mechanics and Recursion Base Cases
    cnames = [c["name"] for c in map_data["concepts"]]
    assert "Call Stack Mechanics" in cnames
    assert "Recursion Base Cases" in cnames


@pytest.mark.asyncio
async def test_05_grounded_tutor_with_citations(fullstack_client):
    """Journey Step 5: Tutor answers student question with verified citations and grounding."""
    client, _ = fullstack_client

    login_res = await client.post("/api/v1/auth/demo-login")
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    chat_payload = {
        "question": "What is the three-color invariant for directed cycle detection in DFS?",
        "explanation_level": "rigorous"
    }

    chat_res = await client.post("/api/v1/courses/course-cs204/tutor/chat", json=chat_payload, headers=headers)
    assert chat_res.status_code == 200
    tutor_reply = chat_res.json()

    assert tutor_reply["sender"] == "tutor"
    assert tutor_reply["answerState"] in ["supported", "partially_supported"]
    assert len(tutor_reply["citations"]) > 0
    cite = tutor_reply["citations"][0]
    assert "id" in cite
    assert "excerpt" in cite


@pytest.mark.asyncio
async def test_06_citation_inspection_and_proof(fullstack_client):
    """Journey Step 6: Citation inspection modal endpoint returns verified proof."""
    client, _ = fullstack_client

    login_res = await client.post("/api/v1/auth/demo-login")
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    cite_res = await client.get("/api/v1/citations/cite-sld-1", headers=headers)
    assert cite_res.status_code == 200
    citation = cite_res.json()

    assert citation["id"] == "cite-sld-1"
    assert citation["documentId"] == "doc-3"
    assert "Invariant 3" in citation["excerpt"]
    assert citation["verificationConfidence"] == "verified"


@pytest.mark.asyncio
async def test_07_adaptive_quiz_and_submission(fullstack_client):
    """Journey Step 7: Diagnostic quiz submission updates learner mastery."""
    client, _ = fullstack_client

    login_res = await client.post("/api/v1/auth/demo-login")
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch diagnostic questions
    diag_res = await client.get("/api/v1/courses/course-cs204/quizzes/diagnostic", headers=headers)
    assert diag_res.status_code == 200
    questions = diag_res.json()
    assert len(questions) >= 1

    # Submit answer to diagnostic question
    sub_payload = {
        "answers": [
            {"questionId": "q-dfs-cycle-1", "selectedOptionId": "opt-2"}
        ]
    }
    submit_res = await client.post("/api/v1/quizzes/quiz-cs204-diag/submit", json=sub_payload, headers=headers)
    assert submit_res.status_code == 200
    result = submit_res.json()

    assert result["scorePercent"] == 100
    assert result["correctCount"] == 1
    assert result["masteryGainPercent"] >= 10


@pytest.mark.asyncio
async def test_08_mastery_and_study_planning(fullstack_client):
    """Journey Step 8: Fine-grained mastery, diagnostic summary, and personalized study plan."""
    client, _ = fullstack_client

    login_res = await client.post("/api/v1/auth/demo-login")
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Topic mastery breakdown
    top_res = await client.get("/api/v1/courses/course-cs204/mastery", headers=headers)
    assert top_res.status_code == 200
    topics = top_res.json()
    assert len(topics) >= 5

    # 2. Concept mastery details
    det_res = await client.get("/api/v1/courses/course-cs204/mastery/details", headers=headers)
    assert det_res.status_code == 200
    details = det_res.json()
    assert len(details) == 8

    # 3. Diagnostic summary
    diag_res = await client.get("/api/v1/courses/course-cs204/diagnostic", headers=headers)
    assert diag_res.status_code == 200
    diag = diag_res.json()
    assert "prerequisiteGaps" in diag

    # 4. Generate dynamic study plan
    plan_res = await client.post("/api/v1/courses/course-cs204/study-plan/generate", headers=headers)
    assert plan_res.status_code == 200
    plan = plan_res.json()
    assert plan["totalMinutesAllocated"] <= plan["totalMinutesAvailable"]
    assert len(plan["recommendations"]) > 0


@pytest.mark.asyncio
async def test_09_unauthorized_access_control(fullstack_client):
    """Journey Step 9: Expired or missing token is rejected with 401/403."""
    client, _ = fullstack_client

    # Request without token
    res_no_token = await client.get("/api/v1/courses/course-cs204/map")
    assert res_no_token.status_code == 401

    # Request with invalid token
    bad_headers = {"Authorization": "Bearer invalid_token_xyz"}
    res_bad_token = await client.get("/api/v1/courses/course-cs204/map", headers=bad_headers)
    assert res_bad_token.status_code == 401

