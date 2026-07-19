import uuid
import time
import logging
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.redis import redis_client
from app.db.session import get_db
from app.services.snooze_service import snooze_service
from app.services.generators.llm_gen import llm_gen
from app.services.challenge_service import challenge_service
from app.core.state_machine import AlarmStateMachine, AlarmState
from app.schemas.common import ResponseModel
from app.api.deps import get_current_user
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/snooze", response_model=ResponseModel[dict])
def snooze_alarm(session_id: str, current_user: User = Depends(get_current_user)):
    session = redis_client.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session expired")

    # Enforce valid state transition: RINGING → SNOOZED
    current_state = AlarmState(session.get("status", "ringing"))
    try:
        AlarmStateMachine.transition(current_state, AlarmState.SNOOZED)
    except ValueError as e:
        logger.error(f"Invalid state transition for session {session_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))

    snooze_count = session.get("snooze_count", 0) + 1
    current_difficulty = session.get("difficulty", "medium")
    
    profile = current_user.profile
    snooze_limit = profile.snooze_limit if profile else 3
    escalate = profile.escalate_difficulty if profile else True
    time_pen = profile.time_penalty_enabled if profile else True

    penalty = snooze_service.calculate_snooze_penalty(
        current_difficulty, 
        snooze_count,
        snooze_limit=snooze_limit,
        escalate_difficulty=escalate,
        time_penalty_enabled=time_pen
    )

    if not penalty["snooze_allowed"]:
        raise HTTPException(status_code=400, detail="Snooze limit reached! You MUST solve the challenge now.")

    session["snooze_count"] = snooze_count
    session["status"] = AlarmState.SNOOZED.value
    session["difficulty"] = penalty["new_difficulty"]
    session["time_penalty_seconds"] = penalty["time_penalty_seconds"]
    redis_client.set_session(session_id, session, ttl_seconds=300)

    penalty["status"] = session["status"]
    
    logger.info(f"User {current_user.id} snoozed session {session_id}. Count: {snooze_count}/{snooze_limit}")

    return ResponseModel(
        message=f"Alarm snoozed ({snooze_count}/{snooze_limit}). Difficulty escalated to {penalty['new_difficulty']}!",
        data=penalty
    )


@router.post("/re-ring", response_model=ResponseModel[dict])
def re_ring_alarm(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Called when the snooze timer expires (after 5 minutes).
    Transitions alarm from SNOOZED → RINGING and generates a NEW challenge
    at the escalated difficulty level.
    """
    session = redis_client.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session expired")

    if session["user_id"] != str(current_user.id):
        raise HTTPException(status_code=403, detail="Unauthorized session access")

    # Enforce valid transition: SNOOZED → RINGING
    current_state = AlarmState(session.get("status", "snoozed"))
    AlarmStateMachine.transition(current_state, AlarmState.RINGING)

    # Generate a new challenge at the escalated difficulty
    difficulty = session.get("difficulty", "medium")
    category = session.get("category", "math")

    new_challenge = None
    try:
        new_challenge = llm_gen.generate(
            db=db, user_id=str(current_user.id),
            difficulty=difficulty, category=category
        )
        new_challenge["_id"] = f"gen-{uuid.uuid4()}"
    except Exception as e:
        logger.error(f"Failed to generate challenge on re-ring: {e}")

    if not new_challenge:
        new_challenge = challenge_service.get_random_challenge(
            category=category, difficulty=difficulty
        )

    if not new_challenge:
        raise HTTPException(status_code=500, detail="Failed to generate new challenge for re-ring")

    # Update session with new challenge, reset timer and attempts
    session["challenge_id"] = new_challenge["_id"]
    session["correct_answer"] = str(new_challenge["correct_answer"]).strip().lower()
    session["start_time"] = time.time()
    session["time_limit_seconds"] = new_challenge.get("time_limit_seconds", 60)
    session["prompt"] = new_challenge.get("prompt", new_challenge.get("question", ""))
    session["attempts"] = 0
    session["status"] = AlarmState.RINGING.value
    redis_client.set_session(session_id, session, ttl_seconds=300)

    # Sanitize (remove answer from payload)
    challenge_payload = {k: v for k, v in new_challenge.items() if k != "correct_answer"}

    return ResponseModel(
        message=f"Alarm re-ringing! New {difficulty}-level challenge generated.",
        data={
            "session_id": session_id,
            "challenge": challenge_payload,
            "difficulty": difficulty,
            "snooze_count": session.get("snooze_count", 0),
            "time_penalty_seconds": session.get("time_penalty_seconds", 0),
            "status": session["status"]
        }
    )