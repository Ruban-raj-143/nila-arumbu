import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiSend, FiCheck, FiMessageCircle } from 'react-icons/fi';
import { useChildren } from '../../hooks/useChildren';
import { api } from '../../lib/api';
import { Spinner } from '../../components/ui/Spinner';
import { Card, CardHeader } from '../../components/ui/Card';

const TEMPLATES = [
  { value: 'DAILY_ACTIVITY',       label: '📌 Daily Activity',         desc: 'இன்றைய செயல்பாடு' },
  { value: 'WEEKLY_REMINDER',      label: '📅 Weekly Reminder',        desc: 'வாராந்திர நினைவூட்டல்' },
  { value: 'REFERRAL_REMINDER',    label: '🏥 Referral Reminder',      desc: 'மருத்துவ சந்திப்பு' },
  { value: 'DEVELOPMENT_NUDGE',    label: '🧠 Development Tip',        desc: 'வளர்ச்சி குறிப்பு' },
  { value: 'PROGRESS_SUMMARY',     label: '📊 Progress Summary',       desc: 'மாதாந்திர முன்னேற்றம்' },
  { value: 'ATTENDANCE_ALERT',     label: '⚠️ Attendance Alert',       desc: 'வருகை எச்சரிக்கை' },
  { value: 'RISK_ALERT',           label: '🔴 Risk Alert',             desc: 'உடனடி கவனிப்பு' },
  { value: 'APPOINTMENT_REMINDER', label: '📅 Appointment Reminder',   desc: 'நாளை சந்திப்பு' },
];

const schema = z.object({
  child_id: z.string().uuid('Select a child'),
  parent_phone: z.string().min(10, 'Enter valid phone number'),
  child_name: z.string().default('Child'),
  template: z.string().min(1, 'Select a template'),
});
type FormData = z.infer<typeof schema>;

const inputClass =
  'block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors';

export const EngagementPage = () => {
  const { data: children = [] } = useChildren();
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<any>({ resolver: zodResolver(schema) });

  // Auto-fill child name when child is selected
  const selectedChildId = watch('child_id');
  React.useEffect(() => {
    const child = children.find((c) => c.id === selectedChildId);
    if (child) setValue('child_name', `${child.first_name} ${child.last_name}`);
  }, [selectedChildId, children, setValue]);

  const onSubmit = async (data: FormData) => {
    // Auto-add +91 if not present
    const phone = data.parent_phone.startsWith('+')
      ? data.parent_phone
      : `+91${data.parent_phone.replace(/\s/g, '')}`;

    const res = await api.post<{ success: boolean; message_preview: string }>(
      '/engagement/whatsapp/',
      { ...data, parent_phone: phone },
    );
    setPreview(res.message_preview);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Parent Engagement</h2>
        <p className="text-sm text-gray-500 mt-1">
          WhatsApp மூலம் parents-க்கு Tamil + English messages அனுப்புங்கள்.
        </p>
      </div>

      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 flex items-center gap-2 text-sm text-green-700 font-medium">
          <FiCheck className="h-4 w-4 shrink-0" />
          WhatsApp message sent successfully!
          {preview && <span className="text-green-600 font-normal ml-1">"{preview}"</span>}
        </div>
      )}

      <Card>
        <CardHeader
          title="Send WhatsApp Message"
          subtitle="Bilingual Tamil + English templates"
        />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Child */}
          <div>
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

          {/* Parent phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent WhatsApp Number
            </label>
            <input
              {...register('parent_phone')}
              className={inputClass}
              placeholder="6369713571 (or +916369713571)"
            />
            {errors.parent_phone && <p className="mt-1 text-xs text-red-600">{String(errors.parent_phone.message)}</p>}
          </div>

          {/* Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message Template</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TEMPLATES.map((t) => {
                const selected = watch('template') === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setValue('template', t.value)}
                    className={`text-left px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                      selected
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-800'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'
                    }`}
                  >
                    <p className="font-medium">{t.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                  </button>
                );
              })}
            </div>
            {errors.template && <p className="mt-1 text-xs text-red-600">{String(errors.template.message)}</p>}
          </div>

          <input type="hidden" {...register('child_name')} />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 transition-colors shadow-sm"
          >
            {isSubmitting ? (
              <Spinner size="sm" className="text-white" />
            ) : (
              <FiMessageCircle className="h-4 w-4" />
            )}
            {isSubmitting ? 'Sending…' : 'Send WhatsApp Message'}
          </button>
        </form>
      </Card>
    </div>
  );
};
