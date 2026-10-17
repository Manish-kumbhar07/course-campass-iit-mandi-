"""
Vercel Serverless Function entrypoint at project root
"""
import os
import sys
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

from app.main import app

__all__ = ["app"]


