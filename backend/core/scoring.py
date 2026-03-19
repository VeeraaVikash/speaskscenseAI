"""
Scoring module for SpeakScense.
Weighted final score + label + trend analysis.
"""

from backend.config import (
    SCORE_WEIGHT_GRAMMAR,
    SCORE_WEIGHT_FLUENCY,
    SCORE_WEIGHT_PRONUNCIATION,
)


def compute_final_score(grammar: float, fluency: float, pronunciation: float) -> float:
    """Weighted final score rounded to 2 decimal places."""
    return round(
        SCORE_WEIGHT_GRAMMAR * grammar
        + SCORE_WEIGHT_FLUENCY * fluency
        + SCORE_WEIGHT_PRONUNCIATION * pronunciation,
        2,
    )


def get_score_label(score: float) -> str:
    if score >= 90:
        return "Outstanding"
    elif score >= 80:
        return "Excellent"
    elif score >= 70:
        return "Good"
    elif score >= 55:
        return "Fair"
    elif score >= 40:
        return "Developing"
    else:
        return "Needs Practice"


def get_score_color(score: float) -> str:
    """Returns a semantic color tag for frontend use."""
    if score >= 80:
        return "green"
    elif score >= 60:
        return "yellow"
    else:
        return "red"


def compute_trend(scores: list[float]) -> str:
    """Given a list of recent final scores, return trend direction."""
    if len(scores) < 2:
        return "neutral"
    delta = scores[-1] - scores[0]
    if delta > 5:
        return "improving"
    elif delta < -5:
        return "declining"
    return "stable"


def score_summary(grammar: float, fluency: float, pronunciation: float) -> dict:
    final = compute_final_score(grammar, fluency, pronunciation)
    return {
        "grammar":       round(grammar, 1),
        "fluency":       round(fluency, 1),
        "pronunciation": round(pronunciation, 1),
        "final":         final,
        "label":         get_score_label(final),
        "color":         get_score_color(final),
    }