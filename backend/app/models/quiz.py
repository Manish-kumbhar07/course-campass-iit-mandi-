import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, Boolean, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.models.base import Base


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    concept_id = Column(String(36), ForeignKey("concepts.id", ondelete="SET NULL"), nullable=True, index=True)
    difficulty = Column(String(50), default="Intermediate")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    questions = relationship("QuizQuestion", back_populates="quiz", cascade="all, delete-orphan", order_by="QuizQuestion.id")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    quiz_id = Column(String(36), ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True)
    concept_id = Column(String(36), ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False, index=True)
    prompt = Column(Text, nullable=False)
    code_snippet = Column(Text, nullable=True)
    question_type = Column(String(50), nullable=False, default="multiple_choice")  # multiple_choice, short_answer, numerical
    difficulty = Column(String(50), nullable=False, default="Intermediate")
    explanation = Column(Text, nullable=False)
    citation_id = Column(String(36), ForeignKey("citations.id", ondelete="SET NULL"), nullable=True)
    
    # Adaptive & Multi-format Assessment extensions
    expected_answer = Column(Text, nullable=True)
    numerical_value = Column(Float, nullable=True)
    numerical_tolerance = Column(Float, nullable=True, default=0.0)
    numerical_unit = Column(String(50), nullable=True)
    rubric = Column(Text, nullable=True)
    hint = Column(Text, nullable=True)
    fingerprint = Column(String(64), nullable=True, index=True)
    verification_status = Column(String(50), nullable=False, default="verified")  # verified, rejected, pending
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    quiz = relationship("Quiz", back_populates="questions")
    options = relationship("QuizOption", back_populates="question", cascade="all, delete-orphan", order_by="QuizOption.sort_order")
    citation = relationship("Citation")


class QuizOption(Base):
    __tablename__ = "quiz_options"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    question_id = Column(String(36), ForeignKey("quiz_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    text = Column(Text, nullable=False)
    is_correct = Column(Boolean, nullable=False, default=False)
    misconception_explanation = Column(Text, nullable=True)
    sort_order = Column(Integer, nullable=False, default=1)

    question = relationship("QuizQuestion", back_populates="options")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    quiz_id = Column(String(36), ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    score_percent = Column(Integer, nullable=False, default=0)
    total_questions = Column(Integer, nullable=False, default=0)
    correct_count = Column(Integer, nullable=False, default=0)
    mastery_gain_percent = Column(Integer, nullable=False, default=0)
    status = Column(String(50), nullable=False, default="completed")  # in_progress, completed

    quiz = relationship("Quiz", back_populates="attempts")
    answers = relationship("QuizAttemptAnswer", back_populates="attempt", cascade="all, delete-orphan")


class QuizAttemptAnswer(Base):
    __tablename__ = "quiz_attempt_answers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    attempt_id = Column(String(36), ForeignKey("quiz_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(36), ForeignKey("quiz_questions.id", ondelete="CASCADE"), nullable=False)
    selected_option_id = Column(String(36), ForeignKey("quiz_options.id", ondelete="CASCADE"), nullable=True)
    
    # Adaptive submission answers
    submitted_text = Column(Text, nullable=True)
    score = Column(Float, nullable=False, default=0.0)  # 0.0 to 1.0
    is_correct = Column(Boolean, nullable=False, default=False)
    feedback = Column(Text, nullable=True)
    misconception_tag = Column(String(100), nullable=True)
    grading_method = Column(String(50), nullable=False, default="deterministic")  # deterministic, rubric_semantic

    attempt = relationship("QuizAttempt", back_populates="answers")
