'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/dam/Sidebar';
import { CreateImadeoIdModal } from '@/components/dam/CreateImadeoIdModal';
import { UploadModal } from '@/components/dam/UploadModal';
import { getImadeoIdApi, createImadeoIdApi } from '@/services/imadeoService';
import { useUploadStore } from '@/store/useUploadStore';
import { useTenantStore } from '@/store/useTenantStore';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { toast } from 'sonner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId, getToken, isLoaded: isAuthLoaded } = useAuth();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const { imadeoId, setImadeoId } = useTenantStore();
  
  const [isCheckingImadeoId, setIsCheckingImadeoId] = useState(true);
  const [showCreateImadeoModal, setShowCreateImadeoModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const activeTenantId = searchParams.get('ws') || imadeoId || '';

  const { isUploadOpen, closeUpload } = useUploadStore();

  const fetchedForUserId = useRef<string | null>(null);

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
          fetchedForUserId.current = null;
        }
        return;
      }

      // Prevent duplicate fetches for the same user (e.g., due to Strict Mode or dependency changes)
      if (fetchedForUserId.current === activeUserId) return;
      fetchedForUserId.current = activeUserId;

      if (isMounted) setIsCheckingImadeoId(true);
      try {
        const token = await getToken();
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
        // Reset the ref on failure so it can be retried if dependencies change
        fetchedForUserId.current = null;
      } finally {
        if (isMounted) setIsCheckingImadeoId(false);
      }
    };
    checkImadeoIdStatus();
    return () => { isMounted = false; };
  }, [isAuthLoaded, userId, user?.id, getToken]);

  const handleCreateImadeoId = async (newId: string) => {
    const token = await getToken();
    await createImadeoIdApi(newId, token);
    setImadeoId(newId);
    setShowCreateImadeoModal(false);
    toast.success(`Imadeo ID "@${newId}" successfully created! Welcome to your DAM Dashboard.`);
  };

  const handleUploadSuccess = () => {
    toast.success(`Successfully uploaded assets`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090a0f] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      {isCheckingImadeoId && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center space-y-4 text-white">
          <div className="animate-pulse">
            <Logo href={false} showWordmark={false} size="xl" />
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
    </div>
  );
}
