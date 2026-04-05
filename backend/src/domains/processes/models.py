from datetime import datetime, timezone
from typing import List, Optional, Dict, Any, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship, JSON, Column
from ..executions.models import ProcessStatus

if TYPE_CHECKING:
    from ..executions.models import Execution

class ProcessBase(SQLModel):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    # steps is a list of dicts: [{"type": "shell", "command": "echo hello"}]
    steps: List[Dict[str, Any]] = Field(default=[], sa_column=Column(JSON))

class Process(ProcessBase, table=True):
    executions: List["Execution"] = Relationship(back_populates="process")
    schedules: List["Schedule"] = Relationship(back_populates="process")

class Schedule(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    process_id: int = Field(foreign_key="process.id")
    # Support both cron expressions (e.g., "*/5 * * * *") and intervals (e.g., "60")
    expression: str 
    expression_type: str = Field(default="cron") # "cron" or "interval"
    params: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    is_active: bool = Field(default=True)
    last_run_at: Optional[datetime] = None
    next_run_at: Optional[datetime] = None
    
    process: Process = Relationship(back_populates="schedules")

class ExecutionStatus(SQLModel):
    id: int
    status: ProcessStatus
    started_at: Optional[datetime] = None

class ProcessReadWithExecutions(ProcessBase):
    recent_executions: List[ExecutionStatus] = []
