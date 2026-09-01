import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import {
  getFolderTreeApi,
  getFolderChildrenApi,
  getFolderApi,
  createFolderApi,
  updateFolderApi,
  deleteFolderApi,
} from '@/services/folderService';
import { Folder, FolderNode } from '@/components/dam/types';

const EMPTY_TREE: FolderNode[] = [];
const EMPTY_FOLDERS: Folder[] = [];

/** Full workspace folder tree for sidebar / breadcrumbs. */
export const useFolderTree = (tenantId: string) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['folders', tenantId, 'tree'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return getFolderTreeApi(token, tenantId);
    },
    enabled: !!tenantId,
    placeholderData: EMPTY_TREE,
  });
};

/** Direct children of a folder (or skip when at root — use tree roots instead). */
export const useFolderChildren = (tenantId: string, parentId: string | null) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['folders', tenantId, 'children', parentId || 'root'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      if (!parentId) return EMPTY_FOLDERS;
      return getFolderChildrenApi(token, parentId, tenantId);
    },
    enabled: !!tenantId && !!parentId,
    placeholderData: EMPTY_FOLDERS,
  });
};

export const useFolder = (tenantId: string, id: string | null) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['folder', tenantId, id],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return getFolderApi(token, id!, tenantId);
    },
    enabled: !!tenantId && !!id,
  });
};

const invalidateFolderQueries = (queryClient: ReturnType<typeof useQueryClient>, tenantId: string) => {
  queryClient.invalidateQueries({ queryKey: ['folders', tenantId] });
  queryClient.invalidateQueries({ queryKey: ['folder', tenantId] });
};

export const useCreateFolder = (tenantId: string) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, parentId }: { name: string; parentId?: string | null }) => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return createFolderApi(token, name, parentId, tenantId);
    },
    onSuccess: () => {
      invalidateFolderQueries(queryClient, tenantId);
    },
  });
};

export const useUpdateFolder = (tenantId: string) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; parentId?: string | null };
    }) => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return updateFolderApi(token, id, data, tenantId);
    },
    onSuccess: () => {
      invalidateFolderQueries(queryClient, tenantId);
    },
  });
};

export const useDeleteFolder = (tenantId: string) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return deleteFolderApi(token, id, tenantId);
    },
    onSuccess: () => {
      invalidateFolderQueries(queryClient, tenantId);
      queryClient.invalidateQueries({ queryKey: ['assets', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};
