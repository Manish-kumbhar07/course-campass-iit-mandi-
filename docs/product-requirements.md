# Product Requirements Document (PRD)

**Project:** CourseCompass  
**Stage:** Hackathon MVP Specification  
**Author:** Principal Product Lead & Senior Architect  
**Source of Truth:** CourseCompass Frontend Codebase & System Audit  
**Target Release:** International AI Hackathon MVP  

---

## 1. Executive Summary & Problem Space

College students at top-tier engineering, science, and liberal arts institutions face an unprecedented fragmentation of learning materials. A single course spans textbook PDFs, dense slide decks, recorded lecture videos, lab handouts, and TA office hours notes. When studying for high-stakes midterm and final exams, students struggle with three acute, quantifiable failure modes:

### 1.1 The Three Core Student Problems

1. **Fragmented, Multi-Modal Courseware Chaos:**
   * **Problem:** Course material is scattered across LMS folders (Canvas/Blackboard), local downloads, YouTube unlisted lecture links, and hand-written notes.
   * **Impact:** Students spend up to 40% of their study time searching for where a specific proof, formula, or algorithmic edge case was introduced rather than actively mastering the concept.

2. **The "Hallucination & Plausibility" Trap with Generic LLMs:**
   * **Problem:** When students use general-purpose conversational LLMs (ChatGPT, Claude) for exam prep, the model answers using external conventions, obsolete notation, or outright hallucinations that directly contradict their professor's explicit exam grading rubrics.
   * **Impact:** Students lose marks on exams for using unpermitted theorems or differing definitions, and lose trust in AI study assistants. They require **strict source-boundary enforcement** where every assertion is backed by verifiable courseware citations.

3. **The "Illusion of Competence" & Diagnostic Prerequisite Blindspots:**
   * **Problem:** Passive re-reading of slides creates false confidence. Students do not realize that their inability to solve an advanced problem (e.g., Cycle Detection in Directed Graphs) stems from an unresolved foundational misconception two levels down (e.g., Call Stack Activation Record mechanics).
   * **Impact:** Students cram haphazardly, miss foundational gaps, and experience panic when confronted with novel, synthesis-level exam questions.

---

## 2. Product Vision & Value Proposition

> **"Turn scattered study material into your clearest path forward."**

CourseCompass is an AI-powered, source-grounded personalized academic learning platform. Unlike generic study apps, CourseCompass:
* **Ingests and indexes** university courseware into a structured **Prerequisite Knowledge Map**.
* Delivers an **audited Socratic Tutor** with visible citation boundaries that tells students when an answer is or is not in their course materials.
* Generates **targeted diagnostic quizzes** that expose specific student misconceptions.
* Dynamically updates a **deterministic topic mastery model** and prescribes what exact task the student should tackle next.

---

## 3. Target Student Persona

| Attribute | Specification |
| :--- | :--- |
| **Persona Name** | Ananya Sharma |
| **Academic Standing** | Second-Year Undergraduate, School of Engineering & Applied Sciences |
| **Active Course** | CS 204: Data Structures & Algorithms (Recursion and Directed Graphs) |
| **Upcoming Milestone** | Midterm Exam in 12 Days (Targeting an A-grade) |
| **Study Constraints** | 45 minutes of focused daily study budget; high cognitive fatigue; overwhelmed by 48-minute lecture videos and 300-page textbooks |
| **Core Need** | Wants to know *exactly* what prerequisite gaps are holding her back, practice high-yield diagnostic questions, and get instant explanations cited directly from her professor's slides and textbook. |

---

## 4. System Capabilities & Functional Requirements

### 4.1 In-Scope MVP Features (P0)

1. **Authenticated Session & Private Course Workspace:**
   * Secure user registration, sign-in, and persistent session state.
   * Isolated course spaces preventing cross-course data pollution.
   * Fast-path demo login for one-click hackathon evaluation.

2. **High-Fidelity Document Ingestion (PDF Focus):**
   * Multi-file upload interface with stage-by-stage visual pipeline feedback.
   * Text extraction, semantic chunking, and structural heading preservation from syllabus, textbook chapters, and lecture notes.

3. **Prerequisite Knowledge Map Visualization:**
   * Hierarchical concept dependency graph displaying foundational $\to$ intermediate $\to$ advanced relationships.
   * Visual mastery indicators (Mastered, Needs Attention, Learning, Locked).
   * Interactive concept drawer displaying summary, primary misconception, prerequisites, and source citations.

4. **Source-Grounded Socratic Tutor with 4 Answer States:**
   * Conversational interface backed by server-side RAG pipeline.
   * Guaranteed delivery of 4 distinct grounding states:
     * `supported`: Supported by verified courseware; contains exact citations.
     * `partially_supported`: Partial evidence found in course materials.
     * `not_found`: Explicitly admits topic is not indexed in courseware (e.g., Red-Black Trees in a Recursion course).
     * `outside_materials`: Explicitly labeled outside conceptual overview upon request.
   * Citation Inspector Modal displaying source title, location label (page/slide), verified excerpt quote, and context.

5. **Adaptive Diagnostic Quizzes & Misconception Analysis:**
   * Targeted multiple-choice diagnostic questions linked to specific concepts.
   * Diagnostic distractors mapped to specific student misconceptions.
   * Step-by-step verified explanations upon submission with direct citation links.

6. **Deterministic Mastery Tracker & "Study Next" Engine:**
   * Mathematical mastery calculation based on diagnostic attempts.
   * Prerequisite propagation: mastery changes in parent concepts influence readiness scores of dependent concepts.
   * Actionable "Study Next" prescription recommending high-yield topics to review before exam day.

---

### 4.2 Out-of-Scope for Hackathon MVP (P1 / P2)

* **Asynchronous Multi-Modal Video/Audio Speech-to-Text Pipeline (P1):** Live audio/video transcription is deferred due to latency (a 500MB video upload would breach the 3-minute hackathon demo window). Audio/video sources in the demo are represented by structured pre-transcripts and metadata.
* **Spaced-Repetition SM-2 Scheduler (P1):** Flashcard deck is functional in UI, but automated multi-week Leitner intervals are deferred.
* **15-Minute Study Sprint Session Analytics (P1):** Timer works client-side; cloud session analytics logging is deferred.
* **LMS Direct Ingestion (Canvas/Blackboard API) (P2):** Institutional OAuth and LMS webhook syncing.
* **Multi-User Collaboration & Study Groups (P2):** Shared annotation and peer leaderboard features.

---

## 5. Non-Functional Requirements (NFRs)

| Metric | Target | Rationale |
| :--- | :--- | :--- |
| **Tutor Response Latency** | $< 3.5\text{ seconds}$ | Prevents conversational stall during live presentation. |
| **Grounding Precision** | $100\%$ zero-hallucination citations | Any hallucinated page or invented quote disqualifies product promise. |
| **Client Bundle Load Time** | $< 1.2\text{ seconds}$ on broadband | Immediate first-contentful-paint using Vite optimized bundle. |
| **Responsive Viewport** | $375\text{px}$ to $1920\text{px}$ | Flawless rendering on laptop displays, tablets, and presentation screens. |
| **Data Privacy** | Strict user workspace isolation | No student data leaked across account or course boundaries. |

---

## 6. Product Acceptance Mandate
No feature shall be marked "Complete" purely because its visual layout exists. A feature is complete if and only if user input flows to the FastAPI backend, is processed against real or deterministically seeded data models, and updates both the UI and database state with full fidelity.

