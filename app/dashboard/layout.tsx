'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/dam/Sidebar';
import { CreateImadeoIdModal } from '@/components/dam/CreateImadeoIdModal';
import { UploadModal } from '@/components/dam/UploadModal';
import { getImadeoIdApi, createImadeoIdApi } from '@/services/imadeoService';
import { getApiToken } from '@/services/authToken';
import { useUploadStore } from '@/store/useUploadStore';
import { useTenantStore } from '@/store/useTenantStore';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { toast } from 'sonner';

function DashboardBootScreen({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center space-y-4 text-white">
      <div className="animate-pulse">
        <Logo href={false} showWordmark={false} size="xl" />
      </div>
      <div className="flex items-center space-x-2 text-sm font-medium text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <span>{message}</span>
      </div>
    </div>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
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

      if (fetchedForUserId.current === activeUserId) return;
      fetchedForUserId.current = activeUserId;

      if (isMounted) setIsCheckingImadeoId(true);
      try {
        const token = await getApiToken(getToken);
        const fetchedId = await getImadeoIdApi(token);
        if (!isMounted) return;

        if (fetchedId) {
          setImadeoId(fetchedId);
          setShowCreateImadeoModal(false);
        } else {
          setImadeoId(null);
          setShowCreateImadeoModal(true);
        }
      } catch {
        if (!isMounted) return;
        toast.error('Could not verify your Imadeo ID. Please try again.');
        setImadeoId(null);
        setShowCreateImadeoModal(false);
        fetchedForUserId.current = null;
      } finally {
        if (isMounted) setIsCheckingImadeoId(false);
      }
    };
    checkImadeoIdStatus();
    return () => {
      isMounted = false;
    };
  }, [isAuthLoaded, userId, user?.id, getToken, setImadeoId]);

  const handleCreateImadeoId = async (newId: string) => {
    try {
      const token = await getApiToken(getToken);
      await createImadeoIdApi(newId, token);
      setImadeoId(newId);
      setShowCreateImadeoModal(false);
      toast.success(`Imadeo ID "@${newId}" successfully created! Welcome to your DAM Dashboard.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create Imadeo ID';
      toast.error(message);
      throw err;
    }
  };

  const handleUploadSuccess = () => {
    toast.success('Successfully uploaded assets');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090a0f] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      {isCheckingImadeoId && (
        <DashboardBootScreen message="Connecting to Imadeo backend & verifying permanent workspace handle..." />
      )}

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeNav="overview"
          onSelectNav={() => {}}
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<DashboardBootScreen message="Loading workspace..." />}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
