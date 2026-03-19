"""
SpeakScense API — Enterprise FastAPI entry point.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from sqlalchemy.orm import Session

from backend.config import ALLOWED_ORIGINS, APP_TITLE, APP_VERSION
from backend.db.database import init_db, get_db, SessionLog, LevelAssessment
from backend.core.llm import call_llm
from backend.core.level import detect_level
from backend.core.scoring import compute_final_score, get_score_label, get_score_color, score_summary
from backend.core.tasks import generate_daily_tasks, generate_summary
from backend.utils.prompts import get_coaching_prompt

logger = logging.getLogger("speakscense.main")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 SpeakScense API starting up...")
    init_db()
    logger.info("✅ Database initialized")
    yield
    logger.info("🛑 SpeakScense API shutting down")


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title=APP_TITLE,
    version=APP_VERSION,
    description="Enterprise-grade AI language coaching API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global error handler ──────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url}: {type(exc).__name__}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred. Please try again."},
    )


# ── Request schemas ───────────────────────────────────────────────────────────
class TextInput(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)
    scenario: str = Field(default="General", max_length=64)
    level: str = Field(default="Intermediate", max_length=32)
    language: str = Field(default="English", max_length=32)
    conversation_history: List[dict] = Field(default_factory=list)

    @field_validator("level")
    @classmethod
    def validate_level(cls, v):
        allowed = ["Beginner", "Intermediate", "Advanced"]
        if v not in allowed:
            raise ValueError(f"Level must be one of {allowed}")
        return v


class LevelTestInput(BaseModel):
    responses: List[str] = Field(..., min_length=1, max_length=10)
    language: str = Field(default="English", max_length=32)

    @field_validator("responses")
    @classmethod
    def validate_responses(cls, v):
        clean = [r.strip() for r in v if r.strip()]
        if not clean:
            raise ValueError("At least one non-empty response is required")
        return clean


# ── Routes ────────────────────────────────────────────────────────────────────
@app.post("/process-text", summary="Analyze learner input and return coaching feedback")
async def process_text(body: TextInput, db: Session = Depends(get_db)):
    prompt = get_coaching_prompt(
        body.text, body.scenario, body.level,
        body.language, body.conversation_history
    )
    result = call_llm(prompt, scenario=body.scenario, is_coaching=True)

    raw_scores = result.get("scores", {})
    grammar      = float(raw_scores.get("grammar", 50))
    fluency      = float(raw_scores.get("fluency", 50))
    pronunciation= float(raw_scores.get("pronunciation", 50))

    summary = score_summary(grammar, fluency, pronunciation)

    # Persist to DB
    log = SessionLog(
        user_input    = body.text,
        scenario      = body.scenario,
        level         = body.level,
        language      = body.language,
        grammar_score = grammar,
        fluency_score = fluency,
        task_score    = pronunciation,
        final_score   = summary["final"],
        score_label   = summary["label"],
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    return {
        "session_id":  log.id,
        "transcript":  body.text,
        **result,
        "score_summary": summary,
        "final_score": summary["final"],
    }


@app.post("/detect-level", summary="Detect learner proficiency level from sample responses")
async def detect_level_endpoint(body: LevelTestInput, db: Session = Depends(get_db)):
    result = detect_level(body.responses, body.language)

    assessment = LevelAssessment(
        language         = body.language,
        detected_level   = result["level"],
        grammar_score    = result.get("grammar_score"),
        fluency_score    = result.get("fluency_score"),
        vocabulary_score = result.get("vocabulary_score"),
        reasoning        = result.get("reasoning"),
    )
    db.add(assessment)
    db.commit()

    return result


@app.get("/session-summary", summary="Get AI-generated summary of recent sessions")
async def session_summary(
    limit: int = 20,
    language: str = "English",
    db: Session = Depends(get_db),
):
    if limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="Limit must be between 1 and 100")

    logs = db.query(SessionLog).order_by(SessionLog.timestamp.desc()).limit(limit).all()
    log_list = [
        {
            "scenario":    l.scenario,
            "level":       l.level,
            "final_score": l.final_score,
        }
        for l in logs
    ]
    return generate_summary(log_list, language)


@app.get("/session-history", summary="Get paginated session history")
async def session_history(
    page: int = 1,
    per_page: int = 10,
    db: Session = Depends(get_db),
):
    if page < 1:
        raise HTTPException(status_code=400, detail="Page must be >= 1")
    if per_page < 1 or per_page > 50:
        raise HTTPException(status_code=400, detail="per_page must be between 1 and 50")

    offset = (page - 1) * per_page
    total = db.query(SessionLog).count()
    logs = (
        db.query(SessionLog)
        .order_by(SessionLog.timestamp.desc())
        .offset(offset)
        .limit(per_page)
        .all()
    )

    return {
        "page":       page,
        "per_page":   per_page,
        "total":      total,
        "sessions":   [l.to_dict() for l in logs],
    }


@app.get("/daily-tasks", summary="Get personalized daily practice tasks")
async def daily_tasks(
    level: str = "Intermediate",
    scenario: str = "General",
    language: str = "English",
):
    return generate_daily_tasks(level, scenario, language)


@app.get("/health", summary="Health check")
async def health():
    return {
        "status":  "ok",
        "service": APP_TITLE,
        "version": APP_VERSION,
    }