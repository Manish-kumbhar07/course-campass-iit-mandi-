import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.models.base import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False, default="Study Session")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    messages = relationship("TutorMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="TutorMessage.created_at")


class TutorMessage(Base):
    __tablename__ = "tutor_messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender = Column(String(20), nullable=False)  # 'user' | 'tutor'
    text = Column(Text, nullable=False)
    explanation_level = Column(String(50), nullable=True, default="rigorous")  # introductory, rigorous, exam_prep
    answer_state = Column(String(50), nullable=True)  # supported, partially_supported, not_found, outside_materials
    unsupported_warning = Column(Text, nullable=True)
    concept_id = Column(String(36), ForeignKey("concepts.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    conversation = relationship("Conversation", back_populates="messages")
    citations = relationship("Citation", back_populates="message", cascade="all, delete-orphan")


class Citation(Base):
    __tablename__ = "citations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    message_id = Column(String(36), ForeignKey("tutor_messages.id", ondelete="CASCADE"), nullable=True, index=True)
    concept_id = Column(String(36), ForeignKey("concepts.id", ondelete="SET NULL"), nullable=True, index=True)
    document_id = Column(String(36), ForeignKey("course_documents.id", ondelete="CASCADE"), nullable=True, index=True)
    chunk_id = Column(String(36), ForeignKey("document_chunks.id", ondelete="SET NULL"), nullable=True, index=True)
    
    source_title = Column(String(300), nullable=False)
    source_type = Column(String(50), nullable=False)  # pdf, video, slides, audio, image, notes
    location_label = Column(String(150), nullable=False)  # e.g. "Chapter 4, Page 112" or "Timestamp 14:32"
    page_number = Column(Integer, nullable=True)
    slide_number = Column(Integer, nullable=True)
    timestamp_seconds = Column(Integer, nullable=True)
    excerpt = Column(Text, nullable=False)
    context_snippet = Column(Text, nullable=False)
    verification_confidence = Column(String(50), nullable=False, default="verified")  # verified, partial, inconclusive
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    message = relationship("TutorMessage", back_populates="citations")

