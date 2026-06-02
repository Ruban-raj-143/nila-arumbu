"""
Nila Arumbu — Risk Engine Unit Tests
Tests the Strategy Pattern implementation and score classification.
"""
import pytest
from app.domains.risk.engine import ChildRiskContext, RiskEngine


@pytest.fixture
def engine() -> RiskEngine:
    return RiskEngine()


def _ctx(**kwargs) -> ChildRiskContext:
    defaults = dict(
        child_id="test-child-001",
        total_sessions=20,
        attended_sessions=20,
        weight_for_age_z=0.0,
        height_for_age_z=0.0,
        muac_cm=15.0,
        development_milestone_score=90.0,
        primary_caregiver_present=True,
        caregiver_literate=True,
        household_income_below_poverty=False,
        has_migrated_in_last_6_months=False,
        migration_count_last_year=0,
    )
    defaults.update(kwargs)
    return ChildRiskContext(**defaults)


class TestRiskClassification:
    def test_healthy_child_is_green(self, engine):
        output = engine.calculate(_ctx())
        assert output.risk_level == "GREEN"
        assert output.total_score <= 30

    def test_sam_child_has_high_nutrition_score(self, engine):
        """SAM (MUAC < 11.5) maxes the nutrition component (25% weight = 25 pts).
        Combined with poor attendance and development it becomes RED."""
        output = engine.calculate(_ctx(
            muac_cm=10.0,
            weight_for_age_z=-4.0,
            total_sessions=20, attended_sessions=5,   # critical attendance
            development_milestone_score=30.0,          # severe delay
        ))
        assert output.risk_level == "RED"
        assert output.total_score >= 70
        assert "severe_acute_malnutrition" in output.contributing_factors

    def test_sam_nutrition_factor_present(self, engine):
        """SAM factor is always flagged when MUAC < 11.5, regardless of other factors."""
        output = engine.calculate(_ctx(muac_cm=10.0))
        assert "severe_acute_malnutrition" in output.contributing_factors

    def test_absent_child_raises_score(self, engine):
        output = engine.calculate(_ctx(total_sessions=20, attended_sessions=5))
        assert "attendance_critical" in output.contributing_factors

    def test_migrant_child_has_migration_factor(self, engine):
        output = engine.calculate(_ctx(has_migrated_in_last_6_months=True, migration_count_last_year=3))
        assert "recent_migration" in output.contributing_factors
        assert "frequent_migration" in output.contributing_factors

    def test_score_is_bounded_0_to_100(self, engine):
        # Worst case — all risk factors maxed
        output = engine.calculate(_ctx(
            total_sessions=20, attended_sessions=0,
            muac_cm=10.0, weight_for_age_z=-4.0, height_for_age_z=-4.0,
            development_milestone_score=10.0,
            primary_caregiver_present=False, caregiver_literate=False,
            household_income_below_poverty=True,
            has_migrated_in_last_6_months=True, migration_count_last_year=5,
        ))
        assert 0.0 <= output.total_score <= 100.0

    def test_explanation_is_not_empty(self, engine):
        output = engine.calculate(_ctx())
        assert len(output.explanation) > 0

    def test_weight_breakdown_sums_to_1(self, engine):
        output = engine.calculate(_ctx())
        total_weight = sum(output.weight_breakdown.values())
        assert abs(total_weight - 1.0) < 0.001

    def test_yellow_range(self, engine):
        output = engine.calculate(_ctx(
            total_sessions=20, attended_sessions=12,
            weight_for_age_z=-2.5,
            development_milestone_score=65.0,
        ))
        assert output.risk_level in ("YELLOW", "RED")


class TestRiskExplainability:
    def test_component_scores_present(self, engine):
        output = engine.calculate(_ctx())
        assert "AttendanceRisk" in output.component_scores
        assert "NutritionRisk" in output.component_scores
        assert "DevelopmentRisk" in output.component_scores
        assert "CaregiverRisk" in output.component_scores
        assert "MigrationRisk" in output.component_scores

    def test_no_factors_for_healthy_child(self, engine):
        output = engine.calculate(_ctx())
        assert len(output.contributing_factors) == 0
