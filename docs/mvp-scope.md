# MVP Scope & Feature Prioritization Matrix

**Project:** CourseCompass  
**Release Target:** International AI Hackathon MVP  
**Scope Freeze Status:** **LOCKED & FROZEN**  

---

## 1. Scope Manifesto & Principles

1. **Depth Over Breadth:** A single student persona (Ananya) mastering a single high-stakes topic (Recursion and Directed Graphs) with **100% verified citations** will win over five broken, shallow multi-subject demos.
2. **Zero Fake Capabilities:** If a multi-modal feature (e.g., live 500MB video transcription) cannot finish in under 15 seconds during a 3-minute hackathon demo, it is **deferred** from P0. Video/audio sources are represented via pre-indexed transcripts.
3. **Preserve Frontend Design:** The current warm, editorial design system (`tokens.ts`, `index.css`, Fraunces & Plus Jakarta Sans typography) is polished and battle-tested. No UI redesign or component rewrites will be undertaken.

---

## 2. Feature Inventory: Implemented vs. Mocked vs. Missing

| Feature Domain | Existing Frontend State | Mock vs. Real Analysis | MVP Status |
| :--- | :--- | :--- | :--- |
| **Public Landing & Marketing** | Fully styled, responsive (`LandingPage.tsx`, `PublicNavbar.tsx`). | **Real Presentation:** Interactive citation preview works via modal. | **P0 (Keep As Is)** |
| **Authentication & Session** | Form components exist (`SignInPage`, `SignUpPage`, `ForgotPasswordPage`). | **100% Mocked:** `AuthService` stores simulated tokens in `sessionStorage` with artificial delays. | **P0: Implement FastAPI JWT Auth** |
| **Onboarding Wizard** | 5-step form (`OnboardingFlow.tsx`). | **Local State Only:** Collects course name, date, daily minutes, sets state. | **P0: Connect to DB Profile Save** |
| **Course Creation & Ingestion** | Drag-and-drop workspace (`CourseCreationWorkspace.tsx`). | **100% Mocked:** Runs `setInterval` timer (0–100%) and seeds fake files. | **P0: Real PDF Upload + RAG Indexing** |
| **Materials Management** | Material list card grid (`MaterialsView.tsx`). | **Local State Only:** Adds hardcoded objects to React state with `setTimeout`. | **P0: Real File List API** |
| **Prerequisite Knowledge Map** | Visual dependency graph (`KnowledgeMapView.tsx`). | **Static Data:** Renders hardcoded nodes from `courseData.ts`. | **P0: Connect to DB Concept Nodes** |
| **Socratic AI Tutor** | Conversational UI with 4 trust badges (`TutorChatView.tsx`). | **Simulated Keyword Matcher:** `App.tsx` has `if (text.includes(...))` with 600ms delay. | **P0: Real Gemini RAG Pipeline** |
| **Verified Citation Modal** | Modal dialog with quote, snippet, and copy (`SourceCitationModal.tsx`). | **Real UI, Mock Data:** Renders static citations from `SAMPLE_CITATIONS`. | **P0: Real RAG Chunk Citations** |
| **Adaptive Diagnostic Quiz** | MCQ card, progress bar, instant feedback (`AdaptiveQuizView.tsx`). | **Static 2-Question Bank:** Answers checked locally; hardcoded +14% mastery additions. | **P0: Real Scored Diagnostic Engine** |
| **Topic Mastery Tracker** | Progress bars and percentage meters in Overview and Mastery tabs. | **Deterministic Math on Mock State:** Computes percentage in memory. | **P0: Real DB Mastery Calculation** |
| **"Study Next" Recommendations** | High-urgency recommendation card on Dashboard. | **Hardcoded in `STUDY_PLAN_DATA`.** | **P0: Dynamic Algorithmic Selection** |
| **Multi-Subject Switcher** | Subject dropdown in header (`AddSubjectSection.tsx`, `AppShell.tsx`). | **Local State Switcher:** Switches between CS 204, ECON 102, BIO 101 in memory. | **P1 (Keep CS 204 active)** |
| **15-Minute Study Sprint** | Live countdown timer with 3 stages (`StudySprintView.tsx`). | **Functional Client Timer:** Live timer, static quick questions. | **P1 (Client-side demo only)** |
| **Spaced Retrieval Flashcards** | Interactive flip cards with summaries (`FlashcardsView.tsx`). | **Static Cards:** Local flip animation. | **P1 (Deferred backend scheduler)** |
| **Live Audio/Video Transcriber** | UI displays `.mp4` and `.m4a` badges. | **Mocked Metadata:** No media transcription pipeline exists. | **P1 (Pre-indexed transcripts)** |
| **LMS Canvas / Moodle Sync** | Mentioned in landing copy. | **Missing:** No external API integrations. | **P2 (Post-Hackathon v2.0)** |

