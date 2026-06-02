"""
Nila Arumbu — Learning Planner Unit Tests
Tests the age-band activity generation and risk/delay supplements.
"""
import pytest
from app.domains.learning.planner import LearningPlanner, PlanInput


@pytest.fixture
def planner() -> LearningPlanner:
    return LearningPlanner()


def _inp(**kwargs) -> PlanInput:
    defaults = dict(
        child_id="test-child",
        age_in_months=24,
        risk_level="GREEN",
        developmental_status="ON_TRACK",
    )
    defaults.update(kwargs)
    return PlanInput(**defaults)


class TestAgeBands:
    def test_infant_gets_sensory_activities(self, planner):
        plan = planner.generate(_inp(age_in_months=6))
        assert any("sensory" in a.lower() or "tummy" in a.lower() for a in plan.centre_activities)

    def test_toddler_gets_stacking_activities(self, planner):
        plan = planner.generate(_inp(age_in_months=18))
        assert any("block" in a.lower() or "sorting" in a.lower() for a in plan.centre_activities)

    def test_preschool_gets_school_readiness(self, planner):
        plan = planner.generate(_inp(age_in_months=48))
        assert len(plan.school_readiness_tasks) > 0

    def test_older_child_gets_tamil_literacy(self, planner):
        plan = planner.generate(_inp(age_in_months=60))
        assert any("tamil" in a.lower() or "Tamil" in a for a in plan.school_readiness_tasks)

    def test_boundary_age_72_months(self, planner):
        plan = planner.generate(_inp(age_in_months=72))
        assert len(plan.centre_activities) > 0


class TestRiskSupplements:
    def test_yellow_risk_adds_monitoring(self, planner):
        plan = planner.generate(_inp(risk_level="YELLOW"))
        assert any("check-in" in a.lower() or "counselling" in a.lower() for a in plan.centre_activities)

    def test_red_risk_adds_daily_monitoring(self, planner):
        plan = planner.generate(_inp(risk_level="RED"))
        assert any("daily" in a.lower() for a in plan.centre_activities)

    def test_green_risk_no_supplements(self, planner):
        green_plan = planner.generate(_inp(risk_level="GREEN"))
        red_plan = planner.generate(_inp(risk_level="RED"))
        assert len(red_plan.centre_activities) > len(green_plan.centre_activities)


class TestDelaySupplements:
    def test_severe_delay_adds_specialist_referral(self, planner):
        plan = planner.generate(_inp(developmental_status="SEVERE_DELAY"))
        assert any("specialist" in a.lower() for a in plan.centre_activities)

    def test_moderate_delay_adds_phc_referral(self, planner):
        plan = planner.generate(_inp(developmental_status="MODERATE_DELAY"))
        assert any("phc" in a.lower() or "evaluation" in a.lower() for a in plan.centre_activities)

    def test_on_track_no_delay_supplements(self, planner):
        plan = planner.generate(_inp(developmental_status="ON_TRACK"))
        assert not any("specialist" in a.lower() for a in plan.centre_activities)
