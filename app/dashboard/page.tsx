'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/dam/Sidebar';
import { Header } from '@/components/dam/Header';
import { StatsOverview } from '@/components/dam/StatsOverview';
import { AssetGrid } from '@/components/dam/AssetGrid';
import { AssetDetailsDrawer } from '@/components/dam/AssetDetailsDrawer';
import { UploadModal } from '@/components/dam/UploadModal';
import { CreateImadeoIdModal } from '@/components/dam/CreateImadeoIdModal';
import { WorkspaceSwitcher } from '@/components/dam/WorkspaceSwitcher';
import { getImadeoIdApi, createImadeoIdApi } from '@/services/imadeoService';
import { initialStats } from '@/components/dam/mockData';
import { 
  Asset, 
  NavCategory, 
  FilterCategory, 
  SortBy, 
  ViewMode,
  Workspace
} from '@/components/dam/types';
import { useWorkspaces, useAssets } from '@/hooks/useAssets';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, FolderOpen, Settings as SettingsIcon, Loader2, Layers } from 'lucide-react';

const EMPTY_WORKSPACES: Workspace[] = [];
const EMPTY_ASSETS: Asset[] = [];

export default function DashboardPage() {
  const { userId, getToken, isLoaded: isAuthLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Imadeo ID Check & Modal State
  const [imadeoId, setImadeoId] = useState<string | null>(null);
  const [isCheckingImadeoId, setIsCheckingImadeoId] = useState(true);
  const [showCreateImadeoModal, setShowCreateImadeoModal] = useState(false);

  // Navigation State
  const [activeNav, setActiveNav] = useState<NavCategory>('media-assets');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterCategory>('all');
  const [sortBy, setSortBy] = useState<SortBy>('updatedAt');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Tenant State from URL
  const activeTenantId = searchParams.get('ws') || imadeoId || '';

  // React Query Hooks
  const { data: workspaces = EMPTY_WORKSPACES } = useWorkspaces();
  const { data: fetchedAssets = EMPTY_ASSETS, isLoading: isLoadingAssets } = useAssets(activeTenantId);
  
  const [assets, setAssets] = useState<Asset[]>([]);
  useEffect(() => {
    setAssets(fetchedAssets);
  }, [fetchedAssets]);

  // Selected Items State
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Modals & Notifications
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => { setToastMessage(null); }, 3000);
  };

  // Check permanent Imadeo ID
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

  const handleNavSelect = (category: NavCategory) => {
    setActiveNav(category);
    if (category === 'favorites') setActiveTab('favorites');
    else if (category === 'media-assets' || category === 'overview') setActiveTab('all');
  };

  const handleToggleFavorite = (assetId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAssets(prev =>
      prev.map(asset => {
        if (asset.id === assetId) {
          const updatedState = !asset.isFavorite;
          triggerToast(updatedState ? `Added "${asset.name}" to Favorites` : `Removed "${asset.name}" from Favorites`);
          return { ...asset, isFavorite: updatedState };
        }
        return asset;
      })
    );
    if (selectedAsset && selectedAsset.id === assetId) {
      setSelectedAsset(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
  };

  const handleDeleteAsset = (assetId: string) => {
    const targetAsset = assets.find(a => a.id === assetId);
    setAssets(prev => prev.filter(a => a.id !== assetId));
    if (selectedAsset?.id === assetId) setSelectedAsset(null);
    triggerToast(`Moved "${targetAsset?.name || 'Asset'}" to Trash`);
  };

  const handleWorkspaceChange = (wsId: string) => {
    router.push(`?ws=${wsId}`);
  };

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const handleShareAsset = (item: Asset | string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const itemName = typeof item === 'string' ? item : item.name;
    const sharePrefix = imadeoId ? `@${imadeoId}` : 'imadeo';
    navigator.clipboard.writeText(`https://imadeo.io/${sharePrefix}/assets/share/${Date.now()}`);
    triggerToast(`Share link copied for "${itemName}"`);
  };

  const handleUploadSuccess = (newAsset: Asset) => {
    setAssets(prev => [newAsset, ...prev]);
    setSelectedAsset(newAsset);
    triggerToast(`Successfully uploaded "${newAsset.name}"`);
  };

  const favoritesCount = useMemo(() => assets.filter(a => a.isFavorite).length, [assets]);

  const pageTitle = useMemo(() => {
    switch (activeNav) {
      case 'overview': return 'DAM Overview';
      case 'collections': return 'Asset Collections';
      case 'shared': return 'Shared with Me';
      case 'recent': return 'Recent Activity';
      case 'favorites': return 'Favorites Library';
      case 'trash': return 'Trash & Archive';
      case 'settings': return 'DAM System Settings';
      default: return 'Media Assets';
    }
  }, [activeNav]);

  const breadcrumbs = useMemo(() => ['Home', pageTitle], [pageTitle]);
  
  const filteredAssets = useMemo(() => {
    return assets
      .filter(asset => {
        if (activeNav === 'favorites' || activeTab === 'favorites') {
          if (!asset.isFavorite) return false;
        } else if (activeTab !== 'all') {
          if (asset.type !== activeTab) return false;
        }
        if (activeNav === 'shared' && !asset.isShared) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = asset.name.toLowerCase().includes(q);
          const matchExt = asset.extension.toLowerCase().includes(q);
          return matchName || matchExt;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'size') return b.sizeBytes - a.sizeBytes;
        if (sortBy === 'type') return a.extension.localeCompare(b.extension);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [assets, activeTab, activeNav, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090a0f] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {isCheckingImadeoId && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center space-y-4 text-white">
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
          activeNav={activeNav}
          onSelectNav={handleNavSelect}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          favoritesCount={favoritesCount}
          imadeoId={imadeoId}
          activeTenantId={activeTenantId}
        />

        <main
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            isSidebarCollapsed ? 'pl-20' : 'pl-64'
          }`}
        >
          <Header
            title={pageTitle}
            breadcrumbs={breadcrumbs}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenUpload={() => setIsUploadOpen(true)}
            totalAssetsCount={filteredAssets.length}
          />

          <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
            
            <div className="flex justify-end">
              {workspaces.length > 0 && (
                <WorkspaceSwitcher
                  workspaces={workspaces}
                  activeWorkspaceId={activeTenantId}
                  onSelect={handleWorkspaceChange}
                />
              )}
            </div>

            {activeNav === 'settings' ? (
              <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
                <div className="flex items-center space-x-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <SettingsIcon className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold">DAM System Settings</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <h4 className="font-bold">Permanent Imadeo Handle</h4>
                    <p className="text-xs text-slate-400">Your permanent workspace handle: <span className="font-mono text-primary font-bold">@{imadeoId || 'not_set'}</span></p>
                    <span className="inline-block px-2 py-1 rounded bg-primary/10 text-primary font-semibold text-xs">Permanent</span>
                  </div>
                </div>
              </div>
            ) : assets.length === 0 && !isLoadingAssets ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-24 h-24 mb-6 relative">
                  <FolderOpen className="w-24 h-24 text-primary opacity-20 absolute inset-0" />
                  <Sparkles className="w-8 h-8 text-primary absolute bottom-0 right-0 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your library is empty</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                  Upload files to start organizing your assets.
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:bg-primary-dark transition-colors"
                  >
                    Upload Assets
                  </button>
                </div>
              </div>
            ) : (
              <>
                <StatsOverview stats={initialStats} />

                {isLoadingAssets ? (
                  <div className="flex items-center space-x-2 text-sm text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /><span>Loading assets...</span></div>
                ) : (
                  <AssetGrid
                    assets={filteredAssets}
                    selectedAssetId={selectedAsset?.id || null}
                    onSelectAsset={handleSelectAsset}
                    onToggleFavorite={handleToggleFavorite}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    searchQuery={searchQuery}
                    onShareAsset={(asset, e) => handleShareAsset(asset, e)}
                  />
                )}
              </>
            )}

          </div>
        </main>

        <AssetDetailsDrawer
          selectedAsset={selectedAsset}
          onClose={() => {
            setSelectedAsset(null);
          }}
          onToggleFavorite={(id) => handleToggleFavorite(id)}
          onDeleteAsset={handleDeleteAsset}
          onShare={handleShareAsset}
        />

      </div>

      <CreateImadeoIdModal
        isOpen={showCreateImadeoModal && !isCheckingImadeoId}
        onSubmit={handleCreateImadeoId}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        activeTenantId={activeTenantId}
      />

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl flex items-center space-x-3 text-sm font-semibold border border-slate-700/50"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
