'use client';

import React from 'react';
import { Workspace } from './types';
import { ChevronDown, Briefcase, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelect: (id: string) => void;
}

export function WorkspaceSwitcher({ workspaces, activeWorkspaceId, onSelect }: WorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors w-full md:w-auto min-w-[160px]"
      >
        <Briefcase className="w-4 h-4 text-primary" />
        <span className="flex-1 text-sm font-medium text-left truncate text-slate-700 dark:text-slate-200">
          {activeWorkspace?.name || activeWorkspaceId}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-500" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="py-1">
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Switch Workspace
              </div>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    onSelect(ws.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                    ws.id === activeWorkspaceId ? 'bg-slate-50 dark:bg-slate-800' : ''
                  }`}
                >
                  <span className="truncate text-slate-700 dark:text-slate-200">
                    {ws.name || ws.id}
                  </span>
                  {ws.id === activeWorkspaceId && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
