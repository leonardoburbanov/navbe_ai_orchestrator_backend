from datetime import UTC, datetime
from typing import TYPE_CHECKING, Any

from sqlmodel import JSON, Column, Field, Relationship, SQLModel

from ..executions.models import ProcessStatus

if TYPE_CHECKING:
    from ..executions.models import Execution


class ProcessBase(SQLModel):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    description: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    # steps is a list of dicts: [{"type": "shell", "command": "echo hello"}]
    steps: list[dict[str, Any]] = Field(default=[], sa_column=Column(JSON))


class Process(ProcessBase, table=True):
    executions: list["Execution"] = Relationship(back_populates="process")
    schedules: list["Schedule"] = Relationship(back_populates="process")


class Schedule(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    process_id: int = Field(foreign_key="process.id")
    # Support both cron expressions (e.g., "*/5 * * * *") and intervals (e.g., "60")
    expression: str
    expression_type: str = Field(default="cron")  # "cron" or "interval"
    params: dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    is_active: bool = Field(default=True)
    last_run_at: datetime | None = None
    next_run_at: datetime | None = None

    process: Process = Relationship(back_populates="schedules")


class ExecutionStatus(SQLModel):
    id: int
    status: ProcessStatus
    started_at: datetime | None = None


class ProcessReadWithExecutions(ProcessBase):
    recent_executions: list[ExecutionStatus] = []
