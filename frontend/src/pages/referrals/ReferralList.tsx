import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiActivity, FiChevronRight, FiAlertTriangle } from 'react-icons/fi';
import { useReferralsByStatus } from '../../hooks/useReferrals';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PageSpinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import type { ReferralRead, ReferralStatus } from '../../lib/types';

const STATUSES: { key: ReferralStatus; label: string; emoji: string }[] = [
  { key: 'IDENTIFIED',          label: 'Identified',    emoji: '🔍' },
  { key: 'REFERRED',            label: 'Referred',      emoji: '📤' },
  { key: 'APPOINTMENT_PENDING', label: 'Appt. Pending', emoji: '📅' },
  { key: 'VISITED',             label: 'Visited',       emoji: '🏥' },
  { key: 'FOLLOWUP',            label: 'Follow-Up',     emoji: '🔄' },
];

function ReferralRow({ referral }: { referral: ReferralRead }) {
  const navigate = useNavigate();
  return (
    <li
      onClick={() => navigate(`/children/${referral.child_id}`)}
      className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 cursor-pointer transition-colors group"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shrink-0 shadow-sm">
          <FiActivity className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">{referral.referral_type}</p>
            {referral.escalated && (
              <span className="inline-flex items-center gap-1 text-xs text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-full">
                <FiAlertTriangle className="h-3 w-3" /> Escalated
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{referral.reason}</p>
          <p className="text-xs text-slate-300 mt-0.5">
            {new Date(referral.created_at).toLocaleDateString('en-IN')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        <StatusBadge status={referral.status as ReferralStatus} />
        <FiChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
      </div>
    </li>
  );
}

export const ReferralList = () => {
  const [activeStatus, setActiveStatus] = useState<ReferralStatus>('APPOINTMENT_PENDING');
  const { data, isLoading } = useReferralsByStatus(activeStatus);
  const referrals = data?.items ?? [];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Referrals</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Track every referral from identification to closure.
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map(({ key, label, emoji }) => (
          <button
            key={key}
            onClick={() => setActiveStatus(key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeStatus === key
                ? 'text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
            }`}
            style={activeStatus === key
              ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }
              : {}}
          >
            {emoji} {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {isLoading ? (
          <PageSpinner />
        ) : referrals.length === 0 ? (
          <EmptyState
            icon={<FiActivity className="h-6 w-6" />}
            title={`No ${STATUSES.find(s => s.key === activeStatus)?.label} referrals`}
            description="All referrals in this stage have been resolved."
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {referrals.map((r) => <ReferralRow key={r.id} referral={r} />)}
          </ul>
        )}
      </div>
    </div>
  );
};
