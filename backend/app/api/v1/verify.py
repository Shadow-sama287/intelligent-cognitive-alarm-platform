import time
import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.redis import redis_client
from app.db.session import get_db
from app.models.challenge_history import UserChallengeHistory
from app.schemas.common import ResponseModel
from app.api.deps import get_current_user
from app.models.user import User
from app.core.state_machine import AlarmStateMachine, AlarmState
from app.services.evaluation_service import evaluator_service
from app.services.generators.llm_gen import llm_gen
from app.services.challenge_service import challenge_service

logger = logging.getLogger(__name__)
router = APIRouter()

class VerifyAnswerRequest(BaseModel):
    session_id: str
    user_answer: str

class VerifyAnswerResponse(BaseModel):
    is_correct: bool
    time_taken_seconds: float
    attempts: int
    session_cleared: bool
    time_expired: bool = False
    new_challenge: dict | None = None

@router.post("/verify", response_model=ResponseModel[VerifyAnswerResponse])
def verify_challenge_answer(
    payload: VerifyAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = redis_client.get_session(payload.session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Alarm session expired or invalid")

    if session["user_id"] != str(current_user.id):
        raise HTTPException(status_code=403, detail="Unauthorized session access")

    # Enforce that the alarm is in RINGING state before accepting answers
    current_state = AlarmState(session.get("status", "ringing"))
    if current_state != AlarmState.RINGING:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot verify answer: alarm is in '{current_state.value}' state, expected 'ringing'"
        )

    # --- Time Penalty Check ---
    time_penalty = session.get("time_penalty_seconds", 0)
    if evaluator_service.is_time_expired(session, time_penalty):
        # Time expired — regenerate a NEW challenge at the same difficulty, reset timer
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
            logger.error(f"Failed to regenerate challenge via LLM on timeout: {e}")

        if not new_challenge:
            new_challenge = challenge_service.get_random_challenge(
                category=category, difficulty=difficulty
            )

        if not new_challenge:
            raise HTTPException(status_code=500, detail="Failed to regenerate challenge after timeout")

        # Update session with new challenge and reset timer
        session["challenge_id"] = new_challenge["_id"]
        session["correct_answer"] = str(new_challenge["correct_answer"]).strip().lower()
        session["start_time"] = time.time()
        session["time_limit_seconds"] = new_challenge.get("time_limit_seconds", 60)
        session["prompt"] = new_challenge.get("prompt", new_challenge.get("question", ""))
        session["attempts"] = 0
        redis_client.set_session(payload.session_id, session, ttl_seconds=300)

        # Sanitize payload (remove answer)
        challenge_payload = {k: v for k, v in new_challenge.items() if k != "correct_answer"}

        return ResponseModel(
            message="Time expired! Here's a new challenge. Keep trying!",
            data=VerifyAnswerResponse(
                is_correct=False,
                time_taken_seconds=0,
                attempts=0,
                session_cleared=False,
                time_expired=True,
                new_challenge=challenge_payload
            )
        )

    # --- Normal Answer Verification ---
    session["attempts"] += 1
    submitted = payload.user_answer.strip().lower()
    expected = session["correct_answer"].strip().lower()

    is_correct = (submitted == expected)
    solve_time = round(time.time() - session["start_time"], 2)

    if is_correct:
        # Transition state: RINGING → SOLVED
        AlarmStateMachine.transition(AlarmState.RINGING, AlarmState.SOLVED)

        # Persist performance data to PostgreSQL before clearing session
        history_entry = UserChallengeHistory(
            user_id=str(current_user.id),
            category=session.get("category", "unknown"),
            difficulty=session.get("difficulty", "medium"),
            prompt=session.get("prompt", ""),
            correct_answer=session["correct_answer"],
            time_taken_seconds=solve_time,
            attempts=session["attempts"],
        )
        db.add(history_entry)
        db.commit()

        redis_client.delete_session(payload.session_id)  # Alarm dismissed!
        return ResponseModel(
            message="Challenge solved successfully! Alarm dismissed.",
            data=VerifyAnswerResponse(
                is_correct=True,
                time_taken_seconds=solve_time,
                attempts=session["attempts"],
                session_cleared=True
            )
        )
    else:
        # Update attempts in Redis
        redis_client.set_session(payload.session_id, session)
        return ResponseModel(
            message="Incorrect answer. Try again!",
            data=VerifyAnswerResponse(
                is_correct=False,
                time_taken_seconds=solve_time,
                attempts=session["attempts"],
                session_cleared=False
            )
        )