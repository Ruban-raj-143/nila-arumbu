import React from 'react';
import type { ReferralStatus } from '../../lib/types';

const CONFIG: Record<ReferralStatus, { label: string; classes: string }> = {
  IDENTIFIED:          { label: 'Identified',          classes: 'bg-gray-100 text-gray-700 border-gray-200' },
  REFERRED:            { label: 'Referred',             classes: 'bg-blue-100 text-blue-800 border-blue-200' },
  APPOINTMENT_PENDING: { label: 'Appt. Pending',        classes: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  VISITED:             { label: 'Visited',              classes: 'bg-purple-100 text-purple-800 border-purple-200' },
  FOLLOWUP:            { label: 'Follow-Up',            classes: 'bg-orange-100 text-orange-800 border-orange-200' },
  CLOSED:              { label: 'Closed',               classes: 'bg-green-100 text-green-800 border-green-200' },
};

interface Props {
  status: ReferralStatus;
}

export function StatusBadge({ status }: Props) {
  const cfg = CONFIG[status] ?? CONFIG.IDENTIFIED;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}
