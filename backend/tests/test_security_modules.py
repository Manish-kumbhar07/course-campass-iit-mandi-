import asyncio
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker
from app.core.database import get_db
from app.core.exceptions import StorageError
from app.main import app
from app.models.document import CourseDocument
from app.providers.storage.base import BaseStorageProvider
from app.services import course_service, document_service
from app.services.file_validation import validate_filename, validate_signature


class MemoryPrivateStorage(BaseStorageProvider):
    def __init__(self):
        self.objects: dict[str, tuple[bytes, str]] = {}
        self.delete_fails = False
        self.last_download_ttl = None

    async def upload_bytes(self, data, key, content_type="application/octet-stream"):
        self.objects[key] = (data, content_type)
        return key

    async def download_bytes(self, key):
        return self.objects[key][0]

    async def download_to_file(self, key, destination_path):
        raise NotImplementedError

    async def delete_file(self, key):
        if self.delete_fails:
            raise StorageError("storage failure", key=key)
        self.objects.pop(key, None)

    async def get_file_size(self, key):
        return len(self.objects[key][0])

    async def generate_presigned_url(self, key, expires_in_seconds=3600):
        self.last_download_ttl = expires_in_seconds
        return f"https://private.invalid/{key}?ttl={expires_in_seconds}"

    async def generate_presigned_upload_url(self, key, content_type, expires_in_seconds):
        return f"https://private.invalid/upload/{key}?ttl={expires_in_seconds}"

    async def get_object_metadata(self, key):
        body, content_type = self.objects[key]
        return {"content_length": len(body), "content_type": content_type}


@pytest_asyncio.fixture
async def api_client(test_engine, monkeypatch):
    session_factory = async_sessionmaker(test_engine, expire_on_commit=False)

    async def override_db():
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_db
    from app.core.rate_limit import LocalRateLimiter
    app.state.rate_limiter = LocalRateLimiter()
    storage = MemoryPrivateStorage()
    monkeypatch.setattr(document_service, "get_storage_provider", lambda: storage)
    monkeypatch.setattr(course_service, "get_storage_provider", lambda: storage)
    monkeypatch.setattr("app.api.v1.endpoints.materials.get_storage_provider", lambda: storage)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client, session_factory, storage
    app.dependency_overrides.clear()


async def create_user(client: AsyncClient, email: str) -> tuple[str, str]:
    result = await client.post(
        "/api/v1/auth/signup",
        json={"name": "Test User", "email": email, "password": "correct-horse-battery"},
    )
    assert result.status_code == 201, result.text
    return result.json()["token"], result.json()["user"]["id"]


async def create_course(client: AsyncClient, token: str, code: str = "SEC101") -> str:
    response = await client.post(
        "/api/v1/courses",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Security", "code": code, "subject": "Computing"},
    )
    assert response.status_code == 201, response.text
    return response.json()["id"]


@pytest.mark.asyncio
async def test_unauthenticated_and_invalid_tokens_are_rejected(api_client):
    client, _, _ = api_client
    assert (await client.get("/api/v1/courses")).status_code == 401
    assert (await client.get(
        "/api/v1/courses", headers={"Authorization": "Bearer cc_sec_tok_fake"}
    )).status_code == 401


@pytest.mark.asyncio
async def test_auth_refresh_rotation_and_logout_revokes_access(api_client):
    client, _, _ = api_client
    signup = await client.post(
        "/api/v1/auth/signup",
        json={"name": "Test User", "email": "one@example.com", "password": "correct-horse-battery"},
    )
    assert signup.status_code == 201
    old_token = signup.json()["token"]
    assert "httponly" in signup.headers["set-cookie"].lower()
    refresh = await client.post("/api/v1/auth/refresh")
    assert refresh.status_code == 200
    rotated_token = refresh.json()["token"]
    assert old_token != rotated_token
    assert (await client.get(
        "/api/v1/auth/me", headers={"Authorization": f"Bearer {old_token}"}
    )).status_code == 200
    assert (await client.post(
        "/api/v1/auth/refresh", cookies={"coursecompass_refresh": "replayed-token"}
    )).status_code == 401
    assert (await client.post(
        "/api/v1/auth/logout", headers={"Authorization": f"Bearer {rotated_token}"}
    )).status_code == 204
    assert (await client.get(
        "/api/v1/auth/me", headers={"Authorization": f"Bearer {rotated_token}"}
    )).status_code == 401


@pytest.mark.asyncio
async def test_login_errors_do_not_disclose_account_existence(api_client):
    client, _, _ = api_client
    one = await client.post(
        "/api/v1/auth/login",
        json={"email": "missing@example.com", "password": "unknown-password"},
    )
    await client.post(
        "/api/v1/auth/signup",
        json={"name": "Test User", "email": "present@example.com", "password": "correct-horse-battery"},
    )
    two = await client.post(
        "/api/v1/auth/login",
        json={"email": "present@example.com", "password": "wrong-password"},
    )
    assert one.status_code == two.status_code == 401
    assert one.json()["message"] == two.json()["message"] == "Invalid email or password"


