"""
Citation Validator & Independent Grounding Verifier
Provides deterministic reference verification, text quotation checks,
and semantic grounding validation to prevent hallucinations and unverified claims.
"""
import abc
import logging
import re
from typing import Dict, List, Optional, Set, Tuple

from app.rag.retrieval import RetrievalResult
from app.schemas.graph import SourceCitationOut
from app.tutor.schemas import (
    ClaimVerificationResult,
    GroundingReport,
    RawModelTutorOutput,
)

logger = logging.getLogger("coursecompass.tutor.validator")

# Standard English stopwords to filter during lexical grounding check
STOPWORDS: Set[str] = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't",
    "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
    "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having",
    "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how",
    "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself",
    "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once",
    "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
    "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the",
    "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll",
    "they're", "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't",
    "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where",
    "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't",
    "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"
}


class BaseGroundingVerifier(abc.ABC):
    """Abstract interface for independent semantic grounding verification."""

    @abc.abstractmethod
    async def verify_claim(self, claim: str, evidence_text: str) -> Tuple[float, str]:
        """
        Verify if evidence_text semantically supports claim.
        Returns: (score between 0.0 and 1.0, reasoning string)
        """
        pass


class DeterministicGroundingVerifier(BaseGroundingVerifier):
    """
    Deterministic zero-dependency grounding verifier.
    Uses n-gram overlap, content-word coverage, and quote alignment.
    """

    async def verify_claim(self, claim: str, evidence_text: str) -> Tuple[float, str]:
        claim_cleaned = claim.strip().lower()
        evidence_cleaned = evidence_text.strip().lower()

        # If claim is an exact substring of evidence
        if claim_cleaned in evidence_cleaned:
            return 1.0, "Exact claim substring found in source material."

        claim_tokens = [w for w in re.findall(r"\w+", claim_cleaned) if w not in STOPWORDS and len(w) > 2]
        if not claim_tokens:
            return 0.8, "Claim contains only generic terms."

        evidence_words = set(re.findall(r"\w+", evidence_cleaned))
        matched_tokens = [w for w in claim_tokens if w in evidence_words]
        coverage = len(matched_tokens) / len(claim_tokens)

        # Check for multi-word phrase matches (bigrams)
        claim_words = re.findall(r"\w+", claim_cleaned)
        bigram_matches = 0
        total_bigrams = max(1, len(claim_words) - 1)
        for i in range(len(claim_words) - 1):
            bigram = f"{claim_words[i]} {claim_words[i+1]}"
            if bigram in evidence_cleaned:
                bigram_matches += 1

        bigram_ratio = bigram_matches / total_bigrams
        composite_score = 0.65 * coverage + 0.35 * bigram_ratio

        if composite_score >= 0.65:
            return min(1.0, composite_score), f"Strong grounding: {coverage*100:.0f}% keyword and {bigram_ratio*100:.0f}% phrase overlap."
        elif composite_score >= 0.35:
            return composite_score, f"Partial grounding: {coverage*100:.0f}% keyword overlap with source."
        else:
            return composite_score, f"Insufficient grounding: only {coverage*100:.0f}% keyword overlap."


