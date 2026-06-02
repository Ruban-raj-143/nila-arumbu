/**
 * Nila Arumbu — Voice Recording Hook
 * Uses MediaRecorder API to capture audio and send to the voice pipeline.
 */
import { useCallback, useRef, useState } from 'react';
import { api } from '../lib/api';

export interface VoiceResult {
  intent: string;
  transcript: string;
  structured_data: Record<string, unknown>;
  confidence: number;
  error: string | null;
}

export type RecordingState = 'idle' | 'recording' | 'processing' | 'done' | 'error';

export function useVoice() {
  const [state, setState] = useState<RecordingState>('idle');
  const [result, setResult] = useState<VoiceResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    setResult(null);
    setErrorMsg(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setState('processing');

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');

        try {
          const res = await fetch('/api/v1/voice/transcribe', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
            body: formData,
          });
          if (!res.ok) throw new Error('Transcription failed');
          const data: VoiceResult = await res.json();
          setResult(data);
          setState('done');
        } catch (err) {
          setErrorMsg('Could not process audio. Please try again.');
          setState('error');
        }
      };

      recorder.start();
      setState('recording');
    } catch (err) {
      setErrorMsg('Microphone access denied. Please allow microphone permission.');
      setState('error');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setResult(null);
    setErrorMsg(null);
  }, []);

  return { state, result, errorMsg, startRecording, stopRecording, reset };
}

function getToken(): string {
  try {
    const raw = localStorage.getItem('nilarumbu-auth');
    if (!raw) return '';
    return JSON.parse(raw)?.state?.access_token ?? '';
  } catch {
    return '';
  }
}
