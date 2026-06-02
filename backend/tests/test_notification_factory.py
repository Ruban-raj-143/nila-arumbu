"""
Nila Arumbu — Notification Factory Unit Tests
Tests the Factory Pattern channel dispatch.
"""
import pytest
from app.domains.notification.factory import NotificationFactory, NotificationPayload


@pytest.fixture
def payload() -> NotificationPayload:
    return NotificationPayload(
        recipient_phone="+919876543210",
        recipient_email="test@example.com",
        title="Test Alert",
        body="This is a test notification.",
    )


class TestNotificationFactory:
    @pytest.mark.asyncio
    async def test_whatsapp_dispatch_succeeds(self, payload):
        result = await NotificationFactory.dispatch("WHATSAPP", payload)
        assert result is True

    @pytest.mark.asyncio
    async def test_sms_dispatch_succeeds(self, payload):
        """SMS succeeds when no from-number configured — logs only (graceful dev mode)."""
        from app.domains.notification.factory import SMSHandler, NotificationPayload
        sms_payload = NotificationPayload(
            recipient_phone="+919876543210",
            title="Test",
            body="Test SMS",
        )
        # With no TWILIO_SMS_FROM configured, handler logs and returns True (dev mode)
        from app.core.config import settings
        original = settings.TWILIO_SMS_FROM
        settings.TWILIO_SMS_FROM = ""  # ensure no from number
        settings.TWILIO_ACCOUNT_SID = ""  # force dev mode
        result = await SMSHandler().send(sms_payload)
        settings.TWILIO_SMS_FROM = original
        assert result is True

    @pytest.mark.asyncio
    async def test_email_dispatch_succeeds(self, payload):
        result = await NotificationFactory.dispatch("EMAIL", payload)
        assert result is True

    @pytest.mark.asyncio
    async def test_push_dispatch_succeeds(self, payload):
        push_payload = NotificationPayload(
            recipient_push_token="test-device-token-abc123",
            title="Test Alert",
            body="This is a test notification.",
        )
        result = await NotificationFactory.dispatch("PUSH", push_payload)
        assert result is True

    def test_unknown_channel_raises_value_error(self, payload):
        with pytest.raises(ValueError, match="Unknown notification channel"):
            NotificationFactory.get_handler("TELEGRAM")

    def test_channel_lookup_is_case_insensitive(self, payload):
        handler = NotificationFactory.get_handler("whatsapp")
        assert handler is not None

    def test_all_channels_registered(self):
        for channel in ("WHATSAPP", "SMS", "EMAIL", "PUSH"):
            handler = NotificationFactory.get_handler(channel)
            assert handler is not None
