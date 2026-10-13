// =============================================================================
//  The HTTP layer — where the "silent refresh" magic happens.
//
//  1. REQUEST interceptor:  attach `Authorization: Bearer <accessToken>`
//  2. RESPONSE interceptor: if the server says 401,
//        → call /auth/refresh (the browser sends the httpOnly cookie for us)
//        → save the new access token in Zustand
//        → replay the original request
//     If refresh ALSO fails → the session is really over → log out locally.
//
//  Components never think about tokens. They call useNotes() and get notes.
// =============================================================================
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { debugLog } from '../store/debugStore';
import { queryClient } from './queryClient';

export const http = axios.create({
  baseURL: '/api',
  withCredentials: true, // send cookies (the refresh token)
});

// --- 1. Attach the token -----------------------------------------------------
http.interceptors.request.use((config) => {
  // getState() reads the store outside React — no hook, no re-render.
  const { accessToken } = useAuthStore.getState();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  debugLog('req', `${config.method.toUpperCase()} ${config.url}`);
  return config;
});

// --- Refresh, but only ONE at a time ------------------------------------------
// If 3 queries get a 401 at the same moment, we must NOT call /refresh 3 times:
// the server rotates the refresh token, so calls #2 and #3 would use a token
// that #1 just killed → logout. So everyone waits on the same promise.
let refreshPromise = null;

export function refreshSession() {
  if (!refreshPromise) {
    debugLog('refresh', 'POST /auth/refresh');
    refreshPromise = http
      .post('/auth/refresh')
      .then(({ data }) => {
        useAuthStore.getState().setSession(data);
        queryClient.setQueryData(['auth', 'me'], data.user);
        debugLog('ok', 'got a new access token');
        return data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// Wipe everything the client knows about the user.
// queryClient.clear() matters: without it, the next person to log in on this
// browser would briefly see the previous user's cached notes.
export function endSessionLocally() {
  useAuthStore.getState().clearSession();
  queryClient.clear();
}

// --- 2. Handle 401 → refresh → retry ----------------------------------------
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    debugLog('err', `${status ?? 'network'} ${original?.url} — ${error.response?.data?.message ?? error.message}`);

    const isAuthEndpoint = original?.url?.startsWith('/auth/');
    // `_retry` is our own flag so we never loop: refresh → 401 → refresh → 401 …
    if (status !== 401 || isAuthEndpoint || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      await refreshSession();
      debugLog('retry', `${original.method.toUpperCase()} ${original.url}`);
      return http(original); // request interceptor puts the NEW token on it
    } catch (refreshError) {
      debugLog('err', 'refresh failed → logged out');
      endSessionLocally();
      return Promise.reject(refreshError);
    }
  },
);

// Turn an axios error into a message we can show in the UI.
export function getErrorMessage(error) {
  return error?.response?.data?.message ?? error?.message ?? 'Something went wrong';
}

export function getFieldErrors(error) {
  return error?.response?.data?.errors ?? {};
}
