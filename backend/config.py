import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

# ── Groq ──────────────────────────────────────────────────────────────────────
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
GROQ_TIMEOUT: int = int(os.getenv("GROQ_TIMEOUT", "30"))
GROQ_MAX_RETRIES: int = int(os.getenv("GROQ_MAX_RETRIES", "3"))

# ── LLM Generation ────────────────────────────────────────────────────────────
LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.5"))
LLM_MAX_TOKENS: int = int(os.getenv("LLM_MAX_TOKENS", "1800"))
LLM_TOP_P: float = float(os.getenv("LLM_TOP_P", "0.9"))

# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./speakscense.db")

# ── CORS ──────────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS: list[str] = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
).split(",")

# ── Scoring weights ───────────────────────────────────────────────────────────
SCORE_WEIGHT_GRAMMAR: float = float(os.getenv("SCORE_WEIGHT_GRAMMAR", "0.35"))
SCORE_WEIGHT_FLUENCY: float = float(os.getenv("SCORE_WEIGHT_FLUENCY", "0.35"))
SCORE_WEIGHT_PRONUNCIATION: float = float(os.getenv("SCORE_WEIGHT_PRONUNCIATION", "0.30"))

# ── Misc ──────────────────────────────────────────────────────────────────────
APP_VERSION: str = "2.0.0"
APP_TITLE: str = "SpeakScense API"
SESSION_HISTORY_LIMIT: int = int(os.getenv("SESSION_HISTORY_LIMIT", "50"))
CONVERSATION_CONTEXT_WINDOW: int = int(os.getenv("CONVERSATION_CONTEXT_WINDOW", "4"))