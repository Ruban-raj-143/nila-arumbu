"""
Nila Arumbu — Learning Planner Router
"""
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NilaBaseError
from app.core.pagination import PageParams, PagedResponse
from app.core.security import TokenPayload, get_current_token
from app.domains.learning.schemas import LearningActivityRead, LearningPlanRequest
from app.domains.learning.service import LearningService
from app.infrastructure.database.session import get_db

router = APIRouter(prefix="/learning", tags=["Learning Planner"])


def _svc(db: AsyncSession = Depends(get_db)) -> LearningService:
    return LearningService(db)


@router.post("/plans", response_model=LearningActivityRead, status_code=status.HTTP_201_CREATED)
async def generate_plan(
    body: LearningPlanRequest,
    token: TokenPayload = Depends(get_current_token),
    svc: LearningService = Depends(_svc),
) -> LearningActivityRead:
    try:
        plan = await svc.generate_plan(body, actor_id=UUID(token.sub))
        return LearningActivityRead.model_validate(plan)
    except NilaBaseError as exc:
        raise exc.to_http()


@router.get("/children/{child_id}", response_model=PagedResponse[LearningActivityRead])
async def list_plans(
    child_id: UUID,
    page_params: PageParams = Depends(),
    token: TokenPayload = Depends(get_current_token),
    svc: LearningService = Depends(_svc),
) -> PagedResponse[LearningActivityRead]:
    plans, total = await svc.list_plans(child_id, page_params.offset, page_params.size)
    return PagedResponse.build(
        items=[LearningActivityRead.model_validate(p) for p in plans],
        total=total,
        params=page_params,
    )
