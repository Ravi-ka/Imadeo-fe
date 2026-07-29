import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import {
  getWorkspacesApi,
  getFoldersApi,
  getFolderApi,
  createFolderApi,
  updateFolderApi,
  deleteFolderApi
} from '@/services/folderService';
import { getAssetsApi, moveAssetApi } from '@/services/assetService';

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

// Folders Hooks
export const useFolders = (tenantId: string, parentId?: string | null) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['folders', tenantId, parentId || 'root'],
    queryFn: async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error('No token');
      return getFoldersApi(token, tenantId, parentId || undefined, false);
    },
    enabled: !!tenantId,
  });
};

export const useFolderTree = (tenantId: string) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['folders', tenantId, 'tree'],
    queryFn: async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error('No token');
      return getFoldersApi(token, tenantId, undefined, true);
    },
    enabled: !!tenantId,
  });
};

export const useFolder = (tenantId: string, id: string) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['folder', tenantId, id],
    queryFn: async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error('No token');
      return getFolderApi(token, id, tenantId);
    },
    enabled: !!tenantId && !!id,
  });
};

// Folder Mutations
export const useCreateFolder = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ tenantId, name, parentId }: { tenantId: string; name: string; parentId?: string | null }) => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error('No token');
      return createFolderApi(token, name, parentId, tenantId);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['folders', variables.tenantId, variables.parentId || 'root'] });
      queryClient.invalidateQueries({ queryKey: ['folders', variables.tenantId, 'tree'] });
    },
  });
};

export const useUpdateFolder = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ tenantId, id, data }: { tenantId: string; id: string; data: { name?: string; parentId?: string | null } }) => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error('No token');
      return updateFolderApi(token, id, data, tenantId);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['folders', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['folder', variables.tenantId, variables.id] });
    },
  });
};

export const useDeleteFolder = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ tenantId, id }: { tenantId: string; id: string }) => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error('No token');
      return deleteFolderApi(token, id, tenantId);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['folders', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['assets', variables.tenantId] });
    },
  });
};

// Assets Hooks
export const useAssets = (tenantId: string, folderId: string | null) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['assets', tenantId, folderId || 'root'],
    queryFn: async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error('No token');
      return getAssetsApi(token, tenantId, folderId, !folderId);
    },
    enabled: !!tenantId,
  });
};

export const useMoveAsset = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ tenantId, id, folderId }: { tenantId: string; id: string; folderId: string | null }) => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error('No token');
      return moveAssetApi(token, id, folderId, tenantId);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assets', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['folders', variables.tenantId] });
    },
  });
};
