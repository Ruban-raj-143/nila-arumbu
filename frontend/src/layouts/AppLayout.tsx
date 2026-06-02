import React from 'react';
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  FiActivity, FiBarChart2, FiBookOpen, FiCalendar,
  FiHome, FiLogOut, FiMessageCircle, FiMic,
  FiPieChart, FiTrendingUp, FiUsers, FiZap,
} from 'react-icons/fi';
import { useAuthStore } from '../store/auth';
import { SyncIndicator } from '../components/ui/SyncIndicator';

const NAV = [
  { to: '/',            label: 'Dashboard',   icon: FiHome,          end: true,  group: 'main' },
  { to: '/children',    label: 'Children',    icon: FiUsers,         end: false, group: 'main' },
  { to: '/attendance',  label: 'Attendance',  icon: FiCalendar,      end: false, group: 'daily' },
  { to: '/growth',      label: 'Growth',      icon: FiTrendingUp,    end: false, group: 'daily' },
  { to: '/development', label: 'Development', icon: FiZap,           end: false, group: 'daily' },
  { to: '/referrals',   label: 'Referrals',   icon: FiActivity,      end: false, group: 'care' },
  { to: '/risk',        label: 'Risk Engine', icon: FiBarChart2,     end: false, group: 'care' },
  { to: '/learning',    label: 'Learning',    icon: FiBookOpen,      end: false, group: 'care' },
  { to: '/engagement',  label: 'WhatsApp',    icon: FiMessageCircle, end: false, group: 'engage' },
  { to: '/voice',       label: 'Voice Input', icon: FiMic,           end: false, group: 'engage' },
  { to: '/supervisor',  label: 'Supervisor',  icon: FiPieChart,      end: false, group: 'admin' },
];

const GROUP_LABELS: Record<string, string> = {
  main:   'Overview',
  daily:  'Daily Work',
  care:   'Care Management',
  engage: 'Engagement',
  admin:  'Reports',
};

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/children': 'Children',
  '/attendance': 'Attendance',
  '/growth': 'Growth Monitoring',
  '/development': 'Development Assessment',
  '/referrals': 'Referrals',
  '/risk': 'Risk Engine',
  '/learning': 'Learning Planner',
  '/engagement': 'Parent Engagement',
  '/voice': 'Tamil Voice Input',
  '/supervisor': 'Supervisor Dashboard',
};

export const AppLayout = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const displayName = user?.full_name ?? 'Worker';
  const roleName = user?.role?.name?.replace(/_/g, ' ') ?? '';
  const initials = displayName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  const pageTitle = Object.entries(PAGE_TITLES).find(([path]) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  )?.[1] ?? 'Nila Arumbu';

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  // Group nav items
  const groups = ['main', 'daily', 'care', 'engage', 'admin'];

  return (
    <div className="min-h-screen flex" style={{ background: '#f1f5f9' }}>
      {/* Sidebar */}
      <aside className="w-64 flex flex-col shrink-0 sticky top-0 h-screen"
        style={{ background: 'white', borderRight: '1px solid #e2e8f0' }}>

        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Nila Arumbu" className="w-9 h-9 rounded-xl shadow-sm" />
            <div>
              <p className="text-sm font-bold text-slate-900 leading-none">Nila Arumbu</p>
              <p className="text-xs text-slate-400 mt-0.5">Decision Support</p>
            </div>
          </div>
        </div>

        {/* Nav with groups */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {groups.map((group) => {
            const items = NAV.filter((n) => n.group === group);
            if (!items.length) return null;
            return (
              <div key={group}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
                  {GROUP_LABELS[group]}
                </p>
                <div className="space-y-0.5">
                  {items.map(({ to, label, icon: Icon, end }) => (
                    <NavLink key={to} to={to} end={end} className={linkClass}>
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)' }}>
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
              <p className="text-xs text-slate-400 truncate capitalize">{roleName.toLowerCase()}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors border border-slate-200 hover:border-red-200"
          >
            <FiLogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 glass border-b border-slate-200/80 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-slate-700">{pageTitle}</h1>
          </div>
          <SyncIndicator />
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
