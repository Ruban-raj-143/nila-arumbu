import React from 'react';
import {
  FiAlertTriangle, FiActivity, FiUsers, FiHome, FiTrendingUp, FiClock,
} from 'react-icons/fi';
import {
  usePlatformSummary,
  useCentreRiskSummary,
  useReferralAging,
} from '../../hooks/useAnalytics';
import { PageSpinner } from '../../components/ui/Spinner';
import { Card, CardHeader } from '../../components/ui/Card';

const STATUS_LABELS: Record<string, string> = {
  IDENTIFIED: 'Identified',
  REFERRED: 'Referred',
  APPOINTMENT_PENDING: 'Appt. Pending',
  VISITED: 'Visited',
  FOLLOWUP: 'Follow-Up',
};

function RiskBar({ green, yellow, red, total }: { green: number; yellow: number; red: number; total: number }) {
  if (total === 0) return <div className="h-2 bg-gray-100 rounded-full" />;
  return (
    <div className="h-2 rounded-full overflow-hidden flex">
      <div className="bg-green-500 h-full" style={{ width: `${(green / total) * 100}%` }} />
      <div className="bg-yellow-400 h-full" style={{ width: `${(yellow / total) * 100}%` }} />
      <div className="bg-red-500 h-full" style={{ width: `${(red / total) * 100}%` }} />
    </div>
  );
}

export const SupervisorDashboard = () => {
  const { data: summary, isLoading: summaryLoading } = usePlatformSummary();
  const { data: centres = [] } = useCentreRiskSummary();
  const { data: aging = [] } = useReferralAging();

  if (summaryLoading) return <PageSpinner />;

  const riskDist = summary?.risk_distribution ?? {};
  const totalRisk = Object.values(riskDist).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Supervisor Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">
          Platform-wide overview · as of {summary?.as_of ?? '—'}
        </p>
      </div>

      {/* Platform stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Children',    value: summary?.total_children ?? 0,    icon: FiUsers,        color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Centres',           value: summary?.total_centres ?? 0,     icon: FiHome,         color: 'text-blue-600',   bg: 'bg-blue-50' },
          { label: 'Open Referrals',    value: summary?.open_referrals ?? 0,    icon: FiActivity,     color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Escalated Cases',   value: summary?.escalated_referrals ?? 0, icon: FiAlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Risk distribution + Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Risk Distribution" subtitle={`${totalRisk} children assessed`} />
          <div className="space-y-3">
            {[
              { label: 'Green — Low Risk',    key: 'GREEN',  color: 'bg-green-500' },
              { label: 'Yellow — Medium Risk', key: 'YELLOW', color: 'bg-yellow-400' },
              { label: 'Red — High Risk',      key: 'RED',    color: 'bg-red-500' },
            ].map(({ label, key, color }) => {
              const count = riskDist[key] ?? 0;
              const pct = totalRisk > 0 ? (count / totalRisk) * 100 : 0;
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span className="font-medium">{label}</span>
                    <span>{count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500">Today's Attendance Rate</span>
            <span className={`font-bold ${(summary?.attendance_rate_today ?? 0) >= 75 ? 'text-green-600' : 'text-red-600'}`}>
              {summary?.attendance_rate_today ?? 0}%
            </span>
          </div>
        </Card>

        {/* Referral aging */}
        <Card>
          <CardHeader title="Referral Aging" subtitle="Days stuck in each state" />
          <div className="space-y-2">
            {aging.map((row) => (
              <div key={row.status} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{STATUS_LABELS[row.status] ?? row.status}</p>
                  <p className="text-xs text-gray-500">{row.count} referrals · avg {row.avg_days_in_status}d</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${row.oldest_days > 14 ? 'text-red-600' : row.oldest_days > 7 ? 'text-yellow-600' : 'text-gray-700'}`}>
                    {row.oldest_days}d oldest
                  </p>
                  {row.escalated_count > 0 && (
                    <p className="text-xs text-red-500">{row.escalated_count} escalated</p>
                  )}
                </div>
              </div>
            ))}
            {aging.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No open referrals.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Centre-wise risk */}
      <Card padding={false}>
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Centre-wise Risk Breakdown</h3>
        </div>
        {centres.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">No centres found.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {centres.map((c) => (
              <li key={c.centre_id} className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">{c.centre_name}</p>
                  <p className="text-xs text-gray-500">{c.total_children} children</p>
                </div>
                <RiskBar
                  green={c.green_count}
                  yellow={c.yellow_count}
                  red={c.red_count}
                  total={c.total_children}
                />
                <div className="flex gap-4 mt-1.5 text-xs text-gray-500">
                  <span className="text-green-600">● {c.green_count} low</span>
                  <span className="text-yellow-600">● {c.yellow_count} medium</span>
                  <span className="text-red-600">● {c.red_count} high</span>
                  {c.unassessed_count > 0 && (
                    <span className="text-gray-400">● {c.unassessed_count} unassessed</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};
