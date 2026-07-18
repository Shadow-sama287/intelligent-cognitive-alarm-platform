from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.session import get_db
from app.models.challenge_history import UserChallengeHistory
from app.schemas.common import ResponseModel
from app.api.deps import get_current_user
from app.models.user import User
from sqlalchemy import func, case
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
@router.get("/analytics", response_model=ResponseModel[dict])
def get_performance_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns aggregated challenge performance analytics for the current user:
    - Total challenges solved
    - Average solve time (overall)
    - Average attempts (overall)
    - Per-category breakdown: count, avg time, avg attempts
    - Per-difficulty breakdown: count
    """
    user_id = str(current_user.id)
    base_query = db.query(UserChallengeHistory).filter(
        UserChallengeHistory.user_id == user_id
    )

    total_solved = base_query.count()

    if total_solved == 0:
        return ResponseModel(message="No analytics data yet", data={
            "total_solved": 0,
            "avg_solve_time": None,
            "avg_attempts": None,
            "by_category": [],
            "by_difficulty": [],
        })

    # Overall averages
    overall = db.query(
        func.avg(UserChallengeHistory.time_taken_seconds).label("avg_time"),
        func.avg(UserChallengeHistory.attempts).label("avg_attempts"),
    ).filter(UserChallengeHistory.user_id == user_id).first()

    # Per-category breakdown
    by_category = (
        db.query(
            UserChallengeHistory.category,
            func.count().label("count"),
            func.avg(UserChallengeHistory.time_taken_seconds).label("avg_time"),
            func.avg(UserChallengeHistory.attempts).label("avg_attempts"),
        )
        .filter(UserChallengeHistory.user_id == user_id)
        .group_by(UserChallengeHistory.category)
        .all()
    )

    # Per-difficulty breakdown
    by_difficulty = (
        db.query(
            UserChallengeHistory.difficulty,
            func.count().label("count"),
        )
        .filter(UserChallengeHistory.user_id == user_id)
        .group_by(UserChallengeHistory.difficulty)
        .all()
    )

    return ResponseModel(message="Analytics data fetched", data={
        "total_solved": total_solved,
        "avg_solve_time": round(overall.avg_time, 2) if overall.avg_time else None,
        "avg_attempts": round(overall.avg_attempts, 2) if overall.avg_attempts else None,
        "by_category": [
            {
                "category": row.category,
                "count": row.count,
                "avg_time": round(row.avg_time, 2) if row.avg_time else None,
                "avg_attempts": round(row.avg_attempts, 2) if row.avg_attempts else None,
            }
            for row in by_category
        ],
        "by_difficulty": [
            {
                "difficulty": row.difficulty,
                "count": row.count,
            }
            for row in by_difficulty
        ],
    })