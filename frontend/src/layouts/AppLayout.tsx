import React from 'react';
import { Navigate, NavLink, Outlet } from 'react-router-dom';
import {
  FiActivity,
  FiBarChart2,
  FiBookOpen,
  FiCalendar,
  FiHome,
  FiLogOut,
  FiMessageCircle,
  FiMic,
  FiPieChart,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from 'react-icons/fi';
import { useAuthStore } from '../store/auth';
import { SyncIndicator } from '../components/ui/SyncIndicator';

const NAV = [
  { to: '/',            label: 'Dashboard',   icon: FiHome,          end: true },
  { to: '/children',    label: 'Children',    icon: FiUsers,         end: false },
  { to: '/attendance',  label: 'Attendance',  icon: FiCalendar,      end: false },
  { to: '/growth',      label: 'Growth',      icon: FiTrendingUp,    end: false },
  { to: '/development', label: 'Development', icon: FiZap,           end: false },
  { to: '/referrals',   label: 'Referrals',   icon: FiActivity,      end: false },
  { to: '/risk',        label: 'Risk Engine', icon: FiBarChart2,     end: false },
  { to: '/learning',    label: 'Learning',    icon: FiBookOpen,      end: false },
  { to: '/engagement',  label: 'WhatsApp',    icon: FiMessageCircle, end: false },
  { to: '/voice',       label: 'Voice Input', icon: FiMic,           end: false },
  { to: '/supervisor',  label: 'Supervisor',  icon: FiPieChart,      end: false },
];

export const AppLayout = () => {
  const { isAuthenticated, user, logout } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  const displayName = user?.full_name ?? 'Worker';
  const roleName = user?.role?.name ?? '';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10 shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="text-base font-bold text-gray-900 tracking-tight">Nila Arumbu</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-5 px-3 space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shrink-0">
              <span className="text-white font-semibold text-xs">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
              <p className="text-xs text-gray-500 truncate">{roleName}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
          >
            <FiLogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-base font-semibold text-gray-700">Decision Support Platform</h1>
          <SyncIndicator />
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
