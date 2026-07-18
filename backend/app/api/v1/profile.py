from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User, UserProfile
from app.schemas.user import UserProfileResponse, UserProfileUpdate
from app.schemas.common import ResponseModel
from app.api.deps import get_current_user

router = APIRouter()


class SnoozeSettingsUpdate(BaseModel):
    snooze_limit: int = 3
    escalate_difficulty: bool = True
    time_penalty_enabled: bool = True


@router.get("", response_model=ResponseModel[UserProfileResponse])
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the current user's profile settings."""
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return ResponseModel(
        message="Profile fetched successfully",
        data=profile,
    )


@router.put("", response_model=ResponseModel[UserProfileResponse])
def update_profile(
    profile_in: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the current user's profile settings."""
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = profile_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return ResponseModel(
        message="Profile updated successfully",
        data=profile,
    )


@router.get("/snooze-settings", response_model=ResponseModel[dict])
def get_snooze_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    if not profile:
        return ResponseModel(
            message="No profile found",
            data={
                "snooze_limit": 3,
                "escalate_difficulty": True,
                "time_penalty_enabled": True,
            },
        )

    return ResponseModel(
        message="Snooze settings fetched",
        data={
            "snooze_limit": profile.snooze_limit,
            "escalate_difficulty": profile.escalate_difficulty,
            "time_penalty_enabled": profile.time_penalty_enabled,
        },
    )


@router.put("/snooze-settings", response_model=ResponseModel[dict])
def update_snooze_settings(
    payload: SnoozeSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found")

    profile.snooze_limit = payload.snooze_limit
    profile.escalate_difficulty = payload.escalate_difficulty
    profile.time_penalty_enabled = payload.time_penalty_enabled

    db.commit()
    db.refresh(profile)

    return ResponseModel(
        message="Snooze settings updated successfully",
        data={
            "snooze_limit": profile.snooze_limit,
            "escalate_difficulty": profile.escalate_difficulty,
            "time_penalty_enabled": profile.time_penalty_enabled,
        },
    )
