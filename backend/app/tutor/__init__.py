"""
CourseCompass Grounded Tutor and Citation Verification Package
"""
from app.tutor.schemas import (
    ClaimedFact,
    RawModelTutorOutput,
    ClaimVerificationResult,
    GroundingReport,
)
from app.tutor.prompts import TUTOR_SYSTEM_INSTRUCTION, build_tutor_user_prompt
from app.tutor.citation_validator import (
    CitationValidator,
    BaseGroundingVerifier,
    DeterministicGroundingVerifier,
    GeminiGroundingVerifier,
    get_grounding_verifier,
    set_grounding_verifier,
)
from app.tutor.providers import (
    BaseTutorProvider,
    DeterministicLocalTutorProvider,
    GeminiTutorProvider,
    get_tutor_provider,
    set_tutor_provider,
)

__all__ = [
    "ClaimedFact",
    "RawModelTutorOutput",
    "ClaimVerificationResult",
    "GroundingReport",
    "TUTOR_SYSTEM_INSTRUCTION",
    "build_tutor_user_prompt",
    "CitationValidator",
    "BaseGroundingVerifier",
    "DeterministicGroundingVerifier",
    "GeminiGroundingVerifier",
    "get_grounding_verifier",
    "set_grounding_verifier",
    "BaseTutorProvider",
    "DeterministicLocalTutorProvider",
    "GeminiTutorProvider",
    "get_tutor_provider",
    "set_tutor_provider",
]

