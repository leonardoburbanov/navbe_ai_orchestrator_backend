from typing import Annotated
from fastapi import Depends
from sqlmodel import Session
from ..infrastructure.database import get_session, engine
from ..domains.processes.services import ProcessService
from ..domains.executions.services import ExecutionService
from ..infrastructure.scheduler import ProcessScheduler

# Global instances (initialized in main.py)
_execution_service = ExecutionService(engine)
_process_scheduler = ProcessScheduler(engine, _execution_service)

def get_process_service(session: Session = Depends(get_session)) -> ProcessService:
    return ProcessService(session)

def get_execution_service() -> ExecutionService:
    return _execution_service

def get_process_scheduler() -> ProcessScheduler:
    return _process_scheduler
