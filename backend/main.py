from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session

from backend.config import ALLOWED_ORIGINS
from backend.db.database import init_db, get_db, SessionLog
from backend.core.llm import call_llm
from backend.core.level import detect_level
from backend.core.scoring import compute_final_score
from backend.core.tasks import generate_daily_tasks, generate_summary
from backend.utils.prompts import get_coaching_prompt

app = FastAPI(title="SpeakScense API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()


class TextInput(BaseModel):
    text: str
    scenario: str = "General"
    level: str = "Intermediate"
    language: str = "English"
    conversation_history: List[dict] = []  # Previous messages for context


class LevelTestInput(BaseModel):
    responses: List[str]
    language: str = "English"


@app.post("/process-text")
async def process_text(body: TextInput, db: Session = Depends(get_db)):
    prompt = get_coaching_prompt(body.text, body.scenario, body.level, body.language, body.conversation_history)
    result = call_llm(prompt, scenario=body.scenario)

    scores = result.get("scores", {"grammar": 50, "fluency": 50, "pronunciation": 50})
    final = compute_final_score(
        scores.get("grammar", 50),
        scores.get("fluency", 50),
        scores.get("pronunciation", 50),
    )

    log = SessionLog(
        user_input=body.text,
        scenario=body.scenario,
        level=body.level,
        grammar_score=scores.get("grammar", 50),
        fluency_score=scores.get("fluency", 50),
        task_score=scores.get("pronunciation", 50),
        final_score=final,
    )
    db.add(log)
    db.commit()

    return {
        "transcript": body.text,
        **result,
        "final_score": final,
    }


@app.post("/detect-level")
async def detect_level_endpoint(body: LevelTestInput):
    if len(body.responses) < 1:
        raise HTTPException(status_code=400, detail="At least 1 response required")
    result = detect_level(body.responses)
    return result


@app.get("/session-summary")
async def session_summary(db: Session = Depends(get_db)):
    logs = db.query(SessionLog).order_by(SessionLog.timestamp.desc()).limit(20).all()
    log_list = [
        {
            "scenario": l.scenario,
            "level": l.level,
            "final_score": l.final_score,
        }
        for l in logs
    ]
    return generate_summary(log_list)


@app.get("/daily-tasks")
async def daily_tasks(
    level: str = "Intermediate",
    scenario: str = "General",
    language: str = "English",
):
    return generate_daily_tasks(level, scenario, language)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "SpeakScense API"}