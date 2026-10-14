# End-to-End Student Journey Map

**Project:** CourseCompass  
**User Persona:** Ananya Sharma (Undergraduate CS Student)  
**Goal:** Prepare for CS 204 Midterm Exam in 12 Days by eliminating foundational prerequisite gaps.  

---

```
                                  STUDENT JOURNEY STAGES
                                  
 [Stage 1: Discovery] ────► [Stage 2: Auth & Onboarding] ────► [Stage 3: Course Ingestion]
        │                                                               │
        ▼                                                               ▼
 [Stage 7: Mastery & Next] ◄─── [Stage 6: Diagnostic Quiz] ◄─── [Stage 4: Prerequisite Map]
                                       │                                │
                                       └────────► [Stage 5: Grounded Tutor]
```

---

## Stage 1: Discovery & Value Validation

* **Student Mental State:** Stressed, overwhelmed by 3 disparate PDF textbooks and slide decks; skeptical of AI tutors that fabricate definitions or provide generic answers.
* **Touchpoints & Views:** Public Landing Page (`/`, `LandingPage.tsx`), Public Navbar (`PublicNavbar.tsx`), Citation Modal (`SourceCitationModal.tsx`).
* **Student Actions:**
  1. Browses value proposition ("Turn scattered study material into your clearest path forward").
  2. Clicks on interactive syllabus preview card.
  3. Tests the "Verified Citation" pill, opening the live Citation Inspector modal to see an exact slide excerpt and book chapter quote.
  4. Clicks the primary CTA: **"Start Studying Free"** or **"Sign In with Demo Student"**.
* **System Transitions:** Navigates client router to `/sign-in` with `preservedRedirectPath = '/app/dashboard'`.

---

## Stage 2: Authentication & Academic Onboarding

* **Student Mental State:** Wants immediate access without filling out endless administrative forms.
* **Touchpoints & Views:** Sign In Page (`SignInPage.tsx`), Onboarding Wizard (`OnboardingFlow.tsx`), Protected Route (`ProtectedRoute.tsx`).
* **Student Actions:**
  * *Option A (Live Demo Path):* Clicks **"Quick Demo Login: Ananya Sharma"**.
  * *Option B (Standard Path):* Enters academic email (`ananya.sharma@collegemail.edu`) and password.
  * *First-Time User:* Completes 5-step onboarding wizard:
    * Step 1: Course Name (`Data Structures: Recursion and Graphs`) & Code (`CS 204`).
    * Step 2: University & Department (`School of Engineering & Applied Sciences`).
    * Step 3: Exam Target Date (`October 25, 2026`) & Daily Study Budget (`45 minutes`).
    * Step 4: Known Self-Reported Weak Points (selects *Base Case Termination* and *Call Stack vs Queue*).
    * Step 5: Confirms diagnostic assessment enrollment.
* **Backend Contract:** `POST /api/v1/auth/login` or `POST /api/v1/auth/signup`.
* **State Updates:** Returns JWT session token, sets user profile in `AuthContext`, directs user to `/app/dashboard`.

---

## Stage 3: Course Creation & Document Ingestion

* **Student Mental State:** Relief at being able to dump all course materials into one organized place.
* **Touchpoints & Views:** Course Creation Workspace (`/app/courses/new`, `CourseCreationWorkspace.tsx`), Course Materials Tab (`MaterialsView.tsx`).
* **Student Actions:**
  1. Names course workspace: `CS 204: Data Structures & Algorithms`.
  2. Drops textbook chapter (`Textbook Ch. 4: Recursion & Induction.pdf`) and slide deck (`Lecture 12: Graph Representations & DFS.pdf`).
  3. Clicks **"Ingest & Build Knowledge Map"**.
  4. Watches the transparent 7-stage pipeline progress indicator:
     * Stage 1: Secure upload & signature verification
     * Stage 2: Reading text & structural headings
     * Stage 3: Parsing algorithmic invariants & code snippets
     * Stage 4: Aligning syllabus topics
     * Stage 5: Identifying atomic concepts
     * Stage 6: Constructing prerequisite dependency edges
     * Stage 7: Preparing diagnostic quiz seeds
* **Backend Contract:** `POST /api/v1/courses/{id}/materials` (multipart upload) and polling `GET /api/v1/materials/{job_id}/status`.
* **State Updates:** Materials transition status from `uploaded` $\to$ `processing` $\to$ `indexed`. Concepts array populated.

---

## Stage 4: Prerequisite Knowledge Map Exploration

