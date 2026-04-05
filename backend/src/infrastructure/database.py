from sqlmodel import Session, create_engine

from ..core.config import settings

# Database Configuration
DATABASE_URL = settings.DATABASE_URL
engine = create_engine(
    DATABASE_URL, echo=False, connect_args={"check_same_thread": False}
)


def get_session():
    """Generator for database sessions."""
    with Session(engine) as session:
        yield session
