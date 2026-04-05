import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    """Application settings using Pydantic Settings."""
    
    # Database
    DATABASE_URL: str = "sqlite:///orchestrator.db"
    
    # Resend
    RESEND_API_KEY: Optional[str] = None
    
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend", ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
