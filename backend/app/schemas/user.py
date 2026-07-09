from pydantic import BaseModel, EmailStr
from uuid import UUID
from typing import Optional
from datetime import datetime
from app.models.user import Role


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: Role = Role.USER

class UserCreate(UserBase):
    password: str

class UserProfileResponse(BaseModel):
    preferred_wake_time: str
    target_sleep_hours: float
    time_zone: str
    difficulty_preference: str
    productivity_goals: Optional[str] = None

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    preferred_wake_time: Optional[str] = None
    target_sleep_hours: Optional[float] = None
    time_zone: Optional[str] = None
    difficulty_preference: Optional[str] = None
    productivity_goals: Optional[str] = None

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime
    profile: Optional[UserProfileResponse] = None

    class Config:
        from_attributes = True