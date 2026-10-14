"""
Materials & Ingestion API Endpoints
"""
from typing import List, Optional
from urllib.parse import quote
from fastapi import (
    APIRouter, BackgroundTasks, Depends, File, Form, Header, HTTPException,
    Request, Response, UploadFile, status
)
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal, get_db
from app.core.exceptions import CourseCompassException
from app.core.rate_limit import enforce_rate_limit
from app.core.security import get_current_user_id
from app.config import settings
from app.providers.storage.s3 import LocalStorageProvider, get_storage_provider
from app.schemas.material import (
    CourseDocumentResponse,
    DocumentPageDetailResponse,
    DocumentUploadResponse,
    ProcessingJobResponse
)
from app.schemas.document import (
    DownloadUrlResponse, UploadCompleteResponse, UploadInitiateRequest, UploadInitiateResponse
)
from app.services import document_service
from app.services.file_validation import MAX_FILE_SIZE
from app.services.ingestion_service import IngestionService
from app.workers.ingestion_worker import IngestionWorker
from fastapi.responses import StreamingResponse

router = APIRouter(tags=["Materials & Ingestion"])


async def _run_background_ingestion(document_id: str, job_id: str):
    """Async background task executing ingestion worker with fresh DB session."""
    async with AsyncSessionLocal() as session:
        worker = IngestionWorker()
        try:
            await worker.process_document(session, document_id, job_id=job_id)
        except Exception:
            # The worker records detailed failures internally; do not log document content.
            import logging
            logging.getLogger("coursecompass.api.materials").exception("Background ingestion failed")


async def _limit_api(request: Request) -> None:
    await enforce_rate_limit(request)


