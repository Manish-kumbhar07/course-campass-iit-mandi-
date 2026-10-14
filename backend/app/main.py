"""
CourseCompass FastAPI Application Gateway
"""
from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.api.v1.router import api_router
from app.config import settings
from app.core.database import init_db
from app.core.exceptions import CourseCompassException
from app.core.rate_limit import create_rate_limiter

logger = logging.getLogger("coursecompass.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.ENVIRONMENT.lower() != "production":
        await init_db()
        from app.core.database import AsyncSessionLocal
        from app.services.seed_service import seed_demo_course
        async with AsyncSessionLocal() as session:
            try:
                await seed_demo_course(session)
            except Exception as e:
                logger.warning("Failed to auto-seed demo course: %s", e)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="CourseCompass AI Ingestion, Grounded Tutoring & Prerequisite Mastery API",
    version="0.1.0",
    lifespan=lifespan
)
app.state.rate_limiter = create_rate_limiter()

# CORS Middleware (permitting Vite frontend during local dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(CourseCompassException)
async def coursecompass_exception_handler(request: Request, exc: CourseCompassException):
    """Uniform error envelope that does not expose server-side error details."""
    is_server_error = exc.status_code >= 500
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "message": "Request could not be completed" if is_server_error else exc.message,
            "statusCode": exc.status_code,
            "details": (
                {"code": "INTERNAL_ERROR"}
                if is_server_error
                else {"code": exc.details.get("code", "REQUEST_FAILED"), **exc.details}
            )
        }
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    detail = exc.detail if isinstance(exc.detail, str) else "Request failed"
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "message": detail,
            "statusCode": exc.status_code,
            "details": {"code": "HTTP_ERROR"},
        },
        headers=exc.headers,
    )


@app.exception_handler(RequestValidationError)
async def request_validation_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    field = str(errors[0]["loc"][-1]) if errors else None
    details = {"code": "VALIDATION_ERROR"}
    msg = "Request validation failed"
    if errors:
        first = errors[0]
        field_name = str(first.get("loc", [""])[-1])
        err_msg = first.get("msg", "")
        if field_name and err_msg:
            clean_err = err_msg.replace("Value error, ", "")
            msg = f"{field_name.capitalize()}: {clean_err}"
    if field:
        details["field"] = field
    return JSONResponse(
        status_code=422,
        content={"message": msg, "statusCode": 422, "details": details},
    )


@app.exception_handler(Exception)
async def internal_error_handler(request: Request, exc: Exception):
    logger.error("Unhandled API exception")
    return JSONResponse(
        status_code=500,
        content={
            "message": "An internal error occurred",
            "statusCode": 500,
            "details": {"code": "INTERNAL_ERROR"},
        },
    )


# Mount v1 Router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/api/health", tags=["Health"])
@app.get("/health", tags=["Health"])
async def health_check():
    """Service liveness check."""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "storageBackend": settings.STORAGE_BACKEND,
        "geminiConfigured": bool(settings.GEMINI_API_KEY)
    }


@app.get("/ready", tags=["Health"])
async def readiness_check():
    """Service readiness check verifying database connectivity."""
    from app.core.database import AsyncSessionLocal
    from sqlalchemy import text
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        return {
            "status": "ready",
            "service": settings.APP_NAME,
            "database": "connected"
        }
    except Exception as exc:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "service": settings.APP_NAME,
                "database": "disconnected",
                "error": "Database connectivity failure"
            }
        )

