# Technical Assumptions, Risks & Mitigation Strategies

**Project:** CourseCompass  
**Context:** International AI Hackathon MVP Architecture  

---

## 1. Technical Assumptions

1. **Google Gemini LLM Platform:**  
   * The backend will leverage Google Gemini (e.g., `gemini-2.5-flash` or `gemini-1.5-flash`) via the server-side official `google-genai` Python SDK.
   * Gemini's large context window (1M+ tokens) allows whole-chapter PDF grounding without complex multi-document map-reduce aggregation.
2. **Local Execution Environment:**  
   * The host machine has Python 3.12+ and Node.js v20+ installed.
   * The FastAPI server and Vite dev server will execute locally during judging and evaluation.
3. **Storage & Persistence:**  
   * A local SQLite database managed by SQLAlchemy/SQLModel is sufficient for single-user concurrent hackathon judging sessions.
   * Document assets (PDFs) are stored in a local `./backend/storage/` directory.
4. **PDF Extraction Fidelity:**  
   * University course handouts and textbooks are standard computer-generated PDFs (PyPDF / pdfplumber can extract cleanly without requiring commercial vision OCR APIs).

---

## 2. Key Technical Risks & Mitigation Matrix

| # | Risk Description | Severity | Likelihood | Mitigation Strategy |
| :- | :--- | :---: | :---: | :--- |
| **R1** | **LLM API Rate Limits or Network Outages during Live Judging** | Critical | Medium | **Dual-Engine Cache:** The backend caches vector embeddings and pre-computed tutor completions for standard demo queries. If the Gemini API call exceeds 4 seconds or errors, the server gracefully serves the verified cached response. |
| **R2** | **Hallucinated Page Numbers or Inaccurate Citations** | High | Low | **Strict Grounding Contract:** The RAG system passes chunks with strict chunk ID headers `[CHUNK: id=doc-1-p112]`. The system prompt instructs Gemini to output citations strictly referencing retrieved chunk IDs, which are validated against the database before returning to the UI. |
| **R3** | **Multi-Modal Video Ingestion Delay Breaching Demo Time Limit** | High | High | **Pre-Indexed Hybrid Model:** While PDF parsing is performed live, video recordings (like Lecture 08) are pre-indexed as timestamped academic transcripts. The UI showcases full video metadata without risking a 90-second transcription freeze. |
| **R4** | **Windows OS Script Incompatibility** | Medium | High | Avoid Linux shell commands (`rm -rf`) in `package.json` scripts. Use cross-platform tools (`rimraf` or standard Node scripts) and document exact PowerShell commands. |
| **R5** | **Frontend-Backend Contract Discrepancy (camelCase vs snake_case)** | Medium | Medium | Configure all Pydantic v2 schemas in FastAPI with `populate_by_name = True` and `alias_generator = to_camel` so frontend TypeScript interfaces remain 100% compatible. |

---

## 3. Unresolved Architectural Decisions & Recommended Defaults

### Decision 1: Database Engine — SQLite vs. PostgreSQL
* **Options:**
  1. *SQLite (file-based)*
  2. *PostgreSQL (Docker container or cloud Supabase instance)*
* **Decision:** **SQLite via async SQLAlchemy (RECOMMENDED DEFAULT)**
* **Rationale:** A hackathon project must start cleanly on any judge's machine with a single command (`uvicorn app.main:app`). Requiring Docker daemon installation or cloud database credentials introduces unnecessary failure points during judging. SQLite fully supports the required schemas and handles low-concurrency demonstration flawlessly.

---

### Decision 2: Embedding Engine — Remote API vs. Local Vectors
* **Options:**
  1. *Google GenAI `text-embedding-004` API*
  2. *Local `sentence-transformers/all-MiniLM-L6-v2` with ChromaDB / FAISS*
* **Decision:** **Google GenAI `text-embedding-004` with Local In-Memory Fallback (RECOMMENDED DEFAULT)**
* **Rationale:** GenAI embeddings provide superior semantic nuance for university-level algorithms terminology. An in-memory cosine-similarity matrix acts as a zero-dependency fallback if offline.

---

### Decision 3: Client Routing Migration — State Router vs. `react-router-dom`
* **Options:**
  1. *Refactor `App.tsx` to `react-router-dom` v6*
  2. *Preserve and enhance the existing state-based router (`currentRoute`, `AppRoute`)*
* **Decision:** **Preserve Existing State Router (RECOMMENDED DEFAULT)**
* **Rationale:** The existing `App.tsx` already coordinates sub-tabs, modals, and route transitions cleanly across 560 lines of code. Rewriting to `react-router-dom` risks breaking the `AppShell` active tab context, the `SourceCitationModal`, and onboarding state transitions right before a hackathon deadline.

---

### Decision 4: Video & Audio Handling in Demo
* **Options:**
  1. *Build a full asynchronous Whisper transcription queue*
  2. *Represent video/audio files via pre-indexed structured transcripts*
* **Decision:** **Pre-Indexed Transcripts with Live PDF Ingestion (RECOMMENDED DEFAULT)**
* **Rationale:** Demonstrating live PDF ingestion proves the real-time pipeline. Using pre-transcribed text for the 482MB video allows the UI to display timestamped audio-visual citations (`Lecture 08, 14:32`) without incurring a multi-minute delay that ruins the presentation.

---

## 4. Measurable Success Metrics & Evaluation Framework

| Metric Category | Target Objective | Measurement Method |
| :--- | :--- | :--- |
| **Grounding Precision** | $\ge 98\%$ factual adherence | Manual audit of 20 sample Socratic responses against Textbook Ch. 4; zero fabricated theorems or outside definitions allowed without a warning. |
| **Citation Verifiability** | $100\%$ clickable accuracy | Every citation tag in chat, quiz, and concept drawer must open the modal displaying a genuine excerpt matching the course PDF. |
| **End-to-End Latency** | Tutor reply $< 3.5\text{s}$<br>Quiz submit $< 1.0\text{s}$ | Chrome DevTools Network Tab / FastAPI timing middleware. |
| **Demo Repeatability** | $100\%$ pass rate over 5 runs | Scripted 3-minute demo executed across 5 consecutive fresh browser sessions without crash or unhandled error. |

