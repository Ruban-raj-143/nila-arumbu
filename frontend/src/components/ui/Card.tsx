import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className = '', padding = true }: Props) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 ${padding ? 'p-6' : ''} ${className}`}
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title, subtitle, action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
