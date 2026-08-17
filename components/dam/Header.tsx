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
  UploadCloud,
  ChevronDown,
  FolderUp
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  title: string;
  breadcrumbs: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenUpload: () => void;
  selectedCount?: number;
  totalAssetsCount: number;
  isViewer?: boolean;
}

export function Header({
  title,
  breadcrumbs,
  searchQuery,
  onSearchChange,
  onOpenUpload,
  selectedCount = 0,
  totalAssetsCount,
  isViewer = false
}: HeaderProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const [isUploadDropdownOpen, setIsUploadDropdownOpen] = React.useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsUploadDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut listener to focus search on '/' keypress
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && document.activeElement !== mobileSearchInputRef.current) {
        e.preventDefault();
        if (window.innerWidth < 768) {
          setIsMobileSearchOpen(true);
          setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
        } else {
          searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 py-3 sm:py-4">
      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute inset-0 z-30 bg-white dark:bg-slate-950 px-4 py-3 flex items-center gap-2 md:hidden"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search assets..."
                className="w-full pl-10 pr-10 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-2.5 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => {
                setIsMobileSearchOpen(false);
                if (!searchQuery) onSearchChange('');
              }}
              className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-4">
        
        {/* Title & Breadcrumbs */}
        <div className="space-y-0.5 sm:space-y-1">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-1 text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate max-w-[150px] sm:max-w-none">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={`${crumb}-${idx}`}>
                {idx > 0 && <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />}
                <span className={idx === breadcrumbs.length - 1 ? 'text-primary dark:text-primary-light font-semibold truncate' : 'hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer truncate'}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </nav>

          {/* Title */}
          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 truncate">
              {title}
            </h1>
          </div>
        </div>

        {/* Center Desktop Search Bar */}
        <div className="hidden md:flex relative flex-1 max-w-lg">
          <div className="relative flex items-center w-full">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search assets, tags, owners... (Press '/' to focus)"
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
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          
          {/* Mobile Search Toggle */}
          <button
            onClick={() => {
              setIsMobileSearchOpen(true);
              setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
            }}
            title="Search"
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications button with badge */}
          <button 
            title="Notifications"
            className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white transition-colors hidden sm:block"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary ring-2 ring-white dark:ring-slate-950" />
          </button>

          {/* Help button */}
          <button 
            title="DAM Documentation & Support"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white transition-colors hidden md:block"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Conditional Upload Button */}
            {!isViewer && (
              <div className="relative" ref={dropdownRef}>
                <div className="flex items-stretch h-9 sm:h-10">
                  <button
                    onClick={onOpenUpload}
                    className="flex items-center justify-center space-x-1.5 sm:space-x-2 bg-gradient-to-r from-primary to-secondary text-white px-3 sm:px-5 rounded-l-xl font-bold shadow-lg shadow-primary/20 hover:opacity-95 transition-opacity"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span className="hidden sm:inline">Upload</span>
                  </button>
                  <button
                    onClick={() => setIsUploadDropdownOpen(!isUploadDropdownOpen)}
                    className="bg-gradient-to-r from-primary to-secondary text-white px-2 sm:px-3 rounded-r-xl border-l border-white/20 hover:opacity-95 transition-opacity flex items-center justify-center shadow-lg shadow-primary/20"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Upload Dropdown */}
                <AnimatePresence>
                  {isUploadDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden py-1 z-50"
                    >
                      <button 
                        onClick={() => { setIsUploadDropdownOpen(false); onOpenUpload(); }}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left text-sm text-slate-700 dark:text-slate-200 transition-colors"
                      >
                        <UploadCloud className="w-4 h-4 text-primary" />
                        <span>Upload Files</span>
                      </button>
                      <button 
                        onClick={() => { setIsUploadDropdownOpen(false); onOpenUpload(); }}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left text-sm text-slate-700 dark:text-slate-200 transition-colors"
                      >
                        <FolderUp className="w-4 h-4 text-emerald-500" />
                        <span>Upload Folder</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            {/* User Profile Hook/Clerk Component */}
          </div>
        </div>

      </div>
    </header>
  );
}
