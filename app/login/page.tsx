'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/useAuthStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Layers, Github, Chrome, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, setLoading, setError } = useAuthStore();
  const [rememberMe, setRememberMe] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API response delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockUser = {
        id: 'usr_mock123',
        firstName: 'John',
        lastName: 'Doe',
        email: data.email
      };
      const mockToken = 'mock_jwt_token_abcdef123456';
      
      login(mockToken, mockUser);
      router.push('/');
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-background-light dark:bg-background-dark">
      
      {/* Left side Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24 xl:px-32 z-10">
        <div className="w-full max-w-md mx-auto space-y-8">
          
          {/* Logo & Header */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">Imadeo</span>
            </Link>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Welcome back</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sign in to manage your media assets & processing queues.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm flex items-center space-x-3"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <Link href="#" className="text-xs font-medium text-primary hover:text-primary-light transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-800 text-primary focus:ring-primary/20 bg-transparent"
              />
              <label htmlFor="remember-me" className="ml-2 text-sm text-slate-650 dark:text-slate-400">
                Remember me for 30 days
              </label>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          {/* Social Logins */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-850" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background-light dark:bg-background-dark px-2 text-slate-400 font-semibold tracking-wider">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button type="button" variant="outline" className="w-full" leftIcon={<Chrome className="w-4 h-4 text-red-550" />}>
                Google
              </Button>
              <Button type="button" variant="outline" className="w-full" leftIcon={<Github className="w-4 h-4" />}>
                GitHub
              </Button>
            </div>
          </div>

          {/* Register Redirect */}
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold text-primary hover:text-primary-light transition-colors">
              Sign up free
            </Link>
          </p>

        </div>
      </div>

      {/* Right side Brand panel (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-tr from-slate-900 via-primary-dark to-slate-950 p-12 flex-col justify-between relative overflow-hidden">
        {/* Glow lights */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative flex items-center space-x-2">
          <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-white">Imadeo Pipeline</span>
        </div>

        <div className="relative space-y-4 max-w-md">
          <h3 className="text-3xl font-extrabold text-white leading-snug">
            Streamline your media workloads instantly.
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Configure automated WebP fallback compression, ffmpeg video presets, and temporary storage signed URLs in seconds.
          </p>
        </div>

        <div className="relative text-xs text-slate-500 font-mono flex justify-between">
          <span>SYSTEM STATUS: OK</span>
          <span>LATENCY: 12ms</span>
        </div>
      </div>

    </div>
  );
}
