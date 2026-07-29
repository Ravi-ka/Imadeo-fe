export type NavCategory = 
  | 'overview'
  | 'media-assets'
  | 'collections'
  | 'folders'
  | 'shared'
  | 'recent'
  | 'favorites'
  | 'trash'
  | 'settings';

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
  folderId?: string;
  tags: string[];
  description?: string;
  path: string;
}

export interface Folder {
  id: string;
  tenantId: string;
  userId: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { children: number; assets: number };
}

export type FolderTreeNode = Folder & { children: FolderTreeNode[] };

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
