import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Time, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY as PG_ARRAY
from app.db.session import Base

class Alarm(Base):
    __tablename__ = "alarms"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(100), default="Morning Alarm")
    alarm_time: Mapped[str] = mapped_column(String(10), nullable=False) # HH:MM (24hr format)
    days_of_week: Mapped[str] = mapped_column(String(50), default="MON,TUE,WED,THU,FRI") # Comma separated
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    challenge_category: Mapped[str] = mapped_column(String(50), default="math") # math, logic, memory, riddle
    difficulty_override: Mapped[str] = mapped_column(String(20), nullable=True) # None = use profile preference
    snooze_limit: Mapped[int] = mapped_column(default=3)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="alarms")