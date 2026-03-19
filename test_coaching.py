#!/usr/bin/env python3
"""
Test script to validate the coaching system works across all 5 languages
and generates real, context-aware responses without dummy data.
"""
import json
import sys
sys.path.insert(0, 'd:\\hacka\\speakscense')

from backend.utils.prompts import get_coaching_prompt
from backend.core.llm import call_llm

# Test scenarios and languages
LANGUAGES = ['English', 'French', 'Hindi', 'Chinese', 'German']
SCENARIOS = {
    'job-interview': {
        'English': "I have 5 years of experience in software development",
        'French': "J'ai 5 ans d'expérience en développement logiciel",
        'Hindi': "मेरे पास सॉफ्टवेयर विकास में 5 साल का अनुभव है",
        'Chinese': "我在软件开发方面有5年的经验",
        'German': "Ich habe 5 Jahre Erfahrung in der Softwareentwicklung"
    },
    'customer-service': {
        'English': "I'm sorry to hear about your internet problem. Let me check your account quickly.",
        'French': "Je suis désolé d'apprendre votre problème Internet. Laissez-moi vérifier votre compte.",
        'Hindi': "मुझे आपकी इंटरनेट समस्या के बारे में सुनकर खेद है। मुझे आपका खाता जांचने दीजिए।",
        'Chinese': "很遗憾听说您的互联网问题。让我快速检查您的账户。",
        'German': "Es tut mir leid, von Ihrem Internetproblem zu hören. Lassen Sie mich Ihr Konto schnell überprüfen."
    }
}

def test_language(language, scenario_name, user_input):
    """Test a single language with real input"""
    print(f"\n{'='*60}")
    print(f"Testing: {language} | Scenario: {scenario_name}")
    print(f"User Input: {user_input}")
    print('='*60)
    
    # Simulate conversation history
    context_history = [
        {"role": "ai", "text": "Hello! Tell me about your experience."},
        {"role": "user", "text": "I have worked for 5 years"}
    ]
    
    try:
        # Get the prompt
        prompt = get_coaching_prompt(user_input, scenario_name, "Intermediate", language, context_history)
        print(f"\n✓ Prompt generated for {language}")
        
        # Call LLM
        print(f"Calling LLM for {language}...")
        result = call_llm(prompt)
        
        # Validate result
        required_fields = ["good", "better", "best", "explanation", "task_feedback", 
                          "fluency_note", "pronunciation_tip", "tone_feedback", 
                          "mid_guidance", "response", "scores", "task_checklist"]
        
        missing = [f for f in required_fields if f not in result]
        errors = []
        
        if missing:
            errors.append(f"Missing fields: {missing}")
        
        # Check for dummy responses
        if result.get("good") == "You spoke — keep going.":
            errors.append("❌ DUMMY RESPONSE: Using fallback 'good' value")
        
        if result.get("response") == "Please try again.":
            errors.append("❌ DUMMY RESPONSE: Generic 'response' field")
        
        # Validate scores are real (not all same)
        scores = result.get("scores", {})
        if scores.get("grammar") == 50 and scores.get("fluency") == 50 and scores.get("pronunciation") == 50:
            errors.append("⚠️  POTENTIAL DUMMY: All scores are exactly 50")
        
        # Check language
        response_text = result.get("response", "")
        good_text = result.get("good", "")
        
        if errors:
            print(f"\n❌ ERRORS for {language}:")
            for error in errors:
                print(f"  {error}")
        else:
            print(f"\n✓ VALID RESPONSE for {language}")
        
        # Show scores
        print(f"\nScores:")
        print(f"  Grammar:      {scores.get('grammar', 'N/A')}/100")
        print(f"  Fluency:      {scores.get('fluency', 'N/A')}/100")
        print(f"  Pronunciation: {scores.get('pronunciation', 'N/A')}/100")
        
        print(f"\nResponse preview (first 80 chars): {response_text[:80]}...")
        print(f"Good version: {good_text[:80]}...")
        
        return len(errors) == 0
        
    except Exception as e:
        print(f"\n❌ EXCEPTION for {language}: {type(e).__name__}: {str(e)}")
        return False

def main():
    """Run tests across all languages"""
    print("\n" + "="*60)
    print("TESTING SPEAKSCENSE COACHING SYSTEM - ALL 5 LANGUAGES")
    print("="*60)
    
    results = {}
    
    # Test job interview
    print("\n>>> SCENARIO: Job Interview")
    for lang in LANGUAGES:
        user_input = SCENARIOS['job-interview'].get(lang, SCENARIOS['job-interview']['English'])
        results[f"job-interview_{lang}"] = test_language(lang, "job-interview", user_input)
    
    # Test customer service
    print("\n\n>>> SCENARIO: Customer Service")
    for lang in LANGUAGES:
        user_input = SCENARIOS['customer-service'].get(lang, SCENARIOS['customer-service']['English'])
        results[f"customer-service_{lang}"] = test_language(lang, "customer-service", user_input)
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    print(f"\nPassed: {passed}/{total}")
    
    individual = {}
    for test_name, passed in results.items():
        scenario, lang = test_name.rsplit('_', 1)
        if lang not in individual:
            individual[lang] = {"passed": 0, "total": 0}
        individual[lang]["total"] += 1
        if passed:
            individual[lang]["passed"] += 1
    
    print("\nBy Language:")
    for lang in LANGUAGES:
        stats = individual.get(lang, {"passed": 0, "total": 0})
        print(f"  {lang:12} {stats['passed']}/{stats['total']}")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
