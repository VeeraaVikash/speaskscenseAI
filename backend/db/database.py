from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Index
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime, timezone
from backend.config import DATABASE_URL

# ── Engine ────────────────────────────────────────────────────────────────────
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ── Models ────────────────────────────────────────────────────────────────────
class SessionLog(Base):
    __tablename__ = "session_logs"

    id            = Column(Integer, primary_key=True, index=True)
    user_input    = Column(Text, nullable=False)
    scenario      = Column(String(64), nullable=False, index=True)
    level         = Column(String(32), nullable=False, index=True)
    language      = Column(String(32), nullable=False, default="English")
    grammar_score = Column(Float, nullable=False)
    fluency_score = Column(Float, nullable=False)
    task_score    = Column(Float, nullable=False)
    final_score   = Column(Float, nullable=False)
    score_label   = Column(String(32), nullable=True)
    timestamp     = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    __table_args__ = (
        Index("ix_session_scenario_level", "scenario", "level"),
        Index("ix_session_timestamp_score", "timestamp", "final_score"),
    )

    def to_dict(self) -> dict:
        return {
            "id":            self.id,
            "scenario":      self.scenario,
            "level":         self.level,
            "language":      self.language,
            "grammar_score": self.grammar_score,
            "fluency_score": self.fluency_score,
            "task_score":    self.task_score,
            "final_score":   self.final_score,
            "score_label":   self.score_label,
            "timestamp":     self.timestamp.isoformat() if self.timestamp else None,
        }


class LevelAssessment(Base):
    __tablename__ = "level_assessments"

    id              = Column(Integer, primary_key=True, index=True)
    language        = Column(String(32), nullable=False, default="English")
    detected_level  = Column(String(32), nullable=False)
    grammar_score   = Column(Float, nullable=True)
    fluency_score   = Column(Float, nullable=True)
    vocabulary_score= Column(Float, nullable=True)
    reasoning       = Column(Text, nullable=True)
    timestamp       = Column(DateTime, default=lambda: datetime.now(timezone.utc))


# ── Lifecycle ─────────────────────────────────────────────────────────────────
def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()