import enum
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Enum as SQLEnum,
    Integer,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.session import Base


class Role(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"
    COACH = "COACH"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    role: Mapped[Role] = mapped_column(
        SQLEnum(Role),
        default=Role.USER,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    profile: Mapped["UserProfile"] = relationship(
        "UserProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"),
        unique=True,
        nullable=False,
    )

    preferred_wake_time: Mapped[str] = mapped_column(
        String(10),
        default="07:00",
    )

    target_sleep_hours: Mapped[float] = mapped_column(
        default=8.0,
    )

    time_zone: Mapped[str] = mapped_column(
        String(50),
        default="UTC",
    )

    difficulty_preference: Mapped[str] = mapped_column(
        String(20),
        default="Medium",
    )

    productivity_goals: Mapped[str] = mapped_column(
        String(500),
        nullable=True,
    )

    snooze_limit: Mapped[int] = mapped_column(
        Integer,
        default=3,
    )

    escalate_difficulty: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    time_penalty_enabled: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    fcm_token: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="profile",
    )
    
class CoachStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class CoachClient(Base):
    __tablename__ = "coach_clients"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    coach_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    client_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    status: Mapped[CoachStatus] = mapped_column(
        SQLEnum(CoachStatus),
        default=CoachStatus.PENDING,
        nullable=False,
    )

    assigned_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    coach: Mapped["User"] = relationship("User", foreign_keys=[coach_id])
    client: Mapped["User"] = relationship("User", foreign_keys=[client_id])