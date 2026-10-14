"""
MasteryAlgorithmV1: Deterministic, versioned mastery calculation.

All weights are HEURISTIC and configurable — not scientifically validated.
The LLM must NEVER directly set mastery scores; only this engine computes them.
"""
from dataclasses import dataclass, field
from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime, timezone, timedelta


@dataclass
class MasteryWeights:
    """Configurable heuristic weights for mastery calculation.
    
    WARNING: All values are heuristics chosen for reasonable behavior.
    They have NOT been validated against learning-science research.
    Adjust based on observed student outcomes.
    """
    correct_gain: float = 15.0      # points gained for correct answer (score >= 0.8)
    partial_gain: float = 7.0       # points gained for partial answer (0.3 <= score < 0.8)
    incorrect_penalty: float = 8.0  # points lost for incorrect answer (score < 0.3)
    consistency_bonus: float = 5.0  # extra points for 3+ correct streak
    consistency_streak_threshold: int = 3
    time_decay_rate: float = 2.0    # points lost per week of inactivity
    time_decay_max: float = 20.0    # maximum decay cap
    mastery_threshold: int = 80     # >= this = mastered
    learning_threshold: int = 40    # >= this = learning, below = attention
    min_mastery: int = 0
    max_mastery: int = 100
    sparse_data_min_attempts: int = 2  # need at least this many attempts for confident scoring
    sparse_data_damping: float = 0.6   # reduce gains/penalties when sparse


class MasteryAlgorithmV1:
    """Deterministic mastery update algorithm v1."""
    
    VERSION = "v1"
    
    def __init__(self, weights: Optional[MasteryWeights] = None):
        self.weights = weights or MasteryWeights()
    
    def calculate_update(
        self,
        current_mastery: int,
        score: float,
        is_correct: bool,
        streak_correct: int,
        streak_incorrect: int,
        total_attempts: int,
        last_attempt_at: Optional[datetime] = None,
        now: Optional[datetime] = None,
    ) -> Tuple[int, str]:
        """Calculate new mastery percent and status.
        
        Args:
            current_mastery: Current mastery percentage (0-100)
            score: Answer score (0.0-1.0)
            is_correct: Whether the answer was correct
            streak_correct: Current consecutive correct count
            streak_incorrect: Current consecutive incorrect count  
            total_attempts: Total attempts on this concept
            last_attempt_at: When the last attempt was made
            now: Current time (for testing)
            
        Returns:
            Tuple of (new_mastery_percent, new_status)
        """
        w = self.weights
        if now is None:
            now = datetime.now(timezone.utc)
        elif now.tzinfo is None:
            now = now.replace(tzinfo=timezone.utc)
        
        mastery = float(current_mastery)
        
        # Step 1: Time decay (inactivity penalty)
        if last_attempt_at:
            if last_attempt_at.tzinfo is None:
                last_attempt_at = last_attempt_at.replace(tzinfo=timezone.utc)
            days_inactive = (now - last_attempt_at).total_seconds() / 86400.0
            weeks_inactive = days_inactive / 7.0
            if weeks_inactive > 1.0:
                decay = min(w.time_decay_rate * weeks_inactive, w.time_decay_max)
                mastery = max(float(w.min_mastery), mastery - decay)
        
        # Step 2: Sparse data damping
        damping = w.sparse_data_damping if total_attempts < w.sparse_data_min_attempts else 1.0
        
        # Step 3: Score-based update
        if score >= 0.8:
            delta = w.correct_gain * damping
            mastery += delta
        elif score >= 0.3:
            delta = w.partial_gain * damping
            mastery += delta
        else:
            delta = w.incorrect_penalty * damping
            mastery -= delta
        
        # Step 4: Consistency bonus
        if is_correct and (streak_correct + 1) >= w.consistency_streak_threshold:
            mastery += w.consistency_bonus
        
        # Step 5: Clamp
        mastery = max(float(w.min_mastery), min(float(w.max_mastery), mastery))
        new_mastery = round(mastery)
        
        # Step 6: Determine status
        if new_mastery >= w.mastery_threshold:
            status = "mastered"
        elif new_mastery >= w.learning_threshold:
            status = "learning"
        else:
            status = "attention"
        
        return new_mastery, status
    
    def recalculate_from_history(
        self,
        attempts: List[Dict[str, Any]],
        initial_mastery: int = 0,
    ) -> Tuple[int, str, int, int]:
        """Recalculate mastery from scratch using full attempt history.
        
        Used when grading corrections occur.
        
        Args:
            attempts: List of dicts with keys: score, is_correct, answered_at
                     Sorted by answered_at ascending.
            initial_mastery: Starting mastery (usually 0)
            
        Returns:
            Tuple of (mastery_percent, status, streak_correct, streak_incorrect)
        """
        mastery = initial_mastery
        streak_correct = 0
        streak_incorrect = 0
        last_at = None
        
        for i, attempt in enumerate(attempts):
            score = attempt.get("score", 0.0)
            is_correct = attempt.get("is_correct", False)
            answered_at = attempt.get("answered_at")
            
            mastery, status = self.calculate_update(
                current_mastery=mastery,
                score=score,
                is_correct=is_correct,
                streak_correct=streak_correct,
                streak_incorrect=streak_incorrect,
                total_attempts=i,
                last_attempt_at=last_at,
                now=answered_at,
            )
            
            if is_correct:
                streak_correct += 1
                streak_incorrect = 0
            else:
                streak_incorrect += 1
                streak_correct = 0
            
            last_at = answered_at
        
        if not attempts:
            return initial_mastery, "attention" if initial_mastery < 40 else "learning", 0, 0
        
        return mastery, status, streak_correct, streak_incorrect
