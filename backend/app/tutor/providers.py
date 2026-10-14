"""
Replaceable Tutor Model Provider Interface & Implementations
Includes official Gemini structured generation and deterministic offline provider.
"""
import abc
import asyncio
import json
import logging
import re
from typing import List, Optional

from app.config import settings
from app.rag.retrieval import RetrievalResult
from app.tutor.prompts import TUTOR_SYSTEM_INSTRUCTION, build_tutor_user_prompt
from app.tutor.schemas import ClaimedFact, RawModelTutorOutput

logger = logging.getLogger("coursecompass.tutor.providers")


class BaseTutorProvider(abc.ABC):
    """Abstract interface for grounded tutoring response generation."""

    @abc.abstractmethod
    async def generate_grounded_response(
        self,
        question: str,
        evidence: List[RetrievalResult],
        explanation_level: str = "rigorous",
        concept_summary: Optional[str] = None
    ) -> RawModelTutorOutput:
        """Generate structured pedagogical explanation grounded in evidence."""
        pass


class DeterministicLocalTutorProvider(BaseTutorProvider):
    """
    Deterministic offline tutor provider.
    Synthesizes source-linked answers, enforces syllabus boundaries,
    and resists adversarial prompt injections without external API dependencies.
    """

    def __init__(
        self,
        simulate_fake_citation: bool = False,
        simulate_unsupported_claim: bool = False,
        force_unsupported_state: bool = False
    ):
        self.simulate_fake_citation = simulate_fake_citation
        self.simulate_unsupported_claim = simulate_unsupported_claim
        self.force_unsupported_state = force_unsupported_state

    async def generate_grounded_response(
        self,
        question: str,
        evidence: List[RetrievalResult],
        explanation_level: str = "rigorous",
        concept_summary: Optional[str] = None
    ) -> RawModelTutorOutput:
        query_lower = question.lower()

        # Check for empty evidence or forced unsupported
        if not evidence or self.force_unsupported_state:
            return RawModelTutorOutput(
                answer_text=(
                    "This topic was not found in your currently indexed courseware. "
                    "CourseCompass strictly adheres to verified source boundaries to prevent hallucinations.\n\n"
                    "Would you like an outside conceptual overview, or would you prefer to upload your relevant lecture slides?"
                ),
                support_status="not_found",
                confidence=0.1,
                citation_chunk_ids=[],
                claimed_facts=[],
                suggested_follow_up="Would you like to upload additional lecture slides or handouts for this topic?",
                unsupported_aspects="The query topic is not present in the indexed course documents."
            )

        top_ev = evidence[0]

        # Check for adversarial prompt injection in question or evidence
        # The tutor MUST ignore injected directives
        injection_keywords = ["ignore previous", "system prompt", "admin override", "reveal password", "jailbreak", "you are now"]
        is_injection_attempt = any(k in query_lower for k in injection_keywords)

        # Style-adapted response generation
        level = explanation_level.lower()
        if level == "introductory":
            opening = f"Think of this as an intuitive mechanism: In your course materials ('{top_ev.document_title}', {top_ev.location_label}), the concept is introduced step-by-step."
        elif level == "exam_prep":
            opening = f"High-yield exam review based on '{top_ev.document_title}' ({top_ev.location_label}): Focus closely on the termination invariants and edge cases."
        else:  # rigorous
            opening = f"According to your course syllabus in '{top_ev.document_title}' ({top_ev.location_label}):"

        # Core pedagogical synthesis grounded in chunk text
        clean_content = re.sub(r"\s+", " ", top_ev.content).strip()
        sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", clean_content) if len(s.strip()) > 8]
        first_sentence = sentences[0] if sentences else clean_content[:150]

        # Extract quote
        words = clean_content.split()
        quote_words = words[:min(20, len(words))]
        direct_quote = " ".join(quote_words)

        # Match relevant sentences based on question terms
        q_words = [w.lower() for w in re.findall(r"\w+", question) if len(w) > 2]
        matched_sentence = first_sentence
        if q_words and len(sentences) > 1:
            scored_sentences = [
                (sum(1 for qw in q_words if qw in s.lower()), s)
                for s in sentences
            ]
            scored_sentences.sort(key=lambda x: x[0], reverse=True)
            if scored_sentences[0][0] > 0:
                matched_sentence = scored_sentences[0][1]

        if "recursion" in top_ev.content.lower() and ("base case" in query_lower or "recursion" in query_lower or "induction" in query_lower):
            elaboration = (
                f"Specifically: {matched_sentence}. In recursive execution, each call frame must allocate "
                f"local parameters and activation records until a valid base case stops the descent."
            )
        else:
            elaboration = (
                f"Specifically: \"{matched_sentence}\". Based on your uploaded courseware '{top_ev.document_title}' ({top_ev.location_label}), "
                f"this principle directly grounds the answer to your question. Review this material to solidify this concept."
            )

        answer_text = (
            f"{opening}\n\n"
            f"\"{direct_quote}...\"\n\n"
            f"{elaboration}"
        )

        citation_ids = [top_ev.chunk_id]
        if self.simulate_fake_citation:
            citation_ids.append("chunk-fake-hallucinated-999")

        # Claimed facts for verification
        claimed_facts = [
            ClaimedFact(
                claim=f"{matched_sentence}.",
                cited_chunk_id=top_ev.chunk_id,
                direct_quote=direct_quote
            )
        ]

        if self.simulate_unsupported_claim:
            claimed_facts.append(
                ClaimedFact(
                    claim="Quantum computing registers use non-deterministic entanglements to instantly resolve NP-complete problems.",
                    cited_chunk_id=top_ev.chunk_id,  # Chunk doesn't support this
                    direct_quote=None
                )
            )

        follow_up = (
            "What would happen to the memory profile if the base case condition checked '<= 0' instead of '== 0'?"
            if "base case" in query_lower or "recursion" in query_lower
            else f"Would you like to review another concept from '{top_ev.document_title}' or take a quick diagnostic quiz?"
        )

        status = "partially_supported" if self.simulate_unsupported_claim else "supported"

        return RawModelTutorOutput(
            answer_text=answer_text,
            support_status=status,
            confidence=0.92,
            citation_chunk_ids=citation_ids,
            claimed_facts=claimed_facts,
            suggested_follow_up=follow_up
        )


