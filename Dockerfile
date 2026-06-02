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

# Python deps
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code → /app/backend/
COPY backend/ ./backend/

# Copy built frontend → /app/frontend/dist/
# main.py resolves: /app/backend/app/main.py → parent×3 = /app → /app/frontend/dist
COPY --from=frontend-builder /frontend/dist ./frontend/dist

# Verify the path exists at build time
RUN ls -la /app/frontend/dist/

WORKDIR /app/backend

EXPOSE 8000

CMD ["sh", "-c", "python3 -m alembic upgrade head && python3 scripts/seed.py && python3 -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
