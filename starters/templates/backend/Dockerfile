# Python sidecar — uv-based, per agentic-central-reporting's pattern:
# pinned uv copied from the astral image, Debian slim (NOT Alpine — numpy/pandas
# ship manylinux glibc wheels; musl forces source builds), non-root user.
# Build: docker build -t backend ./backend
FROM python:3.12-slim-bookworm

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 LLM_PROVIDER=api PORT=8000

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

COPY pyproject.toml uv.lock* ./
RUN uv sync --frozen --no-dev --no-install-project || uv sync --no-dev --no-install-project

COPY . .
RUN useradd -m app && chown -R app:app /app
USER app
EXPOSE 8000
CMD ["uv", "run", "--no-sync", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