---

## 3. Strict Classification Matrix (P0, P1, P2)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      P0: CORE HACKATHON MVP (MUST HAVE)                 │
├─────────────────────────────────────────────────────────────────────────┤
│ • Secure Student Auth (FastAPI JWT + Demo 1-Click Login)                │
│ • Private Course Workspace (Isolation of CS 204 study assets)           │
│ • Real PDF Ingestion & Semantic Chunking (Textbook & Slides)            │
│ • Source-Grounded Socratic Tutor with 4 Audited Answer States           │
│ • Exact Citations with Source Citation Modal Inspector                  │
│ • Prerequisite Knowledge Map (Dynamic node statuses: Mastered/Attention)│
│ • Adaptive Diagnostic Quiz (Misconception-driven scoring)               │
│ • Deterministic Mastery Calculation & Prerequisite Propagation         │
│ • Prescriptive "Study Next" Priority Recommendation                     │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      P1: POST-HACKATHON V1.1 (DEFERRED)                 │
├─────────────────────────────────────────────────────────────────────────┤
│ • Real-time Video/Audio Whisper Speech-to-Text Processing               │
│ • Multi-subject concurrent ingestion (ECON 102, BIO 101 live pipelines) │
│ • Automated Spaced-Repetition SM-2 Scheduler for Flashcards             │
│ • Cloud-synchronized 15-Minute Study Sprint Analytics                   │
│ • Exportable PDF Study Summary Reports                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      P2: COMMERCIAL ROADMAP V2.0 (FUTURE)               │
├─────────────────────────────────────────────────────────────────────────┤
│ • Canvas, Blackboard, and Moodle LTI 1.3 Ingestion                      │
│ • Collaborative Peer Study Cohorts & Anonymized Cohort Benchmarks       │
│ • Native Mobile Applications (iOS / Android React Native)               │
│ • Multi-Modal Mathematical Equation Rendering (LaTeX OCR from handwritten)│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Scope Defenses: What We Explicitly Say "NO" To

To ensure the demo runs without hiccups in front of judges, the team explicitly commits to:
1. **NO Live Heavy Video Uploads during Demo:** Transcribing a 480MB video via speech-to-text API takes 45–90 seconds minimum. Judges will not wait. Video materials will be pre-indexed into semantic text vectors, allowing the UI to show video timestamp badges (`14:32`) instantly.
2. **NO Unrestricted Web Search in the Tutor:** The tutor must not search Wikipedia or Google during student queries. The Socratic Tutor's unique selling proposition is **zero-hallucination course grounding**. If the answer isn't in Professor Henderson's courseware, it must trigger the `not_found` boundary guard.
3. **NO UI Redesign or State Architecture Rewrite:** Do not swap Vite for Next.js; do not rewrite React state router with react-router-dom; do not replace Tailwind tokens.
4. **NO Multi-Tenant Cloud Infrastructure Complexity:** Run the FastAPI backend with local SQLite and FastAPI BackgroundTasks for zero-configuration, reliable execution on any judge or developer workstation.

---

## 5. Scope Freeze Checklist

- [x] Target persona and course fixed to **Ananya Sharma (CS 204)**.
- [x] P0 feature set locked to 9 foundational capabilities.
- [x] Multi-modal video transcription deferred to pre-indexed transcripts.
- [x] UI design, typography, and color palette frozen.
- [x] Client API contract defined in `api-client.ts`.

