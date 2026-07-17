from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings


def _build_engine():
    database_url = settings.SQLALCHEMY_DATABASE_URI
    engine = create_engine(
        database_url,
        pool_pre_ping=True,
        echo=True,
    )
    with engine.connect() as connection:
        connection.exec_driver_sql("SELECT 1")
    return engine


engine = _build_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()