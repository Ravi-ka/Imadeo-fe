import { create } from 'zustand';

interface TenantState {
  imadeoId: string | null;
  setImadeoId: (id: string | null) => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  imadeoId: null,
  setImadeoId: (id) => set({ imadeoId: id }),
}));
