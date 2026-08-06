import argparse
import random
import uuid
from datetime import datetime, timedelta
from typing import List

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User, UserProfile, Role
from app.models.telemetry import SolveTelemetry
from app.models.challenge_history import UserChallengeHistory
from app.core.security import get_password_hash
from app.ml.dda_engine import dda_engine
from app.db.redis import redis_client

CATEGORIES = ["math", "memory", "logic", "riddles", "pattern"]
DIFFICULTIES = ["easy", "medium", "hard"]

PROMPTS = {
    "math": "What is 15 * 4 - 12?",
    "memory": "Remember sequence: 4-8-2-9",
    "logic": "If A > B and B > C, is A > C?",
    "riddles": "What has hands but cannot clap?",
    "pattern": "Next number in 3, 6, 12, 24, ?"
}

ANSWERS = {
    "math": "48",
    "memory": "4829",
    "logic": "yes",
    "riddles": "clock",
    "pattern": "48"
}

def get_or_create_user(db: Session, email: str) -> User:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        print(f"User {email} not found. Creating user account...")
        user = User(
            id=uuid.uuid4(),
            email=email,
            hashed_password=get_password_hash("user123"),
            full_name=email.split("@")[0].capitalize(),
            role=Role.USER,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        profile = UserProfile(
            id=uuid.uuid4(),
            user_id=user.id,
            preferred_wake_time="07:00",
            difficulty_preference="Medium",
            snooze_limit=3,
            time_zone="UTC"
        )
        db.add(profile)
        db.commit()
        print(f"Created user {email} with ID {user.id}")
    else:
        # If user exists but has a invalid/mock password hash, fix it
        if not user.hashed_password or not user.hashed_password.startswith("$"):
            user.hashed_password = get_password_hash("user123")
            db.commit()
            print(f"Updated password hash for existing user {email}")
    return user



def generate_telemetry_for_day(
    db: Session,
    user: User,
    day_dt: datetime,
    behavior: str,
    progress: float
):
    # progress is 0.0 (start) to 1.0 (end) for improving behavior
    category = random.choice(CATEGORIES)
    prompt = PROMPTS.get(category, "Solve challenge")
    answer = ANSWERS.get(category, "42")

    if behavior == "terrible":
        solve_time = round(random.uniform(35.0, 65.0), 1)
        snooze_count = random.randint(2, 4)
        attempts = random.randint(2, 4)
        difficulty = random.choice(["easy", "medium"])
        wake_offset_minutes = random.randint(35, 90)

    elif behavior == "improving":
        # Linear interpolation from bad to good based on progress (0.0 to 1.0)
        solve_time = round(random.uniform(40.0 - (30.0 * progress), 55.0 - (42.0 * progress)), 1)
        snooze_count = max(0, int(3 - round(3 * progress)))
        attempts = max(1, int(3 - round(2 * progress)))
        difficulty = "easy" if progress < 0.3 else "medium" if progress < 0.7 else "hard"
        wake_offset_minutes = max(2, int(60 - (55 * progress)))

    elif behavior == "excellent":
        solve_time = round(random.uniform(5.0, 14.0), 1)
        snooze_count = 0
        attempts = 1
        difficulty = random.choice(["medium", "hard"])
        wake_offset_minutes = random.randint(0, 5)

    elif behavior == "inconsistent":
        if random.random() > 0.5:
            # Good day
            solve_time = round(random.uniform(8.0, 18.0), 1)
            snooze_count = random.randint(0, 1)
            attempts = 1
            difficulty = "medium"
            wake_offset_minutes = random.randint(2, 15)
        else:
            # Bad day
            solve_time = round(random.uniform(30.0, 50.0), 1)
            snooze_count = random.randint(2, 4)
            attempts = random.randint(2, 3)
            difficulty = "easy"
            wake_offset_minutes = random.randint(40, 80)
    else:
        raise ValueError(f"Unknown behavior: {behavior}")

    # Calculate actual solved timestamp (07:00 + wake_offset_minutes)
    solved_time = day_dt.replace(hour=7, minute=0, second=0, microsecond=0) + timedelta(minutes=wake_offset_minutes)

    # 1. Insert into solve_telemetry
    telemetry_entry = SolveTelemetry(
        id=uuid.uuid4(),
        user_id=user.id,
        category=category,
        difficulty=difficulty,
        solve_time_seconds=solve_time,
        attempts=attempts,
        snooze_count=snooze_count,
        created_at=solved_time
    )
    db.add(telemetry_entry)

    # 2. Insert into user_challenge_history
    history_entry = UserChallengeHistory(
        id=uuid.uuid4(),
        user_id=str(user.id),
        category=category,
        difficulty=difficulty,
        prompt=prompt,
        correct_answer=answer,
        time_taken_seconds=solve_time,
        attempts=attempts,
        solved_at=solved_time
    )
    db.add(history_entry)

def seed_telemetry(
    email: str,
    behavior: str,
    days: int = 14,
    start_day_offset: int = 0,
    clear: bool = False
):
    db = SessionLocal()
    try:
        user = get_or_create_user(db, email)

        if clear:
            print(f"Clearing existing telemetry for {email}...")
            db.query(SolveTelemetry).filter(SolveTelemetry.user_id == user.id).delete()
            db.query(UserChallengeHistory).filter(UserChallengeHistory.user_id == str(user.id)).delete()
            db.commit()

        start_date = datetime.utcnow() - timedelta(days=start_day_offset + days)
        print(f"Seeding '{behavior}' telemetry for {email}...")
        print(f"Date range: {start_date.strftime('%Y-%m-%d')} to {(start_date + timedelta(days=days-1)).strftime('%Y-%m-%d')} ({days} days)")

        for i in range(days):
            current_day_dt = start_date + timedelta(days=i)
            progress = i / max(1, days - 1)
            generate_telemetry_for_day(db, user, current_day_dt, behavior, progress)

        db.commit()

        # Update DDA and profile preference
        recent_records = db.query(SolveTelemetry).filter(
            SolveTelemetry.user_id == user.id
        ).order_by(SolveTelemetry.created_at.desc()).limit(10).all()

        history_list = [
            {
                "solve_time": r.solve_time_seconds,
                "attempts": r.attempts,
                "snooze_count": r.snooze_count,
                "difficulty": r.difficulty
            }
            for r in recent_records
        ]

        predicted_diff = dda_engine.predict_next_difficulty(history_list)

        # Update profile difficulty preference
        profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        if profile:
            profile.difficulty_preference = predicted_diff.capitalize()
            db.commit()

        # Invalidate Redis DDA cache if exists
        try:
            redis_client.r.delete(f"dda_recommendation:{user.id}")
            redis_client.r.delete(f"recommendations:{user.id}")
        except Exception:
            pass

        print("--------------------------------------------------")
        print(f"[SUCCESS] Successfully seeded {days} daily telemetry records for {email}!")
        print(f"[METRIC] Predicted DDA Tier: {predicted_diff.upper()}")
        print(f"[PROFILE] Profile Difficulty Preference Updated To: {profile.difficulty_preference if profile else 'Medium'}")
        print("--------------------------------------------------")


    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed telemetry data for ICAP users.")
    parser.add_argument("--email", type=str, required=True, help="User email address")
    parser.add_argument("--behavior", type=str, choices=["terrible", "improving", "excellent", "inconsistent"], required=True, help="Behavior archetype")
    parser.add_argument("--days", type=int, default=14, help="Number of days of data to generate")
    parser.add_argument("--start-day-offset", type=int, default=0, help="Days ago to start generation (0 = ending today)")
    parser.add_argument("--clear", action="store_true", help="Clear existing telemetry for user before seeding")

    args = parser.parse_args()
    seed_telemetry(
        email=args.email,
        behavior=args.behavior,
        days=args.days,
        start_day_offset=args.start_day_offset,
        clear=args.clear
    )