* **Student Mental State:** Eye-opening clarity; sees *why* graph cycle detection is hard because call stack mechanics was never truly mastered.
* **Touchpoints & Views:** AppShell Layout (`AppShell.tsx`), Knowledge Map View (`KnowledgeMapView.tsx`).
* **Student Actions:**
  1. Views the interactive dependency cluster:
     * `Call Stack Mechanics` (Foundational, 64% Mastery) $\to$ Prerequisite of:
     * `Recursion Base Cases` (Foundational, **44% Mastery — Needs Attention ⚠️**) $\to$ Prerequisite of:
     * `Depth-First Search (DFS)` (Intermediate, **49% Mastery — Needs Attention ⚠️**) $\to$ Prerequisite of:
     * `Cycle Detection & Three-Coloring` (Advanced, **32% Mastery — Attention ⚠️**).
  2. Clicks on the node **"Recursion Base Cases"**.
  3. Reviews the primary misconception warning: *"Treating base cases merely as exception guards rather than structural halting values with algebraic identities."*
  4. Selects **"Ask Tutor About This Concept"** or **"Take Diagnostic Quiz"**.
* **System Transitions:** Switches active tab in `AppShell` directly to `tutor` or `practice` with pre-filled context.

---

## Stage 5: Source-Grounded Socratic Tutoring

* **Student Mental State:** Inquisitive; seeking deep conceptual understanding without fear of incorrect advice.
* **Touchpoints & Views:** Tutor Chat View (`TutorChatView.tsx`), Citation Modal (`SourceCitationModal.tsx`).
* **Student Actions:**
  1. Selects explanation level: **"Rigorous (Exam-Prep)"**.
  2. Types prompt: *"Why does omitting a base case trigger a stack overflow in recursive graph traversal?"*
  3. Reads verified answer formatted with the green **"Supported by your courseware"** trust badge.
  4. Clicks the citation tag: `[Textbook Ch. 4, p. 112]`.
  5. The **Source Citation Modal** opens, highlighting the exact excerpt:
     > *"Every well-formed recursive procedure must possess at least one non-recursive base case that halts recursion. Omitting the base case... leads directly to unbounded call frame growth and a runtime stack overflow exception."*
  6. Asks a negative control question: *"Can you explain Red-Black tree rotations?"*
  7. Observes the Socratic Tutor's **Boundary Guard**:
     > *"This topic (Red-Black Trees) was not found in your currently indexed CS 204 courseware. CourseCompass adheres to verified source boundaries. Would you like an outside overview or would you like to upload your Red-Black Tree slides?"*
* **Backend Contract:** `POST /api/v1/courses/{id}/tutor/chat`.
* **State Updates:** Appends verified messages to `messages` history state.

---

## Stage 6: Adaptive Diagnostic Assessment

* **Student Mental State:** Challenged, actively testing retention, safe environment to make mistakes and learn.
* **Touchpoints & Views:** Adaptive Quiz View (`AdaptiveQuizView.tsx`).
* **Student Actions:**
  1. Encounters targeted diagnostic question on **Cycle Detection & Three-Coloring Invariants**.
  2. Question asks what a back-edge to an active vertex indicates during DFS.
  3. Student selects distractor option B: *"Any visited vertex represents a cycle."*
  4. Clicks **"Submit Answer"**.
  5. UI renders immediate red/green feedback:
     * Marks option B incorrect.
     * Highlights the correct option: *"Edge to a Gray vertex currently active on the recursion call stack."*
     * Explains the misconception: *Cross-edges to Black vertices are finished subtrees, not ancestor cycles.*
     * Displays link to `[Slide Deck 12, Slide 19]`.
  6. Finishes assessment run (2/2 questions completed).
* **Backend Contract:** `POST /api/v1/quizzes/{id}/submit`.

---

## Stage 7: Deterministic Mastery Update & "Study Next" Guidance

* **Student Mental State:** Motivated; clear accomplishment; knows exactly what 20-minute task to do tomorrow.
* **Touchpoints & Views:** Overview Dashboard (`OverviewView.tsx`), Topic Mastery Tracker (`TopicProgressReport.tsx`, `StudyStreak.tsx`).
* **Student Actions:**
  1. Returns to Dashboard.
  2. Observes live mathematical mastery update:
     * `Recursion Base Cases`: $44\% \to 58\%$
     * `DFS Traversal`: $49\% \to 57\%$
     * Overall Course Readiness: $+6\%$ gain
  3. Inspects the **"Study Next" Prescriptive Recommendation**:
     * Urgency: **High**
     * Recommended Action: *15-minute Study Sprint on "Three-Coloring Invariant Proof"*
     * Target Citation: *Lecture 12 Slides, Slide 19*
  4. Clicks **"Start Sprint"** or logs out knowing her study session was 100% productive and source-grounded.
* **Backend Contract:** `GET /api/v1/courses/{id}/mastery` and `GET /api/v1/courses/{id}/study-plan`.

---

## Journey Failure Modes & Recovery Matrix

| Journey Point | Potential Failure Mode | Student Recovery Path |
| :--- | :--- | :--- |
| **Material Upload** | Corrupted or password-protected PDF | Pipeline highlights specific file in red, emits descriptive error, offers retry or plain-text paste. |
| **Tutor Query** | Student asks prompt with zero courseware match | Tutor gracefully emits `not_found` state, offers outside explanation opt-in, prompts user to upload missing deck. |
| **Network Interruption** | API call fails during chat or quiz submit | System displays inline retry button; local state caches input so student never loses typed prompt. |

