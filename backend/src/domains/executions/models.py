from datetime import datetime
from enum import StrEnum
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from ..processes.models import Process


class ProcessStatus(StrEnum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class Execution(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    process_id: int = Field(foreign_key="process.id")
    status: ProcessStatus = Field(default=ProcessStatus.PENDING)
    started_at: datetime | None = None
    finished_at: datetime | None = None

    # Store logs and current progress
    logs: str = Field(default="")
    progress: float = Field(default=0.0)

    # Idempotency key to prevent duplicate executions
    idempotency_key: str | None = Field(default=None, index=True)

    process: "Process" = Relationship(back_populates="executions")
