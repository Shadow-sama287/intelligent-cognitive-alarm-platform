from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Intelligent Cognitive Alarm Platform"
    API_V1_STR: str = "/api/v1"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "cognitive_user"
    POSTGRES_PASSWORD: str = "cognitive_password"
    POSTGRES_DB: str = "cognitive_alarm_db"
    MONGODB_URL: str = "mongodb://localhost:27017/cognitive_challenges"
    REDIS_URL: str = "redis://localhost:6379/0"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    model_config = {
        "env_file": ".env"
    }

settings = Settings()