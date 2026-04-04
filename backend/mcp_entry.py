import asyncio
from sqlmodel import create_engine
from .main import DATABASE_URL
from .engine import ProcessEngine
from .mcp_server import MCPServer

async def main():
    db_engine = create_engine(DATABASE_URL)
    process_engine = ProcessEngine(db_engine)
    mcp_server = MCPServer(db_engine, process_engine)
    await mcp_server.run()

if __name__ == "__main__":
    asyncio.run(main())
