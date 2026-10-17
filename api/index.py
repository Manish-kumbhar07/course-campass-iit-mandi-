"""
Vercel Serverless Function entrypoint at project root
"""
import os
import sys
import traceback
from pathlib import Path

# Add backend and root directories to sys.path
api_dir = Path(__file__).resolve().parent
root_dir = api_dir.parent
backend_dir = root_dir / "backend"

for d in [str(backend_dir), str(root_dir), str(api_dir)]:
    if d not in sys.path:
        sys.path.insert(0, d)

# Set serverless writable directory defaults on Vercel
if os.environ.get("VERCEL"):
    os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:////tmp/coursecompass.db")
    os.environ.setdefault("STORAGE_LOCAL_ROOT", "/tmp/storage")
    os.environ.setdefault("STORAGE_BACKEND", "local")

try:
    from app.main import app
except Exception as e:
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    app = FastAPI(title="CourseCompass Fallback Gateway")
    _err_trace = traceback.format_exc()

    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
    async def fallback_handler(path: str):
        return JSONResponse(
            status_code=500,
            content={"error": "FastAPI initialization failed", "detail": _err_trace}
        )

__all__ = ["app"]
