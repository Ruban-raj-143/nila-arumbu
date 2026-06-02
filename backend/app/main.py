"""
Nila Arumbu — FastAPI Application Entry Point
Every Child Seen. Every Risk Identified. Every Referral Closed.
"""
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.core.config import settings
from app.core.exceptions import NilaBaseError

# ── Domain routers ────────────────────────────────────────────────────────────
from app.domains.identity.router import router as identity_router
from app.domains.child.router import router as child_router
from app.domains.attendance.router import router as attendance_router
from app.domains.growth.router import router as growth_router
from app.domains.risk.router import router as risk_router
from app.domains.referral.router import router as referral_router
from app.domains.development.router import router as development_router
from app.domains.learning.router import router as learning_router
from app.domains.notification.router import router as notification_router
from app.domains.engagement.router import router as engagement_router
from app.domains.voice.router import router as voice_router
from app.domains.analytics.router import router as analytics_router
from app.domains.child.centre_router import router as centre_router

logger = logging.getLogger(__name__)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)


# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info("Nila Arumbu starting up — %s", settings.ENVIRONMENT)
    yield
    logger.info("Nila Arumbu shutting down.")


# ── Application ───────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Integrated Early Childhood Decision Support Platform — Tamil Nadu",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.ENVIRONMENT != "development",
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global exception handler ──────────────────────────────────────────────────

@app.exception_handler(NilaBaseError)
async def nila_exception_handler(request: Request, exc: NilaBaseError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.http_status,
        content={"detail": exc.detail},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred."},
    )

# ── Routers ───────────────────────────────────────────────────────────────────

PREFIX = settings.API_V1_STR

app.include_router(identity_router, prefix=PREFIX)
app.include_router(child_router, prefix=PREFIX)
app.include_router(attendance_router, prefix=PREFIX)
app.include_router(growth_router, prefix=PREFIX)
app.include_router(risk_router, prefix=PREFIX)
app.include_router(referral_router, prefix=PREFIX)
app.include_router(development_router, prefix=PREFIX)
app.include_router(learning_router, prefix=PREFIX)
app.include_router(notification_router, prefix=PREFIX)
app.include_router(engagement_router, prefix=PREFIX)
app.include_router(voice_router, prefix=PREFIX)
app.include_router(analytics_router, prefix=PREFIX)
app.include_router(centre_router, prefix=PREFIX)

# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["System"])
async def health() -> dict:
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "environment": settings.ENVIRONMENT,
    }


# ── Serve React frontend (production) ────────────────────────────────────────
# Check env var first, then fall back to relative path calculation
import os

_frontend_env = os.environ.get("FRONTEND_DIST_PATH", "")
if _frontend_env:
    FRONTEND_DIST = Path(_frontend_env)
else:
    # Dockerfile: WORKDIR /app/backend, frontend copied to /app/frontend/dist
    FRONTEND_DIST = Path("/app/frontend/dist")
    # Local dev fallback
    if not FRONTEND_DIST.exists():
        FRONTEND_DIST = Path(__file__).parent.parent.parent / "frontend" / "dist"

logger.info("Frontend dist path: %s | exists: %s", FRONTEND_DIST, FRONTEND_DIST.exists())

if FRONTEND_DIST.exists():
    # Serve static assets (JS/CSS/images)
    _assets_dir = FRONTEND_DIST / "assets"
    if _assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(_assets_dir)), name="assets")

    @app.get("/", include_in_schema=False)
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(request: Request, full_path: str = "") -> FileResponse:
        # Never intercept API routes — let FastAPI handle them
        if full_path.startswith("api/"):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="API route not found")
        index = FRONTEND_DIST / "index.html"
        return FileResponse(str(index))
else:
    @app.get("/", tags=["System"])
    async def root() -> dict:
        return {"message": "Nila Arumbu API — Every Child Seen. Every Risk Identified. Every Referral Closed."}
