from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.db.session import get_db
from app.models.alarm import Alarm
from app.models.user import User
from app.schemas.alarm import AlarmCreate, AlarmUpdate, AlarmResponse
from app.schemas.common import ResponseModel
from app.api.deps import get_current_user

router = APIRouter()

@router.get("", response_model=ResponseModel[List[AlarmResponse]])
def get_user_alarms(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alarms = db.query(Alarm).filter(Alarm.user_id == current_user.id).all()
    return ResponseModel(data=alarms)

@router.post("", response_model=ResponseModel[AlarmResponse])
def create_alarm(alarm_in: AlarmCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alarm = Alarm(**alarm_in.dict(), user_id=current_user.id)
    db.add(alarm)
    db.commit()
    db.refresh(alarm)
    return ResponseModel(message="Alarm created", data=alarm)

@router.put("/{alarm_id}/toggle", response_model=ResponseModel[AlarmResponse])
def toggle_alarm(alarm_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alarm = db.query(Alarm).filter(Alarm.id == alarm_id, Alarm.user_id == current_user.id).first()
    if not alarm:
        raise HTTPException(status_code=404, detail="Alarm not found")
    alarm.is_active = not alarm.is_active
    db.commit()
    db.refresh(alarm)
    return ResponseModel(message=f"Alarm {'activated' if alarm.is_active else 'deactivated'}", data=alarm)

@router.put("/{alarm_id}", response_model=ResponseModel[AlarmResponse])
def update_alarm(alarm_id: UUID, alarm_in: AlarmUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alarm = db.query(Alarm).filter(Alarm.id == alarm_id, Alarm.user_id == current_user.id).first()
    if not alarm:
        raise HTTPException(status_code=404, detail="Alarm not found")
    
    update_data = alarm_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(alarm, field, value)
        
    db.commit()
    db.refresh(alarm)
    return ResponseModel(message="Alarm updated", data=alarm)

@router.delete("/{alarm_id}", response_model=ResponseModel[dict])
def delete_alarm(alarm_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alarm = db.query(Alarm).filter(Alarm.id == alarm_id, Alarm.user_id == current_user.id).first()
    if not alarm:
        raise HTTPException(status_code=404, detail="Alarm not found")
    
    db.delete(alarm)
    db.commit()
    return ResponseModel(message="Alarm deleted successfully", data={})