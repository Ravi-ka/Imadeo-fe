import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface TenantState {
  imadeoId: string | null;
  ownerUserId: string | null;
  setImadeoId: (id: string | null, ownerUserId?: string | null) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      imadeoId: null,
      ownerUserId: null,
      setImadeoId: (id, ownerUserId) =>
        set({
          imadeoId: id,
          ownerUserId: id ? ownerUserId ?? null : null,
        }),
      clearTenant: () => set({ imadeoId: null, ownerUserId: null }),
    }),
    {
      name: 'imadeo-tenant-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ imadeoId: state.imadeoId, ownerUserId: state.ownerUserId }),
    }
  )
);
