import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiBookOpen, FiHome, FiStar } from 'react-icons/fi';
import { api } from '../../lib/api';
import type { LearningActivityRead } from '../../lib/types';
import { Spinner } from '../../components/ui/Spinner';
import { Card, CardHeader } from '../../components/ui/Card';

const schema = z.object({
  child_id: z.string().uuid('Enter a valid child ID'),
  age_in_months: z.coerce.number().min(0).max(72),
  risk_level: z.enum(['GREEN', 'YELLOW', 'RED']),
  developmental_status: z.enum(['ON_TRACK', 'MILD_DELAY', 'MODERATE_DELAY', 'SEVERE_DELAY']),
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormData = any;

const inputClass = 'block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors';

export const LearningPage = () => {
  const [plan, setPlan] = useState<LearningActivityRead | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: { risk_level: 'GREEN', developmental_status: 'ON_TRACK' },
  });

  const onSubmit = async (data: FormData) => {
    const result = await api.post<LearningActivityRead>('/learning/plans', {
      ...data,
      plan_date: new Date().toISOString().split('T')[0],
    });
    setPlan(result);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Learning Planner</h2>
        <p className="text-sm text-gray-500 mt-1">
          Generate age-appropriate activity plans based on risk and developmental status.
        </p>
      </div>

      <Card>
        <CardHeader title="Generate Activity Plan" />
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Child ID (UUID)</label>
            <input {...register('child_id')} className={inputClass} placeholder="Paste child UUID" />
            {errors.child_id && <p className="mt-1 text-xs text-red-600">{String(errors.child_id.message)}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age (months)</label>
            <input type="number" {...register('age_in_months')} className={inputClass} min={0} max={72} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
            <select {...register('risk_level')} className={inputClass}>
              <option value="GREEN">Green — Low Risk</option>
              <option value="YELLOW">Yellow — Medium Risk</option>
              <option value="RED">Red — High Risk</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Developmental Status</label>
            <select {...register('developmental_status')} className={inputClass}>
              <option value="ON_TRACK">On Track</option>
              <option value="MILD_DELAY">Mild Delay</option>
              <option value="MODERATE_DELAY">Moderate Delay</option>
              <option value="SEVERE_DELAY">Severe Delay</option>
            </select>
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {isSubmitting && <Spinner size="sm" className="text-white" />}
              Generate Plan
            </button>
          </div>
        </form>
      </Card>

      {plan && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Centre Activities', items: plan.centre_activities, icon: FiStar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { title: 'Home Activities', items: plan.home_activities, icon: FiHome, color: 'text-green-600', bg: 'bg-green-50' },
            { title: 'School Readiness', items: plan.school_readiness_tasks, icon: FiBookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(({ title, items, icon: Icon, color, bg }) => (
            <Card key={title}>
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">{title}</h4>
              {items.length === 0 ? (
                <p className="text-xs text-gray-400">None for this age/risk combination.</p>
              ) : (
                <ul className="space-y-2">
                  {(items as string[]).map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
