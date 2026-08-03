import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { getWorkspacesApi } from '@/services/workspaceService';
import { getAssetsApi } from '@/services/assetService';

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
export const useAssets = (tenantId: string) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['assets', tenantId],
    queryFn: async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error('No token');
      return getAssetsApi(token, tenantId);
    },
    enabled: !!tenantId,
  });
};
