const API = process.env.NEXT_PUBLIC_API_URL || 'https://api-dev.imadeo.in';

import { Asset, ApiAsset, AssetType } from '@/components/dam/types';

const localPreviewByAssetId = new Map<string, string>();
const settledLocalPreviewIds = new Set<string>();
const thumbnailPollControllers = new Map<string, AbortController>();
const THUMBNAIL_POLL_DELAYS_MS = [2000, 1500, 2000, 3000, 4000];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const hasRemoteAssetUrl = (url?: string | null): boolean =>
  Boolean(url && !url.startsWith('blob:'));

export const getLocalPreview = (assetId: string): string | undefined =>
  localPreviewByAssetId.get(assetId);

export const registerLocalPreview = (assetId: string, url: string) => {
  const previous = localPreviewByAssetId.get(assetId);
  if (previous && previous !== url) {
    URL.revokeObjectURL(previous);
  }
  localPreviewByAssetId.set(assetId, url);
};

export const clearLocalPreview = (assetId: string) => {
  const url = localPreviewByAssetId.get(assetId);
  if (url) {
    URL.revokeObjectURL(url);
    localPreviewByAssetId.delete(assetId);
  }
  settledLocalPreviewIds.delete(assetId);
};

export const markLocalPreviewSettled = (assetId: string) => {
  settledLocalPreviewIds.add(assetId);
};

export const stopThumbnailPoll = (assetId: string) => {
  const controller = thumbnailPollControllers.get(assetId);
  controller?.abort();
  thumbnailPollControllers.delete(assetId);
};

export const startThumbnailPollController = (assetId: string): AbortSignal => {
  stopThumbnailPoll(assetId);
  const controller = new AbortController();
  thumbnailPollControllers.set(assetId, controller);
  return controller.signal;
};

const unwrapApiAsset = (res: unknown): ApiAsset | null => {
  if (!res || typeof res !== 'object') return null;
  if ('asset' in res) {
    const nested = (res as { asset?: unknown }).asset;
    if (nested && typeof nested === 'object' && 'id' in nested) {
      return nested as ApiAsset;
    }
  }
  if ('id' in res && 'mimeType' in res) {
    return res as ApiAsset;
  }
  return null;
};

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
  
  let type: AssetType = 'document';
  if (apiAsset.mimeType.startsWith('image/')) type = 'image';
  else if (apiAsset.mimeType.startsWith('video/')) type = 'video';
  else if (apiAsset.mimeType.startsWith('audio/')) type = 'audio';

  const localPreview = getLocalPreview(apiAsset.id);
  const hasRemoteThumbnail = hasRemoteAssetUrl(apiAsset.thumbnailUrl);
  const thumbnailUrl = apiAsset.thumbnailUrl || localPreview || undefined;
  const previewUrl = apiAsset.previewUrl || ((type === 'image' || type === 'video') ? localPreview : undefined);
  const updatedAtSource = apiAsset.updatedAt || apiAsset.createdAt;

  return {
    id: apiAsset.id,
    name: apiAsset.name,
    type,
    extension,
    size: sizeStr,
    sizeBytes,
    thumbnailUrl,
    previewUrl,
    status: apiAsset.status,
    isProcessingPreview: Boolean(localPreview) && !hasRemoteThumbnail && !settledLocalPreviewIds.has(apiAsset.id),
    localPreviewUrl: hasRemoteThumbnail ? undefined : localPreview,
    updatedAt: new Date(updatedAtSource).toLocaleString(undefined, {
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
): Promise<{ 
  items: Asset[], 
  nextCursor: string | null,
  totalAssetsCount?: number,
  countByAssetType?: { _count: number, mimeType: string }[] 
}> => {
  const q = new URLSearchParams({ take: take.toString() });
  if (cursor) q.append("cursor", cursor);
  
  if (filters?.favourite) q.append("favourite", "true");
  if (filters?.type) q.append("type", filters.type);
  if (filters?.search) q.append("search", filters.search);
  if (filters?.status) q.append("status", filters.status);
  
  const path = `/api/assets?${q}`;
  
  const res = await assetsFetch<{ 
    items: ApiAsset[], 
    nextCursor: string | null,
    totalAssetsCount?: number,
    countByAssetType?: { _count: number, mimeType: string }[] 
  }>(path, token, { tenantId });
  
  return {
    items: (res.items || []).map(mapBackendAssetToFrontend),
    nextCursor: res.nextCursor,
    totalAssetsCount: res.totalAssetsCount,
    countByAssetType: res.countByAssetType
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

export const getAssetByIdApi = async (
  token: string,
  assetId: string,
  tenantId?: string
): Promise<Asset> => {
  try {
    const res = await assetsFetch<unknown>(`/api/assets/${assetId}`, token, {
      method: 'GET',
      tenantId,
    });
    const apiAsset = unwrapApiAsset(res);
    if (!apiAsset) {
      throw Object.assign(new Error('Asset not found'), { status: 404 });
    }
    return mapBackendAssetToFrontend(apiAsset);
  } catch (e: any) {
    if (e.status === 404 || e.status === 405 || e.status === 400) {
      const list = await getAssetsApi(token, tenantId, undefined, { status: 'READY' }, 20);
      const found = list.items.find((item) => item.id === assetId);
      if (found) return found;
    }
    throw e;
  }
};

export const pollAssetUntilThumbnails = async (
  token: string,
  assetId: string,
  tenantId: string,
  signal?: AbortSignal
): Promise<Asset | null> => {
  for (const delay of THUMBNAIL_POLL_DELAYS_MS) {
    if (signal?.aborted) return null;
    await sleep(delay);
    if (signal?.aborted) return null;

    try {
      const asset = await getAssetByIdApi(token, assetId, tenantId);
      if (hasRemoteAssetUrl(asset.thumbnailUrl) || hasRemoteAssetUrl(asset.previewUrl)) {
        return asset;
      }
    } catch (e: any) {
      if (e?.name === 'AbortError' || signal?.aborted) return null;
    }
  }
  return null;
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

  const canLocalPreview = file.type.startsWith('image/') || file.type.startsWith('video/');
  if (canLocalPreview) {
    registerLocalPreview(presign.assetId, URL.createObjectURL(file));
  }

  try {
    const putRes = await fetch(presign.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });

    if (!putRes.ok) throw new Error("Direct upload to storage failed");

    const { asset } = await completeAssetUploadApi(token, presign.assetId, tenantId);
    if (hasRemoteAssetUrl(asset.thumbnailUrl)) {
      clearLocalPreview(presign.assetId);
    }
    const mapped = mapBackendAssetToFrontend(asset);
    return {
      ...mapped,
      isProcessingPreview: !hasRemoteAssetUrl(asset.thumbnailUrl),
    };
  } catch (error) {
    clearLocalPreview(presign.assetId);
    throw error;
  }
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

