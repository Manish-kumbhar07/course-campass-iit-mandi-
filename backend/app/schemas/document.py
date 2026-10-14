from pydantic import Field
from app.schemas.common import ApiSchema


class UploadInitiateRequest(ApiSchema):
    filename: str = Field(min_length=1, max_length=255)
    content_type: str = Field(min_length=1, max_length=127)
    size_bytes: int = Field(gt=0)
    title: str | None = Field(default=None, min_length=1, max_length=300)


class UploadInitiateResponse(ApiSchema):
    document_id: str
    upload_url: str
    expires_in_seconds: int
    required_headers: dict[str, str]


class UploadCompleteResponse(ApiSchema):
    material_id: str
    course_id: str
    status: str
    file_size_bytes: int


class DownloadUrlResponse(ApiSchema):
    download_url: str
    expires_in_seconds: int
