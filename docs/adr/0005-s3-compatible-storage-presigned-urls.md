# ADR 0005: Private S3-Compatible Object Storage for Course Materials

**Status:** Accepted  
**Date:** 2026-10-14  
**Context:**  
Course materials include multi-megabyte PDFs, slides, and figures. Storing binary assets directly in PostgreSQL BLOB columns leads to severe database bloat, slow backups, and inefficient memory buffer usage.

**Decision:**  
We store all raw files and extracted visual element images in **private S3-compatible object storage** (MinIO for local development; AWS S3 or Cloudflare R2 for production). The database stores only the `s3_storage_key` string, file size metadata, and extracted text.

**Consequences:**  
* **Positive:** Decoupled storage scaling. Database remains lean and fast. Clean support for presigned upload and download URLs without passing binary streams through backend CPU buffers when desired.
* **Negative:** Object storage lifecycle must be coordinated with database row deletions (e.g., deleting a course cascades to S3 object deletions).

