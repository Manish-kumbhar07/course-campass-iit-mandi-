# Acceptance Criteria (Given-When-Then)

**Project:** CourseCompass  
**Release:** Hackathon MVP (P0 Scope)  
**Standard:** Behavior-Driven Development (BDD / Gherkin Format)  

---

## P0-1: Student Authentication & Session Management

### Scenario 1.1: Quick Demo Login (Hackathon Fast-Path)
* **Given** an unauthenticated visitor navigates to `/sign-in`
* **When** the user clicks the "Quick Demo Login: Ananya Sharma" button
* **Then** the system sends a request to `POST /api/v1/auth/demo-login`
* **And** the server issues a valid JWT token representing `usr-ananya-sharma`
* **And** the frontend stores the token and redirects directly to `/app/dashboard` in $< 500\text{ms}$
* **And** the user profile displays "Ananya Sharma", "CS 204", and "12 Days to Midterm".

### Scenario 1.2: Standard Registration with Validation
* **Given** a new student is on `/sign-up`
* **When** they submit an email without an `@` symbol or with an empty password
* **Then** the client blocks submission and displays an inline red validation error
* **When** they submit valid credentials (name, valid email, password $\ge 6$ characters)
* **Then** the server creates a new user record in SQLite, returns a JWT token, and redirects the student to the `/onboarding` flow with `isNewUser = true`.

### Scenario 1.3: Protected Route Rejection
* **Given** a user with no active session or an expired JWT
* **When** they directly enter or navigate to any `/app/*` or `/onboarding` route
* **Then** the `ProtectedRoute` component intercepts the transition, sets `preservedRedirectPath`, and immediately redirects to `/sign-in`.

---

## P0-2: Private Course Workspace Creation

### Scenario 2.1: Course Initialization
* **Given** an authenticated student on `/app/courses/new`
* **When** the student enters Course Name ("Data Structures"), Code ("CS 204"), Exam Date ("October 25, 2026")
* **And** clicks "Create Course Workspace"
* **Then** the backend persists the new course record linked exclusively to the authenticated `user_id`
* **And** initializes an empty course corpus container ready for document ingestion.

### Scenario 2.2: Cross-User Workspace Isolation
* **Given** two authenticated students, User A and User B
* **When** User B queries `GET /api/v1/courses/{course_id_of_user_a}`
* **Then** the backend returns an HTTP 403 Forbidden response
* **And** no metadata, materials, or concept data is leaked.

---

## P0-3: PDF Document Ingestion & Chunking Pipeline

### Scenario 3.1: Successful PDF Upload & Text Parsing
* **Given** a student is on the Course Creation Workspace or Materials View
* **When** they upload a course PDF (e.g., `Textbook Ch. 4: Recursion.pdf`, size $\le 30\text{MB}$)
* **Then** the backend stores the file in the course storage directory
* **And** extracts text content preserving chapter titles, section numbers, and page numbers
* **And** splits text into semantic chunks of $400\text{–}600$ tokens with $50$-token overlap
* **And** computes vector embeddings using Google GenAI or local vector store
* **And** the frontend UI updates the material status to `indexed` within $< 8\text{ seconds}$.

### Scenario 3.2: Corrupted or Non-PDF Rejection
* **Given** a student attempts to upload an unsupported format (e.g., `.exe`, `.zip`) or a zero-byte file
* **Then** the backend immediately returns an HTTP 400 Bad Request with `{ "error": "Invalid file format or unreadable stream" }`
* **And** the UI displays a clear red alert tag with a retry button.

---

## P0-4: Prerequisite Concept Graph Extraction & Rendering

### Scenario 4.1: Prerequisite Graph Display
* **Given** a course with indexed materials
* **When** the student opens the Course Map tab (`/app/courses/:id/map`)
* **Then** the system renders a directed acyclic graph (DAG) of concept nodes
* **And** each node shows: Name, Difficulty Badge, Mastery Percentage, and Status (`mastered`, `learning`, `attention`, `locked`)
* **And** directed edges visually connect prerequisite nodes to dependent nodes (e.g., `Call Stack Mechanics` $\to$ `Recursion Base Cases`).

### Scenario 4.2: Interactive Concept Inspection Drawer
* **Given** the Prerequisite Knowledge Map is visible
* **When** the student clicks on a concept node (e.g., `Recursion Base Cases`)
* **Then** the deep-dive drawer renders on the right side of the screen displaying:
  * Concept Summary
  * Primary Student Misconception
  * Prerequisite list with clickable navigation links
  * Linked course source citations
  * Quick-action buttons: "Ask Tutor" and "Test Concept".

---

## P0-5: Source-Grounded Socratic Question Answering (The 4 States)

