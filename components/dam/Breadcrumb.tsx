'use client';

import React from 'react';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { Folder } from './types';

interface BreadcrumbProps {
  currentFolder: Folder | null;
  onNavigate: (folderId: string | null) => void;
  folders: Folder[]; // We need to build the path if we have the flat list, or we can just pass the path.
}

export function Breadcrumb({ currentFolder, onNavigate, folders }: BreadcrumbProps) {
  const path = React.useMemo(() => {
    if (!currentFolder) return [];
    
    const p = [];
    let curr: Folder | undefined = currentFolder;
    
    while (curr) {
      p.unshift(curr);
      curr = folders.find(f => f.id === curr!.parentId);
    }
    
    return p;
  }, [currentFolder, folders]);

  return (
    <nav className="flex items-center space-x-1 text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">
      {currentFolder && (
        <button
          onClick={() => onNavigate(currentFolder.parentId || null)}
          className="mr-2 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Back to parent folder"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      )}

      <button 
        onClick={() => onNavigate(null)}
        className={`flex items-center hover:text-primary transition-colors ${!currentFolder ? 'text-primary' : ''}`}
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
              onClick={() => onNavigate(folder.id)}
              className={`hover:text-primary transition-colors truncate max-w-[120px] sm:max-w-[200px] ${
                isLast ? 'text-slate-900 dark:text-slate-100 pointer-events-none' : ''
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
