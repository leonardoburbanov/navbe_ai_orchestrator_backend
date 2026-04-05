from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from ...domains.executions.models import Execution
from ...domains.executions.services import ExecutionService
from ..deps import get_execution_service

router = APIRouter(prefix="/executions", tags=["Executions"])

@router.post("", response_model=Execution)
async def create_execution(
    process_id: int,
    params: Optional[Dict[str, Any]] = None,
    service: ExecutionService = Depends(get_execution_service),
):
    """
    Launches a new execution instance for a specific process.
    """
    try:
        return await service.create_execution(process_id, params)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{execution_id}", response_model=Execution)
def read_execution(execution_id: int, service: ExecutionService = Depends(get_execution_service)):
    execution = service.get_execution(execution_id)
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    return execution

@router.get("", response_model=List[Dict[str, Any]])
def read_all_executions(
    limit: int = 20, 
    service: ExecutionService = Depends(get_execution_service)
):
    """
    Retrieves latest executions across all processes, including process names.
    """
    return service.get_all_executions(limit)

@router.get("/process/{process_id}", response_model=List[Execution])
def read_process_executions(process_id: int, service: ExecutionService = Depends(get_execution_service)):
    return service.get_process_executions(process_id)
