"""
Nila Arumbu — Voice Router
Accepts audio uploads and returns structured domain actions.
"""
import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, File, UploadFile, status

from app.core.security import TokenPayload, get_current_token
from app.domains.voice.pipeline import process_voice_input
from app.domains.voice.schemas import VoiceActionResponse

router = APIRouter(prefix="/voice", tags=["Tamil Voice"])

ALLOWED_AUDIO_TYPES = {
    "audio/wav", "audio/wave", "audio/mpeg",
    "audio/mp3", "audio/webm", "audio/ogg",
}


@router.post("/transcribe", response_model=VoiceActionResponse, status_code=status.HTTP_200_OK)
async def transcribe_voice(
    audio: UploadFile = File(..., description="Audio file (WAV/MP3/WebM)"),
    token: TokenPayload = Depends(get_current_token),
) -> VoiceActionResponse:
    """
    Upload an audio recording.
    Returns detected intent and structured data ready for domain services.

    Supported intents:
    - RECORD_ATTENDANCE — mark child present/absent
    - RECORD_GROWTH — weight/height/MUAC values
    - RECORD_OBSERVATION — free-form notes
    - CREATE_REFERRAL — referral trigger
    """
    # Save to temp file for Whisper
    suffix = Path(audio.filename or "audio.wav").suffix or ".wav"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        content = await audio.read()
        tmp.write(content)
        tmp_path = tmp.name

    action = await process_voice_input(tmp_path)

    # Clean up temp file
    Path(tmp_path).unlink(missing_ok=True)

    return VoiceActionResponse(
        intent=action.intent.value,
        transcript=action.transcript,
        structured_data=action.structured_data,
        confidence=action.confidence,
        error=action.error,
    )
