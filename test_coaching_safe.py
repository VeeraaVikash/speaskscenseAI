import sys
sys.path.insert(0, 'd:\\hacka\\speakscense')

from backend.utils.prompts import get_coaching_prompt
from backend.core.llm import call_llm

LANGUAGES = ['English', 'French', 'Hindi', 'Chinese', 'German']

def test_single(language, scenario, text):
    """Test single language"""
    print("\n[TEST] Testing {} - {}".format(language, scenario))
    print("Input: {}".format(text[:50]))
    
    try:
        prompt = get_coaching_prompt(text, scenario, "Intermediate", language, [])
        result = call_llm(prompt)
        
        scores = result.get('scores', {})
        print("Grammar: {} | Fluency: {} | Pronunciation: {}".format(
            scores.get('grammar', 'ERR'),
            scores.get('fluency', 'ERR'),
            scores.get('pronunciation', 'ERR')
        ))
        
        is_real = not (scores.get('grammar') == 50 and scores.get('fluency') == 50 and scores.get('pronunciation') == 50)
        if is_real:
            print("[PASS] Real scores detected")
        else:
            print("[FAIL] Dummy scores (all 50)")
        
        return is_real
        
    except Exception as e:
        print("[ERROR] {}".format(str(e)))
        return False

# Test all languages
print("="*60)
print("SPEAKSCENSE MULTILINGUAL TEST")
print("="*60)

passed = 0
for lang in LANGUAGES:
    if lang == 'English':
        text = "I have 5 years of experience"
    elif lang == 'French':
        text = "J'ai 5 ans d'experience"
    elif lang == 'Hindi':
        text = "Mera 5 saal ka anubhav hai"
    elif lang == 'Chinese':
        text = "Wo you wu nian experience"
    else:  # German
        text = "Ich habe 5 Jahre Erfahrung"
    
    if test_single(lang, "job-interview", text):
        passed += 1

print("\n" + "="*60)
print("RESULTS: {}/{}".format(passed, len(LANGUAGES)))
