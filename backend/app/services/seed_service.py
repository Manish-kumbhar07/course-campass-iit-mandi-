import uuid
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

import json
from app.models.user import User
from app.models.course import Course
from app.models.document import CourseDocument, DocumentPage, DocumentChunk, ChunkEmbedding
from app.models.graph import Topic, Concept, ConceptRelationship, Misconception
from app.models.tutor import Citation
from app.models.quiz import Quiz, QuizQuestion, QuizOption
from app.models.study_plan import TopicMastery, StudyPlan, StudyPlanTask
from app.rag.embeddings.factory import get_embedding_provider


async def seed_demo_course(db: AsyncSession) -> None:
    # 1. Ensure Demo User Exists
    user_res = await db.execute(select(User).where(User.id == "usr-ananya-sharma"))
    user = user_res.scalar_one_or_none()
    if not user:
        user = User(
            id="usr-ananya-sharma",
            email="ananya.sharma@collegemail.edu",
            full_name="Ananya Sharma",
            academic_level="Second-year Undergraduate",
            institution="School of Engineering & Applied Sciences",
            hashed_password="mock-demo-password-hash",
            is_active=True,
        )
        db.add(user)
        await db.flush()

    # 2. Ensure Course CS 204 Exists
    course_res = await db.execute(select(Course).where(Course.id == "course-cs204"))
    course = course_res.scalar_one_or_none()
    if not course:
        from datetime import date
        course = Course(
            id="course-cs204",
            user_id="usr-ananya-sharma",
            name="Data Structures: Recursion and Graphs",
            code="CS 204",
            subject="Computer Science",
            exam_date=date(2026, 10, 25),
            daily_study_minutes=45,
            overall_mastery=58,
        )
        db.add(course)
        await db.flush()

    # 3. Check if concepts already seeded
    existing_concepts = await db.execute(select(Concept).where(Concept.course_id == "course-cs204"))
    if existing_concepts.scalars().first():
        return  # Already seeded

    # 4. Seed Topics
    topics_data = [
        ("top-memory", "Memory Architecture", "Physical stack layout, activation records, and frame pointers.", 1),
        ("top-recursion", "Recursion Foundations", "Mathematical induction, base cases, and recurrence relations.", 2),
        ("top-graphs", "Graph Fundamentals", "Graph representations, vertices, and adjacency structures.", 3),
        ("top-traversal", "Graph Traversal", "Depth-First and Breadth-First search traversal mechanics.", 4),
        ("top-algorithms", "Graph Algorithms", "Cycle detection, topological sort, and DAG properties.", 5),
    ]
    for tid, title, desc, order in topics_data:
        topic = Topic(id=tid, course_id="course-cs204", title=title, description=desc, sort_order=order)
        db.add(topic)
    await db.flush()

    # 5. Seed Course Documents & Chunks for RAG Grounding
    docs_data = [
        ("doc-1", "Introduction to Algorithms & Data Structures (4th Ed.)", "pdf", 14889728, "34 Pages", "indexed"),
        ("doc-2", "Lecture 08: Recursive Call Stack Mechanics & Base Case Design", "video", 505413632, "48m 20s", "indexed"),
        ("doc-3", "Lecture 12 Slide Deck: Graph Representations & Depth-First Search", "slides", 9017753, "38 Slides", "indexed"),
        ("doc-4", "TA Office Hours: Recursion Base Case Pitfalls & Return Signatures", "audio", 23173529, "18m 10s", "indexed"),
        ("doc-5", "Lab 3 Handout: Call Stack Tracing Worksheet", "notes", 1468006, "4 Pages", "indexed"),
    ]
    for doc_id, title, dtype, size, pcount, status in docs_data:
        d_res = await db.execute(select(CourseDocument).where(CourseDocument.id == doc_id))
        if not d_res.scalar_one_or_none():
            doc = CourseDocument(
                id=doc_id,
                course_id="course-cs204",
                title=title,
                original_filename=f"{title.lower().replace(' ', '_')}.{dtype}",
                document_type=dtype,
                s3_storage_key=f"course-cs204/{doc_id}",
                file_size_bytes=size,
                page_count_or_duration=pcount,
                status=status,
            )
            db.add(doc)
            await db.flush()

            # Add sample chunk for RAG search
            chunk_content = (
                f"Detailed academic excerpt from {title}. "
                "Every well-formed recursive procedure must possess at least one non-recursive base case that halts recursion. "
                "In Depth-First Search (DFS) on directed graphs, each recursive branch pushes a stack frame containing local variables. "
                "Cycle detection invariant: an edge (u, v) is a back-edge if and only if vertex v is currently in the active GRAY state on the recursion call stack."
            )
            chunk = DocumentChunk(
                id=f"chunk-{doc_id}",
                document_id=doc_id,
                course_id="course-cs204",
                chunk_index=1,
                content=chunk_content,
                token_count=len(chunk_content.split()),
                location_label=f"Chapter/Section in {title}",
                page_number=112 if dtype == "pdf" else None,
                slide_number=19 if dtype == "slides" else None,
                timestamp_seconds=872 if dtype == "video" else None,
            )
            db.add(chunk)
            await db.flush()

            provider = get_embedding_provider()
            vec = (await provider.embed_documents([chunk_content]))[0]
            emb = ChunkEmbedding(
                chunk_id=chunk.id,
                embedding_model=provider.model_name,
                embedding_json=json.dumps(vec)
            )
            db.add(emb)
    await db.flush()

    # 6. Seed Concepts
    concepts_data = [
        ("c-stack-mechanics", "top-memory", "Call Stack Mechanics", "Foundational", 64, "learning",
         "Understanding activation records, stack pointer displacement, local frame allocation, and why each recursive call consumes O(1) auxiliary frame memory until return.",
         "Assuming variables from prior recursive frames are overwritten when a new frame pushes onto the call stack."),
        ("c-base-cases", "top-recursion", "Recursion Base Cases", "Foundational", 44, "attention",
         "Guaranteed termination conditions where the function returns directly without issuing further recursive invocations, safeguarding against infinite depth.",
         "Treating base cases merely as exception guards rather than structural halting states with explicit mathematical return values."),
        ("c-divide-conquer", "top-recursion", "Divide and Conquer Recurrence", "Intermediate", 78, "mastered",
         "Partitioning problem spaces into subproblems of identical structure, recursively solving each subproblem, and combining solutions in linear or constant time.",
         "Confusing tree height logarithmic depth with linear invocation count."),
        ("c-graph-representations", "top-graphs", "Graph Representations", "Foundational", 82, "mastered",
         "Trade-offs between Adjacency Matrix O(V^2) memory and Adjacency List O(V + E) memory for sparse versus dense graphs.",
         "Defaulting to Adjacency Matrix for sparse road networks or web link graphs."),
        ("c-dfs-traversal", "top-traversal", "Depth-First Search (DFS)", "Intermediate", 49, "attention",
         "Exploration of graph vertices along deep paths using the system call stack or an explicit LIFO structure, tracking visit states to prevent cyclic deadlocks.",
         "Confusing the DFS call stack with BFS queue ordering, leading to incorrect traversal sequence proofs."),
        ("c-bfs-traversal", "top-traversal", "Breadth-First Search (BFS)", "Intermediate", 71, "learning",
         "Level-order vertex exploration utilizing a FIFO queue, guaranteeing shortest-path discovery on unweighted graphs.",
         "Attempting to execute BFS recursively without an external queue container."),
        ("c-cycle-detection", "top-algorithms", "Cycle Detection & Three-Coloring", "Advanced", 32, "attention",
         "Detecting directed cycles using vertex states: White (unvisited), Gray (currently exploring on active stack), Black (completely explored).",
         "Assuming cross-edges or forward-edges to Black nodes represent cycles."),
        ("c-topological-sort", "top-algorithms", "Topological Sorting", "Advanced", 85, "mastered",
         "Linear ordering of vertices in a Directed Acyclic Graph (DAG) such that for every directed edge (u, v), vertex u comes before v in the ordering.",
         "Attempting topological sorting on cyclic graphs or expecting unique orderings."),
    ]
    for cid, tid, name, diff, mastery, stat, summ, misc in concepts_data:
        concept = Concept(
            id=cid,
            course_id="course-cs204",
            topic_id=tid,
            name=name,
            difficulty=diff,
            mastery_percent=mastery,
            status=stat,
            summary=summ,
            primary_misconception=misc,
        )
        db.add(concept)
    await db.flush()

    # 7. Seed Concept Relationships (DAG Edges)
    relationships = [
        ("c-stack-mechanics", "c-base-cases", "prerequisite"),
        ("c-base-cases", "c-divide-conquer", "prerequisite"),
        ("c-base-cases", "c-dfs-traversal", "prerequisite"),
        ("c-graph-representations", "c-dfs-traversal", "prerequisite"),
        ("c-graph-representations", "c-bfs-traversal", "prerequisite"),
        ("c-dfs-traversal", "c-cycle-detection", "prerequisite"),
        ("c-cycle-detection", "c-topological-sort", "prerequisite"),
    ]
    for src, tgt, rel in relationships:
        edge = ConceptRelationship(
            id=f"edge-{src}-{tgt}",
            source_concept_id=src,
            target_concept_id=tgt,
            relationship_type=rel,
        )
        db.add(edge)
    await db.flush()

    # 8. Seed Verified Citations
    citations_data = [
        ("cite-tb-1", "c-base-cases", "doc-1", "Introduction to Algorithms & Data Structures (4th Ed.)", "pdf",
         "Chapter 4, Page 112", 112, None, None,
         "Every well-formed recursive procedure must possess at least one non-recursive base case that halts recursion. Omitting the base case, or failing to make strict structural progression toward it, leads directly to unbounded call frame growth and a runtime stack overflow exception.",
         "Section 4.2: Anatomy of Stack Frames in Activation Records — Figure 4.3 illustrates push/pop lifecycles on the hardware call stack."),
        ("cite-vid-1", "c-base-cases", "doc-2", "Lecture 08: Recursive Call Stack Mechanics & Base Case Design", "video",
         "Timestamp 14:32 - 16:15", None, None, 872,
         "Professor Henderson: 'Notice where students make the mistake in Fibonacci or tree traversal. They write the recursive step first, but forget to verify whether negative or boundary inputs reach the leaf condition before executing the split.'",
         "Chalkboard demonstration of stack frame unwinding with activation records pushing onto memory addresses 0x7fff..."),
        ("cite-sld-1", "c-cycle-detection", "doc-3", "Lecture 12 Slide Deck: Graph Representations & Depth-First Search", "slides",
         "Slide 19 of 38", None, 19, None,
         "Invariant 3: In an unweighted directed graph, an edge (u, v) encountered during DFS is a back-edge if and only if vertex v is currently in the ACTIVE/GRAY state on the recursion call stack.",
         "Color coding conventions: White = Unvisited, Gray = Active on Current Call Stack, Black = Fully Explored Subtree."),
    ]
    for cite_id, cid, doc_id, stitle, stype, loc, page, slide, ts, excerpt, snippet in citations_data:
        c = Citation(
            id=cite_id,
            concept_id=cid,
            document_id=doc_id,
            source_title=stitle,
            source_type=stype,
            location_label=loc,
            page_number=page,
            slide_number=slide,
            timestamp_seconds=ts,
            excerpt=excerpt,
            context_snippet=snippet,
            verification_confidence="verified",
        )
        db.add(c)
    await db.flush()

    # 9. Seed Diagnostic Quiz
    quiz = Quiz(
        id="quiz-cs204-diag",
        course_id="course-cs204",
        title="CS 204 Midterm Diagnostic Check",
        difficulty="Intermediate",
    )
    db.add(quiz)
    await db.flush()

    q1 = QuizQuestion(
        id="q-dfs-cycle-1",
        quiz_id=quiz.id,
        concept_id="c-cycle-detection",
        prompt="In an unweighted directed graph being traversed via DFS, an edge (u, v) is encountered. Under what condition does this edge prove the existence of a directed cycle?",
        question_type="multiple_choice",
        difficulty="Advanced",
        explanation="Per Invariant 3 in Slide Deck 12 (Slide 19), a cycle exists if and only if an edge points to an active ancestor currently on the recursion call stack (Gray state).",
        citation_id="cite-sld-1",
    )
    db.add(q1)
    await db.flush()

    options_q1 = [
        ("opt-1", q1.id, "Vertex v has been visited at least once and is in the BLACK state.", False,
         "A Black vertex is fully completed and popped off the call stack. An edge to a Black vertex is a cross-edge or forward-edge, not an ancestor back-edge.", 1),
        ("opt-2", q1.id, "Vertex v is currently in the GRAY state, active on the recursion call stack.", True, None, 2),
        ("opt-3", q1.id, "Vertex v has in-degree greater than 2.", False, "In-degree only counts incoming edges and says nothing about directed cycles.", 3),
        ("opt-4", q1.id, "Vertex u is visited before vertex v in alphabetical topological order.", False, "Topological order is only defined on acyclic graphs.", 4),
    ]
    for oid, qid, text, is_corr, misc_exp, sorder in options_q1:
        db.add(QuizOption(id=oid, question_id=qid, text=text, is_correct=is_corr, misconception_explanation=misc_exp, sort_order=sorder))
    await db.flush()

    # 10. Seed Study Plan
    study_plan = StudyPlan(
        id="plan-day-1",
        course_id="course-cs204",
        user_id="usr-ananya-sharma",
        day_number=1,
        date_string="Today · Oct 14",
        focus_concept_id="c-base-cases",
        focus_title="Call Stack Bounds & Base Case Invariants",
        minutes_budget=45,
        status="in-progress",
    )
    db.add(study_plan)
    await db.flush()

    t1 = StudyPlanTask(
        id="task-1",
        study_plan_id=study_plan.id,
        title="Socratic Session: Base Case Halting & Identity Elements",
        duration_minutes=15,
        completed=True,
        task_type="tutor",
        target_citation_id="cite-tb-1",
    )
    t2 = StudyPlanTask(
        id="task-2",
        study_plan_id=study_plan.id,
        title="Diagnostic Run: Call Stack Tracing & Depth Bounds",
        duration_minutes=20,
        completed=False,
        task_type="quiz",
        target_citation_id="cite-vid-1",
    )
    db.add(t1)
    db.add(t2)

    await db.commit()
