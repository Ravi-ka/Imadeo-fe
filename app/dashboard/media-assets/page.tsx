'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/dam/Header';
import { AssetGrid } from '@/components/dam/AssetGrid';
import { AssetDetailsDrawer } from '@/components/dam/AssetDetailsDrawer';
import { WorkspaceSwitcher } from '@/components/dam/WorkspaceSwitcher';
import { Breadcrumb } from '@/components/dam/Breadcrumb';
import { FolderTree } from '@/components/dam/FolderTree';
import { FolderSection } from '@/components/dam/FolderSection';
import { CreateFolderModal } from '@/components/dam/CreateFolderModal';
import { MoveDestinationModal } from '@/components/dam/MoveDestinationModal';
import {
  Asset,
  Folder,
  FolderNode,
  FilterCategory,
  SortBy,
  ViewMode,
  Workspace,
} from '@/components/dam/types';
import { useQueryClient } from '@tanstack/react-query';
import {
  useWorkspaces,
  useAssets,
  useDeleteAsset,
  useRenameAsset,
  useAssetDownloadUrl,
  useToggleFavourite,
  useMoveAsset,
} from '@/hooks/useAssets';
import {
  useFolderTree,
  useCreateFolder,
  useUpdateFolder,
  useDeleteFolder,
} from '@/hooks/useFolders';
import { useDebounce } from '@/hooks/useDebounce';
import {
  canCreateSubfolder,
  findFolderNode,
  getAssetMoveDestinations,
  getFolderDepth,
  getFolderPath,
  getValidFolderMoveDestinations,
} from '@/lib/folderUtils';
import { FolderOpen, Sparkles, Loader2, Database, FileImage } from 'lucide-react';
import { useUploadStore } from '@/store/useUploadStore';
import { toast } from 'sonner';
import { useTenantStore } from '@/store/useTenantStore';

const EMPTY_WORKSPACES: Workspace[] = [];
const EMPTY_ASSETS: Asset[] = [];
const EMPTY_TREE: FolderNode[] = [];

