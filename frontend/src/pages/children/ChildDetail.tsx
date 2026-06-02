import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiAlertTriangle, FiActivity, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import { useChild } from '../../hooks/useChildren';
import { useLatestRisk } from '../../hooks/useRisk';
import { useChildReferrals, useTransitionReferral } from '../../hooks/useReferrals';
import { useAttendanceSummary } from '../../hooks/useAttendance';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Card, CardHeader } from '../../components/ui/Card';
import { PageSpinner, Spinner } from '../../components/ui/Spinner';
import type { ReferralRead, ReferralStatus } from '../../lib/types';

function ageLabel(dob: string): string {
  const months = Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  if (months < 12) return `${months} months`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m > 0 ? `${y}y ${m}m` : `${y} years`;
}

function ReferralCard({ referral }: { referral: ReferralRead }) {
  const { mutateAsync: transition, isPending } = useTransitionReferral();
  const [selected, setSelected] = useState('');

  const handleTransition = async () => {
    if (!selected) return;
    await transition({ referralId: referral.id, target_state: selected });
    setSelected('');
  };

  return (
    <div className="border border-gray-100 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-900">{referral.referral_type}</p>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{referral.reason}</p>
        </div>
        <StatusBadge status={referral.status as ReferralStatus} />
      </div>

      {referral.escalated && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
          <FiAlertTriangle className="h-3.5 w-3.5" />
          Escalated
        </div>
      )}

      {referral.allowed_transitions.length > 0 && (
        <div className="flex items-center gap-2">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Move to…</option>
            {referral.allowed_transitions.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <button
            onClick={handleTransition}
            disabled={!selected || isPending}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isPending && <Spinner size="sm" className="text-white" />}
            Update
          </button>
        </div>
      )}
    </div>
  );
}

export const ChildDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: child, isLoading: childLoading } = useChild(id!);
  const { data: risk } = useLatestRisk(id!);
  const { data: referrals } = useChildReferrals(id!);
  const { data: attendance } = useAttendanceSummary(id!);

  if (childLoading) return <PageSpinner />;
  if (!child) return (
    <div className="text-center py-16 text-gray-500">Child not found.</div>
  );

  const activeReferrals = referrals?.items.filter((r) => r.status !== 'CLOSED') ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label="Go back"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {child.first_name} {child.last_name}
            </h2>
            {risk && <RiskBadge level={risk.risk_level as 'GREEN' | 'YELLOW' | 'RED'} score={risk.total_score} />}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {ageLabel(child.date_of_birth)} · {child.gender}
            {child.guardian_name && ` · Guardian: ${child.guardian_name}`}
          </p>
        </div>
        <button
          onClick={() => navigate(`/children/${id}/passport`)}
          className="shrink-0 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-colors"
        >
          View Passport
        </button>      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Attendance Rate',
            value: attendance ? `${attendance.attendance_rate.toFixed(0)}%` : '—',
            icon: FiCalendar,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'Risk Score',
            value: risk ? risk.total_score.toFixed(0) : '—',
            icon: FiAlertTriangle,
            color: risk?.risk_level === 'RED' ? 'text-red-600' : risk?.risk_level === 'YELLOW' ? 'text-yellow-600' : 'text-green-600',
            bg: risk?.risk_level === 'RED' ? 'bg-red-50' : risk?.risk_level === 'YELLOW' ? 'bg-yellow-50' : 'bg-green-50',
          },
          {
            label: 'Active Referrals',
            value: String(activeReferrals.length),
            icon: FiActivity,
            color: activeReferrals.length > 0 ? 'text-orange-600' : 'text-gray-600',
            bg: activeReferrals.length > 0 ? 'bg-orange-50' : 'bg-gray-50',
          },
          {
            label: 'Sessions Attended',
            value: attendance ? `${attendance.attended}/${attendance.total_sessions}` : '—',
            icon: FiTrendingUp,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Explanation */}
        {risk && (
          <Card>
            <CardHeader title="Risk Breakdown" subtitle="Explainable score — no black box" />
            <div className="space-y-3">
              {[
                { label: 'Attendance', score: risk.attendance_score, weight: 20 },
                { label: 'Nutrition', score: risk.nutrition_score, weight: 25 },
                { label: 'Development', score: risk.development_score, weight: 25 },
                { label: 'Caregiver', score: risk.caregiver_score, weight: 15 },
                { label: 'Migration', score: risk.migration_score, weight: 15 },
              ].map(({ label, score, weight }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span className="font-medium">{label}</span>
                    <span>{score.toFixed(0)}/100 · {weight}% weight</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        score >= 70 ? 'bg-red-500' : score >= 40 ? 'bg-yellow-400' : 'bg-green-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {risk.contributing_factors.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-700 mb-2">Contributing Factors</p>
                <div className="flex flex-wrap gap-1.5">
                  {risk.contributing_factors.map((f) => (
                    <span key={f} className="px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-700 border border-red-100">
                      {f.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Referrals */}
        <Card>
          <CardHeader
            title="Referrals"
            subtitle={`${activeReferrals.length} active`}
            action={
              <button
                onClick={() => navigate(`/children/${id}/referrals/new`)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                + New
              </button>
            }
          />
          {activeReferrals.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No active referrals.</p>
          ) : (
            <div className="space-y-3">
              {activeReferrals.map((r) => (
                <ReferralCard key={r.id} referral={r} />
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Child info */}
      <Card>
        <CardHeader title="Child Information" />
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          {[
            { label: 'Full Name', value: `${child.first_name} ${child.last_name}` },
            { label: 'Date of Birth', value: child.date_of_birth },
            { label: 'Gender', value: child.gender },
            { label: 'Aadhaar', value: child.aadhaar_number ?? '—' },
            { label: 'Mother', value: child.mother_name ?? '—' },
            { label: 'Father', value: child.father_name ?? '—' },
            { label: 'Guardian', value: child.guardian_name ?? '—' },
            { label: 'Phone', value: child.guardian_phone ?? '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs text-gray-500">{label}</dt>
              <dd className="font-medium text-gray-900 mt-0.5">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
};
