import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface TenantState {
  imadeoId: string | null;
  setImadeoId: (id: string | null) => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      imadeoId: null,
      setImadeoId: (id) => set({ imadeoId: id }),
    }),
    {
      name: 'imadeo-tenant-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ imadeoId: state.imadeoId }),
    }
  )
);
