'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/dam/Sidebar';
import { CreateImadeoIdModal } from '@/components/dam/CreateImadeoIdModal';
import { UploadModal } from '@/components/dam/UploadModal';
import { getImadeoIdApi, createImadeoIdApi } from '@/services/imadeoService';
import { useToastStore } from '@/store/useToastStore';
import { useUploadStore } from '@/store/useUploadStore';
import { useTenantStore } from '@/store/useTenantStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Layers } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAssets } from '@/hooks/useAssets';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId, getToken, isLoaded: isAuthLoaded } = useAuth();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const { imadeoId, setImadeoId } = useTenantStore();
  
  const [isCheckingImadeoId, setIsCheckingImadeoId] = useState(true);
  const [showCreateImadeoModal, setShowCreateImadeoModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const activeTenantId = searchParams.get('ws') || imadeoId || '';

  const { message: toastMessage, triggerToast } = useToastStore();
  const { isUploadOpen, closeUpload } = useUploadStore();

  useEffect(() => {
    let isMounted = true;
    const checkImadeoIdStatus = async () => {
      if (!isAuthLoaded) return;
      const activeUserId = userId || user?.id;
      if (!activeUserId) {
        if (isMounted) {
          setImadeoId(null);
          setShowCreateImadeoModal(false);
          setIsCheckingImadeoId(false);
        }
        return;
      }
      if (isMounted) setIsCheckingImadeoId(true);
      try {
        const token = await getToken({ skipCache: true });
        const fetchedId = await getImadeoIdApi(token);
        if (!isMounted) return;
        if (fetchedId) {
          setImadeoId(fetchedId);
          setShowCreateImadeoModal(false);
        } else {
          setImadeoId(null);
          setShowCreateImadeoModal(true);
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.warn('Backend Imadeo ID check error:', err?.message);
        setImadeoId(null);
        setShowCreateImadeoModal(true);
      } finally {
        if (isMounted) setIsCheckingImadeoId(false);
      }
    };
    checkImadeoIdStatus();
    return () => { isMounted = false; };
  }, [isAuthLoaded, userId, user?.id, getToken]);

  const handleCreateImadeoId = async (newId: string) => {
    const token = await getToken({ skipCache: true });
    await createImadeoIdApi(newId, token);
    setImadeoId(newId);
    setShowCreateImadeoModal(false);
    triggerToast(`Imadeo ID "@${newId}" successfully created! Welcome to your DAM Dashboard.`);
  };

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['assets', activeTenantId] });
    triggerToast(`Successfully uploaded assets`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090a0f] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      {isCheckingImadeoId && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center space-y-4 text-white">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary via-secondary to-accent flex items-center justify-center shadow-lg shadow-primary/40 animate-pulse">
            <Layers className="w-6 h-6" />
          </div>
          <div className="flex items-center space-x-2 text-sm font-medium text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>Connecting to Imadeo backend & verifying permanent workspace handle...</span>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeNav="overview" // Will be ignored because Sidebar will read usePathname internally
          onSelectNav={() => {}} // Will be ignored
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          imadeoId={imadeoId}
          activeTenantId={activeTenantId}
        />

        <main
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            isSidebarCollapsed ? 'pl-20' : 'pl-64'
          }`}
        >
          {children}
        </main>
      </div>

      <CreateImadeoIdModal
        isOpen={showCreateImadeoModal && !isCheckingImadeoId}
        onSubmit={handleCreateImadeoId}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={closeUpload}
        onUploadSuccess={handleUploadSuccess}
        activeTenantId={activeTenantId}
      />

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl flex items-center space-x-3 text-sm font-semibold border border-slate-700/50"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
