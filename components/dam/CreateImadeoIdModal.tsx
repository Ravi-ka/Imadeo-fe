'use client';

import React, { useState, useEffect } from 'react';
import { Layers, ArrowRight, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface CreateImadeoIdModalProps {
  isOpen: boolean;
  onSubmit: (imadeoId: string) => Promise<void>;
  initialError?: string | null;
}

export function CreateImadeoIdModal({ isOpen, onSubmit, initialError }: CreateImadeoIdModalProps) {
  const [imadeoId, setImadeoId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError || null);

  useEffect(() => {
    if (initialError) {
      setErrorMessage(initialError);
    }
  }, [initialError]);

  // Prevent closing on Escape keypress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = imadeoId.trim().toLowerCase().replace(/^@/, '');

    // 1. Required check
    if (!cleanId) {
      setErrorMessage("Imadeo ID is required");
      return;
    }

    // 2. Min 3 characters check
    if (cleanId.length < 3) {
      setErrorMessage("Imadeo ID must be at least 3 characters");
      return;
    }

    // 3. Max 30 characters check
    if (cleanId.length > 30) {
      setErrorMessage("Imadeo ID must be at most 30 characters");
      return;
    }

    // 4. Regex format check: letters, numbers, underscores, hyphens; cannot start or end with _ or -
    const validPattern = /^[a-z0-9](?:[a-z0-9_-]*[a-z0-9])?$/;
    if (!validPattern.test(cleanId)) {
      setErrorMessage(
        "Imadeo ID must be letters, numbers, underscores, or hyphens, and cannot start or end with _ or -"
      );
      return;
    }

    // 5. Refine check: cannot contain consecutive underscores or hyphens
    if (cleanId.includes("__") || cleanId.includes("--")) {
      setErrorMessage("Imadeo ID cannot contain consecutive underscores or hyphens");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await onSubmit(cleanId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create Imadeo ID. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        {/* Blocking Backdrop - Non-clickable */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 pointer-events-auto"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-8 z-50 overflow-hidden"
        >
          {/* Top Decorative Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 rounded-b-full bg-gradient-to-r from-primary via-secondary to-accent" />

          {/* Logo & Title Header */}
          <div className="text-center space-y-3 mb-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary via-secondary to-accent p-0.5 flex items-center justify-center shadow-lg shadow-primary/30">
              <div className="w-full h-full bg-slate-900/20 rounded-[14px] flex items-center justify-center text-white">
                <Layers className="w-7 h-7" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Create Your Imadeo ID
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Choose your unique workspace handle to start organizing, processing, and sharing media.
              </p>
            </div>
          </div>

          {/* Error Message Alert Banner */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">
                {errorMessage}
              </div>
            </motion.div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5 text-left">
              <label htmlFor="imadeo_id_input" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Unique Imadeo Handle
              </label>

              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none flex items-center font-bold text-sm">
                  @
                </div>
                <input
                  id="imadeo_id_input"
                  type="text"
                  value={imadeoId}
                  onChange={(e) => {
                    setImadeoId(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="username (e.g. alex_morgan)"
                  disabled={isSubmitting}
                  autoFocus
                  required
                  className="w-full pl-8 pr-4 py-3 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50"
                />
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal">
                3-30 chars (lowercase letters, numbers, _ or -). Cannot start/end with _ or - or use consecutive __ or --.
              </p>
            </div>

            {/* Features preview bullet points */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 space-y-2 text-left">
              <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Unlocks complete DAM workspace access</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span>Personalized asset sharing link prefix</span>
              </div>
            </div>

            {/* Action Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !imadeoId.trim()}
              isLoading={isSubmitting}
              fullWidth
              className="py-3 bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary-dark hover:to-secondary-dark text-white font-bold shadow-lg shadow-primary/25 rounded-xl text-sm"
              rightIcon={!isSubmitting && <ArrowRight className="w-4 h-4 ml-1" />}
            >
              {isSubmitting ? 'Creating Imadeo ID...' : 'Confirm & Proceed to Dashboard'}
            </Button>
          </form>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
