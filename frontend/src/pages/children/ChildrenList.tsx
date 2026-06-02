import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiChevronRight } from 'react-icons/fi';
import { useChildren } from '../../hooks/useChildren';
import { PageSpinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import type { ChildRead } from '../../lib/types';

function ageInMonths(dob: string): number {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
}

function ChildRow({ child }: { child: ChildRead }) {
  const navigate = useNavigate();
  const age = ageInMonths(child.date_of_birth);
  const initials = `${child.first_name[0]}${child.last_name[0]}`.toUpperCase();

  return (
    <li
      onClick={() => navigate(`/children/${child.id}`)}
      className="flex items-center justify-between px-6 py-4 hover:bg-indigo-50/40 cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
          <span className="text-indigo-700 font-semibold text-sm">{initials}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {child.first_name} {child.last_name}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {age} months · {child.gender}
            {child.guardian_phone && ` · ${child.guardian_phone}`}
          </p>
        </div>
      </div>
      <FiChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Children</h2>
          <p className="text-sm text-gray-500 mt-1">
            {children.length} registered · {filtered.length} shown
          </p>
        </div>
        <button
          onClick={() => navigate('/children/register')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <FiPlus className="h-4 w-4" />
          Register Child
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search bar */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or Aadhaar…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <PageSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={search ? 'No children match your search' : 'No children registered yet'}
            description={search ? 'Try a different name or Aadhaar number.' : 'Register the first child to get started.'}
            action={
              !search ? (
                <button
                  onClick={() => navigate('/children/register')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  <FiPlus className="h-4 w-4" />
                  Register Child
                </button>
              ) : undefined
            }
          />
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((child) => (
              <ChildRow key={child.id} child={child} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
