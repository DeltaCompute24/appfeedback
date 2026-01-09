import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = os.getenv("DATABASE_URL", "postgresql://localhost/appfeedback")
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    environment: str = os.getenv("ENVIRONMENT", "development")

    # Credits configuration
    credits_submission: int = 10
    credits_top_ranked: int = 50
    credits_developed: int = 500
    credits_bug_verified: int = 25

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
