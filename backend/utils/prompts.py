def get_coaching_prompt(transcript: str, scenario: str, level: str, language: str, conversation_history=None) -> str:
    context = ""
    if conversation_history and len(conversation_history) > 0:
        context = "RECENT CHAT:\n"
        for msg in conversation_history[-2:]:
            role = "User" if msg.get('role') == 'user' else "Coach"
            context += f"{role}: {msg.get('text', '')[:60]}\n"
        context += "\n"

    return f"""SYSTEM: You are a language coach. Your task is to analyze the learner's recent input, provide corrections, scores, and generate a natural conversational follow-up question.

LEARNER INPUT: "{transcript}"
SCENARIO: {scenario}
LEVEL: {level}
LANGUAGE: {language}
{context}

CRITICAL RULES:
- Output MUST be valid JSON only.
- DO NOT add "I said", "I wanted to say", "A native speaker would say" - just output the required text.
- Keep the user's original meaning and main words for corrections.
- The 'response' field MUST be a dynamic, natural conversational follow-up question in {language} that continues the {scenario} context based on what the user just said. Do NOT use generic predefined questions.
- Do not repeat the template placeholders (like <...>), replace them with actual generated content tailored to the user's input.

GENERATE EXACTLY THIS JSON FORMAT. All values must be in {language} unless otherwise specified.
{{
  "good": "<The user's input with ONLY grammar fixes, keeping original meaning>",
  "better": "<A more natural version of the input with better flow>",
  "best": "<A perfect native-speaker version of the input with confidence>",
  "explanation": "<Brief explanation of improvements from good to best>",
  "task_checklist": {{"intent": true, "details": true, "politeness": true, "clarity": true}},
  "task_feedback": "<Specific praise acknowledging their effort>",
  "fluency_note": "<One positive comment about how naturally they spoke based on text rhythm>",
  "pronunciation_tip": "<One specific, helpful tip for pronouncing the tricky words in their input>",
  "tone_feedback": "<Feedback on whether their tone fits the {scenario}>",
  "mid_guidance": "<ONE specific actionable tip to improve their next response>",
  "response": "<A dynamic, natural conversational follow-up response and question continuing the {scenario} scenario based on what they just said>",
  "scores": {{"grammar": 72, "fluency": 72, "pronunciation": 72}}
}}

GENERATE JSON NOW:"""


def get_level_detection_prompt(responses: list, language: str = "English") -> str:
    joined = "\n".join([f"Answer {i+1}: {r}" for i, r in enumerate(responses)])
    return f"""You are a strict language assessment expert. Evaluate these spoken answers and return ONLY a JSON object.

Answers:
{joined}

Assessment criteria:
- Beginner: under 8 words, broken grammar, very basic vocabulary
- Intermediate: complete sentences, some errors, moderate vocabulary  
- Advanced: complex sentences, varied vocabulary, detailed answers, natural flow

Return ONLY valid JSON, no other text:
{{
  "level": "Beginner or Intermediate or Advanced",
  "grammar_score": 0-100,
  "fluency_score": 0-100,
  "vocabulary_score": 0-100,
  "reasoning": "2 sentences explaining the assessment"
}}"""


def get_daily_tasks_prompt(level: str, scenario: str, language: str = "English") -> str:
    return f"""Generate 3 practice tasks for a {level} language learner who practiced "{scenario}" today.
All tasks must be in {language}. Return ONLY valid JSON:
{{
  "tasks": [
    {{"id": 1, "task": "specific speaking task in {language}", "type": "speaking"}},
    {{"id": 2, "task": "specific writing task in {language}", "type": "writing"}},
    {{"id": 3, "task": "specific listening task in {language}", "type": "listening"}}
  ],
  "motivation": "encouraging message in {language}"
}}"""


def get_summary_prompt(logs: list, language: str = "English") -> str:
    log_text = "\n".join([
        f"Scenario: {l['scenario']}, Level: {l['level']}, Score: {l['final_score']}"
        for l in logs
    ])
    return f"""Summarize these language learning sessions. Write all fields in {language}.

{log_text}

Return ONLY valid JSON:
{{
  "total_sessions": <number>,
  "average_score": <float>,
  "strengths": ["strength1", "strength2"],
  "improvements": ["area1", "area2"],
  "message": "personalized closing message in {language}"
}}"""