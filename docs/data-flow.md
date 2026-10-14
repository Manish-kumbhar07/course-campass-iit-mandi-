# End-to-End Data Flow Specifications

**Project:** CourseCompass  
**Focus:** Sequence-Level Execution Tracing & State Transitions  

---

## 1. Document Ingestion & Asynchronous Indexing Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant FE as React Frontend
    participant API as FastAPI Gateway
    participant S3 as S3 Storage
    participant Queue as Redis (ARQ)
    participant Worker as Ingestion Worker
    participant Gemini as Gemini AI
    participant DB as PostgreSQL + pgvector

    Student->>FE: Drop Textbook Ch. 4 (PDF) & click "Process"
    FE->>API: POST /api/v1/courses/{id}/materials (multipart)
    API->>S3: Stream raw binary to s3://bucket/docs/{uuid}.pdf
    API->>DB: Insert course_documents (status='uploaded')
    API->>DB: Insert processing_jobs (stage='secure_upload', 14%)
    API->>Queue: enqueue_job("process_document_job", doc_id)
    API-->>FE: HTTP 202 Accepted { doc_id, job_id }

    loop Every 1.5s
        FE->>API: GET /api/v1/jobs/{job_id}/status
        API-->>FE: Return current stage & progressPercent
    end

    Queue->>Worker: Dequeue job
    Worker->>DB: Update job (stage='reading_content', 28%)
    Worker->>S3: Fetch binary stream
    Worker->>Worker: PyPDF extract text, pages, headings
    Worker->>DB: Insert document_pages records
    
    Worker->>DB: Update job (stage='finding_concepts', 56%)
    Worker->>Worker: Chunk text into 500-token blocks
    Worker->>Gemini: Batch generate embeddings (text-embedding-004)
    Gemini-->>Worker: Return 768-dim float vectors
    Worker->>DB: Bulk insert document_chunks & chunk_embeddings

    Worker->>DB: Update job (stage='building_prerequisites', 85%)
    Worker->>Gemini: Induce concepts & prerequisite links
    Gemini-->>Worker: Candidate nodes & directed edges
    Worker->>DB: Insert concepts & concept_relationships

    Worker->>DB: Update job (stage='ready', progress=100%, is_completed=true)
    Worker->>DB: Update course_documents (status='indexed')
```

---

## 2. Grounded Socratic Tutor & Independent Citation Validation Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant FE as React Frontend
    participant API as FastAPI Gateway
    participant Retrieval as Retrieval Service
    participant DB as PostgreSQL + pgvector
    participant PrimaryLLM as Gemini / OpenAI (Tutor)
    participant Validator as Independent Validator (LLM)

    Student->>FE: Types: "Why does infinite recursion cause a stack overflow in DFS?"
    FE->>API: POST /api/v1/courses/{id}/tutor/chat
    API->>Retrieval: Search relevant course chunks (query, course_id)
    
    Retrieval->>DB: SELECT chunks, 1 - (embedding <=> query_vec) AS sim<br/>WHERE course_id = :id ORDER BY sim DESC LIMIT 5
    DB-->>Retrieval: Top 5 chunks + similarity scores

    alt Max Similarity < 0.62 (Boundary Guard)
        Retrieval-->>API: No matching chunks found
        API-->>FE: Return answerState='not_found' with boundary guard notice
    else Max Similarity >= 0.62
        Retrieval-->>API: Return retrieved chunks with chunk IDs
        API->>PrimaryLLM: Draft response with strict citation prompt
        PrimaryLLM-->>API: Draft: "Each recursive call pushes a frame... [CHUNK: c-101]"
        
        API->>Validator: Verify citation claim against chunk c-101
        Validator->>DB: Fetch exact raw content of chunk c-101
        Validator->>Validator: Calculate claim-to-chunk entailment score
        
        alt Entailment Score >= 0.90
            Validator-->>API: Verified (confidence='verified')
            API->>DB: Persist tutor_messages & citations
            API-->>FE: Return answerState='supported' with verified citations
        else Entailment Score < 0.90
            Validator-->>API: Inconclusive citation
            API->>DB: Persist message with warning
            API-->>FE: Return answerState='partially_supported' (unsupportedWarning)
        end
    end
```

---

## 3. Diagnostic Assessment & Misconception Evaluation Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant FE as React Frontend
    participant API as FastAPI Gateway
    participant QuizService as Quiz Service
    participant MasteryService as Mastery Service
    participant DB as PostgreSQL

    Student->>FE: Selects option B (Common Student Distractor)
    FE->>API: POST /api/v1/quizzes/{id}/submit { questionId, selectedOptionId }
    API->>QuizService: Grade submission & retrieve misconception rationale
    
    QuizService->>DB: SELECT is_correct, misconception_explanation<br/>FROM quiz_options WHERE id = :option_id
    DB-->>QuizService: is_correct = false, misconception = "Confusing cross-edges with back-edges"

    QuizService->>MasteryService: Record attempt & adjust concept mastery
    MasteryService->>DB: Update concepts (mastery_percent -= 5%, status='attention')
    MasteryService->>DB: Insert quiz_attempts record
    
    QuizService-->>API: Graded result + misconception text + citation link
    API-->>FE: HTTP 200 OK with immediate green/red feedback & citation tag
    FE->>Student: Highlights trap option and explains cognitive error
```

---

## 4. Deterministic Mastery Calculation & "Study Next" Propagation

```mermaid
sequenceDiagram
    autonumber
    participant MasteryService as Mastery Service
    participant GraphService as Graph Service
    participant DB as PostgreSQL
    participant FE as React Frontend

    Note over MasteryService: Triggered after Quiz Attempt or Study Sprint Completion
    MasteryService->>DB: Fetch current concept mastery scores for course
    MasteryService->>GraphService: Fetch prerequisite DAG edges
    
    GraphService->>GraphService: Perform topological traversal
    loop For each concept C
        alt Any prerequisite P has Mastery < 50%
            GraphService->>MasteryService: Flag C as blocked by prerequisite P
            MasteryService->>DB: Set C.status = 'attention'
        else All prerequisites >= 60%
            MasteryService->>DB: Set C.status = 'learning' or 'mastered'
        end
    end

    MasteryService->>MasteryService: Calculate Overall Course Mastery = Mean(Concepts)
    MasteryService->>MasteryService: Compute "Study Next" priority concept
    Note over MasteryService: Prioritize lowest mastery with highest downstream dependencies
    
    MasteryService->>DB: Update courses (overall_mastery = 64%)
    MasteryService-->>FE: Updated StudentProfile & StudyPlanDay response
    FE->>FE: Re-render Progress Ring, Streak Chart & "Study Next" card
```

