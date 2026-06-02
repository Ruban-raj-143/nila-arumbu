import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { useRegisterChild } from '../../hooks/useChildren';
import { useAuthStore } from '../../store/auth';
import { Spinner } from '../../components/ui/Spinner';

const schema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  date_of_birth: z.string().min(1, 'Required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { message: 'Select a gender' }),
  aadhaar_number: z.string().length(12, 'Must be 12 digits').optional().or(z.literal('')),
  mother_name: z.string().optional(),
  father_name: z.string().optional(),
  guardian_name: z.string().optional(),
  guardian_phone: z.string().optional(),
  address: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const inputClass = (hasError: boolean) =>
  `block w-full px-3 py-2.5 text-sm border rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
    hasError ? 'border-red-400' : 'border-gray-300'
  }`;

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export const RegisterChild = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { mutateAsync: registerChild } = useRegisterChild();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      aadhaar_number: data.aadhaar_number || undefined,
      centre_id: user?.centre_id ?? undefined,  // auto-assign worker's centre
    };
    try {
      await registerChild(payload as Parameters<typeof registerChild>[0]);
      navigate('/children');
    } catch (err: unknown) {
      const msg = (err as { detail?: string })?.detail ?? 'Registration failed';
      alert(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label="Go back"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Register Child</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            A Child Passport is created automatically on registration.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
          {/* Identity */}
          <section className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Identity
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First Name" error={errors.first_name?.message}>
                <input
                  {...register('first_name')}
                  className={inputClass(!!errors.first_name)}
                  placeholder="Aravind"
                />
              </Field>
              <Field label="Last Name" error={errors.last_name?.message}>
                <input
                  {...register('last_name')}
                  className={inputClass(!!errors.last_name)}
                  placeholder="Kumar"
                />
              </Field>
              <Field label="Date of Birth" error={errors.date_of_birth?.message}>
                <input
                  type="date"
                  {...register('date_of_birth')}
                  className={inputClass(!!errors.date_of_birth)}
                />
              </Field>
              <Field label="Gender" error={errors.gender?.message}>
                <select {...register('gender')} className={inputClass(!!errors.gender)}>
                  <option value="">Select…</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </Field>
              <Field label="Aadhaar Number (optional)" error={errors.aadhaar_number?.message}>
                <input
                  {...register('aadhaar_number')}
                  className={inputClass(!!errors.aadhaar_number)}
                  placeholder="12-digit number"
                  maxLength={12}
                />
              </Field>
            </div>
          </section>

          {/* Family */}
          <section className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Family Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Mother's Name">
                <input
                  {...register('mother_name')}
                  className={inputClass(false)}
                  placeholder="Optional"
                />
              </Field>
              <Field label="Father's Name">
                <input
                  {...register('father_name')}
                  className={inputClass(false)}
                  placeholder="Optional"
                />
              </Field>
              <Field label="Guardian Name">
                <input
                  {...register('guardian_name')}
                  className={inputClass(false)}
                  placeholder="Optional"
                />
              </Field>
              <Field label="Guardian Phone">
                <input
                  {...register('guardian_phone')}
                  className={inputClass(false)}
                  placeholder="+91 XXXXX XXXXX"
                />
              </Field>
            </div>
            <Field label="Address">
              <textarea
                {...register('address')}
                rows={2}
                className={`${inputClass(false)} resize-none`}
                placeholder="Village, Block, District"
              />
            </Field>
          </section>

          {/* Actions */}
          <div className="px-6 py-4 flex justify-end gap-3 bg-gray-50/50">
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
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm"
            >
              {isSubmitting ? <Spinner size="sm" className="text-white" /> : <FiSave className="h-4 w-4" />}
              {isSubmitting ? 'Saving…' : 'Save & Create Passport'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
