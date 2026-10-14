import json
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker

from app.core.database import get_db
from app.core.exceptions import UnauthorizedAccessError
from app.main import app
from app.models.course import Course
from app.models.document import CourseDocument, DocumentChunk, DocumentPage, ChunkEmbedding
from app.models.graph import Concept, ConceptRelationship
from app.models.user import User
from app.rag.chunking import DeterministicChunker
from app.rag.embeddings.deterministic import DeterministicLocalEmbeddingProvider
from app.rag.embeddings.factory import set_embedding_provider, get_embedding_provider
from app.rag.graph_extractor import KnowledgeGraphService, ExtractedConceptItem, normalize_concept_name
from app.rag.retrieval import RetrievalService
from app.schemas.extraction import ExtractedSegment
from app.services.seed_service import seed_demo_course


@pytest_asyncio.fixture
async def rag_client(test_engine):
    session_factory = async_sessionmaker(test_engine, expire_on_commit=False)

    async def override_db():
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_db

    # Ensure deterministic embedding provider is active
    set_embedding_provider(DeterministicLocalEmbeddingProvider(dimension=768))

    # Seed demo course CS 204
    async with session_factory() as session:
        await seed_demo_course(session)

    from app.core.rate_limit import LocalRateLimiter
    app.state.rate_limiter = LocalRateLimiter()

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://testserver"
    ) as client:
        yield client, session_factory

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_01_deterministic_chunking_with_overlap_and_provenance():
    """Test 1: Sliding window chunker produces deterministic splits and preserves metadata."""
    chunker = DeterministicChunker(chunk_size_words=20, overlap_words=5, min_chunk_words=5)

    long_text = (
        "In computer science recursion is a method of solving a computational problem where the solution depends on solutions to smaller instances. "
        "A recursive procedure must have a halting base case. "
        "Without a base case the stack pointer expands continuously until memory exhaustion. "
        "Each recursive call places activation frames onto the hardware architecture."
    )
    seg = ExtractedSegment(
        segment_id="seg-1",
        document_id="doc-test-1",
        segment_type="page",
        location_label="Chapter 4, Page 112",
        page_number=112,
        slide_number=None,
        timestamp_seconds=None,
        raw_text=long_text,
        cleaned_text=long_text
    )

    chunks = chunker.chunk_segment(seg, course_id="course-test", page_id="page-1")
    assert len(chunks) >= 2

    # Check provenance
    for idx, c in enumerate(chunks):
        assert c.document_id == "doc-test-1"
        assert c.page_number == 112
        assert c.location_label == "Chapter 4, Page 112"
        assert c.chunk_index == idx
        assert c.token_count > 0

    # Check overlap: words from the end of chunk 0 should appear at the start of chunk 1
    words_c0 = chunks[0].content.split()
    words_c1 = chunks[1].content.split()
    overlap_detected = any(w in words_c1[:10] for w in words_c0[-5:])
    assert overlap_detected


@pytest.mark.asyncio
async def test_02_hybrid_retrieval_relevance_and_citations(rag_client):
    """Test 2: Hybrid retrieval returns relevant chunks with high score and verified citations."""
    client, session_factory = rag_client

    login_res = await client.post("/api/v1/auth/demo-login")
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    query_payload = {
        "query": "recursive procedure base case halts recursion stack overflow",
        "top_k": 3,
        "min_score": 0.45
    }

    response = await client.post("/api/v1/courses/course-cs204/retrieve", json=query_payload, headers=headers)
    assert response.status_code == 200
    results = response.json()

    assert len(results) >= 1
    top_hit = results[0]

    assert top_hit["score"] >= 0.50
    assert "base case" in top_hit["content"].lower() or "recursion" in top_hit["content"].lower()

    # Source location preservation
    assert top_hit["locationLabel"] is not None
    assert top_hit["citation"]["locationLabel"] is not None
    assert top_hit["citation"]["excerpt"] is not None


