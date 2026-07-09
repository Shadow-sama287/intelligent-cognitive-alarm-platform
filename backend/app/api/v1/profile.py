from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User, UserProfile
from app.schemas.user import UserProfileResponse, UserProfileUpdate
from app.schemas.common import ResponseModel
from app.api.deps import get_current_user

router = APIRouter()


@router.get("", response_model=ResponseModel[UserProfileResponse])
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the current user's profile settings."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return ResponseModel(message="Profile fetched successfully", data=profile)


@router.put("", response_model=ResponseModel[UserProfileResponse])
def update_profile(
    profile_in: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the current user's profile settings (partial updates supported)."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return ResponseModel(message="Profile updated successfully", data=profile)
