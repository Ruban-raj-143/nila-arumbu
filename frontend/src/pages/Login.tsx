import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/auth';
import { Spinner } from '../components/ui/Spinner';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { detail?: string })?.detail ?? 'Login failed. Check your credentials.';
      setServerError(msg);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #fdf4ff 100%)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #ec4899 100%)' }}>
        {/* Pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />
        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8 shadow-lg">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Nila Arumbu
          </h1>
          <p className="text-indigo-200 text-lg leading-relaxed mb-10">
            Integrated Early Childhood<br />Decision Support Platform
          </p>
          <div className="space-y-4">
            {[
              { icon: '👁️', text: 'Every Child Seen' },
              { icon: '⚠️', text: 'Every Risk Identified' },
              { icon: '✅', text: 'Every Referral Closed' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-base">{icon}</span>
                <span className="text-white font-medium">{text}</span>
              </div>
            ))}
          </div>
          <div className="mt-12 flex items-center gap-4">
            {['Tamil Nadu', 'ICDS', 'Anganwadi'].map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <span className="text-white font-bold">N</span>
            </div>
            <span className="text-xl font-bold text-slate-900">Nila Arumbu</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                {...register('email')}
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                  errors.email
                    ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                }`}
                placeholder="worker@nilarumbu.gov.in"
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                {...register('password')}
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                  errors.password
                    ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                }`}
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            {serverError && (
              <div className="rounded-xl px-4 py-3 text-sm text-red-700 border border-red-200" style={{ background: '#fef2f2' }}>
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 mt-2"
              style={{ background: isSubmitting ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}
            >
              {isSubmitting && <Spinner size="sm" className="text-white" />}
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 p-4 rounded-2xl border border-slate-200 bg-white/80">
            <p className="text-xs font-semibold text-slate-500 mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-slate-600">
              <p>👤 worker@nilarumbu.gov.in · Worker@2024</p>
              <p>👑 admin@nilarumbu.gov.in · NilaAdmin@2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
