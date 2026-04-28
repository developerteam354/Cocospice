'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

import { useAppSelector } from '@/store/hooks';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) router.replace('/admin/dashboard');
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
          },
        }}
      />

      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-4">
        
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl"
          />
          <motion.div
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-3xl"
          />
        </div>

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Login Form */}
        <div className="relative z-10">
          <LoginForm />
        </div>
      </div>
    </>
  );
}
