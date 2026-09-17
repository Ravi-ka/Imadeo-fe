'use client';

import React, { Suspense, useState, useEffect, useRef, useCallback } from 'react';
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
import { Button } from '@/components/ui/Button';
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

function DashboardIdCheckError({
  onRetry,
  onCreate,
  canCreate,
}: {
  onRetry: () => void;
  onCreate: () => void;
  canCreate: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center space-y-5 text-white px-6">
      <Logo href={false} showWordmark={false} size="xl" />
      <div className="text-center max-w-sm space-y-2">
        <h2 className="text-lg font-semibold">Could not verify your Imadeo ID</h2>
        <p className="text-sm text-slate-400">
          Check your connection and try again. You can also set up an Imadeo ID if you do not have one yet.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button onClick={onRetry}>Try again</Button>
        {canCreate && (
          <Button
            variant="outline"
            onClick={onCreate}
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            Set up Imadeo ID
          </Button>
        )}
      </div>
    </div>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { userId, getToken, isLoaded: isAuthLoaded } = useAuth();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const { imadeoId, setImadeoId, clearTenant } = useTenantStore();

  const [isCheckingImadeoId, setIsCheckingImadeoId] = useState(true);
  const [idCheckError, setIdCheckError] = useState(false);
  const [showCreateImadeoModal, setShowCreateImadeoModal] = useState(false);
  const [createFromError, setCreateFromError] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const activeTenantId = searchParams.get('ws') || imadeoId || '';

  const { isUploadOpen, closeUpload } = useUploadStore();

  const fetchedForUserId = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const checkImadeoIdStatus = useCallback(async () => {
    if (!isAuthLoaded) return;

    const activeUserId = userId || user?.id;

    if (!activeUserId) {
      if (isMountedRef.current) {
        clearTenant();
        setShowCreateImadeoModal(false);
        setCreateFromError(false);
        setIdCheckError(false);
        setIsCheckingImadeoId(false);
        fetchedForUserId.current = null;
      }
      return;
    }

    const storedOwnerId = useTenantStore.getState().ownerUserId;
    if (storedOwnerId && storedOwnerId !== activeUserId) {
      clearTenant();
    }

    if (fetchedForUserId.current === activeUserId) return;
    fetchedForUserId.current = activeUserId;

    if (isMountedRef.current) {
      setIsCheckingImadeoId(true);
      setIdCheckError(false);
    }

    try {
      const token = await getApiToken(getToken);
      const fetchedId = await getImadeoIdApi(token);
      if (!isMountedRef.current) return;

      if (fetchedId) {
        setImadeoId(fetchedId, activeUserId);
        setShowCreateImadeoModal(false);
        setCreateFromError(false);
      } else {
        setImadeoId(null);
        setCreateFromError(false);
        setShowCreateImadeoModal(true);
      }
      setIdCheckError(false);
    } catch {
      if (!isMountedRef.current) return;
      toast.error('Could not verify your Imadeo ID. Please try again.');
      setIdCheckError(true);
      setShowCreateImadeoModal(false);
      fetchedForUserId.current = null;
    } finally {
      if (isMountedRef.current) setIsCheckingImadeoId(false);
    }
  }, [isAuthLoaded, userId, user?.id, getToken, setImadeoId, clearTenant]);

  useEffect(() => {
    void checkImadeoIdStatus();
  }, [checkImadeoIdStatus]);

  const handleRetryImadeoIdCheck = () => {
    fetchedForUserId.current = null;
    void checkImadeoIdStatus();
  };

  const handleOpenCreateFromError = () => {
    setIdCheckError(false);
    setCreateFromError(true);
    setShowCreateImadeoModal(true);
  };

  const handleCancelCreateFromError = () => {
    setShowCreateImadeoModal(false);
    setCreateFromError(false);
    setIdCheckError(true);
  };

  const handleCreateImadeoId = async (newId: string) => {
    const activeUserId = userId || user?.id;
    try {
      const token = await getApiToken(getToken);
      await createImadeoIdApi(newId, token);
      setImadeoId(newId, activeUserId);
      setShowCreateImadeoModal(false);
      setCreateFromError(false);
      setIdCheckError(false);
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

      {idCheckError && !isCheckingImadeoId && !showCreateImadeoModal && (
        <DashboardIdCheckError
          onRetry={handleRetryImadeoIdCheck}
          onCreate={handleOpenCreateFromError}
          canCreate={!imadeoId}
        />
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
        onCancel={createFromError ? handleCancelCreateFromError : undefined}
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
