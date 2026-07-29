'use client';

import React, { useState } from 'react';
import { Folder as FolderIcon, MoreVertical, Plus, Clock, HardDrive, FileText, Edit2, MoveRight, Trash2 } from 'lucide-react';
import { Folder } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateFolder, useUpdateFolder, useDeleteFolder } from '@/hooks/useFolders';

interface FolderSectionProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (folder: Folder) => void;
  onOpenFolder: (folder: Folder) => void;
  activeTenantId: string;
  currentFolderId: string | null;
}

export function FolderSection({
  folders,
  selectedFolderId,
  onSelectFolder,
  onOpenFolder,
  activeTenantId,
  currentFolderId
}: FolderSectionProps) {
  const updateFolderMut = useUpdateFolder();
  const deleteFolderMut = useDeleteFolder();

  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState('');

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FolderIcon className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Folders</h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            {folders.length}
          </span>
        </div>
      </div>

      {/* Folders Grid */}
      {folders.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500">
          <FolderIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p>No folders here yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {folders.map((folder, idx) => {
            const isSelected = selectedFolderId === folder.id;
            return (
              <motion.div
                key={folder.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                onClick={() => onSelectFolder(folder)}
                onDoubleClick={() => onOpenFolder(folder)}
                className={`group relative flex flex-col justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/30'
                    : 'bg-white/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <FolderIcon className="w-5 h-5 text-blue-500" />
                  </div>
                  <button 
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingFolderId(folder.id);
                      setEditFolderName(folder.name);
                    }}
                  >
                    <Edit2 className="w-3 h-3 text-slate-500" />
                  </button>
                  <button 
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete folder and subfolders?')) {
                        deleteFolderMut.mutate({ tenantId: activeTenantId, id: folder.id });
                      }
                    }}
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </button>
                </div>
                
                <div className="space-y-1">
                  {editingFolderId === folder.id ? (
                    <input
                      autoFocus
                      className="w-full text-sm font-bold bg-transparent border-b border-primary focus:outline-none"
                      value={editFolderName}
                      onChange={(e) => setEditFolderName(e.target.value)}
                      onBlur={() => {
                        updateFolderMut.mutate({ tenantId: activeTenantId, id: folder.id, data: { name: editFolderName } });
                        setEditingFolderId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateFolderMut.mutate({ tenantId: activeTenantId, id: folder.id, data: { name: editFolderName } });
                          setEditingFolderId(null);
                        }
                      }}
                    />
                  ) : (
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
                      {folder.name}
                    </h3>
                  )}
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {folder._count?.children || 0} subfolders, {folder._count?.assets || 0} files
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
