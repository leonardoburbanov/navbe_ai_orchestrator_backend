import asyncio
import shlex
from datetime import datetime
from typing import List, Dict, Any, Callable, Awaitable
from .models import Process, Execution, ProcessStatus
from sqlmodel import Session, create_engine, select

class ProcessEngine:
    """Core process execution engine for managing asynchronous tasks."""

    def __init__(self, db_engine):
        self.db_engine = db_engine
        self.running_tasks: Dict[int, asyncio.Task] = {}

    async def execute_process(self, execution_id: int, params: Dict[str, Any] = None):
        """Starts a process execution."""
        task = asyncio.create_task(self._run_execution(execution_id, params))
        self.running_tasks[execution_id] = task
        return task

    async def _run_execution(self, execution_id: int, params: Dict[str, Any] = None):
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
            execution.started_at = datetime.utcnow()
            session.add(execution)
            session.commit()

            steps = process.steps
            total_steps = len(steps)
            
            try:
                for index, step in enumerate(steps):
                    execution.progress = (index / total_steps) * 100
                    execution.logs += f"--- Starting step {index + 1}/{total_steps}: {step.get('type')} ---\n"
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
                execution.finished_at = datetime.utcnow()
                session.add(execution)
                session.commit()
                if execution_id in self.running_tasks:
                    del self.running_tasks[execution_id]

    async def _run_step(self, step: Dict[str, Any], execution: Execution, session: Session, params: Dict[str, Any]) -> bool:
        """Run a single step based on its type."""
        step_type = step.get("type")
        
        if step_type == "shell":
            command = step.get("command", "")
            # Simple parameter injection
            for key, value in params.items():
                command = command.replace(f"{{{{{key}}}}}", str(value))
            return await self._run_shell_step(command, execution, session)
        elif step_type == "python":
            code = step.get("code", "")
            for key, value in params.items():
                code = code.replace(f"{{{{{key}}}}}", str(value))
            return await self._run_shell_step(f"python -c {shlex.quote(code)}", execution, session)
        else:
            execution.logs += f"Unknown step type: {step_type}\n"
            return False

    async def _run_shell_step(self, command: str, execution: Execution, session: Session) -> bool:
        """Runs a shell command and captures logs."""
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
                    # Optimization: commit logs occasionally, not every line
                    # But for now, every line is easier for real-time visibility
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
