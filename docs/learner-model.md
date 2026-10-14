# CourseCompass Learner Model Specification & Heuristic Weights

## Overview

The CourseCompass learner model represents student mastery over course concepts using deterministic algorithms, directed knowledge graphs, and empirical quiz performance.

> [!IMPORTANT]
> **Deterministic Mastery Principle**: The backend calculates official mastery scores through explicit, reproducible arithmetic. Machine learning / LLMs may categorize misconceptions, extract question distractors, or suggest explanations, but **LLMs never directly assign or set the official numeric mastery percentage or status**.

---

## 1. Mastery Update Algorithm (`MasteryAlgorithmV1`)

### 1.1 State Variables

For each concept $c \in C$, the student model tracks:
- $\text{mastery\_percent} \in [0, 100]$: Current integer mastery level.
- $\text{status} \in \{\text{"attention"}, \text{"learning"}, \text{"mastered"}\}$:
  - $\text{mastered}$: $\ge 80\%$
  - $\text{learning}$: $40\% \le \text{mastery} < 80\%$
  - $\text{attention}$: $< 40\%$
- $\text{streak\_correct}$: Number of consecutive correct submissions.
- $\text{streak\_incorrect}$: Number of consecutive incorrect submissions.
- $\text{total\_attempts}$: Total historical questions answered for this concept.
- $\text{last\_attempt\_at}$: Timestamp of the most recent answer submission.

### 1.2 Configurable Heuristic Weights

All numerical parameters are heuristic baselines chosen for stable convergence in interactive tutoring sessions:

| Parameter | Default Value | Description |
|:---|:---:|:---|
| `correct_gain` | `+15.0` | Base points awarded for full credit ($\text{score} \ge 0.8$) |
| `partial_gain` | `+7.0` | Base points awarded for partial credit ($0.3 \le \text{score} < 0.8$) |
| `incorrect_penalty` | `-8.0` | Base points deducted for incorrect answers ($\text{score} < 0.3$) |
| `consistency_bonus` | `+5.0` | Bonus added when correct streak reaches $\ge 3$ |
| `consistency_streak_threshold` | `3` | Required consecutive correct answers for consistency bonus |
| `time_decay_rate` | `2.0` | Points decayed per week of inactivity beyond week 1 |
| `time_decay_max` | `20.0` | Maximum cap on total time decay penalty |
| `sparse_data_damping` | `0.6` | Damping factor applied when total attempts $< 2$ |
| `sparse_data_min_attempts` | `2` | Minimum attempts required before full delta scaling applies |
| `mastery_threshold` | `80` | Minimum score for "mastered" status |
| `learning_threshold` | `40` | Minimum score for "learning" status |

### 1.3 Step-by-Step Update Procedure

Given an attempt with score $s \in [0.0, 1.0]$ at timestamp $t_{\text{now}}$:

1. **Inactivity Decay**:
   $$\Delta t_{\text{weeks}} = \max\left(0.0, \frac{t_{\text{now}} - t_{\text{last}}}{7 \times 86400} - 1.0\right)$$
   $$\text{decay} = \min(\text{time\_decay\_rate} \times \Delta t_{\text{weeks}}, \text{time\_decay\_max})$$
   $$M_0 = \max(0.0, M_{\text{current}} - \text{decay})$$

2. **Sparse Data Damping**:
   $$D = \begin{cases} 0.6 & \text{if } \text{total\_attempts} < 2 \\ 1.0 & \text{otherwise} \end{cases}$$

3. **Score Delta**:
   $$\Delta_{\text{score}} = \begin{cases} 
   \text{correct\_gain} \times D & \text{if } s \ge 0.8 \\
   \text{partial\_gain} \times D & \text{if } 0.3 \le s < 0.8 \\
   -\text{incorrect\_penalty} \times D & \text{if } s < 0.3
   \end{cases}$$

4. **Consistency Bonus**:
   $$\Delta_{\text{streak}} = \begin{cases} \text{consistency\_bonus} & \text{if } s \ge 0.8 \text{ and } (\text{streak\_correct} + 1) \ge 3 \\ 0.0 & \text{otherwise} \end{cases}$$

5. **Clamp and Status**:
   $$M_{\text{new}} = \text{round}\Big(\text{clamp}\big(M_0 + \Delta_{\text{score}} + \Delta_{\text{streak}}, 0, 100\big)\Big)$$

---

## 2. Prerequisite Gap Analysis

The concept map defines a Directed Acyclic Graph (DAG) with edges $(u, v) \in E$ where $u$ is a prerequisite for $v$.

A **Prerequisite Gap** occurs when concept $u$ has $\text{mastery\_percent} < 40\%$, but subsequent concepts $v_1, v_2, \dots$ depend on it.

### Urgency Scoring:
$$\text{Priority}(u) = |\{v : (u, v) \in E\}| \times (40 - \text{mastery\_percent}(u))$$

Concepts with higher prerequisite priority scores are placed at the absolute front of study recommendations.

---

## 3. Misconception Classification

When students choose incorrect options or write short answers exhibiting conceptual errors, the grading service logs structured misconception tags:
- Tags are normalized case-insensitively (e.g., `"confusing stack frame with heap"`).
- Confidence is calculated from empirical recurrence:
  $$\text{Confidence}(\text{tag}) = \min\left(1.0, \frac{\text{frequency}}{\text{total\_mistakes}} + 0.1 \times \min(\text{frequency}, 5)\right)$$
- Actionable diagnostic advice links directly to foundational learning materials.

---

## 4. Time-Budgeted Study Plan Generation

The `StudyPlanGenerator` produces personalized learning schedules subject to:
1. Student's available study time per day (e.g., 45 minutes).
2. Countdown to exam date ($\max(1, \text{days\_until\_exam})$).
3. Recommended activity duration:
   - Review (status: attention): 20 minutes
   - Practice (status: learning): 15 minutes
   - Quiz (status: mastered): 10 minutes
   - Socratic Tutor: 15 minutes

When available time is exceeded, remaining concepts are cleanly categorized as `overflow_concepts` rather than dropping silently.

---

## 5. Recalculation & Replay Verification

When instructors override grades or rubric updates occur:
- `recalculate_from_history` wipes current concept state and replays all historical attempts in strict chronological order.
- Guarantees complete idempotency and mathematical consistency without manual database adjustments.

