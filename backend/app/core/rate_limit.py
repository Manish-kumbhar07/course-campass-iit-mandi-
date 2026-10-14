import asyncio
import time
from collections import defaultdict, deque
from typing import Protocol
from fastapi import Request
from app.config import settings
from app.core.exceptions import CourseCompassException


class RateLimiter(Protocol):
    async def allow(self, key: str, limit: int, window_seconds: int) -> bool: ...


class LocalRateLimiter:
    """Process-local limiter for development only; production should use Redis."""

    def __init__(self) -> None:
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = asyncio.Lock()

    async def allow(self, key: str, limit: int, window_seconds: int) -> bool:
        now = time.monotonic()
        async with self._lock:
            hits = self._hits[key]
            while hits and hits[0] <= now - window_seconds:
                hits.popleft()
            if len(hits) >= limit:
                return False
            hits.append(now)
            return True


class RedisRateLimiter:
    def __init__(self, redis_url: str) -> None:
        from redis.asyncio import Redis
        self.client = Redis.from_url(redis_url, decode_responses=True)

    async def allow(self, key: str, limit: int, window_seconds: int) -> bool:
        result = await self.client.eval(
            "local n=redis.call('INCR', KEYS[1]); "
            "if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]); end; "
            "return n",
            1,
            key,
            window_seconds,
        )
        return int(result) <= limit


def create_rate_limiter() -> RateLimiter:
    if settings.ENVIRONMENT.lower() == "production":
        if settings.SECRET_KEY == "development_secret_key_change_in_production_32chars":
            raise RuntimeError("A production SECRET_KEY must be configured")
        if settings.REFRESH_TOKEN_PEPPER == "development-only-change-this-pepper-32":
            raise RuntimeError("A production REFRESH_TOKEN_PEPPER must be configured")
    if settings.RATE_LIMIT_REDIS_URL:
        return RedisRateLimiter(settings.RATE_LIMIT_REDIS_URL)
    if settings.ENVIRONMENT.lower() == "production":
        raise RuntimeError("RATE_LIMIT_REDIS_URL is required in production")
    return LocalRateLimiter()


async def enforce_rate_limit(request: Request, *, auth: bool = False) -> None:
    limiter: RateLimiter = request.app.state.rate_limiter
    host = request.client.host if request.client else "unknown"
    limit = settings.AUTH_RATE_LIMIT_PER_MINUTE if auth else settings.RATE_LIMIT_PER_MINUTE
    namespace = "auth" if auth else "api"
    if not await limiter.allow(f"coursecompass:{namespace}:{host}", limit, 60):
        raise CourseCompassException(
            "Too many requests", status_code=429, details={"code": "RATE_LIMITED"}
        )
