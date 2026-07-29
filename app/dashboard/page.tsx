'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/dam/Sidebar';
import { Header } from '@/components/dam/Header';
import { StatsOverview } from '@/components/dam/StatsOverview';
import { FolderSection } from '@/components/dam/FolderSection';
import { AssetGrid } from '@/components/dam/AssetGrid';
import { AssetDetailsDrawer } from '@/components/dam/AssetDetailsDrawer';
import { UploadModal } from '@/components/dam/UploadModal';
import { CreateImadeoIdModal } from '@/components/dam/CreateImadeoIdModal';
import { WorkspaceSwitcher } from '@/components/dam/WorkspaceSwitcher';
import { Breadcrumb } from '@/components/dam/Breadcrumb';
import { getImadeoIdApi, createImadeoIdApi } from '@/services/imadeoService';
import { initialStats } from '@/components/dam/mockData';
import { 
  Asset, 
  Folder, 
  NavCategory, 
  FilterCategory, 
  SortBy, 
  ViewMode,
  Workspace
} from '@/components/dam/types';
import { useWorkspaces, useFolders, useAssets, useMoveAsset, useFolderTree, useCreateFolder } from '@/hooks/useFolders';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, FolderOpen, ArrowLeft, Settings as SettingsIcon, Loader2, Layers, Plus } from 'lucide-react';
import { CreateFolderModal } from '@/components/dam/CreateFolderModal';

