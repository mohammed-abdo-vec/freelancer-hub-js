import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { useAuthStore } from '@/shared/stores/auth.store';

export const API_URL = import.meta.env.VITE_API_URL ?? '/api';

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Several parallel requests can 401 at once: only react to the first one
let handlingExpiredSession = false;

api.interceptors.response.use(undefined, (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const isLogin = error.config?.url?.includes('/auth/login') ?? false;
    if (error.response?.status === 401 && !isLogin && !handlingExpiredSession) {
      handlingExpiredSession = true;
      setTimeout(() => {
        handlingExpiredSession = false;
      }, 2000);
      // TODO(AUTH-4): redirect to /login (RequireAuth handles it once AUTH-6 lands)
      useAuthStore.getState().clearSession();
      enqueueSnackbar('Session expired, please sign in again', {
        variant: 'warning',
        preventDuplicate: true,
      });
    }
  }
  return Promise.reject(error);
});
