"""
Nila Arumbu — Growth Router
"""
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NilaBaseError
from app.core.pagination import PageParams, PagedResponse
from app.core.security import TokenPayload, get_current_token
from app.domains.growth.schemas import GrowthRecordCreate, GrowthRecordRead, GrowthTrend
from app.domains.growth.service import GrowthService
from app.infrastructure.database.session import get_db

router = APIRouter(prefix="/growth", tags=["Growth"])


def _svc(db: AsyncSession = Depends(get_db)) -> GrowthService:
    return GrowthService(db)


@router.post("/", response_model=GrowthRecordRead, status_code=status.HTTP_201_CREATED)
async def record_growth(
    body: GrowthRecordCreate,
    token: TokenPayload = Depends(get_current_token),
    svc: GrowthService = Depends(_svc),
) -> GrowthRecordRead:
    try:
        record = await svc.record_growth(body, actor_id=UUID(token.sub))
        return GrowthRecordRead.model_validate(record)
    except NilaBaseError as exc:
        raise exc.to_http()


@router.get("/children/{child_id}", response_model=PagedResponse[GrowthRecordRead])
async def list_growth(
    child_id: UUID,
    page_params: PageParams = Depends(),
    token: TokenPayload = Depends(get_current_token),
    svc: GrowthService = Depends(_svc),
) -> PagedResponse[GrowthRecordRead]:
    records, total = await svc.list_growth_records(child_id, page_params.offset, page_params.size)
    return PagedResponse.build(
        items=[GrowthRecordRead.model_validate(r) for r in records],
        total=total,
        params=page_params,
    )


@router.get("/children/{child_id}/trend", response_model=GrowthTrend)
async def get_trend(
    child_id: UUID,
    token: TokenPayload = Depends(get_current_token),
    svc: GrowthService = Depends(_svc),
) -> GrowthTrend:
    return await svc.get_growth_trend(child_id)
