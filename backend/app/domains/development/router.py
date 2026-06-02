"""
Nila Arumbu — Development Assessment Router
"""
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NilaBaseError
from app.core.pagination import PageParams, PagedResponse
from app.core.security import TokenPayload, get_current_token
from app.domains.development.schemas import AssessmentCreate, AssessmentRead, DevelopmentSummary
from app.domains.development.service import DevelopmentService
from app.infrastructure.database.session import get_db

router = APIRouter(prefix="/development", tags=["Development Assessment"])


def _svc(db: AsyncSession = Depends(get_db)) -> DevelopmentService:
    return DevelopmentService(db)


@router.post("/assessments", response_model=AssessmentRead, status_code=status.HTTP_201_CREATED)
async def record_assessment(
    body: AssessmentCreate,
    token: TokenPayload = Depends(get_current_token),
    svc: DevelopmentService = Depends(_svc),
) -> AssessmentRead:
    try:
        record = await svc.record_assessment(body, actor_id=UUID(token.sub))
        return AssessmentRead.model_validate(record)
    except NilaBaseError as exc:
        raise exc.to_http()


@router.get("/children/{child_id}", response_model=PagedResponse[AssessmentRead])
async def list_assessments(
    child_id: UUID,
    page_params: PageParams = Depends(),
    token: TokenPayload = Depends(get_current_token),
    svc: DevelopmentService = Depends(_svc),
) -> PagedResponse[AssessmentRead]:
    records, total = await svc.list_assessments(child_id, page_params.offset, page_params.size)
    return PagedResponse.build(
        items=[AssessmentRead.model_validate(r) for r in records],
        total=total,
        params=page_params,
    )


@router.get("/children/{child_id}/summary", response_model=DevelopmentSummary)
async def get_summary(
    child_id: UUID,
    token: TokenPayload = Depends(get_current_token),
    svc: DevelopmentService = Depends(_svc),
) -> DevelopmentSummary:
    return await svc.get_summary(child_id)
