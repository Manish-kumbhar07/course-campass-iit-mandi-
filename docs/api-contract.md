# API Contracts & RESTful Interface Specification

> **Security implementation addendum (2026-10-14):** `backend/app` implements the
> authentication, course ownership, and private material-management operations
> below. The demo-login endpoint described in the older MVP contract is not
> implemented: a demo identity must not be granted to an unauthenticated caller.
> The current implementation uses bcrypt-hashed passwords, 15-minute HS256
> access tokens, and rotating opaque refresh tokens in an HttpOnly cookie.

## Security and File-Management Addendum

All protected endpoints require `Authorization: Bearer <access-token>`.
Missing, malformed, expired, revoked, and simulated tokens are rejected with
401; the API never falls back to a demo user. Refresh credentials are not
returned in JSON. Successful registration/login sets the
`coursecompass_refresh` cookie (`HttpOnly`, `SameSite=Strict`, and `Secure` in
production). Access tokens expire in 15 minutes; refresh tokens rotate on use
and are revocable by logout.

`POST /api/v1/auth/refresh` rotates the refresh cookie and returns the standard
session response. `POST /api/v1/auth/logout` revokes the active session.
`GET /api/v1/courses/{courseId}` retrieves an owned course. `DELETE
/api/v1/courses/{courseId}` deletes an owned course after its private objects
are removed; storage failure leaves database rows intact and returns a generic
502 error. Foreign-owned courses/documents are returned as not found to avoid
confirming another tenant's identifiers.

For object-storage uploads, use this sequence:

1. `POST /api/v1/courses/{courseId}/materials/initiate` with
   `{"filename":"lecture.pdf","contentType":"application/pdf","sizeBytes":1234,"title":"Lecture"}`.
   Course ownership is checked before creating a pending upload. The response
   returns a random-key presigned PUT URL and required Content-Type header.
2. PUT the file bytes directly to the returned URL.
3. `POST /api/v1/materials/{materialId}/complete`. The API checks object size
   and MIME metadata, downloads the bounded object to verify its signature,
   rejects/deletes invalid content, then creates an ingestion job.

The development-only local-storage adapter accepts the same initiation flow
but returns an authenticated API upload URL. Downloads and destructive
operations also require course ownership. Download links expire within five
minutes. Files are limited to 30 MiB; video duration is checked with `ffprobe`
and capped at the configured maximum. Supported extensions, declared MIME
types, and binary signatures must agree. Original client filenames are never
used as storage keys. Private S3-compatible buckets must have public access
blocked; object access is granted only through short-lived signed URLs.

Errors retain the frontend envelope `{message, statusCode, details}`.
Server-side errors do not include exception text, credentials, object keys, or
private file data. Auth and API rate-limit dependencies use Redis when
`RATE_LIMIT_REDIS_URL` is configured; the process-local limiter is development
only and production startup requires Redis. Security audit events capture
actions, outcomes, and non-sensitive metadata only.

Run schema migrations from `backend/` with `alembic upgrade head` before
production startup. Production does not run `create_all` automatically.

**API Version:** `v1`  
**Base URL:** `/api/v1`  
**Authentication Scheme:** `Authorization: Bearer <JWT>`  
**Serialization Standard:** JSON, `camelCase` keys (matching `src/types/index.ts`)  
**Error Standard:** RFC 7807 compatible error envelope matching frontend `ApiError`  

---

## 1. Global Conventions & Standards

