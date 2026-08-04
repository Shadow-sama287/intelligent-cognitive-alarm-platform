from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User, Role, CoachClient

router = APIRouter()


@router.get("/clients")
def get_assigned_clients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in [Role.COACH, Role.ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="Coach access required",
        )

    clients = (
        db.query(CoachClient)
        .filter(CoachClient.coach_id == current_user.id)
        .all()
    )

    return {
        "status": "success",
        "data": clients,
    }


@router.get("/clients/{client_id}/telemetry")
def get_client_telemetry(
    client_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in [Role.COACH, Role.ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="Coach access required",
        )

    return {
        "status": "success",
        "client_id": client_id,
        "telemetry": [],
    }


@router.post("/advice")
def send_client_advice(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in [Role.COACH, Role.ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="Coach access required",
        )

    return {
        "status": "success",
        "message": "Advice sent to client",
    }