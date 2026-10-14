from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.course import Course
from app.schemas.course import CourseCreate, CourseUpdate, CourseResponse
from app.services import course_service
from app.core.rate_limit import enforce_rate_limit
from fastapi import Request

router = APIRouter(prefix="/courses", tags=["Courses"])


async def _limit_api(request: Request) -> None:
    await enforce_rate_limit(request)


def _to_response(course: Course) -> CourseResponse:
    return CourseResponse(
        id=course.id,
        user_id=course.user_id,
        name=course.name,
        code=course.code,
        subject=course.subject,
        exam_date=course.exam_date,
        daily_study_minutes=course.daily_study_minutes,
        overall_mastery=course.overall_mastery,
        documents_count=len(course.documents) if "documents" in course.__dict__ else 0,
        created_at=course.created_at,
        updated_at=course.updated_at,
    )


@router.get("", response_model=list[CourseResponse], dependencies=[Depends(_limit_api)])
async def list_courses(
    user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)
) -> list[CourseResponse]:
    return [_to_response(course) for course in await course_service.list_courses(db, user_id)]


@router.post("", response_model=CourseResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(_limit_api)])
async def create_course(
    payload: CourseCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> CourseResponse:
    return _to_response(await course_service.create_course(db, user_id, payload))


@router.get("/{courseId}", response_model=CourseResponse, dependencies=[Depends(_limit_api)])
async def retrieve_course(
    courseId: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> CourseResponse:
    return _to_response(await course_service.get_course(db, user_id, courseId))


@router.patch("/{courseId}", response_model=CourseResponse, dependencies=[Depends(_limit_api)])
async def modify_course(
    courseId: str,
    payload: CourseUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> CourseResponse:
    return _to_response(await course_service.update_course(db, user_id, courseId, payload))


@router.delete("/{courseId}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(_limit_api)])
async def remove_course(
    courseId: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> Response:
    await course_service.delete_course(db, user_id, courseId)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

