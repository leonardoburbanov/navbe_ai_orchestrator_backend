FROM python:3.13-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set environment variables
ENV UV_PROJECT_ENVIRONMENT=/venv
ENV PATH="/venv/bin:$PATH"

WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# Copy project files and sync dependencies
# We copy pyproject.toml first to leverage Docker layer caching
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev

# Copy the rest of the application
COPY . .

EXPOSE 8000

# Run the application using the synced virtual environment
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
