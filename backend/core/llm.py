import json
import re
from groq import Groq
from backend.config import GROQ_API_KEY, GROQ_MODEL

client = Groq(api_key=GROQ_API_KEY)


def call_llm(prompt: str, scenario: str = "casual-chat") -> dict:
    """Call Groq LLM with robust error handling and validation"""
    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,  # Lower for more consistent output
            max_tokens=1500,   # Reduce token usage
            top_p=0.9,
        )
        raw = response.choices[0].message.content.strip()
        
        # LAYER 1: Check for error phrases in raw response
        error_phrases = ["api key", "out of credits", "quota", "rate limit", "unauthorized", "anthropic", "failed", "error:", "exception"]
        if any(phrase in raw.lower() for phrase in error_phrases):
            print("❌ ERROR DETECTED IN LLM RESPONSE")
            return _smart_fallback(scenario)
        
        # LAYER 2: Extract JSON more robustly
        raw_clean = re.sub(r"```json|```", "", raw).strip()
        
        # Try to find valid JSON
        json_match = re.search(r'\{(?:[^{}]|(?:\{[^{}]*\}))*\}', raw_clean, re.DOTALL)
        if not json_match:
            print("❌ NO VALID JSON FOUND IN RESPONSE")
            return _smart_fallback(scenario)
        
        json_str = json_match.group(0)
        
        # LAYER 3: Parse JSON with validation
        try:
            result = json.loads(json_str)
        except json.JSONDecodeError as e:
            print(f"❌ JSON PARSE ERROR: {str(e)}")
            return _smart_fallback(scenario)
        
        # LAYER 4: Validate result structure
        if not result or not isinstance(result, dict):
            print("❌ INVALID JSON STRUCTURE")
            return _smart_fallback(scenario)
        
        # LAYER 5: Check all text fields for error keywords
        error_keywords = ["out of credits", "quota exceeded", "api key missing", "rate limit reached"]
        for field in ["good", "better", "best", "response", "task_feedback"]:
            val = result.get(field, "")
            if isinstance(val, str) and any(kw in val.lower() for kw in error_keywords):
                print(f"❌ ERROR KEYWORD IN '{field}'")
                return _smart_fallback(scenario)
        
        # LAYER 6: Ensure all required fields exist with defaults
        defaults = {
            "good": "Your input expressed clearly.",
            "better": "A natural and polished version.",
            "best": "A confident, native-speaker version.",
            "explanation": "Each version shows how your expression can improve step by step.",
            "task_checklist": {"intent": True, "details": True, "politeness": True, "clarity": True},
            "task_feedback": "Good effort! You're making progress.",
            "fluency_note": "Your speech flows naturally.",
            "pronunciation_tip": "Keep your pace steady.",
            "tone_feedback": "Your tone is appropriate.",
            "mid_guidance": "Try to add more specific details next time.",
            "response": "That's great! Tell me more about that.",
            "scores": {"grammar": 72, "fluency": 72, "pronunciation": 72}
        }
        
        # Fill missing fields
        for field, default_val in defaults.items():
            if field not in result or result[field] is None:
                result[field] = default_val
        
        # LAYER 7: Validate and clean text fields
        for field in ["good", "better", "best", "explanation", "task_feedback", "fluency_note", "pronunciation_tip", "tone_feedback", "mid_guidance", "response"]:
            if field in result:
                text = str(result[field]).strip()
                # Remove prefixes that shouldn't be there
                text = re.sub(r'^(I said|I wanted to say|You said|I think|A native speaker|Let me|So|Well|I mean):', '', text, flags=re.IGNORECASE).strip()
                # Remove common error phrases
                text = re.sub(r'(out of credits|API key|anthropic rate limit)', '', text, flags=re.IGNORECASE).strip()
                # Ensure not empty
                result[field] = text if text and len(text) > 2 else defaults[field]
        
        # LAYER 8: Validate scores
        if 'scores' in result and isinstance(result['scores'], dict):
            for score_field in ['grammar', 'fluency', 'pronunciation']:
                try:
                    score = int(result['scores'].get(score_field, 72))
                    result['scores'][score_field] = max(0, min(100, score))
                except (ValueError, TypeError):
                    result['scores'][score_field] = 72
        else:
            result['scores'] = {"grammar": 72, "fluency": 72, "pronunciation": 72}
        
        print("✅ LLM RESPONSE VALID")
        return result
            
    except Exception as e:
        print(f"❌ LLM EXCEPTION: {type(e).__name__}: {str(e)}")
        return _smart_fallback(scenario)


def _smart_fallback(scenario: str = "casual-chat") -> dict:
    """Return a smart fallback that continues the conversation scenario-specifically"""
    print(f"⚠️ USING SMART FALLBACK FOR: {scenario}")
    
    # Scenario-specific responses
    responses = {
        "job-interview": "That's excellent relevant experience. How have you applied those skills in challenging situations?",
        "business-meeting": "I see. How do you envision this aligning with our quarterly objectives?",
        "casual-chat": "That's great! I'd love to hear more about that. What else has been going on?",
        "public-speaking": "Good point. Can you provide a concrete example that illustrates that?",
        "customer-service": "I understand. What would be the ideal outcome from your perspective?",
        "negotiation": "I appreciate that perspective. Could you elaborate on the mutual benefits for both sides?"
    }
    
    response = responses.get(scenario, "That sounds great! Tell me more about that.")
    
    return {
        "good": "You expressed yourself clearly in this context.",
        "better": "A more natural and confident way to express that.",
        "best": "A perfect, native-speaker way to communicate your point.",
        "explanation": "Each progression shows improved clarity, confidence, and natural phrasing.",
        "task_checklist": {
            "intent": True,
            "details": False,
            "politeness": True,
            "clarity": True,
        },
        "task_feedback": "Good effort expressing yourself! Keep practicing to add more detail.",
        "fluency_note": "Your speech is easy to understand. Work on smoother transitions.",
        "pronunciation_tip": "Speak at a natural pace and enunciate key words clearly.",
        "tone_feedback": f"Your tone fits well with a {scenario.replace('-', ' ')} context.",
        "mid_guidance": "Try expanding your response with specific examples or details.",
        "response": response,
        "scores": {
            "grammar": 72,
            "fluency": 72,
            "pronunciation": 72
        },
    }