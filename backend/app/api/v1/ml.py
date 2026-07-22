from fastapi import APIRouter, Depends
from app.db.redis import redis_client
from app.services.telemetry_service import telemetry_service
from app.ml.dda_engine import dda_engine
from app.schemas.common import ResponseModel
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/recommended-difficulty", response_model=ResponseModel[dict])
def get_recommended_difficulty(current_user: User = Depends(get_current_user)):
    cache_key = f"dda_recommendation:{current_user.id}"
    cached = redis_client.r.get(cache_key)

    if cached:
        return ResponseModel(message="Cached DDA prediction fetched", data={"difficulty": cached, "cached": True})

    # Fetch recent solve telemetry
    history = telemetry_service.get_user_solve_history(current_user.id, limit=10)
    recommended = dda_engine.predict_next_difficulty(history)

    # Cache for 1 hour (3600s)
    redis_client.r.setex(cache_key, 3600, recommended)

    return ResponseModel(message="DDA prediction generated", data={"difficulty": recommended, "cached": False})