import asyncio
from sqlmodel import create_engine
from src.core.config import settings
from src.domains.executions.services import ExecutionService
from src.infrastructure.connectors.mcp import MCPServer

async def main():
    db_engine = create_engine(settings.DATABASE_URL)
    execution_service = ExecutionService(db_engine)
    mcp_server = MCPServer(db_engine, execution_service)
    await mcp_server.run()

if __name__ == "__main__":
    asyncio.run(main())
