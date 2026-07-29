const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

import { Asset } from '@/components/dam/types';

interface FetchOptions extends RequestInit {
  tenantId?: string;
}

async function assetsFetch<T>(path: string, token: string, opts: FetchOptions): Promise<T> {
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

export const getAssetsApi = async (
  token: string, 
  tenantId?: string, 
  folderId?: string | null,
  root?: boolean
): Promise<Asset[]> => {
  const query = new URLSearchParams();
  if (folderId) query.append('folderId', folderId);
  if (root) query.append('root', 'true');
  
  const queryString = query.toString();
  const path = `/api/assets${queryString ? `?${queryString}` : ''}`;
  
  const res = await assetsFetch<any>(path, token, { tenantId });
  return res.assets || (Array.isArray(res) ? res : []);
};

export const presignAssetApi = async (
  token: string,
  data: { name: string; mimeType: string; sizeBytes: number; folderId?: string | null },
  tenantId?: string
): Promise<{ uploadUrl: string; assetId: string }> => {
  return assetsFetch<{ uploadUrl: string; assetId: string }>('/api/assets/presign', token, {
    method: 'POST',
    body: JSON.stringify(data),
    tenantId,
  });
};

export const completeAssetUploadApi = async (
  token: string,
  assetId: string,
  tenantId?: string
): Promise<{ asset: Asset }> => {
  return assetsFetch<{ asset: Asset }>(`/api/assets/${assetId}/complete`, token, {
    method: 'POST',
    tenantId,
  });
};

export const moveAssetApi = async (
  token: string,
  id: string,
  folderId: string | null,
  tenantId?: string
): Promise<Asset> => {
  const res = await assetsFetch<{ asset: Asset }>(`/api/assets/${id}`, token, {
    method: 'PATCH',
    body: JSON.stringify({ folderId }),
    tenantId,
  });
  return res.asset;
};
