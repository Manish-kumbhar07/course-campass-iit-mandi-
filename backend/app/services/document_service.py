import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.core.audit import record_audit
from app.core.exceptions import CourseCompassException
from app.models.course import Course
from app.models.document import CourseDocument, DocumentPage, ProcessingJob, VisualElement
from app.providers.storage.s3 import LocalStorageProvider, get_storage_provider
from app.schemas.document import UploadInitiateRequest
from app.services.course_service import get_owned_course
from app.services.file_validation import (
    MAX_FILE_SIZE,
    expected_file_type,
    validate_signature,
    validate_video_duration,
)


def _private_not_found() -> CourseCompassException:
    return CourseCompassException(
        "Document not found or unauthorized", 404, {"code": "DOCUMENT_NOT_FOUND"}
    )


async def initiate_upload(
    db: AsyncSession, user_id: str, course_id: str, payload: UploadInitiateRequest
) -> tuple[CourseDocument, str, bool]:
    course = await get_owned_course(db, user_id, course_id, lock=True)
    filename, document_type = expected_file_type(
        payload.filename, payload.content_type, payload.size_bytes
    )
    key = f"courses/{course.id}/materials/{uuid.uuid4().hex}"
    storage = get_storage_provider()
    local_upload = isinstance(storage, LocalStorageProvider)
    doc = CourseDocument(
        course_id=course.id,
        title=(payload.title or filename).strip(),
        document_type=document_type,
        s3_storage_key=key,
        original_filename=filename,
        content_type=payload.content_type.lower().split(";", 1)[0].strip(),
        file_size_bytes=payload.size_bytes,
        formatted_size=f"{payload.size_bytes / (1024 * 1024):.1f} MB",
        status="pending_upload",
    )
    db.add(doc)
    await db.flush()
    if local_upload:
        url = f"{settings.API_V1_PREFIX}/materials/{doc.id}/upload"
    else:
        url = await storage.generate_presigned_upload_url(
            key, doc.content_type or payload.content_type, settings.SIGNED_URL_TTL_SECONDS
        )
    await record_audit(
        db, "document.upload.initiate", "document", actor_user_id=user_id, resource_id=doc.id,
        metadata={"courseId": course.id, "fileType": document_type, "sizeBytes": payload.size_bytes},
    )
    await db.commit()
    await db.refresh(doc)
    return doc, url, local_upload


async def upload_local_bytes(
    db: AsyncSession,
    user_id: str,
    document_id: str,
    content_type: str,
    data: bytes,
) -> None:
    result = await db.execute(
        select(CourseDocument)
        .join(Course, CourseDocument.course_id == Course.id)
        .where(CourseDocument.id == document_id, Course.user_id == user_id)
        .with_for_update()
    )
    doc = result.scalar_one_or_none()
    if doc is None:
        raise _private_not_found()
    if doc.status != "pending_upload":
        raise CourseCompassException("Upload is no longer available", 409, {"code": "UPLOAD_NOT_PENDING"})
    if len(data) != doc.file_size_bytes or len(data) > MAX_FILE_SIZE:
        raise CourseCompassException("Uploaded size does not match the initiated upload", 413,
                                     {"code": "INVALID_FILE_SIZE"})
    validate_signature(doc.original_filename or "", content_type, data)
    await get_storage_provider().upload_bytes(data, doc.s3_storage_key, content_type)
    await record_audit(db, "document.upload.bytes", "document", actor_user_id=user_id,
                       resource_id=doc.id, metadata={"sizeBytes": len(data)})
    await db.commit()


