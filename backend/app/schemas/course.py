from datetime import date, datetime
from pydantic import Field
from app.schemas.common import ApiSchema


class CourseCreate(ApiSchema):
    name: str = Field(min_length=1, max_length=255)
    code: str = Field(min_length=1, max_length=50)
    subject: str = Field(min_length=1, max_length=100)
    exam_date: date | None = None
    daily_study_minutes: int = Field(default=45, ge=1, le=1440)


class CourseUpdate(ApiSchema):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    code: str | None = Field(default=None, min_length=1, max_length=50)
    subject: str | None = Field(default=None, min_length=1, max_length=100)
    exam_date: date | None = None
    daily_study_minutes: int | None = Field(default=None, ge=1, le=1440)


class CourseResponse(ApiSchema):
    id: str
    user_id: str
    name: str
    code: str
    subject: str
    exam_date: date | None
    daily_study_minutes: int
    overall_mastery: int
    documents_count: int = 0
    concepts_count: int = 0
    created_at: datetime
    updated_at: datetime
