import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiAlertTriangle, FiActivity, FiTrendingUp, FiChevronRight } from 'react-icons/fi';
import { useAuthStore } from '../store/auth';
import { useChildren } from '../hooks/useChildren';
import { useReferralsByStatus } from '../hooks/useReferrals';
import { RiskBadge } from '../components/ui/RiskBadge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PageSpinner } from '../components/ui/Spinner';
import type { ReferralStatus } from '../lib/types';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  onClick,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: children = [], isLoading: childrenLoading } = useChildren();
  const { data: pendingReferrals } = useReferralsByStatus('APPOINTMENT_PENDING');
  const { data: followupReferrals } = useReferralsByStatus('FOLLOWUP');

  const firstName = user?.full_name?.split(' ')[0] ?? 'Worker';
  const totalPending = (pendingReferrals?.total ?? 0) + (followupReferrals?.total ?? 0);
  const urgentReferrals = [
    ...(pendingReferrals?.items ?? []),
    ...(followupReferrals?.items ?? []),
  ]
    .filter((r) => r.escalated)
    .slice(0, 5);

  if (childrenLoading) return <PageSpinner />;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Welcome, {firstName}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Here's what needs your attention today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Children Registered"
          value={children.length}
          icon={FiUsers}
          color="text-indigo-600"
          bg="bg-indigo-50"
          onClick={() => navigate('/children')}
        />
        <StatCard
          label="Pending Referrals"
          value={totalPending}
          icon={FiActivity}
          color={totalPending > 0 ? 'text-orange-600' : 'text-gray-500'}
          bg={totalPending > 0 ? 'bg-orange-50' : 'bg-gray-50'}
          onClick={() => navigate('/referrals')}
        />
        <StatCard
          label="Escalated Cases"
          value={urgentReferrals.length}
          icon={FiAlertTriangle}
          color={urgentReferrals.length > 0 ? 'text-red-600' : 'text-gray-500'}
          bg={urgentReferrals.length > 0 ? 'bg-red-50' : 'bg-gray-50'}
        />
        <StatCard
          label="Follow-Ups Due"
          value={followupReferrals?.total ?? 0}
          icon={FiTrendingUp}
          color="text-purple-600"
          bg="bg-purple-50"
          onClick={() => navigate('/referrals')}
        />
      </div>

      {/* Urgent action items */}
      {urgentReferrals.length > 0 && (
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-red-100 bg-red-50/50 flex items-center gap-2">
            <FiAlertTriangle className="h-4 w-4 text-red-600" />
            <h3 className="text-sm font-semibold text-red-800">Escalated — Immediate Action Required</h3>
          </div>
          <ul className="divide-y divide-gray-100">
            {urgentReferrals.map((r) => (
              <li
                key={r.id}
                onClick={() => navigate(`/children/${r.child_id}`)}
                className="flex items-center justify-between px-6 py-4 hover:bg-red-50/30 cursor-pointer transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">{r.referral_type}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{r.reason}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <StatusBadge status={r.status as ReferralStatus} />
                  <FiChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent children */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Recently Registered</h3>
          <button
            onClick={() => navigate('/children')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View all
          </button>
        </div>
        {children.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-500">
            No children registered yet.{' '}
            <button
              onClick={() => navigate('/children/register')}
              className="text-indigo-600 font-semibold hover:underline"
            >
              Register the first child.
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {children.slice(0, 5).map((child) => {
              const initials = `${child.first_name[0]}${child.last_name[0]}`.toUpperCase();
              return (
                <li
                  key={child.id}
                  onClick={() => navigate(`/children/${child.id}`)}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <span className="text-indigo-700 font-semibold text-xs">{initials}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {child.first_name} {child.last_name}
                    </p>
                  </div>
                  <FiChevronRight className="h-4 w-4 text-gray-400" />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
