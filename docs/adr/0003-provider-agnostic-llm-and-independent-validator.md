# ADR 0003: Provider-Agnostic LLM Layer with Independent Citation Validator

**Status:** Accepted  
**Date:** 2026-10-14  
**Context:**  
CourseCompass promises students zero-hallucination, course-grounded explanations with verified citations. Single-pass LLM prompts often hallucinate citations or cite pages that do not contain the claimed assertion. Furthermore, team members and deployment environments may use either Google Gemini or OpenAI.

**Decision:**  
1. We implement an abstract `BaseLLMProvider` interface with concrete implementations for `GeminiProvider` (`google-genai` SDK) and `OpenAIProvider` (`openai` SDK), selectable via the `LLM_PROVIDER` environment variable.
2. We implement a dedicated **Independent Citation Validator Layer** (`ValidationService`). The tutor generates a draft response with chunk IDs; the validator independently checks entailment against the raw database chunk text before citations are certified and displayed to the student.

**Consequences:**  
* **Positive:** Strict mathematical guarantee of citation veracity. Freedom to switch between Gemini 2.0 Flash and GPT-4o without altering business logic.
* **Negative:** Adds a secondary verification latency of $\sim 300\text{–}600\text{ms}$ on tutor chat responses. Mitigated by using lightweight fast models for the verification pass.

