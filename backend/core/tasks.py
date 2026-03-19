"""
Task generation and session summary module for SpeakScense.
"""

import logging
from backend.core.llm import call_llm
from backend.utils.prompts import get_daily_tasks_prompt, get_summary_prompt

logger = logging.getLogger("speakscense.tasks")


def generate_daily_tasks(
    level: str = "Intermediate",
    scenario: str = "General",
    language: str = "English",
) -> dict:
    prompt = get_daily_tasks_prompt(level, scenario, language)
    result = call_llm(prompt, scenario="daily-tasks", is_coaching=False)

    if "tasks" not in result or not isinstance(result["tasks"], list) or len(result["tasks"]) == 0:
        logger.warning("Daily tasks generation failed — using defaults")
        result = _default_tasks(level, scenario, language)

    # Ensure each task has required fields
    for i, task in enumerate(result.get("tasks", [])):
        if "id" not in task:
            task["id"] = i + 1
        if "type" not in task:
            task["type"] = ["speaking", "writing", "listening"][i % 3]
        if "duration_minutes" not in task:
            task["duration_minutes"] = 10

    if "motivation" not in result:
        result["motivation"] = "Every session brings you closer to fluency. Keep going!"

    if "focus_area" not in result:
        result["focus_area"] = "overall communication confidence"

    return result


def generate_summary(logs: list, language: str = "English") -> dict:
    if not logs:
        return {
            "total_sessions":       0,
            "average_score":        0.0,
            "highest_score":        0.0,
            "lowest_score":         0.0,
            "strengths":            [],
            "improvements":         ["Start your first session to see insights here!"],
            "recommended_scenario": "casual-chat",
            "message":              "No sessions recorded yet. Start speaking to see your progress!",
        }

    prompt = get_summary_prompt(logs, language)
    result = call_llm(prompt, scenario="summary", is_coaching=False)

    # Ensure numeric fields are correct
    scores = [l.get("final_score", 0) for l in logs]
    result["total_sessions"] = len(logs)
    result["average_score"]  = round(sum(scores) / len(scores), 1) if scores else 0.0
    result["highest_score"]  = round(max(scores), 1) if scores else 0.0
    result["lowest_score"]   = round(min(scores), 1) if scores else 0.0

    return result


def _default_tasks(level: str, scenario: str, language: str) -> dict:
    tasks_by_level = {
        "Beginner": [
            {"id": 1, "task": f"Introduce yourself in 3 sentences related to {scenario}.", "type": "speaking", "duration_minutes": 5},
            {"id": 2, "task": f"Write 5 simple sentences about your day in {language}.", "type": "writing", "duration_minutes": 10},
            {"id": 3, "task": f"Listen to a 5-minute {language} podcast and note 3 new words.", "type": "listening", "duration_minutes": 10},
        ],
        "Intermediate": [
            {"id": 1, "task": f"Describe a recent experience using past tense in a {scenario} context.", "type": "speaking", "duration_minutes": 7},
            {"id": 2, "task": f"Write a short paragraph (8-10 sentences) about {scenario} in {language}.", "type": "writing", "duration_minutes": 10},
            {"id": 3, "task": f"Watch a 10-minute {language} video on {scenario} and summarize 3 key points.", "type": "listening", "duration_minutes": 15},
        ],
        "Advanced": [
            {"id": 1, "task": f"Give a 2-minute impromptu speech on a challenging aspect of {scenario}.", "type": "speaking", "duration_minutes": 10},
            {"id": 2, "task": f"Write a persuasive short essay (150 words) on a topic related to {scenario}.", "type": "writing", "duration_minutes": 15},
            {"id": 3, "task": f"Listen to a native-speed debate or lecture on {scenario} and note rhetorical techniques.", "type": "listening", "duration_minutes": 20},
        ],
    }
    return {
        "tasks":       tasks_by_level.get(level, tasks_by_level["Intermediate"]),
        "focus_area":  f"{scenario} communication",
        "motivation":  "Consistency beats intensity. Practice a little every day!",
    }