@pytest.mark.asyncio
async def test_03_cross_course_tenant_isolation(rag_client):
    """Test 3: Strict tenant isolation prevents retrieving chunks across different courses."""
    client, session_factory = rag_client

    # Create second user and second private course
    async with session_factory() as session:
        user_b = User(
            id="usr-other-student",
            email="other@student.edu",
            full_name="Other Student",
            hashed_password="mock-password-hash",
            is_active=True
        )
        session.add(user_b)
        await session.flush()

        course_b = Course(
            id="course-secret-b",
            user_id=user_b.id,
            name="Confidential Advanced Systems",
            code="CS 599",
            subject="Computer Science"
        )
        session.add(course_b)
        await session.flush()

        doc_b = CourseDocument(
            id="doc-secret-b",
            course_id=course_b.id,
            title="Classified Kernel Architecture",
            document_type="pdf",
            s3_storage_key="secret/b.pdf",
            status="indexed"
        )
        session.add(doc_b)
        await session.flush()

        chunk_b = DocumentChunk(
            id="chunk-secret-b",
            document_id=doc_b.id,
            course_id=course_b.id,
            chunk_index=1,
            content="Top secret microkernel scheduler invariants and memory management.",
            location_label="Page 1",
            page_number=1
        )
        session.add(chunk_b)
        await session.flush()

        provider = get_embedding_provider()
        vec_b = (await provider.embed_documents([chunk_b.content]))[0]
        emb_b = ChunkEmbedding(
            chunk_id=chunk_b.id,
            embedding_model=provider.model_name,
            embedding_json=json.dumps(vec_b)
        )
        session.add(emb_b)
        await session.commit()

    # Ananya logs in
    login_res = await client.post("/api/v1/auth/demo-login")
    token_a = login_res.json()["token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 1. Ananya queries her own course — secret chunk from Course B must NOT be returned
    res_a = await client.post(
        "/api/v1/courses/course-cs204/retrieve",
        json={"query": "microkernel scheduler invariants", "top_k": 5, "min_score": 0.10},
        headers=headers_a
    )
    assert res_a.status_code == 200
    for r in res_a.json():
        assert r["documentId"] != "doc-secret-b"
        assert r["chunkId"] != "chunk-secret-b"

    # 2. Ananya tries to query Course B directly — forbidden by course ownership check
    res_forbidden = await client.post(
        "/api/v1/courses/course-secret-b/retrieve",
        json={"query": "microkernel scheduler", "top_k": 5},
        headers=headers_a
    )
    assert res_forbidden.status_code == 403


@pytest.mark.asyncio
async def test_04_duplicate_concept_normalization(rag_client):
    """Test 4: Variations of concept names are normalized and merged into a single canonical concept."""
    _, session_factory = rag_client

    async with session_factory() as session:
        # Ingest items with different alias formats
        # Note: Provide an enriched summary that exceeds the pre-seeded length to verify merge enrichment
        items = [
            ExtractedConceptItem(
                name="DFS",
                topic_name="Graph Traversal",
                summary="Initial summary of Depth-First Search traversal.",
                difficulty="Intermediate"
            ),
            ExtractedConceptItem(
                name="depth first search",
                topic_name="Graph Traversal",
                summary="Enriched detailed explanation of Depth-First Search with stack mechanics, explicit frame unwinding, and cycle prevention invariants across directed adjacency lists.",
                difficulty="Intermediate"
            ),
            ExtractedConceptItem(
                name="Depth-First Search",
                topic_name="Graph Traversal",
                summary="Canonical representation of Depth-First Search.",
                difficulty="Intermediate"
            )
        ]

        concepts = await KnowledgeGraphService.add_or_merge_concepts(session, "course-cs204", items)
        await session.commit()

        # Query all concepts matching DFS
        res = await session.execute(
            select(Concept).where(
                Concept.course_id == "course-cs204",
                Concept.name.like("%Depth-First Search%")
            )
        )
        dfs_concepts = res.scalars().all()

        # All variations must map to exactly one canonical concept node!
        assert len(dfs_concepts) == 1
        assert dfs_concepts[0].name == "Depth-First Search (DFS)"
        assert "stack mechanics" in dfs_concepts[0].summary


@pytest.mark.asyncio
async def test_05_prerequisite_dag_cycle_prevention(rag_client):
    """Test 5: Adding a cyclic prerequisite relationship is detected and prevented."""
    _, session_factory = rag_client

    async with session_factory() as session:
        # Create 3 concepts: A -> B -> C
        item_a = ExtractedConceptItem(name="Concept Alpha", topic_name="Test Topic", summary="Concept A")
        item_b = ExtractedConceptItem(name="Concept Beta", topic_name="Test Topic", summary="Concept B", prerequisite_names=["Concept Alpha"])
        item_c = ExtractedConceptItem(name="Concept Gamma", topic_name="Test Topic", summary="Concept C", prerequisite_names=["Concept Beta"])

        await KnowledgeGraphService.add_or_merge_concepts(session, "course-cs204", [item_a, item_b, item_c])
        await session.commit()

        # Now attempt to make Alpha depend on Gamma (Gamma -> Alpha), which would form a cycle A -> B -> C -> A
        cyclic_item = ExtractedConceptItem(
            name="Concept Alpha",
            topic_name="Test Topic",
            summary="Concept A",
            prerequisite_names=["Concept Gamma"]
        )
        await KnowledgeGraphService.add_or_merge_concepts(session, "course-cs204", [cyclic_item])
        await session.commit()

        # Verify that Gamma -> Alpha edge was NOT added
        res_a = await session.execute(select(Concept).where(Concept.name == "Concept Alpha", Concept.course_id == "course-cs204"))
        concept_a = res_a.scalar_one()

        res_c = await session.execute(select(Concept).where(Concept.name == "Concept Gamma", Concept.course_id == "course-cs204"))
        concept_c = res_c.scalar_one()

        edge_res = await session.execute(
            select(ConceptRelationship).where(
                ConceptRelationship.source_concept_id == concept_c.id,
                ConceptRelationship.target_concept_id == concept_a.id,
                ConceptRelationship.relationship_type == "prerequisite"
            )
        )
        cyclic_edge = edge_res.scalar_one_or_none()
        assert cyclic_edge is None  # Cycle successfully rejected!


@pytest.mark.asyncio
async def test_06_missing_embedding_resilience(rag_client):
    """Test 6: Chunks missing vector embeddings fall back safely to sparse keyword retrieval without crash."""
    _, session_factory = rag_client

    async with session_factory() as session:
        # Insert a chunk without an embedding record
        raw_chunk = DocumentChunk(
            id="chunk-no-embedding",
            document_id="doc-1",
            course_id="course-cs204",
            chunk_index=99,
            content="Isolated theoretical notes on topological sort dependencies without precomputed embedding vector.",
            location_label="Appendix B, Page 300",
            page_number=300
        )
        session.add(raw_chunk)
        await session.commit()

        # Search with keywords present in the un-embedded chunk
        results = await RetrievalService.retrieve(
            db=session,
            user_id="usr-ananya-sharma",
            course_id="course-cs204",
            query="topological sort dependencies",
            top_k=10,
            min_relevance_threshold=0.15
        )

        match = next((r for r in results if r.chunk_id == "chunk-no-embedding"), None)
        assert match is not None
        assert match.keyword_score > 0.0


@pytest.mark.asyncio
async def test_07_document_deletion_cascading_cleanup(rag_client):
    """Test 7: Deleting a document cleans up all associated chunks and citations."""
    _, session_factory = rag_client

    async with session_factory() as session:
        # Create ephemeral document with chunks and page
        doc = CourseDocument(
            id="doc-ephemeral-test",
            course_id="course-cs204",
            title="Temporary Handout",
            document_type="notes",
            s3_storage_key="temp/test.txt",
            status="indexed"
        )
        session.add(doc)
        await session.flush()

        chunk = DocumentChunk(
            id="chunk-ephemeral-test",
            document_id=doc.id,
            course_id="course-cs204",
            chunk_index=1,
            content="Temporary ephemeral study notes destined for deletion.",
            location_label="Page 1",
            page_number=1
        )
        session.add(chunk)
        await session.commit()

        # Confirm chunk exists
        chk = await session.get(DocumentChunk, "chunk-ephemeral-test")
        assert chk is not None

        # Execute cleanup
        deleted = await KnowledgeGraphService.delete_document_cleanup(session, doc.id)
        assert deleted is True

        # Verify chunk was cascadingly removed
        chk_after = await session.get(DocumentChunk, "chunk-ephemeral-test")
        assert chk_after is None


@pytest.mark.asyncio
async def test_08_relevance_threshold_filters_unrelated_queries(rag_client):
    """Test 8: Relevance threshold filters out unrelated queries, preventing hallucinated context."""
    client, _ = rag_client

    login_res = await client.post("/api/v1/auth/demo-login")
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Query completely unrelated to CS 204 Data Structures courseware
    unrelated_payload = {
        "query": "photosynthesis chloroplast light dependent reactions in plant cell biology",
        "top_k": 5,
        "min_score": 0.55  # Strict threshold
    }

    response = await client.post("/api/v1/courses/course-cs204/retrieve", json=unrelated_payload, headers=headers)
    assert response.status_code == 200
    results = response.json()

    # Must return 0 results rather than returning irrelevant recursion chunks
    assert len(results) == 0


@pytest.mark.asyncio
async def test_09_course_map_api_endpoint(rag_client):
    """Test 9: Course map API endpoint returns full knowledge graph structure."""
    client, _ = rag_client

    login_res = await client.post("/api/v1/auth/demo-login")
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = await client.get("/api/v1/courses/course-cs204/map", headers=headers)
    assert response.status_code == 200
    map_data = response.json()

    assert map_data["courseId"] == "course-cs204"
    assert map_data["totalConcepts"] >= 8
    assert map_data["totalTopics"] >= 5
    assert len(map_data["concepts"]) >= 8
    assert len(map_data["edges"]) >= 7
    assert len(map_data["topics"]) >= 5
