'use client';

import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const activeType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full flex flex-col space-y-1.5">
        {label && (
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative w-full">
          <input
            ref={ref}
            type={activeType}
            className={twMerge(
              clsx(
                "w-full px-4 py-2.5 bg-white/50 dark:bg-slate-900/50 border rounded-lg focus:outline-none focus:ring-2 transition-all backdrop-blur-sm",
                error 
                  ? "border-danger focus:ring-danger/20 focus:border-danger" 
                  : "border-slate-200 dark:border-slate-800 focus:ring-primary/20 focus:border-primary",
                className
              )
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error && (
          <span className="text-xs text-danger font-medium animate-fadeIn">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
