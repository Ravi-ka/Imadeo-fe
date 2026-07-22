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
import { Layers, Github, Chrome, AlertCircle, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import {api} from '../../services/api'

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  username: z.string().min(2, 'Username must be at least 2 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login, isLoading, error, setLoading, setError } = useAuthStore();
  const [passwordValue, setPasswordValue] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: undefined
    }
  });

  // Watch password value to calculate strength dynamically
  const watchedPassword = watch('password', '');

  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthScore = calculateStrength(watchedPassword);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-danger', 'bg-warning', 'bg-blue-400', 'bg-success'];

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/v1/auth/register', {
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        username: data.username,
      });
      console.log("Response", response);
      if (response.status === 201) {
        console.log("User registered successfully");
        console.log(response.data);
      }
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Registration failed. Please try again.');
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
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Create your account</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Get started with your high-speed media pipeline workspace.
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="username"
              type="text"
              placeholder="Username"
              error={errors.username?.message}
              {...register('username')}
            />

            <div className="space-y-2">
              <Input
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                error={errors.password?.message}
                {...register('password')}
              />

              {/* Password Strength Meter */}
              {watchedPassword.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-450">Strength:</span>
                    <span className="font-semibold text-slate-705 dark:text-slate-300">
                      {strengthLabels[strengthScore - 1] || 'Too short'}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex space-x-0.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 transition-colors duration-300 ${
                          step <= strengthScore 
                            ? strengthColors[strengthScore - 1] 
                            : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-400">
                    <span className="flex items-center">
                      {watchedPassword.length >= 8 ? <Check className="w-3 h-3 text-success mr-1" /> : <X className="w-3 h-3 text-danger mr-1" />}
                      8+ Characters
                    </span>
                    <span className="flex items-center">
                      {/[A-Z]/.test(watchedPassword) ? <Check className="w-3 h-3 text-success mr-1" /> : <X className="w-3 h-3 text-danger mr-1" />}
                      Uppercase Letter
                    </span>
                    <span className="flex items-center">
                      {/[0-9]/.test(watchedPassword) ? <Check className="w-3 h-3 text-success mr-1" /> : <X className="w-3 h-3 text-danger mr-1" />}
                      Number
                    </span>
                    <span className="flex items-center">
                      {/[^A-Za-z0-9]/.test(watchedPassword) ? <Check className="w-3 h-3 text-success mr-1" /> : <X className="w-3 h-3 text-danger mr-1" />}
                      Special Character
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {/* Terms and Conditions Checkbox */}
            <div className="flex flex-col space-y-1">
              <div className="flex items-start">
                <input
                  id="accept-terms"
                  type="checkbox"
                  className="w-4 h-4 mt-0.5 rounded border-slate-350 dark:border-slate-800 text-primary focus:ring-primary/20 bg-transparent"
                  {...register('acceptTerms')}
                />
                <label htmlFor="accept-terms" className="ml-2.5 text-xs text-slate-650 dark:text-slate-400">
                  I accept the{' '}
                  <Link href="#" className="font-semibold text-primary hover:text-primary-light">Terms of Service</Link>{' '}
                  and{' '}
                  <Link href="#" className="font-semibold text-primary hover:text-primary-light">Privacy Policy</Link>.
                </label>
              </div>
              {errors.acceptTerms && (
                <span className="text-xs text-danger font-medium">
                  {errors.acceptTerms.message}
                </span>
              )}
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              Register Account
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
                  Or register with
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

          {/* Login Redirect */}
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:text-primary-light transition-colors">
              Sign in instead
            </Link>
          </p>

        </div>
      </div>

      {/* Right side Brand panel (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-tr from-slate-900 via-secondary-dark to-slate-950 p-12 flex-col justify-between relative overflow-hidden">
        {/* Glow lights */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative flex items-center space-x-2">
          <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-white">Imadeo</span>
        </div>

        <div className="relative space-y-4 max-w-md">
          <h3 className="text-3xl font-extrabold text-white leading-snug">
            Designed for high performance.
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Register and spin up real-time media transformations. Decouple long-running video transcoding through distributed workers effortlessly.
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
