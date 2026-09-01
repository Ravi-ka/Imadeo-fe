export type NavCategory = 
  | 'overview'
  | 'media-assets'
  | 'image-converter'
  | 'usage-analytics'
  | 'recent'
  | 'favorites'
  | 'integrations'
  | 'settings';

export type AssetStatus = "UPLOADING" | "READY" | "FAILED";

export type ApiAsset = {
  id: string;
  tenantId?: string;
  userId?: string;
  name: string;
  mimeType: string;
  sizeBytes: string;
  storageKey?: string;
  checksum?: string | null;
  status: AssetStatus;
  thumbnailKey?: string | null;
  previewKey?: string | null;
  thumbnailUrl?: string | null;
  previewUrl?: string | null;
  createdAt: string;
  updatedAt?: string;
  isFavourite: boolean;
  folderId?: string | null;
};

export const FOLDER_MAX_DEPTH = 3;

export type Folder = {
  id: string;
  tenantId: string;
  userId: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FolderNode = {
  id: string;
  name: string;
  parentId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  children: FolderNode[];
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
  thumbnailUrl?: string;
  previewUrl?: string;
  status?: AssetStatus;
  isProcessingPreview?: boolean;
  localPreviewUrl?: string;
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
  path?: string;
  folderId?: string | null;
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
