
from fastapi import APIRouter, Depends, HTTPException

from ...domains.processes.models import Schedule
from ...domains.processes.services import ProcessService
from ...infrastructure.scheduler import ProcessScheduler
from ..deps import get_process_scheduler, get_process_service

router = APIRouter(prefix="/schedules", tags=["Schedules"])

@router.get("", response_model=list[Schedule])
def read_schedules(service: ProcessService = Depends(get_process_service)):
    """Retrieves all schedules."""
    return service.get_schedules()

@router.post("", response_model=Schedule)
async def create_schedule(
    schedule: Schedule, 
    service: ProcessService = Depends(get_process_service),
    scheduler: ProcessScheduler = Depends(get_process_scheduler)
):
    """Creates a new schedule and registers it in the scheduler."""
    schedule = service.create_schedule(schedule)
    if schedule.is_active:
        scheduler.add_or_update_schedule(schedule)
    return schedule

@router.get("/process/{process_id}", response_model=list[Schedule])
def read_process_schedules(process_id: int, service: ProcessService = Depends(get_process_service)):
    """Retrieves schedules for a specific process."""
    return service.get_process_schedules(process_id)

@router.delete("/{schedule_id}")
def delete_schedule(
    schedule_id: int, 
    service: ProcessService = Depends(get_process_service),
    scheduler: ProcessScheduler = Depends(get_process_scheduler)
):
    """Deletes a schedule and removes it from the scheduler."""
    scheduler.remove_schedule(schedule_id)
    if service.delete_schedule(schedule_id):
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="Schedule not found")

@router.patch("/{schedule_id}/toggle", response_model=Schedule)
def toggle_schedule(
    schedule_id: int, 
    service: ProcessService = Depends(get_process_service),
    scheduler: ProcessScheduler = Depends(get_process_scheduler)
):
    """Toggles the active state of a schedule."""
    schedule = service.toggle_schedule(schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
        
    if schedule.is_active:
        scheduler.add_or_update_schedule(schedule)
    else:
        scheduler.remove_schedule(schedule_id)
        
    return schedule
