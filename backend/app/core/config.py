from pydantic_settings import BaseSettings
from urllib.parse import quote_plus

class Settings(BaseSettings):
    PROJECT_NAME: str = "Intelligent Cognitive Alarm Platform"
    API_V1_STR: str = "/api/v1"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "admin@123"
    POSTGRES_DB: str = "cognitive_alarm_db"
    MONGODB_URL: str = "mongodb://localhost:27017/cognitive_challenges"
    REDIS_URL: str = "redis://localhost:6379/0"

    SECRET_KEY: str = "5b9d4e7a8c1f2e6d9a3b7c4f8e1d6a9b3c7f2e8d1a6b9c4e7f3d8a1b6c9e2d5"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        password = quote_plus(self.POSTGRES_PASSWORD)
        return (
            f"postgresql://{self.POSTGRES_USER}:{password}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    model_config = {
        "env_file": ".env"
    }

settings = Settings()