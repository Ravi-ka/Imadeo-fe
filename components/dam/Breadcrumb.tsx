'use client';

import React from 'react';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { FolderNode } from './types';
import { getFolderPath } from '@/lib/folderUtils';

interface BreadcrumbProps {
  tree: FolderNode[];
  currentFolderId: string | null;
  onNavigate: (folderId: string | null) => void;
}

export function Breadcrumb({ tree, currentFolderId, onNavigate }: BreadcrumbProps) {
  const path = React.useMemo(() => {
    if (!currentFolderId) return [];
    return getFolderPath(tree, currentFolderId);
  }, [tree, currentFolderId]);

  const parentId = path.length > 1 ? path[path.length - 2].id : null;

  return (
    <nav className="flex items-center space-x-1 text-sm font-medium text-slate-500 dark:text-slate-400 min-w-0">
      {currentFolderId && (
        <button
          type="button"
          onClick={() => onNavigate(parentId)}
          className="mr-1 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
          title="Back to parent folder"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      )}

      <button
        type="button"
        onClick={() => onNavigate(null)}
        className={`flex items-center hover:text-primary transition-colors shrink-0 ${
          !currentFolderId ? 'text-primary' : ''
        }`}
      >
        <Home className="w-4 h-4" />
        <span className="ml-1.5 hidden sm:inline">Media Assets</span>
      </button>

      {path.map((folder, idx) => {
        const isLast = idx === path.length - 1;
        return (
          <React.Fragment key={folder.id}>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />
            <button
              type="button"
              onClick={() => onNavigate(folder.id)}
              disabled={isLast}
              className={`hover:text-primary transition-colors truncate max-w-[120px] sm:max-w-[200px] ${
                isLast
                  ? 'text-slate-900 dark:text-slate-100 pointer-events-none font-semibold'
                  : ''
              }`}
            >
              {folder.name}
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
