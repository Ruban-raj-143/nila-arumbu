import React from 'react';
import type { RiskLevel } from '../../lib/types';

const CONFIG: Record<RiskLevel, { label: string; bg: string; text: string; dot: string }> = {
  GREEN:  { label: 'Low Risk',    bg: '#f0fdf4', text: '#16a34a', dot: '#22c55e' },
  YELLOW: { label: 'Medium Risk', bg: '#fffbeb', text: '#d97706', dot: '#f59e0b' },
  RED:    { label: 'High Risk',   bg: '#fef2f2', text: '#dc2626', dot: '#ef4444' },
};

interface Props {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md';
}

export function RiskBadge({ level, score, size = 'md' }: Props) {
  const cfg = CONFIG[level] ?? CONFIG.GREEN;
  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${px}`}
      style={{ background: cfg.bg, color: cfg.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}{score !== undefined ? ` · ${score.toFixed(0)}` : ''}
    </span>
  );
}
