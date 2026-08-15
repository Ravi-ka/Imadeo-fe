'use client';

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/dam/Header';
import { AssetGrid } from '@/components/dam/AssetGrid';
import { AssetDetailsDrawer } from '@/components/dam/AssetDetailsDrawer';
import { Asset, FilterCategory, SortBy, ViewMode } from '@/components/dam/types';
import { Sparkles, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

// Mock data for favorites
const mockFavorites: Asset[] = [
  {
    id: 'fav-1',
    name: 'Hero_Banner_Final.jpg',
    type: 'image',
    extension: 'jpg',
    size: '2.4 MB',
    sizeBytes: 2400000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop',
    updatedAt: new Date().toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    createdAt: new Date().toISOString(),
    owner: { name: 'Alex M', avatarUrl: '', email: '' },
    isFavorite: true,
    tags: ['banner', 'hero', 'final'],
    path: '/Marketing/Campaigns'
  },
  {
    id: 'fav-2',
    name: 'Brand_Guidelines_2024.pdf',
    type: 'document',
    extension: 'pdf',
    size: '12 MB',
    sizeBytes: 12000000,
    thumbnailUrl: '', // Will use default doc icon
    updatedAt: new Date(Date.now() - 86400000 * 2).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    owner: { name: 'Sarah J', avatarUrl: '', email: '' },
    isFavorite: true,
    tags: ['brand', 'guidelines'],
    path: '/Brand Assets'
  },
  {
    id: 'fav-3',
    name: 'Product_Demo_Q3.mp4',
    type: 'video',
    extension: 'mp4',
    size: '145 MB',
    sizeBytes: 145000000,
    thumbnailUrl: '', // Will use default video icon
    updatedAt: new Date(Date.now() - 86400000 * 5).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    owner: { name: 'Mike T', avatarUrl: '', email: '' },
    isFavorite: true,
    tags: ['product', 'demo', 'video'],
    path: '/Product/Videos'
  }
];

export default function FavoritesPage() {
  const [assets, setAssets] = useState<Asset[]>(mockFavorites);
  
  // Navigation & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterCategory>('all');
  const [sortBy, setSortBy] = useState<SortBy>('updatedAt');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Selected Items State
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const handleToggleFavorite = (assetId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // For this mock page, removing from favorites removes it from the list entirely
    setAssets(prev => prev.filter(a => a.id !== assetId));
    if (selectedAsset && selectedAsset.id === assetId) {
      setSelectedAsset(null);
    }
  };

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const filteredAssets = useMemo(() => {
    return assets
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
  }, [assets, activeTab, searchQuery, sortBy]);

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

        {assets.length === 0 ? (
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
