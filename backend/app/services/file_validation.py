import asyncio
import os
import re
import tempfile
import unicodedata
import zipfile
from pathlib import Path
from app.config import settings
from app.core.exceptions import (
    CourseCompassException,
    UnsupportedFormatError,
    ResourceLimitExceededError,
)


MIME_BY_EXTENSION = {
    ".pdf": ("application/pdf", "pdf"),
    ".pptx": ("application/vnd.openxmlformats-officedocument.presentationml.presentation", "slides"),
    ".png": ("image/png", "image"),
    ".jpg": ("image/jpeg", "image"),
    ".jpeg": ("image/jpeg", "image"),
    ".webp": ("image/webp", "image"),
    ".mp3": ("audio/mpeg", "audio"),
    ".wav": ("audio/wav", "audio"),
    ".m4a": ("audio/mp4", "audio"),
    ".aac": ("audio/aac", "audio"),
    ".mp4": ("video/mp4", "video"),
    ".webm": ("video/webm", "video"),
    ".mov": ("video/quicktime", "video"),
    ".txt": ("text/plain", "notes"),
}
MAX_FILE_SIZE = 30 * 1024 * 1024
SAFE_NAME = re.compile(r"^[^\x00-\x1f\x7f/\\]+$")


def validate_filename(filename: str) -> str:
    if (
        not filename
        or len(filename) > settings.MAX_FILENAME_LENGTH
        or filename.startswith(".")
        or ".." in filename
        or not SAFE_NAME.fullmatch(filename)
        or filename != Path(filename).name
    ):
        raise CourseCompassException("Unsafe filename", 400, {"code": "INVALID_FILENAME"})
    normalized = unicodedata.normalize("NFC", filename)
    if any(unicodedata.category(char).startswith("C") for char in normalized):
        raise CourseCompassException("Unsafe filename", 400, {"code": "INVALID_FILENAME"})
    return normalized


def expected_file_type(filename: str, content_type: str, declared_size: int) -> tuple[str, str]:
    clean_name = validate_filename(filename)
    extension = Path(clean_name).suffix.lower()
    expected = MIME_BY_EXTENSION.get(extension)
    if not expected or (extension not in settings.SUPPORTED_EXTENSIONS and extension != ".txt"):
        raise UnsupportedFormatError(extension, sorted(list(settings.SUPPORTED_EXTENSIONS)))
    mime_type, document_type = expected
    if content_type.lower().split(";", 1)[0].strip() != mime_type:
        raise CourseCompassException("File type and MIME type do not match", 415, {"code": "MIME_MISMATCH"})
    if declared_size <= 0 or declared_size > MAX_FILE_SIZE:
        raise ResourceLimitExceededError(
            f"File size exceeds maximum allowed ({MAX_FILE_SIZE} bytes)",
            limit_type="file_size",
            current_value=declared_size,
            max_allowed=MAX_FILE_SIZE
        )
    return clean_name, document_type


def validate_signature(filename: str, content_type: str, data: bytes) -> None:
    name = validate_filename(filename)
    extension = Path(name).suffix.lower()
    expected = MIME_BY_EXTENSION.get(extension)
    if not expected or content_type.lower().split(";", 1)[0].strip() != expected[0]:
        raise CourseCompassException("File type and MIME type do not match", 415, {"code": "MIME_MISMATCH"})
    if not data or len(data) > MAX_FILE_SIZE:
        raise ResourceLimitExceededError(
            f"File size exceeds maximum allowed ({MAX_FILE_SIZE} bytes)",
            limit_type="file_size",
            current_value=len(data) if data else 0,
            max_allowed=MAX_FILE_SIZE
        )

    valid = False
    if extension == ".pdf":
        valid = data.startswith(b"%PDF")
    elif extension == ".pptx":
        try:
            import io
            with zipfile.ZipFile(io.BytesIO(data)) as archive:
                names = set(archive.namelist())
                valid = "[Content_Types].xml" in names and "ppt/presentation.xml" in names
        except (zipfile.BadZipFile, OSError):
            valid = False
    elif extension == ".png":
        valid = data.startswith(b"\x89PNG")
    elif extension in (".jpg", ".jpeg"):
        valid = data.startswith(b"\xff\xd8\xff")
    elif extension == ".webp":
        valid = len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP"
    elif extension == ".wav":
        valid = len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WAVE"
    elif extension == ".mp3":
        valid = data.startswith(b"ID3") or (
            len(data) >= 2 and data[0] == 0xFF and data[1] & 0xE0 == 0xE0
        )
    elif extension == ".aac":
        valid = len(data) >= 2 and data[0] == 0xFF and data[1] & 0xF6 == 0xF0
    elif extension in (".mp4", ".m4a", ".mov"):
        valid = len(data) >= 12 and data[4:8] == b"ftyp"
        if extension == ".mov":
            valid = valid and data[8:12] in (b"qt  ", b"qt\x00\x00")
    elif extension == ".webm":
        valid = data.startswith(b"\x1a\x45\xdf\xa3")
    elif extension == ".txt":
        try:
            decoded = data.decode("utf-8")
            valid = bool(decoded.strip()) and "\x00" not in decoded
        except UnicodeDecodeError:
            valid = False

    if not valid:
        raise CourseCompassException(
            "File content does not match its declared format", 400, {"code": "INVALID_FILE_SIGNATURE"}
        )


async def validate_video_duration(data: bytes) -> int:
    path = ""
    try:
        with tempfile.NamedTemporaryFile(prefix="cc_upload_", suffix=".mp4", delete=False) as file:
            file.write(data)
            path = file.name
        process = await asyncio.create_subprocess_exec(
            settings.FFPROBE_PATH,
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            path,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.DEVNULL,
        )
        stdout, _ = await asyncio.wait_for(process.communicate(), timeout=8)
        duration = float(stdout.decode("ascii").strip())
        if process.returncode != 0 or duration <= 0 or duration > settings.MAX_VIDEO_DURATION_SECONDS:
            raise ValueError("Invalid duration")
        return int(duration)
    except (OSError, ValueError, asyncio.TimeoutError) as exc:
        raise CourseCompassException(
            "Video duration could not be validated or exceeds the permitted limit",
            400,
            {"code": "INVALID_VIDEO_DURATION"},
        ) from exc
    finally:
        if path and os.path.exists(path):
            os.unlink(path)
