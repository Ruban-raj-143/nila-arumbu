"""
Nila Arumbu — Centre Router
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NilaBaseError
from app.core.pagination import PageParams, PagedResponse
from app.core.security import TokenPayload, get_current_token
from app.domains.child.models import Centre
from app.domains.child.repository import CentreRepository
from app.domains.child.schemas import CentreCreate, CentreRead
from app.infrastructure.database.session import get_db

router = APIRouter(prefix="/centres", tags=["Centres"])


@router.post("/", response_model=CentreRead, status_code=status.HTTP_201_CREATED)
async def create_centre(
    body: CentreCreate,
    token: TokenPayload = Depends(get_current_token),
    db: AsyncSession = Depends(get_db),
) -> CentreRead:
    repo = CentreRepository(db)
    existing = await repo.get_by_code(body.code)
    if existing:
        raise ConflictError(f"Centre with code '{body.code}' already exists.").to_http()
    centre = Centre(**body.model_dump(), created_by=None)
    db.add(centre)
    await db.flush()
    await db.commit()
    await db.refresh(centre)
    return CentreRead.model_validate(centre)


@router.get("/", response_model=PagedResponse[CentreRead])
async def list_centres(
    page_params: PageParams = Depends(),
    token: TokenPayload = Depends(get_current_token),
    db: AsyncSession = Depends(get_db),
) -> PagedResponse[CentreRead]:
    repo = CentreRepository(db)
    centres, total = await repo.list_all(offset=page_params.offset, limit=page_params.size)
    return PagedResponse.build(
        items=[CentreRead.model_validate(c) for c in centres],
        total=total,
        params=page_params,
    )
