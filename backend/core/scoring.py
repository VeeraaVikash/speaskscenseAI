def compute_final_score(grammar: int, fluency: int, pronunciation: int) -> float:
    return round(0.3 * grammar + 0.3 * fluency + 0.4 * pronunciation, 2)


def get_score_label(score: float) -> str:
    if score >= 85:
        return "Excellent"
    elif score >= 70:
        return "Good"
    elif score >= 55:
        return "Fair"
    else:
        return "Needs Practice"