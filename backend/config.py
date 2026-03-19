import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = "llama-3.1-8b-instant"
DATABASE_URL = "sqlite:///./speakscense.db"
WHISPER_MODEL = "base"
ALLOWED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]