@pytest.mark.asyncio
async def test_course_and_document_ownership_is_enforced(api_client):
    client, _, _ = api_client
    owner_token, _ = await create_user(client, "owner@example.com")
    other_token, _ = await create_user(client, "other@example.com")
    course_id = await create_course(client, owner_token)
    forbidden = await client.get(
        f"/api/v1/courses/{course_id}",
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert forbidden.status_code == 404
    initiate = await client.post(
        f"/api/v1/courses/{course_id}/materials/initiate",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"filename": "lecture.pdf", "contentType": "application/pdf", "sizeBytes": 8},
    )
    assert initiate.status_code == 201
    document_id = initiate.json()["documentId"]
    download = await client.get(
        f"/api/v1/materials/{document_id}/download-url",
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert download.status_code == 404
    deletion = await client.delete(
        f"/api/v1/materials/{document_id}",
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert deletion.status_code == 404


@pytest.mark.asyncio
async def test_upload_filename_mime_signature_and_size_validation(api_client):
    client, _, storage = api_client
    token, _ = await create_user(client, "files@example.com")
    course_id = await create_course(client, token)
    headers = {"Authorization": f"Bearer {token}"}

    unsafe = await client.post(
        f"/api/v1/courses/{course_id}/materials/initiate", headers=headers,
        json={"filename": "../../evil.pdf", "contentType": "application/pdf", "sizeBytes": 10},
    )
    assert unsafe.status_code == 400

    mime_mismatch = await client.post(
        f"/api/v1/courses/{course_id}/materials/initiate", headers=headers,
        json={"filename": "lecture.pdf", "contentType": "text/plain", "sizeBytes": 10},
    )
    assert mime_mismatch.status_code == 415

    oversized = await client.post(
        f"/api/v1/courses/{course_id}/materials/initiate", headers=headers,
        json={"filename": "lecture.pdf", "contentType": "application/pdf", "sizeBytes": 31 * 1024 * 1024},
    )
    assert oversized.status_code == 413

    initiated = await client.post(
        f"/api/v1/courses/{course_id}/materials/initiate", headers=headers,
        json={"filename": "lecture.pdf", "contentType": "application/pdf", "sizeBytes": 11},
    )
    doc_id = initiated.json()["documentId"]
    session_factory = api_client[1]
    async with session_factory() as session:
        doc = await session.get(CourseDocument, doc_id)
        object_key = doc.s3_storage_key
    await storage.upload_bytes(b"not-a-pdf!!", object_key, "application/pdf")
    complete = await client.post(f"/api/v1/materials/{doc_id}/complete", headers=headers)
    assert complete.status_code == 400
    assert "not-a-pdf!!" not in complete.text
    assert object_key not in storage.objects

    with pytest.raises(Exception):
        validate_filename("..\\..\\evil.pdf")
    with pytest.raises(Exception):
        validate_signature("lecture.pdf", "application/pdf", b"not a PDF")


@pytest.mark.asyncio
async def test_signed_download_link_is_short_lived(api_client):
    client, session_factory, storage = api_client
    token, _ = await create_user(client, "download@example.com")
    course_id = await create_course(client, token)
    start = await client.post(
        f"/api/v1/courses/{course_id}/materials/initiate",
        headers={"Authorization": f"Bearer {token}"},
        json={"filename": "notes.txt", "contentType": "text/plain", "sizeBytes": 5},
    )
    document_id = start.json()["documentId"]
    async with session_factory() as session:
        doc = await session.get(CourseDocument, document_id)
        await storage.upload_bytes(b"notes", doc.s3_storage_key, "text/plain")
    assert (await client.post(
        f"/api/v1/materials/{document_id}/complete",
        headers={"Authorization": f"Bearer {token}"},
    )).status_code == 202
    signed = await client.get(
        f"/api/v1/materials/{document_id}/download-url",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert signed.status_code == 200
    assert storage.last_download_ttl <= 300
    assert signed.json()["expiresInSeconds"] <= 300


@pytest.mark.asyncio
async def test_failed_file_cleanup_retains_database_record(api_client):
    client, session_factory, storage = api_client
    token, _ = await create_user(client, "cleanup@example.com")
    course_id = await create_course(client, token)
    start = await client.post(
        f"/api/v1/courses/{course_id}/materials/initiate",
        headers={"Authorization": f"Bearer {token}"},
        json={"filename": "notes.txt", "contentType": "text/plain", "sizeBytes": 5},
    )
    document_id = start.json()["documentId"]
    async with session_factory() as session:
        doc = await session.get(CourseDocument, document_id)
        object_key = doc.s3_storage_key
        await storage.upload_bytes(b"notes", object_key, "text/plain")
    assert (await client.post(
        f"/api/v1/materials/{document_id}/complete",
        headers={"Authorization": f"Bearer {token}"},
    )).status_code == 202
    storage.delete_fails = True
    deleted = await client.delete(
        f"/api/v1/materials/{document_id}", headers={"Authorization": f"Bearer {token}"}
    )
    assert deleted.status_code == 502
    async with session_factory() as session:
        assert await session.get(CourseDocument, document_id) is not None


@pytest.mark.asyncio
async def test_concurrent_rate_limit_decisions_are_atomic():
    from app.core.rate_limit import LocalRateLimiter
    limiter = LocalRateLimiter()
    decisions = await asyncio.gather(
        *(limiter.allow("parallel-client", 5, 60) for _ in range(25))
    )
    assert sum(decisions) == 5
