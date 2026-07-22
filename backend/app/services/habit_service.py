from datetime import datetime, date, timedelta
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from app.db.session import SessionLocal
from app.models.telemetry import SolveTelemetry
from app.models.challenge_history import UserChallengeHistory

class HabitScoringService:
    @staticmethod
    def calculate_streak_days(db: Session, user_id: UUID) -> int:
        """
        Calculates consecutive days up to today/yesterday on which 
        the user successfully solved an alarm challenge.
        """
        # Fetch distinct dates of successful challenge solves for the user
        solve_dates = db.query(
            cast(UserChallengeHistory.solved_at, Date)
        ).filter(
            UserChallengeHistory.user_id == str(user_id)
        ).distinct().order_by(
            cast(UserChallengeHistory.solved_at, Date).desc()
        ).all()

        if not solve_dates:
            return 0

        dates_set = {row[0] for row in solve_dates}
        today = date.today()
        yesterday = today - timedelta(days=1)

        # Check starting point (today or yesterday for active streak)
        if today in dates_set:
            current_check = today
        elif yesterday in dates_set:
            current_check = yesterday
        else:
            return 0

        streak = 0
        while current_check in dates_set:
            streak += 1
            current_check -= timedelta(days=1)

        return streak

    @staticmethod
    def calculate_habit_score(user_id: UUID) -> dict:
        db: Session = SessionLocal()
        try:
            # 1. Wake-Up Consistency (35%)
            wake_up_consistency = 85.0 

            # 2. Challenge Completion Success (25%)
            total_challenges = db.query(UserChallengeHistory).filter(UserChallengeHistory.user_id == str(user_id)).count()
            if total_challenges > 0:
                challenge_success = min(100.0, 50.0 + (total_challenges * 5.0))
            else:
                challenge_success = 0.0

            # 3. Snooze Reduction Rate (20%)
            avg_snoozes = db.query(func.avg(SolveTelemetry.snooze_count)).filter(SolveTelemetry.user_id == user_id).scalar()
            if avg_snoozes is not None:
                snooze_reduction = max(0.0, 100.0 - (float(avg_snoozes) * 25))
            else:
                snooze_reduction = 100.0 

            # 4. Sleep Schedule Adherence (20%)
            sleep_adherence = 80.0

            # Dynamic Streak Days Calculation
            streak_days = HabitScoringService.calculate_streak_days(db, user_id)

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
                "streak_days": streak_days,
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