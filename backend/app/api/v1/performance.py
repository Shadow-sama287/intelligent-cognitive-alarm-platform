from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.session import get_db
from app.models.challenge_history import UserChallengeHistory
from app.schemas.common import ResponseModel
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/history", response_model=ResponseModel[list])
def get_performance_history(
    limit: int = Query(default=10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns the last N solved challenges with timing and attempt data for the current user."""
    records = (
        db.query(UserChallengeHistory)
        .filter(UserChallengeHistory.user_id == str(current_user.id))
        .order_by(desc(UserChallengeHistory.solved_at))
        .limit(limit)
        .all()
    )

    data = [
        {
            "id": str(r.id),
            "category": r.category,
            "difficulty": r.difficulty,
            "time_taken_seconds": r.time_taken_seconds,
            "attempts": r.attempts,
            "solved_at": r.solved_at.isoformat(),
        }
        for r in records
    ]

    return ResponseModel(message="Performance history fetched", data=data)
