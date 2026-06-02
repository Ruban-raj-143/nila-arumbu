"""
Nila Arumbu — Referral Router
"""
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import InvalidStateTransitionError, NilaBaseError
from app.core.pagination import PageParams, PagedResponse
from app.core.security import TokenPayload, get_current_token
from app.domains.referral.schemas import (
    EscalateRequest,
    ReferralCreate,
    ReferralRead,
    ReferralTransition,
)
from app.domains.referral.service import ReferralService
from app.domains.referral.state_machine import get_allowed_transitions
from app.infrastructure.database.session import get_db

router = APIRouter(prefix="/referrals", tags=["Referrals"])


def _svc(db: AsyncSession = Depends(get_db)) -> ReferralService:
    return ReferralService(db)


def _enrich(referral, svc=None) -> ReferralRead:
    data = ReferralRead.model_validate(referral)
    data.allowed_transitions = get_allowed_transitions(referral.status)
    return data


@router.post("/", response_model=ReferralRead, status_code=status.HTTP_201_CREATED)
async def create_referral(
    body: ReferralCreate,
    token: TokenPayload = Depends(get_current_token),
    svc: ReferralService = Depends(_svc),
) -> ReferralRead:
    try:
        referral = await svc.create_referral(body, actor_id=UUID(token.sub))
        return _enrich(referral)
    except NilaBaseError as exc:
        raise exc.to_http()


@router.get("/{referral_id}", response_model=ReferralRead)
async def get_referral(
    referral_id: UUID,
    token: TokenPayload = Depends(get_current_token),
    svc: ReferralService = Depends(_svc),
) -> ReferralRead:
    try:
        referral = await svc.get_referral(referral_id)
        return _enrich(referral)
    except NilaBaseError as exc:
        raise exc.to_http()


@router.post("/{referral_id}/transition", response_model=ReferralRead)
async def transition_referral(
    referral_id: UUID,
    body: ReferralTransition,
    token: TokenPayload = Depends(get_current_token),
    svc: ReferralService = Depends(_svc),
) -> ReferralRead:
    try:
        referral = await svc.transition(referral_id, body, actor_id=UUID(token.sub))
        return _enrich(referral)
    except (NilaBaseError, InvalidStateTransitionError) as exc:
        raise exc.to_http()


@router.post("/{referral_id}/escalate", response_model=ReferralRead)
async def escalate_referral(
    referral_id: UUID,
    body: EscalateRequest,
    token: TokenPayload = Depends(get_current_token),
    svc: ReferralService = Depends(_svc),
) -> ReferralRead:
    try:
        referral = await svc.escalate(referral_id, body, actor_id=UUID(token.sub))
        return _enrich(referral)
    except NilaBaseError as exc:
        raise exc.to_http()


@router.get("/children/{child_id}", response_model=PagedResponse[ReferralRead])
async def list_child_referrals(
    child_id: UUID,
    page_params: PageParams = Depends(),
    token: TokenPayload = Depends(get_current_token),
    svc: ReferralService = Depends(_svc),
) -> PagedResponse[ReferralRead]:
    referrals, total = await svc.list_by_child(child_id, page_params.offset, page_params.size)
    return PagedResponse.build(
        items=[_enrich(r) for r in referrals],
        total=total,
        params=page_params,
    )


@router.get("/by-status/{status}", response_model=PagedResponse[ReferralRead])
async def list_by_status(
    status: str,
    page_params: PageParams = Depends(),
    token: TokenPayload = Depends(get_current_token),
    svc: ReferralService = Depends(_svc),
) -> PagedResponse[ReferralRead]:
    referrals, total = await svc.list_by_status(status, page_params.offset, page_params.size)
    return PagedResponse.build(
        items=[_enrich(r) for r in referrals],
        total=total,
        params=page_params,
    )
