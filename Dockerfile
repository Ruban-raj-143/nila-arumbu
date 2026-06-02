# ── Stage 1: Build React frontend ────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
# Build with Railway backend as API URL (same origin — no VITE_API_URL needed)
RUN npm run build

# ── Stage 2: Python backend ───────────────────────────────────────────────────
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Backend code → /app/backend/
COPY backend/ ./backend/

# Frontend dist → /app/frontend/dist/
COPY --from=frontend-builder /frontend/dist ./frontend/dist

RUN ls /app/frontend/dist/

WORKDIR /app/backend

EXPOSE 8000

CMD ["sh", "-c", "python3 -m alembic upgrade head && python3 scripts/seed.py && python3 -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
