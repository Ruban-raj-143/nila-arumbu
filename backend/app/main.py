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
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

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

# ── Frontend dist path ────────────────────────────────────────────────────────
# Dockerfile copies frontend/dist to /app/frontend/dist
# WORKDIR is /app/backend, so go up two levels
FRONTEND_DIST = Path("/app/frontend/dist")
if not FRONTEND_DIST.exists():
    # Local dev fallback
    FRONTEND_DIST = Path(__file__).parent.parent.parent / "frontend" / "dist"

# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info("Nila Arumbu starting up — %s | frontend: %s", settings.ENVIRONMENT, FRONTEND_DIST.exists())
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
    # CRITICAL: disable redirect so /children stays /children, not redirected to /children/
    # which would then be caught by SPA handler
    redirect_slashes=False,
)

# ── CORS ──────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global exception handlers ─────────────────────────────────────────────────

@app.exception_handler(NilaBaseError)
async def nila_exception_handler(request: Request, exc: NilaBaseError) -> JSONResponse:
    return JSONResponse(status_code=exc.http_status, content={"detail": exc.detail})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred."},
    )

# ── API Routers (registered BEFORE static/SPA) ───────────────────────────────

PREFIX = settings.API_V1_STR

app.include_router(identity_router,    prefix=PREFIX)
app.include_router(child_router,       prefix=PREFIX)
app.include_router(attendance_router,  prefix=PREFIX)
app.include_router(growth_router,      prefix=PREFIX)
app.include_router(risk_router,        prefix=PREFIX)
app.include_router(referral_router,    prefix=PREFIX)
app.include_router(development_router, prefix=PREFIX)
app.include_router(learning_router,    prefix=PREFIX)
app.include_router(notification_router,prefix=PREFIX)
app.include_router(engagement_router,  prefix=PREFIX)
app.include_router(voice_router,       prefix=PREFIX)
app.include_router(analytics_router,   prefix=PREFIX)
app.include_router(centre_router,      prefix=PREFIX)

# ── Health (registered before SPA) ───────────────────────────────────────────

@app.get("/health", tags=["System"])
async def health() -> dict:
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "environment": settings.ENVIRONMENT,
    }

# ── Static assets + SPA (registered LAST) ────────────────────────────────────

if FRONTEND_DIST.exists():
    # Mount /assets for JS/CSS chunks
    _assets = FRONTEND_DIST / "assets"
    if _assets.exists():
        app.mount("/assets", StaticFiles(directory=str(_assets)), name="static-assets")

    _spa_html = (FRONTEND_DIST / "index.html").read_text(encoding="utf-8")

    @app.get("/", include_in_schema=False)
    @app.get("/{path:path}", include_in_schema=False)
    async def spa(path: str = "") -> HTMLResponse:
        # Serve static files that exist (favicon, manifest, etc.)
        candidate = FRONTEND_DIST / path
        if path and candidate.exists() and candidate.is_file():
            from fastapi.responses import FileResponse
            return FileResponse(str(candidate))  # type: ignore[return-value]
        return HTMLResponse(_spa_html)

else:
    @app.get("/", tags=["System"])
    async def root() -> dict:
        return {"message": "Nila Arumbu API — Every Child Seen. Every Risk Identified. Every Referral Closed."}
