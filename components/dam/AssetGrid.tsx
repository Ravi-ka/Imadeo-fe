'use client';

import React, { useState } from 'react';
import { 
  LayoutGrid, 
  List as ListIcon, 
  Star, 
  MoreVertical, 
  Play, 
  FileText, 
  Figma, 
  Music, 
  Download, 
  Share2, 
  Trash2, 
  SearchX,
  Clock,
  ArrowUpDown,
  Filter,
  Check
} from 'lucide-react';
import { Asset, FilterCategory, SortBy, ViewMode } from './types';
import { motion, AnimatePresence } from 'framer-motion';

interface AssetGridProps {
  assets: Asset[];
  selectedAssetId: string | null;
  onSelectAsset: (asset: Asset) => void;
  onToggleFavorite: (assetId: string, e: React.MouseEvent) => void;
  activeTab: FilterCategory;
  onTabChange: (tab: FilterCategory) => void;
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery: string;
  onShareAsset: (asset: Asset, e: React.MouseEvent) => void;
}

export function AssetGrid({
  assets,
  selectedAssetId,
  onSelectAsset,
  onToggleFavorite,
  activeTab,
  onTabChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  searchQuery,
  onShareAsset
}: AssetGridProps) {
  const [activeMenuAssetId, setActiveMenuAssetId] = useState<string | null>(null);

  const tabs: { id: FilterCategory; label: string }[] = [
    { id: 'all', label: 'All Assets' },
    { id: 'image', label: 'Images' },
    { id: 'video', label: 'Videos' },
    { id: 'document', label: 'Documents' },
    { id: 'favorites', label: 'Favorites' }
  ];

  const getTypeBadgeColor = (type: string, extension: string) => {
    switch (extension.toUpperCase()) {
      case 'PNG':
      case 'JPG':
      case 'WEBP':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'MP4':
      case 'MOV':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'PDF':
      case 'DOCX':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'FIG':
      case 'AI':
      case 'PSD':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'WAV':
      case 'MP3':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  const getTypeIcon = (type: string, extension: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      case 'design':
        return <Figma className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <section className="space-y-5">
      {/* Filters, Tabs & View Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        
        {/* Category Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Sort & View Controls */}
        <div className="flex items-center space-x-3 shrink-0">
          
          {/* Sorting Dropdown */}
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortBy)}
              className="bg-transparent text-xs font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="updatedAt">Last modified</option>
              <option value="name">Name (A-Z)</option>
              <option value="size">File size</option>
              <option value="type">File type</option>
            </select>
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-x-1">
            <button
              onClick={() => onViewModeChange('grid')}
              title="Grid View"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              title="List View"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* No Search Results or Empty State */}
      {assets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 px-4 bg-white/50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <SearchX className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No matching assets found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {searchQuery
                ? `No files match your query "${searchQuery}". Try searching for something else or clearing filters.`
                : 'There are no files available under this category.'}
            </p>
          </div>
        </motion.div>
      ) : viewMode === 'grid' ? (
        /* Grid View Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {assets.map((asset, idx) => {
            const isSelected = selectedAssetId === asset.id;
            return (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                onClick={() => onSelectAsset(asset)}
                className={`group relative flex flex-col rounded-2xl border transition-all cursor-pointer select-none overflow-hidden ${
                  isSelected
                    ? 'bg-primary/10 border-primary shadow-xl shadow-primary/10 ring-2 ring-primary/40'
                    : 'bg-white/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                }`}
              >
                {/* Media Preview Box */}
                <div className="relative w-full aspect-video bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center">
                  <img
                    src={asset.thumbnailUrl}
                    alt={asset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Video Play Overlay */}
                  {asset.type === 'video' && (
                    <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 text-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-primary ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Duration Badge for Videos */}
                  {asset.duration && (
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-black/75 backdrop-blur-md text-white border border-white/10">
                      {asset.duration}
                    </span>
                  )}

                  {/* Type Badge Top Left */}
                  <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border backdrop-blur-md ${getTypeBadgeColor(asset.type, asset.extension)}`}>
                    {asset.extension}
                  </span>

                  {/* Star Favorite Button Top Right */}
                  <button
                    onClick={(e) => onToggleFavorite(asset.id, e)}
                    className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-md transition-all ${
                      asset.isFavorite
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                        : 'bg-black/40 border border-white/20 text-white/70 opacity-0 group-hover:opacity-100 hover:text-amber-400'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${asset.isFavorite ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>

                {/* Info Container */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary dark:group-hover:text-primary-light transition-colors" title={asset.name}>
                      {asset.name}
                    </h3>
                    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      <span className="whitespace-nowrap font-medium">{asset.size}</span>
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{asset.updatedAt}</span>
                      </span>
                    </div>
                  </div>

                  {/* Owner & Options Row */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5" title={`Owner: ${asset.owner.name}`}>
                      <img
                        src={asset.owner.avatarUrl}
                        alt={asset.owner.name}
                        className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[80px]">
                        {asset.owner.name.split(' ')[0]}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShareAsset(asset, e);
                      }}
                      title="Share link"
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* List View Layout */
        <div className="bg-white/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Last Modified</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {assets.map((asset) => {
                const isSelected = selectedAssetId === asset.id;
                return (
                  <tr
                    key={asset.id}
                    onClick={() => onSelectAsset(asset)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary/25 dark:bg-primary/25'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {/* Asset Name & Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                          <img
                            src={asset.thumbnailUrl}
                            alt={asset.name}
                            className="w-full h-full object-cover"
                          />
                          {asset.type === 'video' && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <Play className="w-3 h-3 text-white fill-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white hover:text-primary">
                            {asset.name}
                          </p>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{asset.path}</p>
                        </div>
                      </div>
                    </td>

                    {/* Type Extension */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getTypeBadgeColor(asset.type, asset.extension)}`}>
                        {asset.extension}
                      </span>
                    </td>

                    {/* Size */}
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {asset.size}
                    </td>

                    {/* Owner */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <img
                          src={asset.owner.avatarUrl}
                          alt={asset.owner.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span>{asset.owner.name}</span>
                      </div>
                    </td>

                    {/* Last Modified */}
                    <td className="py-3 px-4 text-slate-500">
                      {asset.updatedAt}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => onToggleFavorite(asset.id, e)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            asset.isFavorite ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'
                          }`}
                        >
                          <Star className={`w-4 h-4 ${asset.isFavorite ? 'fill-amber-400' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onShareAsset(asset, e);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
