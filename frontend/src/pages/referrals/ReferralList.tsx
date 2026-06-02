import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiActivity, FiChevronRight, FiAlertTriangle } from 'react-icons/fi';
import { useReferralsByStatus } from '../../hooks/useReferrals';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { PageSpinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import type { ReferralRead, ReferralStatus } from '../../lib/types';

const STATUSES: ReferralStatus[] = [
  'IDENTIFIED',
  'REFERRED',
  'APPOINTMENT_PENDING',
  'VISITED',
  'FOLLOWUP',
];

const STATUS_LABELS: Record<ReferralStatus, string> = {
  IDENTIFIED: 'Identified',
  REFERRED: 'Referred',
  APPOINTMENT_PENDING: 'Appt. Pending',
  VISITED: 'Visited',
  FOLLOWUP: 'Follow-Up',
  CLOSED: 'Closed',
};

function ReferralRow({ referral }: { referral: ReferralRead }) {
  const navigate = useNavigate();
  return (
    <li
      onClick={() => navigate(`/children/${referral.child_id}`)}
      className="flex items-center justify-between px-6 py-4 hover:bg-indigo-50/40 cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
          <FiActivity className="h-4 w-4 text-orange-600" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900">{referral.referral_type}</p>
            {referral.escalated && (
              <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                <FiAlertTriangle className="h-3 w-3" /> Escalated
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{referral.reason}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(referral.created_at).toLocaleDateString('en-IN')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        <StatusBadge status={referral.status as ReferralStatus} />
        <FiChevronRight className="h-4 w-4 text-gray-400" />
      </div>
    </li>
  );
}

export const ReferralList = () => {
  const [activeStatus, setActiveStatus] = useState<ReferralStatus>('APPOINTMENT_PENDING');
  const { data, isLoading } = useReferralsByStatus(activeStatus);
  const referrals = data?.items ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Referrals</h2>
        <p className="text-sm text-gray-500 mt-1">
          Track every referral from identification to closure.
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setActiveStatus(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              activeStatus === s
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <PageSpinner />
        ) : referrals.length === 0 ? (
          <EmptyState
            icon={<FiActivity className="h-6 w-6" />}
            title={`No referrals with status "${STATUS_LABELS[activeStatus]}"`}
            description="All referrals in this stage have been resolved."
          />
        ) : (
          <ul className="divide-y divide-gray-100">
            {referrals.map((r) => (
              <ReferralRow key={r.id} referral={r} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
