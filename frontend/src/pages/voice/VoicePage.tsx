import React from 'react';
import { FiMic, FiMicOff, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import { useVoice } from '../../hooks/useVoice';
import { Spinner } from '../../components/ui/Spinner';
import { Card, CardHeader } from '../../components/ui/Card';

const INTENT_LABELS: Record<string, { label: string; color: string }> = {
  RECORD_ATTENDANCE:  { label: 'Record Attendance',  color: 'bg-blue-100 text-blue-800' },
  RECORD_GROWTH:      { label: 'Record Growth',      color: 'bg-green-100 text-green-800' },
  RECORD_OBSERVATION: { label: 'Record Observation', color: 'bg-purple-100 text-purple-800' },
  CREATE_REFERRAL:    { label: 'Create Referral',    color: 'bg-orange-100 text-orange-800' },
  UNKNOWN:            { label: 'Unknown',            color: 'bg-gray-100 text-gray-600' },
};

export const VoicePage = () => {
  const { state, result, errorMsg, startRecording, stopRecording, reset } = useVoice();

  const isRecording = state === 'recording';
  const isProcessing = state === 'processing';
  const isDone = state === 'done';
  const isError = state === 'error';

  const intentCfg = result ? (INTENT_LABELS[result.intent] ?? INTENT_LABELS.UNKNOWN) : null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Tamil Voice Input</h2>
        <p className="text-sm text-gray-500 mt-1">
          பேசுங்கள் — attendance, growth, or referral data record பண்ணலாம்.
        </p>
      </div>

      {/* Recording card */}
      <Card>
        <div className="flex flex-col items-center py-8 gap-6">
          {/* Mic button */}
          <div className="relative">
            {isRecording && (
              <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-40" />
            )}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 scale-110'
                  : isProcessing
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105'
              }`}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isProcessing ? (
                <Spinner size="md" className="text-white" />
              ) : isRecording ? (
                <FiMicOff className="h-10 w-10 text-white" />
              ) : (
                <FiMic className="h-10 w-10 text-white" />
              )}
            </button>
          </div>

          {/* Status text */}
          <div className="text-center">
            {state === 'idle' && (
              <p className="text-sm text-gray-500">
                Tap the mic and speak in Tamil or English
              </p>
            )}
            {isRecording && (
              <p className="text-sm font-semibold text-red-600 animate-pulse">
                Recording… tap to stop
              </p>
            )}
            {isProcessing && (
              <p className="text-sm text-indigo-600 font-medium">Processing audio…</p>
            )}
            {isError && (
              <p className="text-sm text-red-600">{errorMsg}</p>
            )}
          </div>

          {/* Reset */}
          {(isDone || isError) && (
            <button
              onClick={reset}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FiRefreshCw className="h-4 w-4" />
              Record again
            </button>
          )}
        </div>
      </Card>

      {/* Result */}
      {isDone && result && (
        <Card>
          <CardHeader
            title="Voice Recognised"
            action={
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${intentCfg?.color}`}>
                {intentCfg?.label}
              </span>
            }
          />

          {/* Transcript */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
            <p className="text-xs text-gray-400 mb-1">Transcript</p>
            <p className="text-sm text-gray-800 font-medium">
              {result.transcript || '(empty)'}
            </p>
          </div>

          {/* Confidence */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${Math.min(result.confidence * 100, 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 shrink-0">
              {(result.confidence * 100).toFixed(0)}% confidence
            </span>
          </div>

          {/* Structured data */}
          {Object.keys(result.structured_data).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Extracted Data</p>
              <dl className="grid grid-cols-2 gap-2">
                {Object.entries(result.structured_data).map(([k, v]) => (
                  <div key={k} className="bg-indigo-50 rounded-xl px-3 py-2">
                    <dt className="text-xs text-indigo-400 capitalize">{k.replace(/_/g, ' ')}</dt>
                    <dd className="text-sm font-semibold text-indigo-800 mt-0.5">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {result.intent === 'UNKNOWN' && (
            <div className="mt-3 rounded-xl bg-yellow-50 border border-yellow-100 px-4 py-3 text-xs text-yellow-700">
              Intent not recognised. Please try speaking more clearly or use keywords like
              "வருகை" (attendance), "எடை" (weight), "பரிந்துரை" (referral).
            </div>
          )}
        </Card>
      )}

      {/* Usage guide */}
      <Card>
        <CardHeader title="Voice Commands Guide" subtitle="Tamil & English supported" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            { intent: 'Attendance', tamil: '"வருகை உண்டு" / "வரவில்லை"', english: '"present" / "absent"' },
            { intent: 'Growth',     tamil: '"எடை 12 கிலோ" / "உயரம் 87"', english: '"weight 12 kg" / "height 87 cm"' },
            { intent: 'MUAC',       tamil: '"muac 13.5"',                  english: '"muac 13.5 cm"' },
            { intent: 'Referral',   tamil: '"மருத்துவமனை பரிந்துரை"',     english: '"hospital referral"' },
          ].map(({ intent, tamil, english }) => (
            <div key={intent} className="border border-gray-100 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-700 mb-1">{intent}</p>
              <p className="text-xs text-indigo-600">{tamil}</p>
              <p className="text-xs text-gray-400 mt-0.5">{english}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
