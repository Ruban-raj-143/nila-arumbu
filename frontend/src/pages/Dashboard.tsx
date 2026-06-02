import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers, FiAlertTriangle, FiActivity, FiArrowRight,
  FiChevronRight, FiTrendingUp, FiCalendar, FiBookOpen,
} from 'react-icons/fi';
import { useAuthStore } from '../store/auth';
import { useChildren } from '../hooks/useChildren';
import { useReferralsByStatus } from '../hooks/useReferrals';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PageSpinner } from '../components/ui/Spinner';
import type { ReferralStatus } from '../lib/types';

const QUICK_ACTIONS = [
  { label: 'Register Child',  to: '/children/register', icon: FiUsers,      color: 'from-indigo-500 to-violet-500' },
  { label: 'Attendance',      to: '/attendance',         icon: FiCalendar,   color: 'from-blue-500 to-cyan-500' },
  { label: 'Growth Record',   to: '/growth',             icon: FiTrendingUp, color: 'from-emerald-500 to-teal-500' },
  { label: 'Learning Plan',   to: '/learning',           icon: FiBookOpen,   color: 'from-orange-500 to-amber-500' },
];

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { data: children = [], isLoading, isFetching } = useChildren();
  const { data: pendingReferrals } = useReferralsByStatus('APPOINTMENT_PENDING');
  const { data: followupReferrals } = useReferralsByStatus('FOLLOWUP');

  const firstName = user?.full_name?.split(' ')[0] ?? 'Worker';
  const totalPending = (pendingReferrals?.total ?? 0) + (followupReferrals?.total ?? 0);
  const urgentReferrals = [
    ...(pendingReferrals?.items ?? []),
    ...(followupReferrals?.items ?? []),
  ].filter((r) => r.escalated).slice(0, 3);

  if (isLoading || isFetching) return <PageSpinner />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="space-y-8 animate-fade-in-up">

      {/* Hero greeting */}
      <div className="rounded-3xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative px-8 py-8 flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-sm font-medium mb-1">{greeting} 👋</p>
            <h2 className="text-white text-2xl font-bold">{firstName}</h2>
            <p className="text-indigo-200 text-sm mt-2 max-w-sm">
              Every child seen. Every risk identified. Every referral closed.
            </p>
          </div>
          <div className="hidden sm:grid grid-cols-2 gap-3">
            {[
              { label: 'Children', value: children.length, icon: '👶' },
              { label: 'Pending',  value: totalPending,    icon: '📋' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-4 text-center min-w-[100px]">
                <p className="text-2xl mb-1">{icon}</p>
                <p className="text-white text-2xl font-bold">{value}</p>
                <p className="text-indigo-200 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Children',        value: children.length,          icon: '👶', bg: '#eef2ff', color: '#6366f1', to: '/children' },
          { label: 'Pending Refs',    value: totalPending,             icon: '📋', bg: '#fff7ed', color: '#f97316', to: '/referrals' },
          { label: 'Escalated',       value: urgentReferrals.length,   icon: '🚨', bg: '#fef2f2', color: '#ef4444', to: '/referrals' },
          { label: 'Follow-Ups',      value: followupReferrals?.total ?? 0, icon: '🔄', bg: '#f5f3ff', color: '#8b5cf6', to: '/referrals' },
        ].map(({ label, value, icon, bg, color, to }) => (
          <div key={label}
            onClick={() => navigate(to)}
            className="bg-white rounded-2xl p-5 cursor-pointer card-hover border border-slate-100"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3" style={{ background: bg }}>
              {icon}
            </div>
            <p className="text-3xl font-bold" style={{ color }}>{value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ label, to, icon: Icon, color }) => (
            <button key={to} onClick={() => navigate(to)}
              className="flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-slate-100 card-hover text-center"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent cases */}
        {urgentReferrals.length > 0 && (
          <div className="bg-white rounded-2xl border border-red-100 overflow-hidden"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="px-5 py-4 flex items-center gap-2 border-b border-red-50"
              style={{ background: 'linear-gradient(135deg, #fef2f2, #fff5f5)' }}>
              <span className="text-base">🚨</span>
              <h3 className="text-sm font-semibold text-red-800">Escalated Cases</h3>
            </div>
            <ul className="divide-y divide-slate-50">
              {urgentReferrals.map((r) => (
                <li key={r.id} onClick={() => navigate(`/children/${r.child_id}`)}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-red-50/30 cursor-pointer transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{r.referral_type}</p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{r.reason}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <StatusBadge status={r.status as ReferralStatus} />
                    <FiChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recent children */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Recently Registered</h3>
            <button onClick={() => navigate('/children')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <FiArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          {children.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-3xl mb-2">👶</p>
              <p className="text-sm text-slate-500">No children yet</p>
              <button onClick={() => navigate('/children/register')}
                className="mt-3 text-xs font-semibold text-indigo-600 hover:underline">
                Register first child →
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {children.slice(0, 5).map((child) => {
                const initials = `${child.first_name[0]}${child.last_name[0]}`.toUpperCase();
                return (
                  <li key={child.id} onClick={() => navigate(`/children/${child.id}`)}
                    className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0"
                        style={{ background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)' }}>
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{child.first_name} {child.last_name}</p>
                        <p className="text-xs text-slate-400">{child.gender} · {child.date_of_birth}</p>
                      </div>
                    </div>
                    <FiChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
