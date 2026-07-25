'use client';

import React from 'react';
import { Folder as FolderIcon, MoreVertical, ChevronRight, Clock, HardDrive, FileText } from 'lucide-react';
import { Folder } from './types';
import { motion } from 'framer-motion';

interface FolderSectionProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (folder: Folder) => void;
  onFolderFilterToggle?: (folderId: string) => void;
  activeFilterFolderId: string | null;
}

export function FolderSection({
  folders,
  selectedFolderId,
  onSelectFolder,
  onFolderFilterToggle,
  activeFilterFolderId
}: FolderSectionProps) {
  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FolderIcon className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Folders
          </h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            {folders.length}
          </span>
          {activeFilterFolderId && (
            <button
              onClick={() => onFolderFilterToggle && onFolderFilterToggle('')}
              className="ml-3 text-xs font-medium text-primary hover:underline"
            >
              Clear folder filter
            </button>
          )}
        </div>
      </div>

      {/* Folders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {folders.map((folder, idx) => {
          const isSelected = selectedFolderId === folder.id;
          const isFiltered = activeFilterFolderId === folder.id;

          return (
            <motion.div
              key={folder.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              onClick={() => onSelectFolder(folder)}
              className={`group relative flex flex-col justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                isSelected || isFiltered
                  ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/30'
                  : 'bg-white/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              {/* Folder Cover Image / Thumbnail Header */}
              <div className="relative w-full h-24 rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800">
                {folder.coverImage ? (
                  <img
                    src={folder.coverImage}
                    alt={folder.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${folder.color} opacity-80 flex items-center justify-center`}>
                    <FolderIcon className="w-10 h-10 text-white/90" />
                  </div>
                )}

                {/* Gradient overlay for text clarity */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                {/* Folder icon overlay tag */}
                <div className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/20 text-white">
                  <FolderIcon className="w-4 h-4 text-amber-400" />
                </div>

                {/* Asset Count Badge */}
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-black/60 backdrop-blur-md text-white border border-white/10">
                  {folder.itemCount} files
                </span>
              </div>

              {/* Folder Content Information */}
              <div className="space-y-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                    {folder.name}
                  </h3>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-slate-400" />
                    {folder.totalSize}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {folder.updatedAt}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
