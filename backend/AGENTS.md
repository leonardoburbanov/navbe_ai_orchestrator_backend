# Backend Development Guidelines (AGENTS.md)

This document defines the architecture, standards, and best practices for the backend of the Navbe AI Orchestrator.

## 🚀 Core Principles

### 1. Modular Architecture (DDD-ish)
The backend is structured into **Domains**. Each domain represents a specific business feature (e.g., Processes, Executions). This allows for clear separation of concerns and makes it easy to migrate complex logic to other languages like Go or Rust in the future.

### 2. Dependency Injection (DI)
We use FastAPI's `Depends` for dependency injection. All external resources (DB sessions, API clients, complex engines) should be injected into the routers or services. This makes the code testable and allows swapping implementations easily.

### 3. Strict Typing & Validation
- **Pydantic v2**: All request bodies and response models must use Pydantic models.
- **SQLModel**: Used for database entities, combining the power of SQLAlchemy and Pydantic.
- **Type Hints**: Mandatory for all function signatures and variables.

## 📂 Proposed Directory Structure

To maintain scalability, we follow this structure:

- `backend/src/api/`: FastAPI routers and endpoints.
- `backend/src/core/`: Global configurations, security, and shared constants.
- `backend/src/domains/`: Feature-specific logic.
  - `processes/`: Models, services, and repositories for process management.
  - `executions/`: Logic for running workflows.
- `backend/src/infrastructure/`: Implementations of external services.
  - `database.py`: Session management and engine setup.
  - `connectors/`: Clients for Resend, MCP, Shell execution, etc.

## 🛠️ Modularity & Swappability (Go/Rust readiness)

To ensure we can scale components like the **Process Engine** to Go or Rust, we define clear interfaces (Protocols) and use Dependency Injection.

### Example Service with DI:

```python
from typing import Protocol, Annotated
from fastapi import Depends
from sqlmodel import Session
from .models import Process, Execution
from .engine import WorkflowEngine # Our protocol/interface

class ProcessService:
    def __init__(self, session: Session, engine: WorkflowEngine):
        self.session = session
        self.engine = engine

    async def create_execution(self, process_id: int, params: dict | None) -> Execution:
        process = self.session.get(Process, process_id)
        if not process:
            raise HTTPException(status_code=404, detail="Process not found")
        
        execution = Execution(process_id=process_id)
        self.session.add(execution)
        self.session.commit()
        self.session.refresh(execution)
        
        await self.engine.execute_process(execution.id, params)
        return execution

# Router using the service
@router.post("/executions", response_model=Execution)
async def run_process(
    process_id: int, 
    params: dict | None = None,
    service: ProcessService = Depends(get_process_service)
):
    """
    Launches a new execution for a given process.
    """
    return await service.create_execution(process_id, params)
```

## ✅ Quality Control & Tooling

We use the fastest and most modern tools in the Python ecosystem:

- **Package Manager**: [uv](https://github.com/astral-sh/uv) - extremely fast pip replacement.
- **Type Checker**: [ty](https://docs.astral-sh.io/ty/) - fast type checking (`uvx ty check`).
- **Linter & Formatter**: [ruff](https://github.com/astral-sh/ruff) - fast linting and formatting.

### Verification Commands

Add these to your workflow (or `scripts` in `pyproject.toml`):

- `uvx ty check`: Run type checking across the project.
- `ruff check .`: Check for linting errors and fixable issues.
- `ruff format .`: Format the code according to the project style.

## ❌ What to Avoid
- **Circular Dependencies**: Keep domain logic isolated.
- **Direct DB access in Routers**: Always use a Service or Repository layer.
- **Global State**: Avoid global variables for configuration or shared resources; use DI.
- **Large Functions**: Break down complex logic into small, testable units.

---
*Follow these rules to keep the backend robust and ready for the future.*
