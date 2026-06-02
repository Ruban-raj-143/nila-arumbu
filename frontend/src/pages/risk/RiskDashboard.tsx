import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { useChildren } from '../../hooks/useChildren';
import { useLatestRisk } from '../../hooks/useRisk';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { PageSpinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import type { RiskLevel } from '../../lib/types';

function ChildRiskRow({ childId, name }: { childId: string; name: string }) {
  const navigate = useNavigate();
  const { data: risk, isLoading } = useLatestRisk(childId);

  if (isLoading) return null;

  return (
    <li
      onClick={() => navigate(`/children/${childId}`)}
      className="flex items-center justify-between px-6 py-4 hover:bg-indigo-50/40 cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
          <span className="text-indigo-700 font-semibold text-xs">
            {name.split(' ').map((n) => n[0]).join('').toUpperCase()}
          </span>
        </div>
        <p className="text-sm font-semibold text-gray-900">{name}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {risk ? (
          <RiskBadge level={risk.risk_level as RiskLevel} score={risk.total_score} />
        ) : (
          <span className="text-xs text-gray-400">Not assessed</span>
        )}
        <FiChevronRight className="h-4 w-4 text-gray-400" />
      </div>
    </li>
  );
}

export const RiskDashboard = () => {
  const { data: children = [], isLoading } = useChildren();

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Risk Engine</h2>
        <p className="text-sm text-gray-500 mt-1">
          Explainable risk scores — Attendance 20% · Nutrition 25% · Development 25% · Caregiver 15% · Migration 15%
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {children.length === 0 ? (
          <EmptyState title="No children registered" description="Register children to see risk scores." />
        ) : (
          <ul className="divide-y divide-gray-100">
            {children.map((c) => (
              <ChildRiskRow
                key={c.id}
                childId={c.id}
                name={`${c.first_name} ${c.last_name}`}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
