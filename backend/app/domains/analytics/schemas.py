"""
Nila Arumbu — Analytics Schemas
"""
from datetime import date
from uuid import UUID
from pydantic import BaseModel


class CentreRiskSummary(BaseModel):
    centre_id: UUID
    centre_name: str
    total_children: int
    green_count: int
    yellow_count: int
    red_count: int
    unassessed_count: int


class ReferralAgingReport(BaseModel):
    status: str
    count: int
    avg_days_in_status: float
    oldest_days: int
    escalated_count: int


class AttendanceTrend(BaseModel):
    period: str        # e.g. "2024-W23"
    total_sessions: int
    attended: int
    attendance_rate: float


class WorkerProductivity(BaseModel):
    worker_id: UUID
    worker_name: str
    children_count: int
    attendance_recorded_today: bool
    growth_records_this_month: int
    open_referrals: int
    risk_assessments_this_month: int


class PlatformSummary(BaseModel):
    total_children: int
    total_centres: int
    total_workers: int
    risk_distribution: dict[str, int]   # GREEN/YELLOW/RED counts
    open_referrals: int
    escalated_referrals: int
    attendance_rate_today: float
    as_of: date
