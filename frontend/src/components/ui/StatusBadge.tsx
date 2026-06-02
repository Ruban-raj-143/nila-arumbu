import React from 'react';
import type { ReferralStatus } from '../../lib/types';

const CONFIG: Record<ReferralStatus, { label: string; bg: string; text: string }> = {
  IDENTIFIED:          { label: 'Identified',    bg: '#f1f5f9', text: '#64748b' },
  REFERRED:            { label: 'Referred',      bg: '#eff6ff', text: '#3b82f6' },
  APPOINTMENT_PENDING: { label: 'Appt. Pending', bg: '#fffbeb', text: '#d97706' },
  VISITED:             { label: 'Visited',       bg: '#f5f3ff', text: '#7c3aed' },
  FOLLOWUP:            { label: 'Follow-Up',     bg: '#fff7ed', text: '#ea580c' },
  CLOSED:              { label: 'Closed',        bg: '#f0fdf4', text: '#16a34a' },
};

export function StatusBadge({ status }: { status: ReferralStatus }) {
  const cfg = CONFIG[status] ?? CONFIG.IDENTIFIED;
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  );
}
