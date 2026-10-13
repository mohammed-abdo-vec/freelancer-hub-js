// =============================================================================
//  REACT QUERY — server state for auth.
//
//    useMe()       → useQuery     GET  /me        (who am I?)
//    useLogin()    → useMutation  POST /auth/login
//    useRegister() → useMutation  POST /auth/register
//    useLogout()   → useMutation  POST /auth/logout
//
//  Mutations change things on the server. On success we update the two worlds:
//    Zustand      ← the access token   (setSession)
//    Query cache  ← the user object    (setQueryData — no extra /me request!)
// =============================================================================
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from './api';
import { useAuthStore, useIsAuthenticated } from '../../store/authStore';
import { endSessionLocally } from '../../lib/http';

// Query keys in one place, so nobody typos ['auth', 'mee'].
export const authKeys = {
  me: ['auth', 'me'],
};

export function useMe() {
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: authKeys.me,
    queryFn: authApi.me,
    // `enabled` = don't even try without a token. A guest has no "me".
    enabled: isAuthenticated,
    staleTime: 5 * 60_000,
  });
}

// Shared by login + register: both answer { accessToken, expiresAt, user }.
function useStartSession() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((s) => s.setSession);
  return (data) => {
    setSession(data);
    queryClient.setQueryData(authKeys.me, data.user);
  };
}

export function useLogin() {
  const startSession = useStartSession();
  const rememberEmail = useAuthStore((s) => s.rememberEmail);
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data, variables) => {
      startSession(data);
      rememberEmail(variables.email);
    },
  });
}

export function useRegister() {
  const startSession = useStartSession();
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: startSession,
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: authApi.logout,
    // onSettled = success OR error. Even if the server is down, the user
    // clicked "log out" — so we log them out locally no matter what.
    onSettled: endSessionLocally,
  });
}
