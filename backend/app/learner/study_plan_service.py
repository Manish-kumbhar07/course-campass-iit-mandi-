"""
Study plan generator: creates daily plans respecting time and exam constraints.
"""
from typing import List, Optional
from datetime import date, timedelta
from .schemas import GeneratedStudyPlan, StudyRecommendation
from .recommendation import RecommendationService


class StudyPlanGenerator:
    """Generates multi-day study plans from recommendations."""
    
    @classmethod
    def generate(
        cls,
        course_id: str,
        user_id: str,
        concepts: List[dict],
        relationships: List[dict],
        daily_minutes: int = 45,
        days_until_exam: Optional[int] = None,
        max_days: int = 7,
    ) -> GeneratedStudyPlan:
        """Generate a study plan fitting within available time."""
        effective_days = min(max_days, days_until_exam) if days_until_exam is not None and days_until_exam > 0 else max_days
        total_minutes = daily_minutes * effective_days
        
        recommendations, overflow = RecommendationService.generate_recommendations(
            concepts=concepts,
            relationships=relationships,
            available_minutes=total_minutes,
            max_recommendations=effective_days * 3,  # up to 3 per day
        )
        
        allocated = sum(r.estimated_minutes for r in recommendations)
        
        return GeneratedStudyPlan(
            course_id=course_id,
            user_id=user_id,
            total_minutes_available=total_minutes,
            total_minutes_allocated=allocated,
            days_until_exam=days_until_exam,
            recommendations=recommendations,
            overflow_concepts=overflow,
        )
