import { QueryClient } from '@tanstack/react-query';
import { getErrorStatus } from './errors';

/** Exported so sign-out (AUTH-5) can call `queryClient.clear()`. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Only server errors are worth retrying; 4xx won't change on a second try
      retry: (count, err) => count < 2 && (getErrorStatus(err) ?? 0) >= 500,
    },
  },
});
