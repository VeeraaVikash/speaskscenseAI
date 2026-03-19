"""
Prompt engineering module for SpeakScense.
All prompts use explicit rubrics so the LLM generates real, differentiated scores.
"""

from backend.config import CONVERSATION_CONTEXT_WINDOW


# ── Scoring rubric injected into every coaching prompt ────────────────────────
_SCORING_RUBRIC = """
SCORING RUBRIC (apply strictly, scores must differ based on actual quality):
Grammar  (0-100): 90-100=near-perfect, 75-89=minor errors, 55-74=noticeable errors, 30-54=frequent errors, 0-29=broken grammar
Fluency  (0-100): 90-100=natural native flow, 75-89=mostly smooth, 55-74=choppy/hesitant, 30-54=very fragmented, 0-29=incoherent
Pronunciation (0-100): Infer from word complexity, sentence length, and vocabulary level used.
  90-100=clear advanced vocab used correctly, 75-89=good articulation, 55-74=some mispronunciations likely, 30-54=heavy accent interference likely, 0-29=very hard to understand
IMPORTANT: Scores MUST reflect the actual quality. Do NOT default to 72. A beginner one-liner should score 30-50. A fluent complex sentence should score 80-95.
"""


def get_coaching_prompt(
    transcript: str,
    scenario: str,
    level: str,
    language: str,
    conversation_history: list | None = None,
) -> str:
    # Build context window from recent history
    context = ""
    if conversation_history:
        recent = conversation_history[-CONVERSATION_CONTEXT_WINDOW:]
        if recent:
            context = "CONVERSATION HISTORY (most recent first):\n"
            for msg in reversed(recent):
                role = "Learner" if msg.get("role") == "user" else "Coach"
                text = str(msg.get("text", ""))[:80]
                context += f"  {role}: {text}\n"
            context += "\n"

    word_count = len(transcript.split())
    complexity_hint = (
        "very short/simple input" if word_count < 6
        else "moderate input" if word_count < 15
        else "detailed input"
    )

    return f"""You are an expert language coach AI. Analyze the learner's input and return a precise JSON evaluation.

LEARNER INPUT: "{transcript}"
INPUT ANALYSIS: {word_count} words — {complexity_hint}
SCENARIO: {scenario}
PROFICIENCY LEVEL: {level}
TARGET LANGUAGE: {language}
{context}
{_SCORING_RUBRIC}

RULES:
1. Output MUST be valid JSON only — no markdown, no explanation outside JSON.
2. All text fields must be in {language}.
3. "good/better/best" must keep the learner's core meaning but improve progressively.
4. "response" must be a natural, context-aware follow-up question for {scenario} — NOT generic.
5. Scores MUST be integers and MUST vary based on actual quality per rubric above.
6. Do NOT use placeholder text like "<...>" — generate real content.

RETURN EXACTLY:
{{
  "good": "grammar-corrected version of input, same meaning",
  "better": "more natural rephrasing with better flow",
  "best": "confident native-speaker version",
  "explanation": "2-sentence explanation of the progression from good to best",
  "task_checklist": {{
    "intent": true or false,
    "details": true or false,
    "politeness": true or false,
    "clarity": true or false
  }},
  "task_feedback": "specific 1-sentence praise referencing what they said",
  "fluency_note": "1 specific observation about their sentence rhythm or structure",
  "pronunciation_tip": "1 actionable tip for a specific word or sound in their input",
  "tone_feedback": "1 sentence on whether their tone suits {scenario}",
  "mid_guidance": "1 concrete tip for their next response in this scenario",
  "response": "natural follow-up question/comment for {scenario} based on what they just said",
  "scores": {{
    "grammar": <integer 0-100 per rubric>,
    "fluency": <integer 0-100 per rubric>,
    "pronunciation": <integer 0-100 per rubric>
  }}
}}"""


def get_level_detection_prompt(responses: list, language: str = "English") -> str:
    joined = "\n".join([f"Response {i+1} ({len(r.split())} words): {r}" for i, r in enumerate(responses)])

    return f"""You are a certified language proficiency examiner. Assess these learner responses and assign a CEFR-aligned level.

TARGET LANGUAGE: {language}
LEARNER RESPONSES:
{joined}

ASSESSMENT RUBRIC:
- Beginner (A1-A2): <8 words avg, broken grammar, basic/missing vocab, minimal coherence
- Intermediate (B1-B2): Complete sentences, some grammatical errors, moderate vocabulary, clear meaning
- Advanced (C1-C2): Complex sentences, varied sophisticated vocabulary, natural flow, detailed expression

Evaluate each dimension independently. Return ONLY valid JSON:
{{
  "level": "Beginner" or "Intermediate" or "Advanced",
  "grammar_score": <integer 0-100>,
  "fluency_score": <integer 0-100>,
  "vocabulary_score": <integer 0-100>,
  "reasoning": "2 sentences citing specific evidence from their responses"
}}"""


def get_daily_tasks_prompt(level: str, scenario: str, language: str = "English") -> str:
    return f"""You are a language learning curriculum designer. Create 3 targeted practice tasks.

LEARNER LEVEL: {level}
TODAY'S SCENARIO PRACTICED: {scenario}
TARGET LANGUAGE: {language}

Tasks must:
- Be specific and actionable (not vague)
- Match the {level} difficulty
- Build on the {scenario} context
- All be written in {language}

Return ONLY valid JSON:
{{
  "tasks": [
    {{"id": 1, "task": "specific speaking practice task", "type": "speaking", "duration_minutes": 5}},
    {{"id": 2, "task": "specific writing practice task", "type": "writing", "duration_minutes": 10}},
    {{"id": 3, "task": "specific listening practice task", "type": "listening", "duration_minutes": 10}}
  ],
  "focus_area": "the primary skill to work on based on level and scenario",
  "motivation": "personalized encouraging message in {language} referencing the {scenario} practice"
}}"""


def get_summary_prompt(logs: list, language: str = "English") -> str:
    if not logs:
        return ""

    scores = [l.get("final_score", 0) for l in logs]
    avg = round(sum(scores) / len(scores), 1) if scores else 0
    scenarios = list({l.get("scenario", "") for l in logs})
    log_text = "\n".join([
        f"- Scenario: {l.get('scenario','?')}, Level: {l.get('level','?')}, Score: {l.get('final_score', 0):.1f}/100"
        for l in logs
    ])

    return f"""You are a language learning progress analyst. Summarize these sessions with actionable insights.

SESSION DATA ({len(logs)} sessions, avg score: {avg}):
{log_text}
SCENARIOS PRACTICED: {', '.join(scenarios)}

Write all text fields in {language}. Return ONLY valid JSON:
{{
  "total_sessions": {len(logs)},
  "average_score": {avg},
  "highest_score": {max(scores) if scores else 0},
  "lowest_score": {min(scores) if scores else 0},
  "strengths": ["specific strength 1 with evidence", "specific strength 2"],
  "improvements": ["specific area to improve 1", "specific area to improve 2"],
  "recommended_scenario": "best next scenario to practice based on weak areas",
  "message": "personalized 2-sentence motivational closing in {language}"
}}"""