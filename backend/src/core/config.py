import os

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings using Pydantic Settings."""
    
    # Database
    DATABASE_URL: str = "sqlite:///orchestrator.db"
    
    # Resend
    RESEND_API_KEY: str | None = None
    
    model_config = SettingsConfigDict(
        # Point to the .env file in the backend root directory
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
