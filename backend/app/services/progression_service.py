from uuid import UUID
from sqlalchemy.orm import Session
from app.models.telemetry import SolveTelemetry
from app.models.user import UserProfile

class DifficultyProgressionService:
    TIERS = ["beginner", "easy", "medium", "hard", "expert"]

    @classmethod
    def evaluate_and_update_user_difficulty(cls, db: Session, user_id: UUID) -> str | None:
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if not profile:
            return None

        current_diff = profile.difficulty_preference.lower()
        curr_idx = cls.TIERS.index(current_diff) if current_diff in cls.TIERS else 2

        # Fetch recent 3 solve telemetry entries
        recent = db.query(SolveTelemetry).filter(
            SolveTelemetry.user_id == user_id
        ).order_by(SolveTelemetry.created_at.desc()).limit(3).all()

        if len(recent) < 3:
            return current_diff

        # Check for Promotion criteria (3 fast first-try solves)
        fast_solves = sum(1 for r in recent if r.solve_time_seconds <= 10.0 and r.attempts == 1)
        if fast_solves == 3 and curr_idx < len(cls.TIERS) - 1:
            new_diff = cls.TIERS[curr_idx + 1]
            profile.difficulty_preference = new_diff
            db.commit()
            return new_diff

        # Check for Demotion criteria (slow solve times)
        slow_solves = sum(1 for r in recent if r.solve_time_seconds >= 45.0 or r.attempts > 2)
        if slow_solves >= 2 and curr_idx > 0:
            new_diff = cls.TIERS[curr_idx - 1]
            profile.difficulty_preference = new_diff
            db.commit()
            return new_diff

        return current_diff

progression_service = DifficultyProgressionService()