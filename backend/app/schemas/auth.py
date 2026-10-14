from datetime import datetime
from pydantic import EmailStr, Field, field_validator
from app.schemas.common import ApiSchema


class SignUpRequest(ApiSchema):
    name: str = Field(min_length=1, max_length=150)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        name = " ".join(value.split())
        if not name:
            raise ValueError("Name is required")
        return name

    @field_validator("password")
    @classmethod
    def password_byte_limit(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be no more than 72 UTF-8 bytes")
        return value


class LoginRequest(ApiSchema):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)

    @field_validator("password")
    @classmethod
    def password_byte_limit(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be no more than 72 UTF-8 bytes")
        return value


class UserResponse(ApiSchema):
    id: str
    name: str
    email: EmailStr
    academic_level: str
    institution: str
    avatar_url: str | None
    is_new_user: bool = False
    created_at: datetime


class SessionResponse(ApiSchema):
    user: UserResponse
    token: str
    expires_at: datetime
    is_demo_session: bool = False
