"""
Nila Arumbu — Tamil Voice Pipeline
Speech → Whisper → Validation → Structured Data → Domain Services

Workflow:
  1. Receive audio file (WAV/MP3/WebM)
  2. Transcribe via Whisper (local) or cloud fallback
  3. Parse Tamil/English intent from transcript
  4. Map to structured domain action
  5. Return action payload for the calling service
"""
import logging
import re
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path

logger = logging.getLogger(__name__)


# ── Intent types ──────────────────────────────────────────────────────────────

class VoiceIntent(str, Enum):
    RECORD_ATTENDANCE   = "RECORD_ATTENDANCE"
    RECORD_GROWTH       = "RECORD_GROWTH"
    RECORD_OBSERVATION  = "RECORD_OBSERVATION"
    CREATE_REFERRAL     = "CREATE_REFERRAL"
    UNKNOWN             = "UNKNOWN"


@dataclass
class VoiceTranscript:
    raw_text: str
    language: str = "ta"   # ISO 639-1: ta=Tamil, en=English
    confidence: float = 0.0


@dataclass
class VoiceAction:
    intent: VoiceIntent
    transcript: str
    structured_data: dict = field(default_factory=dict)
    confidence: float = 0.0
    error: str | None = None


# ── Intent keyword maps (O(1) lookup) ─────────────────────────────────────────

# Tamil keywords → intent
_TAMIL_INTENT_MAP: dict[str, VoiceIntent] = {
    "வருகை":       VoiceIntent.RECORD_ATTENDANCE,   # attendance
    "வந்தார்":     VoiceIntent.RECORD_ATTENDANCE,
    "வரவில்லை":   VoiceIntent.RECORD_ATTENDANCE,
    "எடை":         VoiceIntent.RECORD_GROWTH,        # weight
    "உயரம்":       VoiceIntent.RECORD_GROWTH,        # height
    "muac":         VoiceIntent.RECORD_GROWTH,
    "குறிப்பு":    VoiceIntent.RECORD_OBSERVATION,   # observation/note
    "பரிந்துரை":   VoiceIntent.CREATE_REFERRAL,      # referral
    "மருத்துவமனை": VoiceIntent.CREATE_REFERRAL,      # hospital
}

# English keywords → intent
_ENGLISH_INTENT_MAP: dict[str, VoiceIntent] = {
    "attendance":  VoiceIntent.RECORD_ATTENDANCE,
    "present":     VoiceIntent.RECORD_ATTENDANCE,
    "absent":      VoiceIntent.RECORD_ATTENDANCE,
    "weight":      VoiceIntent.RECORD_GROWTH,
    "height":      VoiceIntent.RECORD_GROWTH,
    "growth":      VoiceIntent.RECORD_GROWTH,
    "observation": VoiceIntent.RECORD_OBSERVATION,
    "note":        VoiceIntent.RECORD_OBSERVATION,
    "referral":    VoiceIntent.CREATE_REFERRAL,
    "hospital":    VoiceIntent.CREATE_REFERRAL,
    "refer":       VoiceIntent.CREATE_REFERRAL,
}


# ── Transcription ─────────────────────────────────────────────────────────────

async def transcribe_audio(audio_path: str | Path) -> VoiceTranscript:
    """
    Transcribe audio using Whisper.
    Falls back to a stub if Whisper is not installed.
    """
    try:
        import whisper  # type: ignore
        model = whisper.load_model("small")
        result = model.transcribe(str(audio_path), language="ta", task="transcribe")
        return VoiceTranscript(
            raw_text=result["text"].strip(),
            language=result.get("language", "ta"),
            confidence=float(result.get("avg_logprob", 0.0) + 1.0),  # normalise
        )
    except ImportError:
        logger.warning("Whisper not installed — using stub transcription")
        return VoiceTranscript(raw_text="", language="ta", confidence=0.0)
    except Exception as exc:
        logger.error("Transcription failed: %s", exc)
        return VoiceTranscript(raw_text="", language="ta", confidence=0.0)


# ── Intent detection ──────────────────────────────────────────────────────────

def detect_intent(transcript: str) -> tuple[VoiceIntent, float]:
    """
    Detect intent from transcript using keyword matching.
    Returns (intent, confidence_score).
    """
    text_lower = transcript.lower()

    # Check Tamil keywords first
    for keyword, intent in _TAMIL_INTENT_MAP.items():
        if keyword in text_lower:
            return intent, 0.85

    # Check English keywords
    for keyword, intent in _ENGLISH_INTENT_MAP.items():
        if keyword in text_lower:
            return intent, 0.80

    return VoiceIntent.UNKNOWN, 0.0


# ── Data extraction ───────────────────────────────────────────────────────────

def extract_growth_data(transcript: str) -> dict:
    """Extract weight/height/MUAC values from transcript."""
    data: dict = {}

    # Weight: "12.5 kg" or "12 கிலோ"
    weight_match = re.search(r"(\d+\.?\d*)\s*(?:kg|கிலோ|kilo)", transcript, re.IGNORECASE)
    if weight_match:
        data["weight_kg"] = float(weight_match.group(1))

    # Height: "87 cm" or "87 செ.மீ"
    height_match = re.search(r"(\d+\.?\d*)\s*(?:cm|செ\.?மீ|centimeter)", transcript, re.IGNORECASE)
    if height_match:
        data["height_cm"] = float(height_match.group(1))

    # MUAC: "13.5 cm muac"
    muac_match = re.search(r"muac\s*[:\-]?\s*(\d+\.?\d*)", transcript, re.IGNORECASE)
    if muac_match:
        data["muac_cm"] = float(muac_match.group(1))

    return data


def extract_attendance_data(transcript: str) -> dict:
    """Extract attendance status from transcript."""
    text_lower = transcript.lower()
    if any(w in text_lower for w in ["present", "வந்தார்", "வருகை உண்டு"]):
        return {"status": "PRESENT"}
    if any(w in text_lower for w in ["absent", "வரவில்லை", "வருகை இல்லை"]):
        return {"status": "ABSENT"}
    if any(w in text_lower for w in ["excused", "விடுப்பு"]):
        return {"status": "EXCUSED"}
    return {"status": "PRESENT"}  # default


# ── Main pipeline ─────────────────────────────────────────────────────────────

async def process_voice_input(audio_path: str | Path) -> VoiceAction:
    """
    Full pipeline: audio file → structured VoiceAction.
    """
    transcript = await transcribe_audio(audio_path)

    if not transcript.raw_text:
        return VoiceAction(
            intent=VoiceIntent.UNKNOWN,
            transcript="",
            error="Transcription failed or audio was empty.",
        )

    intent, confidence = detect_intent(transcript.raw_text)

    # Extract structured data based on intent
    structured: dict = {}
    if intent == VoiceIntent.RECORD_GROWTH:
        structured = extract_growth_data(transcript.raw_text)
    elif intent == VoiceIntent.RECORD_ATTENDANCE:
        structured = extract_attendance_data(transcript.raw_text)
    elif intent in (VoiceIntent.RECORD_OBSERVATION, VoiceIntent.CREATE_REFERRAL):
        structured = {"notes": transcript.raw_text}

    logger.info(
        "Voice processed: intent=%s confidence=%.2f text='%s'",
        intent, confidence, transcript.raw_text[:80],
    )

    return VoiceAction(
        intent=intent,
        transcript=transcript.raw_text,
        structured_data=structured,
        confidence=confidence,
    )
