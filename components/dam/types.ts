export type NavCategory = 
  | 'overview'
  | 'media-assets'
  | 'collections'
  | 'shared'
  | 'recent'
  | 'favorites'
  | 'trash'
  | 'settings';

export type AssetStatus = "UPLOADING" | "READY" | "FAILED";

export type ApiAsset = {
  id: string;
  tenantId: string;
  userId: string;
  name: string;
  mimeType: string;
  sizeBytes: string;
  storageKey: string;
  checksum: string | null;
  status: AssetStatus;
  createdAt: string;
  updatedAt: string;
};

export type AssetType = 'image' | 'video' | 'document' | 'design' | 'audio';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  extension: string;
  size: string;
  sizeBytes: number;
  dimensions?: string;
  duration?: string;
  thumbnailUrl: string;
  previewUrl?: string;
  updatedAt: string;
  createdAt: string;
  owner: {
    name: string;
    avatarUrl: string;
    email: string;
  };
  isFavorite: boolean;
  isShared?: boolean;
  tags: string[];
  description?: string;
  path: string;
}


export interface Workspace {
  id: string;
  name?: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
}

export type ApiError = {
  error: string;
  details?: Array<{ path: string; message: string; code: string }>;
};

export interface DAMStat {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
}

export type ViewMode = 'grid' | 'list';

export type FilterCategory = 'all' | 'image' | 'video' | 'document' | 'favorites';

export type SortBy = 'updatedAt' | 'name' | 'size' | 'type';
