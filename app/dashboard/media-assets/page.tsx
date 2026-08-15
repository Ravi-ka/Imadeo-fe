'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/dam/Header';
import { AssetGrid } from '@/components/dam/AssetGrid';
import { AssetDetailsDrawer } from '@/components/dam/AssetDetailsDrawer';
import { WorkspaceSwitcher } from '@/components/dam/WorkspaceSwitcher';
import {
  Asset, 
  FilterCategory,
  SortBy,
  ViewMode,
  Workspace
} from '@/components/dam/types';
import { useQueryClient } from '@tanstack/react-query';
import { useWorkspaces, useAssets, useDeleteAsset, useRenameAsset, useAssetDownloadUrl } from '@/hooks/useAssets';
import { FolderOpen, Sparkles, Loader2, Database, Upload, Share2, FileImage } from 'lucide-react';
import { useToastStore } from '@/store/useToastStore';
import { useUploadStore } from '@/store/useUploadStore';
import { useTenantStore } from '@/store/useTenantStore';

const EMPTY_WORKSPACES: Workspace[] = [];
const EMPTY_ASSETS: Asset[] = [];

export default function MediaAssetsPage() {
  const searchParams = useSearchParams();
  const { imadeoId } = useTenantStore();
  const activeTenantId = searchParams.get('ws') || imadeoId || '';

  // React Query Hooks
  const { data: workspaces = EMPTY_WORKSPACES } = useWorkspaces();
  const { data: fetchedAssets = EMPTY_ASSETS, isLoading: isLoadingAssets } = useAssets(activeTenantId);
  const { mutateAsync: deleteAsset } = useDeleteAsset(activeTenantId);
  const { mutateAsync: renameAsset } = useRenameAsset(activeTenantId);
  const { mutateAsync: getDownloadUrl } = useAssetDownloadUrl();
  const queryClient = useQueryClient();

  const activeWorkspace = Array.isArray(workspaces) ? workspaces.find(ws => ws.id === activeTenantId) : undefined;
  const isViewer = activeWorkspace?.role === 'VIEWER';

  // Navigation & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterCategory>('all');
  const [sortBy, setSortBy] = useState<SortBy>('updatedAt');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Selected Items State
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const { triggerToast } = useToastStore();
  const { openUpload } = useUploadStore();

  const handleToggleFavorite = (assetId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    queryClient.setQueryData(['assets', activeTenantId], (old: Asset[] | undefined) => {
      if (!old) return [];
      return old.map(asset => {
        if (asset.id === assetId) {
          const updatedState = !asset.isFavorite;
          triggerToast(updatedState ? `Added "${asset.name}" to Favorites` : `Removed "${asset.name}" from Favorites`);
          return { ...asset, isFavorite: updatedState };
        }
        return asset;
      });
    });
    
    if (selectedAsset && selectedAsset.id === assetId) {
      setSelectedAsset(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    const targetAsset = fetchedAssets.find(a => a.id === assetId);
    try {
      await deleteAsset(assetId);
      // useDeleteAsset already invalidates the query on success
      if (selectedAsset?.id === assetId) setSelectedAsset(null);
      triggerToast(`Permanently deleted "${targetAsset?.name || 'Asset'}"`);
    } catch (e: any) {
      triggerToast(`Failed to delete asset: ${e.message}`);
    }
  };

  const handleRenameAsset = async (assetId: string, newName: string) => {
    try {
      await renameAsset({ assetId, name: newName });
      // useRenameAsset already invalidates the query on success
      if (selectedAsset?.id === assetId) setSelectedAsset(prev => prev ? { ...prev, name: newName } : null);
      triggerToast(`Successfully renamed to "${newName}"`);
    } catch (e: any) {
      triggerToast(`Failed to rename: ${e.message}`);
    }
  };

  const handleDownloadAsset = async (assetId: string) => {
    try {
      const { downloadUrl } = await getDownloadUrl({ assetId, tenantId: activeTenantId });
      window.open(downloadUrl, "_blank");
    } catch (e: any) {
      triggerToast(`Failed to download: ${e.message}`);
    }
  };

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const handleShareAsset = (item: Asset | string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const itemName = typeof item === 'string' ? item : item.name;
    navigator.clipboard.writeText(`https://imadeo.io/share/${Date.now()}`);
    triggerToast(`Share link copied for "${itemName}"`);
  };

  const filteredAssets = useMemo(() => {
    return fetchedAssets
      .filter(asset => {
        if (activeTab === 'favorites') {
          if (!asset.isFavorite) return false;
        } else if (activeTab !== 'all') {
          if (asset.type !== activeTab) return false;
        }
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
  }, [fetchedAssets, activeTab, searchQuery, sortBy]);

  return (
    <>
      <Header
        title="Media Assets"
        breadcrumbs={['Home', 'Media Assets']}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenUpload={() => !isViewer && openUpload()}
        totalAssetsCount={filteredAssets.length}
        isViewer={isViewer}
      />

      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Top Action Bar */}
        <div className="flex justify-end">
          {Array.isArray(workspaces) && workspaces.length > 0 && (
            <WorkspaceSwitcher
              workspaces={workspaces}
              activeWorkspaceId={activeTenantId}
              onSelect={(wsId) => {
                 window.location.href = `?ws=${wsId}`;
              }}
            />
          )}
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Total Assets</p>
              <h3 className="text-2xl font-bold">{isLoadingAssets ? <Loader2 className="w-5 h-5 animate-spin" /> : fetchedAssets.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <FileImage className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1 flex items-center gap-2">Storage Used <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Placeholder</span></p>
              <h3 className="text-2xl font-bold">1.2 GB</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1 flex items-center gap-2">Shared Assets <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Placeholder</span></p>
              <h3 className="text-2xl font-bold">45</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Share2 className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1 flex items-center gap-2">Recent Uploads <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Placeholder</span></p>
              <h3 className="text-2xl font-bold">12</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Upload className="w-5 h-5" />
            </div>
          </div>
        </div>

        {fetchedAssets.length === 0 && !isLoadingAssets ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-24 h-24 mb-6 relative">
              <FolderOpen className="w-24 h-24 text-primary opacity-20 absolute inset-0" />
              <Sparkles className="w-8 h-8 text-primary absolute bottom-0 right-0 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your library is empty</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              Upload files to start organizing your assets.
            </p>
            <div className="flex items-center justify-center space-x-4">
              {!isViewer && (
                <button
                  onClick={openUpload}
                  className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:bg-primary-dark transition-colors"
                >
                  Upload Assets
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
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

      <AssetDetailsDrawer
        selectedAsset={selectedAsset}
        onClose={() => {
          setSelectedAsset(null);
        }}
        onToggleFavorite={(id) => handleToggleFavorite(id)}
        onDeleteAsset={handleDeleteAsset}
        onShare={handleShareAsset}
        onRenameAsset={handleRenameAsset}
        onDownloadAsset={handleDownloadAsset}
        isViewer={isViewer}
      />
    </>
  );
}
