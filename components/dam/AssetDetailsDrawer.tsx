'use client';

import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Edit3, 
  Trash2, 
  Star, 
  Folder, 
  FileText, 
  Play, 
  Pause, 
  Copy, 
  Check, 
  Tag as TagIcon, 
  User, 
  Calendar, 
  HardDrive, 
  Maximize2,
  MoveRight,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { Asset, Folder as FolderType } from './types';
import { motion, AnimatePresence } from 'framer-motion';

interface AssetDetailsDrawerProps {
  selectedAsset: Asset | null;
  selectedFolder: FolderType | null;
  onClose: () => void;
  onToggleFavorite: (assetId: string) => void;
  onDeleteAsset: (assetId: string) => void;
  onShare: (name: string) => void;
}

export function AssetDetailsDrawer({
  selectedAsset,
  selectedFolder,
  onClose,
  onToggleFavorite,
  onDeleteAsset,
  onShare
}: AssetDetailsDrawerProps) {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionText, setDescriptionText] = useState(
    selectedAsset?.description || selectedFolder?.description || ''
  );
  const [newTagInput, setNewTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(selectedAsset?.tags || ['Brand', 'Imadeo', '2026']);

  // Sync state on prop changes
  React.useEffect(() => {
    if (selectedAsset) {
      setDescriptionText(selectedAsset.description || '');
      setTags(selectedAsset.tags || []);
    } else if (selectedFolder) {
      setDescriptionText(selectedFolder.description || '');
      setTags(['Folder', 'Collection']);
    }
  }, [selectedAsset, selectedFolder]);

  if (!selectedAsset && !selectedFolder) return null;

  const isFolder = !!selectedFolder && !selectedAsset;
  const title = selectedAsset ? selectedAsset.name : selectedFolder?.name || '';
  const path = selectedAsset ? selectedAsset.path : selectedFolder?.path || '';

  const handleCopyPath = () => {
    navigator.clipboard.writeText(path);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(newTagInput.trim())) {
        setTags([...tags, newTagInput.trim()]);
      }
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs xl:hidden"
        onClick={onClose}
      />

      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 z-50 h-screen w-full sm:w-[460px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Top Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-2">
            {isFolder ? (
              <Folder className="w-5 h-5 text-amber-500" />
            ) : (
              <FileText className="w-5 h-5 text-primary" />
            )}
            <h3 className="font-bold text-base text-slate-900 dark:text-white truncate max-w-[280px]">
              {isFolder ? 'Folder Details' : 'Asset Inspector'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Large Interactive Preview Container */}
          <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center group shadow-inner">
            {selectedAsset ? (
              selectedAsset.type === 'video' ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={selectedAsset.thumbnailUrl}
                    alt={selectedAsset.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <button
                      onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                      className="w-16 h-16 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                    >
                      {isPlayingVideo ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                    </button>
                  </div>
                  {selectedAsset.duration && (
                    <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-black/80 text-white border border-white/20">
                      {selectedAsset.duration}
                    </span>
                  )}
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={selectedAsset.thumbnailUrl}
                    alt={selectedAsset.name}
                    className="w-full h-full object-contain p-2"
                  />
                  <a
                    href={selectedAsset.thumbnailUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 backdrop-blur-md text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Open Fullscreen Preview"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </a>
                </div>
              )
            ) : (
              selectedFolder && (
                <div className="w-full h-full relative overflow-hidden">
                  <img
                    src={selectedFolder.coverImage}
                    alt={selectedFolder.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
                    <Folder className="w-12 h-12 text-amber-400" />
                    <span className="font-bold text-lg">{selectedFolder.name}</span>
                    <span className="text-xs text-slate-300">{selectedFolder.itemCount} contained assets</span>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Quick Action Toolbar */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => onShare(title)}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Share2 className="w-4 h-4 text-primary mb-1" />
              <span className="text-[11px] font-semibold">Share</span>
            </button>

            <button
              onClick={() => onShare(`Download of ${title} initiated`)}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-500 mb-1" />
              <span className="text-[11px] font-semibold">Download</span>
            </button>

            {selectedAsset && (
              <button
                onClick={() => onToggleFavorite(selectedAsset.id)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-colors ${
                  selectedAsset.isFavorite
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    : 'bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <Star className={`w-4 h-4 mb-1 ${selectedAsset.isFavorite ? 'fill-amber-500' : ''}`} />
                <span className="text-[11px] font-semibold">Favorite</span>
              </button>
            )}

            {selectedAsset && (
              <button
                onClick={() => onDeleteAsset(selectedAsset.id)}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
              >
                <Trash2 className="w-4 h-4 mb-1" />
                <span className="text-[11px] font-semibold">Delete</span>
              </button>
            )}
          </div>

          {/* Asset Title & Location Path */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-start justify-between">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-lg break-all">
                {title}
              </h4>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="truncate max-w-[280px] font-mono text-[11px]">{path}</span>
              <button
                onClick={handleCopyPath}
                className="p-1 rounded text-primary hover:bg-primary/10 transition-colors shrink-0"
                title="Copy Path"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Metadata Specifications Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Item Specifications
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {selectedAsset?.dimensions && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-slate-400 block text-[10px]">Dimensions</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedAsset.dimensions}</span>
                </div>
              )}

              {selectedAsset?.duration && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-slate-400 block text-[10px]">Video Duration</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedAsset.duration}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-400 block text-[10px]">File Size</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedAsset ? selectedAsset.size : selectedFolder?.totalSize}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-400 block text-[10px]">Last Modified</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedAsset ? selectedAsset.updatedAt : selectedFolder?.updatedAt}
                </span>
              </div>
            </div>
          </div>

          {/* Owner Profile */}
          {selectedAsset && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedAsset.owner.avatarUrl}
                  alt={selectedAsset.owner.name}
                  className="w-8 h-8 rounded-full object-cover border border-primary/30"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{selectedAsset.owner.name}</p>
                  <p className="text-[11px] text-slate-400">{selectedAsset.owner.email}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary">
                Owner
              </span>
            </div>
          )}

          {/* Tags & Categories */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <TagIcon className="w-3.5 h-3.5" /> Tags & Keywords
              </h4>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, idx) => (
                <span
                  key={`${tag}-${idx}`}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1 group"
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-slate-400 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add tag (Press Enter)..."
              className="w-full mt-2 px-3 py-1.5 bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Description
              </h4>
              <button
                onClick={() => setIsEditingDescription(!isEditingDescription)}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                {isEditingDescription ? 'Done' : 'Edit'}
              </button>
            </div>

            {isEditingDescription ? (
              <textarea
                value={descriptionText}
                onChange={(e) => setDescriptionText(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-primary text-xs text-slate-900 dark:text-white focus:outline-none min-h-[90px]"
              />
            ) : (
              <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {descriptionText || 'No description provided for this asset.'}
              </p>
            )}
          </div>

        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
