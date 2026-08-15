'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/dam/Header';
import { AssetGrid } from '@/components/dam/AssetGrid';
import { AssetDetailsDrawer } from '@/components/dam/AssetDetailsDrawer';
import { Asset, FilterCategory, SortBy, ViewMode } from '@/components/dam/types';
import { Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAssets, useToggleFavourite } from '@/hooks/useAssets';
import { useQueryClient } from '@tanstack/react-query';
import { useToastStore } from '@/store/useToastStore';
import { useTenantStore } from '@/store/useTenantStore';

const EMPTY_ASSETS: Asset[] = [];

export default function FavoritesPage() {
  const searchParams = useSearchParams();
  const { imadeoId } = useTenantStore();
  const activeTenantId = searchParams.get('ws') || imadeoId || '';

  // React Query Hooks
  const { data: fetchedAssets = EMPTY_ASSETS, isLoading: isLoadingAssets } = useAssets(activeTenantId, true);
  const { mutateAsync: toggleFavourite } = useToggleFavourite(activeTenantId);
  const queryClient = useQueryClient();
  const { triggerToast } = useToastStore();
  
  // Navigation & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterCategory>('all');
  const [sortBy, setSortBy] = useState<SortBy>('updatedAt');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Selected Items State
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const handleToggleFavorite = async (assetId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Find the current asset state
    const currentAsset = queryClient.getQueryData<Asset[]>(['assets', activeTenantId, true])?.find(a => a.id === assetId);
    const isCurrentlyFavourite = currentAsset ? currentAsset.isFavorite : true; // In favourites tab, it's mostly true initially

    // Optimistically remove from favorites list
    queryClient.setQueryData(['assets', activeTenantId, true], (old: Asset[] | undefined) => {
      if (!old) return [];
      return old.filter(asset => asset.id !== assetId);
    });
    
    if (selectedAsset && selectedAsset.id === assetId) {
      setSelectedAsset(null);
    }
    
    // Also update main assets cache if it exists to keep in sync
    queryClient.setQueryData(['assets', activeTenantId, undefined], (old: Asset[] | undefined) => {
      if (!old) return old;
      return old.map(asset => asset.id === assetId ? { ...asset, isFavorite: !isCurrentlyFavourite } : asset);
    });

    triggerToast(`Removed from Favorites`);

    try {
      await toggleFavourite({ assetId, isCurrentlyFavourite });
    } catch (e: any) {
      // Rollback
      const isAlreadyUnstarredError = e.status === 404 && isCurrentlyFavourite && e.data?.error === 'Asset is not a favourite';
      if (!isAlreadyUnstarredError) {
        triggerToast(`Failed to update favorite status: ${e.message}`);
        
        // Re-add to favorites list
        if (currentAsset) {
          queryClient.setQueryData(['assets', activeTenantId, true], (old: Asset[] | undefined) => {
            if (!old) return [currentAsset];
            return [...old, currentAsset]; // simple append
          });
        }

        // Revert main assets cache
        queryClient.setQueryData(['assets', activeTenantId, undefined], (old: Asset[] | undefined) => {
          if (!old) return old;
          return old.map(asset => asset.id === assetId ? { ...asset, isFavorite: isCurrentlyFavourite } : asset);
        });
      }
    }
  };

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const filteredAssets = useMemo(() => {
    return fetchedAssets
      .filter(asset => {
        if (activeTab !== 'all') {
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
        title="Favorites"
        breadcrumbs={['Home', 'Favorites']}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenUpload={() => {}}
        totalAssetsCount={filteredAssets.length}
        isViewer={false}
      />

      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Favorites</h1>
          <p className="text-slate-500">Quickly access your most important and frequently used assets.</p>
        </div>

        {isLoadingAssets ? (
          <div className="flex items-center space-x-2 text-sm text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /><span>Loading favorites...</span></div>
        ) : fetchedAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-24 h-24 mb-6 relative">
              <Sparkles className="w-24 h-24 text-amber-400 opacity-20 absolute inset-0" />
              <ImageIcon className="w-8 h-8 text-amber-500 absolute bottom-0 right-0 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No favorites yet</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              Mark important assets as favorites to find them quickly here.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Link href="/dashboard/media-assets">
                <button className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:bg-primary-dark transition-colors">
                  Browse Media Assets
                </button>
              </Link>
            </div>
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
            onShareAsset={() => {}} // mock
          />
        )}
      </div>

      <AssetDetailsDrawer
        selectedAsset={selectedAsset}
        onClose={() => {
          setSelectedAsset(null);
        }}
        onToggleFavorite={(id) => handleToggleFavorite(id)}
        onDeleteAsset={async () => {}} // mock
        onShare={() => {}} // mock
        onRenameAsset={async () => {}} // mock
        onDownloadAsset={async () => {}} // mock
        isViewer={false}
      />
    </>
  );
}
