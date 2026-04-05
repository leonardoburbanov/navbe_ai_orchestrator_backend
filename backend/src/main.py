import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Session, select, text

from .core.config import settings
from .infrastructure.database import engine
from .api.deps import get_process_scheduler, get_execution_service
from .api.routers import processes, executions, schedules, notifications
from .infrastructure.connectors.mcp import MCPServer
from .domains.processes.models import Process

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB
    SQLModel.metadata.create_all(engine)

    # Simple migration for SQLite (adding columns if missing)
    if "sqlite" in str(engine.url):
        with engine.connect() as conn:
            try:
                # Check for execution table columns
                result = conn.execute(text("PRAGMA table_info(execution)"))
                columns = [row[1] for row in result.fetchall()]
                if "idempotency_key" not in columns:
                    print("Migrating: Adding idempotency_key to execution table")
                    conn.execute(text("ALTER TABLE execution ADD COLUMN idempotency_key VARCHAR"))
                    conn.commit()
                
                # Check for schedule table columns (expression_type, params, etc.)
                result = conn.execute(text("PRAGMA table_info(schedule)"))
                columns = [row[1] for row in result.fetchall()]
                if "expression_type" not in columns:
                    print("Migrating: Adding expression_type to schedule table")
                    conn.execute(text("ALTER TABLE schedule ADD COLUMN expression_type VARCHAR DEFAULT 'cron'"))
                    conn.commit()
                if "params" not in columns:
                    print("Migrating: Adding params to schedule table")
                    conn.execute(text("ALTER TABLE schedule ADD COLUMN params JSON"))
                    conn.commit()
                if "next_run_at" not in columns:
                    print("Migrating: Adding next_run_at to schedule table")
                    conn.execute(text("ALTER TABLE schedule ADD COLUMN next_run_at DATETIME"))
                    conn.commit()
            except Exception as e:
                print(f"Migration error: {e}")

    # Start the scheduler
    scheduler = get_process_scheduler()
    scheduler.start()
    await scheduler.sync_schedules()

    # Initialize MCP Server (runs in background)
    execution_service = get_execution_service()
    mcp_server = MCPServer(engine, execution_service)
    # MCP server would ideally be run as a separate process or background task
    # but here we just initialize it as it might be used via some interface.
    # In the original main.py, it was just created but not explicitly run
    # in the asyncio loop in a way that blocks.

    # Check for existing processes, add a default one if empty
    with Session(engine) as session:
        try:
            if not session.exec(select(Process)).first():
                from .domains.processes.models import Process as ProcessModel
                default_process = ProcessModel(
                    name="Hello World Process",
                    description="A simple process to test the orchestrator.",
                    steps=[
                        {"type": "shell", "command": "echo 'Hello from Navbe AI Orchestrator'"},
                        {"type": "shell", "command": "echo 'Sleeping for 3 seconds...'"},
                        {"type": "shell", "command": "sleep 3"},
                        {
                            "type": "resend",
                            "to": "onboarding@resend.dev",
                            "subject": "Test from Orchestrator",
                            "body": "<h1>Success!</h1><p>The process is running.</p>",
                        },
                        {"type": "shell", "command": "echo 'Execution complete!'"},
                    ],
                )
                session.add(default_process)
                session.commit()
        except Exception:
            pass  # Handle potential DB issues gracefully

    yield
    
    # Shutdown scheduler
    scheduler.stop()

app = FastAPI(title="AI Process Orchestrator", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(processes.router)
app.include_router(executions.router)
app.include_router(schedules.router)
app.include_router(notifications.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
