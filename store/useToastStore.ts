import { create } from 'zustand';

interface ToastState {
  message: string | null;
  triggerToast: (msg: string) => void;
  clearToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  triggerToast: (msg: string) => {
    set({ message: msg });
    setTimeout(() => {
      set({ message: null });
    }, 3000);
  },
  clearToast: () => set({ message: null }),
}));
