# ADR 0002: Unified PostgreSQL with pgvector for Relational and Semantic Search

**Status:** Accepted  
**Date:** 2026-10-14  
**Context:**  
CourseCompass requires standard relational data management (users, courses, quizzes, DAG prerequisite relationships) and semantic vector similarity search for RAG over course materials. We evaluated running a dedicated vector database (Pinecone, Qdrant, Weaviate) alongside PostgreSQL versus using PostgreSQL with the `pgvector` extension.

**Decision:**  
We adopt **PostgreSQL 16 with the pgvector extension**. All vectors are stored in the `chunk_embeddings` table indexed with HNSW (`vector_cosine_ops`).

**Consequences:**  
* **Positive:** Eliminates dual-database synchronization issues and two-phase commits. Vector queries can be joined directly with relational course ownership filters (`WHERE course.user_id = :current_user_id`) in a single query plan. Single backup and restore procedure via standard `pg_dump`. Zero external SaaS cost.
* **Negative:** Requires PostgreSQL instance to have the `vector` extension installed. Mitigated by providing standard Docker compose definitions and PostgreSQL 16 standard images.

