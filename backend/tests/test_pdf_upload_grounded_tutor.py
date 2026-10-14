"""
Test Suite: Real PDF Upload, Content Extraction, Grounded Tutor Q&A, and Irrelevant Upload Warning
Verifies:
1. Extraction of actual text from uploaded PDF using pypdf.
2. Tutor answering questions grounded in the uploaded PDF with verified citations.
3. Tutor rejecting irrelevant questions and prompting the user to upload the relevant PDF/video.
"""
import io
import pytest
import pytest_asyncio
import pypdf
from datetime import date, datetime, timedelta, timezone
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker

from app.core.database import get_db
from app.core.security import create_access_token
from app.main import app
from app.models.course import Course
from app.models.user import AuthSession, User
from app.services.ingestion_service import IngestionService
from app.workers.ingestion_worker import IngestionWorker


def create_test_pdf_bytes(title: str, body_text: str) -> bytes:
    """Helper to generate a valid PDF with actual extractable text stream."""
    writer = pypdf.PdfWriter()
    page = writer.add_blank_page(width=612, height=792)
    content = (
        f"BT\n"
        f"/F1 14 Tf\n"
        f"50 700 Td\n"
        f"({title}) Tj\n"
        f"0 -30 Td\n"
        f"/F1 11 Tf\n"
        f"({body_text}) Tj\n"
        f"ET"
    )
    stream_bytes = content.encode("latin-1")
    from pypdf.generic import DecodedStreamObject, DictionaryObject, NameObject
    stream_obj = DecodedStreamObject()
    stream_obj.set_data(stream_bytes)
    page[NameObject("/Contents")] = stream_obj

    fonts = DictionaryObject({
        NameObject("/F1"): DictionaryObject({
            NameObject("/Type"): NameObject("/Font"),
            NameObject("/Subtype"): NameObject("/Type1"),
            NameObject("/BaseFont"): NameObject("/Helvetica"),
        })
    })
    resources = DictionaryObject({NameObject("/Font"): fonts})
    page[NameObject("/Resources")] = resources

    buf = io.BytesIO()
    writer.write(buf)
    return buf.getvalue()


@pytest_asyncio.fixture
async def pdf_tutor_client(test_engine):
    session_factory = async_sessionmaker(test_engine, expire_on_commit=False)

    async def override_db():
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_db

    from app.core.rate_limit import LocalRateLimiter
    app.state.rate_limiter = LocalRateLimiter()

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://testserver"
    ) as client:
        yield client, session_factory

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_uploaded_pdf_grounded_answer_and_irrelevant_handling(pdf_tutor_client):
    client, session_factory = pdf_tutor_client

    # 1. Create a dedicated user, course, and auth session
    user_id = "usr-bio-tester-99"
    course_id = "course-bio-101"
    now = datetime.now(timezone.utc)

    async with session_factory() as session:
        user = User(
            id=user_id,
            email="rohan.verma@college.edu",
            hashed_password="mock_hashed_pw",
            full_name="Rohan Verma",
            academic_level="Undergraduate",
            institution="IIT Mandi"
        )
        session.add(user)
        await session.flush()

        course = Course(
            id=course_id,
            user_id=user.id,
            name="Cell Biology 101",
            code="BIO 101",
            subject="Biology",
            exam_date=date(2026, 12, 1),
            daily_study_minutes=45
        )
        session.add(course)
        await session.flush()

        auth_session = AuthSession(
            id="sid-bio-99",
            user_id=user.id,
            refresh_token_hash="mock_refresh_hash",
            expires_at=now + timedelta(days=7)
        )
        session.add(auth_session)
        await session.commit()

    token, _ = create_access_token({"sub": user_id, "sid": "sid-bio-99"})
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create a real PDF containing cell biology text
    pdf_bytes = create_test_pdf_bytes(
        title="Chapter 3: Mitosis and Cellular Division Mechanics",
        body_text="During metaphase, duplicated chromosomes align at the spindle equator plate before sister chromatids separate."
    )
    # Verify that pypdf can read this back
    reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
    extracted = reader.pages[0].extract_text()
    assert "metaphase" in extracted.lower()

    # 3. Ingest and process the PDF
    async with session_factory() as session:
        doc, job = await IngestionService.validate_and_register_upload(
            db=session,
            user_id=user_id,
            course_id=course_id,
            file_name="cell_biology_mitosis.pdf",
            file_bytes=pdf_bytes,
            content_type="application/pdf",
            title_override="Cell Biology Mitosis Notes"
        )
        await session.commit()

        worker = IngestionWorker()
        doc = await worker.process_document(session, doc.id, job_id=job.id)
        assert doc.status == "indexed"

    # 4. Ask the AI Tutor a question covered in the uploaded PDF
    q_payload = {
        "text": "What happens during metaphase according to my uploaded notes?",
        "explanationLevel": "rigorous",
        "conceptId": None
    }
    tutor_res = await client.post(
        f"/api/v1/courses/{course_id}/tutor/chat",
        json=q_payload,
        headers=headers
    )
    assert tutor_res.status_code == 200
    tutor_data = tutor_res.json()

    # Verify that the tutor answered using the uploaded PDF
    assert tutor_data["sender"] == "tutor"
    assert tutor_data["answerState"] == "supported"
    assert len(tutor_data["citations"]) >= 1
    assert "Cell Biology Mitosis Notes" in tutor_data["citations"][0]["sourceTitle"]
    assert "Page 1" in tutor_data["citations"][0]["locationLabel"]
    assert "metaphase" in tutor_data["text"].lower() or "chromosomes" in tutor_data["text"].lower()

    # 5. Ask the AI Tutor an unrelated question not covered in the course or uploaded PDF
    unrelated_payload = {
        "text": "Explain how quantum teleportation transfers qubits across fiber optic networks.",
        "explanationLevel": "rigorous",
        "conceptId": None
    }
    unrelated_res = await client.post(
        f"/api/v1/courses/{course_id}/tutor/chat",
        json=unrelated_payload,
        headers=headers
    )
    assert unrelated_res.status_code == 200
    unrelated_data = unrelated_res.json()

    # Verify that tutor states it is not found, names the uploaded PDF, and tells the student to upload the relevant PDF/video
    assert unrelated_data["answerState"] == "not_found"
    assert unrelated_data["citations"] == []
    assert "not found in your currently indexed courseware" in unrelated_data["text"].lower()
    assert "cell biology mitosis notes" in unrelated_data["text"].lower()
    assert "upload a relevant pdf" in unrelated_data["text"].lower() or "upload" in unrelated_data["suggestedFollowUp"].lower()
