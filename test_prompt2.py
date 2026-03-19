import sys; sys.path.insert(0, 'd:\\hacka\\speakscense')
from backend.utils.prompts import get_coaching_prompt
p = get_coaching_prompt("hi I am fine", "casual-chat", "Beginner", "English", [])
print("New Prompt Uses SYSTEM:" if "SYSTEM:" in p else "Old Prompt - No SYSTEM:")
print(p[:200])
