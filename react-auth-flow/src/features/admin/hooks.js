import { useQuery } from '@tanstack/react-query';
import { http } from '../../lib/http';

// Teacher-only endpoint. A student calling it gets 403 (not 401 — no refresh).
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => http.get('/admin/stats').then((r) => r.data),
  });
}
