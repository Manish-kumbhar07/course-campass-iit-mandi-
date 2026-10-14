"""
Database Connection & Session Factory
Seamlessly supports PostgreSQL (asyncpg), aiosqlite, and synchronous SQLite fallback.
"""
from typing import AsyncGenerator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from app.config import settings
from app.models.base import Base
import app.models  # noqa: F401 - register all models before schema initialization


class AsyncSessionAdapter:
    """Small async-shaped adapter retained for synchronous SQLite integration tests."""

    def __init__(self, sync_session: Session):
        self._session = sync_session

    async def execute(self, statement, *args, **kwargs):
        return self._session.execute(statement, *args, **kwargs)

    async def commit(self):
        self._session.commit()

    async def rollback(self):
        self._session.rollback()

    async def flush(self):
        self._session.flush()

    async def refresh(self, instance, *args, **kwargs):
        self._session.refresh(instance, *args, **kwargs)

    def add(self, instance):
        self._session.add(instance)

    async def get(self, entity, ident, *args, **kwargs):
        return self._session.get(entity, ident, *args, **kwargs)

    async def close(self):
        self._session.close()

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            await self.rollback()
        await self.close()

_use_native_async = False
try:
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif db_url.startswith("sqlite://") and not db_url.startswith("sqlite+aiosqlite://"):
        db_url = db_url.replace("sqlite://", "sqlite+aiosqlite://", 1)

    if "aiosqlite" in db_url:
        import aiosqlite
    elif "asyncpg" in db_url:
        import asyncpg

    engine = create_async_engine(
        db_url,
        echo=settings.DEBUG and settings.ENVIRONMENT == "development",
        future=True
    )
    AsyncSessionLocal = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False
    )
    _use_native_async = True
except (ImportError, Exception):
    _use_native_async = False


if not _use_native_async:
    sync_url = settings.DATABASE_URL.replace("+aiosqlite", "").replace("+asyncpg", "")
    if "postgresql" in sync_url and "psycopg" not in sync_url:
        sync_url = "sqlite:///./coursecompass.db"

    sync_engine = create_engine(
        sync_url,
        echo=False,
        connect_args={"check_same_thread": False} if "sqlite" in sync_url else {},
        poolclass=StaticPool if "sqlite" in sync_url else None
    )
    SyncSessionLocal = sessionmaker(bind=sync_engine, class_=Session, expire_on_commit=False)

    class AsyncSessionFactoryAdapter:
        def __call__(self):
            return AsyncSessionAdapter(SyncSessionLocal())

    AsyncSessionLocal = AsyncSessionFactoryAdapter()
    engine = sync_engine


async def get_db() -> AsyncGenerator[any, None]:
    """FastAPI dependency yielding an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db() -> None:
    """Initialize database tables."""
    if _use_native_async:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    else:
        Base.metadata.create_all(bind=engine)
