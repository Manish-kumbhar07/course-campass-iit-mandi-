from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.graph import Concept, ConceptRelationship, Topic
from app.models.tutor import Citation
from app.schemas.graph import ConceptOut, SourceCitationOut


class ConceptService:
    @staticmethod
    async def get_course_concepts(db: AsyncSession, course_id: str) -> List[ConceptOut]:
        # Fetch concepts and their topics
        result = await db.execute(
            select(Concept, Topic.title.label("topic_title"))
            .outerjoin(Topic, Topic.id == Concept.topic_id)
            .where(Concept.course_id == course_id)
            .order_by(Concept.name)
        )
        concept_rows = result.all()
        if not concept_rows:
            return []

        concept_ids = [c.id for c, _ in concept_rows]

        # Fetch prerequisite relationships (source -> target: source is prereq of target)
        prereq_res = await db.execute(
            select(ConceptRelationship).where(
                (ConceptRelationship.target_concept_id.in_(concept_ids)) |
                (ConceptRelationship.source_concept_id.in_(concept_ids))
            )
        )
        edges = prereq_res.scalars().all()

        prereqs_map: dict[str, list[str]] = {cid: [] for cid in concept_ids}
        dependents_map: dict[str, list[str]] = {cid: [] for cid in concept_ids}

        for edge in edges:
            if edge.target_concept_id in prereqs_map:
                prereqs_map[edge.target_concept_id].append(edge.source_concept_id)
            if edge.source_concept_id in dependents_map:
                dependents_map[edge.source_concept_id].append(edge.target_concept_id)

        # Fetch citations linked to concepts
        cite_res = await db.execute(
            select(Citation).where(Citation.concept_id.in_(concept_ids))
        )
        citations = cite_res.scalars().all()
        citations_map: dict[str, list[SourceCitationOut]] = {cid: [] for cid in concept_ids}

        for cite in citations:
            if cite.concept_id in citations_map:
                citations_map[cite.concept_id].append(
                    SourceCitationOut(
                        id=cite.id,
                        document_id=cite.document_id,
                        source_title=cite.source_title,
                        source_type=cite.source_type,
                        location_label=cite.location_label,
                        page_number=cite.page_number,
                        slide_number=cite.slide_number,
                        timestamp_seconds=cite.timestamp_seconds,
                        excerpt=cite.excerpt,
                        context_snippet=cite.context_snippet,
                        verification_confidence=cite.verification_confidence,
                    )
                )

        output: List[ConceptOut] = []
        for c, topic_title in concept_rows:
            output.append(
                ConceptOut(
                    id=c.id,
                    course_id=c.course_id,
                    topic_id=c.topic_id,
                    topic=topic_title or "General Foundations",
                    name=c.name,
                    difficulty=c.difficulty,
                    mastery_percent=c.mastery_percent,
                    status=c.status,
                    summary=c.summary,
                    primary_misconception=c.primary_misconception,
                    prerequisite_ids=prereqs_map.get(c.id, []),
                    dependent_concept_ids=dependents_map.get(c.id, []),
                    citations=citations_map.get(c.id, []),
                )
            )

        return output

    @staticmethod
    async def get_concept_by_id(db: AsyncSession, course_id: str, concept_id: str) -> Optional[ConceptOut]:
        concepts = await ConceptService.get_course_concepts(db, course_id)
        for c in concepts:
            if c.id == concept_id:
                return c
        return None

