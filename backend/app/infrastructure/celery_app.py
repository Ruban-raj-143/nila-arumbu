"""
Nila Arumbu — Celery Application
Background task processing for notifications, risk recalculation, escalations.
"""
from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "nilarumbu",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.tasks.risk_tasks",
        "app.tasks.referral_tasks",
        "app.tasks.notification_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    # Beat schedule — periodic tasks
    beat_schedule={
        # Every day at 8 AM IST — recalculate risk for all active children
        "daily-risk-recalculation": {
            "task": "app.tasks.risk_tasks.recalculate_all_risk_scores",
            "schedule": 86400,  # 24 hours in seconds
        },
        # Every hour — check for overdue referrals and escalate
        "hourly-referral-escalation-check": {
            "task": "app.tasks.referral_tasks.check_and_escalate_overdue_referrals",
            "schedule": 3600,
        },
        # Every day at 9 AM — send attendance reminders to workers
        "daily-attendance-reminder": {
            "task": "app.tasks.notification_tasks.send_attendance_reminders",
            "schedule": 86400,
        },
    },
)
