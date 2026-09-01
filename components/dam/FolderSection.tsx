'use client';

import React, { useState } from 'react';
import {
  Folder as FolderIcon,
  Edit2,
  Trash2,
  MoveRight,
  Loader2,
} from 'lucide-react';
import { Folder } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface FolderSectionProps {
  folders: Folder[];
  onOpenFolder: (folder: Folder) => void;
  isViewer?: boolean;
  onRename?: (folderId: string, name: string) => Promise<void>;
  onDelete?: (folderId: string) => Promise<void>;
  onMove?: (folder: Folder) => void;
  isLoading?: boolean;
}

export function FolderSection({
  folders,
  onOpenFolder,
  isViewer = false,
  onRename,
  onDelete,
  onMove,
  isLoading,
}: FolderSectionProps) {
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Folder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

  const commitRename = async (folderId: string) => {
    const trimmed = editFolderName.trim();
    if (!trimmed || !onRename) {
      setEditingFolderId(null);
      return;
    }
    setIsRenaming(true);
    try {
      await onRename(folderId, trimmed);
    } finally {
      setIsRenaming(false);
      setEditingFolderId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // Parent toast
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-slate-400 py-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Loading folders...</span>
      </div>
    );
  }

  if (folders.length === 0) return null;

  return (
    <>
      <section className="space-y-4">
        <div className="flex items-center space-x-2">
          <FolderIcon className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Folders</h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
            {folders.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {folders.map((folder, idx) => (
            <motion.div
              key={folder.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: idx * 0.03 }}
              onDoubleClick={() => onOpenFolder(folder)}
              onClick={() => onOpenFolder(folder)}
              className="group relative flex flex-col justify-between p-4 rounded-2xl border bg-white/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm cursor-pointer select-none transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <FolderIcon className="w-5 h-5 text-blue-500" />
                </div>
                {!isViewer && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onRename && (
                      <button
                        type="button"
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
                        title="Rename"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFolderId(folder.id);
                          setEditFolderName(folder.name);
                        }}
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    )}
                    {onMove && (
                      <button
                        type="button"
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
                        title="Move"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMove(folder);
                        }}
                      >
                        <MoveRight className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(folder);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1" onClick={(e) => editingFolderId === folder.id && e.stopPropagation()}>
                {editingFolderId === folder.id ? (
                  <input
                    autoFocus
                    disabled={isRenaming}
                    className="w-full text-sm font-bold bg-transparent border-b border-primary focus:outline-none"
                    value={editFolderName}
                    onChange={(e) => setEditFolderName(e.target.value.slice(0, 255))}
                    onBlur={() => commitRename(folder.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename(folder.id);
                      if (e.key === 'Escape') setEditingFolderId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
                    {folder.name}
                  </h3>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !isDeleting && setDeleteTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Delete “{deleteTarget.name}”?
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                This deletes this folder, all subfolders, and all files inside. This cannot be
                undone.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="ghost"
                  disabled={isDeleting}
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancel
                </Button>
                <Button
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...
                    </>
                  ) : (
                    'Delete permanently'
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
