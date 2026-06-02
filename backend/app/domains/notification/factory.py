"""
Nila Arumbu — Notification Factory Pattern
WhatsApp (Twilio), SMS (Twilio/Exotel), Email (SMTP), Push (FCM)
"""
import logging
import smtplib
from abc import ABC, abstractmethod
from dataclasses import dataclass
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


@dataclass
class NotificationPayload:
    recipient_phone: str | None = None
    recipient_email: str | None = None
    recipient_push_token: str | None = None
    title: str = ""
    body: str = ""
    extra: dict | None = None


class NotificationHandler(ABC):
    @abstractmethod
    async def send(self, payload: NotificationPayload) -> bool: ...


# ── WhatsApp via Twilio ───────────────────────────────────────────────────────

class WhatsAppHandler(NotificationHandler):
    """
    Sends WhatsApp messages via Twilio WhatsApp Business API.
    Requires in .env:
      TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      TWILIO_AUTH_TOKEN=your_auth_token
      TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
    """
    async def send(self, payload: NotificationPayload) -> bool:
        if not payload.recipient_phone:
            logger.warning("[WhatsApp] No recipient phone — skipped")
            return False

        if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
            logger.warning("[WhatsApp] Twilio credentials not configured — logged only")
            logger.info("[WhatsApp] → %s | %s | %s",
                        payload.recipient_phone, payload.title, payload.body)
            return True  # Graceful degradation in dev

        try:
            from twilio.rest import Client  # type: ignore
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

            to = f"whatsapp:{payload.recipient_phone}"
            from_ = settings.TWILIO_WHATSAPP_FROM

            message = client.messages.create(
                body=f"*{payload.title}*\n\n{payload.body}",
                from_=from_,
                to=to,
            )
            logger.info("[WhatsApp] Sent SID=%s → %s", message.sid, payload.recipient_phone)
            return True
        except Exception as exc:
            logger.error("[WhatsApp] Failed → %s: %s", payload.recipient_phone, exc)
            return False


# ── SMS via Twilio ────────────────────────────────────────────────────────────

class SMSHandler(NotificationHandler):
    """
    Sends SMS via Twilio.
    Requires in .env:
      TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      TWILIO_AUTH_TOKEN=your_auth_token
      TWILIO_SMS_FROM=+1xxxxxxxxxx
    """
    async def send(self, payload: NotificationPayload) -> bool:
        if not payload.recipient_phone:
            logger.warning("[SMS] No recipient phone — skipped")
            return False

        if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
            logger.warning("[SMS] Twilio credentials not configured — logged only")
            logger.info("[SMS] → %s | %s", payload.recipient_phone, payload.body)
            return True

        try:
            from twilio.rest import Client  # type: ignore
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

            message = client.messages.create(
                body=f"{payload.title}: {payload.body}",
                from_=settings.TWILIO_SMS_FROM,
                to=payload.recipient_phone,
            )
            logger.info("[SMS] Sent SID=%s → %s", message.sid, payload.recipient_phone)
            return True
        except Exception as exc:
            logger.error("[SMS] Failed → %s: %s", payload.recipient_phone, exc)
            return False


# ── Email via SMTP ────────────────────────────────────────────────────────────

class EmailHandler(NotificationHandler):
    """
    Sends email via SMTP (Gmail / AWS SES / any SMTP).
    Requires in .env:
      SMTP_HOST=smtp.gmail.com
      SMTP_PORT=587
      SMTP_USER=your@email.com
      SMTP_PASSWORD=your_app_password
      SMTP_FROM=noreply@nilarumbu.gov.in
    """
    async def send(self, payload: NotificationPayload) -> bool:
        if not payload.recipient_email:
            logger.warning("[Email] No recipient email — skipped")
            return False

        if not settings.SMTP_HOST or not settings.SMTP_USER:
            logger.warning("[Email] SMTP not configured — logged only")
            logger.info("[Email] → %s | %s", payload.recipient_email, payload.title)
            return True

        try:
            msg = MIMEText(payload.body, "plain", "utf-8")
            msg["Subject"] = payload.title
            msg["From"] = settings.SMTP_FROM
            msg["To"] = payload.recipient_email

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_FROM, payload.recipient_email, msg.as_string())

            logger.info("[Email] Sent → %s", payload.recipient_email)
            return True
        except Exception as exc:
            logger.error("[Email] Failed → %s: %s", payload.recipient_email, exc)
            return False


# ── Push via FCM ──────────────────────────────────────────────────────────────

class PushHandler(NotificationHandler):
    """
    Sends push notifications via Firebase Cloud Messaging.
    Requires in .env:
      FCM_SERVER_KEY=your_fcm_server_key
    """
    async def send(self, payload: NotificationPayload) -> bool:
        if not payload.recipient_push_token:
            logger.warning("[Push] No push token — skipped")
            return False

        if not settings.FCM_SERVER_KEY:
            logger.warning("[Push] FCM not configured — logged only")
            logger.info("[Push] → %s | %s", payload.recipient_push_token, payload.title)
            return True

        try:
            import httpx
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://fcm.googleapis.com/fcm/send",
                    headers={
                        "Authorization": f"key={settings.FCM_SERVER_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "to": payload.recipient_push_token,
                        "notification": {
                            "title": payload.title,
                            "body": payload.body,
                        },
                        "data": payload.extra or {},
                    },
                )
                resp.raise_for_status()
            logger.info("[Push] Sent → %s", payload.recipient_push_token[:20])
            return True
        except Exception as exc:
            logger.error("[Push] Failed: %s", exc)
            return False


# ── Factory ───────────────────────────────────────────────────────────────────

_HANDLER_MAP: dict[str, NotificationHandler] = {
    "WHATSAPP": WhatsAppHandler(),
    "SMS":      SMSHandler(),
    "EMAIL":    EmailHandler(),
    "PUSH":     PushHandler(),
}


class NotificationFactory:
    @staticmethod
    def get_handler(channel: str) -> NotificationHandler:
        handler = _HANDLER_MAP.get(channel.upper())
        if not handler:
            raise ValueError(
                f"Unknown notification channel: '{channel}'. "
                f"Supported: {list(_HANDLER_MAP.keys())}"
            )
        return handler

    @staticmethod
    async def dispatch(channel: str, payload: NotificationPayload) -> bool:
        handler = NotificationFactory.get_handler(channel)
        return await handler.send(payload)
