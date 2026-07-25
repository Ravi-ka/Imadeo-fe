'use client';

import React, { useState, useMemo } from 'react';
import { Sidebar } from '@/components/dam/Sidebar';
import { Header } from '@/components/dam/Header';
import { StatsOverview } from '@/components/dam/StatsOverview';
import { FolderSection } from '@/components/dam/FolderSection';
import { AssetGrid } from '@/components/dam/AssetGrid';
import { AssetDetailsDrawer } from '@/components/dam/AssetDetailsDrawer';
import { UploadModal } from '@/components/dam/UploadModal';
import { 
  initialAssets, 
  initialFolders, 
  initialStats 
} from '@/components/dam/mockData';
import { 
  Asset, 
  Folder, 
  NavCategory, 
  FilterCategory, 
  SortBy, 
  ViewMode 
} from '@/components/dam/types';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, FolderOpen, ArrowLeft, Settings as SettingsIcon } from 'lucide-react';

export default function DashboardPage() {
  // Navigation & Sidebar State
  const [activeNav, setActiveNav] = useState<NavCategory>('media-assets');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Search & Filter & Sort & View State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterCategory>('all');
  const [sortBy, setSortBy] = useState<SortBy>('updatedAt');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeFilterFolderId, setActiveFilterFolderId] = useState<string | null>(null);

  // Data Collections State
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [folders, setFolders] = useState<Folder[]>(initialFolders);

  // Selected Items State for Right Details Panel
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(initialAssets[0]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

  // Modals & Notifications State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Trigger temporary toast notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Nav Selection Handler
  const handleNavSelect = (category: NavCategory) => {
    setActiveNav(category);
    if (category === 'favorites') {
      setActiveTab('favorites');
    } else if (category === 'media-assets' || category === 'overview') {
      setActiveTab('all');
    }
  };

  // Favorite Star Toggle Handler
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

  // Asset Deletion Handler
  const handleDeleteAsset = (assetId: string) => {
    const targetAsset = assets.find(a => a.id === assetId);
    setAssets(prev => prev.filter(a => a.id !== assetId));
    if (selectedAsset?.id === assetId) {
      setSelectedAsset(null);
    }
    triggerToast(`Moved "${targetAsset?.name || 'Asset'}" to Trash`);
  };

  // Folder Selection Handler
  const handleSelectFolder = (folder: Folder) => {
    setSelectedFolder(folder);
    setSelectedAsset(null);
  };

  // Asset Selection Handler
  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setSelectedFolder(null);
  };

  // Share Asset Handler
  const handleShareAsset = (item: Asset | string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const itemName = typeof item === 'string' ? item : item.name;
    navigator.clipboard.writeText(`https://imadeo.io/assets/share/${Date.now()}`);
    triggerToast(`Share link copied for "${itemName}"`);
  };

  // Upload Asset Success Handler
  const handleUploadSuccess = (newAsset: Asset) => {
    setAssets(prev => [newAsset, ...prev]);
    setSelectedAsset(newAsset);
    setSelectedFolder(null);
    triggerToast(`Successfully uploaded "${newAsset.name}"`);
  };

  // Favorites Count
  const favoritesCount = useMemo(() => {
    return assets.filter(a => a.isFavorite).length;
  }, [assets]);

  // Derived Title & Breadcrumbs based on nav and search
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

  const breadcrumbs = useMemo(() => {
    return ['Home', pageTitle];
  }, [pageTitle]);

  // Filtered and Sorted Assets
  const filteredAssets = useMemo(() => {
    return assets
      .filter(asset => {
        // Tab Filter
        if (activeNav === 'favorites' || activeTab === 'favorites') {
          if (!asset.isFavorite) return false;
        } else if (activeTab !== 'all') {
          if (asset.type !== activeTab) return false;
        }

        // Shared Nav Filter
        if (activeNav === 'shared' && !asset.isShared) return false;

        // Active Folder Filter
        if (activeFilterFolderId && asset.folderId !== activeFilterFolderId) return false;

        // Search Query Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = asset.name.toLowerCase().includes(q);
          const matchTag = asset.tags.some(t => t.toLowerCase().includes(q));
          const matchOwner = asset.owner.name.toLowerCase().includes(q);
          const matchExt = asset.extension.toLowerCase().includes(q);
          return matchName || matchTag || matchOwner || matchExt;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'size') return b.sizeBytes - a.sizeBytes;
        if (sortBy === 'type') return a.extension.localeCompare(b.extension);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [assets, activeTab, activeNav, activeFilterFolderId, searchQuery, sortBy]);

  // Filtered Folders based on Search
  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return folders;
    const q = searchQuery.toLowerCase();
    return folders.filter(f => f.name.toLowerCase().includes(q) || f.description?.toLowerCase().includes(q));
  }, [folders, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090a0f] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      <div className="flex-1 flex overflow-hidden">
        
        {/* Collapsible Left Navigation Sidebar (Fixed Position) */}
        <Sidebar
          activeNav={activeNav}
          onSelectNav={handleNavSelect}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          favoritesCount={favoritesCount}
        />

        {/* Main DAM Dashboard Content Area */}
        <main
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            isSidebarCollapsed ? 'pl-20' : 'pl-64'
          }`}
        >
          {/* Top Header */}
          <Header
            title={pageTitle}
            breadcrumbs={breadcrumbs}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenUpload={() => setIsUploadOpen(true)}
            totalAssetsCount={filteredAssets.length}
          />

          {/* Body Dashboard Area */}
          <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
            
            {/* Overview / Settings view vs Standard Asset Browsing */}
            {activeNav === 'settings' ? (
              <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
                <div className="flex items-center space-x-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <SettingsIcon className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold">DAM System Settings</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <h4 className="font-bold">Automated Asset Processing</h4>
                    <p className="text-xs text-slate-400">Generate 4K thumbnails, webp renditions, and auto-tag metadata upon upload.</p>
                    <span className="inline-block px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 font-semibold text-xs">Active</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <h4 className="font-bold">Storage Optimization</h4>
                    <p className="text-xs text-slate-400">De-duplicate identical media binaries and archive files older than 365 days.</p>
                    <span className="inline-block px-2 py-1 rounded bg-primary/10 text-primary font-semibold text-xs">Enabled</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Statistics Summary Cards */}
                <StatsOverview stats={initialStats} />

                {/* Folders Browsing Section */}
                <FolderSection
                  folders={filteredFolders}
                  selectedFolderId={selectedFolder?.id || null}
                  onSelectFolder={handleSelectFolder}
                  onFolderFilterToggle={(folderId) => setActiveFilterFolderId(activeFilterFolderId === folderId ? null : folderId)}
                  activeFilterFolderId={activeFilterFolderId}
                />

                {/* Assets Browsing Section */}
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
              </>
            )}

          </div>
        </main>

        {/* Selected Folder or Asset Details Drawer */}
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
        />

      </div>

      {/* Upload Modal Overlay */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Floating Toast Notification */}
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
