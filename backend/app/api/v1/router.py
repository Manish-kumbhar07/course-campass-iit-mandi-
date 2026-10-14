"""
Central v1 API Router
"""
from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    courses,
    materials,
    concepts,
    tutor,
    quizzes,
    mastery,
    course_map,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(courses.router)
api_router.include_router(materials.router)
api_router.include_router(concepts.router)
api_router.include_router(course_map.router)
api_router.include_router(tutor.router)
api_router.include_router(quizzes.router)
api_router.include_router(mastery.router)
