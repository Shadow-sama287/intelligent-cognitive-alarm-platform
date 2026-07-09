import uuid
import time
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.redis import redis_client
from app.db.session import get_db
from app.services.challenge_service import challenge_service
from app.services.generators.llm_gen import llm_gen
from app.schemas.common import ResponseModel
from app.api.deps import get_current_user
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/start", response_model=ResponseModel[dict])
def start_alarm_session(alarm_id: str, category: str = "math", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session_id = str(uuid.uuid4())
    difficulty = current_user.profile.difficulty_preference.lower() if current_user.profile else "medium"
    
    challenge = None
    try:
        challenge = llm_gen.generate(db=db, user_id=str(current_user.id), difficulty=difficulty, category=category)
        challenge["_id"] = f"gen-{uuid.uuid4()}" # Pseudo ID for dynamically generated challenge
    except Exception as e:
        logger.error(f"Failed to generate challenge via LLM: {e}")
        
    if not challenge:
        challenge = challenge_service.get_random_challenge(category=category, difficulty=difficulty)
    
    if not challenge:
        raise HTTPException(status_code=404, detail="No available challenges for this category")

    session_data = {
        "session_id": session_id,
        "user_id": str(current_user.id),
        "alarm_id": alarm_id,
        "challenge_id": challenge["_id"],
        "correct_answer": str(challenge["correct_answer"]).strip().lower(),
        "start_time": time.time(),
        "attempts": 0,
        "status": "ringing",
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
        "challenge": challenge_payload
    })