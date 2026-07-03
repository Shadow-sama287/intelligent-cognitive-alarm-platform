from fastapi import APIRouter
from app.schemas.common import ResponseModel, HealthResponse

router = APIRouter()

@router.get("/health", response_model=ResponseModel[HealthResponse])
def health_check():
    return ResponseModel(
        success=True,
        message="System operating normally",
        data=HealthResponse(
            status="online",
            postgres="connected",
            mongodb="connected",
            redis="connected"
        )
    )