'use client';

import React, { useRef } from 'react';
import { 
  Search, 
  Plus, 
  Bell, 
  HelpCircle, 
  ChevronRight, 
  X,
  SlidersHorizontal,
  FolderOpen
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  title: string;
  breadcrumbs: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenUpload: () => void;
  selectedCount?: number;
  totalAssetsCount: number;
}

export function Header({
  title,
  breadcrumbs,
  searchQuery,
  onSearchChange,
  onOpenUpload,
  selectedCount = 0,
  totalAssetsCount
}: HeaderProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener to focus search on '/' keypress
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-6 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Title & Breadcrumbs */}
        <div className="space-y-1">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={`${crumb}-${idx}`}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                <span className={idx === breadcrumbs.length - 1 ? 'text-primary dark:text-primary-light font-semibold' : 'hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer'}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </nav>

          {/* Title */}
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              {title}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {totalAssetsCount} items
            </span>
          </div>
        </div>

        {/* Center Search Bar */}
        <div className="relative flex-1 max-w-lg">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search assets, folders, tags, owners... (Press '/' to focus)"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-inner"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex absolute right-3 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 shadow-sm pointer-events-none">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Right Actions & Utilities */}
        <div className="flex items-center space-x-3 shrink-0">
          
          {/* Notifications button with badge */}
          <button 
            title="Notifications"
            className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-white dark:ring-slate-950" />
          </button>

          {/* Help button */}
          <button 
            title="DAM Documentation & Support"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white transition-colors hidden sm:block"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Prominent Upload Assets Button */}
          <Button
            onClick={onOpenUpload}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all rounded-xl px-4 py-2.5"
            leftIcon={<Plus className="w-4 h-4 stroke-[3]" />}
          >
            Upload Assets
          </Button>
        </div>

      </div>
    </header>
  );
}
