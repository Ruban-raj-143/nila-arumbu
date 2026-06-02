"""
Nila Arumbu — Development Service Unit Tests
Tests milestone score computation and status classification.
"""
import pytest
from app.domains.development.service import _classify_status, _compute_overall
from app.domains.development.schemas import AssessmentCreate
from datetime import date


def _assessment(**kwargs) -> AssessmentCreate:
    defaults = dict(
        child_id="00000000-0000-0000-0000-000000000001",
        assessed_date=date.today(),
        age_in_months=24,
        gross_motor_score=80.0,
        fine_motor_score=80.0,
        language_score=80.0,
        cognitive_score=80.0,
        social_emotional_score=80.0,
    )
    defaults.update(kwargs)
    return AssessmentCreate(**defaults)


class TestOverallScore:
    def test_all_perfect_scores_give_100(self):
        a = _assessment(
            gross_motor_score=100, fine_motor_score=100,
            language_score=100, cognitive_score=100, social_emotional_score=100,
        )
        assert _compute_overall(a) == 100.0

    def test_all_zero_scores_give_0(self):
        a = _assessment(
            gross_motor_score=0, fine_motor_score=0,
            language_score=0, cognitive_score=0, social_emotional_score=0,
        )
        assert _compute_overall(a) == 0.0

    def test_weighted_average_is_correct(self):
        # language has highest weight (0.25), gross_motor lowest (0.20)
        a = _assessment(
            gross_motor_score=100, fine_motor_score=0,
            language_score=0, cognitive_score=0, social_emotional_score=0,
        )
        # Only gross_motor contributes: 100 * 0.20 = 20.0
        assert _compute_overall(a) == 20.0


class TestStatusClassification:
    def test_score_90_is_on_track(self):
        assert _classify_status(90.0) == "ON_TRACK"

    def test_score_80_is_on_track(self):
        assert _classify_status(80.0) == "ON_TRACK"

    def test_score_70_is_mild_delay(self):
        assert _classify_status(70.0) == "MILD_DELAY"

    def test_score_50_is_moderate_delay(self):
        assert _classify_status(50.0) == "MODERATE_DELAY"

    def test_score_30_is_severe_delay(self):
        assert _classify_status(30.0) == "SEVERE_DELAY"

    def test_score_0_is_severe_delay(self):
        assert _classify_status(0.0) == "SEVERE_DELAY"
