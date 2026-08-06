from uuid import UUID
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.telemetry import SolveTelemetry

from typing import Optional
from datetime import datetime

class TelemetryService:
    @staticmethod
    def log_solve(user_id: UUID, category: str, difficulty: str, solve_time: float, attempts: int, snooze_count: int, created_at: Optional[datetime] = None):
        db: Session = SessionLocal()
        try:
            kwargs = {
                "user_id": user_id,
                "category": category,
                "difficulty": difficulty,
                "solve_time_seconds": solve_time,
                "attempts": attempts,
                "snooze_count": snooze_count
            }
            if created_at is not None:
                kwargs["created_at"] = created_at
            entry = SolveTelemetry(**kwargs)
            db.add(entry)
            db.commit()
        finally:
            db.close()

    @staticmethod
    def get_user_solve_history(user_id: UUID, limit: int = 10) -> list:
        db: Session = SessionLocal()
        try:
            records = db.query(SolveTelemetry).filter(SolveTelemetry.user_id == user_id).order_by(SolveTelemetry.created_at.desc()).limit(limit).all()
            if records:
                return [{"solve_time": r.solve_time_seconds, "attempts": r.attempts, "snooze_count": r.snooze_count, "difficulty": r.difficulty} for r in records]
            
            # Fallback to UserChallengeHistory
            from app.models.challenge_history import UserChallengeHistory
            histories = db.query(UserChallengeHistory).filter(UserChallengeHistory.user_id == str(user_id)).order_by(UserChallengeHistory.solved_at.desc()).limit(limit).all()
            return [{"solve_time": h.time_taken_seconds, "attempts": h.attempts, "snooze_count": 0, "difficulty": h.difficulty} for h in histories]
        finally:
            db.close()

    @staticmethod
    def get_daily_trends(user_id: UUID, days: int = 30) -> list:
        from datetime import timedelta
        from collections import defaultdict
        db: Session = SessionLocal()
        try:
            cutoff = datetime.utcnow() - timedelta(days=days)
            records = db.query(SolveTelemetry).filter(
                SolveTelemetry.user_id == user_id,
                SolveTelemetry.created_at >= cutoff
            ).order_by(SolveTelemetry.created_at.asc()).all()

            # If no SolveTelemetry within cutoff, try all SolveTelemetry
            if not records:
                records = db.query(SolveTelemetry).filter(
                    SolveTelemetry.user_id == user_id
                ).order_by(SolveTelemetry.created_at.asc()).all()

            # If still no SolveTelemetry, fallback to UserChallengeHistory!
            if not records:
                from app.models.challenge_history import UserChallengeHistory
                histories = db.query(UserChallengeHistory).filter(
                    UserChallengeHistory.user_id == str(user_id)
                ).order_by(UserChallengeHistory.solved_at.asc()).all()

                if histories:
                    daily_map = defaultdict(list)
                    for h in histories:
                        day_str = h.solved_at.strftime("%Y-%m-%d")
                        day_label = h.solved_at.strftime("%a")
                        daily_map[day_str].append((h, day_label))

                    results = []
                    for date_key in sorted(daily_map.keys()):
                        items = daily_map[date_key]
                        day_label = items[0][1]
                        avg_solve_time = sum(x[0].time_taken_seconds for x in items) / len(items)
                        avg_snoozes = 0.0
                        
                        base_score = 100.0 - max(0.0, (avg_solve_time - 15.0) * 1.2)
                        day_score = max(10, min(100, int(round(base_score))))

                        results.append({
                            "date": date_key,
                            "day": day_label,
                            "score": day_score,
                            "avg_solve_time": round(avg_solve_time, 1),
                            "snoozes": 0
                        })
                    return results
                return []

            daily_map = defaultdict(list)
            for r in records:
                day_str = r.created_at.strftime("%Y-%m-%d")
                day_label = r.created_at.strftime("%a") # Mon, Tue, etc.
                daily_map[day_str].append((r, day_label))

            results = []
            for date_key in sorted(daily_map.keys()):
                items = daily_map[date_key]
                day_label = items[0][1]
                avg_solve_time = sum(x[0].solve_time_seconds for x in items) / len(items)
                avg_snoozes = sum(x[0].snooze_count for x in items) / len(items)
                
                # Daily score calculation
                base_score = 100.0 - (avg_snoozes * 15.0) - max(0.0, (avg_solve_time - 15.0) * 1.2)
                day_score = max(10, min(100, int(round(base_score))))

                results.append({
                    "date": date_key,
                    "day": day_label,
                    "score": day_score,
                    "avg_solve_time": round(avg_solve_time, 1),
                    "snoozes": round(avg_snoozes, 1)
                })

            return results
        finally:
            db.close()

    @staticmethod
    def get_category_performance(user_id: UUID, days: int = 30) -> list:
        from datetime import timedelta
        from collections import defaultdict
        db: Session = SessionLocal()
        try:
            cutoff = datetime.utcnow() - timedelta(days=days)
            records = db.query(SolveTelemetry).filter(
                SolveTelemetry.user_id == user_id,
                SolveTelemetry.created_at >= cutoff
            ).all()

            if not records:
                records = db.query(SolveTelemetry).filter(
                    SolveTelemetry.user_id == user_id
                ).all()

            # Fallback to UserChallengeHistory
            if not records:
                from app.models.challenge_history import UserChallengeHistory
                histories = db.query(UserChallengeHistory).filter(
                    UserChallengeHistory.user_id == str(user_id)
                ).all()
                if not histories:
                    return []
                cat_map = defaultdict(list)
                for h in histories:
                    cat_map[h.category.lower()].append(h)
                
                res = []
                for cat, items in cat_map.items():
                    avg_speed = sum(i.time_taken_seconds for i in items) / len(items)
                    first_try = sum(1 for i in items if i.attempts == 1)
                    accuracy = round((first_try / len(items)) * 100, 1)
                    res.append({
                        "category": cat,
                        "count": len(items),
                        "avg_speed": round(avg_speed, 1),
                        "accuracy": accuracy
                    })
                return sorted(res, key=lambda x: x["avg_speed"])

            cat_map = defaultdict(list)
            for r in records:
                cat_map[r.category.lower()].append(r)

            res = []
            for cat, items in cat_map.items():
                avg_speed = sum(i.solve_time_seconds for i in items) / len(items)
                first_try = sum(1 for i in items if i.attempts == 1)
                accuracy = round((first_try / len(items)) * 100, 1)
                res.append({
                    "category": cat,
                    "count": len(items),
                    "avg_speed": round(avg_speed, 1),
                    "accuracy": accuracy
                })
            return sorted(res, key=lambda x: x["avg_speed"])
        finally:
            db.close()


telemetry_service = TelemetryService()