### 1.1 Standard Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
```

### 1.2 Unified Error Response Envelope
Every 4xx and 5xx response returns a deterministic JSON schema directly consumable by `src/services/api-client.ts`:

```json
{
  "message": "Resource not found or unauthorized",
  "statusCode": 404,
  "details": {
    "code": "COURSE_NOT_FOUND",
    "field": "courseId",
    "timestamp": "2026-10-14T14:30:00Z"
  }
}
```

### 1.3 Pagination Envelope (Standard List Queries)
```json
{
  "items": [],
  "total": 42,
  "page": 1,
  "pageSize": 20,
  "hasMore": true
}
```

---

## 2. Authentication & Student Profile Endpoints

### 2.1 Sign Up (Student Registration)
* **Endpoint:** `POST /api/v1/auth/signup`
* **Auth Required:** No

#### Request Body
```json
{
  "name": "Ananya Sharma",
  "email": "ananya.sharma@collegemail.edu",
  "password": "SecurePassword123!"
}
```

#### Response (201 Created)
```json
{
  "user": {
    "id": "usr-ananya-sharma",
    "name": "Ananya Sharma",
    "email": "ananya.sharma@collegemail.edu",
    "academicLevel": "Second-year Undergraduate",
    "institution": "School of Engineering & Applied Sciences",
    "isNewUser": true,
    "createdAt": "2026-10-14T14:30:00Z"
  },
  "token": "cc_jwt_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2026-10-14T22:30:00Z",
  "isDemoSession": false
}
```

---

### 2.2 Sign In
* **Endpoint:** `POST /api/v1/auth/login`
* **Auth Required:** No

#### Request Body
```json
{
  "email": "ananya.sharma@collegemail.edu",
  "password": "SecurePassword123!"
}
```

#### Response (200 OK)
Returns the `Session` object identical to 2.1 with `isNewUser: false`.

---

### 2.3 Fast-Path Demo Login (1-Click Hackathon Evaluation)
* **Endpoint:** `POST /api/v1/auth/demo-login`
* **Auth Required:** No

#### Response (200 OK)
Returns pre-seeded demo session for `usr-ananya-sharma` with full pre-loaded data for course `CS 204`.

---

### 2.4 Get Current User Session
* **Endpoint:** `GET /api/v1/auth/me`
* **Auth Required:** Yes (`Bearer <token>`)

#### Response (200 OK)
```json
{
  "id": "usr-ananya-sharma",
  "name": "Ananya Sharma",
  "email": "ananya.sharma@collegemail.edu",
  "academicLevel": "Second-year Undergraduate",
  "institution": "School of Engineering & Applied Sciences",
  "avatarUrl": null,
  "createdAt": "2026-09-01T08:00:00Z"
}
```

---

## 3. Course Management Endpoints

### 3.1 List Enrolled Courses
* **Endpoint:** `GET /api/v1/courses`
* **Auth Required:** Yes

#### Response (200 OK)
```json
[
  {
    "id": "course-cs204",
    "userId": "usr-ananya-sharma",
    "name": "Data Structures: Recursion and Graphs",
    "code": "CS 204",
    "subject": "Computer Science",
    "examDate": "October 25, 2026",
    "examCountdownDays": 12,
    "dailyStudyMinutes": 45,
    "overallMastery": 58,
    "documentsCount": 5,
    "conceptsCount": 8,
    "createdAt": "2026-09-10T10:00:00Z",
    "updatedAt": "2026-10-13T18:00:00Z"
  }
]
```

---

### 3.2 Create New Course Workspace
* **Endpoint:** `POST /api/v1/courses`
* **Auth Required:** Yes

#### Request Body
```json
{
  "name": "Data Structures: Recursion and Graphs",
  "code": "CS 204",
  "subject": "Computer Science",
  "examDate": "2026-10-25",
  "dailyStudyMinutes": 45
}
```

#### Response (201 Created)
Returns newly created `Course` object.

---

## 4. Document Ingestion & Pipeline Tracking

### 4.1 Upload Course Material (Multipart)
* **Endpoint:** `POST /api/v1/courses/{courseId}/materials`
* **Auth Required:** Yes
* **Content-Type:** `multipart/form-data`

#### Form Fields
* `file`: Binary file stream (`.pdf`, `.pptx`, `.txt`, `.mp4`)
* `title`: "Textbook Ch. 4: Recursion & Mathematical Induction Foundations"
* `documentType`: "pdf"

#### Response (202 Accepted)
```json
{
  "material": {
    "id": "doc-1",
    "courseId": "course-cs204",
    "title": "Textbook Ch. 4: Recursion & Mathematical Induction Foundations",
    "type": "pdf",
    "fileSizeBytes": 14889728,
    "formattedSize": "14.2 MB",
    "pageCountOrDuration": "34 Pages",
    "uploadedAt": "Oct 14, 2026",
    "status": "processing",
    "extractedConcepts": []
  },
  "job": {
    "id": "job-101",
    "documentId": "doc-1",
    "stage": "secure_upload",
    "stageNumber": 1,
    "totalStages": 7,
    "stageDescription": "Validating cryptographic container and file signatures",
    "progressPercent": 14,
    "isCompleted": false
  }
}
```

---

### 4.2 Poll Ingestion Job Status
* **Endpoint:** `GET /api/v1/jobs/{jobId}/status`
* **Auth Required:** Yes

#### Response (200 OK)
```json
{
  "id": "job-101",
  "documentId": "doc-1",
  "stage": "building_prerequisites",
  "stageNumber": 6,
  "totalStages": 7,
  "stageDescription": "Constructing dependency edges between memory & graph concepts",
  "progressPercent": 85,
  "isCompleted": false,
  "error": null
}
```

---

## 5. Prerequisite Knowledge Map Endpoints

### 5.1 Get Course Concept Graph
* **Endpoint:** `GET /api/v1/courses/{courseId}/concepts`
* **Auth Required:** Yes

#### Response (200 OK)
```json
[
  {
    "id": "c-base-cases",
    "courseId": "course-cs204",
    "topicId": "top-recursion",
    "topic": "Recursion Foundations",
    "name": "Recursion Base Cases",
    "difficulty": "Foundational",
    "masteryPercent": 44,
    "status": "attention",
    "summary": "Guaranteed halting states where the function returns directly without issuing further recursive invocations.",
    "primaryMisconception": "Treating base cases merely as exception guards rather than structural halting values with algebraic identities.",
    "prerequisiteIds": ["c-stack-mechanics"],
    "dependentConceptIds": ["c-divide-conquer", "c-dfs-traversal"],
    "citations": [
      {
        "id": "cite-tb-1",
        "documentId": "doc-1",
        "documentTitle": "Introduction to Algorithms & Data Structures (4th Ed.)",
        "sourceTitle": "Introduction to Algorithms & Data Structures (4th Ed.)",
        "documentType": "pdf",
        "sourceType": "pdf",
        "locationLabel": "Chapter 4, Page 112",
        "pageNumber": 112,
        "excerpt": "Every well-formed recursive procedure must possess at least one non-recursive base case that halts recursion.",
        "contextSnippet": "Section 4.2: Anatomy of Stack Frames in Activation Records — Figure 4.3 illustrates push/pop lifecycles.",
        "verificationConfidence": "verified"
      }
    ]
  }
]
```

---

## 6. Socratic AI Tutor Endpoints

### 6.1 Send Tutor Message
* **Endpoint:** `POST /api/v1/courses/{courseId}/tutor/chat`
* **Auth Required:** Yes

#### Request Body
```json
{
  "text": "Why does infinite recursion cause a stack overflow in DFS?",
  "explanationLevel": "rigorous",
  "language": "English",
  "conceptId": "c-base-cases"
}
```

#### Response (200 OK)
```json
{
  "id": "msg-1728901234",
  "sender": "tutor",
  "text": "In Depth-First Search on directed graphs, each recursive branch pushes a stack frame containing local variables and return pointers. Without an active base case halting recursion, stack frame allocation exceeds the physical hardware call stack memory limit, raising a hardware StackOverflowException.",
  "timestamp": "02:30 PM",
  "answerState": "supported",
  "citations": [
    {
      "id": "cite-vid-1",
      "sourceType": "video",
      "sourceTitle": "Lecture 08: Recursive Call Stack Mechanics & Base Case Design",
      "locationLabel": "Timestamp 14:32 - 16:15",
      "timestampSeconds": 872,
      "excerpt": "Professor Henderson: 'Notice where students make the mistake in Fibonacci or tree traversal. They write the recursive split first, but forget to verify whether negative or boundary inputs reach the leaf condition before executing.'",
      "contextSnippet": "Whiteboard demonstration of stack frame unwinding with activation records pushing onto memory addresses.",
      "verificationConfidence": "verified"
    }
  ],
  "unsupportedWarning": null,
  "conceptId": "c-base-cases"
}
```

---

### 6.2 Negative Control / Boundary Guard Response (`not_found` State)
When the student asks: *"How do Red-Black tree rotations work?"*

#### Response (200 OK)
```json
{
  "id": "msg-1728901235",
  "sender": "tutor",
  "text": "This topic (Balanced Trees / Red-Black Trees) was not found in your currently indexed CS 204 courseware (Lecture 08, Textbook Ch. 4, Slide Deck 12, Lab 3). CourseCompass strictly adheres to verified source boundaries.\n\nWould you like an outside conceptual overview, or would you prefer to upload your Balanced Trees slide deck?",
  "timestamp": "02:31 PM",
  "answerState": "not_found",
  "citations": [],
  "unsupportedWarning": "Topic outside currently indexed course syllabus boundaries.",
  "conceptId": null
}
```

---

## 7. Adaptive Diagnostic Quiz Endpoints

### 7.1 Get Diagnostic Questions
* **Endpoint:** `GET /api/v1/courses/{courseId}/quizzes/diagnostic`
* **Auth Required:** Yes

#### Response (200 OK)
```json
[
  {
    "id": "q-dfs-cycle-1",
    "conceptId": "c-cycle-detection",
    "conceptName": "Cycle Detection & Three-Coloring",
    "topicName": "Graph Algorithms",
    "prompt": "In an unweighted directed graph being traversed via DFS, an edge (u, v) is encountered. Under what condition does this edge prove the existence of a directed cycle?",
    "questionType": "multiple_choice",
    "difficulty": "Advanced",
    "options": [
      {
        "id": "opt-1",
        "text": "Vertex v has been visited at least once and is in the BLACK state.",
        "isCorrect": false,
        "misconceptionExplanation": "A Black vertex is fully completed and popped off the call stack. An edge to a Black vertex is a cross-edge or forward-edge, not an ancestor back-edge."
      },
      {
        "id": "opt-2",
        "text": "Vertex v is currently in the GRAY state, active on the recursion call stack.",
        "isCorrect": true,
        "misconceptionExplanation": null
      }
    ],
    "explanation": "Per Invariant 3 in Slide Deck 12 (Slide 19), a cycle exists if and only if an edge points to an active ancestor currently on the recursion call stack (Gray state).",
    "citation": {
      "id": "cite-sld-1",
      "sourceType": "slides",
      "sourceTitle": "Lecture 12 Slide Deck: Graph Representations & Depth-First Search",
      "locationLabel": "Slide 19 of 38",
      "slideNumber": 19,
      "excerpt": "Invariant 3: In an unweighted directed graph, an edge (u, v) encountered during DFS is a back-edge if and only if vertex v is currently in the ACTIVE/GRAY state on the recursion call stack.",
      "contextSnippet": "Three-Color vertex convention: White = unvisited, Gray = active on stack, Black = completed."
    }
  }
]
```

---

### 7.2 Submit Quiz Assessment
* **Endpoint:** `POST /api/v1/quizzes/{quizId}/submit`
* **Auth Required:** Yes

#### Request Body
```json
{
  "answers": [
    { "questionId": "q-dfs-cycle-1", "selectedOptionId": "opt-2" }
  ]
}
```

#### Response (200 OK)
```json
{
  "attemptId": "att-901",
  "scorePercent": 100,
  "totalQuestions": 1,
  "correctCount": 1,
  "masteryGainPercent": 12,
  "weakConceptsIdentified": [],
  "updatedConcepts": [
    { "conceptId": "c-cycle-detection", "newMasteryPercent": 44, "newStatus": "attention" }
  ]
}
```

---

## 8. Topic Mastery & Study Plan Endpoints

### 8.1 Get Topic Mastery Breakdown
* **Endpoint:** `GET /api/v1/courses/{courseId}/mastery`
* **Auth Required:** Yes

#### Response (200 OK)
```json
[
  {
    "topicId": "top-recursion",
    "topicTitle": "Recursion Foundations",
    "masteryPercent": 61,
    "conceptsTotal": 2,
    "conceptsMastered": 1,
    "conceptsDeveloping": 0,
    "conceptsAttention": 1
  }
]
```

---

### 8.2 Get Dynamic Study Plan & Recommendations
* **Endpoint:** `GET /api/v1/courses/{courseId}/study-plan`
* **Auth Required:** Yes

#### Response (200 OK)
```json
[
  {
    "dayNumber": 1,
    "dateString": "Today · Oct 14",
    "focusConceptId": "c-base-cases",
    "focusTitle": "Call Stack Bounds & Base Case Invariants",
    "minutesBudget": 45,
    "status": "in-progress",
    "tasks": [
      {
        "id": "t-1",
        "title": "Socratic Session: Base Case Halting & Identity Elements",
        "durationMinutes": 15,
        "completed": true,
        "type": "tutor"
      },
      {
        "id": "t-2",
        "title": "Diagnostic Run: Call Stack Tracing & Depth Bounds",
        "durationMinutes": 20,
        "completed": false,
        "type": "quiz"
      }
    ]
  }
]
```
