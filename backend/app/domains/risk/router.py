"""
Nila Arumbu — Risk Router
"""
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NilaBaseError
from app.core.pagination import PageParams, PagedResponse
from app.core.security import TokenPayload, get_current_token
from app.domains.risk.schemas import RiskHistory, RiskInput, RiskScoreRead
from app.domains.risk.service import RiskService
from app.infrastructure.database.session import get_db

router = APIRouter(prefix="/risk", tags=["Risk Engine"])


def _svc(db: AsyncSession = Depends(get_db)) -> RiskService:
    return RiskService(db)


@router.post("/calculate", response_model=RiskScoreRead, status_code=status.HTTP_201_CREATED)
async def calculate_risk(
    body: RiskInput,
    token: TokenPayload = Depends(get_current_token),
    svc: RiskService = Depends(_svc),
) -> RiskScoreRead:
    try:
        score = await svc.calculate_and_persist(body, actor_id=UUID(token.sub))
        return RiskScoreRead.model_validate(score)
    except NilaBaseError as exc:
        raise exc.to_http()


@router.get("/children/{child_id}/latest", response_model=RiskScoreRead)
async def get_latest_risk(
    child_id: UUID,
    token: TokenPayload = Depends(get_current_token),
    svc: RiskService = Depends(_svc),
) -> RiskScoreRead:
    try:
        score = await svc.get_latest(child_id)
        return RiskScoreRead.model_validate(score)
    except NilaBaseError as exc:
        raise exc.to_http()


@router.get("/children/{child_id}/history", response_model=PagedResponse[RiskScoreRead])
async def get_risk_history(
    child_id: UUID,
    page_params: PageParams = Depends(),
    token: TokenPayload = Depends(get_current_token),
    svc: RiskService = Depends(_svc),
) -> PagedResponse[RiskScoreRead]:
    scores, total = await svc.get_history(child_id, page_params.offset, page_params.size)
    return PagedResponse.build(
        items=[RiskScoreRead.model_validate(s) for s in scores],
        total=total,
        params=page_params,
    )
