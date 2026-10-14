import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, Float, ForeignKey, DateTime, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import relationship
from app.models.base import Base


class Topic(Base):
    __tablename__ = "topics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    sort_order = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    concepts = relationship("Concept", back_populates="topic_rel", cascade="all, delete-orphan")


class Concept(Base):
    __tablename__ = "concepts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(String(36), ForeignKey("topics.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(255), nullable=False)
    canonical_name = Column(String(255), nullable=True, index=True)
    difficulty = Column(String(50), nullable=False, default="Foundational")  # Foundational, Intermediate, Advanced
    mastery_percent = Column(Integer, nullable=False, default=0)
    status = Column(String(50), nullable=False, default="learning")  # mastered, learning, attention, locked
    summary = Column(Text, nullable=False)
    primary_misconception = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    topic_rel = relationship("Topic", back_populates="concepts")
    misconceptions = relationship("Misconception", back_populates="concept", cascade="all, delete-orphan")


class ConceptRelationship(Base):
    __tablename__ = "concept_relationships"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=True, index=True)
    source_concept_id = Column(String(36), ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False, index=True)
    target_concept_id = Column(String(36), ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False, index=True)
    relationship_type = Column(String(50), nullable=False, default="prerequisite")  # prerequisite, part_of, component, extension
    confidence = Column(Float, nullable=False, default=1.0)
    evidence_chunk_id = Column(String(36), ForeignKey("document_chunks.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("source_concept_id", "target_concept_id", "relationship_type", name="uq_concept_edge_rel"),
    )


class Misconception(Base):
    __tablename__ = "misconceptions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    concept_id = Column(String(36), ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False, index=True)
    student_confusion = Column(Text, nullable=False)
    diagnostic_advice = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    concept = relationship("Concept", back_populates="misconceptions")

