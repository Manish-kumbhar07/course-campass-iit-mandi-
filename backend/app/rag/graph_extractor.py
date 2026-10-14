"""
Knowledge Graph Extractor & Canonical Concept Normalizer
Extracts structured topics, concepts, and DAG dependency relationships (prerequisite and part-of)
from ingested course material, with duplicate normalization and cycle prevention.
"""
import logging
import re
import uuid
from typing import Dict, List, Optional, Set, Tuple
from pydantic import BaseModel, Field
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import CourseDocument, DocumentChunk, DocumentPage
from app.models.graph import Concept, ConceptRelationship, Topic, Misconception
from app.models.tutor import Citation
from app.rag.chunking import DeterministicChunker, TextChunk
from app.rag.embeddings.factory import get_embedding_provider
from app.models.document import ChunkEmbedding
import json

logger = logging.getLogger("coursecompass.rag.graph")


# Canonical alias dictionary for academic Computer Science & Courseware
CANONICAL_ALIASES: Dict[str, str] = {
    "dfs": "Depth-First Search (DFS)",
    "depth first search": "Depth-First Search (DFS)",
    "depth-first search": "Depth-First Search (DFS)",
    "bfs": "Breadth-First Search (BFS)",
    "breadth first search": "Breadth-First Search (BFS)",
    "breadth-first search": "Breadth-First Search (BFS)",
    "base cases": "Recursion Base Cases",
    "base case": "Recursion Base Cases",
    "recursion base case": "Recursion Base Cases",
    "call stack": "Call Stack Mechanics",
    "stack frames": "Call Stack Mechanics",
    "activation records": "Call Stack Mechanics",
    "three coloring": "Cycle Detection & Three-Coloring",
    "cycle detection": "Cycle Detection & Three-Coloring",
    "graph representations": "Graph Representations",
    "adjacency list": "Graph Representations",
    "divide and conquer": "Divide and Conquer Recurrence",
    "topological sort": "Topological Sorting",
}


def normalize_concept_name(raw_name: str) -> Tuple[str, str]:
    """
    Returns (display_name, canonical_key).
    Canonical key is alphanumeric lowercase for collision resolution.
    """
    cleaned = raw_name.strip()
    lookup_key = re.sub(r"[^\w\s-]", "", cleaned.lower()).strip()
    if lookup_key in CANONICAL_ALIASES:
        display_name = CANONICAL_ALIASES[lookup_key]
    else:
        # Title case normalized
        display_name = cleaned.title()

    canonical_key = re.sub(r"[^a-z0-9]", "", display_name.lower())
    return display_name, canonical_key


class ExtractedConceptItem(BaseModel):
    name: str
    topic_name: str = "General Foundations"
    summary: str
    primary_misconception: str = ""
    difficulty: str = "Foundational"
    prerequisite_names: List[str] = Field(default_factory=list)
    part_of_topic: Optional[str] = None
    confidence: float = 1.0