const EMPTY_WORKSPACES: Workspace[] = [];
const EMPTY_FOLDERS: Folder[] = [];
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

  // Tenant and Folder State from URL
  const activeTenantId = searchParams.get('ws') || imadeoId || '';
  const currentFolderId = searchParams.get('folder') || null;

  // React Query Hooks
  const { data: workspaces = EMPTY_WORKSPACES } = useWorkspaces();
  const { data: fetchedFolders = EMPTY_FOLDERS, isLoading: isLoadingFolders } = useFolders(activeTenantId, currentFolderId);
  const { data: fetchedAssets = EMPTY_ASSETS, isLoading: isLoadingAssets } = useAssets(activeTenantId, currentFolderId);
  const { data: treeFolders = EMPTY_FOLDERS } = useFolderTree(activeTenantId);
  const moveAssetMut = useMoveAsset();
  const createFolderMut = useCreateFolder();
  
  // For breadcrumbs, we need the path. The easiest way is to use the tree or keep track of the current folder.
  const currentFolder = useMemo(() => {
    if (!currentFolderId) return null;
    return treeFolders.find(f => f.id === currentFolderId) || null;
  }, [currentFolderId, treeFolders]);

  const [assets, setAssets] = useState<Asset[]>([]);
  useEffect(() => {
    setAssets(fetchedAssets);
  }, [fetchedAssets]);

  const folders = fetchedFolders as Folder[];

  // Selected Items State
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

  // Modals & Notifications
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
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

  const handleMoveAsset = async (assetId: string) => {
    const targetFolder = prompt('Enter destination folder UUID (or leave blank for root):');
    if (targetFolder === null) return;
    try {
      await moveAssetMut.mutateAsync({ tenantId: activeTenantId, id: assetId, folderId: targetFolder.trim() || null });
      triggerToast('Asset moved successfully.');
      if (selectedAsset?.id === assetId) setSelectedAsset(null);
    } catch (e) {
      alert('Failed to move asset');
    }
  };

  const handleCreateFolder = async (name: string) => {
    await createFolderMut.mutateAsync({ tenantId: activeTenantId, name, parentId: currentFolderId });
    triggerToast(`Created folder "${name}"`);
    setIsCreateFolderOpen(false);
  };

  const handleSelectFolder = (folder: Folder) => {
    setSelectedFolder(folder);
    setSelectedAsset(null);
  };

  const handleOpenFolder = (folder: Folder) => {
    router.push(`?ws=${activeTenantId}&folder=${folder.id}`);
  };

  const handleNavigateBreadcrumb = (folderId: string | null) => {
    if (folderId) {
      router.push(`?ws=${activeTenantId}&folder=${folderId}`);
    } else {
      router.push(`?ws=${activeTenantId}`);
    }
  };

  const handleWorkspaceChange = (wsId: string) => {
    router.push(`?ws=${wsId}`);
  };

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setSelectedFolder(null);
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
    setSelectedFolder(null);
    triggerToast(`Successfully uploaded "${newAsset.name}"`);
  };

  const favoritesCount = useMemo(() => assets.filter(a => a.isFavorite).length, [assets]);

  const pageTitle = useMemo(() => {
    switch (activeNav) {
      case 'overview': return 'DAM Overview';
      case 'collections': return 'Asset Collections';
      case 'folders': return 'Folder Directory';
      case 'shared': return 'Shared with Me';
      case 'recent': return 'Recent Activity';
      case 'favorites': return 'Favorites Library';
      case 'trash': return 'Trash & Archive';
      case 'settings': return 'DAM System Settings';
      default: return 'Media Assets';
    }
  }, [activeNav]);

  const breadcrumbs = useMemo(() => ['Home', pageTitle], [pageTitle]);
  
  const currentPathText = useMemo(() => {
    if (!currentFolder) return 'Media Assets (Root)';
    
    const p = [];
    let curr: Folder | undefined = currentFolder;
    while (curr) {
      p.unshift(curr.name);
      curr = treeFolders.find(f => f.id === curr!.parentId);
    }
    return `Media Assets / ${p.join(' / ')}`;
  }, [currentFolder, treeFolders]);

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

  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return folders;
    const q = searchQuery.toLowerCase();
    return folders.filter(f => f.name.toLowerCase().includes(q));
  }, [folders, searchQuery]);

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
            onOpenCreateFolder={() => setIsCreateFolderOpen(true)}
            totalAssetsCount={filteredAssets.length}
          />

          <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
            
            <div className="flex items-center justify-between">
              <Breadcrumb 
                currentFolder={currentFolder} 
                folders={folders} 
                onNavigate={handleNavigateBreadcrumb} 
              />
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
            ) : folders.length === 0 && assets.length === 0 && !isLoadingFolders && !isLoadingAssets ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-24 h-24 mb-6 relative">
                  <FolderOpen className="w-24 h-24 text-primary opacity-20 absolute inset-0" />
                  <Sparkles className="w-8 h-8 text-primary absolute bottom-0 right-0 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">This folder is empty</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                  Upload files or create a new folder to start organizing your assets.
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:bg-primary-dark transition-colors"
                  >
                    Upload Assets
                  </button>
                  <button
                    onClick={() => setIsCreateFolderOpen(true)}
                    className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-2.5 rounded-xl font-semibold shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                  >
                    <FolderOpen className="w-4 h-4" /> Create Folder
                  </button>
                </div>
              </div>
            ) : (
              <>
                {!currentFolderId && <StatsOverview stats={initialStats} />}

                {isLoadingFolders ? (
                  <div className="flex items-center space-x-2 text-sm text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /><span>Loading folders...</span></div>
                ) : (
                  <FolderSection
                    folders={filteredFolders}
                    selectedFolderId={selectedFolder?.id || null}
                    onSelectFolder={handleSelectFolder}
                    onOpenFolder={handleOpenFolder}
                    activeTenantId={activeTenantId}
                    currentFolderId={currentFolderId}
                  />
                )}

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
          selectedFolder={selectedFolder}
          onClose={() => {
            setSelectedAsset(null);
            setSelectedFolder(null);
          }}
          onToggleFavorite={(id) => handleToggleFavorite(id)}
          onDeleteAsset={handleDeleteAsset}
          onShare={handleShareAsset}
          onMoveAsset={handleMoveAsset}
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
        currentFolderId={currentFolderId}
        currentPathText={currentPathText}
      />

      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        onCreate={handleCreateFolder}
        currentPathText={currentPathText}
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
