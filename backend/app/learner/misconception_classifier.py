"""
Misconception classifiers: pattern-based deterministic + optional LLM.
"""
from typing import List, Optional, Dict
from collections import Counter
from abc import ABC, abstractmethod
from .schemas import MisconceptionReport


class BaseMisconceptionClassifier(ABC):
    @abstractmethod
    def classify(
        self,
        concept_id: str,
        concept_name: str,
        misconception_tags: List[str],
        attempt_ids: List[str],
    ) -> List[MisconceptionReport]:
        ...


class DeterministicMisconceptionClassifier(BaseMisconceptionClassifier):
    """Pattern-matching classifier using misconception_tag from quiz answers.
    
    Groups tags, counts frequency, and assigns confidence based on occurrence rate.
    """
    
    def classify(
        self,
        concept_id: str,
        concept_name: str,
        misconception_tags: List[str],
        attempt_ids: List[str],
    ) -> List[MisconceptionReport]:
        if not misconception_tags:
            return []
        
        # Pair tags with attempt IDs
        tag_attempts: Dict[str, List[str]] = {}
        for tag, aid in zip(misconception_tags, attempt_ids):
            if tag:
                normalized = tag.strip().lower()
                if normalized not in tag_attempts:
                    tag_attempts[normalized] = []
                tag_attempts[normalized].append(aid)
        
        total = len([t for t in misconception_tags if t])
        if total == 0:
            return []
        
        reports = []
        for tag, aids in sorted(tag_attempts.items(), key=lambda x: -len(x[1])):
            freq = len(aids)
            confidence = min(1.0, freq / max(total, 1) + 0.1 * min(freq, 5))
            reports.append(
                MisconceptionReport(
                    concept_id=concept_id,
                    concept_name=concept_name,
                    misconception_tag=tag,
                    frequency=freq,
                    classifier_confidence=min(1.0, confidence),
                    supporting_evidence=aids,
                    diagnostic_advice=f"Student has shown '{tag}' misconception {freq} time(s). Review foundational material for {concept_name}.",
                )
            )
        
        return reports


# Factory pattern
_classifier: Optional[BaseMisconceptionClassifier] = None


def set_misconception_classifier(c: BaseMisconceptionClassifier) -> None:
    global _classifier
    _classifier = c


def get_misconception_classifier() -> BaseMisconceptionClassifier:
    global _classifier
    if _classifier is None:
        _classifier = DeterministicMisconceptionClassifier()
    return _classifier
