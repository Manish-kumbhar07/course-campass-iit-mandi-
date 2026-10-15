"""
CourseCompass Backend Entrypoint
Exposes the FastAPI application instance for ASGI servers and Vercel runtime.
"""
import sys
from pathlib import Path

# Ensure the backend directory is in sys.path so 'app' and its modules resolve seamlessly
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app

__all__ = ["app"]