### Scenario 5.1: Fully Supported Courseware Query (State 1)
* **Given** an indexed course with textbook Chapter 4 and Lecture 08
* **When** the student asks: *"Why does omitting a base case cause a stack overflow?"*
* **Then** the backend RAG pipeline retrieves relevant chunks from Chapter 4 and Lecture 08
* **And** generates a response rigorously grounded in those chunks
* **And** sets `answerState: "supported"`
* **And** the message displays the green badge: `● Supported by your courseware`
* **And** embeds clickable citation tags `[Textbook Ch. 4, p. 112]` and `[Lecture 08, 14:32]`.

### Scenario 5.2: Query Outside Indexed Materials (State 3 Boundary Guard)
* **Given** a course where only Recursion and DFS Graph Traversal have been indexed
* **When** the student asks: *"How do Red-Black tree rotations work?"*
* **Then** the backend vector similarity scores fall below the grounding threshold ($< 0.65$)
* **And** the backend sets `answerState: "not_found"`
* **And** the tutor explicitly replies:
  > *"This topic (Red-Black Trees) was not found in your currently indexed CS 204 courseware. CourseCompass strictly adheres to verified course boundaries. Would you like an outside conceptual overview, or would you prefer to upload your Balanced Trees slide deck?"*
* **And** the message displays the red badge: `✕ Not found in courseware`.

### Scenario 5.3: Partially Supported Query (State 2)
* **Given** a query that touches on indexed concepts but asks about an unindexed detail
* **Then** the tutor identifies the exact sub-part found in courseware, cites it, flags the remaining part as unindexed, and sets `answerState: "partially_supported"`.

---

## P0-6: Citation Verification & Source Inspector Modal

### Scenario 6.1: Opening Citation Deep-Inspector
* **Given** a tutor message, quiz question, or concept drawer with a citation tag
* **When** the student clicks the citation tag (e.g., `[Textbook Ch. 4, p. 112]`)
* **Then** the `SourceCitationModal` opens as an accessible dialog (`role="dialog"`)
* **And** displays:
  * Document Type icon (`pdf`, `video`, `slides`)
  * Source Title (`Introduction to Algorithms & Data Structures`)
  * Location Label (`Chapter 4, Page 112`)
  * The exact verbatim excerpt quote highlighted in bold text
  * Surrounding contextual paragraph snippet
* **When** the student clicks "Copy Excerpt", the exact quoted text is placed on the clipboard and a checkmark appears for 2 seconds.

---

## P0-7: Adaptive Diagnostic Quiz & Misconception Evaluation

### Scenario 7.1: Taking a Diagnostic Question
* **Given** the student launches an Adaptive Quiz for `CS 204`
* **When** question 1 on Cycle Detection & Three-Coloring is presented
* **And** the student selects an answer option and clicks "Submit Answer"
* **Then** the UI locks the options to prevent resubmission
* **And** highlights the selected option in red (if wrong) and the correct option in emerald green
* **And** displays the specific misconception explanation explaining *why* the chosen distractor was a trap
* **And** displays the verified source citation link.

### Scenario 7.2: Completing Diagnostic Assessment
* **Given** the student answers all diagnostic questions
* **When** the final question is submitted
* **Then** the completion summary renders showing:
  * Raw score count and percentage (e.g., `1 of 2` or `2 of 2`)
  * Mastery gain badges for identified concepts
  * Primary navigation CTA: "Return to Study Plan".

---

## P0-8: Deterministic Mastery Calculation & Prerequisite Propagation

### Scenario 8.1: Mathematical Mastery Score Update
* **Given** a concept node $C_i$ with prior mastery $M_{prev} = 44\%$
* **When** a student answers a diagnostic question targeting $C_i$ correctly
* **Then** the backend recalculates concept mastery using deterministic weighting:
  $$M_{new} = \min(100, M_{prev} + \Delta_{quiz})$$
* **And** updates the status badge from `attention` ($< 50\%$) to `learning` ($50\text{–}69\%$) or `mastered` ($\ge 70\%$)
* **And** updates the student's overall course readiness percentage
* **And** reflects the new percentages across Dashboard, Course Map, and Mastery tabs without requiring a page refresh.

### Scenario 8.2: Prerequisite Propagation
* **Given** concept $C_{child}$ is dependent on $C_{parent}$
* **When** $C_{parent}$ mastery is below $50\%$
* **Then** $C_{child}$ is flagged with a prerequisite warning banner and cannot achieve `mastered` status until $C_{parent}$ reaches at least $60\%$.

---

## P0-9: "Study Next" Prescriptive Recommendation Engine

### Scenario 9.1: Identifying Highest-Yield Study Task
* **Given** the student's updated concept mastery profile
* **When** the student navigates to the Dashboard (`/app/dashboard`)
* **Then** the system computes the concept with the lowest mastery score that is also an active blocker for downstream topics
* **And** generates the top "Study Next" priority card with:
  * Urgency Badge: `HIGH URGENCY`
  * Actionable Task: e.g., *"15-minute Socratic review on Recursion Base Case Termination"*
  * Target Source: *Textbook Ch. 4, Page 112*
  * Direct action button linking to the Tutor or Study Sprint.

