
from fastapi import APIRouter, Depends, HTTPException

from ...domains.processes.models import Process, ProcessReadWithExecutions
from ...domains.processes.services import ProcessService
from ..deps import get_process_service

router = APIRouter(prefix="/processes", tags=["Processes"])

@router.post("", response_model=Process)
def create_process(
    process: Process, 
    service: ProcessService = Depends(get_process_service)
):
    """
    Creates a new process definition in the database.
    """
    return service.create_process(process)

@router.get("", response_model=list[ProcessReadWithExecutions])
def read_processes(service: ProcessService = Depends(get_process_service)):
    """
    Retrieves all available processes.
    """
    return service.get_processes()

@router.get("/{process_id}", response_model=Process)
def read_process(
    process_id: int, 
    service: ProcessService = Depends(get_process_service)
):
    """
    Retrieves a single process by its ID.
    """
    process = service.get_process(process_id)
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")
    return process
