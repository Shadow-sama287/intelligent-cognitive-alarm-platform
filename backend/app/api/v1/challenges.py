from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional
from app.services.challenge_service import challenge_service
from app.schemas.common import ResponseModel
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/random", response_model=ResponseModel[dict])
def get_random_challenge(
    category: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    # Use user's profile preference if difficulty not specified
    user_diff = difficulty or (current_user.profile.difficulty_preference.lower() if current_user.profile else "medium")
    challenge = challenge_service.get_random_challenge(category=category, difficulty=user_diff)
    
    if not challenge:
        raise HTTPException(status_code=404, detail="No cognitive challenges available")
        
    return ResponseModel(message="Challenge fetched successfully", data=challenge)

from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.generators.llm_gen import llm_gen
import uuid
import logging

logger = logging.getLogger(__name__)

class GenerateChallengeRequest(BaseModel):
    category: str
    difficulty: str

@router.post("/generate", response_model=ResponseModel[dict])
def generate_practice_challenge(
    payload: GenerateChallengeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        challenge = llm_gen.generate(
            db=db,
            user_id=str(current_user.id),
            difficulty=payload.difficulty,
            category=payload.category
        )
        challenge["_id"] = f"gen-{uuid.uuid4()}"
        return ResponseModel(message="Dynamic challenge generated", data=challenge)
    except Exception as e:
        logger.error(f"Failed to generate practice challenge: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate challenge")