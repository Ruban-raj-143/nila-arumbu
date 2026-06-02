"""
Nila Arumbu — Voice Pipeline Unit Tests
Tests intent detection and data extraction without requiring Whisper.
"""
import pytest
from app.domains.voice.pipeline import (
    VoiceIntent,
    detect_intent,
    extract_attendance_data,
    extract_growth_data,
)


class TestIntentDetection:
    def test_tamil_attendance_present(self):
        intent, conf = detect_intent("குழந்தை வருகை உண்டு")
        assert intent == VoiceIntent.RECORD_ATTENDANCE
        assert conf > 0

    def test_tamil_attendance_absent(self):
        intent, _ = detect_intent("வரவில்லை இன்று")
        assert intent == VoiceIntent.RECORD_ATTENDANCE

    def test_tamil_growth_weight(self):
        intent, _ = detect_intent("எடை 12 கிலோ")
        assert intent == VoiceIntent.RECORD_GROWTH

    def test_tamil_referral(self):
        intent, _ = detect_intent("மருத்துவமனை பரிந்துரை தேவை")
        assert intent == VoiceIntent.CREATE_REFERRAL

    def test_english_present(self):
        intent, _ = detect_intent("child is present today")
        assert intent == VoiceIntent.RECORD_ATTENDANCE

    def test_english_weight(self):
        intent, _ = detect_intent("weight is 12.5 kg")
        assert intent == VoiceIntent.RECORD_GROWTH

    def test_english_referral(self):
        intent, _ = detect_intent("need hospital referral")
        assert intent == VoiceIntent.CREATE_REFERRAL

    def test_unknown_intent(self):
        intent, conf = detect_intent("hello world random text")
        assert intent == VoiceIntent.UNKNOWN
        assert conf == 0.0


class TestGrowthExtraction:
    def test_extract_weight_kg(self):
        data = extract_growth_data("weight 12.5 kg")
        assert data["weight_kg"] == 12.5

    def test_extract_height_cm(self):
        data = extract_growth_data("height 87 cm")
        assert data["height_cm"] == 87.0

    def test_extract_muac(self):
        data = extract_growth_data("muac 13.5")
        assert data["muac_cm"] == 13.5

    def test_extract_multiple_values(self):
        data = extract_growth_data("weight 11 kg height 85 cm muac 12.5")
        assert data["weight_kg"] == 11.0
        assert data["height_cm"] == 85.0
        assert data["muac_cm"] == 12.5

    def test_no_values_returns_empty(self):
        data = extract_growth_data("no measurements here")
        assert data == {}


class TestAttendanceExtraction:
    def test_present_english(self):
        data = extract_attendance_data("child is present")
        assert data["status"] == "PRESENT"

    def test_absent_english(self):
        data = extract_attendance_data("child is absent today")
        assert data["status"] == "ABSENT"

    def test_excused(self):
        data = extract_attendance_data("excused leave today")
        assert data["status"] == "EXCUSED"

    def test_tamil_absent(self):
        data = extract_attendance_data("வரவில்லை")
        assert data["status"] == "ABSENT"

    def test_default_is_present(self):
        data = extract_attendance_data("some random text")
        assert data["status"] == "PRESENT"