@router.post(
    "/courses/{courseId}/materials/initiate",
    response_model=UploadInitiateResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(_limit_api)],
)
async def initiate_material_upload(
    courseId: str,
    payload: UploadInitiateRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> UploadInitiateResponse:
    doc, url, local_upload = await document_service.initiate_upload(db, user_id, courseId, payload)
    return UploadInitiateResponse(
        document_id=doc.id,
        upload_url=url,
        expires_in_seconds=settings.SIGNED_URL_TTL_SECONDS,
        required_headers={"Content-Type": doc.content_type or payload.content_type},
    )


@router.put("/materials/{materialId}/upload", status_code=status.HTTP_204_NO_CONTENT,
            dependencies=[Depends(_limit_api)])
async def upload_to_local_storage(
    materialId: str,
    request: Request,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
    content_type: str | None = Header(default=None, alias="Content-Type"),
) -> Response:
    storage = get_storage_provider()
    if not isinstance(storage, LocalStorageProvider):
        raise HTTPException(status_code=404, detail="Not found")
    chunks: list[bytes] = []
    total = 0
    async for chunk in request.stream():
        total += len(chunk)
        if total > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File exceeds the permitted size")
        chunks.append(chunk)
    await document_service.upload_local_bytes(
        db, user_id, materialId, content_type or "application/octet-stream", b"".join(chunks)
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/materials/{materialId}/complete",
    response_model=UploadCompleteResponse,
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[Depends(_limit_api)],
)
async def complete_material_upload(
    materialId: str,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> UploadCompleteResponse:
    doc, job = await document_service.complete_upload(db, user_id, materialId)
    background_tasks.add_task(_run_background_ingestion, doc.id, job.id)
    return UploadCompleteResponse(
        material_id=doc.id,
        course_id=doc.course_id,
        status=doc.status,
        file_size_bytes=doc.file_size_bytes,
    )


@router.get(
    "/materials/{materialId}/download-url",
    response_model=DownloadUrlResponse,
    dependencies=[Depends(_limit_api)],
)
async def get_material_download_url(
    materialId: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> DownloadUrlResponse:
    url, _local = await document_service.create_download_url(db, user_id, materialId)
    return DownloadUrlResponse(
        download_url=url,
        expires_in_seconds=min(settings.SIGNED_URL_TTL_SECONDS, 300),
    )


@router.get("/materials/{materialId}/download", dependencies=[Depends(_limit_api)])
async def download_local_material(
    materialId: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    storage = get_storage_provider()
    if not isinstance(storage, LocalStorageProvider):
        raise HTTPException(status_code=404, detail="Not found")
    doc = await document_service.get_owned_document(db, user_id, materialId)
    if doc.status in {"pending_upload", "failed"}:
        raise HTTPException(status_code=409, detail="Document is not available")
    data = await storage.download_bytes(doc.s3_storage_key)
    filename = quote(doc.original_filename or "course-material", safe="")
    return StreamingResponse(
        iter([data]),
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{filename}",
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "sandbox",
            "Cache-Control": "private, no-store",
        },
    )


@router.delete("/materials/{materialId}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(_limit_api)])
async def remove_material(
    materialId: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> Response:
    await document_service.delete_document(db, user_id, materialId)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/courses/{courseId}/materials",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_202_ACCEPTED
)
async def upload_course_material(
    courseId: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
    _rate_limit: None = Depends(_limit_api),
):
    """
    Upload course material (PDF, PPTX, Image, Audio, Video).
    1. Verifies course ownership.
    2. Validates format and resource limits.
    3. Streams file to authorized private storage.
    4. Dispatches asynchronous multimodal extraction worker.
    """
    try:
        file_bytes = await file.read(MAX_FILE_SIZE + 1)
        if len(file_bytes) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File exceeds the permitted size")
        file_name = file.filename or "uploaded_document.pdf"
        content_type = file.content_type or "application/octet-stream"

        doc, job = await IngestionService.validate_and_register_upload(
            db=db,
            user_id=user_id,
            course_id=courseId,
            file_name=file_name,
            file_bytes=file_bytes,
            content_type=content_type,
            title_override=title
        )

        # Enqueue background extraction task
        background_tasks.add_task(_run_background_ingestion, doc.id, job.id)

        return DocumentUploadResponse(
            material=CourseDocumentResponse(
                id=doc.id,
                course_id=doc.course_id,
                title=doc.title,
                type=doc.document_type,
                file_size_bytes=doc.file_size_bytes,
                formatted_size=doc.formatted_size,
                page_count_or_duration=doc.page_count_or_duration,
                uploaded_at=doc.created_at.strftime("%b %d, %Y"),
                status=doc.status,
                extracted_concepts=doc.extracted_concepts,
                summary=doc.summary
            ),
            job=ProcessingJobResponse(
                id=job.id,
                document_id=job.document_id,
                stage=job.stage,
                stage_number=job.stage_number,
                total_stages=job.total_stages,
                stage_description=job.stage_description,
                progress_percent=job.progress_percent,
                is_completed=job.is_completed,
                error=job.error_log
            )
        )
    except CourseCompassException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get(
    "/courses/{courseId}/materials",
    response_model=List[CourseDocumentResponse]
)
async def list_course_materials(
    courseId: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
    _rate_limit: None = Depends(_limit_api),
):
    """List all indexed or processing materials for a course."""
    try:
        docs = await IngestionService.get_course_documents(db, user_id, courseId)
        return [
            CourseDocumentResponse(
                id=d.id,
                course_id=d.course_id,
                title=d.title,
                type=d.document_type,
                file_size_bytes=d.file_size_bytes,
                formatted_size=d.formatted_size,
                page_count_or_duration=d.page_count_or_duration,
                uploaded_at=d.created_at.strftime("%b %d, %Y"),
                status=d.status,
                extracted_concepts=d.extracted_concepts,
                summary=d.summary
            )
            for d in docs
        ]
    except CourseCompassException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get(
    "/jobs/{jobId}/status",
    response_model=ProcessingJobResponse
)
async def get_processing_job_status(
    jobId: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
    _rate_limit: None = Depends(_limit_api),
):
    """Poll processing job status for the 7-stage visual pipeline."""
    try:
        job = await IngestionService.get_job_status(db, user_id, jobId)
        return ProcessingJobResponse(
            id=job.id,
            document_id=job.document_id,
            stage=job.stage,
            stage_number=job.stage_number,
            total_stages=job.total_stages,
            stage_description=job.stage_description,
            progress_percent=job.progress_percent,
            is_completed=job.is_completed,
            error=job.error_log
        )
    except CourseCompassException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get(
    "/materials/{materialId}/pages",
    response_model=List[DocumentPageDetailResponse]
)
async def get_material_pages(
    materialId: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
    _rate_limit: None = Depends(_limit_api),
):
    """Get extracted provenance pages and visual element counts for a material."""
    try:
        pages = await IngestionService.get_document_pages(db, user_id, materialId)
        return [
            DocumentPageDetailResponse(
                id=p.id,
                document_id=p.document_id,
                page_number=p.page_number,
                slide_number=p.slide_number,
                timestamp_seconds=p.timestamp_seconds,
                location_label=p.location_label,
                cleaned_text=p.cleaned_text,
                extracted_concepts=[],
                visual_elements_count=len(p.visual_elements)
            )
            for p in pages
        ]
    except CourseCompassException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
