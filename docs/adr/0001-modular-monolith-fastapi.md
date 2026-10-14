# ADR 0001: Adopt Modular Monolith Architecture with FastAPI

**Status:** Accepted  
**Date:** 2026-10-14  
**Context:**  
The CourseCompass platform requires rich educational features (document ingestion, RAG tutoring, diagnostic quizzes, knowledge graph modeling, and deterministic mastery calculation). We evaluated whether to decompose the backend into multiple microservices (e.g., Ingestion Service, Quiz Service, Tutor Service) or build a unified modular monolith.

**Decision:**  
We adopt a **Modular Monolith** using **FastAPI (Python 3.12)**. All sub-domains reside within an isolated `app/services/` structure sharing a unified database schema and transaction context. Asynchronous background jobs are delegated to an in-process or out-of-process Redis worker without network API fragmentation.

**Consequences:**  
* **Positive:** Zero network serialization overhead between tutor, quiz, and mastery engines. Atomic database transactions across prerequisite updates. Single deployment artifact for developers and hackathon judges. High developer velocity.
* **Negative:** If document ingestion experiences sudden CPU spikes, it could impact the API gateway if not properly offloaded to the background worker. This is mitigated by strictly enforcing the ARQ worker queue for all ingestion tasks.

