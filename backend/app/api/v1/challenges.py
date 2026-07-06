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