from app.db.session import Base
from app.models.user import User, UserProfile, Role
from app.models.alarm import Alarm

# Import all models here so Alembic / SQLAlchemy metadata recognizes them