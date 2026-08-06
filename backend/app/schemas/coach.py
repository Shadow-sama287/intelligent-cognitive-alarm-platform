from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from app.models.user import CoachStatus


class CoachInviteCreate(BaseModel):
    client_email: EmailStr


class CoachInviteAction(BaseModel):
    action: str  # "accept" or "reject"


class CoachInviteResponse(BaseModel):
    id: UUID
    coach_id: UUID
    coach_name: Optional[str] = None
    coach_email: Optional[str] = None
    client_id: UUID
    client_name: Optional[str] = None
    client_email: Optional[str] = None
    status: CoachStatus
    assigned_at: datetime

    class Config:
        from_attributes = True


class CoachClientSummary(BaseModel):
    id: UUID
    client_id: UUID
    name: str
    email: str
    status: CoachStatus
    habit_score: float = 80.0
    avg_snoozes: float = 1.0
    wake_consistency: float = 85.0
    assigned_at: datetime
    reasons: List[str] = []

    class Config:
        from_attributes = True
