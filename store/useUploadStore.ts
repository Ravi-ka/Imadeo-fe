import { create } from 'zustand';
import { Asset } from '@/components/dam/types';

interface UploadState {
  isUploadOpen: boolean;
  openUpload: () => void;
  closeUpload: () => void;
  // This will be called by UploadModal when success happens. 
  // We can let the pages subscribe to a global event, or handle it via react-query cache invalidation.
  // We'll just trigger a toast for now since react-query will re-fetch or we can invalidate query.
}

export const useUploadStore = create<UploadState>((set) => ({
  isUploadOpen: false,
  openUpload: () => set({ isUploadOpen: true }),
  closeUpload: () => set({ isUploadOpen: false }),
}));