class KnowledgeGraphService:
    """Service for extracting, normalizing, and updating the course knowledge graph."""

    @staticmethod
    def would_create_cycle(
        existing_edges: List[Tuple[str, str]],
        new_source: str,
        new_target: str
    ) -> bool:
        """
        Check if adding directed edge new_source -> new_target (prerequisite -> dependent)
        creates a directed cycle in the DAG.
        A cycle is created if there is already a path from new_target to new_source.
        """
        if new_source == new_target:
            return True

        # Build adjacency list: node -> set of adjacent nodes
        adj: Dict[str, Set[str]] = {}
        for src, tgt in existing_edges:
            adj.setdefault(src, set()).add(tgt)

        # BFS from new_target to see if new_source can be reached
        visited = set()
        queue = [new_target]
        while queue:
            curr = queue.pop(0)
            if curr == new_source:
                return True
            if curr not in visited:
                visited.add(curr)
                queue.extend(adj.get(curr, set()) - visited)

        return False

    @classmethod
    async def index_document_chunks_and_embeddings(
        cls,
        db: AsyncSession,
        document_id: str,
        course_id: str,
        chunk_size_words: int = 250,
        overlap_words: int = 50
    ) -> List[DocumentChunk]:
        """
        Deterministic chunking and dense embedding generation for a document.
        Atomically replaces old chunks and embeddings for this document.
        """
        # Fetch pages
        res = await db.execute(
            select(DocumentPage)
            .where(DocumentPage.document_id == document_id)
            .order_by(DocumentPage.page_number)
        )
        pages = res.scalars().all()
        if not pages:
            return []

        # Remove existing chunks for this document (embeddings cascade delete)
        await db.execute(delete(DocumentChunk).where(DocumentChunk.document_id == document_id))
        await db.flush()

        chunker = DeterministicChunker(chunk_size_words=chunk_size_words, overlap_words=overlap_words)
        created_chunks: List[DocumentChunk] = []
        global_idx = 0

        # Chunk each page text
        for p in pages:
            from app.schemas.extraction import ExtractedSegment
            seg = ExtractedSegment(
                segment_id=f"seg-{p.id}",
                document_id=document_id,
                segment_type="page",
                location_label=p.location_label,
                page_number=p.page_number,
                slide_number=p.slide_number,
                timestamp_seconds=p.timestamp_seconds,
                raw_text=p.raw_text,
                cleaned_text=p.cleaned_text,
            )
            raw_chunks: List[TextChunk] = chunker.chunk_segment(
                segment=seg,
                course_id=course_id,
                page_id=p.id,
                starting_index=global_idx
            )
            for rc in raw_chunks:
                chunk_obj = DocumentChunk(
                    id=str(uuid.uuid4()),
                    document_id=document_id,
                    course_id=course_id,
                    page_id=p.id,
                    chunk_index=rc.chunk_index,
                    content=rc.content,
                    token_count=rc.token_count,
                    location_label=rc.location_label,
                    page_number=rc.page_number,
                    slide_number=rc.slide_number,
                    timestamp_seconds=rc.timestamp_seconds
                )
                db.add(chunk_obj)
                created_chunks.append(chunk_obj)
                global_idx += 1

        await db.flush()

        # Generate embeddings in batch
        provider = get_embedding_provider()
        texts = [c.content for c in created_chunks]
        vectors = await provider.embed_documents(texts)

        for chunk_obj, vec in zip(created_chunks, vectors):
            emb_obj = ChunkEmbedding(
                chunk_id=chunk_obj.id,
                embedding_model=provider.model_name,
                embedding_json=json.dumps(vec)
            )
            db.add(emb_obj)

        await db.flush()
        return created_chunks

    @classmethod
    async def add_or_merge_concepts(
        cls,
        db: AsyncSession,
        course_id: str,
        items: List[ExtractedConceptItem],
        document_id: Optional[str] = None
    ) -> List[Concept]:
        """
        Merge extracted concepts with normalization, avoiding duplicates and circular DAG edges.
        """
        # Fetch existing concepts for course
        c_res = await db.execute(select(Concept).where(Concept.course_id == course_id))
        existing_concepts = {
            (c.canonical_name or re.sub(r"[^a-z0-9]", "", c.name.lower())): c
            for c in c_res.scalars().all()
        }

        # Fetch existing topics for course
        t_res = await db.execute(select(Topic).where(Topic.course_id == course_id))
        topics_map = {t.title.lower(): t for t in t_res.scalars().all()}

        # Fetch existing prerequisite edges for DAG cycle checking
        edge_res = await db.execute(
            select(ConceptRelationship.source_concept_id, ConceptRelationship.target_concept_id)
            .where(
                ConceptRelationship.course_id == course_id,
                ConceptRelationship.relationship_type == "prerequisite"
            )
        )
        existing_edges: List[Tuple[str, str]] = [(src, tgt) for src, tgt in edge_res.all()]

        saved_concepts: List[Concept] = []

        for item in items:
            display_name, canon_key = normalize_concept_name(item.name)

            # Ensure topic exists
            topic_obj = topics_map.get(item.topic_name.lower())
            if not topic_obj:
                topic_obj = Topic(
                    id=str(uuid.uuid4()),
                    course_id=course_id,
                    title=item.topic_name,
                    description=f"Curriculum module covering {item.topic_name}",
                    sort_order=len(topics_map) + 1
                )
                db.add(topic_obj)
                await db.flush()
                topics_map[item.topic_name.lower()] = topic_obj

            if canon_key in existing_concepts:
                # Merge into existing concept
                concept = existing_concepts[canon_key]
                # If existing summary is short or placeholder, enrich it
                if len(item.summary) > len(concept.summary):
                    concept.summary = item.summary
                if item.primary_misconception and not concept.primary_misconception:
                    concept.primary_misconception = item.primary_misconception
            else:
                # Create fresh concept
                concept = Concept(
                    id=f"c-{canon_key[:20]}-{uuid.uuid4().hex[:4]}",
                    course_id=course_id,
                    topic_id=topic_obj.id,
                    name=display_name,
                    canonical_name=canon_key,
                    difficulty=item.difficulty,
                    mastery_percent=0,
                    status="learning",
                    summary=item.summary,
                    primary_misconception=item.primary_misconception or f"Misinterpreting boundaries of {display_name}"
                )
                db.add(concept)
                await db.flush()
                existing_concepts[canon_key] = concept

            saved_concepts.append(concept)

        # Connect prerequisite and part_of edges
        for item in items:
            _, src_canon = normalize_concept_name(item.name)
            current_concept = existing_concepts.get(src_canon)
            if not current_concept:
                continue

            for prereq_raw in item.prerequisite_names:
                _, prereq_canon = normalize_concept_name(prereq_raw)
                prereq_concept = existing_concepts.get(prereq_canon)
                if not prereq_concept or prereq_concept.id == current_concept.id:
                    continue

                # Directed edge: prereq_concept.id -> current_concept.id
                # Check cycle
                if not cls.would_create_cycle(existing_edges, prereq_concept.id, current_concept.id):
                    edge_check = await db.execute(
                        select(ConceptRelationship).where(
                            ConceptRelationship.source_concept_id == prereq_concept.id,
                            ConceptRelationship.target_concept_id == current_concept.id,
                            ConceptRelationship.relationship_type == "prerequisite"
                        )
                    )
                    if not edge_check.scalar_one_or_none():
                        edge = ConceptRelationship(
                            id=str(uuid.uuid4()),
                            course_id=course_id,
                            source_concept_id=prereq_concept.id,
                            target_concept_id=current_concept.id,
                            relationship_type="prerequisite",
                            confidence=item.confidence
                        )
                        db.add(edge)
                        existing_edges.append((prereq_concept.id, current_concept.id))
                else:
                    logger.warning(
                        "Skipped cyclic prerequisite edge: %s -> %s",
                        prereq_concept.name, current_concept.name
                    )

            # Connect part-of relationship if topic is defined
            if item.part_of_topic:
                t_obj = topics_map.get(item.part_of_topic.lower())
                if t_obj:
                    current_concept.topic_id = t_obj.id

        await db.flush()
        return saved_concepts

    @classmethod
    async def delete_document_cleanup(
        cls,
        db: AsyncSession,
        document_id: str
    ) -> bool:
        """
        Delete document and cascadingly purge its chunks, embeddings, visual elements,
        and citations.
        """
        doc = await db.get(CourseDocument, document_id)
        if not doc:
            return False

        # Delete linked citations
        await db.execute(delete(Citation).where(Citation.document_id == document_id))
        # Delete document record (foreign keys with ON DELETE CASCADE handle pages, chunks, embeddings)
        await db.delete(doc)
        await db.commit()
        return True

