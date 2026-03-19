"""
Level detection module for SpeakScense.
Calls LLM with a strict rubric-based prompt and validates output.
"""

import logging
from backend.core.llm import call_llm
from backend.utils.prompts import get_level_detection_prompt

logger = logging.getLogger("speakscense.level")

VALID_LEVELS = ["Beginner", "Intermediate", "Advanced"]
SCORE_KEYS = ["grammar_score", "fluency_score", "vocabulary_score"]


def detect_level(responses: list[str], language: str = "English") -> dict:
    if not responses:
        return _default_level_result("No responses provided.")

    # Filter out empty responses
    clean = [r.strip() for r in responses if r.strip()]
    if not clean:
        return _default_level_result("All responses were empty.")

    prompt = get_level_detection_prompt(clean, language)
    result = call_llm(prompt, scenario="level-detection", is_coaching=False)

    # Validate level
    detected = result.get("level", "")
    if detected not in VALID_LEVELS:
        logger.warning(f"Invalid level '{detected}' — defaulting to Intermediate")
        result["level"] = "Intermediate"

    # Validate score fields
    for key in SCORE_KEYS:
        raw = result.get(key)
        try:
            result[key] = max(0, min(100, int(float(str(raw)))))
        except (ValueError, TypeError):
            result[key] = 50
            logger.warning(f"Missing/invalid '{key}' — defaulting to 50")

    if "reasoning" not in result or not result["reasoning"]:
        result["reasoning"] = "Level assessed based on vocabulary range and grammatical complexity."

    # Add computed composite
    result["composite_score"] = round(
        (result["grammar_score"] + result["fluency_score"] + result["vocabulary_score"]) / 3, 1
    )

    logger.info(f"Level detected: {result['level']} | composite={result['composite_score']}")
    return result


def _default_level_result(reason: str) -> dict:
    return {
        "level":            "Intermediate",
        "grammar_score":    50,
        "fluency_score":    50,
        "vocabulary_score": 50,
        "composite_score":  50.0,
        "reasoning":        reason,
    }