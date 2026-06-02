"""
Nila Arumbu — Growth Service Unit Tests
Tests nutrition classification logic.
"""
import pytest
from app.domains.growth.service import _classify_nutrition, _compute_trend
from app.domains.growth.models import GrowthRecord


class TestNutritionClassification:
    def test_sam_by_muac(self):
        assert _classify_nutrition(muac=10.0, waz=None, haz=None) == "SAM"

    def test_mam_by_muac(self):
        assert _classify_nutrition(muac=12.0, waz=None, haz=None) == "MAM"

    def test_normal_muac(self):
        assert _classify_nutrition(muac=15.0, waz=0.0, haz=0.0) == "NORMAL"

    def test_severe_underweight_by_waz(self):
        assert _classify_nutrition(muac=15.0, waz=-4.0, haz=0.0) == "SEVERE_UNDERWEIGHT"

    def test_underweight_by_waz(self):
        assert _classify_nutrition(muac=15.0, waz=-2.5, haz=0.0) == "UNDERWEIGHT"

    def test_stunted_by_haz(self):
        assert _classify_nutrition(muac=15.0, waz=0.0, haz=-2.5) == "STUNTED"

    def test_muac_takes_priority_over_waz(self):
        # SAM by MUAC should override underweight by WAZ
        assert _classify_nutrition(muac=10.0, waz=-2.5, haz=0.0) == "SAM"

    def test_all_none_returns_normal(self):
        assert _classify_nutrition(muac=None, waz=None, haz=None) == "NORMAL"


class TestGrowthTrend:
    def _record(self, weight: float) -> GrowthRecord:
        r = GrowthRecord()
        r.weight_kg = weight
        return r

    def test_improving_trend(self):
        records = [self._record(10.5), self._record(10.0)]  # desc order
        assert _compute_trend(records) == "IMPROVING"

    def test_declining_trend(self):
        records = [self._record(9.5), self._record(10.5)]
        assert _compute_trend(records) == "DECLINING"

    def test_stable_trend(self):
        records = [self._record(10.1), self._record(10.0)]
        assert _compute_trend(records) == "STABLE"

    def test_single_record_insufficient(self):
        assert _compute_trend([self._record(10.0)]) == "INSUFFICIENT_DATA"

    def test_empty_records_insufficient(self):
        assert _compute_trend([]) == "INSUFFICIENT_DATA"
