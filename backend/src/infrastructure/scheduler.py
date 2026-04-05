from datetime import UTC, datetime

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from sqlmodel import Session, select

from ..domains.executions.models import Execution
from ..domains.executions.services import ExecutionService
from ..domains.processes.models import Schedule


class ProcessScheduler:
    """Infrastructure service for scheduling processes."""

    def __init__(self, db_engine, execution_service: ExecutionService):
        self.db_engine = db_engine
        self.execution_service = execution_service
        self.scheduler = AsyncIOScheduler()
        self._job_ids: dict[int, str] = {}

    def start(self):
        """Starts the background scheduler."""
        if not self.scheduler.running:
            self.scheduler.start()
            print("Process Scheduler started.")

    def stop(self):
        """Stops the scheduler."""
        if self.scheduler.running:
            self.scheduler.shutdown()
            print("Process Scheduler stopped.")

    async def sync_schedules(self):
        """Syncs all active schedules from the database with the scheduler."""
        with Session(self.db_engine) as session:
            schedules = session.exec(
                select(Schedule).where(Schedule.is_active)
            ).all()
            
            # Remove jobs that are no longer in the DB or are now inactive
            active_schedule_ids = {s.id for s in schedules}
            for schedule_id, job_id in list(self._job_ids.items()):
                if schedule_id not in active_schedule_ids:
                    self.remove_schedule(schedule_id)

            # Add or update schedules
            for schedule in schedules:
                self.add_or_update_schedule(schedule)

    def add_or_update_schedule(self, schedule: Schedule):
        """Adds or updates a single schedule in the APScheduler."""
        job_id = f"schedule_{schedule.id}"
        
        # Remove existing job if it exists to update it
        if schedule.id in self._job_ids:
            self.remove_schedule(schedule.id)

        try:
            if schedule.expression_type == "cron":
                trigger = CronTrigger.from_crontab(schedule.expression)
            elif schedule.expression_type == "interval":
                trigger = IntervalTrigger(seconds=int(schedule.expression))
            else:
                print(
                    f"Unknown expression type: {schedule.expression_type} "
                    f"for schedule {schedule.id}"
                )
                return

            self.scheduler.add_job(
                self._run_scheduled_process,
                trigger,
                args=[schedule.id],
                id=job_id,
                replace_existing=True
            )
            self._job_ids[schedule.id] = job_id
            
            # Update next run time in DB
            next_run = trigger.get_next_fire_time(None, datetime.now(UTC))
            if next_run:
                with Session(self.db_engine) as session:
                    db_schedule = session.get(Schedule, schedule.id)
                    if db_schedule:
                        db_schedule.next_run_at = next_run
                        session.add(db_schedule)
                        session.commit()
                        
        except Exception as e:
            print(f"Error adding schedule {schedule.id}: {str(e)}")

    def remove_schedule(self, schedule_id: int):
        """Removes a schedule from the APScheduler."""
        if schedule_id in self._job_ids:
            try:
                self.scheduler.remove_job(self._job_ids[schedule_id])
                del self._job_ids[schedule_id]
                
                with Session(self.db_engine) as session:
                    db_schedule = session.get(Schedule, schedule_id)
                    if db_schedule:
                        db_schedule.next_run_at = None
                        session.add(db_schedule)
                        session.commit()
            except Exception as e:
                print(f"Error removing job for schedule {schedule_id}: {str(e)}")

    async def _run_scheduled_process(self, schedule_id: int):
        """Callback to execute a process triggered by a schedule."""
        with Session(self.db_engine) as session:
            schedule = session.get(Schedule, schedule_id)
            if not schedule or not schedule.is_active:
                return

            # Create an execution for the scheduled process
            execution = Execution(process_id=schedule.process_id)
            session.add(execution)
            session.commit()
            session.refresh(execution)
            
            # Update last run and next run
            schedule.last_run_at = datetime.now(UTC)
            job = self.scheduler.get_job(self._job_ids[schedule_id])
            if job:
                schedule.next_run_at = job.next_run_time

            session.add(schedule)
            session.commit()

            # Trigger the execution via the execution service
            await self.execution_service.execute_process(execution.id, schedule.params)
