"""
Nila Arumbu — Growth Service
Handles growth recording with WHO Z-score classification.
"""
import logging
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.domains.growth.models import GrowthRecord
from app.domains.growth.repository import GrowthRepository
from app.domains.growth.schemas import GrowthRecordCreate, GrowthTrend

logger = logging.getLogger(__name__)

# ── WHO Z-score classification thresholds (O(1) lookup maps) ─────────────────
_MUAC_STATUS_MAP: dict[tuple[float, float], str] = {
    (0.0, 11.5): "SAM",
    (11.5, 12.5): "MAM",
    (12.5, 999.0): "NORMAL",
}

_WAZ_STATUS_MAP: dict[tuple[float, float], str] = {
    (-99.0, -3.0): "SEVERE_UNDERWEIGHT",
    (-3.0, -2.0): "UNDERWEIGHT",
    (-2.0, 999.0): "NORMAL",
}


def _classify_nutrition(
    muac: float | None,
    waz: float | None,
    haz: float | None,
) -> str:
    """Returns the most severe nutrition classification."""
    if muac is not None:
        for (lo, hi), status in _MUAC_STATUS_MAP.items():
            if lo <= muac < hi:
                if status in ("SAM", "MAM"):
                    return status
    if waz is not None:
        for (lo, hi), status in _WAZ_STATUS_MAP.items():
            if lo <= waz < hi:
                if status != "NORMAL":
                    return status
    if haz is not None and haz < -2.0:
        return "STUNTED"
    return "NORMAL"


class GrowthService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = GrowthRepository(session)
        self.session = session

    async def record_growth(
        self, data: GrowthRecordCreate, actor_id: UUID | None = None
    ) -> GrowthRecord:
        # Simplified Z-score placeholder — production would use WHO LMS tables
        waz = _estimate_waz(data.weight_kg) if data.weight_kg else None
        haz = _estimate_haz(data.height_cm) if data.height_cm else None
        nutrition_status = _classify_nutrition(data.muac_cm, waz, haz)

        record = GrowthRecord(
            child_id=data.child_id,
            recorded_date=data.recorded_date,
            weight_kg=data.weight_kg,
            height_cm=data.height_cm,
            muac_cm=data.muac_cm,
            weight_for_age_z=waz,
            height_for_age_z=haz,
            nutrition_status=nutrition_status,
            notes=data.notes,
            recorded_by=actor_id,
            created_by=actor_id,
            updated_by=actor_id,
        )
        created = await self.repo.create(record)
        await self.session.commit()
        logger.info("Growth recorded: child=%s status=%s", data.child_id, nutrition_status)
        return created

    async def get_growth_trend(self, child_id: UUID) -> GrowthTrend:
        records, _ = await self.repo.list_by_child(child_id, limit=12)
        if not records:
            return GrowthTrend(
                child_id=child_id,
                records=[],
                latest_status=None,
                trend_direction="INSUFFICIENT_DATA",
            )

        from app.domains.growth.schemas import GrowthRecordRead
        latest = records[0]
        trend = _compute_trend(records)
        return GrowthTrend(
            child_id=child_id,
            records=[GrowthRecordRead.model_validate(r) for r in records],
            latest_status=latest.nutrition_status,
            trend_direction=trend,
        )

    async def list_growth_records(
        self, child_id: UUID, offset: int, limit: int
    ) -> tuple[list[GrowthRecord], int]:
        return await self.repo.list_by_child(child_id, offset, limit)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _estimate_waz(weight_kg: float) -> float:
    """
    Simplified WAZ estimate for children 0–5 years.
    Production must use WHO LMS reference tables.
    """
    median = 14.0  # approximate median for 2-year-old
    sd = 1.5
    return round((weight_kg - median) / sd, 2)


def _estimate_haz(height_cm: float) -> float:
    """
    Simplified HAZ estimate.
    Production must use WHO LMS reference tables.
    """
    median = 87.0
    sd = 3.5
    return round((height_cm - median) / sd, 2)


def _compute_trend(records: list[GrowthRecord]) -> str:
    if len(records) < 2:
        return "INSUFFICIENT_DATA"
    weights = [r.weight_kg for r in records if r.weight_kg is not None]
    if len(weights) < 2:
        return "INSUFFICIENT_DATA"
    # Compare last two readings (records are desc-ordered)
    delta = weights[0] - weights[1]
    if delta > 0.2:
        return "IMPROVING"
    if delta < -0.2:
        return "DECLINING"
    return "STABLE"
