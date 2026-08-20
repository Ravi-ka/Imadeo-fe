const API = process.env.NEXT_PUBLIC_API_URL || 'https://api-dev.imadeo.in';

import { Asset, ApiAsset } from '@/components/dam/types';

interface FetchOptions extends RequestInit {
  tenantId?: string;
}

export async function assetsFetch<T>(path: string, token: string, opts: FetchOptions): Promise<T> {
  const { tenantId, headers, ...rest } = opts;
  const reqHeaders: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...(headers as Record<string, string> || {}),
  };

  if (tenantId) {
    reqHeaders["x-tenant-id"] = tenantId;
  }

  const res = await fetch(`${API}${path}`, {
    ...rest,
    headers: reqHeaders,
  });

  const data = await res.json();
  if (!res.ok) {
    throw Object.assign(new Error(data.error || "Request failed"), { status: res.status, data });
  }
  return data as T;
}

// Mapper to map ApiAsset to UI Asset
export const mapBackendAssetToFrontend = (apiAsset: ApiAsset): Asset => {
  const sizeBytes = Number(apiAsset.sizeBytes);
  const sizeMB = sizeBytes / (1024 * 1024);
  const sizeStr = sizeMB > 1 ? `${sizeMB.toFixed(1)} MB` : `${(sizeBytes / 1024).toFixed(1)} KB`;
  
  const extMatch = apiAsset.name.match(/\.([a-z0-9]+)$/i);
  const extension = extMatch ? extMatch[1].toUpperCase() : 'FILE';
  
  let type: Asset['type'] = 'document';
  if (apiAsset.mimeType.startsWith('image/')) type = 'image';
  else if (apiAsset.mimeType.startsWith('video/')) type = 'video';
  else if (apiAsset.mimeType.startsWith('audio/')) type = 'audio';
  
  // Create a placeholder thumbnail based on type
  let thumbnailUrl = '';
  if (type === 'image') {
    thumbnailUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
  } else if (type === 'video') {
    thumbnailUrl = 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80';
  } else {
    thumbnailUrl = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';
  }

  return {
    id: apiAsset.id,
    name: apiAsset.name,
    type,
    extension,
    size: sizeStr,
    sizeBytes,
    thumbnailUrl,
    updatedAt: new Date(apiAsset.updatedAt).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    createdAt: apiAsset.createdAt,
    owner: {
      name: 'System User', // mock since we only have userId
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      email: 'user@imadeo.io'
    },
    isFavorite: apiAsset.isFavourite || false,
    tags: [],
    path: `/Root/${apiAsset.name}`
  };
};

export const getAssetsApi = async (
  token: string, 
  tenantId?: string,
  cursor?: string,
  filters?: {
    favourite?: boolean;
    type?: string;
    search?: string;
    status?: string;
  },
  take: number = 20
): Promise<{ items: Asset[], nextCursor: string | null }> => {
  const q = new URLSearchParams({ take: take.toString() });
  if (cursor) q.append("cursor", cursor);
  
  if (filters?.favourite) q.append("favourite", "true");
  if (filters?.type) q.append("type", filters.type);
  if (filters?.search) q.append("search", filters.search);
  if (filters?.status) q.append("status", filters.status);
  
  const path = `/api/assets?${q}`;
  
  const res = await assetsFetch<{ items: ApiAsset[], nextCursor: string | null }>(path, token, { tenantId });
  
  return {
    items: (res.items || []).map(mapBackendAssetToFrontend),
    nextCursor: res.nextCursor
  };
};

export const presignAssetApi = async (
  token: string,
  data: { name: string; mimeType: string; sizeBytes: number },
  tenantId?: string
): Promise<{ uploadUrl: string; assetId: string, expiresIn: number, headers: { "Content-Type": string } }> => {
  return assetsFetch<{ uploadUrl: string; assetId: string, expiresIn: number, headers: { "Content-Type": string } }>('/api/assets/presign', token, {
    method: 'POST',
    body: JSON.stringify(data),
    tenantId,
  });
};

export const completeAssetUploadApi = async (
  token: string,
  assetId: string,
  tenantId?: string
): Promise<{ asset: ApiAsset }> => {
  return assetsFetch<{ asset: ApiAsset }>(`/api/assets/${assetId}/complete`, token, {
    method: 'POST',
    tenantId,
  });
};

export const deleteAssetApi = async (
  token: string,
  assetId: string,
  tenantId?: string
): Promise<{ deleted: boolean, id: string }> => {
  return assetsFetch<{ deleted: boolean, id: string }>(`/api/assets/${assetId}`, token, {
    method: 'DELETE',
    tenantId,
  });
};

export const renameAssetApi = async (
  token: string,
  assetId: string,
  name: string,
  tenantId?: string
): Promise<{ asset: ApiAsset }> => {
  return assetsFetch<{ asset: ApiAsset }>(`/api/assets/${assetId}`, token, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
    tenantId,
  });
};

export const getAssetDownloadUrlApi = async (
  token: string,
  assetId: string,
  tenantId?: string
): Promise<{ assetId: string, downloadUrl: string, expiresIn: number }> => {
  return assetsFetch<{ assetId: string, downloadUrl: string, expiresIn: number }>(`/api/assets/${assetId}/download-url`, token, {
    method: 'GET',
    tenantId,
  });
};

export const uploadAssetDirect = async (
  token: string,
  file: File,
  tenantId: string
): Promise<Asset> => {
  const presign = await presignAssetApi(token, {
    name: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
  }, tenantId);

  const putRes = await fetch(presign.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  
  if (!putRes.ok) throw new Error("Direct upload to storage failed");

  const { asset } = await completeAssetUploadApi(token, presign.assetId, tenantId);
  return mapBackendAssetToFrontend(asset);
};

export const toggleAssetFavouriteApi = async (
  token: string,
  assetId: string,
  tenantId?: string,
  isCurrentlyFavourite?: boolean
): Promise<any> => {
  const method = isCurrentlyFavourite ? 'DELETE' : 'POST';
  return assetsFetch(`/api/assets/${assetId}/favourite`, token, {
    method,
    tenantId,
  });
};

