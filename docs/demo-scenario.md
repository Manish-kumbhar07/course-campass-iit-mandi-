# Hackathon Demo Scenario & Presentation Playbook

**Project:** CourseCompass  
**Presentation Time Limit:** 3 Minutes (Sharp)  
**Target Audience:** Hackathon Judges, Academic Technologists, AI Engineers  
**Source Persona:** Ananya Sharma (Undergrad CS Student, 12 Days to Midterm)  
**Demo Course:** CS 204: Data Structures & Algorithms (Recursion & Directed Graphs)  

---

## 1. Setup & Pre-Flight Checklist

Before opening the presentation tab:
1. Ensure the FastAPI backend is running on `http://localhost:8000`.
2. Ensure the Vite frontend is running on `http://localhost:3000`.
3. Open browser in an Incognito window at `http://localhost:3000/`.
4. Ensure browser zoom is at 100% on standard 1080p display.
5. Have the contingency backup tab ready in a secondary window.

---

## 2. Minute-by-Minute Demo Script

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           3-MINUTE TIMELINE                             │
├───────────────┬─────────────────────────────────────────────────────────┤
│ 0:00 - 0:30   │ The Hook: Exam panic, note chaos, LLM hallucination trap│
│ 0:30 - 1:00   │ Fast Demo Login & Transparent Course Ingestion          │
│ 1:00 - 1:45   │ Prerequisite Map & Grounded Socratic Tutor (Boundary)   │
│ 1:45 - 2:30   │ Diagnostic Quiz: Misconception Traps & Citation Modal   │
│ 2:30 - 3:00   │ Deterministic Mastery Update & "Study Next" Impact      │
└───────────────┴─────────────────────────────────────────────────────────┘
```

---

### Act 1: The Hook & Problem (0:00 – 0:30)

* **Visual:** Browser on Landing Page (`/`). Point to the live citation excerpt badge on the hero section.
* **Spoken Pitch:**
  > *"Every college student knows this feeling: Midterms are in 12 days. You have 34 pages of textbook proofs, 500 megabytes of lecture recordings, and 3 sets of slides. You turn to ChatGPT for help, but it gives you generic code using library functions your professor explicitly forbids on the exam.*  
  > *College students don't need generic AI—they need **source-grounded precision**. Welcome to CourseCompass: the personalized tutor that turns scattered course materials into an audited, prerequisite-guided roadmap to an A."*

---

### Act 2: Login & Ingestion (0:30 – 1:00)

* **Visual:** Click **"Sign In"** in top navbar, then click the 1-click button: **"Quick Demo Login: Ananya Sharma"**.
* **Action:** Immediately transition into the authenticated dashboard (`/app/dashboard`).
* **Visual:** Click **"+ New Course"** to show `/app/courses/new`.
* **Spoken Pitch:**
  > *"Meet Ananya Sharma, a second-year undergraduate preparing for her CS 204 midterm. Rather than juggling files, she drops in her syllabus, lecture slides, and textbook chapters. CourseCompass runs an audited 7-stage ingestion pipeline—extracting structural headings, isolating code invariants, and mapping prerequisite relationships."*

---

### Act 3: Prerequisite Map & Socratic Tutor (1:00 – 1:45)

* **Visual:** Click **"Course Map"** in sidebar (`/app/courses/:id/map`).
* **Action:** Click node **"Recursion Base Cases"** (orange/attention state, 44% mastery). Click **"Ask Tutor About This Concept"**.
* **Visual:** Transition into **AI Tutor** tab (`/app/courses/:id/tutor`).
* **Action:** Submit prompt:
  > *"Why does omitting a base case trigger a stack overflow in recursive graph traversal?"*
* **Visual:** Highlight the green badge: `● Supported by your courseware`. Point out the citation tag: `[Textbook Ch. 4, p. 112]`. Click it to trigger the **Source Citation Modal** showing the exact book quote.
* **Action (The Climax / Boundary Guard):** Type negative control prompt:
  > *"Can you explain Red-Black tree rotation invariants?"*
* **Visual:** The tutor flags the red boundary badge: `✕ Not found in courseware`.
* **Spoken Pitch:**
  > *"Notice what just happened. Every factual answer is backed by verifiable courseware citations. But more importantly: when asked about Red-Black Trees, the tutor doesn't hallucinate! It tells the student: 'This topic is not in your currently indexed CS 204 courseware.' This is zero-hallucination AI you can trust for an exam."*

---

### Act 4: Diagnostic Assessment & Misconceptions (1:45 – 2:30)

* **Visual:** Click **"Adaptive Quiz"** in sidebar (`/app/courses/:id/practice`).
* **Action:** On the Question regarding DFS Cycle Detection, deliberately select the common student trap distractor:
  * Option: *"Any edge leading to an already visited vertex indicates a cycle."*
* **Action:** Click **"Submit Answer"**.
* **Visual:** UI turns red on the trap and highlights the correct answer in green. Show the misconception callout:
  * *"Trap Detected: Cross-edges between visited subtrees are not ancestor back-edges. Only back-edges to active Gray vertices on the call stack represent cycles."*
* **Spoken Pitch:**
  > *"CourseCompass doesn't just grade right or wrong. It performs diagnostic unmasking—identifying the exact structural misconception that costs students letter grades on exams."*

---

### Act 5: Deterministic Mastery & "Study Next" (2:30 – 3:00)

* **Visual:** Click **"Dashboard"** (`/app/dashboard`).
* **Visual:** Point to the updated metrics:
  * Mastery on Base Cases jumped from 44% to 58%.
  * Overall course readiness increased by +6%.
  * The top card now prescribes: **"Study Next: 15-Minute Sprint on DFS Three-Color Invariants"**.
* **Spoken Pitch:**
  > *"In just three minutes, Ananya identified her root prerequisite gap, verified it against her textbook, diagnosed her misconception, and received a mathematically grounded prescription for what to study next. CourseCompass turns academic panic into clarity. Thank you."*

---

## 3. Contingency & Fallback Runbook

| Failure Scenario | Live Indicator | Presenter Action |
| :--- | :--- | :--- |
| **LLM API Timeout ($> 4\text{s}$)** | Spinner delays in chat | Click the pre-seeded prompt pill *"Why does infinite recursion cause a stack overflow in DFS?"* which draws from instant local cache. |
| **Network Disconnection** | Offline browser banner | Switch to the offline-enabled local tab where all endpoints are pre-warmed via SQLite and local cache. |
| **Audio/Mic Issue** | Presenter audio cuts out | The UI is visually self-explanatory; slide cards and green/red trust badges convey the story without narration. |

