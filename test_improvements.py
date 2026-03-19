import sys
sys.path.insert(0, 'd:\\hacka\\speakscense')

from backend.utils.prompts import get_coaching_prompt
from backend.core.llm import call_llm

def test_scenario(language, scenario, user_input):
    """Test a specific user input in a scenario"""
    print("\n" + "="*60)
    print("SCENARIO: {} | LANGUAGE: {}".format(scenario, language))
    print("USER SAID: '{}'".format(user_input))
    print("="*60)
    
    try:
        # Simulate conversation history
        history = [
            {"role": "ai", "text": "Hello! Tell me about yourself."},
            {"role": "user", "text": user_input}
        ]
        
        prompt = get_coaching_prompt(user_input, scenario, "Intermediate", language, [])
        result = call_llm(prompt)
        
        print("\n[GOOD VERSION]")
        print(result.get('good', 'N/A'))
        
        print("\n[BETTER VERSION]")
        print(result.get('better', 'N/A'))
        
        print("\n[BEST VERSION]")
        print(result.get('best', 'N/A'))
        
        print("\n[COACH RESPONSE]")
        print(result.get('response', 'N/A'))
        
        scores = result.get('scores', {})
        print("\n[SCORES]")
        print("Grammar: {} | Fluency: {} | Pronunciation: {}".format(
            scores.get('grammar', 0),
            scores.get('fluency', 0),
            scores.get('pronunciation', 0)
        ))
        
        print("\n[FEEDBACK]")
        print(result.get('task_feedback', 'N/A'))
        
        return True
        
    except Exception as e:
        print("[ERROR] {}".format(str(e)))
        import traceback
        traceback.print_exc()
        return False

print("\nTEST 1: BUSINESS MEETING - ENGLISH")
test_scenario('English', 'business-meeting', 'I am Harish')

print("\n\nTEST 2: JOB INTERVIEW - ENGLISH")
test_scenario('English', 'job-interview', 'i have 5 years experience')

print("\n\nTEST 3: CUSTOMER SERVICE - FRENCH")
test_scenario('French', 'customer-service', 'Je peux vous aider')

print("\n\nTEST 4: CASUAL CHAT - HINDI")
test_scenario('Hindi', 'casual-chat', 'Mera naam Harish hai')

print("\n\nTEST 5: PUBLIC SPEAKING - GERMAN")
test_scenario('German', 'public-speaking', 'Ich bin software entwickler')
