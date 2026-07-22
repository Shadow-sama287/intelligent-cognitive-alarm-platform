from fastapi import APIRouter, Depends
from app.db.redis import redis_client
from app.schemas.common import ResponseModel
from app.api.deps import get_current_user
from app.models.user import User
from app.services.habit_service import habit_service
from app.ml.recommendation_engine import recommendation_engine
import json

router = APIRouter()

@router.get("/summary", response_model=ResponseModel[dict])
def get_analytics_summary(current_user: User = Depends(get_current_user)):
    score_data = habit_service.calculate_habit_score(current_user.id)
    return ResponseModel(message="Analytics summary retrieved", data=score_data)

@router.get("/recommendations", response_model=ResponseModel[list])
def get_recommendations(current_user: User = Depends(get_current_user)):
    cache_key = f"recommendations:{current_user.id}"
    cached = redis_client.r.get(cache_key)

    if cached:
        return ResponseModel(message="Cached recommendations fetched", data=json.loads(cached))

    score_data = habit_service.calculate_habit_score(current_user.id)
    recommendations = recommendation_engine.generate_recommendations(score_data)

    # Cache for 1 hour
    redis_client.r.setex(cache_key, 3600, json.dumps(recommendations))

    return ResponseModel(message="Recommendations generated", data=recommendations)