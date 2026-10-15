# CourseCompass Production Deployment & Operational Runbook

## 1. Architecture Overview
CourseCompass is structured as a modular monolith with explicit boundary separation between:
- **Client Tier**: React 18, TypeScript, Tailwind CSS, served via Nginx with SPA routing and API reverse-proxy.
- **Application Tier**: FastAPI (Python 3.12, Uvicorn ASGI workers) handling JWT authentication, REST endpoints, and orchestration.
- **Persistence Tier**: PostgreSQL 16 with the `pgvector` extension for structured relational models and high-dimensional vector similarity search.
- **Storage Tier**: Private S3-compatible object storage (AWS S3, MinIO, or Cloudflare R2) storing uploaded lecture slides, PDFs, notes, audio, and visual crops. No public bucket access is permitted; all downloads occur via short-lived, signed URLs (300s TTL).
- **Asynchronous Processing**: Background workers processing multimodal ingestion (Gemini API), semantic chunking, and knowledge graph construction.
- **Caching & Rate Limiting**: Redis 7 managing distributed token-bucket rate limits and session caching.

---

## 2. Environment Configuration
Copy `.env.production.example` to `.env.production`:
```bash
cp .env.production.example .env.production
```

### Critical Keys:
- `SECRET_KEY`: High-entropy 32+ byte string used for HS256 JWT access token signing (`openssl rand -hex 32`).
- `REFRESH_TOKEN_PEPPER`: Secret pepper for SHA-256 hashed refresh tokens.
- `DATABASE_URL`: Must connect to PostgreSQL 16 with pgvector (`postgresql+asyncpg://...`).
- `STORAGE_BACKEND`: Set to `s3` for production object storage (`local` only for dev/testing).
- `GEMINI_API_KEY`: Required for multimodal extraction and grounded verification.

---

## 3. Database Migration Runbook
Alembic manages schema evolution. Run migrations before routing traffic to new application instances:

```bash
# 1. Verify connectivity to production database
cd backend
alembic check

# 2. Inspect pending migration revisions
alembic current
alembic history --verbose

# 3. Apply all pending migrations safely
alembic upgrade head

# 4. Rollback procedure (if needed)
# alembic downgrade -1
```

---

## 4. Object Storage Configuration
The S3 bucket must be created with **Block All Public Access** enabled.

### Bucket Policy Requirements:
- Deny all unauthenticated read/write requests.
- Enable Server-Side Encryption (SSE-S3 or SSE-KMS).
- Enable Object Versioning to prevent accidental data destruction.
- Lifecycle rules: Transition failed ingestion artifacts older than 14 days to glacier/deletion.

---

## 5. Health & Readiness Probes
Configure container orchestrators (Kubernetes, AWS ECS, Docker Compose) with two distinct endpoints:

| Probe | Endpoint | Expected Status | Purpose |
| :--- | :--- | :--- | :--- |
| **Liveness** | `/health` | `200 OK` | Confirms the FastAPI process is responsive. |
| **Readiness** | `/ready` | `200 OK` | Verifies active PostgreSQL connection (`SELECT 1`). Returns `503` if DB is down. |

---

## 6. Docker & Containerized Launch

### Launch Full Production Stack:
```bash
# Build and start all services in detached mode
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Verify container health status
docker compose -f docker-compose.prod.yml ps

# Tail application logs
docker compose -f docker-compose.prod.yml logs -f backend worker
```

---

## 7. Logging, Auditing & Monitoring
- **Structured Logging**: Application logs are formatted with ISO-8601 timestamps, log level, and component tags.
- **Audit Logging**: Every security-sensitive action (login, token refresh, file upload initiation, file deletion, permission grants) is recorded in the `audit_logs` table.
- **PII Scrubbing**: Error handlers sanitize stack traces and SQL query strings from public API responses. Raw file bytes are never printed to logs.

---

## 8. Backup & Disaster Recovery
- **Database Snapshots**:
  - Automated daily `pg_dump` with gzip compression:
    ```bash
    pg_dump -U coursecompass -h localhost -F c -b -v -f "coursecompass_$(date +%Y%m%d_%H%M%S).dump" coursecompass
    ```
  - Continuous WAL archiving enabled for Point-in-Time Recovery (PITR) with a 7-day retention window.
- **Object Storage**:
  - S3 cross-region replication (CRR) enabled to secondary failover region.
- **Recovery Time Objective (RTO)**: $\le 30$ minutes.
- **Recovery Point Objective (RPO)**: $\le 5$ minutes.

---

## 9. Vercel Cloud Multi-Service Deployment
- **Live Production URL**: [https://course-campass-iit-mandi-woad.vercel.app/](https://course-campass-iit-mandi-woad.vercel.app/)
- **Configuration**: Managed via `vercel.json` with service separation (`app` for Vite frontend, `backend` for FastAPI Python ASGI runtime) and `/api/(.*)` rewrites.

