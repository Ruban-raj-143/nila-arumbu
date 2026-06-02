"""
Nila Arumbu — Parent WhatsApp Engagement
Pre-built message templates for parent communication.
Tamil + English bilingual messages.
"""
from dataclasses import dataclass
from enum import Enum


class MessageTemplate(str, Enum):
    DAILY_ACTIVITY       = "DAILY_ACTIVITY"
    WEEKLY_REMINDER      = "WEEKLY_REMINDER"
    REFERRAL_REMINDER    = "REFERRAL_REMINDER"
    DEVELOPMENT_NUDGE    = "DEVELOPMENT_NUDGE"
    PROGRESS_SUMMARY     = "PROGRESS_SUMMARY"
    ATTENDANCE_ALERT     = "ATTENDANCE_ALERT"
    RISK_ALERT           = "RISK_ALERT"
    APPOINTMENT_REMINDER = "APPOINTMENT_REMINDER"


@dataclass
class RenderedMessage:
    title: str
    body: str


# ── Message templates (Tamil + English) ──────────────────────────────────────

def render_message(
    template: MessageTemplate,
    child_name: str,
    **kwargs,
) -> RenderedMessage:
    """
    Renders a WhatsApp message from a template.
    All messages are bilingual (Tamil + English).
    """

    templates: dict[MessageTemplate, RenderedMessage] = {

        MessageTemplate.DAILY_ACTIVITY: RenderedMessage(
            title="இன்றைய செயல்பாடு | Today's Activity",
            body=(
                f"நமஸ்காரம்! 🙏\n\n"
                f"{child_name}-க்கான இன்றைய செயல்பாடு:\n"
                f"📌 {kwargs.get('activity', 'உங்கள் குழந்தையுடன் 15 நிமிடம் பேசுங்கள்')}\n\n"
                f"Hello! Today's activity for {child_name}:\n"
                f"📌 {kwargs.get('activity_en', 'Talk with your child for 15 minutes')}\n\n"
                f"— Nila Arumbu"
            ),
        ),

        MessageTemplate.WEEKLY_REMINDER: RenderedMessage(
            title="வாராந்திர நினைவூட்டல் | Weekly Reminder",
            body=(
                f"நமஸ்காரம்! 🌟\n\n"
                f"{child_name} இந்த வாரம் Anganwadi-க்கு வந்தாரா?\n"
                f"தவறாமல் அனுப்புங்கள் — ஒவ்வொரு நாளும் முக்கியம்!\n\n"
                f"Did {child_name} attend Anganwadi this week?\n"
                f"Regular attendance is important for development.\n\n"
                f"— Nila Arumbu"
            ),
        ),

        MessageTemplate.REFERRAL_REMINDER: RenderedMessage(
            title="மருத்துவ சந்திப்பு நினைவூட்டல் | Appointment Reminder",
            body=(
                f"முக்கியமான நினைவூட்டல்! ⚠️\n\n"
                f"{child_name}-க்கு {kwargs.get('facility', 'மருத்துவமனை')}-ல் "
                f"சந்திப்பு உள்ளது.\n"
                f"தேதி: {kwargs.get('date', 'விரைவில்')}\n\n"
                f"Important Reminder!\n"
                f"{child_name} has an appointment at {kwargs.get('facility_en', 'the hospital')}.\n"
                f"Date: {kwargs.get('date', 'Soon')}\n\n"
                f"Please do not miss this appointment.\n"
                f"— Nila Arumbu"
            ),
        ),

        MessageTemplate.DEVELOPMENT_NUDGE: RenderedMessage(
            title="வளர்ச்சி குறிப்பு | Development Tip",
            body=(
                f"நமஸ்காரம்! 💚\n\n"
                f"{child_name}-ன் வளர்ச்சிக்கு இன்றைய குறிப்பு:\n"
                f"🎯 {kwargs.get('tip', 'படங்கள் உள்ள புத்தகம் காட்டி பெயர் சொல்லுங்கள்')}\n\n"
                f"Development tip for {child_name}:\n"
                f"🎯 {kwargs.get('tip_en', 'Show picture books and name the objects')}\n\n"
                f"— Nila Arumbu"
            ),
        ),

        MessageTemplate.PROGRESS_SUMMARY: RenderedMessage(
            title="மாதாந்திர முன்னேற்ற அறிக்கை | Monthly Progress",
            body=(
                f"நமஸ்காரம்! 📊\n\n"
                f"{child_name}-ன் இந்த மாத முன்னேற்றம்:\n"
                f"✅ வருகை: {kwargs.get('attendance_rate', '—')}%\n"
                f"⚖️ எடை: {kwargs.get('weight', '—')} kg\n"
                f"📏 உயரம்: {kwargs.get('height', '—')} cm\n"
                f"🧠 வளர்ச்சி நிலை: {kwargs.get('dev_status', '—')}\n\n"
                f"Monthly Progress for {child_name}:\n"
                f"✅ Attendance: {kwargs.get('attendance_rate', '—')}%\n"
                f"⚖️ Weight: {kwargs.get('weight', '—')} kg\n"
                f"📏 Height: {kwargs.get('height', '—')} cm\n"
                f"🧠 Development: {kwargs.get('dev_status', '—')}\n\n"
                f"— Nila Arumbu"
            ),
        ),

        MessageTemplate.ATTENDANCE_ALERT: RenderedMessage(
            title="வருகை எச்சரிக்கை | Attendance Alert",
            body=(
                f"கவனிக்கவும்! ⚠️\n\n"
                f"{child_name} கடந்த சில நாட்களாக Anganwadi-க்கு வரவில்லை.\n"
                f"தயவுசெய்து உங்கள் Anganwadi worker-ஐ தொடர்பு கொள்ளுங்கள்.\n\n"
                f"Alert: {child_name} has not attended Anganwadi recently.\n"
                f"Please contact your Anganwadi worker.\n\n"
                f"— Nila Arumbu"
            ),
        ),

        MessageTemplate.RISK_ALERT: RenderedMessage(
            title="உடனடி கவனிப்பு தேவை | Immediate Attention Required",
            body=(
                f"முக்கியமான செய்தி! 🔴\n\n"
                f"{child_name}-க்கு உடனடி மருத்துவ கவனிப்பு தேவை.\n"
                f"காரணம்: {kwargs.get('reason', 'உடல் நல பரிசோதனை தேவை')}\n\n"
                f"உங்கள் Anganwadi worker அல்லது PHC-ஐ இன்றே தொடர்பு கொள்ளுங்கள்.\n\n"
                f"URGENT: {child_name} requires immediate medical attention.\n"
                f"Reason: {kwargs.get('reason_en', 'Health check required')}\n\n"
                f"Please contact your Anganwadi worker or PHC today.\n"
                f"— Nila Arumbu"
            ),
        ),

        MessageTemplate.APPOINTMENT_REMINDER: RenderedMessage(
            title="நாளை சந்திப்பு | Tomorrow's Appointment",
            body=(
                f"நினைவூட்டல்! 📅\n\n"
                f"நாளை {child_name}-க்கு {kwargs.get('facility', 'மருத்துவமனை')}-ல் "
                f"சந்திப்பு உள்ளது.\n"
                f"நேரம்: {kwargs.get('time', 'காலை 10:00')}\n\n"
                f"Reminder: {child_name} has an appointment tomorrow at "
                f"{kwargs.get('facility_en', 'the hospital')}.\n"
                f"Time: {kwargs.get('time', '10:00 AM')}\n\n"
                f"— Nila Arumbu"
            ),
        ),
    }

    return templates.get(template, RenderedMessage(
        title="Nila Arumbu",
        body=f"Message for {child_name}.",
    ))
