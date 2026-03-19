from backend.core.llm import call_llm
from backend.utils.prompts import get_level_detection_prompt


def detect_level(responses: list) -> dict:
    prompt = get_level_detection_prompt(responses)
    result = call_llm(prompt)

    valid_levels = ["Beginner", "Intermediate", "Advanced"]
    if result.get("level") not in valid_levels:
        result["level"] = "Intermediate"

    for key in ["grammar_score", "fluency_score", "vocabulary_score"]:
        if key not in result:
            result[key] = 50

    if "reasoning" not in result:
        result["reasoning"] = "Level determined based on responses."

    return result