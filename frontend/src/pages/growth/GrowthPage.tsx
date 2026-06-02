import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiTrendingUp, FiChevronRight, FiArrowUp, FiArrowDown, FiMinus } from 'react-icons/fi';
import { useChildren } from '../../hooks/useChildren';
import { useGrowthTrend, useRecordGrowth } from '../../hooks/useGrowth';
import { PageSpinner, Spinner } from '../../components/ui/Spinner';
import { Card, CardHeader } from '../../components/ui/Card';
import type { ChildRead } from '../../lib/types';

const schema = z.object({
  child_id: z.string().uuid('Select a child'),
  recorded_date: z.string().min(1, 'Required'),
  weight_kg: z.coerce.number().positive().optional().or(z.literal('')),
  height_cm: z.coerce.number().positive().optional().or(z.literal('')),
  muac_cm: z.coerce.number().positive().optional().or(z.literal('')),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const NUTRITION_COLORS: Record<string, string> = {
  SAM:               'bg-red-100 text-red-800 border-red-200',
  MAM:               'bg-orange-100 text-orange-800 border-orange-200',
  SEVERE_UNDERWEIGHT:'bg-red-100 text-red-800 border-red-200',
  UNDERWEIGHT:       'bg-yellow-100 text-yellow-800 border-yellow-200',
  STUNTED:           'bg-yellow-100 text-yellow-800 border-yellow-200',
  NORMAL:            'bg-green-100 text-green-800 border-green-200',
};

function TrendIcon({ direction }: { direction: string }) {
  if (direction === 'IMPROVING') return <FiArrowUp className="h-4 w-4 text-green-600" />;
  if (direction === 'DECLINING') return <FiArrowDown className="h-4 w-4 text-red-600" />;
  return <FiMinus className="h-4 w-4 text-gray-400" />;
}

function ChildGrowthRow({ child }: { child: ChildRead }) {
  const navigate = useNavigate();
  const { data: trend } = useGrowthTrend(child.id);

  return (
    <li
      onClick={() => navigate(`/children/${child.id}`)}
      className="flex items-center justify-between px-6 py-4 hover:bg-indigo-50/40 cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
          <span className="text-indigo-700 font-semibold text-xs">
            {`${child.first_name[0]}${child.last_name[0]}`.toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {child.first_name} {child.last_name}
          </p>
          {trend?.latest_status && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mt-0.5 ${NUTRITION_COLORS[trend.latest_status] ?? NUTRITION_COLORS.NORMAL}`}>
              {trend.latest_status.replace(/_/g, ' ')}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {trend && <TrendIcon direction={trend.trend_direction} />}
        <FiChevronRight className="h-4 w-4 text-gray-400" />
      </div>
    </li>
  );
}

const inputClass = 'block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors';

export const GrowthPage = () => {
  const { data: children = [], isLoading } = useChildren();
  const { mutateAsync: recordGrowth } = useRecordGrowth();
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: { recorded_date: new Date().toISOString().split('T')[0] },
  });

  const onSubmit = async (data: FormData) => {
    await recordGrowth({
      child_id: data.child_id,
      recorded_date: data.recorded_date,
      weight_kg: data.weight_kg ? Number(data.weight_kg) : undefined,
      height_cm: data.height_cm ? Number(data.height_cm) : undefined,
      muac_cm: data.muac_cm ? Number(data.muac_cm) : undefined,
      notes: data.notes,
    });
    reset();
    setShowForm(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Growth Monitoring</h2>
          <p className="text-sm text-gray-500 mt-1">
            Record weight, height, and MUAC measurements.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
        >
          {showForm ? 'Cancel' : '+ Record Measurement'}
        </button>
      </div>

      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-medium">
          Growth measurement recorded successfully.
        </div>
      )}

      {/* Record form */}
      {showForm && (
        <Card>
          <CardHeader title="New Measurement" />
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Child</label>
              <select {...register('child_id')} className={inputClass}>
                <option value="">Select child…</option>
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </option>
                ))}
              </select>
              {errors.child_id && <p className="mt-1 text-xs text-red-600">{String(errors.child_id.message)}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" {...register('recorded_date')} className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input type="number" step="0.1" {...register('weight_kg')} className={inputClass} placeholder="e.g. 12.5" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
              <input type="number" step="0.1" {...register('height_cm')} className={inputClass} placeholder="e.g. 87.0" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MUAC (cm)</label>
              <input type="number" step="0.1" {...register('muac_cm')} className={inputClass} placeholder="e.g. 13.5" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea {...register('notes')} rows={2} className={`${inputClass} resize-none`} />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {isSubmitting && <Spinner size="sm" className="text-white" />}
                {isSubmitting ? 'Saving…' : 'Save Measurement'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Children list with latest growth status */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">All Children — Latest Status</h3>
        </div>
        {children.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">No children registered.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {children.map((c) => <ChildGrowthRow key={c.id} child={c} />)}
          </ul>
        )}
      </div>
    </div>
  );
};
