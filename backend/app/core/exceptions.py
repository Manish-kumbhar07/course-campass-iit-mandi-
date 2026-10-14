"""
Domain Exceptions & Error Types
"""
from typing import Any, Dict, Optional


class CourseCompassException(Exception):
    """Base exception for CourseCompass domain errors."""
    def __init__(self, message: str, status_code: int = 500, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}


class UnauthorizedAccessError(CourseCompassException):
    """Raised when tenant/ownership verification fails."""
    def __init__(self, message: str = "Unauthorized access to resource", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=403, details=details)


class DocumentNotFoundError(CourseCompassException):
    """Raised when the specified document does not exist."""
    def __init__(self, document_id: str):
        super().__init__(f"Document '{document_id}' not found", status_code=404, details={"documentId": document_id})


class ResourceLimitExceededError(CourseCompassException):
    """Raised when file size, duration, or page count exceeds quota."""
    def __init__(self, message: str, limit_type: str, current_value: Any, max_allowed: Any):
        super().__init__(
            message,
            status_code=413,
            details={"limitType": limit_type, "currentValue": current_value, "maxAllowed": max_allowed}
        )


class UnsupportedFormatError(CourseCompassException):
    """Raised when an uploaded file is not among the supported types."""
    def __init__(self, format_detected: str, supported: list[str]):
        super().__init__(
            f"Unsupported file format '{format_detected}'. Supported: {', '.join(supported)}",
            status_code=415,
            details={"formatDetected": format_detected, "supportedFormats": supported}
        )


class StorageError(CourseCompassException):
    """Raised when reading or writing to private storage fails."""
    def __init__(self, message: str, key: str):
        super().__init__("Private storage operation failed", status_code=502, details={"code": "STORAGE_ERROR"})


class ExtractionProviderError(CourseCompassException):
    """Raised when the extraction provider encounters an unrecoverable failure."""
    def __init__(self, message: str, provider: str = "gemini", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=502, details={"provider": provider, **(details or {})})


class TransientExtractionError(ExtractionProviderError):
    """Raised on transient provider issues eligible for exponential backoff retries."""
    pass


class ExtractionTimeoutError(TransientExtractionError):
    """Raised when an extraction operation exceeds provider timeout limits."""
    def __init__(self, timeout_seconds: int, provider: str = "gemini"):
        super().__init__(
            f"Extraction timed out after {timeout_seconds} seconds",
            provider=provider,
            details={"timeoutSeconds": timeout_seconds}
        )


class DuplicateProcessingJobError(CourseCompassException):
    """Raised when an ingestion job is already running for the given document."""
    def __init__(self, document_id: str, job_id: str):
        super().__init__(
            f"Document '{document_id}' is already being processed by job '{job_id}'",
            status_code=409,
            details={"documentId": document_id, "activeJobId": job_id}
        )
