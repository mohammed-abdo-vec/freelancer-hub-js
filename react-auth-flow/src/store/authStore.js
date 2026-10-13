// =============================================================================
//  ZUSTAND — client state: "am I logged in, and with which token?"
//
//  Rule of thumb for this project:
//    Zustand      → state the CLIENT owns   (access token, auth status)
//    React Query  → state the SERVER owns   (the user profile, notes, stats)
//
//  The user object is NOT stored here. It comes from GET /api/me through
//  React Query (see features/auth/hooks.js). One source of truth per thing.
// =============================================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      // 'checking'      → app just loaded, we're asking the server "do I have a session?"
      // 'authenticated' → we have an access token
      // 'guest'         → no session
      status: 'checking',
      accessToken: null,
      expiresAt: null, // ms timestamp, only used by the debug panel countdown

      // Remembered on the login form. Harmless to persist — unlike the token.
      lastEmail: '',

      setSession: ({ accessToken, expiresAt }) => set({ status: 'authenticated', accessToken, expiresAt }),
      clearSession: () => set({ status: 'guest', accessToken: null, expiresAt: null }),
      rememberEmail: (email) => set({ lastEmail: email }),
    }),
    {
      name: 'auth-prefs',
      // ⚠️ partialize = WHICH keys go to localStorage. Only lastEmail.
      // If the access token were in localStorage, any XSS script could steal it.
      // On reload we get a fresh token from the httpOnly refresh cookie instead.
      partialize: (state) => ({ lastEmail: state.lastEmail }),
    },
  ),
);

// Selectors — components subscribe to just the slice they need,
// so they only re-render when THAT value changes.
export const useAuthStatus = () => useAuthStore((s) => s.status);
export const useIsAuthenticated = () => useAuthStore((s) => s.status === 'authenticated');
