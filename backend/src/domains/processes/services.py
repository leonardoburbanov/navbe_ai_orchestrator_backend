from sqlmodel import Session, col, select

from ..executions.models import Execution
from .models import ExecutionStatus, Process, ProcessReadWithExecutions, Schedule


class ProcessService:
    def __init__(self, session: Session):
        self.session = session

    def create_process(self, process: Process) -> Process:
        self.session.add(process)
        self.session.commit()
        self.session.refresh(process)
        return process

    def get_processes(self) -> list[ProcessReadWithExecutions]:
        processes = list(self.session.exec(select(Process)).all())
        results = []
        for process in processes:
            # Get last 5 executions for the dashboard (Airflow style)
            executions = list(
                self.session.exec(
                    select(Execution)
                    .where(Execution.process_id == process.id)
                    .order_by(col(Execution.id).desc())
                    .limit(5)
                ).all()
            )

            # Reverse for chronological display
            executions.reverse()

            recent = [
                ExecutionStatus(
                    id=e.id if e.id is not None else 0,
                    status=e.status,
                    started_at=e.started_at,
                )
                for e in executions
            ]

            process_with_execs = ProcessReadWithExecutions.model_validate(process)
            process_with_execs.recent_executions = recent
            results.append(process_with_execs)
        return results

    def get_process(self, process_id: int) -> Process | None:
        return self.session.get(Process, process_id)

    def create_schedule(self, schedule: Schedule) -> Schedule:
        self.session.add(schedule)
        self.session.commit()
        self.session.refresh(schedule)
        return schedule

    def get_schedules(self) -> list[Schedule]:
        return list(self.session.exec(select(Schedule)).all())

    def get_process_schedules(self, process_id: int) -> list[Schedule]:
        return list(
            self.session.exec(
                select(Schedule).where(Schedule.process_id == process_id)
            ).all()
        )

    def delete_schedule(self, schedule_id: int) -> bool:
        schedule = self.session.get(Schedule, schedule_id)
        if schedule:
            self.session.delete(schedule)
            self.session.commit()
            return True
        return False

    def toggle_schedule(self, schedule_id: int) -> Schedule | None:
        schedule = self.session.get(Schedule, schedule_id)
        if schedule:
            schedule.is_active = not schedule.is_active
            self.session.add(schedule)
            self.session.commit()
            self.session.refresh(schedule)
            return schedule
        return None
