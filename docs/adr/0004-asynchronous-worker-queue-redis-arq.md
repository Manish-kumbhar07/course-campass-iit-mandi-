# ADR 0004: Asynchronous Task Execution with Redis and ARQ

**Status:** Accepted  
**Date:** 2026-10-14  
**Context:**  
Extracting text from large textbooks (30MB+ PDFs), generating vector embeddings, and inducing prerequisite graphs requires multiple seconds or minutes of computational effort. Running these synchronously on FastAPI HTTP request threads blocks the event loop and leads to HTTP 504 gateway timeouts. We evaluated Celery versus ARQ.

**Decision:**  
We adopt **ARQ backed by Redis**. ARQ is a high-performance, lightweight job queue specifically designed for Python `asyncio`. It natively shares the same async SQLAlchemy session and async HTTP clients used by the FastAPI core.

**Consequences:**  
* **Positive:** Non-blocking file uploads. Clean integration with FastAPI async primitives. No heavy AMQP broker setup (RabbitMQ) needed; Redis serves as both cache and job queue.
* **Negative:** Requires Redis instance running alongside PostgreSQL. Handled easily via local service or Docker compose.

