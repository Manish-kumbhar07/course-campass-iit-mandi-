# Repository Structure & Full-Stack Layout

### Implemented security modules

The scoped backend implementation is located under `backend/`:

- `app/core/security.py`, `app/services/auth_service.py`, and
  `app/api/v1/endpoints/auth.py` implement password-based account
  registration/login, short-lived access JWTs, rotating/revocable refresh
  sessions, and protected current-user lookup.
- `app/services/course_service.py` and `app/api/v1/endpoints/courses.py`
  implement owner-scoped course creation, retrieval, listing, and deletion.
- `app/services/document_service.py`, `app/services/file_validation.py`,
  `app/providers/storage/`, and `app/api/v1/endpoints/materials.py` implement
  private upload initiation/completion, signature/MIME/size/duration checks,
  short-lived authorized download links, and audited cleanup.
- `app/models/audit_event.py` stores security events without credentials or
  uploaded content. `alembic/` contains the database bootstrap migration.
- `tests/test_security_modules.py` covers authentication, tenant isolation,
  upload validation, signed-link lifetime, cleanup failure, and concurrent
  duplicate registration.

Run checks with `cd backend; python -m pytest -q`. Production uses PostgreSQL,
private S3-compatible storage, Redis rate limiting, and configured independent
`SECRET_KEY` / `REFRESH_TOKEN_PEPPER` values. Local disk storage and the
process-local limiter are development/testing adapters only.

**Project:** CourseCompass  
**Structure:** Monorepo with Isolated Frontend and Backend Workspaces  
**Frontend:** React 19 + TypeScript + Vite 8 + Tailwind CSS v4  
**Backend:** FastAPI + Python 3.12 + SQLAlchemy 2.0 + Alembic + ARQ + Redis  

---

## 1. Unified Directory Tree

