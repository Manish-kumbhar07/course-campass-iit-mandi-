from datetime import datetime, timezone
from fastapi import APIRouter, Cookie, Depends, Header, HTTPException, Response, status
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.core.audit import record_audit
from app.core.database import get_db
from app.core.security import create_access_token, hash_refresh_token, get_current_user_id
from app.models.user import AuthSession, User
from app.schemas.auth import LoginRequest, SessionResponse, SignUpRequest, UserResponse
from app.services import auth_service
from app.services.auth_service import AuthenticationFailed, DuplicateAccount
from app.core.rate_limit import enforce_rate_limit
from fastapi import Request

router = APIRouter(prefix="/auth", tags=["Authentication"])
REFRESH_COOKIE = "coursecompass_refresh"


def _session_response(user: User, session: AuthSession, is_new: bool, is_demo: bool = False) -> SessionResponse:
    token, expires = create_access_token(
        {"sub": user.id, "sid": session.id},
    )
    return SessionResponse(
        user=UserResponse(
            id=user.id,
            name=user.full_name,
            email=user.email,
            academic_level=user.academic_level,
            institution=user.institution,
            avatar_url=user.avatar_url,
            is_new_user=is_new,
            created_at=user.created_at,
        ),
        token=token,
        expires_at=expires,
        is_demo_session=is_demo,
    )


def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        REFRESH_COOKIE,
        token,
        httponly=True,
        secure=settings.ENVIRONMENT.lower() == "production",
        samesite="strict",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path=f"{settings.API_V1_PREFIX}/auth",
    )


async def _limit_auth(request: Request) -> None:
    await enforce_rate_limit(request, auth=True)


@router.post("/signup", response_model=SessionResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(_limit_auth)])
async def signup(
    payload: SignUpRequest, response: Response, db: AsyncSession = Depends(get_db)
) -> SessionResponse:
    try:
        user, session, refresh = await auth_service.register(db, payload)
    except DuplicateAccount as exc:
        raise HTTPException(status_code=409, detail="An account with this email already exists") from exc
    _set_refresh_cookie(response, refresh)
    return _session_response(user, session, True)


@router.post("/login", response_model=SessionResponse, dependencies=[Depends(_limit_auth)])
async def login(
    payload: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)
) -> SessionResponse:
    try:
        user, session, refresh = await auth_service.login(db, payload)
    except AuthenticationFailed as exc:
        raise HTTPException(status_code=401, detail="Invalid email or password") from exc
    _set_refresh_cookie(response, refresh)
    return _session_response(user, session, False)


@router.post("/demo-login", response_model=SessionResponse, dependencies=[Depends(_limit_auth)])
async def demo_login(
    response: Response,
    db: AsyncSession = Depends(get_db)
) -> SessionResponse:
    from app.services.seed_service import seed_demo_course
    await seed_demo_course(db)
    user = await db.get(User, "usr-ananya-sharma")
    if not user:
        raise HTTPException(status_code=500, detail="Demo account could not be initialized")
    user, session, refresh = await auth_service.create_demo_session(db, user)
    _set_refresh_cookie(response, refresh)
    return _session_response(user, session, False, is_demo=True)


@router.post("/refresh", response_model=SessionResponse, dependencies=[Depends(_limit_auth)])
async def refresh_session(
    response: Response,
    token: str | None = Cookie(default=None, alias=REFRESH_COOKIE),
    db: AsyncSession = Depends(get_db),
) -> SessionResponse:
    if not token:
        raise HTTPException(status_code=401, detail="Refresh session is required")
    rotated = await auth_service.rotate_session(db, token)
    if rotated is None:
        response.delete_cookie(REFRESH_COOKIE, path=f"{settings.API_V1_PREFIX}/auth")
        raise HTTPException(status_code=401, detail="Refresh session is invalid or expired")
    user, session, replacement = rotated
    _set_refresh_cookie(response, replacement)
    return _session_response(user, session, False)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(_limit_auth)])
async def logout(
    response: Response,
    user_id: str = Depends(get_current_user_id),
    authorization: str | None = Header(default=None),
    token: str | None = Cookie(default=None, alias=REFRESH_COOKIE),
    db: AsyncSession = Depends(get_db),
) -> Response:
    session_id = None
    if authorization:
        try:
            scheme, access = authorization.split()
            if scheme.lower() == "bearer":
                claims = jwt.decode(access, settings.SECRET_KEY, algorithms=["HS256"])
                session_id = claims.get("sid")
        except (JWTError, ValueError):
            session_id = None
    if token:
        result = await db.execute(
            select(AuthSession).where(
                AuthSession.user_id == user_id,
                AuthSession.refresh_token_hash == hash_refresh_token(token),
                AuthSession.revoked_at.is_(None),
            ).with_for_update()
        )
        session = result.scalar_one_or_none()
    elif session_id:
        result = await db.execute(
            select(AuthSession).where(
                AuthSession.user_id == user_id, AuthSession.id == session_id,
                AuthSession.revoked_at.is_(None),
            ).with_for_update()
        )
        session = result.scalar_one_or_none()
    else:
        session = None
    if session:
        session.revoked_at = datetime.now(timezone.utc)
        await record_audit(db, "auth.logout", "session", actor_user_id=user_id, resource_id=session.id)
        await db.commit()
    response.delete_cookie(REFRESH_COOKIE, path=f"{settings.API_V1_PREFIX}/auth")
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@router.get("/me", response_model=UserResponse, dependencies=[Depends(_limit_auth)])
async def get_me(user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="Authentication required")
    return UserResponse(
        id=user.id,
        name=user.full_name,
        email=user.email,
        academic_level=user.academic_level,
        institution=user.institution,
        avatar_url=user.avatar_url,
        created_at=user.created_at,
    )
