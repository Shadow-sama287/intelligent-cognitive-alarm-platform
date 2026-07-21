from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.schemas.common import ResponseModel
from app.api.deps import get_current_user
from app.models.user import User
from app.services.telemetry_service import telemetry_service

router = APIRouter()

class TelemetryLogRequest(BaseModel):
    category: str
    difficulty: str
    solve_time_seconds: float
    attempts: int
    snooze_count: int

class DifficultyPreferenceRequest(BaseModel):
    preferred_difficulty: str

@router.post("/solve", response_model=ResponseModel[dict])
def log_solve_telemetry(payload: TelemetryLogRequest, current_user: User = Depends(get_current_user)):
    telemetry_service.log_solve(
        user_id=current_user.id,
        category=payload.category,
        difficulty=payload.difficulty,
        solve_time=payload.solve_time_seconds,
        attempts=payload.attempts,
        snooze_count=payload.snooze_count
    )
    return ResponseModel(message="Telemetry logged successfully", data={})

@router.put("/difficulty-preference", response_model=ResponseModel[dict])
def update_difficulty_preference(payload: DifficultyPreferenceRequest, current_user: User = Depends(get_current_user)):
    # Update the user's preferred difficulty in the database (Mocked for now)
    # current_user.preferred_difficulty = payload.preferred_difficulty
    # db.commit()
    return ResponseModel(message="Difficulty preference updated successfully", data={"preferred_difficulty": payload.preferred_difficulty})