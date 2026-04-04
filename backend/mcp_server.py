import asyncio
from typing import List, Dict, Any, Optional
from mcp.server import Server
from mcp import types
from sqlmodel import Session, select, create_engine
from .models import Process, Execution, ProcessStatus
from .engine import ProcessEngine

class MCPServer:
    """MCP server to expose process management tools to AI agents."""

    def __init__(self, db_engine, process_engine: ProcessEngine):
        self.db_engine = db_engine
        self.process_engine = process_engine
        self.server = Server("ai-process-orchestrator")
        # Experimental task support for long-running processes
        # self.server.experimental.enable_tasks()
        
        self._register_handlers()

    def _register_handlers(self):
        """Register the MCP tool and prompt handlers."""

        @self.server.list_tools()
        async def list_tools() -> List[types.Tool]:
            return [
                types.Tool(
                    name="list_available_processes",
                    description="List all defined processes that can be orchestrated.",
                    input_schema={
                        "type": "object",
                        "properties": {}
                    }
                ),
                types.Tool(
                    name="execute_process",
                    description="Trigger the execution of a process by its name.",
                    input_schema={
                        "type": "object",
                        "properties": {
                            "name": {"type": "string", "description": "The name of the process to execute."},
                            "params": {"type": "object", "description": "Parameters to pass to the process steps."}
                        },
                        "required": ["name"]
                    }
                ),
                types.Tool(
                    name="get_execution_status",
                    description="Retrieve the current status of a specific execution.",
                    input_schema={
                        "type": "object",
                        "properties": {
                            "execution_id": {"type": "integer", "description": "The ID of the execution to check."}
                        },
                        "required": ["execution_id"]
                    }
                )
            ]

        @self.server.call_tool()
        async def call_tool(name: str, arguments: Dict[str, Any]) -> types.CallToolResult:
            if name == "list_available_processes":
                with Session(self.db_engine) as session:
                    processes = session.exec(select(Process)).all()
                    result = [{"id": p.id, "name": p.name, "description": p.description} for p in processes]
                    return types.CallToolResult(content=[types.TextContent(type="text", text=str(result))])

            elif name == "execute_process":
                process_name = arguments.get("name")
                with Session(self.db_engine) as session:
                    process = session.exec(select(Process).where(Process.name == process_name)).first()
                    if not process:
                        return types.CallToolResult(
                            content=[types.TextContent(type="text", text=f"Process '{process_name}' not found.")],
                            is_error=True
                        )
                    
                    execution = Execution(process_id=process.id)
                    session.add(execution)
                    session.commit()
                    session.refresh(execution)
                    
                    # Start execution asynchronously
                    params = arguments.get("params", {})
                    await self.process_engine.execute_process(execution.id, params)
                    
                    return types.CallToolResult(
                        content=[types.TextContent(type="text", text=f"Execution {execution.id} started for process '{process_name}'.")]
                    )

            elif name == "get_execution_status":
                exec_id = arguments.get("execution_id")
                with Session(self.db_engine) as session:
                    execution = session.get(Execution, exec_id)
                    if not execution:
                        return types.CallToolResult(
                            content=[types.TextContent(type="text", text=f"Execution {exec_id} not found.")],
                            is_error=True
                        )
                    
                    status_info = {
                        "id": execution.id,
                        "status": execution.status,
                        "progress": execution.progress,
                        "started_at": str(execution.started_at),
                        "finished_at": str(execution.finished_at),
                        "logs_preview": execution.logs[-500:] if execution.logs else ""
                    }
                    return types.CallToolResult(content=[types.TextContent(type="text", text=str(status_info))])

            else:
                return types.CallToolResult(
                    content=[types.TextContent(type="text", text=f"Unknown tool: {name}")],
                    is_error=True
                )

    async def run(self):
        """Run the MCP server over standard I/O."""
        import mcp.server.stdio
        async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
            await self.server.run(
                read_stream,
                write_stream,
                self.server.create_initialization_options()
            )
