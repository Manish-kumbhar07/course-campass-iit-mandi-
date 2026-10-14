from typing import Optional, List
from app.schemas.common import ApiSchema
from app.schemas.graph import SourceCitationOut


class TopicMasteryOut(ApiSchema):
    topic_id: str
    topic_title: str
    mastery_percent: int
    concepts_total: int
    concepts_mastered: int
    concepts_developing: int
    concepts_attention: int


class StudyPlanTaskOut(ApiSchema):
    id: str
    title: str
    duration_minutes: int
    completed: bool
    type: str  # 'tutor' | 'quiz' | 'flashcard' | 'reading'
    target_citation: Optional[SourceCitationOut] = None


class StudyPlanDayOut(ApiSchema):
    day_number: int
    date_string: str
    focus_concept_id: Optional[str] = None
    focus_title: str
    minutes_budget: int
    status: str  # 'completed' | 'in-progress' | 'scheduled'
    tasks: List[StudyPlanTaskOut] = []

