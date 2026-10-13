// Plain async functions — one per endpoint. No React here.
// React Query hooks (hooks.js) wrap these.
import { http } from '../../lib/http';

export const authApi = {
  login: (credentials) => http.post('/auth/login', credentials).then((r) => r.data),
  register: (body) => http.post('/auth/register', body).then((r) => r.data),
  logout: () => http.post('/auth/logout'),
  me: () => http.get('/me').then((r) => r.data),
};