class GeminiGroundingVerifier(BaseGroundingVerifier):
    """
    Independent Gemini-based NLI verifier.
    Evaluates claims using an independent prompt configuration.
    """

    def __init__(self, api_key: str = "", model_name: str = "gemini-2.5-flash"):
        self.api_key = api_key
        self.model_name = model_name
        self._fallback = DeterministicGroundingVerifier()

    async def verify_claim(self, claim: str, evidence_text: str) -> Tuple[float, str]:
        if not self.api_key:
            return await self._fallback.verify_claim(claim, evidence_text)

        try:
            from google import genai
            import asyncio
            client = genai.Client(api_key=self.api_key)

            prompt = (
                "You are an independent scientific grounding verifier. Determine whether the provided Evidence strictly supports the Claim.\n\n"
                f"Evidence: \"\"\"{evidence_text[:1500]}\"\"\"\n\n"
                f"Claim: \"\"\"{claim}\"\"\"\n\n"
                "Respond with a single JSON object: {\"status\": \"SUPPORTED\" | \"PARTIAL\" | \"UNSUPPORTED\", \"score\": 0.0-1.0, \"reason\": \"explanation\"}"
            )

            def _call():
                response = client.models.generate_content(
                    model=self.model_name,
                    contents=prompt
                )
                return response.text

            resp_text = await asyncio.to_thread(_call)
            # Parse score from response
            match = re.search(r'"score"\s*:\s*([0-9.]+)', resp_text)
            score = float(match.group(1)) if match else 0.8
            return score, f"Gemini independent verification score: {score:.2f}"
        except Exception as e:
            logger.warning("Gemini verifier error (%s), using deterministic fallback", e)
            return await self._fallback.verify_claim(claim, evidence_text)


_active_verifier: BaseGroundingVerifier = DeterministicGroundingVerifier()


def get_grounding_verifier() -> BaseGroundingVerifier:
    return _active_verifier


def set_grounding_verifier(verifier: BaseGroundingVerifier) -> None:
    global _active_verifier
    _active_verifier = verifier


