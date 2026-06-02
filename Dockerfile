# ── Stage 1: Build React frontend ─────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Python backend + serve frontend ──────────────────────────────────
FROM python:3.12-slim

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Python deps (install without whisper first for faster builds)
COPY backend/requirements.txt ./
# Install all deps except openai-whisper (heavy) separately
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend into expected location
COPY --from=frontend-builder /frontend/dist ./frontend/dist

WORKDIR /app/backend

EXPOSE 8000

CMD ["sh", "-c", "python3 -m alembic upgrade head && python3 scripts/seed.py && python3 -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
