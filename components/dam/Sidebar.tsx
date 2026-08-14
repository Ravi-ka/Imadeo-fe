'use client';

import React, { useState } from 'react';
import { 
  Layers, 
  LayoutDashboard, 
  Image as ImageIcon, 
  Boxes, 
  Users, 
  Clock, 
  Star, 
  Trash2, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  LogOut,
  UserCheck,
  Sparkles,
  AtSign,
  ChartNoAxesCombined,
  Zap,
  Images
} from 'lucide-react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useAuthStore } from '@/store/useAuthStore';
import { NavCategory } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspaces } from '@/hooks/useAssets';

interface SidebarProps {
  activeNav: NavCategory;
  onSelectNav: (category: NavCategory) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  favoritesCount: number;
  imadeoId?: string | null;
  activeTenantId?: string;
}

export function Sidebar({ 
  activeNav, 
  onSelectNav, 
  isCollapsed, 
  onToggleCollapse,
  favoritesCount,
  imadeoId,
  activeTenantId
}: SidebarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();

  const userName = isLoaded && user
    ? (user.fullName || user.username || user.primaryEmailAddress?.emailAddress.split('@')[0] || 'Alex Morgan')
    : 'Alex Morgan';

  const userEmail = isLoaded && user?.primaryEmailAddress?.emailAddress
    ? user.primaryEmailAddress.emailAddress
    : 'alex.m@imadeo.io';

  const userAvatar = isLoaded && user?.imageUrl
    ? user.imageUrl
    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

  const { data: workspacesData } = useWorkspaces();
  const memberships = (workspacesData as any)?.memberships || [];
  const currentMembership = memberships.find((m: any) => m.tenant.id === activeTenantId) || memberships[0];

  const storageUsedBytes = parseInt(currentMembership?.tenant?.storageUsed || '0', 10);
  const storageQuotaBytes = parseInt(currentMembership?.tenant?.storageQuota || '5368709120', 10); // 5GB default
  const storagePercentage = Math.min((storageUsedBytes / storageQuotaBytes) * 100, 100).toFixed(1);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const storageUsedFormatted = formatBytes(storageUsedBytes);
  const storageQuotaFormatted = formatBytes(storageQuotaBytes);

  const navItems: { id: NavCategory; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'media-assets', label: 'Media Assets', icon: <Images className="w-5 h-5" />, badge: '1,482' },
    { id: 'image-converter', label: 'Image Converter', icon: <Boxes className="w-5 h-5" /> },
    { id: 'usage-analytics', label: 'Usage & Analytics', icon: <ChartNoAxesCombined className="w-5 h-5" /> },
    { id: 'favorites', label: 'Favorites', icon: <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400/20" />, badge: favoritesCount > 0 ? favoritesCount : undefined },
    { id: 'integrations', label: 'Integrartions', icon: <Zap className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 h-screen flex flex-col border-r border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Floating Collapse/Expand Button on Right Edge */}
      <button
        onClick={onToggleCollapse}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3.5 top-5 w-7 h-7 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all z-40 hover:scale-110"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Brand Header */}
      <div className={`flex items-center h-16 border-b border-slate-200/60 dark:border-slate-800/60 ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
        <div className={`flex items-center space-x-3 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary via-secondary to-accent flex items-center justify-center text-white shadow-md shadow-primary/20 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col overflow-hidden whitespace-nowrap"
            >
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                  Imadeo
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light border border-primary/20">
                  DAM
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                Asset Hub
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Imadeo Space
          </div>
        )}

        {navItems.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => onSelectNav(item.id)}
                className={`w-full flex items-center h-11 rounded-xl px-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/25 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:text-slate-900 dark:hover:text-white'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <span className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-primary dark:group-hover:text-primary-light'}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>

                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>

              {/* Tooltip for collapsed sidebar */}
              {isCollapsed && (
                <div className="fixed left-20 ml-2 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium rounded-md shadow-xl border border-slate-700 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                  {item.label}
                  {item.badge !== undefined && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full bg-primary text-[10px]">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Storage Indicator Widget when expanded */}
      {!isCollapsed && (
        <div className="mx-3 my-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-secondary" /> Storage Plan
            </span>
            <span>{storageUsedFormatted} / {storageQuotaFormatted}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-500 ease-in-out" style={{ width: `${storagePercentage}%` }} />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
            <span>Free Plan</span>
            <button className="text-primary hover:underline font-semibold">Upgrade</button>
          </div>
        </div>
      )}

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-200/60 dark:border-slate-800/60 relative">
        <div 
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`flex items-center p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900/80 cursor-pointer transition-colors ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="relative shrink-0">
              <img
                src={userAvatar}
                alt={userName}
                className="w-9 h-9 rounded-full object-cover border-2 border-primary/40"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-950" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden text-left">
                <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {userName}
                </span>
                <span className="text-xs font-mono font-medium text-primary dark:text-primary-light truncate flex items-center gap-0.5">
                  {imadeoId ? `@${imadeoId}` : '@no_id_set'}
                </span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <MoreVertical className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-white" />
          )}
        </div>

        {/* User Popover Menu */}
        <AnimatePresence>
          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`absolute bottom-16 ${
                isCollapsed ? 'left-16' : 'left-3 right-3'
              } bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 space-y-1 min-w-[200px]`}
            >
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{userName}</p>
                <p className="text-[11px] font-mono text-primary font-semibold">@{imadeoId || 'no_id_set'}</p>
                <p className="text-[11px] text-slate-400 truncate">{userEmail}</p>
              </div>
              <button 
                onClick={() => {
                  setShowUserMenu(false);
                  if (openUserProfile) {
                    openUserProfile();
                  } else {
                    onSelectNav('settings');
                  }
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <UserCheck className="w-4 h-4 text-primary" />
                <span>Account Profile</span>
              </button>
              <button 
                onClick={() => {
                  setShowUserMenu(false);
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('imadeo_token');
                    localStorage.removeItem('imadeo_user');
                    sessionStorage.clear();
                  }
                  useAuthStore.getState().logout();
                  signOut({ redirectUrl: '/login' });
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-danger hover:bg-danger/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 text-danger" />
                <span>Sign Out</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
