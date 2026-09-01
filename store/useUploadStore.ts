import { create } from 'zustand';

interface UploadState {
  isUploadOpen: boolean;
  /** Current folder for uploads; null = workspace root. */
  uploadFolderId: string | null;
  openUpload: (folderId?: string | null) => void;
  closeUpload: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  isUploadOpen: false,
  uploadFolderId: null,
  openUpload: (folderId = null) => set({ isUploadOpen: true, uploadFolderId: folderId ?? null }),
  closeUpload: () => set({ isUploadOpen: false }),
}));
