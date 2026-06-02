/**
 * Nila Arumbu — Auth Store (Zustand + persist)
 * Stores tokens and user profile. Connects to real backend.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';
import type { TokenResponse, UserRead } from '../lib/types';

interface AuthState {
  access_token: string | null;
  refresh_token: string | null;
  user: UserRead | null;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  loadMe: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      access_token: null,
      refresh_token: null,
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const tokens = await api.post<TokenResponse>('/auth/login', { email, password });
        set({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          isAuthenticated: true,
        });
        // Load user profile immediately after login
        await get().loadMe();
      },

      loadMe: async () => {
        try {
          const user = await api.get<UserRead>('/auth/me');
          set({ user });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },

      logout: () =>
        set({ access_token: null, refresh_token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'nilarumbu-auth',
      // Only persist tokens — user profile is re-fetched on load
      partialize: (state) => ({
        access_token: state.access_token,
        refresh_token: state.refresh_token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
