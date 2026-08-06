import uuid
import time
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.state_machine import AlarmStateMachine, AlarmState
from app.db.redis import redis_client
from app.db.session import get_db
from app.services.challenge_service import challenge_service
from app.services.generators.llm_gen import llm_gen
from app.schemas.common import ResponseModel
from app.api.deps import get_current_user
from app.models.user import User
from app.services.generators.fallback_gen import fallback_gen
from app.ml.dda_engine import dda_engine
from app.services.telemetry_service import telemetry_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/start", response_model=ResponseModel[dict])
def start_alarm_session(alarm_id: str, category: str = "math", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session_id = str(uuid.uuid4())
    history = telemetry_service.get_user_solve_history(
    current_user.id,
    limit=5
)

    if history:
        difficulty = dda_engine.predict_next_difficulty(history)
    else:
        difficulty = (
            current_user.profile.difficulty_preference.lower()
            if current_user.profile
            else "medium"
        )
    challenge = None
    try:
        challenge = llm_gen.generate(db=db, user_id=str(current_user.id), difficulty=difficulty, category=category)
        challenge["_id"] = f"gen-{uuid.uuid4()}" # Pseudo ID for dynamically generated challenge
    except Exception as e:
        logger.error(f"Failed to generate challenge via LLM: {e}")
        
    if not challenge:
        challenge = challenge_service.get_random_challenge(
            category=category,
            difficulty=difficulty
        )

    if not challenge:
        logger.warning(
            "LLM and database challenge generation failed. Using fallback generator."
        )

        if category == "math":
            challenge = fallback_gen.generate_math(difficulty)
        elif category == "logic":
            challenge = fallback_gen.generate_logic(difficulty)
        elif category == "memory":
            challenge = fallback_gen.generate_memory(difficulty)
        elif category == "stroop":
            challenge = fallback_gen.generate_stroop(difficulty)
        elif category == "pattern":
            challenge = fallback_gen.generate_pattern(difficulty)
        elif category == "riddles":
            challenge = fallback_gen.generate_riddles(difficulty)
        elif category == "trivia":
            challenge = fallback_gen.generate_trivia(difficulty)
        else:
            challenge = fallback_gen.generate_math(difficulty)

        challenge["_id"] = f"fallback-{uuid.uuid4()}"

    # Enforce valid state transition
    AlarmStateMachine.transition(AlarmState.IDLE, AlarmState.RINGING)


    session_data = {
        "session_id": session_id,
        "user_id": str(current_user.id),
        "alarm_id": alarm_id,
        "challenge_id": challenge["_id"],
        "correct_answer": str(challenge["correct_answer"]).strip().lower(),
        "start_time": time.time(),
        "time_limit_seconds": challenge.get("time_limit_seconds", 60),
        "attempts": 0,
        "status": AlarmState.RINGING.value,
        # Fields needed for performance logging in verify.py
        "category": category,
        "difficulty": difficulty,
        "prompt": challenge.get("prompt", challenge.get("question", "")),
    }

    # Save to Redis for 5 minutes (300s)
    redis_client.set_session(session_id, session_data, ttl_seconds=300)

    # Sanitize payload sent to frontend (remove answer)
    challenge_payload = {k: v for k, v in challenge.items() if k != "correct_answer"}

    return ResponseModel(message="Alarm session initialized", data={
        "session_id": session_id,
        "challenge": challenge_payload,
        "status": session_data["status"]
    })