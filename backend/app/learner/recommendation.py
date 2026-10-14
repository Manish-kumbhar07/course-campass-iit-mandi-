"""
Recommendation engine: prerequisite gaps → weak concepts → time budget.
"""
from typing import List, Dict, Optional, Tuple
from .schemas import StudyRecommendation, PrerequisiteGap


class RecommendationService:
    """Generates prioritized study recommendations.
    
    Priority order:
    1. Prerequisite gaps (concepts needed by others, ordered by urgency)
    2. Weakest concepts (lowest mastery first)
    3. Recently attempted but struggling concepts
    """
    
    ACTIVITY_MAP = {
        "attention": "review",
        "learning": "practice", 
        "mastered": "quiz",
    }
    
    TIME_ESTIMATES = {
        "review": 20,
        "practice": 15,
        "quiz": 10,
        "tutor": 15,
    }
    
    @classmethod
    def find_prerequisite_gaps(
        cls,
        concepts: List[dict],
        relationships: List[dict],
        mastery_threshold: int = 40,
    ) -> List[PrerequisiteGap]:
        """Identify prerequisite concepts with mastery below threshold.
        
        Args:
            concepts: List of dicts with keys: id, name, mastery_percent, status
            relationships: List of dicts with keys: source_concept_id, target_concept_id, relationship_type
        """
        concept_map = {c["id"]: c for c in concepts}
        
        # Build reverse dependency map: prereq_id → [dependent_ids]
        dependents: Dict[str, List[str]] = {}
        for rel in relationships:
            if rel.get("relationship_type") == "prerequisite":
                src = rel["source_concept_id"]
                tgt = rel["target_concept_id"]
                # src is prerequisite FOR tgt
                if src not in dependents:
                    dependents[src] = []
                dependents[src].append(tgt)
        
        gaps = []
        for prereq_id, dependent_ids in dependents.items():
            c = concept_map.get(prereq_id)
            if not c:
                continue
            if c["mastery_percent"] < mastery_threshold:
                # Priority = number of dependents × (threshold - mastery)
                priority = len(dependent_ids) * (mastery_threshold - c["mastery_percent"])
                gaps.append(
                    PrerequisiteGap(
                        concept_id=prereq_id,
                        concept_name=c["name"],
                        mastery_percent=c["mastery_percent"],
                        required_by=dependent_ids,
                        priority_score=float(priority),
                    )
                )
        
        return sorted(gaps, key=lambda g: -g.priority_score)
    
    @classmethod
    def generate_recommendations(
        cls,
        concepts: List[dict],
        relationships: List[dict],
        available_minutes: int = 45,
        max_recommendations: int = 5,
    ) -> Tuple[List[StudyRecommendation], List[str]]:
        """Generate prioritized study recommendations fitting within time budget.
        
        Returns:
            Tuple of (recommendations, overflow_concept_ids)
        """
        # 1. Find prerequisite gaps
        gaps = cls.find_prerequisite_gaps(concepts, relationships)
        
        # 2. Sort all non-mastered concepts by mastery ascending
        weak_concepts = sorted(
            [c for c in concepts if c["mastery_percent"] < 80],
            key=lambda c: c["mastery_percent"]
        )
        
        # 3. Build ordered candidate list (gaps first, then weak)
        seen = set()
        candidates = []
        
        # Prerequisite gaps get top priority
        for gap in gaps:
            if gap.concept_id not in seen:
                seen.add(gap.concept_id)
                c = next((x for x in concepts if x["id"] == gap.concept_id), None)
                if c:
                    candidates.append(c)
        
        # Then weakest concepts
        for c in weak_concepts:
            if c["id"] not in seen:
                seen.add(c["id"])
                candidates.append(c)
        
        # 4. Allocate time
        recommendations = []
        overflow = []
        minutes_used = 0
        rank = 1
        
        for c in candidates:
            status = c.get("status", "learning")
            activity = cls.ACTIVITY_MAP.get(status, "practice")
            est_minutes = cls.TIME_ESTIMATES.get(activity, 15)
            
            if minutes_used + est_minutes <= available_minutes and rank <= max_recommendations:
                reason = cls._build_reason(c, gaps)
                recommendations.append(
                    StudyRecommendation(
                        concept_id=c["id"],
                        concept_name=c["name"],
                        priority_rank=rank,
                        reason=reason,
                        recommended_activity=activity,
                        estimated_minutes=est_minutes,
                        current_mastery=c["mastery_percent"],
                    )
                )
                minutes_used += est_minutes
                rank += 1
            else:
                overflow.append(c["id"])
        
        return recommendations, overflow
    
    @classmethod
    def _build_reason(cls, concept: dict, gaps: List[PrerequisiteGap]) -> str:
        gap = next((g for g in gaps if g.concept_id == concept["id"]), None)
        if gap:
            dep_count = len(gap.required_by)
            return f"Prerequisite gap: {concept['name']} is needed by {dep_count} other concept(s) and mastery is only {concept['mastery_percent']}%."
        
        if concept["mastery_percent"] < 40:
            return f"Low mastery ({concept['mastery_percent']}%): needs focused review."
        
        return f"Below target mastery ({concept['mastery_percent']}%): practice recommended."
