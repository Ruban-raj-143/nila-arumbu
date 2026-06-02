"""
Nila Arumbu — Voice Schemas
"""
from pydantic import BaseModel


class VoiceActionResponse(BaseModel):
    intent: str
    transcript: str
    structured_data: dict
    confidence: float
    error: str | None = None
