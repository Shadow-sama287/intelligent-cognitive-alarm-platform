from uuid import UUID
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.telemetry import SolveTelemetry

class TelemetryService:
    @staticmethod
    def log_solve(user_id: UUID, category: str, difficulty: str, solve_time: float, attempts: int, snooze_count: int):
        db: Session = SessionLocal()
        try:
            entry = SolveTelemetry(
                user_id=user_id,
                category=category,
                difficulty=difficulty,
                solve_time_seconds=solve_time,
                attempts=attempts,
                snooze_count=snooze_count
            )
            db.add(entry)
            db.commit()
        finally:
            db.close()

    @staticmethod
    def get_user_solve_history(user_id: UUID, limit: int = 10) -> list:
        db: Session = SessionLocal()
        try:
            records = db.query(SolveTelemetry).filter(SolveTelemetry.user_id == user_id).order_by(SolveTelemetry.created_at.desc()).limit(limit).all()
            return [{"solve_time": r.solve_time_seconds, "attempts": r.attempts, "snooze_count": r.snooze_count, "difficulty": r.difficulty} for r in records]
        finally:
            db.close()

telemetry_service = TelemetryService()