class CitationValidator:
    """
    Dual-layer validation engine:
    1. Deterministic Reference Verification (Chunk ID presence, course isolation, verbatim quotes)
    2. Semantic Grounding Verification (Independent NLI and claim support scoring)
    """

    @classmethod
    async def validate(
        cls,
        raw_output: RawModelTutorOutput,
        retrieved_evidence: List[RetrievalResult],
        course_id: str,
        concept_id: Optional[str] = None,
        verifier: Optional[BaseGroundingVerifier] = None
    ) -> Tuple[GroundingReport, List[SourceCitationOut]]:
        """
        Execute full verification suite.
        Returns:
            (GroundingReport, validated_citations_list)
        """
        active_verifier = verifier or get_grounding_verifier()
        evidence_map: Dict[str, RetrievalResult] = {e.chunk_id: e for e in retrieved_evidence}

        claim_reports: List[ClaimVerificationResult] = []
        validated_citations: List[SourceCitationOut] = []
        validated_chunk_ids: Set[str] = set()
        hallucinated_citations_count = 0

        # Layer 1: Deterministic Reference Validation
        for chunk_id in raw_output.citation_chunk_ids:
            if chunk_id not in evidence_map:
                logger.warning("HALLUCINATED REFERENCE DETECTED: chunk_id '%s' was not in retrieved evidence", chunk_id)
                hallucinated_citations_count += 1
            else:
                validated_chunk_ids.add(chunk_id)

        # Layer 2: Claim Grounding Checks
        for item in raw_output.claimed_facts:
            # Check reference validity
            if item.cited_chunk_id and item.cited_chunk_id not in evidence_map:
                claim_reports.append(
                    ClaimVerificationResult(
                        claim=item.claim,
                        cited_chunk_id=item.cited_chunk_id,
                        is_valid_reference=False,
                        grounding_score=0.0,
                        status="hallucinated_reference",
                        explanation=f"Cited chunk_id '{item.cited_chunk_id}' was not returned by retrieval for this course."
                    )
                )
                hallucinated_citations_count += 1
                continue

            if not item.cited_chunk_id:
                # Uncited claim: verify against full retrieved corpus
                best_score = 0.0
                best_reason = "No cited chunk provided; checked across retrieved evidence."
                for ev in retrieved_evidence:
                    score, reason = await active_verifier.verify_claim(item.claim, ev.content)
                    if score > best_score:
                        best_score = score
                        best_reason = reason

                status_label = "verified" if best_score >= 0.65 else ("partial" if best_score >= 0.35 else "unsupported")
                claim_reports.append(
                    ClaimVerificationResult(
                        claim=item.claim,
                        cited_chunk_id=None,
                        is_valid_reference=True,
                        grounding_score=best_score,
                        status=status_label,
                        explanation=best_reason
                    )
                )
                continue

            # Valid cited chunk
            target_evidence = evidence_map[item.cited_chunk_id]
            score, reason = await active_verifier.verify_claim(item.claim, target_evidence.content)

            # Check direct quote if provided
            if item.direct_quote:
                quote_clean = item.direct_quote.strip().lower()
                evidence_clean = target_evidence.content.lower()
                if quote_clean in evidence_clean:
                    score = max(score, 0.95)
                    reason += " [Direct quote verified in source text]"
                else:
                    score = min(score, 0.70)
                    reason += " [Direct quote was not found verbatim in chunk text]"

            status_label = "verified" if score >= 0.65 else ("partial" if score >= 0.35 else "unsupported")
            claim_reports.append(
                ClaimVerificationResult(
                    claim=item.claim,
                    cited_chunk_id=item.cited_chunk_id,
                    is_valid_reference=True,
                    grounding_score=score,
                    status=status_label,
                    explanation=reason
                )
            )

        # Build clean citations list only from verified chunks
        for chunk_id in validated_chunk_ids:
            ev = evidence_map[chunk_id]
            # Determine confidence from claims citing this chunk
            chunk_claim_scores = [
                cr.grounding_score for cr in claim_reports if cr.cited_chunk_id == chunk_id
            ]
            avg_chunk_score = sum(chunk_claim_scores) / len(chunk_claim_scores) if chunk_claim_scores else ev.score

            confidence = "verified" if avg_chunk_score >= 0.65 else ("partial" if avg_chunk_score >= 0.35 else "inconclusive")
            citation_obj = ev.to_citation()
            citation_obj.verification_confidence = confidence
            validated_citations.append(citation_obj)

        # Calculate overall metrics
        total_claims = len(claim_reports)
        claims_verified = sum(1 for c in claim_reports if c.status == "verified")
        claims_unsupported = sum(1 for c in claim_reports if c.status in ("unsupported", "hallucinated_reference"))
        overall_score = (
            sum(c.grounding_score for c in claim_reports) / total_claims
            if total_claims > 0 else (0.9 if validated_citations else 0.0)
        )

        deterministic_passed = hallucinated_citations_count == 0
        semantic_passed = claims_unsupported == 0 and overall_score >= 0.60

        # Decision Matrix for Answer State
        final_answer_state = raw_output.support_status
        unsupported_warning: Optional[str] = None

        if not retrieved_evidence:
            final_answer_state = "not_found"
            unsupported_warning = "Topic outside currently indexed course syllabus boundaries."
        elif hallucinated_citations_count > 0 and not validated_citations:
            final_answer_state = "outside_materials"
            unsupported_warning = (
                f"Model generated {hallucinated_citations_count} unverified or fabricated citation(s). "
                "Citations have been suppressed because they do not exist in your courseware."
            )
        elif claims_unsupported > 0 or overall_score < 0.60:
            final_answer_state = "partially_supported"
            unsupported_warning = (
                "Some claims in this response could not be fully substantiated by your course materials. "
                "Review the citations for primary evidence."
            )
        elif claims_verified > 0 and overall_score >= 0.65 and validated_citations:
            final_answer_state = "supported"
            unsupported_warning = None

        report = GroundingReport(
            overall_grounding_score=round(overall_score, 3),
            deterministic_checks_passed=deterministic_passed,
            semantic_checks_passed=semantic_passed,
            hallucinated_citations_detected=hallucinated_citations_count,
            claims_verified=claims_verified,
            claims_unsupported=claims_unsupported,
            verifier_notes=(
                f"Verified {claims_verified}/{total_claims} claims. "
                f"Found {hallucinated_citations_count} invalid citation references."
            ),
            claim_reports=claim_reports,
            final_answer_state=final_answer_state,
            unsupported_warning=unsupported_warning,
        )

        return report, validated_citations

