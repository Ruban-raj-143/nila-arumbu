"""
Nila Arumbu — Child Router
"""
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NilaBaseError
from app.core.pagination import PageParams, PagedResponse
from app.core.security import TokenPayload, get_current_token
from app.domains.child.schemas import (
    ChildCreate,
    ChildPassportRead,
    ChildRead,
    ChildUpdate,
    MigrationCreate,
    MigrationRead,
)
from app.domains.child.service import ChildService
from app.infrastructure.database.session import get_db

router = APIRouter(prefix="/children", tags=["Children"])


def _svc(db: AsyncSession = Depends(get_db)) -> ChildService:
    return ChildService(db)


@router.post("/", response_model=ChildRead, status_code=status.HTTP_201_CREATED)
async def register_child(
    body: ChildCreate,
    token: TokenPayload = Depends(get_current_token),
    svc: ChildService = Depends(_svc),
) -> ChildRead:
    try:
        child = await svc.register_child(body, actor_id=UUID(token.sub))
        return ChildRead.model_validate(child)
    except NilaBaseError as exc:
        raise exc.to_http()


@router.get("/", response_model=PagedResponse[ChildRead])
async def list_children(
    centre_id: UUID | None = None,
    page_params: PageParams = Depends(),
    token: TokenPayload = Depends(get_current_token),
    svc: ChildService = Depends(_svc),
) -> PagedResponse[ChildRead]:
    children, total = await svc.list_children(
        offset=page_params.offset, limit=page_params.size, centre_id=centre_id
    )
    return PagedResponse.build(
        items=[ChildRead.model_validate(c) for c in children],
        total=total,
        params=page_params,
    )


@router.get("/{child_id}", response_model=ChildRead)
async def get_child(
    child_id: UUID,
    token: TokenPayload = Depends(get_current_token),
    svc: ChildService = Depends(_svc),
) -> ChildRead:
    try:
        child = await svc.get_child(child_id)
        return ChildRead.model_validate(child)
    except NilaBaseError as exc:
        raise exc.to_http()


@router.patch("/{child_id}", response_model=ChildRead)
async def update_child(
    child_id: UUID,
    body: ChildUpdate,
    token: TokenPayload = Depends(get_current_token),
    svc: ChildService = Depends(_svc),
) -> ChildRead:
    try:
        child = await svc.update_child(child_id, body, UUID(token.sub))
        return ChildRead.model_validate(child)
    except NilaBaseError as exc:
        raise exc.to_http()


@router.get("/{child_id}/passport", response_model=ChildPassportRead)
async def get_passport(
    child_id: UUID,
    token: TokenPayload = Depends(get_current_token),
    svc: ChildService = Depends(_svc),
) -> ChildPassportRead:
    try:
        passport = await svc.get_passport(child_id)
        return ChildPassportRead.model_validate(passport)
    except NilaBaseError as exc:
        raise exc.to_http()


@router.post("/{child_id}/migrate", response_model=MigrationRead, status_code=status.HTTP_201_CREATED)
async def migrate_child(
    child_id: UUID,
    body: MigrationCreate,
    token: TokenPayload = Depends(get_current_token),
    svc: ChildService = Depends(_svc),
) -> MigrationRead:
    try:
        body.child_id = child_id
        migration = await svc.migrate_child(body, UUID(token.sub))
        return MigrationRead.model_validate(migration)
    except NilaBaseError as exc:
        raise exc.to_http()


@router.get("/{child_id}/migrations", response_model=list[MigrationRead])
async def get_migration_history(
    child_id: UUID,
    token: TokenPayload = Depends(get_current_token),
    svc: ChildService = Depends(_svc),
) -> list[MigrationRead]:
    history = await svc.get_migration_history(child_id)
    return [MigrationRead.model_validate(m) for m in history]
