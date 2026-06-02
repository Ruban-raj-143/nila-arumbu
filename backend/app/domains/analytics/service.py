"""
Nila Arumbu — Analytics Service
Aggregation queries for supervisor and district dashboards.
"""
import logging
from datetime import date, timedelta
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.analytics.schemas import (
    CentreRiskSummary,
    PlatformSummary,
    ReferralAgingReport,
)
from app.domains.attendance.models import AttendanceRecord
from app.domains.child.models import Centre, Child
from app.domains.identity.models import Role, User
from app.domains.referral.models import Referral
from app.domains.risk.models import RiskScore

logger = logging.getLogger(__name__)


class AnalyticsService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_platform_summary(self) -> PlatformSummary:
        """Top-level numbers for state admin dashboard."""
        today = date.today()

        # Total children
        total_children = (
            await self.session.execute(
                select(func.count(Child.id)).where(Child.is_deleted == False)  # noqa: E712
            )
        ).scalar_one()

        # Total centres
        total_centres = (
            await self.session.execute(
                select(func.count(Centre.id)).where(Centre.is_deleted == False)  # noqa: E712
            )
        ).scalar_one()

        # Total workers
        worker_role = (
            await self.session.execute(
                select(Role.id).where(Role.name == "ANGANWADI_WORKER")
            )
        ).scalar_one_or_none()

        total_workers = 0
        if worker_role:
            total_workers = (
                await self.session.execute(
                    select(func.count(User.id)).where(
                        User.role_id == worker_role,
                        User.is_active == True,  # noqa: E712
                    )
                )
            ).scalar_one()

        # Risk distribution — latest score per child using subquery
        risk_rows = (
            await self.session.execute(
                select(RiskScore.risk_level, func.count(RiskScore.id))
                .where(RiskScore.is_deleted == False)  # noqa: E712
                .group_by(RiskScore.risk_level)
            )
        ).all()
        risk_dist = {row[0]: row[1] for row in risk_rows}

        # Open referrals
        open_referrals = (
            await self.session.execute(
                select(func.count(Referral.id)).where(
                    Referral.status != "CLOSED",
                    Referral.is_deleted == False,  # noqa: E712
                )
            )
        ).scalar_one()

        # Escalated referrals
        escalated = (
            await self.session.execute(
                select(func.count(Referral.id)).where(
                    Referral.escalated == True,  # noqa: E712
                    Referral.status != "CLOSED",
                    Referral.is_deleted == False,  # noqa: E712
                )
            )
        ).scalar_one()

        # Today's attendance rate
        total_today = (
            await self.session.execute(
                select(func.count(AttendanceRecord.id)).where(
                    AttendanceRecord.session_date == today,
                    AttendanceRecord.is_deleted == False,  # noqa: E712
                )
            )
        ).scalar_one()

        present_today = (
            await self.session.execute(
                select(func.count(AttendanceRecord.id)).where(
                    AttendanceRecord.session_date == today,
                    AttendanceRecord.status == "PRESENT",
                    AttendanceRecord.is_deleted == False,  # noqa: E712
                )
            )
        ).scalar_one()

        att_rate = round(present_today / total_today * 100, 1) if total_today > 0 else 0.0

        return PlatformSummary(
            total_children=total_children,
            total_centres=total_centres,
            total_workers=total_workers,
            risk_distribution=risk_dist,
            open_referrals=open_referrals,
            escalated_referrals=escalated,
            attendance_rate_today=att_rate,
            as_of=today,
        )

    async def get_centre_risk_summary(self) -> list[CentreRiskSummary]:
        """Per-centre risk distribution for district officer view."""
        centres_result = await self.session.execute(
            select(Centre).where(Centre.is_deleted == False)  # noqa: E712
        )
        centres = centres_result.scalars().all()

        summaries = []
        for centre in centres:
            children_result = await self.session.execute(
                select(Child.id).where(
                    Child.centre_id == centre.id,
                    Child.is_deleted == False,  # noqa: E712
                )
            )
            child_ids = [row[0] for row in children_result.all()]
            total = len(child_ids)

            if total == 0:
                summaries.append(CentreRiskSummary(
                    centre_id=centre.id, centre_name=centre.name,
                    total_children=0, green_count=0, yellow_count=0,
                    red_count=0, unassessed_count=0,
                ))
                continue

            # Latest risk per child — count by level
            risk_result = await self.session.execute(
                select(RiskScore.risk_level, func.count(RiskScore.id))
                .where(
                    RiskScore.child_id.in_(child_ids),
                    RiskScore.is_deleted == False,  # noqa: E712
                )
                .group_by(RiskScore.risk_level)
            )
            risk_counts: dict[str, int] = {row[0]: row[1] for row in risk_result.all()}
            assessed = sum(risk_counts.values())

            summaries.append(CentreRiskSummary(
                centre_id=centre.id,
                centre_name=centre.name,
                total_children=total,
                green_count=risk_counts.get("GREEN", 0),
                yellow_count=risk_counts.get("YELLOW", 0),
                red_count=risk_counts.get("RED", 0),
                unassessed_count=max(0, total - assessed),
            ))

        return summaries

    async def get_referral_aging_report(self) -> list[ReferralAgingReport]:
        """How long referrals are sitting in each state."""
        from datetime import datetime, UTC
        from sqlalchemy import case

        states = ["IDENTIFIED", "REFERRED", "APPOINTMENT_PENDING", "VISITED", "FOLLOWUP"]
        reports = []

        for state in states:
            result = await self.session.execute(
                select(
                    func.count(Referral.id).label("count"),
                    func.sum(
                        func.extract("epoch", func.now() - Referral.updated_at) / 86400
                    ).label("total_days"),
                    func.max(
                        func.extract("epoch", func.now() - Referral.updated_at) / 86400
                    ).label("max_days"),
                    func.sum(
                        case((Referral.escalated == True, 1), else_=0)  # noqa: E712
                    ).label("escalated"),
                ).where(
                    Referral.status == state,
                    Referral.is_deleted == False,  # noqa: E712
                )
            )
            row = result.one()
            count = row.count or 0
            total_days = float(row.total_days or 0)
            max_days = int(row.max_days or 0)
            escalated = int(row.escalated or 0)

            reports.append(ReferralAgingReport(
                status=state,
                count=count,
                avg_days_in_status=round(total_days / count, 1) if count > 0 else 0.0,
                oldest_days=max_days,
                escalated_count=escalated,
            ))

        return reports