async def complete_upload(
    db: AsyncSession, user_id: str, document_id: str
) -> tuple[CourseDocument, ProcessingJob]:
    result = await db.execute(
        select(CourseDocument)
        .join(Course, CourseDocument.course_id == Course.id)
        .where(CourseDocument.id == document_id, Course.user_id == user_id)
        .with_for_update()
    )
    doc = result.scalar_one_or_none()
    if doc is None:
        raise _private_not_found()
    if doc.status != "pending_upload":
        raise CourseCompassException("Upload is not awaiting completion", 409,
                                     {"code": "UPLOAD_NOT_PENDING"})
    storage = get_storage_provider()
    metadata = await storage.get_object_metadata(doc.s3_storage_key)
    actual_size = int(metadata["content_length"])
    actual_type = str(metadata["content_type"]).split(";", 1)[0].strip().lower()
    if actual_size != doc.file_size_bytes or actual_size > MAX_FILE_SIZE:
        await storage.delete_file(doc.s3_storage_key)
        doc.status = "failed"
        await record_audit(db, "document.upload.reject", "document", actor_user_id=user_id,
                           resource_id=doc.id, outcome="rejected", metadata={"reason": "size_mismatch"})
        await db.commit()
        raise CourseCompassException("Uploaded size does not match the initiated upload", 400,
                                     {"code": "INVALID_FILE_SIZE"})
    if actual_type and actual_type != "application/octet-stream" and actual_type != (doc.content_type or "").lower():
        await storage.delete_file(doc.s3_storage_key)
        doc.status = "failed"
        await record_audit(db, "document.upload.reject", "document", actor_user_id=user_id,
                           resource_id=doc.id, outcome="rejected", metadata={"reason": "mime_mismatch"})
        await db.commit()
        raise CourseCompassException("Uploaded MIME type does not match", 415, {"code": "MIME_MISMATCH"})

    data = await storage.download_bytes(doc.s3_storage_key)
    try:
        validate_signature(doc.original_filename or "", doc.content_type or "", data)
        duration = None
        if doc.document_type == "video":
            duration = await validate_video_duration(data)
    except Exception:
        await storage.delete_file(doc.s3_storage_key)
        doc.status = "failed"
        await record_audit(db, "document.upload.reject", "document", actor_user_id=user_id,
                           resource_id=doc.id, outcome="rejected", metadata={"reason": "validation_failed"})
        await db.commit()
        raise

    doc.status = "uploaded"
    doc.file_size_bytes = actual_size
    if duration is not None:
        doc.page_count_or_duration = f"{duration} seconds"
    job = ProcessingJob(
        document_id=doc.id,
        stage="secure_upload",
        stage_number=1,
        total_stages=7,
        stage_description="Validating cryptographic container and file signatures",
        progress_percent=14,
        is_completed=False,
    )
    db.add(job)
    await record_audit(db, "document.upload.complete", "document", actor_user_id=user_id,
                       resource_id=doc.id, metadata={"sizeBytes": actual_size})
    await db.commit()
    await db.refresh(doc)
    await db.refresh(job)
    return doc, job


async def get_owned_document(db: AsyncSession, user_id: str, document_id: str, *, lock: bool = False) -> CourseDocument:
    query = (
        select(CourseDocument)
        .join(Course, CourseDocument.course_id == Course.id)
        .where(CourseDocument.id == document_id, Course.user_id == user_id)
    )
    if lock:
        query = query.with_for_update()
    result = await db.execute(query)
    doc = result.scalar_one_or_none()
    if doc is None:
        raise _private_not_found()
    return doc


async def create_download_url(db: AsyncSession, user_id: str, document_id: str) -> tuple[str, bool]:
    doc = await get_owned_document(db, user_id, document_id)
    if doc.status in {"pending_upload", "failed"}:
        raise CourseCompassException("Document is not available for download", 409,
                                     {"code": "DOCUMENT_NOT_READY"})
    storage = get_storage_provider()
    ttl = min(settings.SIGNED_URL_TTL_SECONDS, 300)
    if isinstance(storage, LocalStorageProvider):
        url = f"{settings.API_V1_PREFIX}/materials/{doc.id}/download"
    else:
        url = await storage.generate_presigned_url(doc.s3_storage_key, ttl)
    await record_audit(db, "document.download.issue_url", "document", actor_user_id=user_id,
                       resource_id=doc.id, metadata={"expiresInSeconds": ttl})
    await db.commit()
    return url, isinstance(storage, LocalStorageProvider)


async def delete_document(db: AsyncSession, user_id: str, document_id: str) -> None:
    doc = await get_owned_document(db, user_id, document_id, lock=True)
    keys = [doc.s3_storage_key]
    visual_result = await db.execute(
        select(VisualElement.s3_image_key)
        .join(DocumentPage, VisualElement.page_id == DocumentPage.id)
        .where(DocumentPage.document_id == doc.id, VisualElement.s3_image_key.is_not(None))
    )
    keys.extend(key for key in visual_result.scalars().all() if key)
    storage = get_storage_provider()
    try:
        for key in dict.fromkeys(keys):
            await storage.delete_file(key)
    except Exception as exc:
        await db.rollback()
        raise CourseCompassException(
            "Document files could not be safely deleted; document data was retained",
            502,
            {"code": "STORAGE_CLEANUP_FAILED"},
        ) from exc
    await record_audit(db, "document.delete", "document", actor_user_id=user_id,
                       resource_id=doc.id, metadata={"courseId": doc.course_id})
    await db.delete(doc)
    await db.commit()
