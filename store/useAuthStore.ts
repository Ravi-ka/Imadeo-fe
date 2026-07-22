import { create } from 'zustand';

interface UserDetails {
  id?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  [key: string]: any;
}

interface AuthState {
  token: string | null;
  userdetails: UserDetails | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (token: string, userdetails: UserDetails) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('imadeo_token') : null,
  userdetails: typeof window !== 'undefined' && localStorage.getItem('imadeo_user') && localStorage.getItem('imadeo_user') !== 'undefined' ? JSON.parse(localStorage.getItem('imadeo_user') as string) : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('imadeo_token') : false,
  isLoading: false,
  error: null,
  login: (token, userdetails) => {
    localStorage.setItem('imadeo_token', token);
    localStorage.setItem('imadeo_user', JSON.stringify(userdetails));
    set({ token, userdetails, isAuthenticated: true, error: null });
  },
  logout: () => {
    localStorage.removeItem('imadeo_token');
    localStorage.removeItem('imadeo_user');
    set({ token: null, userdetails: null, isAuthenticated: false });
  },
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

interface UIState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'dark', // Default to modern premium dark mode
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'light' ? 'dark' : 'light';
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove(state.theme);
      root.classList.add(nextTheme);
      localStorage.setItem('imadeo_theme', nextTheme);
    }
    return { theme: nextTheme };
  }),
  setTheme: (theme) => set(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      localStorage.setItem('imadeo_theme', theme);
    }
    return { theme };
  })
}));
