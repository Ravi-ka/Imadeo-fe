'use client';

import React, { useState, useEffect } from 'react';
import { Folder as FolderIcon, X, Loader2, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

export type MoveDestination = {
  id: string | null;
  name: string;
  depth: number;
};

interface MoveDestinationModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  destinations: MoveDestination[];
  currentParentId?: string | null;
  onClose: () => void;
  onConfirm: (destinationId: string | null) => Promise<void>;
}

export function MoveDestinationModal({
  isOpen,
  title,
  description,
  destinations,
  currentParentId,
  onClose,
  onConfirm,
}: MoveDestinationModalProps) {
  const [selected, setSelected] = useState<string | null | undefined>(undefined);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelected(undefined);
      setIsMoving(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (selected === undefined) return;
    setIsMoving(true);
    try {
      await onConfirm(selected);
      onClose();
    } catch {
      // Parent toast
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 space-y-4 overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
              {description && (
                <p className="text-xs text-slate-500 mt-1">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1 border border-slate-200 dark:border-slate-800 rounded-xl p-2">
            {destinations.length === 0 ? (
              <p className="text-sm text-slate-400 p-3 text-center">
                No valid destinations (max folder depth is 3).
              </p>
            ) : (
              destinations.map((dest) => {
                const isCurrent = dest.id === currentParentId;
                const key = dest.id ?? '__root__';
                const isSelected = selected === dest.id;
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={isCurrent}
                    onClick={() => setSelected(dest.id)}
                    className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      isCurrent
                        ? 'opacity-40 cursor-not-allowed'
                        : isSelected
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                    style={{ paddingLeft: `${12 + dest.depth * 12}px` }}
                  >
                    {dest.id === null ? (
                      <Home className="w-4 h-4 shrink-0" />
                    ) : (
                      <FolderIcon className="w-4 h-4 shrink-0 text-blue-500" />
                    )}
                    <span className="truncate">{dest.name}</span>
                    {isCurrent && (
                      <span className="ml-auto text-[10px] uppercase text-slate-400">Current</span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="ghost" onClick={onClose} disabled={isMoving}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isMoving || selected === undefined || destinations.length === 0}
              className="bg-primary text-white"
            >
              {isMoving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Moving...
                </>
              ) : (
                'Move'
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
