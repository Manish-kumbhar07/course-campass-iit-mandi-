from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.core.audit import record_audit
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    hash_refresh_token,
    verify_password,
)
from app.models.user import AuthSession, User
from app.schemas.auth import LoginRequest, SignUpRequest


class AuthenticationFailed(Exception):
    pass


class DuplicateAccount(Exception):
    pass


async def _new_session(db: AsyncSession, user: User) -> tuple[AuthSession, str]:
    refresh_token = create_refresh_token()
    auth_session = AuthSession(
        user_id=user.id,
        refresh_token_hash=hash_refresh_token(refresh_token),
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(auth_session)
    await db.flush()
    return auth_session, refresh_token


async def register(db: AsyncSession, request: SignUpRequest) -> tuple[User, AuthSession, str]:
    user = User(
        email=str(request.email).strip().lower(),
        hashed_password=get_password_hash(request.password),
        full_name=request.name,
    )
    db.add(user)
    try:
        await db.flush()
        auth_session, refresh_token = await _new_session(db, user)
        await record_audit(db, "auth.register", "user", actor_user_id=user.id, resource_id=user.id)
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise DuplicateAccount from exc
    await db.refresh(user)
    return user, auth_session, refresh_token


async def login(db: AsyncSession, request: LoginRequest) -> tuple[User, AuthSession, str]:
    result = await db.execute(select(User).where(User.email == str(request.email).strip().lower()))
    user = result.scalar_one_or_none()
    if not user:
        get_password_hash(request.password)
        await record_audit(
            db, "auth.login", "user", actor_user_id=None, outcome="rejected",
            metadata={"reason": "invalid_credentials"},
        )
        await db.commit()
        raise AuthenticationFailed
    if not user.is_active or not verify_password(request.password, user.hashed_password):
        await record_audit(
            db, "auth.login", "user", actor_user_id=None, outcome="rejected",
            metadata={"reason": "invalid_credentials"},
        )
        await db.commit()
        raise AuthenticationFailed
    auth_session, refresh_token = await _new_session(db, user)
    await record_audit(db, "auth.login", "user", actor_user_id=user.id, resource_id=user.id)
    await db.commit()
    await db.refresh(user)
    return user, auth_session, refresh_token


async def create_demo_session(db: AsyncSession, user: User) -> tuple[User, AuthSession, str]:
    auth_session, refresh_token = await _new_session(db, user)
    await record_audit(db, "auth.demo_login", "user", actor_user_id=user.id, resource_id=user.id)
    await db.commit()
    await db.refresh(user)
    return user, auth_session, refresh_token


async def rotate_session(
    db: AsyncSession, refresh_token: str
) -> tuple[User, AuthSession, str] | None:
    token_hash = hash_refresh_token(refresh_token)
    result = await db.execute(
        select(AuthSession)
        .where(
            AuthSession.refresh_token_hash == token_hash,
            AuthSession.revoked_at.is_(None),
            AuthSession.expires_at > datetime.now(timezone.utc),
        )
        .with_for_update()
    )
    current = result.scalar_one_or_none()
    if current is None:
        return None
    user_result = await db.execute(
        select(User).where(User.id == current.user_id, User.is_active.is_(True))
    )
    user = user_result.scalar_one_or_none()
    if user is None:
        current.revoked_at = datetime.now(timezone.utc)
        await db.commit()
        return None
    replacement = create_refresh_token()
    current.refresh_token_hash = hash_refresh_token(replacement)
    current.expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    await record_audit(db, "auth.refresh", "session", actor_user_id=user.id, resource_id=current.id)
    await db.commit()
    await db.refresh(user)
    return user, current, replacement
