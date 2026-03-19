from backend.core.llm import call_llm
from backend.utils.prompts import get_daily_tasks_prompt, get_summary_prompt


def generate_daily_tasks(level: str = "Intermediate", scenario: str = "General", language: str = "English") -> dict:
    prompt = get_daily_tasks_prompt(level, scenario, language)
    result = call_llm(prompt)
    if "tasks" not in result:
        result = {
            "tasks": [
                {"id": 1, "task": "Record yourself speaking for 2 minutes on any topic.", "type": "speaking"},
                {"id": 2, "task": "Write 5 sentences describing your day.", "type": "writing"},
                {"id": 3, "task": "Listen to a podcast for 10 minutes and note 3 new words.", "type": "listening"},
            ],
            "motivation": "Every conversation is a step forward. Keep going!"
        }
    return result


def generate_summary(logs: list, language: str = "English") -> dict:
    if not logs:
        return {"total_sessions": 0, "average_score": 0, "strengths": [], "improvements": [], "message": "No sessions recorded today."}
    prompt = get_summary_prompt(logs, language)
    return call_llm(prompt)