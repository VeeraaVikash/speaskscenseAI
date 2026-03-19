import sys
sys.path.insert(0, 'd:\\hacka\\speakscense')

from backend.utils.prompts import get_coaching_prompt

# Test the exact scenario from the screenshot
prompt = get_coaching_prompt(
    transcript="hi I am fine",
    scenario="casual-chat",
    level="Beginner",
    language="English",
    conversation_history=[]
)

print("=" * 80)
print("PROMPT BEING SENT TO LLM:")
print("=" * 80)
print(prompt)
print("\n" + "=" * 80)
