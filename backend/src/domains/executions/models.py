from enum import Enum
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from ..processes.models import Process

class ProcessStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class Execution(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    process_id: int = Field(foreign_key="process.id")
    status: ProcessStatus = Field(default=ProcessStatus.PENDING)
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    
    # Store logs and current progress
    logs: str = Field(default="")
    progress: float = Field(default=0.0)
    
    # Idempotency key to prevent duplicate executions
    idempotency_key: Optional[str] = Field(default=None, index=True)
    
    process: "Process" = Relationship(back_populates="executions")
