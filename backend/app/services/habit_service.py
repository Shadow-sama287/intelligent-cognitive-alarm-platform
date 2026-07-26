from datetime import datetime, date, timedelta, time
from uuid import UUID
from zoneinfo import ZoneInfo
import numpy as np
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from app.db.session import SessionLocal
from app.models.telemetry import SolveTelemetry
from app.models.challenge_history import UserChallengeHistory
from app.models.alarm import Alarm
from app.models.user import UserProfile

class HabitScoringService:
    @staticmethod
    def get_user_timezone(db: Session, user_id: UUID) -> str:
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        return profile.time_zone if profile and profile.time_zone else "UTC"

    @staticmethod
    def calculate_streak_days(db: Session, user_id: UUID) -> int:
        """
        Calculates consecutive days up to today/yesterday on which 
        the user successfully solved an alarm challenge.
        """
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
    def calculate_wake_up_consistency(db: Session, user_id: UUID) -> float:
        """
        Calculates wake-up consistency percentage by comparing scheduled alarm times
        against actual solve timestamps, converted to the user's local timezone.
        """
        user_tz_str = HabitScoringService.get_user_timezone(db, user_id)
        try:
            user_tz = ZoneInfo(user_tz_str)
        except Exception:
            user_tz = ZoneInfo("UTC")

        active_alarms = db.query(Alarm).filter(
            Alarm.user_id == user_id,
            Alarm.is_active == True
        ).all()

        if not active_alarms:
            return 100.0

        # Parse alarm time strings (e.g. "07:00")
        target_minutes_list = []
        for alarm in active_alarms:
            try:
                parts = alarm.alarm_time.split(":")
                target_minutes_list.append(int(parts[0]) * 60 + int(parts[1]))
            except (ValueError, AttributeError):
                continue

        if not target_minutes_list:
            return 100.0

        avg_target_minutes = sum(target_minutes_list) / len(target_minutes_list)

        # Fetch recent user solve logs (last 30 days)
        cutoff_date = datetime.utcnow() - timedelta(days=30)
        solves = db.query(UserChallengeHistory).filter(
            UserChallengeHistory.user_id == str(user_id),
            UserChallengeHistory.solved_at >= cutoff_date
        ).all()

        if not solves:
            return 100.0

        variances = []
        for solve in solves:
            # Convert UTC solved_at timestamp to the user's local timezone
            utc_dt = solve.solved_at.replace(tzinfo=ZoneInfo("UTC"))
            local_dt = utc_dt.astimezone(user_tz)

            solve_minutes = local_dt.hour * 60 + local_dt.minute
            diff = abs(solve_minutes - avg_target_minutes)

            # Penalize variance
            if diff <= 10:
                score = 100.0
            elif diff <= 30:
                score = 100.0 - ((diff - 10) * 2.5)
            else:
                score = max(0.0, 50.0 - ((diff - 30) * 1.0))
            
            variances.append(score)

        return round(float(np.mean(variances)), 1)

    @staticmethod
    def calculate_sleep_adherence(db: Session, user_id: UUID) -> float:
        """
        Calculates sleep schedule adherence based on the standard deviation 
        of wake-up times over the last 30 days.
        """
        cutoff_date = datetime.utcnow() - timedelta(days=30)
        solves = db.query(UserChallengeHistory).filter(
            UserChallengeHistory.user_id == str(user_id),
            UserChallengeHistory.solved_at >= cutoff_date
        ).all()

        if len(solves) < 2:
            return 100.0

        solve_minutes = [s.solved_at.hour * 60 + s.solved_at.minute for s in solves]
        std_dev = float(np.std(solve_minutes))

        # Penalty factor: higher variance across days drops adherence
        adherence = max(0.0, 100.0 - (std_dev * 1.5))
        return round(adherence, 1)

    @staticmethod
    def calculate_habit_score(user_id: UUID) -> dict:
        db: Session = SessionLocal()
        try:
            # 1. Real Dynamic Wake-Up Consistency (35%)
            wake_up_consistency = HabitScoringService.calculate_wake_up_consistency(db, user_id)

            # 2. Challenge Completion Success (25%)
            total_challenges = db.query(UserChallengeHistory).filter(
                UserChallengeHistory.user_id == str(user_id)
            ).count()

            if total_challenges > 0:
                challenge_success = min(100.0, 50.0 + (total_challenges * 5.0))
            else:
                challenge_success = 0.0

            # 3. Snooze Reduction Rate (20%)
            avg_snoozes = db.query(func.avg(SolveTelemetry.snooze_count)).filter(
                SolveTelemetry.user_id == user_id
            ).scalar()

            if avg_snoozes is not None:
                snooze_reduction = max(0.0, 100.0 - (float(avg_snoozes) * 25))
            else:
                snooze_reduction = 100.0

            # 4. Real Dynamic Sleep Schedule Adherence (20%)
            sleep_adherence = HabitScoringService.calculate_sleep_adherence(db, user_id)

            streak_days = HabitScoringService.calculate_streak_days(db, user_id)

            # Final Weighted Calculation
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