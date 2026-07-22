from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import SessionLocal
from app.models.telemetry import SolveTelemetry
from app.models.challenge_history import UserChallengeHistory

class HabitScoringService:
    @staticmethod
    def calculate_habit_score(user_id: UUID) -> dict:
        db: Session = SessionLocal()
        try:
            # 1. Wake-Up Consistency (35%)
            # Placeholder until alarm logs exist
            wake_up_consistency = 85.0 

            # 2. Challenge Completion Success (25%)
            total_challenges = db.query(UserChallengeHistory).filter(UserChallengeHistory.user_id == str(user_id)).count()
            if total_challenges > 0:
                # E.g. baseline 50%, add 5% per solve up to 100%
                challenge_success = min(100.0, 50.0 + (total_challenges * 5.0))
            else:
                challenge_success = 0.0

            # 3. Snooze Reduction Rate (20%)
            avg_snoozes = db.query(func.avg(SolveTelemetry.snooze_count)).filter(SolveTelemetry.user_id == user_id).scalar()
            if avg_snoozes is not None:
                snooze_reduction = max(0.0, 100.0 - (float(avg_snoozes) * 25)) # -25% per avg snooze
            else:
                snooze_reduction = 100.0 

            # 4. Sleep Schedule Adherence (20%)
            sleep_adherence = 80.0 # Placeholder until sleep logs exist

            # Weighted calculation
            habit_score = round(
                (0.35 * wake_up_consistency) +
                (0.25 * challenge_success) +
                (0.20 * snooze_reduction) +
                (0.20 * sleep_adherence),
                1
            )

            return {
                "habit_score": habit_score,
                "streak_days": 12, # Placeholder until daily streak tracking is implemented
                "breakdown": {
                    "wake_up_consistency": wake_up_consistency,
                    "challenge_success": round(challenge_success, 1),
                    "snooze_reduction": round(snooze_reduction, 1),
                    "sleep_adherence": sleep_adherence
                }
            }
        finally:
            db.close()

habit_service = HabitScoringService()