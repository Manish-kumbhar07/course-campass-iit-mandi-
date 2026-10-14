import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, Boolean, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from app.models.base import Base


class TopicMastery(Base):
    __tablename__ = "topic_mastery"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    mastery_percent = Column(Integer, nullable=False, default=0)
    concepts_total = Column(Integer, nullable=False, default=0)
    concepts_mastered = Column(Integer, nullable=False, default=0)
    concepts_developing = Column(Integer, nullable=False, default=0)
    concepts_attention = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "topic_id", name="uq_user_topic_mastery"),
    )


class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    day_number = Column(Integer, nullable=False)
    date_string = Column(String(50), nullable=False)
    focus_concept_id = Column(String(36), ForeignKey("concepts.id", ondelete="SET NULL"), nullable=True)
    focus_title = Column(String(255), nullable=False)
    minutes_budget = Column(Integer, nullable=False, default=45)
    status = Column(String(50), nullable=False, default="scheduled")  # completed, in-progress, scheduled
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    tasks = relationship("StudyPlanTask", back_populates="plan", cascade="all, delete-orphan", order_by="StudyPlanTask.id")


class StudyPlanTask(Base):
    __tablename__ = "study_plan_tasks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    study_plan_id = Column(String(36), ForeignKey("study_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    duration_minutes = Column(Integer, nullable=False, default=15)
    completed = Column(Boolean, nullable=False, default=False)
    task_type = Column(String(50), nullable=False, default="tutor")  # tutor, quiz, flashcard, reading
    target_citation_id = Column(String(36), ForeignKey("citations.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    plan = relationship("StudyPlan", back_populates="tasks")
    citation = relationship("Citation")