export default function MediaAssetsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { imadeoId } = useTenantStore();
  const activeTenantId = searchParams.get('ws') || imadeoId || '';
  const currentFolderId = searchParams.get('folder') || null;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterCategory>('all');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const isWorkspaceWideList =
    activeTab === 'favorites' || Boolean(debouncedSearch.trim());

  const filters = useMemo(() => {
    const base = {
      favourite: activeTab === 'favorites' ? true : undefined,
      type: activeTab !== 'all' && activeTab !== 'favorites' ? activeTab : undefined,
      search: debouncedSearch || undefined,
      status: 'READY' as const,
    };

    if (isWorkspaceWideList) {
      return base;
    }

    if (currentFolderId) {
      return { ...base, folderId: currentFolderId };
    }

    return { ...base, root: true };
  }, [activeTab, debouncedSearch, currentFolderId, isWorkspaceWideList]);

  const { data: workspaces = EMPTY_WORKSPACES } = useWorkspaces();
  const {
    data: folderTree = EMPTY_TREE,
    isLoading: isLoadingTree,
  } = useFolderTree(activeTenantId);

  const {
    data: assetsData,
    isLoading: isLoadingAssets,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAssets(activeTenantId, filters);

  const { mutateAsync: createFolder } = useCreateFolder(activeTenantId);
  const { mutateAsync: updateFolder } = useUpdateFolder(activeTenantId);
  const { mutateAsync: deleteFolder } = useDeleteFolder(activeTenantId);
  const { mutateAsync: moveAsset } = useMoveAsset(activeTenantId);

  const fetchedAssets = useMemo(() => {
    if (!assetsData) return EMPTY_ASSETS;
    return assetsData.pages.flatMap((page) => page.items);
  }, [assetsData]);

  const firstPage = assetsData?.pages?.[0];
  const totalAssetsCountAPI = firstPage?.totalAssetsCount;
  const countByAssetTypeAPI = firstPage?.countByAssetType;

  const { mutateAsync: deleteAsset } = useDeleteAsset(activeTenantId);
  const { mutateAsync: renameAsset } = useRenameAsset(activeTenantId);
  const { mutateAsync: getDownloadUrl } = useAssetDownloadUrl();
  const queryClient = useQueryClient();

  const activeWorkspace = Array.isArray(workspaces)
    ? workspaces.find((ws) => ws.id === activeTenantId)
    : undefined;
  const isViewer = activeWorkspace?.role === 'VIEWER';

  const [sortBy, setSortBy] = useState<SortBy>('updatedAt');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [moveFolderTarget, setMoveFolderTarget] = useState<Folder | FolderNode | null>(null);
  const [moveAssetId, setMoveAssetId] = useState<string | null>(null);

  const { openUpload } = useUploadStore();

  const { mutateAsync: toggleFavourite } = useToggleFavourite(activeTenantId);

  const currentDepth = getFolderDepth(folderTree, currentFolderId);
  const canCreateFolder = canCreateSubfolder(currentDepth);

  const childFolders: Folder[] = useMemo(() => {
    if (!currentFolderId) {
      return folderTree.map((n) => ({
        id: n.id,
        tenantId: activeTenantId,
        userId: n.userId,
        name: n.name,
        parentId: n.parentId,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
      }));
    }
    const node = findFolderNode(folderTree, currentFolderId);
    return (node?.children || []).map((n) => ({
      id: n.id,
      tenantId: activeTenantId,
      userId: n.userId,
      name: n.name,
      parentId: n.parentId,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    }));
  }, [folderTree, currentFolderId, activeTenantId]);

  const currentPathText = useMemo(() => {
    if (!currentFolderId) return 'Media Assets (Root)';
    const path = getFolderPath(folderTree, currentFolderId);
    if (path.length === 0) return 'Media Assets';
    return `Media Assets / ${path.map((p) => p.name).join(' / ')}`;
  }, [folderTree, currentFolderId]);

  const navigateToFolder = useCallback(
    (folderId: string | null) => {
      const params = new URLSearchParams();
      if (activeTenantId) params.set('ws', activeTenantId);
      if (folderId) params.set('folder', folderId);
      const qs = params.toString();
      router.push(qs ? `?${qs}` : '?');
    },
    [router, activeTenantId]
  );

  useEffect(() => {
    if (!selectedAsset) return;
    const latest = fetchedAssets.find((asset) => asset.id === selectedAsset.id);
    if (!latest) return;
    if (
      latest.thumbnailUrl !== selectedAsset.thumbnailUrl ||
      latest.previewUrl !== selectedAsset.previewUrl ||
      latest.isProcessingPreview !== selectedAsset.isProcessingPreview
    ) {
      setSelectedAsset(latest);
    }
  }, [fetchedAssets, selectedAsset]);

  // If URL folder was deleted / missing, fall back to root
  useEffect(() => {
    if (!currentFolderId || isLoadingTree) return;
    if (folderTree.length === 0) {
      navigateToFolder(null);
      return;
    }
    if (!findFolderNode(folderTree, currentFolderId)) {
      navigateToFolder(null);
    }
  }, [currentFolderId, folderTree, isLoadingTree, navigateToFolder]);

  const handleToggleFavorite = async (assetId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const currentAsset = fetchedAssets.find((a) => a.id === assetId);
    const isCurrentlyFavourite = currentAsset ? currentAsset.isFavorite : false;

    queryClient.setQueriesData({ queryKey: ['assets', activeTenantId] }, (old: any) => {
      if (!old || !old.pages) return old;
      return {
        ...old,
        pages: old.pages.map((page: any) => ({
          ...page,
          items: page.items.map((asset: Asset) => {
            if (asset.id === assetId) {
              return { ...asset, isFavorite: !isCurrentlyFavourite };
            }
            return asset;
          }),
        })),
      };
    });

    const favoritesCacheKey = {
      favourite: true,
      type: undefined,
      search: undefined,
      status: 'READY',
    };

    if (!isCurrentlyFavourite && currentAsset) {
      queryClient.setQueryData(['assets', activeTenantId, favoritesCacheKey], (old: any) => {
        if (!old || !old.pages || old.pages.length === 0) return old;
        const first = old.pages[0];
        if (first.items.some((a: Asset) => a.id === assetId)) return old;
        return {
          ...old,
          pages: [
            { ...first, items: [{ ...currentAsset, isFavorite: true }, ...first.items] },
            ...old.pages.slice(1),
          ],
        };
      });
    } else if (isCurrentlyFavourite) {
      queryClient.setQueryData(['assets', activeTenantId, favoritesCacheKey], (old: any) => {
        if (!old || !old.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.filter((a: Asset) => a.id !== assetId),
          })),
        };
      });
    }

    toast.success(
      !isCurrentlyFavourite
        ? `Added "${currentAsset?.name || 'Asset'}" to Favorites`
        : `Removed "${currentAsset?.name || 'Asset'}" from Favorites`
    );

    if (selectedAsset && selectedAsset.id === assetId) {
      setSelectedAsset((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }

    try {
      await toggleFavourite({ assetId, isCurrentlyFavourite });
    } catch (e: any) {
      const isAlreadyStarredError = e.status === 409 && !isCurrentlyFavourite;
      const isAlreadyUnstarredError =
        e.status === 404 &&
        isCurrentlyFavourite &&
        e.data?.error === 'Asset is not a favourite';

      if (!isAlreadyStarredError && !isAlreadyUnstarredError) {
        toast.error(`Failed to update favorite status: ${e.message}`);
        queryClient.setQueriesData({ queryKey: ['assets', activeTenantId] }, (old: any) => {
          if (!old || !old.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((asset: Asset) => {
                if (asset.id === assetId) {
                  return { ...asset, isFavorite: isCurrentlyFavourite };
                }
                return asset;
              }),
            })),
          };
        });
        if (selectedAsset && selectedAsset.id === assetId) {
          setSelectedAsset((prev) =>
            prev ? { ...prev, isFavorite: isCurrentlyFavourite } : null
          );
        }
      }
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    const targetAsset = fetchedAssets.find((a) => a.id === assetId);
    try {
      await deleteAsset(assetId);
      if (selectedAsset?.id === assetId) setSelectedAsset(null);
      toast.success(`Permanently deleted "${targetAsset?.name || 'Asset'}"`);
    } catch (e: any) {
      toast.error(`Failed to delete asset: ${e.message}`);
    }
  };

  const handleRenameAsset = async (assetId: string, newName: string) => {
    try {
      await renameAsset({ assetId, name: newName });
      if (selectedAsset?.id === assetId) {
        setSelectedAsset((prev) => (prev ? { ...prev, name: newName } : null));
      }
      toast.success(`Successfully renamed to "${newName}"`);
    } catch (e: any) {
      toast.error(`Failed to rename: ${e.message}`);
    }
  };

  const handleDownloadAsset = async (assetId: string) => {
    try {
      const { downloadUrl } = await getDownloadUrl({ assetId, tenantId: activeTenantId });
      window.open(downloadUrl, '_blank');
    } catch (e: any) {
      toast.error(`Failed to download: ${e.message}`);
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      await createFolder({ name, parentId: currentFolderId });
      toast.success(`Created folder "${name}"`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to create folder');
      throw e;
    }
  };

  const handleRenameFolder = async (folderId: string, name: string) => {
    try {
      await updateFolder({ id: folderId, data: { name } });
      toast.success(`Renamed to "${name}"`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to rename folder');
      throw e;
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const result = await deleteFolder(folderId);
      if (currentFolderId === folderId) navigateToFolder(null);
      const count = result.deletedAssetCount ?? 0;
      toast.success(
        count > 0
          ? `Deleted folder and ${count} file${count === 1 ? '' : 's'}`
          : 'Deleted folder'
      );
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete folder');
      throw e;
    }
  };

  const handleMoveFolder = async (parentId: string | null) => {
    if (!moveFolderTarget) return;
    try {
      await updateFolder({ id: moveFolderTarget.id, data: { parentId } });
      toast.success(`Moved "${moveFolderTarget.name}"`);
      setMoveFolderTarget(null);
    } catch (e: any) {
      toast.error(e.message || 'Failed to move folder');
      throw e;
    }
  };

  const handleMoveAsset = async (folderId: string | null) => {
    if (!moveAssetId) return;
    try {
      await moveAsset({ assetId: moveAssetId, folderId });
      if (selectedAsset?.id === moveAssetId) setSelectedAsset(null);
      toast.success('Asset moved');
      setMoveAssetId(null);
    } catch (e: any) {
      toast.error(e.message || 'Failed to move asset');
      throw e;
    }
  };

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const handleShareAsset = (item: Asset | string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const itemName = typeof item === 'string' ? item : item.name;
    navigator.clipboard.writeText(`https://imadeo.io/share/${Date.now()}`);
    toast.success(`Share link copied for "${itemName}"`);
  };

  const memberships = (workspaces as any)?.memberships || [];
  const currentMembership =
    memberships.find((m: any) => m.tenant?.id === activeTenantId) || memberships[0];
  const storageUsedBytes = parseInt(currentMembership?.tenant?.storageUsed || '0', 10);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const storageUsedFormatted = formatBytes(storageUsedBytes);

  const typeCounts = useMemo(() => {
    if (countByAssetTypeAPI && countByAssetTypeAPI.length > 0) {
      const counts: Record<string, number> = {};
      countByAssetTypeAPI.forEach((item) => {
        const ext = item.mimeType.split('/')[1] || item.mimeType;
        const extName = ext.toLowerCase();
        counts[extName] = (counts[extName] || 0) + item._count;
      });
      return counts;
    }

    const counts: Record<string, number> = {};
    fetchedAssets.forEach((asset) => {
      if (asset.extension) {
        const ext = asset.extension.toLowerCase();
        counts[ext] = (counts[ext] || 0) + 1;
      }
    });
    return counts;
  }, [fetchedAssets, countByAssetTypeAPI]);

  const filteredAssets = useMemo(() => {
    return [...fetchedAssets].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'size') return b.sizeBytes - a.sizeBytes;
      if (sortBy === 'type') return a.extension.localeCompare(b.extension);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [fetchedAssets, sortBy]);

  const filteredChildFolders = useMemo(() => {
    if (!searchQuery.trim() || isWorkspaceWideList) return childFolders;
    const q = searchQuery.toLowerCase();
    return childFolders.filter((f) => f.name.toLowerCase().includes(q));
  }, [childFolders, searchQuery, isWorkspaceWideList]);

  const isEmptyLocation =
    !isWorkspaceWideList &&
    filteredChildFolders.length === 0 &&
    fetchedAssets.length === 0 &&
    activeTab === 'all' &&
    !searchQuery.trim();

  const folderMoveDestinations = useMemo(() => {
    if (!moveFolderTarget) return [];
    return getValidFolderMoveDestinations(folderTree, moveFolderTarget.id);
  }, [folderTree, moveFolderTarget]);

  const assetMoveDestinations = useMemo(
    () => getAssetMoveDestinations(folderTree),
    [folderTree]
  );

  const movingAsset = moveAssetId
    ? fetchedAssets.find((a) => a.id === moveAssetId) || selectedAsset
    : null;

  return (
    <>
      <Header
        title="Media Assets"
        breadcrumbs={['Home', 'Media Assets']}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenUpload={() => !isViewer && openUpload(currentFolderId)}
        onOpenCreateFolder={() => setIsCreateFolderOpen(true)}
        canCreateFolder={canCreateFolder}
        totalAssetsCount={totalAssetsCountAPI ?? filteredAssets.length}
        isViewer={isViewer}
      />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Breadcrumb
            tree={folderTree}
            currentFolderId={currentFolderId}
            onNavigate={navigateToFolder}
          />
          {Array.isArray(workspaces) && workspaces.length > 0 && (
            <WorkspaceSwitcher
              workspaces={workspaces}
              activeWorkspaceId={activeTenantId}
              onSelect={(wsId) => {
                window.location.href = `?ws=${wsId}`;
              }}
            />
          )}
        </div>

        {!currentFolderId && !isWorkspaceWideList && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Root files</p>
                <h3 className="text-2xl font-bold">
                  {isLoadingAssets ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    (totalAssetsCountAPI ?? fetchedAssets.length)
                  )}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <FileImage className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Storage Used</p>
                <h3 className="text-2xl font-bold">{storageUsedFormatted}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Database className="w-5 h-5" />
              </div>
            </div>

            <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center min-h-[90px]">
              <p className="text-sm text-slate-500 font-medium mb-2">Asset Types</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(typeCounts).length > 0 ? (
                  Object.entries(typeCounts).map(([ext, count]) => (
                    <div
                      key={ext}
                      className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg"
                    >
                      <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                        {ext}
                      </span>
                      <span className="text-[10px] bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-md text-slate-500 font-bold">
                        {count}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">No assets yet</span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <FolderTree
            tree={folderTree}
            currentFolderId={currentFolderId}
            onSelect={navigateToFolder}
          />

          <div className="flex-1 min-w-0 space-y-6 w-full">
            {isWorkspaceWideList && (
              <p className="text-sm text-slate-500">
                Showing workspace-wide {activeTab === 'favorites' ? 'favorites' : 'search results'}
                {currentFolderId ? ' (not limited to current folder)' : ''}.
              </p>
            )}

            {!isWorkspaceWideList && (
              <FolderSection
                folders={filteredChildFolders}
                onOpenFolder={(folder) => navigateToFolder(folder.id)}
                isViewer={isViewer}
                onRename={handleRenameFolder}
                onDelete={handleDeleteFolder}
                onMove={(folder) => setMoveFolderTarget(folder)}
                isLoading={isLoadingTree && folderTree.length === 0}
              />
            )}

            {isEmptyLocation ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <div className="w-20 h-20 mb-4 relative">
                  <FolderOpen className="w-20 h-20 text-primary opacity-20 absolute inset-0" />
                  <Sparkles className="w-7 h-7 text-primary absolute bottom-0 right-0 animate-pulse" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  This folder is empty
                </h2>
                <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
                  Upload files
                  {canCreateFolder && !isViewer ? ' or create a subfolder' : ''} to organize assets
                  here.
                </p>
                {!isViewer && (
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => openUpload(currentFolderId)}
                      className="bg-primary text-white px-5 py-2 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:opacity-95 transition-opacity"
                    >
                      Upload
                    </button>
                    {canCreateFolder && (
                      <button
                        type="button"
                        onClick={() => setIsCreateFolderOpen(true)}
                        className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-5 py-2 rounded-xl font-semibold border border-slate-200 dark:border-slate-700"
                      >
                        New folder
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : isLoadingAssets && fetchedAssets.length === 0 ? (
              <div className="flex items-center justify-center py-24 space-x-2 text-sm text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading assets...</span>
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
                onShareAsset={(asset, e) => handleShareAsset(asset, e)}
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                isEmptyLibrary={false}
                onOpenUpload={() => openUpload(currentFolderId)}
                isViewer={isViewer}
              />
            )}
          </div>
        </div>
      </div>

      <AssetDetailsDrawer
        selectedAsset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
        onToggleFavorite={(id) => handleToggleFavorite(id)}
        onDeleteAsset={handleDeleteAsset}
        onShare={handleShareAsset}
        onRenameAsset={handleRenameAsset}
        onDownloadAsset={handleDownloadAsset}
        onMoveAsset={!isViewer ? (id) => setMoveAssetId(id) : undefined}
        isViewer={isViewer}
      />

      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        onCreate={handleCreateFolder}
        currentPathText={currentPathText}
      />

      <MoveDestinationModal
        isOpen={!!moveFolderTarget}
        title={moveFolderTarget ? `Move “${moveFolderTarget.name}”` : 'Move folder'}
        description="Choose a destination. Max folder depth is 3."
        destinations={folderMoveDestinations}
        currentParentId={moveFolderTarget?.parentId ?? null}
        onClose={() => setMoveFolderTarget(null)}
        onConfirm={handleMoveFolder}
      />

      <MoveDestinationModal
        isOpen={!!moveAssetId}
        title={movingAsset ? `Move “${movingAsset.name}”` : 'Move asset'}
        description="Choose a folder, or root for unfiled assets."
        destinations={assetMoveDestinations}
        currentParentId={movingAsset?.folderId ?? null}
        onClose={() => setMoveAssetId(null)}
        onConfirm={handleMoveAsset}
      />
    </>
  );
}