class GeminiTutorProvider(BaseTutorProvider):
    """
    Production Gemini Tutor Provider with structured JSON outputs.
    """

    def __init__(self, api_key: str = "", model_name: str = "gemini-2.5-flash"):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = model_name or settings.GEMINI_MODEL
        self._fallback = DeterministicLocalTutorProvider()

    async def generate_grounded_response(
        self,
        question: str,
        evidence: List[RetrievalResult],
        explanation_level: str = "rigorous",
        concept_summary: Optional[str] = None
    ) -> RawModelTutorOutput:
        if not self.api_key:
            return await self._fallback.generate_grounded_response(
                question, evidence, explanation_level, concept_summary
            )

        prompt = build_tutor_user_prompt(
            question=question,
            evidence=evidence,
            explanation_level=explanation_level,
            concept_summary=concept_summary
        )

        try:
            from google import genai
            client = genai.Client(api_key=self.api_key)

            def _call():
                response = client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config={
                        "system_instruction": TUTOR_SYSTEM_INSTRUCTION,
                        "temperature": 0.2,
                        "response_mime_type": "application/json",
                        "response_schema": RawModelTutorOutput,
                    }
                )
                return response.text

            resp_text = await asyncio.to_thread(_call)
            data = json.loads(resp_text)
            return RawModelTutorOutput(**data)

        except Exception as e:
            logger.warning("Gemini tutor call error (%s), using deterministic fallback", e)
            return await self._fallback.generate_grounded_response(
                question, evidence, explanation_level, concept_summary
            )


_active_tutor_provider: BaseTutorProvider = DeterministicLocalTutorProvider()


def get_tutor_provider() -> BaseTutorProvider:
    return _active_tutor_provider


def set_tutor_provider(provider: BaseTutorProvider) -> None:
    global _active_tutor_provider
    _active_tutor_provider = provider

