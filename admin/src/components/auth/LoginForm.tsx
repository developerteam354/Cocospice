'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginAdmin } from '@/store/slices/authSlice';
import type { RootState } from '@/store/store';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

// ─── Validation Schema ────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const, staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoginForm() {
  const dispatch = useAppDispatch();
  const router   = useRouter();
  const loading  = useAppSelector((state: RootState) => state.auth.loading);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect to intended destination after login
  const searchParams = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : null;
  const redirectTo = searchParams?.get('from') ?? '/admin/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    const result = await dispatch(loginAdmin(data));

    if (loginAdmin.fulfilled.match(result)) {
      toast.success('Welcome back!');
      router.push(redirectTo);
    } else {
      const message =
        typeof result.payload === 'string' ? result.payload : 'Login failed';
      toast.error(message);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md"
    >
      {/* Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl shadow-black/40">

        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30">
            <ShieldCheck size={28} className="text-indigo-400" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
            <p className="mt-1 text-sm text-slate-400">Sign in to your dashboard</p>
          </div>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <motion.div variants={itemVariants}>
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@cocospice.com"
              autoComplete="email"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="cursor-pointer hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="pt-1">
            <Button type="submit" loading={loading} className="w-full">
              Sign In
            </Button>
          </motion.div>
        </form>
      </div>

      <motion.p variants={itemVariants} className="mt-6 text-center text-xs text-slate-600">
        Cocospice Admin Panel &copy; {new Date().getFullYear()}
      </motion.p>
    </motion.div>
  );
}
