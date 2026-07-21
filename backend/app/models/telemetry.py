import uuid
from datetime import datetime
from sqlalchemy import String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base

class SolveTelemetry(Base):
    __tablename__ = "solve_telemetry"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(20), nullable=False)
    solve_time_seconds: Mapped[float] = mapped_column(Float, nullable=False)
    attempts: Mapped[int] = mapped_column(Integer, default=1)
    snooze_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)