```
course-campass-iit-mandi-/
├── docs/                                 # Architectural, PRD, and API Specifications
│   ├── architecture.md
│   ├── database-design.md
│   ├── api-contract.md
│   ├── repository-structure.md
│   ├── data-flow.md
│   └── adr/
│       ├── 0001-modular-monolith-fastapi.md
│       ├── 0002-postgresql-pgvector.md
│       ├── 0003-provider-agnostic-llm-and-independent-validator.md
│       ├── 0004-asynchronous-worker-queue-redis-arq.md
│       └── 0005-s3-compatible-storage-presigned-urls.md
│
├── backend/                              # New FastAPI Python 3.12 Application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                       # FastAPI ASGI entrypoint, CORS, exception handlers
│   │   ├── config.py                     # Pydantic-Settings environment loader
│   │   │
│   │   ├── core/                         # Low-level infrastructure primitives
│   │   │   ├── database.py               # Async SQLAlchemy engine & session factory
│   │   │   ├── security.py               # Password hashing (bcrypt) & JWT operations
│   │   │   └── exceptions.py             # Custom domain exceptions & HTTP error mappers
│   │   │
│   │   ├── models/                       # SQLAlchemy 2.0 ORM Declarative Models
│   │   │   ├── base.py                   # Common BaseModel with id, created_at, updated_at
│   │   │   ├── user.py                   # User entity
│   │   │   ├── course.py                 # Course entity
│   │   │   ├── document.py               # CourseDocument, DocumentPage, VisualElement
│   │   │   ├── chunk.py                  # DocumentChunk, ChunkEmbedding (pgvector)
│   │   │   ├── graph.py                  # Topic, Concept, ConceptRelationship
│   │   │   ├── tutor.py                  # Conversation, TutorMessage, Citation
│   │   │   ├── quiz.py                   # Quiz, QuizQuestion, QuizOption, QuizAttempt
│   │   │   └── study_plan.py             # StudyPlan, StudyPlanTask, TopicMastery
│   │   │
│   │   ├── schemas/                      # Pydantic v2 Request/Response Schemas
│   │   │   ├── common.py                 # BaseSchema with camelCase alias generator
│   │   │   ├── auth.py                   # User, Session, LoginRequest, SignUpRequest
│   │   │   ├── course.py                 # CourseCreate, CourseResponse
│   │   │   ├── document.py               # DocumentResponse, ProcessingJobResponse
│   │   │   ├── tutor.py                  # ChatRequest, ChatResponse, CitationResponse
│   │   │   ├── quiz.py                   # QuizResponse, SubmitAttemptRequest, AttemptResponse
│   │   │   └── graph.py                  # ConceptResponse, RelationshipResponse
│   │   │
│   │   ├── providers/                    # Swappable External Service Abstractions
│   │   │   ├── llm/
│   │   │   │   ├── base.py               # Abstract BaseLLMProvider
│   │   │   │   ├── gemini.py             # Google GenAI SDK implementation
│   │   │   │   └── openai.py             # OpenAI SDK implementation
│   │   │   ├── embeddings/
│   │   │   │   ├── base.py               # Abstract BaseEmbeddingProvider
│   │   │   │   ├── gemini_embed.py       # text-embedding-004
│   │   │   │   └── openai_embed.py       # text-embedding-3-small
│   │   │   └── storage/
│   │   │       ├── base.py               # Abstract BaseStorageProvider
│   │   │       └── s3.py                 # MinIO / AWS S3 / Cloudflare R2 boto3 client
│   │   │
│   │   ├── services/                     # Business Logic Services
│   │   │   ├── auth_service.py           # Login, registration, token verification
│   │   │   ├── course_service.py         # Course CRUD and tenant validation
│   │   │   ├── ingestion_service.py      # File upload & ARQ background dispatch
│   │   │   ├── parser_service.py         # PyPDF text extraction & heading detection
│   │   │   ├── retrieval_service.py      # pgvector cosine similarity + hybrid search
│   │   │   ├── graph_service.py          # Prerequisite DAG induction & cycle checks
│   │   │   ├── tutor_service.py          # Grounded RAG tutor orchestration
│   │   │   ├── validator_service.py      # Independent claim-to-chunk citation verifier
│   │   │   ├── quiz_service.py           # Diagnostic MCQ generator & grading
│   │   │   └── mastery_service.py        # Deterministic mastery calculation & study plan
│   │   │
│   │   ├── workers/                      # ARQ Background Task Definitions
│   │   │   ├── worker.py                 # ARQ worker settings and Redis connection
│   │   │   └── ingestion_tasks.py        # PDF chunking, embedding generation tasks
│   │   │
│   │   └── api/v1/                       # Versioned REST Controllers
│   │       ├── router.py                 # Central APIRouter mounting all endpoints
│   │       └── endpoints/
│   │           ├── auth.py
│   │           ├── courses.py
│   │           ├── materials.py
│   │           ├── concepts.py
│   │           ├── tutor.py
│   │           ├── quizzes.py
│   │           └── mastery.py
│   │
│   ├── alembic/                          # Alembic Migration Scripts
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   │       └── 0001_initial_schema.py
│   ├── alembic.ini
│   ├── pyproject.toml                    # Poetry / Flit / UV project definition
│   ├── requirements.txt                  # Pinned Python dependencies
│   ├── .env.example                      # Backend environment variable template
│   └── tests/                            # Pytest test suite
│       ├── conftest.py
│       ├── test_auth.py
│       ├── test_tutor_grounding.py
│       └── test_mastery_engine.py
│
├── src/                                  # Existing Vite Frontend (Preserved)
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── services/
│   ├── styles/
│   ├── types/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── .env.example                          # Frontend environment template
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts                        # Configured with proxy to :8000
```

---

## 2. Environment Variables Configuration

### 2.1 Backend `.env` Template (`backend/.env.example`)
```ini
# Application Core
ENVIRONMENT=development
DEBUG=true
SECRET_KEY=change_this_to_a_super_secret_64_character_hex_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480

# Database (PostgreSQL with pgvector)
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/coursecompass

# Redis (for ARQ Background Workers & Caching)
REDIS_URL=redis://localhost:6379/0

# Object Storage (S3 / MinIO / R2)
S3_ENDPOINT_URL=http://localhost:9000
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET_NAME=coursecompass-materials
S3_REGION=us-east-1

# AI Providers
LLM_PROVIDER=gemini
VALIDATOR_PROVIDER=gemini
GEMINI_API_KEY=AIzaSy...
OPENAI_API_KEY=sk-...

# Vector Embeddings
EMBEDDING_PROVIDER=gemini
EMBEDDING_MODEL=text-embedding-004
EMBEDDING_DIMENSION=768
```

---

## 3. Frontend-Backend Network Proxy Integration

To enable communication between the React frontend and FastAPI backend without CORS headers in local development, update `vite.config.ts`:

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
```

---

## 4. Multi-Process Development Startup

For developer convenience, the entire full-stack system can be launched via standard PowerShell or concurrently:

```powershell
# Terminal 1: PostgreSQL & Redis (e.g., Docker or Local Native Services)
docker compose up -d postgres redis minio

# Terminal 2: FastAPI Backend Server
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000

# Terminal 3: ARQ Background Worker
cd backend
.\.venv\Scripts\Activate.ps1
python -m arq app.workers.worker.WorkerSettings

# Terminal 4: React Vite Frontend
npm run dev
```
