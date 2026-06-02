"""
Nila Arumbu — Analytics Router
Supervisor and District Officer dashboards.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import TokenPayload, require_roles
from app.domains.analytics.schemas import (
    CentreRiskSummary,
    PlatformSummary,
    ReferralAgingReport,
)
from app.domains.analytics.service import AnalyticsService
from app.infrastructure.database.session import get_db

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def _svc(db: AsyncSession = Depends(get_db)) -> AnalyticsService:
    return AnalyticsService(db)


@router.get("/summary", response_model=PlatformSummary)
async def platform_summary(
    token: TokenPayload = Depends(
        require_roles("STATE_ADMIN", "DISTRICT_OFFICER", "SUPERVISOR")
    ),
    svc: AnalyticsService = Depends(_svc),
) -> PlatformSummary:
    """Platform-wide summary — total children, risk distribution, open referrals."""
    return await svc.get_platform_summary()


@router.get("/centres/risk", response_model=list[CentreRiskSummary])
async def centre_risk_summary(
    token: TokenPayload = Depends(
        require_roles("STATE_ADMIN", "DISTRICT_OFFICER", "SUPERVISOR")
    ),
    svc: AnalyticsService = Depends(_svc),
) -> list[CentreRiskSummary]:
    """Per-centre risk distribution breakdown."""
    return await svc.get_centre_risk_summary()


@router.get("/referrals/aging", response_model=list[ReferralAgingReport])
async def referral_aging(
    token: TokenPayload = Depends(
        require_roles("STATE_ADMIN", "DISTRICT_OFFICER", "SUPERVISOR")
    ),
    svc: AnalyticsService = Depends(_svc),
) -> list[ReferralAgingReport]:
    """Referral aging report — how long cases sit in each state."""
    return await svc.get_referral_aging_report()
