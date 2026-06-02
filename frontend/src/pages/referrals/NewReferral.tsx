import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiArrowLeft, FiSend } from 'react-icons/fi';
import { useChild } from '../../hooks/useChildren';
import { useCreateReferral } from '../../hooks/useReferrals';
import { Spinner } from '../../components/ui/Spinner';

const schema = z.object({
  referral_type: z.enum(['HOSPITAL', 'NRC', 'PHC', 'SPECIALIST', 'NGO', 'OTHER']),
  reason: z.string().min(10, 'Please describe the reason (min 10 characters)'),
  referred_to: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const inputClass =
  'block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors';

export const NewReferral = () => {
  const { id: childId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: child } = useChild(childId!);
  const { mutateAsync: createReferral } = useCreateReferral();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    await createReferral({ ...data, child_id: childId });
    navigate(`/children/${childId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">New Referral</h2>
          {child && (
            <p className="text-sm text-gray-500 mt-0.5">
              For: {child.first_name} {child.last_name}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="p-6 space-y-5">
            {/* Referral type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referral Type
              </label>
              <select {...register('referral_type')} className={inputClass}>
                <option value="">Select type…</option>
                <option value="HOSPITAL">Hospital</option>
                <option value="NRC">NRC — Nutrition Rehabilitation Centre</option>
                <option value="PHC">PHC — Primary Health Centre</option>
                <option value="SPECIALIST">Specialist</option>
                <option value="NGO">NGO Partner</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.referral_type && (
                <p className="mt-1 text-xs text-red-600">{errors.referral_type.message}</p>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Referral
              </label>
              <textarea
                {...register('reason')}
                rows={3}
                className={`${inputClass} resize-none`}
                placeholder="Describe the clinical or developmental reason for this referral…"
              />
              {errors.reason && (
                <p className="mt-1 text-xs text-red-600">{errors.reason.message}</p>
              )}
            </div>

            {/* Referred to */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referred To (facility name, optional)
              </label>
              <input
                {...register('referred_to')}
                className={inputClass}
                placeholder="e.g. Government Hospital, Egmore"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes (optional)
              </label>
              <textarea
                {...register('notes')}
                rows={2}
                className={`${inputClass} resize-none`}
                placeholder="Any additional context for the receiving facility…"
              />
            </div>
          </div>

          {/* Info banner */}
          <div className="mx-6 mb-4 rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3 text-xs text-indigo-700">
            Referral will be created with status <strong>IDENTIFIED</strong>. 
            Track progress through: Identified → Referred → Appointment Pending → Visited → Follow-Up → Closed.
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm"
            >
              {isSubmitting ? <Spinner size="sm" className="text-white" /> : <FiSend className="h-4 w-4" />}
              {isSubmitting ? 'Creating…' : 'Create Referral'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
