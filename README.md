# Nila Arumbu
**Every Child Seen. Every Risk Identified. Every Referral Closed.**

Integrated Early Childhood Decision Support Platform — Tamil Nadu, India.

---

## Quick Start

### 1. Start infrastructure
```bash
cd infrastructure
docker-compose up -d
```

### 2. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env

# Run migrations
alembic revision --autogenerate -m "initial"
alembic upgrade head

# Seed roles, permissions, demo users
python scripts/seed.py

# Start API server
uvicorn app.main:app --reload --port 8000
```

**API docs:** http://localhost:8000/api/v1/docs

**Demo credentials (after seed):**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nilarumbu.gov.in | NilaAdmin@2024 |
| Worker | worker@nilarumbu.gov.in | Worker@2024 |

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## Architecture

```
React PWA (TypeScript + Vite)
  └── Dexie IndexedDB (offline-first)
  └── React Query (server state)
  └── Zustand (auth store)
        ↓
FastAPI (Python 3.12)
  └── Identity Domain    — JWT auth, RBAC
  └── Child Domain       — Registration, Passport, Migration
  └── Attendance Domain  — Daily session recording
  └── Growth Domain      — WHO Z-score classification
  └── Development Domain — Milestone assessment
  └── Risk Engine        — Strategy Pattern, explainable scores
  └── Referral Domain    — State Machine lifecycle
  └── Learning Planner   — Age-band activity generation
  └── Notification Engine— Factory Pattern, multi-channel
  └── Parent Engagement  — WhatsApp/SMS/In-App logs
        ↓
PostgreSQL + Redis + Celery
```

## Risk Score Formula
| Factor | Weight |
|--------|--------|
| Attendance | 20% |
| Nutrition | 25% |
| Development | 25% |
| Caregiver | 15% |
| Migration | 15% |

- **GREEN** 0–30 · **YELLOW** 31–69 · **RED** 70–100

## Referral Lifecycle
```
IDENTIFIED → REFERRED → APPOINTMENT_PENDING → VISITED → FOLLOWUP → CLOSED
```
Invalid transitions are rejected by the state machine.

## Tests
```bash
cd backend
python -m pytest tests/ -v
# 74 tests, 0 warnings
```

## CI/CD
GitHub Actions pipeline: `.github/workflows/ci.yml`
- Lint (Ruff) → Type check (MyPy) → Tests → Frontend build → Docker build
