const API = process.env.NEXT_PUBLIC_API_URL || 'https://api-dev.imadeo.in';

import { Folder, FolderNode } from '@/components/dam/types';

interface FetchOptions extends RequestInit {
  tenantId?: string;
}

async function foldersFetch<T>(path: string, token: string, opts: FetchOptions): Promise<T> {
  const { tenantId, headers, ...rest } = opts;
  const reqHeaders: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...(headers as Record<string, string> || {}),
  };

  if (tenantId) {
    reqHeaders['X-Tenant-Id'] = tenantId;
  }

  const res = await fetch(`${API}${path}`, {
    ...rest,
    headers: reqHeaders,
  });

  const data = await res.json();
  if (!res.ok) {
    throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status, data });
  }
  return data as T;
}

/** Full workspace tree. Empty workspace → `{ items: [] }`. */
export const getFolderTreeApi = async (
  token: string,
  tenantId?: string
): Promise<FolderNode[]> => {
  const res = await foldersFetch<{ items: FolderNode[] }>('/api/folders', token, { tenantId });
  return res.items || [];
};

/** Direct children only. Parent missing → 404. */
export const getFolderChildrenApi = async (
  token: string,
  parentId: string,
  tenantId?: string
): Promise<Folder[]> => {
  const res = await foldersFetch<{ items: Folder[] }>(
    `/api/folders?parentId=${encodeURIComponent(parentId)}`,
    token,
    { tenantId }
  );
  return res.items || [];
};

export const getFolderApi = async (
  token: string,
  id: string,
  tenantId?: string
): Promise<Folder> => {
  const res = await foldersFetch<{ folder: Folder }>(`/api/folders/${id}`, token, { tenantId });
  return res.folder;
};

export const createFolderApi = async (
  token: string,
  name: string,
  parentId?: string | null,
  tenantId?: string
): Promise<Folder> => {
  const body: { name: string; parentId?: string } = { name };
  if (parentId) body.parentId = parentId;

  const res = await foldersFetch<{ folder: Folder }>('/api/folders', token, {
    method: 'POST',
    body: JSON.stringify(body),
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

export const deleteFolderApi = async (
  token: string,
  id: string,
  tenantId?: string
): Promise<{ deleted: boolean; id: string; deletedAssetCount: number }> => {
  return foldersFetch<{ deleted: boolean; id: string; deletedAssetCount: number }>(
    `/api/folders/${id}`,
    token,
    {
      method: 'DELETE',
      tenantId,
    }
  );
};
