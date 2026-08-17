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
import { useWorkspaces, useAssets, useDeleteAsset, useRenameAsset, useAssetDownloadUrl, useToggleFavourite } from '@/hooks/useAssets';
import { useDebounce } from '@/hooks/useDebounce';
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

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterCategory>('all');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filters = useMemo(() => ({
    favourite: activeTab === 'favorites' ? true : undefined,
    type: activeTab !== 'all' && activeTab !== 'favorites' ? activeTab : undefined,
    search: debouncedSearch || undefined,
    status: 'READY'
  }), [activeTab, debouncedSearch]);

  // React Query Hooks
  const { data: workspaces = EMPTY_WORKSPACES } = useWorkspaces();
  const { 
    data: assetsData, 
    isLoading: isLoadingAssets,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useAssets(activeTenantId, filters);

  const fetchedAssets = useMemo(() => {
    if (!assetsData) return EMPTY_ASSETS;
    return assetsData.pages.flatMap(page => page.items);
  }, [assetsData]);
  const { mutateAsync: deleteAsset } = useDeleteAsset(activeTenantId);
  const { mutateAsync: renameAsset } = useRenameAsset(activeTenantId);
  const { mutateAsync: getDownloadUrl } = useAssetDownloadUrl();
  const queryClient = useQueryClient();

  const activeWorkspace = Array.isArray(workspaces) ? workspaces.find(ws => ws.id === activeTenantId) : undefined;
  const isViewer = activeWorkspace?.role === 'VIEWER';

  // Navigation & Filter State
  const [sortBy, setSortBy] = useState<SortBy>('updatedAt');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Selected Items State
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const { triggerToast } = useToastStore();
  const { openUpload } = useUploadStore();

  const { mutateAsync: toggleFavourite } = useToggleFavourite(activeTenantId);

  const handleToggleFavorite = async (assetId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Find the current asset state
    const currentAsset = fetchedAssets.find(a => a.id === assetId);
    const isCurrentlyFavourite = currentAsset ? currentAsset.isFavorite : false;
    
    // Optimistic update
    queryClient.setQueryData(['assets', activeTenantId, undefined], (old: any) => {
      if (!old || !old.pages) return old;
      return {
        ...old,
        pages: old.pages.map((page: any) => ({
          ...page,
          items: page.items.map((asset: Asset) => {
            if (asset.id === assetId) {
              const updatedState = !asset.isFavorite;
              triggerToast(updatedState ? `Added "${asset.name}" to Favorites` : `Removed "${asset.name}" from Favorites`);
              return { ...asset, isFavorite: updatedState };
            }
            return asset;
          })
        }))
      };
    });
    
    if (selectedAsset && selectedAsset.id === assetId) {
      setSelectedAsset(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
    
    try {
      await toggleFavourite({ assetId, isCurrentlyFavourite });
      // We don't necessarily need to refetch all assets just for a favourite toggle.
    } catch (e: any) {
      // Revert optimistic update on failure, ignore if it was a 409 or 404 from double-toggle
      const isAlreadyStarredError = e.status === 409 && !isCurrentlyFavourite;
      const isAlreadyUnstarredError = e.status === 404 && isCurrentlyFavourite && e.data?.error === 'Asset is not a favourite';
      
      if (!isAlreadyStarredError && !isAlreadyUnstarredError) {
        triggerToast(`Failed to update favorite status: ${e.message}`);
        queryClient.setQueryData(['assets', activeTenantId, undefined], (old: any) => {
          if (!old || !old.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((asset: Asset) => {
                if (asset.id === assetId) {
                  return { ...asset, isFavorite: isCurrentlyFavourite };
                }
                return asset;
              })
            }))
          };
        });
        if (selectedAsset && selectedAsset.id === assetId) {
          setSelectedAsset(prev => prev ? { ...prev, isFavorite: isCurrentlyFavourite } : null);
        }
      }
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

  const memberships = (workspaces as any)?.memberships || [];
  const currentMembership = memberships.find((m: any) => m.tenant?.id === activeTenantId) || memberships[0];
  const storageUsedBytes = parseInt(currentMembership?.tenant?.storageUsed || '0', 10);
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };
  
  const storageUsedFormatted = formatBytes(storageUsedBytes);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    fetchedAssets.forEach(asset => {
      if (asset.extension) {
        const ext = asset.extension.toLowerCase();
        counts[ext] = (counts[ext] || 0) + 1;
      }
    });
    return counts;
  }, [fetchedAssets]);

  const filteredAssets = useMemo(() => {
    return [...fetchedAssets]
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'size') return b.sizeBytes - a.sizeBytes;
        if (sortBy === 'type') return a.extension.localeCompare(b.extension);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [fetchedAssets, sortBy]);

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

        {/* Summary Cards */}
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
              <p className="text-sm text-slate-500 font-medium mb-1">Storage Used</p>
              <h3 className="text-2xl font-bold">{storageUsedFormatted}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Database className="w-5 h-5" />
            </div>
          </div>

          <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center min-h-[90px]">
            <p className="text-sm text-slate-500 font-medium mb-2">Asset Types</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(typeCounts).length > 0 ? (
                Object.entries(typeCounts).map(([ext, count]) => (
                  <div key={ext} className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                    <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">{ext}</span>
                    <span className="text-[10px] bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-md text-slate-500 font-bold">{count}</span>
                  </div>
                ))
              ) : (
                <span className="text-sm text-slate-400">No assets yet</span>
              )}
            </div>
          </div>
        </div>

        {isLoadingAssets && fetchedAssets.length === 0 ? (
          <div className="flex items-center justify-center py-24 space-x-2 text-sm text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading assets...</span>
          </div>
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
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            isEmptyLibrary={fetchedAssets.length === 0 && activeTab === 'all' && !searchQuery.trim()}
            onOpenUpload={openUpload}
            isViewer={isViewer}
          />
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
