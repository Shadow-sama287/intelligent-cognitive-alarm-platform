import time
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.redis import redis_client
from app.db.session import get_db
from app.models.challenge_history import UserChallengeHistory
from app.schemas.common import ResponseModel
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

class VerifyAnswerRequest(BaseModel):
    session_id: str
    user_answer: str

class VerifyAnswerResponse(BaseModel):
    is_correct: bool
    time_taken_seconds: float
    attempts: int
    session_cleared: bool

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

    session["attempts"] += 1
    submitted = payload.user_answer.strip().lower()
    expected = session["correct_answer"].strip().lower()

    is_correct = (submitted == expected)
    solve_time = round(time.time() - session["start_time"], 2)

    if is_correct:
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