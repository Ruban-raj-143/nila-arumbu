import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiChevronRight, FiUser } from 'react-icons/fi';
import { useChildren } from '../../hooks/useChildren';
import { PageSpinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import type { ChildRead } from '../../lib/types';

function ageLabel(dob: string): string {
  const months = Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  if (months < 12) return `${months}m`;
  return `${Math.floor(months / 12)}y ${months % 12}m`;
}

const GENDER_COLOR: Record<string, string> = {
  MALE:   'from-blue-400 to-indigo-500',
  FEMALE: 'from-pink-400 to-rose-500',
  OTHER:  'from-violet-400 to-purple-500',
};

function ChildRow({ child }: { child: ChildRead }) {
  const navigate = useNavigate();
  const initials = `${child.first_name[0]}${child.last_name[0]}`.toUpperCase();
  const gradient = GENDER_COLOR[child.gender] ?? GENDER_COLOR.OTHER;

  return (
    <li
      onClick={() => navigate(`/children/${child.id}`)}
      className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors group"
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-sm`}>
          <span className="text-white font-semibold text-xs">{initials}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {child.first_name} {child.last_name}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {ageLabel(child.date_of_birth)} · {child.gender}
            {child.guardian_phone ? ` · ${child.guardian_phone}` : ''}
          </p>
        </div>
      </div>
      <FiChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0" />
    </li>
  );
}

export const ChildrenList = () => {
  const navigate = useNavigate();
  const { data: children = [], isLoading } = useChildren();
  const [search, setSearch] = useState('');

  const filtered = children.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.first_name.toLowerCase().includes(q) ||
      c.last_name.toLowerCase().includes(q) ||
      (c.aadhaar_number ?? '').includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Children</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {children.length} registered · {filtered.length} shown
          </p>
        </div>
        <button
          onClick={() => navigate('/children/register')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-sm"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
        >
          <FiPlus className="h-4 w-4" />
          Register Child
        </button>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {/* Search */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or Aadhaar…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <PageSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FiUser className="h-6 w-6" />}
            title={search ? 'No matches found' : 'No children registered yet'}
            description={search ? 'Try a different search term.' : 'Register the first child to get started.'}
            action={
              !search ? (
                <button
                  onClick={() => navigate('/children/register')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  <FiPlus className="h-4 w-4" /> Register Child
                </button>
              ) : undefined
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((child) => <ChildRow key={child.id} child={child} />)}
          </ul>
        )}
      </div>
    </div>
  );
};
