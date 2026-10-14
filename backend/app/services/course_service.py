from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.core.audit import record_audit
from app.core.exceptions import CourseCompassException
from app.models.course import Course
from app.models.document import CourseDocument, DocumentPage, VisualElement
from app.providers.storage.s3 import get_storage_provider
from app.schemas.course import CourseCreate


def _not_found() -> CourseCompassException:
    return CourseCompassException(
        "Course not found or unauthorized", 404, {"code": "COURSE_NOT_FOUND"}
    )


async def list_courses(db: AsyncSession, user_id: str) -> list[Course]:
    result = await db.execute(
        select(Course).options(selectinload(Course.documents))
        .where(Course.user_id == user_id).order_by(Course.created_at.desc())
    )
    return list(result.scalars().all())


async def create_course(db: AsyncSession, user_id: str, payload: CourseCreate) -> Course:
    course = Course(
        user_id=user_id,
        name=payload.name.strip(),
        code=payload.code.strip(),
        subject=payload.subject.strip(),
        exam_date=payload.exam_date,
        daily_study_minutes=payload.daily_study_minutes,
    )
    db.add(course)
    try:
        await db.flush()
        await record_audit(db, "course.create", "course", actor_user_id=user_id, resource_id=course.id)
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise CourseCompassException(
            "A course with this code already exists", 409, {"code": "COURSE_CODE_CONFLICT"}
        ) from exc
    await db.refresh(course)
    return course


async def get_owned_course(db: AsyncSession, user_id: str, course_id: str, *, lock: bool = False) -> Course:
    query = select(Course).options(selectinload(Course.documents)).where(
        Course.id == course_id, Course.user_id == user_id
    )
    if lock:
        query = query.with_for_update()
    result = await db.execute(query)
    course = result.scalar_one_or_none()
    if course is None:
        raise _not_found()
    return course


async def get_course(db: AsyncSession, user_id: str, course_id: str) -> Course:
    return await get_owned_course(db, user_id, course_id)


async def delete_course(db: AsyncSession, user_id: str, course_id: str) -> None:
    course = await get_owned_course(db, user_id, course_id, lock=True)
    result = await db.execute(
        select(CourseDocument).where(CourseDocument.course_id == course_id).with_for_update()
    )
    documents = list(result.scalars().all())
    keys = [doc.s3_storage_key for doc in documents]
    if keys:
        visual_result = await db.execute(
            select(VisualElement.s3_image_key)
            .join(DocumentPage, VisualElement.page_id == DocumentPage.id)
            .join(CourseDocument, DocumentPage.document_id == CourseDocument.id)
            .where(CourseDocument.course_id == course_id, VisualElement.s3_image_key.is_not(None))
        )
        keys.extend(key for key in visual_result.scalars().all() if key)

    storage = get_storage_provider()
    try:
        for key in dict.fromkeys(keys):
            await storage.delete_file(key)
    except Exception as exc:
        await db.rollback()
        raise CourseCompassException(
            "Course files could not be safely deleted; course data was retained",
            502,
            {"code": "STORAGE_CLEANUP_FAILED"},
        ) from exc

    await record_audit(
        db, "course.delete", "course", actor_user_id=user_id, resource_id=course.id,
        metadata={"documentCount": len(documents)},
    )
    await db.delete(course)
    await db.commit()


async def update_course(
    db: AsyncSession, user_id: str, course_id: str, payload
) -> Course:
    course = await get_owned_course(db, user_id, course_id, lock=True)
    if payload.name is not None:
        course.name = payload.name.strip()
    if payload.code is not None:
        course.code = payload.code.strip()
    if payload.subject is not None:
        course.subject = payload.subject.strip()
    if payload.exam_date is not None:
        course.exam_date = payload.exam_date
    if payload.daily_study_minutes is not None:
        course.daily_study_minutes = payload.daily_study_minutes
    try:
        await db.flush()
        await record_audit(db, "course.update", "course", actor_user_id=user_id, resource_id=course.id)
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise CourseCompassException(
            "A course with this code already exists", 409, {"code": "COURSE_CODE_CONFLICT"}
        ) from exc
    await db.refresh(course)
    return course

