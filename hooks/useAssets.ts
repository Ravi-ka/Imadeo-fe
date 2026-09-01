import { InfiniteData, QueryClient, useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { getWorkspacesApi } from '@/services/workspaceService';
import { Asset } from '@/components/dam/types';
import { 
  getAssetsApi, 
  uploadAssetDirect,
  deleteAssetApi,
  renameAssetApi,
  moveAssetApi,
  getAssetDownloadUrlApi,
  toggleAssetFavouriteApi,
  pollAssetUntilThumbnails,
  startThumbnailPollController,
  stopThumbnailPoll,
  clearLocalPreview,
  markLocalPreviewSettled,
  hasRemoteAssetUrl,
  type AssetListFilters,
} from '@/services/assetService';

type AssetsPage = {
  items: Asset[];
  nextCursor: string | null;
  totalAssetsCount?: number;
  countByAssetType?: { _count: number; mimeType: string }[];
};

type AssetsInfiniteData = InfiniteData<AssetsPage, string | undefined>;

const assetMatchesListFilters = (asset: Asset, filters?: AssetListFilters): boolean => {
  if (!filters) return true;
  if (filters.favourite && !asset.isFavorite) return false;
  if (filters.type && asset.type !== filters.type) return false;
  if (filters.search && !asset.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
  if (filters.status && asset.status && asset.status !== filters.status) return false;
  if (filters.folderId) {
    if (asset.folderId !== filters.folderId) return false;
  } else if (filters.root) {
    if (asset.folderId) return false;
  }
  return true;
};

const mergeAssetRecord = (cached: Asset, incoming: Asset): Asset => {
  const remoteReady = hasRemoteAssetUrl(incoming.thumbnailUrl);
  return {
    ...cached,
    ...incoming,
    thumbnailUrl: remoteReady ? incoming.thumbnailUrl : (cached.thumbnailUrl || incoming.thumbnailUrl),
    previewUrl: hasRemoteAssetUrl(incoming.previewUrl)
      ? incoming.previewUrl
      : (cached.previewUrl || incoming.previewUrl),
    localPreviewUrl: remoteReady ? undefined : (incoming.localPreviewUrl || cached.localPreviewUrl),
    isProcessingPreview: remoteReady ? false : (incoming.isProcessingPreview ?? cached.isProcessingPreview),
  };
};

const upsertAssetInAssetsCache = (
  queryClient: QueryClient,
  tenantId: string,
  asset: Asset,
  options: { insertIfMissing?: boolean } = {}
) => {
  const queries = queryClient.getQueriesData<AssetsInfiniteData>({ queryKey: ['assets', tenantId] });

  for (const [queryKey, data] of queries) {
    if (!data?.pages) continue;
    const filters = queryKey[2] as AssetListFilters | undefined;
    const exists = data.pages.some((page) => page.items.some((item) => item.id === asset.id));
    if (!exists && !options.insertIfMissing) continue;
    if (!exists && !assetMatchesListFilters(asset, filters)) continue;

    queryClient.setQueryData<AssetsInfiniteData>(queryKey, (old) => {
      if (!old?.pages) return old;
      if (old.pages.some((page) => page.items.some((item) => item.id === asset.id))) {
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.map((item) => (item.id === asset.id ? mergeAssetRecord(item, asset) : item)),
          })),
        };
      }

      if (old.pages.length === 0) {
        return {
          pages: [{ items: [asset], nextCursor: null, totalAssetsCount: 1 }],
          pageParams: [undefined],
        };
      }

      const [first, ...rest] = old.pages;
      return {
        ...old,
        pages: [
          {
            ...first,
            items: [asset, ...first.items],
            totalAssetsCount:
              typeof first.totalAssetsCount === 'number' ? first.totalAssetsCount + 1 : first.totalAssetsCount,
          },
          ...rest,
        ],
      };
    });
  }
};

// Workspaces Hook
export const useWorkspaces = () => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return getWorkspacesApi(token);
    },
  });
};

// Assets Hooks
export const useAssets = (tenantId: string, filters?: AssetListFilters, take: number = 20) => {
  const { getToken } = useAuth();
  return useInfiniteQuery({
    queryKey: ['assets', tenantId, filters],
    queryFn: async ({ pageParam = undefined }: { pageParam?: string }) => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      const res = await getAssetsApi(token, tenantId, pageParam, filters, take);
      return res; 
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!tenantId,
  });
};

export const useUploadAsset = (tenantId: string, folderId?: string | null) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return uploadAssetDirect(token, file, tenantId, folderId);
    },
    onSuccess: (asset) => {
      upsertAssetInAssetsCache(queryClient, tenantId, asset, { insertIfMissing: true });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });

      const signal = startThumbnailPollController(asset.id);
      void (async () => {
        try {
          const token = await getToken();
          if (!token || signal.aborted) return;
          const readyAsset = await pollAssetUntilThumbnails(token, asset.id, tenantId, signal);
          if (signal.aborted) return;
          if (readyAsset && (hasRemoteAssetUrl(readyAsset.thumbnailUrl) || hasRemoteAssetUrl(readyAsset.previewUrl))) {
            clearLocalPreview(asset.id);
            upsertAssetInAssetsCache(queryClient, tenantId, {
              ...readyAsset,
              isProcessingPreview: false,
              localPreviewUrl: undefined,
            });
            return;
          }
          markLocalPreviewSettled(asset.id);
          upsertAssetInAssetsCache(queryClient, tenantId, {
            ...asset,
            isProcessingPreview: false,
          });
        } catch {
          if (signal.aborted) return;
          markLocalPreviewSettled(asset.id);
          upsertAssetInAssetsCache(queryClient, tenantId, {
            ...asset,
            isProcessingPreview: false,
          });
        } finally {
          stopThumbnailPoll(asset.id);
        }
      })();
    }
  });
};

export const useDeleteAsset = (tenantId: string) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assetId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return deleteAssetApi(token, assetId, tenantId);
    },
    onSuccess: (_data, assetId) => {
      stopThumbnailPoll(assetId);
      clearLocalPreview(assetId);
      queryClient.invalidateQueries({ queryKey: ['assets', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    }
  });
};

export const useRenameAsset = (tenantId: string) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assetId, name }: { assetId: string, name: string }) => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return renameAssetApi(token, assetId, name, tenantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', tenantId] });
    }
  });
};

export const useMoveAsset = (tenantId: string) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assetId, folderId }: { assetId: string; folderId: string | null }) => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return moveAssetApi(token, assetId, folderId, tenantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['folders', tenantId] });
    },
  });
};

export const useAssetDownloadUrl = () => {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ assetId, tenantId }: { assetId: string, tenantId: string }) => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return getAssetDownloadUrlApi(token, assetId, tenantId);
    }
  });
};

export const useToggleFavourite = (tenantId: string) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assetId, isCurrentlyFavourite }: { assetId: string, isCurrentlyFavourite: boolean }) => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return toggleAssetFavouriteApi(token, assetId, tenantId, isCurrentlyFavourite);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', tenantId] });
    }
  });
};
