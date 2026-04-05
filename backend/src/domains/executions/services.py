import asyncio
import hashlib
import json
import shlex
from datetime import UTC, datetime
from typing import Any

from sqlmodel import Session, select

from ...infrastructure.connectors.resend import send_email
from ..processes.models import Process
from .models import Execution, ProcessStatus


class ExecutionService:
    """Service for managing and running process executions."""

    def __init__(self, db_engine):
        self.db_engine = db_engine
        self.running_tasks: dict[int, asyncio.Task] = {}

    def get_execution(self, execution_id: int) -> Execution | None:
        with Session(self.db_engine) as session:
            return session.get(Execution, execution_id)

    def get_all_executions(self, limit: int = 20) -> list[dict[str, Any]]:
        with Session(self.db_engine) as session:
            results = session.exec(
                select(Execution, Process.name.label("process_name"))
                .join(Process)
                .order_by(Execution.started_at.desc())
                .limit(limit)
            ).all()
            
            executions = []
            for execution, process_name in results:
                data = execution.model_dump()
                data["process_name"] = process_name
                executions.append(data)
            return executions

    def get_process_executions(self, process_id: int) -> list[Execution]:
        with Session(self.db_engine) as session:
            return session.exec(
                select(Execution).where(Execution.process_id == process_id)
            ).all()

    async def create_execution(
        self, process_id: int, params: dict[str, Any] | None = None
    ) -> Execution:
        with Session(self.db_engine) as session:
            process = session.get(Process, process_id)
            if not process:
                raise ValueError("Process not found")

            execution = Execution(process_id=process_id)
            session.add(execution)
            session.commit()
            session.refresh(execution)
            
            # Trigger execution
            await self.execute_process(execution.id, params)
            return execution

    def _generate_idempotency_key(
        self, process_id: int, params: dict[str, Any]
    ) -> str:
        """Generates a SHA-256 hash based on process, parameters and a bucket."""
        now = datetime.now(UTC)
        bucket = (now.minute // 5)
        key_data = {
            "process_id": process_id,
            "params": params,
            "day": now.day,
            "hour": now.hour,
            "bucket": bucket
        }
        key_str = json.dumps(key_data, sort_keys=True)
        return hashlib.sha256(key_str.encode()).hexdigest()

    async def execute_process(self, execution_id: int, params: dict[str, Any] = None):
        """Starts a process execution with idempotency check."""
        params = params or {}
        
        with Session(self.db_engine) as session:
            execution = session.get(Execution, execution_id)
            if not execution:
                return

            key = self._generate_idempotency_key(execution.process_id, params)
            execution.idempotency_key = key
            
            existing = session.exec(
                select(Execution).where(
                    Execution.idempotency_key == key,
                    Execution.status.in_(
                        [ProcessStatus.PENDING, ProcessStatus.RUNNING]
                    ),
                    Execution.id != execution_id
                )
            ).first()
            
            if existing:
                execution.status = ProcessStatus.FAILED
                execution.logs = (
                    f"Execution aborted: Duplicate found (Execution ID {existing.id}) "
                    "for the same parameters within the current time window.\n"
                )
                execution.finished_at = datetime.now(UTC)
                session.add(execution)
                session.commit()
                return

            session.add(execution)
            session.commit()

        task = asyncio.create_task(self._run_execution(execution_id, params))
        self.running_tasks[execution_id] = task
        return task

    async def _run_execution(self, execution_id: int, params: dict[str, Any] = None):
        """Internal runner for a process execution."""
        params = params or {}
        with Session(self.db_engine) as session:
            execution = session.get(Execution, execution_id)
            if not execution:
                return

            process = session.get(Process, execution.process_id)
            if not process:
                execution.status = ProcessStatus.FAILED
                execution.logs += "Process definition not found.\n"
                session.add(execution)
                session.commit()
                return

            execution.status = ProcessStatus.RUNNING
            execution.started_at = datetime.now(UTC)
            session.add(execution)
            session.commit()

            steps = process.steps
            total_steps = len(steps)
            
            try:
                for index, step in enumerate(steps):
                    execution.progress = (index / total_steps) * 100
                    execution.logs += (
                        f"--- Starting step {index + 1}/{total_steps}: "
                        f"{step.get('type')} ---\n"
                    )
                    session.add(execution)
                    session.commit()

                    success = await self._run_step(step, execution, session, params)
                    if not success:
                        execution.status = ProcessStatus.FAILED
                        execution.logs += f"Step {index + 1} failed.\n"
                        break
                else:
                    execution.status = ProcessStatus.COMPLETED
                    execution.progress = 100.0
            except Exception as e:
                execution.status = ProcessStatus.FAILED
                execution.logs += f"Unhandled error: {str(e)}\n"
            finally:
                execution.finished_at = datetime.now(UTC)
                session.add(execution)
                session.commit()
                if execution_id in self.running_tasks:
                    del self.running_tasks[execution_id]

    async def _run_step(
        self, 
        step: dict[str, Any], 
        execution: Execution, 
        session: Session, 
        params: dict[str, Any]
    ) -> bool:
        step_type = step.get("type")
        
        if step_type == "shell":
            command = step.get("command", "")
            for key, value in params.items():
                command = command.replace(f"{{{{{key}}}}}", str(value))
            return await self._run_shell_step(command, execution, session)
        elif step_type == "python":
            code = step.get("code", "")
            for key, value in params.items():
                code = code.replace(f"{{{{{key}}}}}", str(value))
            return await self._run_shell_step(
                f"python -c {shlex.quote(code)}", execution, session
            )
        elif step_type == "resend":
            return await self._run_resend_step(step, execution, session, params)
        else:
            execution.logs += f"Unknown step type: {step_type}\n"
            return False

    async def _run_shell_step(
        self, command: str, execution: Execution, session: Session
    ) -> bool:
        try:
            process = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )

            async def read_stream(stream, prefix=""):
                while True:
                    line = await stream.readline()
                    if not line:
                        break
                    execution.logs += f"{prefix}{line.decode().strip()}\n"
                    session.add(execution)
                    session.commit()

            await asyncio.gather(
                read_stream(process.stdout),
                read_stream(process.stderr, prefix="ERROR: ")
            )

            await process.wait()
            return process.returncode == 0
        except Exception as e:
            execution.logs += f"Shell execution error: {str(e)}\n"
            return False

    async def _run_resend_step(
        self, 
        step: dict[str, Any], 
        execution: Execution, 
        session: Session, 
        params: dict[str, Any]
    ) -> bool:
        try:
            to = step.get("to", "")
            subject = step.get("subject", "")
            body = step.get("body", "")
            from_email = step.get("from_email", "onboarding@resend.dev")

            for key, value in params.items():
                to = to.replace(f"{{{{{key}}}}}", str(value))
                subject = subject.replace(f"{{{{{key}}}}}", str(value))
                body = body.replace(f"{{{{{key}}}}}", str(value))
                from_email = from_email.replace(f"{{{{{key}}}}}", str(value))

            execution.logs += f"Sending email from {from_email} to {to} via Resend...\n"
            session.add(execution)
            session.commit()

            response = send_email(
                to=to, subject=subject, body=body, from_email=from_email
            )
            
            execution.logs += f"Resend response: {response}\n"
            session.add(execution)
            session.commit()
            return True
        except Exception as e:
            execution.logs += f"Resend execution error: {str(e)}\n"
            session.add(execution)
            session.commit()
            return False
