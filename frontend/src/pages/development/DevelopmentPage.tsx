import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiActivity, FiChevronRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useChildren } from '../../hooks/useChildren';
import { useDevelopmentSummary, useRecordAssessment } from '../../hooks/useDevelopment';
import { PageSpinner, Spinner } from '../../components/ui/Spinner';
import { Card, CardHeader } from '../../components/ui/Card';
import type { ChildRead } from '../../lib/types';

const STATUS_COLORS: Record<string, string> = {
  ON_TRACK:       'bg-green-100 text-green-800 border-green-200',
  MILD_DELAY:     'bg-yellow-100 text-yellow-800 border-yellow-200',
  MODERATE_DELAY: 'bg-orange-100 text-orange-800 border-orange-200',
  SEVERE_DELAY:   'bg-red-100 text-red-800 border-red-200',
};

const schema = z.object({
  child_id: z.string().uuid('Select a child'),
  assessed_date: z.string().min(1),
  age_in_months: z.coerce.number().min(0).max(72),
  gross_motor_score:     z.coerce.number().min(0).max(100),
  fine_motor_score:      z.coerce.number().min(0).max(100),
  language_score:        z.coerce.number().min(0).max(100),
  cognitive_score:       z.coerce.number().min(0).max(100),
  social_emotional_score:z.coerce.number().min(0).max(100),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const inputClass =
  'block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors';

function ScoreField({ label, name, register }: { label: string; name: keyof FormData; register: ReturnType<typeof useForm<FormData>>['register'] }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label} (0–100)</label>
      <input type="number" min={0} max={100} {...register(name)} className={inputClass} placeholder="0–100" />
    </div>
  );
}

function ChildDevRow({ child }: { child: ChildRead }) {
  const navigate = useNavigate();
  const { data: summary } = useDevelopmentSummary(child.id);
  const status = summary?.latest_status;

  return (
    <li
      onClick={() => navigate(`/children/${child.id}`)}
      className="flex items-center justify-between px-6 py-4 hover:bg-indigo-50/40 cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
          <span className="text-purple-700 font-semibold text-xs">
            {`${child.first_name[0]}${child.last_name[0]}`.toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {child.first_name} {child.last_name}
          </p>
          {status ? (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mt-0.5 ${STATUS_COLORS[status] ?? STATUS_COLORS.ON_TRACK}`}>
              {status.replace(/_/g, ' ')}
              {summary?.latest_overall_score != null && ` · ${summary.latest_overall_score.toFixed(0)}/100`}
            </span>
          ) : (
            <span className="text-xs text-gray-400 mt-0.5 block">Not assessed</span>
          )}
        </div>
      </div>
      <FiChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
    </li>
  );
}

export const DevelopmentPage = () => {
  const { data: children = [], isLoading } = useChildren();
  const { mutateAsync: recordAssessment } = useRecordAssessment();
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { assessed_date: new Date().toISOString().split('T')[0] },
  });

  const onSubmit = async (data: FormData) => {
    await recordAssessment(data as Record<string, unknown>);
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
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Development Assessment</h2>
          <p className="text-sm text-gray-500 mt-1">
            Score each developmental domain 0–100. Overall status is computed automatically.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
        >
          {showForm ? 'Cancel' : '+ New Assessment'}
        </button>
      </div>

      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-medium">
          Assessment recorded successfully.
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader
            title="New Developmental Assessment"
            subtitle="Score each domain 0–100. Language weight 25%, others 20%."
          />
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Date</label>
              <input type="date" {...register('assessed_date')} className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age (months)</label>
              <input type="number" {...register('age_in_months')} className={inputClass} placeholder="e.g. 24" />
            </div>

            <ScoreField label="Gross Motor"      name="gross_motor_score"      register={register} />
            <ScoreField label="Fine Motor"       name="fine_motor_score"       register={register} />
            <ScoreField label="Language"         name="language_score"         register={register} />
            <ScoreField label="Cognitive"        name="cognitive_score"        register={register} />
            <ScoreField label="Social-Emotional" name="social_emotional_score" register={register} />

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
                {isSubmitting ? 'Saving…' : 'Save Assessment'}
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">All Children — Latest Status</h3>
        </div>
        {children.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">No children registered.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {children.map((c) => <ChildDevRow key={c.id} child={c} />)}
          </ul>
        )}
      </div>
    </div>
  );
};
