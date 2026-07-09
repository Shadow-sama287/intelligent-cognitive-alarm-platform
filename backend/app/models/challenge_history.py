import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Text, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base


class UserChallengeHistory(Base):
    __tablename__ = "user_challenge_history"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(20), nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    correct_answer: Mapped[str] = mapped_column(String(500), nullable=False)
    # Performance logging columns
    time_taken_seconds: Mapped[float] = mapped_column(Float, nullable=True)
    attempts: Mapped[int] = mapped_column(Integer, nullable=True)
    solved_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
