import React from 'react';
import type { RiskLevel } from '../../lib/types';

const CONFIG: Record<RiskLevel, { label: string; classes: string; dot: string }> = {
  GREEN:  { label: 'Low Risk',    classes: 'bg-green-100 text-green-800 border-green-200',   dot: 'bg-green-500' },
  YELLOW: { label: 'Medium Risk', classes: 'bg-yellow-100 text-yellow-800 border-yellow-200', dot: 'bg-yellow-500' },
  RED:    { label: 'High Risk',   classes: 'bg-red-100 text-red-800 border-red-200',          dot: 'bg-red-500' },
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
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${px} ${cfg.classes}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}{score !== undefined ? ` · ${score.toFixed(0)}` : ''}
    </span>
  );
}
