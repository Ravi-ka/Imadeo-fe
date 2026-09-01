'use client';

import React, { useState } from 'react';
import { Folder as FolderIcon, Home, ChevronRight, ChevronDown } from 'lucide-react';
import { FolderNode } from './types';
import { motion, AnimatePresence } from 'framer-motion';

interface FolderTreeProps {
  tree: FolderNode[];
  currentFolderId: string | null;
  onSelect: (folderId: string | null) => void;
}

function TreeNode({
  node,
  depth,
  currentFolderId,
  onSelect,
  defaultOpen,
}: {
  node: FolderNode;
  depth: number;
  currentFolderId: string | null;
  onSelect: (folderId: string | null) => void;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const hasChildren = (node.children?.length || 0) > 0;
  const isActive = currentFolderId === node.id;

  return (
    <div>
      <div
        className={`group flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm cursor-pointer transition-colors ${
          isActive
            ? 'bg-primary/10 text-primary font-semibold'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
          >
            {open ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        ) : (
          <span className="w-4.5 shrink-0" />
        )}
        <button
          type="button"
          className="flex items-center gap-2 min-w-0 flex-1 text-left"
          onClick={() => onSelect(node.id)}
        >
          <FolderIcon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-blue-500'}`} />
          <span className="truncate">{node.name}</span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {node.children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                currentFolderId={currentFolderId}
                onSelect={onSelect}
                defaultOpen={false}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function pathContains(node: FolderNode, targetId: string | null): boolean {
  if (!targetId) return false;
  if (node.id === targetId) return true;
  return (node.children || []).some((c) => pathContains(c, targetId));
}

export function FolderTree({ tree, currentFolderId, onSelect }: FolderTreeProps) {
  return (
    <aside className="w-full lg:w-56 shrink-0 space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 px-2 mb-2">
        Folders
      </p>
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${
          !currentFolderId
            ? 'bg-primary/10 text-primary font-semibold'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <Home className="w-4 h-4 shrink-0" />
        <span>All files (root)</span>
      </button>

      <div className="space-y-0.5 max-h-[420px] overflow-y-auto pr-1">
        {tree.length === 0 ? (
          <p className="text-xs text-slate-400 px-2 py-3">No folders yet</p>
        ) : (
          tree.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              depth={0}
              currentFolderId={currentFolderId}
              onSelect={onSelect}
              defaultOpen={pathContains(node, currentFolderId)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
