"""
Nila Arumbu — Parent Engagement Router
"""
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NilaBaseError, NotFoundError
from app.core.pagination import PageParams, PagedResponse
from app.core.security import TokenPayload, get_current_token
from app.domains.engagement.schemas import EngagementCreate, EngagementRead
from app.domains.engagement.service import EngagementService
from app.domains.engagement.whatsapp import MessageTemplate, render_message
from app.domains.notification.factory import NotificationFactory, NotificationPayload
from app.infrastructure.database.session import get_db
from pydantic import BaseModel

router = APIRouter(prefix="/engagement", tags=["Parent Engagement"])


def _svc(db: AsyncSession = Depends(get_db)) -> EngagementService:
    return EngagementService(db)


class WhatsAppRequest(BaseModel):
    child_id: UUID
    parent_phone: str
    child_name: str
    template: str
    template_data: dict = {}


@router.post("/whatsapp/", status_code=status.HTTP_200_OK)
async def send_whatsapp_to_parent(
    body: WhatsAppRequest,
    token: TokenPayload = Depends(get_current_token),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Send a WhatsApp message to a parent using a pre-built Tamil/English template.

    Templates: DAILY_ACTIVITY | WEEKLY_REMINDER | REFERRAL_REMINDER |
               DEVELOPMENT_NUDGE | PROGRESS_SUMMARY | ATTENDANCE_ALERT |
               RISK_ALERT | APPOINTMENT_REMINDER
    """
    try:
        template = MessageTemplate(body.template)
    except ValueError:
        valid = [t.value for t in MessageTemplate]
        raise NotFoundError(f"Unknown template. Valid: {valid}").to_http()

    rendered = render_message(template, body.child_name, **body.template_data)

    payload = NotificationPayload(
        recipient_phone=body.parent_phone,
        title=rendered.title,
        body=rendered.body,
    )
    success = await NotificationFactory.dispatch("WHATSAPP", payload)

    # Log the engagement — only if child_id is valid
    try:
        svc = EngagementService(db)
        await svc.log_engagement(
            EngagementCreate(
                child_id=body.child_id,
                engagement_type="DAILY_ACTIVITY",
                channel="WHATSAPP",
                message=rendered.body,
            ),
            actor_id=UUID(token.sub),
        )
    except Exception:
        pass  # Don't fail the send if logging fails

    return {
        "success": success,
        "template": body.template,
        "recipient": body.parent_phone,
        "message_preview": rendered.body[:100] + "…",
    }


@router.post("/", response_model=EngagementRead, status_code=status.HTTP_201_CREATED)
async def log_engagement(
    body: EngagementCreate,
    token: TokenPayload = Depends(get_current_token),
    svc: EngagementService = Depends(_svc),
) -> EngagementRead:
    try:
        log = await svc.log_engagement(body, actor_id=UUID(token.sub))
        return EngagementRead.model_validate(log)
    except NilaBaseError as exc:
        raise exc.to_http()


@router.get("/children/{child_id}", response_model=PagedResponse[EngagementRead])
async def list_child_engagement(
    child_id: UUID,
    page_params: PageParams = Depends(),
    token: TokenPayload = Depends(get_current_token),
    svc: EngagementService = Depends(_svc),
) -> PagedResponse[EngagementRead]:
    logs, total = await svc.list_by_child(child_id, page_params.offset, page_params.size)
    return PagedResponse.build(
        items=[EngagementRead.model_validate(l) for l in logs],
        total=total,
        params=page_params,
    )
