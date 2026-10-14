"""
Pytest Fixtures for Ingestion Pipeline Testing
"""
import asyncio
import os
import shutil
import tempfile
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.models.base import Base
from app.models.course import Course
from app.models.user import User
from app.providers.storage.s3 import LocalStorageProvider

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture(scope="function")
async def test_engine():
    engine = create_async_engine(TEST_DB_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(test_engine) -> AsyncSession:
    session_factory = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        yield session


@pytest.fixture(scope="function")
def temp_storage():
    temp_dir = tempfile.mkdtemp(prefix="cc_test_storage_")
    provider = LocalStorageProvider(root_dir=temp_dir)
    yield provider
    shutil.rmtree(temp_dir, ignore_errors=True)


@pytest_asyncio.fixture(scope="function")
async def seeded_user_and_course(db_session: AsyncSession):
    user = User(
        id="usr-ananya-sharma",
        email="ananya.sharma@collegemail.edu",
        hashed_password="hashed_pw_test",
        full_name="Ananya Sharma",
        academic_level="Undergraduate",
        institution="School of Engineering"
    )
    db_session.add(user)
    await db_session.flush()

    course = Course(
        id="course-cs204",
        user_id=user.id,
        name="Data Structures: Recursion and Graphs",
        code="CS 204",
        subject="Computer Science"
    )
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(user)
    await db_session.refresh(course)
    return user, course

