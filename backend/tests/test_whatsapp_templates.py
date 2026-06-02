"""
Nila Arumbu — WhatsApp Template Tests
Tests all 8 Tamil/English message templates.
"""
import pytest
from app.domains.engagement.whatsapp import MessageTemplate, render_message


class TestMessageTemplates:
    def test_daily_activity_contains_tamil(self):
        msg = render_message(MessageTemplate.DAILY_ACTIVITY, "Aravind")
        assert "நமஸ்காரம்" in msg.body
        assert "Aravind" in msg.body

    def test_daily_activity_contains_english(self):
        msg = render_message(MessageTemplate.DAILY_ACTIVITY, "Aravind")
        assert "Hello" in msg.body
        assert "Nila Arumbu" in msg.body

    def test_weekly_reminder(self):
        msg = render_message(MessageTemplate.WEEKLY_REMINDER, "Priya")
        assert "Priya" in msg.body
        assert "Anganwadi" in msg.body

    def test_referral_reminder_with_facility(self):
        msg = render_message(
            MessageTemplate.REFERRAL_REMINDER, "Karthik",
            facility="Government Hospital", facility_en="Government Hospital",
            date="15-Jan-2025",
        )
        assert "Government Hospital" in msg.body
        assert "15-Jan-2025" in msg.body

    def test_risk_alert_urgent(self):
        msg = render_message(
            MessageTemplate.RISK_ALERT, "Murugan",
            reason="SAM detected", reason_en="SAM detected",
        )
        assert "🔴" in msg.body
        assert "SAM detected" in msg.body
        assert "Murugan" in msg.body

    def test_progress_summary_with_data(self):
        msg = render_message(
            MessageTemplate.PROGRESS_SUMMARY, "Lalitha",
            attendance_rate=85, weight=12.5, height=87, dev_status="On Track",
        )
        assert "85" in msg.body
        assert "12.5" in msg.body

    def test_attendance_alert(self):
        msg = render_message(MessageTemplate.ATTENDANCE_ALERT, "Ravi")
        assert "Ravi" in msg.body
        assert "வரவில்லை" in msg.body or "not attended" in msg.body

    def test_appointment_reminder(self):
        msg = render_message(
            MessageTemplate.APPOINTMENT_REMINDER, "Deepa",
            facility="PHC Egmore", time="10:00 AM",
        )
        assert "Deepa" in msg.body
        assert "PHC Egmore" in msg.body

    def test_all_templates_have_nila_arumbu_signature(self):
        for template in MessageTemplate:
            msg = render_message(template, "Test Child")
            assert "Nila Arumbu" in msg.body, f"Missing signature in {template}"

    def test_all_templates_include_child_name(self):
        for template in MessageTemplate:
            msg = render_message(template, "Unique Name XYZ")
            assert "Unique Name XYZ" in msg.body, f"Missing child name in {template}"

    def test_title_is_bilingual(self):
        msg = render_message(MessageTemplate.DAILY_ACTIVITY, "Child")
        assert "|" in msg.title  # Tamil | English format
