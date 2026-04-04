import asyncio
import os
from contextlib import asynccontextmanager
from typing import List, Optional, Dict, Any

import uvicorn
from fastapi import FastAPI, HTTPException, Depends
from sqlmodel import Session, SQLModel, create_engine, select
from starlette.middleware.cors import CORSMiddleware

from .models import Process, Execution, ProcessStatus
from .engine import ProcessEngine
from .mcp_server import MCPServer

# Configuration
DATABASE_URL = "sqlite:///orchestrator.db"
engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})
process_engine = ProcessEngine(engine)
mcp_server = MCPServer(engine, process_engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB
    SQLModel.metadata.create_all(engine)
    
    # Check for existing processes, add a default one if empty
    with Session(engine) as session:
        # Check if table exists (it should after create_all)
        try:
            if not session.exec(select(Process)).first():
                default_process = Process(
                    name="Hello World Process",
                    description="A simple process to test the orchestrator.",
                    steps=[
                        {"type": "shell", "command": "echo 'Hello from Navbe AI Orchestrator'"},
                        {"type": "shell", "command": "echo 'Sleeping for 3 seconds...'"},
                        {"type": "shell", "command": "sleep 3"},
                        {"type": "shell", "command": "echo 'Execution complete!'"}
                    ]
                )
                session.add(default_process)
                session.commit()
        except Exception:
            pass # Handle potential DB issues gracefully
    
    yield

app = FastAPI(title="AI Process Orchestrator", lifespan=lifespan)

# Add CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_session():
    with Session(engine) as session:
        yield session

@app.post("/processes", response_model=Process)
def create_process(process: Process, session: Session = Depends(get_session)):
    session.add(process)
    session.commit()
    session.refresh(process)
    return process

@app.get("/processes", response_model=List[Process])
def read_processes(session: Session = Depends(get_session)):
    processes = session.exec(select(Process)).all()
    return processes

@app.get("/processes/{process_id}", response_model=Process)
def read_process(process_id: int, session: Session = Depends(get_session)):
    process = session.get(Process, process_id)
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")
    return process

@app.post("/executions", response_model=Execution)
async def create_execution(process_id: int, params: Optional[Dict[str, Any]] = None, session: Session = Depends(get_session)):
    process = session.get(Process, process_id)
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")
    
    execution = Execution(process_id=process_id)
    session.add(execution)
    session.commit()
    session.refresh(execution)
    
    # Start execution asynchronously
    await process_engine.execute_process(execution.id, params)
    return execution

@app.get("/executions/{execution_id}", response_model=Execution)
def read_execution(execution_id: int, session: Session = Depends(get_session)):
    execution = session.get(Execution, execution_id)
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    return execution

@app.get("/processes/{process_id}/executions", response_model=List[Execution])
def read_process_executions(process_id: int, session: Session = Depends(get_session)):
    executions = session.exec(select(Execution).where(Execution.process_id == process_id)).all()
    return executions

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
