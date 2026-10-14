"""
Application Settings & Environment Configuration
"""
from typing import Set
from pydantic import Field, field_validator

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
except ImportError:
    from pydantic import BaseModel, field_validator
    class BaseSettings(BaseModel):
        pass
    def SettingsConfigDict(**kwargs):
        return kwargs


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Core Application
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    @field_validator("DEBUG", mode="before")
    @classmethod
    def validate_debug(cls, value):
        if isinstance(value, str):
            val_lower = value.strip().lower()
            if val_lower in ("release", "false", "0", "no", "off", "prod", "production"):
                return False
            if val_lower in ("debug", "true", "1", "yes", "on", "dev", "development"):
                return True
        return bool(value)
    APP_NAME: str = "CourseCompass"
    API_V1_PREFIX: str = "/api/v1"
    SECRET_KEY: str = "development_secret_key_change_in_production_32chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14
    REFRESH_TOKEN_PEPPER: str = "development-only-change-this-pepper-32"
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    RATE_LIMIT_REDIS_URL: str | None = None
    RATE_LIMIT_PER_MINUTE: int = 60
    AUTH_RATE_LIMIT_PER_MINUTE: int = 10

    # Database
    DATABASE_URL: str = Field(
        default="sqlite:///./coursecompass.db",
        description="PostgreSQL async URL or SQLite URL for local testing"
    )

    # Storage Backend
    STORAGE_BACKEND: str = Field(
        default="local",
        description="'s3' for MinIO/AWS S3/Cloudflare R2, 'local' for local disk"
    )
    STORAGE_LOCAL_ROOT: str = "./storage"
    S3_ENDPOINT_URL: str | None = None
    S3_ACCESS_KEY_ID: str = ""
    S3_SECRET_ACCESS_KEY: str = ""
    S3_BUCKET_NAME: str = "coursecompass-materials"
    S3_REGION: str = "us-east-1"
    S3_ADDRESSING_STYLE: str = "path"
    SIGNED_URL_TTL_SECONDS: int = 300

    # Multimodal AI Provider (Gemini)
    GEMINI_API_KEY: str = Field(default="", description="Google Gemini API key")
    GEMINI_MODEL: str = "gemini-2.5-flash"
    PROVIDER_TIMEOUT_SECONDS: int = 90
    MAX_RETRIES: int = 3
    BACKOFF_BASE_SECONDS: float = 1.5

    # Resource & Ingestion Limits
    MAX_DOCUMENT_SIZE_BYTES: int = 30 * 1024 * 1024
    MAX_MEDIA_SIZE_BYTES: int = 30 * 1024 * 1024
    MAX_VIDEO_DURATION_SECONDS: int = 3 * 60 * 60
    FFPROBE_PATH: str = "ffprobe"
    MAX_FILENAME_LENGTH: int = 255
    MAX_PAGES_PER_DOCUMENT: int = 1000
    MAX_CONCURRENT_INGESTIONS_PER_USER: int = 2

    # Supported File Extensions and MIME Types
    SUPPORTED_EXTENSIONS: Set[str] = {
        ".pdf",
        ".pptx",
        ".png",
        ".jpg",
        ".jpeg",
        ".webp",
        ".mp3",
        ".wav",
        ".m4a",
        ".aac",
        ".mp4",
        ".webm",
        ".mov",
        ".txt",
    }

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, value: str) -> str:
        if len(value.encode("utf-8")) < 32:
            raise ValueError("SECRET_KEY must contain at least 32 bytes")
        return value

    @field_validator("REFRESH_TOKEN_PEPPER")
    @classmethod
    def validate_refresh_pepper(cls, value: str) -> str:
        if len(value.encode("utf-8")) < 32:
            raise ValueError("REFRESH_TOKEN_PEPPER must contain at least 32 bytes")
        return value

    @field_validator("STORAGE_BACKEND")
    @classmethod
    def require_private_storage_in_production(cls, value: str, info):
        if info.data.get("ENVIRONMENT", "development").lower() == "production" and value.lower() != "s3":
            raise ValueError("Production requires private S3-compatible object storage")
        return value

    SUPPORTED_MIME_TYPES: Set[str] = {
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "image/png",
        "image/jpeg",
        "image/webp",
        "audio/mpeg",
        "audio/wav",
        "audio/x-m4a",
        "audio/mp4",
        "audio/aac",
        "video/mp4",
        "video/webm",
        "video/quicktime"
    }


settings = Settings()
