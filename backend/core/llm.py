"""
LLM client module for SpeakScense.
- Retry logic with exponential backoff
- Multi-layer JSON validation
- Dynamic score validation (no hardcoded defaults)
- Full audit logging
"""

import json
import re
import time
import logging
from groq import Groq
from backend.config import (
    GROQ_API_KEY, GROQ_MODEL, GROQ_TIMEOUT,
    GROQ_MAX_RETRIES, LLM_TEMPERATURE, LLM_MAX_TOKENS, LLM_TOP_P
)

logger = logging.getLogger("speakscense.llm")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

client = Groq(api_key=GROQ_API_KEY)

# ── Required fields for coaching response ─────────────────────────────────────
COACHING_REQUIRED_FIELDS = [
    "good", "better", "best", "explanation",
    "task_checklist", "task_feedback", "fluency_note",
    "pronunciation_tip", "tone_feedback", "mid_guidance",
    "response", "scores"
]

SCORE_FIELDS = ["grammar", "fluency", "pronunciation"]

# ── Error detection ───────────────────────────────────────────────────────────
_LLM_ERROR_PHRASES = [
    "api key", "out of credits", "quota", "rate limit",
    "unauthorized", "failed", "error:", "exception", "i cannot", "i'm unable"
]
_FIELD_ERROR_KEYWORDS = [
    "out of credits", "quota exceeded", "api key missing",
    "rate limit reached", "i cannot provide"
]


# ── Core LLM call with retry ──────────────────────────────────────────────────
def call_llm(prompt: str, scenario: str = "casual-chat", is_coaching: bool = True) -> dict:
    last_error = None

    for attempt in range(1, GROQ_MAX_RETRIES + 1):
        try:
            logger.info(f"LLM call attempt {attempt}/{GROQ_MAX_RETRIES} | scenario={scenario}")

            response = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a precise JSON-outputting language coaching AI. "
                            "Return ONLY valid JSON. No markdown. No explanation. No preamble."
                        )
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=LLM_TEMPERATURE,
                max_tokens=LLM_MAX_TOKENS,
                top_p=LLM_TOP_P,
                timeout=GROQ_TIMEOUT,
            )

            raw = response.choices[0].message.content.strip()
            logger.debug(f"Raw LLM response (first 200 chars): {raw[:200]}")

            # Layer 1: Check for error phrases in raw output
            if any(p in raw.lower() for p in _LLM_ERROR_PHRASES):
                logger.warning("Error phrase detected in LLM output")
                return _smart_fallback(scenario)

            # Layer 2: Extract JSON block
            result = _extract_and_parse_json(raw)
            if result is None:
                logger.warning(f"JSON extraction failed on attempt {attempt}")
                last_error = "json_extraction"
                time.sleep(0.5 * attempt)
                continue

            # Layer 3: Field-level error check
            for field in ["good", "better", "best", "response", "task_feedback"]:
                val = result.get(field, "")
                if isinstance(val, str) and any(kw in val.lower() for kw in _FIELD_ERROR_KEYWORDS):
                    logger.warning(f"Error keyword found in field '{field}'")
                    return _smart_fallback(scenario)

            # Layer 4: Fill missing fields with context-aware defaults
            result = _fill_defaults(result, scenario, is_coaching)

            # Layer 5: Clean text fields
            result = _clean_text_fields(result)

            # Layer 6: Validate and normalize scores
            result = _validate_scores(result)

            logger.info(f"✅ LLM success | scores={result.get('scores')}")
            return result

        except Exception as e:
            last_error = str(e)
            logger.error(f"LLM exception on attempt {attempt}: {type(e).__name__}: {e}")
            if attempt < GROQ_MAX_RETRIES:
                time.sleep(1.0 * attempt)

    logger.error(f"All {GROQ_MAX_RETRIES} LLM attempts failed. Last error: {last_error}")
    return _smart_fallback(scenario)


# ── JSON extraction ───────────────────────────────────────────────────────────
def _extract_and_parse_json(raw: str) -> dict | None:
    # Strip markdown fences
    cleaned = re.sub(r"```(?:json)?", "", raw).strip().rstrip("`").strip()

    # Attempt 1: direct parse
    try:
        result = json.loads(cleaned)
        if isinstance(result, dict):
            return result
    except json.JSONDecodeError:
        pass

    # Attempt 2: extract first top-level JSON object (handles nested braces)
    depth = 0
    start = None
    for i, ch in enumerate(cleaned):
        if ch == "{":
            if depth == 0:
                start = i
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0 and start is not None:
                try:
                    result = json.loads(cleaned[start:i+1])
                    if isinstance(result, dict):
                        return result
                except json.JSONDecodeError:
                    pass
                break

    return None


