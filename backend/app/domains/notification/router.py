"""
Nila Arumbu — Notification Router
"""
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NilaBaseError
from app.core.pagination import PageParams, PagedResponse
from app.core.security import TokenPayload, get_current_token
from app.domains.notification.schemas import NotificationCreate, NotificationRead
from app.domains.notification.service import NotificationService
from app.infrastructure.database.session import get_db

router = APIRouter(prefix="/notifications", tags=["Notifications"])


def _svc(db: AsyncSession = Depends(get_db)) -> NotificationService:
    return NotificationService(db)


@router.post("/", response_model=NotificationRead, status_code=status.HTTP_201_CREATED)
async def send_notification(
    body: NotificationCreate,
    token: TokenPayload = Depends(get_current_token),
    svc: NotificationService = Depends(_svc),
) -> NotificationRead:
    try:
        notif = await svc.send(body, actor_id=UUID(token.sub))
        return NotificationRead.model_validate(notif)
    except NilaBaseError as exc:
        raise exc.to_http()


@router.get("/me", response_model=PagedResponse[NotificationRead])
async def my_notifications(
    page_params: PageParams = Depends(),
    token: TokenPayload = Depends(get_current_token),
    svc: NotificationService = Depends(_svc),
) -> PagedResponse[NotificationRead]:
    items, total = await svc.list_for_recipient(UUID(token.sub), page_params.offset, page_params.size)
    return PagedResponse.build(
        items=[NotificationRead.model_validate(n) for n in items],
        total=total,
        params=page_params,
    )
