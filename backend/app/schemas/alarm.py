from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime

class AlarmBase(BaseModel):
    title: str = "Morning Alarm"
    alarm_time: str # "07:30"
    days_of_week: str = "MON,TUE,WED,THU,FRI"
    is_active: bool = True
    challenge_category: str = "math"
    difficulty_override: Optional[str] = None
    snooze_limit: int = 3

class AlarmCreate(AlarmBase):
    pass

class AlarmUpdate(BaseModel):
    title: Optional[str] = None
    alarm_time: Optional[str] = None
    days_of_week: Optional[str] = None
    is_active: Optional[bool] = None
    challenge_category: Optional[str] = None
    difficulty_override: Optional[str] = None
    snooze_limit: Optional[int] = None

class AlarmResponse(AlarmBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True