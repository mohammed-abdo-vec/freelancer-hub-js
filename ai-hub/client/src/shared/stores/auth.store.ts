import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/shared/types/api';

interface AuthState {
  token: string | null;
  user: User | null;
  setSession(token: string, user: User): void;
  setUser(user: User): void;
  clearSession(): void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      clearSession: () => set({ token: null, user: null }),
    }),
    {
      name: 'ai-hub-auth',
      // Only the session itself goes to localStorage, never the actions
      partialize: ({ token, user }) => ({ token, user }),
    },
  ),
);
