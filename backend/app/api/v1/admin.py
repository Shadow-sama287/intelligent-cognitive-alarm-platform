from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User, UserProfile, Role
from app.models.alarm import Alarm
from app.schemas.user import UserResponse, UserRoleUpdate
from app.schemas.common import ResponseModel
from app.api.deps import require_role

router = APIRouter()

# Reuse the existing require_role helper to gate this entire router to admins only
admin_required = require_role([Role.ADMIN])


@router.get("/stats", response_model=ResponseModel[dict])
def get_admin_stats(
    db: Session = Depends(get_db),
    _: User = Depends(admin_required),  # enforces Role.ADMIN
):
    """
    Returns platform-wide statistics for the admin dashboard.
    Only accessible by users whose role == 'administrator'.
    Challenges are stored in MongoDB; their count is fetched via the challenge_service.
    """
    from app.services.challenge_service import challenge_service

    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_alarms = db.query(Alarm).count()

    # Count challenges stored in MongoDB via the challenge_service
    try:
        total_challenges = challenge_service.collection.count_documents({})
    except Exception:
        total_challenges = None  # MongoDB might not be reachable in all environments

    stats = {
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": total_users - active_users,
        "total_alarms": total_alarms,
        "total_challenges_seeded": total_challenges,
    }

    return ResponseModel(message="Admin stats fetched successfully", data=stats)


@router.get("/users", response_model=ResponseModel[List[UserResponse]])
def get_all_users(
    db: Session = Depends(get_db),
    _: User = Depends(admin_required),
):
    """Fetch list of all users in the system."""
    users = db.query(User).all()
    return ResponseModel(message="Users fetched successfully", data=users)


@router.patch("/users/{user_id}/role", response_model=ResponseModel[UserResponse])
def update_user_role(
    user_id: UUID,
    role_in: UserRoleUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(admin_required),
):
    """Update role of a user (e.g. promote to 'coach' or 'administrator')."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    user.role = role_in.role
    db.commit()
    db.refresh(user)
    return ResponseModel(message=f"User role updated to {user.role.value}", data=user)

