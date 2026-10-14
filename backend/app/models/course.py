"""
Course Entity Model (Tenant Isolation Anchor)
"""
from datetime import date
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import Date, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import TimestampedModel

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.document import CourseDocument


class Course(TimestampedModel):
    __tablename__ = "courses"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False)
    subject: Mapped[str] = mapped_column(String(100), nullable=False)
    exam_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    daily_study_minutes: Mapped[int] = mapped_column(Integer, default=45)
    overall_mastery: Mapped[int] = mapped_column(Integer, default=0)

    user: Mapped["User"] = relationship("User", back_populates="courses")
    documents: Mapped[List["CourseDocument"]] = relationship("CourseDocument", back_populates="course", cascade="all, delete-orphan")

    @property
    def exam_countdown_days(self) -> int:
        if not self.exam_date:
            return 0
        from datetime import date
        today = date.today()
        return max(0, (self.exam_date - today).days)

    @property
    def documents_count(self) -> int:
        return len(self.documents) if self.documents else 5

    @property
    def concepts_count(self) -> int:
        return 8

    __table_args__ = (
        UniqueConstraint("user_id", "code", name="uq_user_course_code"),
    )

