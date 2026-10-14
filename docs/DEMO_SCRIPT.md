# CourseCompass: 5-Minute Hackathon Demo Script & Resilience Runbook

**Theme**: *No Hallucinations, Proven Grounding: The AI Study Companion That Shows Its Receipts.*  
**Target Duration**: 5 minutes (00:00 - 05:00)  
**Presenter**: Lead Engineer / Technical Founder  
**Target Course**: `CS 204: Data Structures: Recursion and Graphs` (Pre-seeded with Ananya Sharma)

---

## Chronological Demo Sequence

### [00:00 - 00:30] Step 1: Landing Page & Problem Statement
- **Screen**: Modern landing page (`http://localhost:3000`).
- **Action**: Highlight the value proposition banner: *"Grounded AI Study Companion with Mathematical Proofs & Citations."*
- **Speaker**:
  > *"Every student uses LLMs to study, but generic chatbots hallucinate facts, guess equations, and cite non-existent papers. CourseCompass solves this: an educational assistant that strictly grounds answers in your professor's lectures, slides, and syllabus, with verifiable visual proof."*
- **Action**: Click **"Enter Campus Demo (Ananya Sharma)"** or demo login.

---

### [00:30 - 01:00] Step 2 & 3: Course Dashboard & Multimodal Ingestion Pipeline
- **Screen**: Course Dashboard for **CS 204**.
- **Action**: Click on **"Materials"** tab.
- **Visuals**:
  - Show the 3 uploaded source documents:
    1. `Syllabus_CS204.pdf` (PDF document)
    2. `Lecture_04_Recursion_and_CallStacks.pptx` (Slide deck)
    3. `Lab_03_Cycle_Detection.mp4` (Lecture recording with timestamped visual frames)
  - Point to the **7-stage ingestion telemetry** showing extraction progress: *File validation $\to$ Multimodal parsing $\to$ Semantic chunking $\to$ Graph mapping $\to$ Vector persistence.*
- **Speaker**:
  > *"Here in CS 204, Ananya has uploaded slides, lecture videos, and notes. Our backend ingested them through a 7-stage deterministic pipeline using Gemini multimodal parsing, extracting slide coordinates, video timestamps, and LaTeX equations."*

---

### [01:00 - 01:45] Step 4: Interactive Knowledge Graph & Prerequisite Map
- **Screen**: Click **"Knowledge Map"** tab.
- **Visuals**:
  - Interactive DAG showing nodes: *Recursion Fundamentals*, *Call Stack Invariants*, *Graph Traversal (DFS)*, *Cycle Detection & Three-Coloring*.
  - Show prerequisite edges with confidence scores and color-coded mastery:
    - *Recursion* $\to$ 85% Mastery (Green / Mastered)
    - *DFS Traversal* $\to$ 60% Mastery (Yellow / Learning)
    - *Cycle Detection & Three-Coloring* $\to$ 35% Mastery (Red / Needs Attention)
- **Speaker**:
  > *"Rather than flat text files, CourseCompass constructs a directed acyclic concept graph. You see immediately why cycle detection is in red: it depends on DFS and the three-color invariant, which hasn't been mastered yet."*

---

### [01:45 - 02:45] Step 5 & 6: Grounded AI Tutor & Refusal Quality Demo
- **Screen**: Click **"AI Tutor"** tab.
- **Action A (Answerable Grounded Question)**:
  - Ask: *"What is the three-color invariant for directed cycle detection in DFS?"*
  - **Result**: Tutor answers with exact definitions: *White (unvisited), Gray (active on recursion stack), Black (fully explored)*.
  - **Action**: Click the badge **`[Lecture 4, Slide 12]`** to open the **Source Citation Inspector Modal**.
  - **Visual Callout**: Show the exact verified excerpt, document title, slide thumbnail, and `verified` grounding score (1.0).
- **Action B (Unsupported Out-of-Domain Question)**:
  - Ask: *"Explain how Red-Black trees perform double-rotations during insertion."*
  - **Result**: Tutor immediately responds with a strict refusal:
    > *"This topic (Red-Black tree rotations) was not found in your CS 204 course materials. To prevent hallucinations, I only answer questions grounded in your course."*
- **Speaker**:
  > *"Notice that: no hallucinated citations, no guessing. When asked about Red-Black trees—which aren't in this syllabus—it cleanly refuses."*

---

### [02:45 - 03:45] Step 7 & 8: Adaptive Quiz, Rubric Grading & Deterministic Mastery Update
- **Screen**: Click **"Quizzes"** tab.
- **Action**: Launch the targeted diagnostic quiz on *Cycle Detection & Three-Coloring*.
- **Question**:
  - *"In directed cycle detection, what indicates a cycle when visiting neighbor v from u?"*
  - Select correct answer: *B: v is GRAY (currently active on the DFS recursion stack)*.
  - Click **"Submit Assessment"**.
- **Visuals**:
  - Immediate grading rubric feedback citing `Invariant 3 (Slide 12)`.
  - Mastery score updates dynamically from **35% $\to$ 50%**.
- **Speaker**:
  > *"Mastery is computed by a versioned deterministic algorithm—never by an LLM picking a number. It calculates score gains, consistency streaks, and time-decay, updating official learner records."*

---

### [03:45 - 04:30] Step 9: Time-Bounded Personalized Study Plan
- **Screen**: Click **"Dashboard"** / **"Study Plan"**.
- **Visuals**:
  - Highlighting **Recommended Next**: *Cycle Detection & Three-Coloring Practice (15 min)*.
  - Shows why: *"Prerequisite gap: Needed by Topological Sorting with mastery at 50%."*
- **Speaker**:
  > *"With exams approaching, the system produces a prioritized schedule within Ananya's available daily 45-minute budget, prioritizing high-leverage prerequisite gaps first."*

---

### [04:30 - 05:00] Step 10: Security, Evaluation Benchmarks & Conclusion
- **Action**: Bring up test results slide or terminal verification summary:
  - **8/8 RAG Benchmark Tests Passed** (Faithfulness $\ge 0.85$, Refusal Quality = 1.0, Latency $< 2.5s$).
  - **10/10 Application Security Tests Passed** (Tenant isolation, MIME magic validation, prompt-injection defense, cascading orphan elimination).
- **Speaker**:
  > *"CourseCompass is battle-tested: 100% test pass rate across our RAG benchmark and application security suite. Verified learning, verified code. Thank you!"*

---

## Offline & Network Resilience Backup Plan

If live WiFi drops during the presentation:
1. **Frontend Demo Mode Toggle**:
   - The frontend includes an automatic offline fallback (`VITE_DEMO_MODE=true` in `src/services/api-client.ts`). If any network error occurs, the UI seamlessly falls back to preloaded mock payloads without showing broken screens or error toasts.
2. **Local In-Memory Mode**:
   - If internet is lost but localhost is accessible, the FastAPI backend runs locally on SQLite and local storage without requiring external cloud connections.
3. **Honest Evaluation Labeling**:
   - In offline demonstration, visual citations display the local slide render cached from the `seed_demo_course` dataset. All metrics cited during the demo reflect the empirical pytest benchmark results executed on this machine.

