import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { getWorkspacesApi } from '@/services/workspaceService';
import { 
  getAssetsApi, 
  uploadAssetDirect,
  deleteAssetApi,
  renameAssetApi,
  getAssetDownloadUrlApi,
  toggleAssetFavouriteApi
} from '@/services/assetService';

// Workspaces Hook
export const useWorkspaces = () => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error('No token');
      return getWorkspacesApi(token);
    },
  });
};

// Assets Hooks
export const useAssets = (tenantId: string, favourite?: boolean) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['assets', tenantId, favourite],
    queryFn: async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error('No token');
      const res = await getAssetsApi(token, tenantId, undefined, favourite);
      return res.items; // for now just returning items without infinite scroll
    },
    enabled: !!tenantId,
  });
};

export const useUploadAsset = (tenantId: string) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error('No token');
      return uploadAssetDirect(token, file, tenantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    }
  });
};

export const useDeleteAsset = (tenantId: string) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assetId: string) => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error('No token');
      return deleteAssetApi(token, assetId, tenantId);
    },
    onSuccess: () => {
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
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error('No token');
      return renameAssetApi(token, assetId, name, tenantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', tenantId] });
    }
  });
};

export const useAssetDownloadUrl = () => {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ assetId, tenantId }: { assetId: string, tenantId: string }) => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error('No token');
      return getAssetDownloadUrlApi(token, assetId, tenantId);
    }
  });
};

export const useToggleFavourite = (tenantId: string) => {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ assetId, isCurrentlyFavourite }: { assetId: string, isCurrentlyFavourite: boolean }) => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error('No token');
      return toggleAssetFavouriteApi(token, assetId, tenantId, isCurrentlyFavourite);
    }
  });
};
