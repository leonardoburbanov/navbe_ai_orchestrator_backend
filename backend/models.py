from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any
from sqlmodel import Field, SQLModel, Relationship, JSON, Column

class ProcessStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class Process(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    # steps is a list of dicts: [{"type": "shell", "command": "echo hello"}]
    steps: List[Dict[str, Any]] = Field(default=[], sa_column=Column(JSON))
    
    executions: List["Execution"] = Relationship(back_populates="process")

class Execution(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    process_id: int = Field(foreign_key="process.id")
    status: ProcessStatus = Field(default=ProcessStatus.PENDING)
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    
    # Store logs and current progress
    logs: str = Field(default="")
    progress: float = Field(default=0.0)
    
    process: Process = Relationship(back_populates="executions")
