import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft, FiCalendar, FiTrendingUp, FiActivity,
  FiMapPin, FiZap, FiBookOpen,
} from 'react-icons/fi';
import { useChild } from '../../hooks/useChildren';
import { useLatestRisk, useRiskHistory } from '../../hooks/useRisk';
import { useGrowthRecords } from '../../hooks/useGrowth';
import { useAttendanceSummary } from '../../hooks/useAttendance';
import { useDevelopmentSummary } from '../../hooks/useDevelopment';
import { useChildReferrals } from '../../hooks/useReferrals';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Card, CardHeader } from '../../components/ui/Card';
import { PageSpinner } from '../../components/ui/Spinner';
import type { ReferralStatus, RiskLevel } from '../../lib/types';

function ageLabel(dob: string): string {
  const months = Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  const y = Math.floor(months / 12);
  const m = months % 12;
  return y > 0 ? `${y}y ${m}m` : `${months}m`;
}

export const ChildPassport = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: child, isLoading } = useChild(id!);
  const { data: risk } = useLatestRisk(id!);
  const { data: riskHistory } = useRiskHistory(id!);
  const { data: growthRecords = [] } = useGrowthRecords(id!);
  const { data: attendance } = useAttendanceSummary(id!);
  const { data: devSummary } = useDevelopmentSummary(id!);
  const { data: referrals } = useChildReferrals(id!);

  if (isLoading || !child) return <PageSpinner />;

  const activeReferrals = referrals?.items.filter((r) => r.status !== 'CLOSED') ?? [];
  const closedReferrals = referrals?.items.filter((r) => r.status === 'CLOSED') ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-gray-900">
              {child.first_name} {child.last_name}
            </h2>
            {risk && <RiskBadge level={risk.risk_level as RiskLevel} score={risk.total_score} />}
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-medium">
              Child Passport
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {ageLabel(child.date_of_birth)} · {child.gender} · DOB: {child.date_of_birth}
          </p>
        </div>
      </div>

      {/* Passport summary strip */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Attendance', value: attendance ? `${attendance.attendance_rate.toFixed(0)}%` : '—', icon: FiCalendar },
            { label: 'Risk Score', value: risk ? `${risk.total_score.toFixed(0)}/100` : '—', icon: FiActivity },
            { label: 'Dev. Status', value: devSummary?.latest_status?.replace(/_/g, ' ') ?? '—', icon: FiZap },
            { label: 'Open Referrals', value: String(activeReferrals.length), icon: FiTrendingUp },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <Icon className="h-5 w-5 mx-auto mb-1 opacity-80" />
              <p className="text-xl font-bold">{value}</p>
              <p className="text-xs opacity-70 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth history */}
        <Card>
          <CardHeader title="Growth History" subtitle={`${growthRecords.length} records`} />
          {growthRecords.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No growth records yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-100">
                    <th className="text-left pb-2">Date</th>
                    <th className="text-right pb-2">Weight</th>
                    <th className="text-right pb-2">Height</th>
                    <th className="text-right pb-2">MUAC</th>
                    <th className="text-right pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {growthRecords.slice(0, 6).map((r) => (
                    <tr key={r.id}>
                      <td className="py-2 text-gray-600">{r.recorded_date}</td>
                      <td className="py-2 text-right">{r.weight_kg ? `${r.weight_kg}kg` : '—'}</td>
                      <td className="py-2 text-right">{r.height_cm ? `${r.height_cm}cm` : '—'}</td>
                      <td className="py-2 text-right">{r.muac_cm ? `${r.muac_cm}cm` : '—'}</td>
                      <td className="py-2 text-right">
                        <span className={`text-xs font-medium ${
                          r.nutrition_status === 'SAM' || r.nutrition_status === 'SEVERE_UNDERWEIGHT'
                            ? 'text-red-600' : r.nutrition_status === 'MAM' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {r.nutrition_status ?? 'NORMAL'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Risk score history */}
        <Card>
          <CardHeader title="Risk Score History" />
          {!riskHistory?.items.length ? (
            <p className="text-sm text-gray-400 text-center py-6">No risk assessments yet.</p>
          ) : (
            <div className="space-y-3">
              {riskHistory.items.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between">
                  <div>
                    <RiskBadge level={s.risk_level as RiskLevel} score={s.total_score} size="sm" />
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(s.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.risk_level === 'RED' ? 'bg-red-500' : s.risk_level === 'YELLOW' ? 'bg-yellow-400' : 'bg-green-500'}`}
                      style={{ width: `${s.total_score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Referral timeline */}
        <Card>
          <CardHeader
            title="Referral History"
            subtitle={`${activeReferrals.length} active · ${closedReferrals.length} closed`}
          />
          {!referrals?.items.length ? (
            <p className="text-sm text-gray-400 text-center py-6">No referrals.</p>
          ) : (
            <div className="space-y-3">
              {referrals.items.map((r) => (
                <div key={r.id} className="flex items-start justify-between gap-3 border-b border-gray-50 pb-3 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{r.referral_type}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{r.reason}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(r.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <StatusBadge status={r.status as ReferralStatus} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Child info */}
        <Card>
          <CardHeader title="Identity" />
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Aadhaar', value: child.aadhaar_number ?? '—' },
              { label: 'Mother', value: child.mother_name ?? '—' },
              { label: 'Father', value: child.father_name ?? '—' },
              { label: 'Guardian', value: child.guardian_name ?? '—' },
              { label: 'Phone', value: child.guardian_phone ?? '—' },
              { label: 'Centre', value: child.centre_id ? 'Assigned' : 'Unassigned' },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs text-gray-400">{label}</dt>
                <dd className="font-medium text-gray-900 mt-0.5 truncate">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </div>
  );
};
