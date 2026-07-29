const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

import { Folder, FolderTreeNode, Workspace } from '@/components/dam/types';

interface FetchOptions extends RequestInit {
  tenantId?: string;
}

async function foldersFetch<T>(path: string, token: string, opts: FetchOptions): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string> || {}),
  };

  if (opts.tenantId) {
    headers["X-Tenant-Id"] = opts.tenantId;
  }

  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw Object.assign(new Error(data.error || "Request failed"), { status: res.status, data });
  }
  return data as T;
}

export const getWorkspacesApi = async (token: string): Promise<Workspace[]> => {
  // Placeholder, assumes backend returns { workspaces: Workspace[] } or Workspace[]
  const res = await foldersFetch<any>('/api/workspaces/me', token, {});
  return res.workspaces || res;
};

export const getFoldersApi = async (
  token: string, 
  tenantId?: string, 
  parentId?: string, 
  tree?: boolean
): Promise<Folder[] | FolderTreeNode[]> => {
  const query = new URLSearchParams();
  if (parentId) query.append('parentId', parentId);
  if (tree) query.append('tree', 'true');
  
  const queryString = query.toString();
  const path = `/api/folders${queryString ? `?${queryString}` : ''}`;
  
  const res = await foldersFetch<any>(path, token, { tenantId });
  return res.folders || (Array.isArray(res) ? res : []);
};

export const getFolderApi = async (token: string, id: string, tenantId?: string): Promise<Folder> => {
  const res = await foldersFetch<{ folder: Folder }>(`/api/folders/${id}`, token, { tenantId });
  return res.folder;
};

export const createFolderApi = async (
  token: string, 
  name: string, 
  parentId?: string | null, 
  tenantId?: string
): Promise<Folder> => {
  const res = await foldersFetch<{ folder: Folder }>('/api/folders', token, {
    method: 'POST',
    body: JSON.stringify({ name, parentId, tenantId }),
    tenantId,
  });
  return res.folder;
};

export const updateFolderApi = async (
  token: string, 
  id: string, 
  data: { name?: string; parentId?: string | null }, 
  tenantId?: string
): Promise<Folder> => {
  const res = await foldersFetch<{ folder: Folder }>(`/api/folders/${id}`, token, {
    method: 'PATCH',
    body: JSON.stringify(data),
    tenantId,
  });
  return res.folder;
};

export const deleteFolderApi = async (token: string, id: string, tenantId?: string): Promise<{ deleted: boolean; id: string }> => {
  return foldersFetch<{ deleted: boolean; id: string }>(`/api/folders/${id}`, token, {
    method: 'DELETE',
    tenantId,
  });
};