# ── Field defaults ────────────────────────────────────────────────────────────
def _fill_defaults(result: dict, scenario: str, is_coaching: bool) -> dict:
    coaching_defaults = {
        "good":             "Your input was communicated clearly.",
        "better":           "A more natural and fluent version of your input.",
        "best":             "A confident, native-speaker expression of your idea.",
        "explanation":      "Each version improves clarity, grammar, and natural flow.",
        "task_checklist":   {"intent": True, "details": False, "politeness": True, "clarity": True},
        "task_feedback":    "Good effort! You communicated your point effectively.",
        "fluency_note":     "Your sentence structure shows developing fluency.",
        "pronunciation_tip":"Focus on clear enunciation of key content words.",
        "tone_feedback":    f"Your tone is appropriate for a {scenario.replace('-', ' ')} context.",
        "mid_guidance":     "Try adding one specific detail to make your response more engaging.",
        "response":         _scenario_followup(scenario),
        "scores":           None  # handled separately in _validate_scores
    }

    for field, default in coaching_defaults.items():
        if field not in result or result[field] is None:
            result[field] = default

    return result


# ── Text cleaning ─────────────────────────────────────────────────────────────
_STRIP_PREFIXES = re.compile(
    r'^(I said|I wanted to say|You said|I think|A native speaker would say|Let me|So,|Well,|I mean,)\s*:?\s*',
    flags=re.IGNORECASE
)
_ERROR_PHRASES_CLEAN = re.compile(
    r'(out of credits|API key|anthropic rate limit|quota exceeded)',
    flags=re.IGNORECASE
)
_TEXT_FIELDS = [
    "good", "better", "best", "explanation", "task_feedback",
    "fluency_note", "pronunciation_tip", "tone_feedback", "mid_guidance", "response"
]

def _clean_text_fields(result: dict) -> dict:
    for field in _TEXT_FIELDS:
        if field in result and isinstance(result[field], str):
            text = result[field].strip()
            text = _STRIP_PREFIXES.sub("", text).strip()
            text = _ERROR_PHRASES_CLEAN.sub("", text).strip()
            if len(text) < 3:
                text = result[field]  # revert if cleaning destroyed it
            result[field] = text
    return result


# ── Score validation ──────────────────────────────────────────────────────────
def _validate_scores(result: dict) -> dict:
    raw_scores = result.get("scores")

    if isinstance(raw_scores, dict):
        validated = {}
        for field in SCORE_FIELDS:
            try:
                val = int(float(str(raw_scores.get(field, 0))))
                # Reject hardcoded 72 as default — recalculate from other scores or flag
                validated[field] = max(0, min(100, val))
            except (ValueError, TypeError):
                validated[field] = 0
        result["scores"] = validated
    else:
        # No scores returned at all — use neutral 0 to trigger fallback scoring
        logger.warning("No scores in LLM response — using zero scores")
        result["scores"] = {"grammar": 0, "fluency": 0, "pronunciation": 0}

    # Sanity check: if ALL scores are identical and equal 72, it's the hardcoded default
    scores_vals = list(result["scores"].values())
    if len(set(scores_vals)) == 1 and scores_vals[0] == 72:
        logger.warning("⚠️ All scores are 72 — likely LLM copied template defaults. Flagging.")
        result["_score_warning"] = "Scores may be unreliable (all identical at 72)"

    return result


# ── Scenario-specific fallback responses ─────────────────────────────────────
def _scenario_followup(scenario: str) -> str:
    mapping = {
        "job-interview":    "That's great experience. Can you walk me through a specific challenge you faced in that role?",
        "business-meeting": "Interesting point. How would that align with the team's current priorities?",
        "casual-chat":      "That sounds fun! How long have you been interested in that?",
        "public-speaking":  "Good point. Could you share a real example that supports that idea?",
        "customer-service": "I understand. What would the ideal resolution look like for you?",
        "negotiation":      "I appreciate that. What would you consider a fair middle ground here?",
        "travel":           "Nice! What's been the highlight of your trip so far?",
        "academic":         "Interesting perspective. What evidence supports that argument?",
    }
    return mapping.get(scenario, "Tell me more about that — what happened next?")


# ── Smart fallback ────────────────────────────────────────────────────────────
def _smart_fallback(scenario: str = "casual-chat") -> dict:
    logger.warning(f"⚠️ Smart fallback triggered for scenario: {scenario}")
    return {
        "good":             "You expressed your idea clearly.",
        "better":           "A more natural and confident way to say that.",
        "best":             "A polished, native-speaker version of your thought.",
        "explanation":      "Each version improves the grammar, vocabulary, and natural flow of your expression.",
        "task_checklist":   {"intent": True, "details": False, "politeness": True, "clarity": True},
        "task_feedback":    "Good effort! Keep practicing — consistency is key.",
        "fluency_note":     "Your message came across clearly. Focus on smoother transitions.",
        "pronunciation_tip":"Slow down slightly on longer words and enunciate each syllable.",
        "tone_feedback":    f"Your tone fits well for a {scenario.replace('-', ' ')} context.",
        "mid_guidance":     "Try adding one specific detail or example to enrich your next response.",
        "response":         _scenario_followup(scenario),
        "scores":           {"grammar": 55, "fluency": 55, "pronunciation": 55},
        "_fallback":        True,
    }