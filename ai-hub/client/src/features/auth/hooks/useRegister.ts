import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/stores/auth.store';
import { register } from '../api/auth';

export function useRegister() {
  return useMutation({
    mutationFn: register,
    onSuccess: ({ token, user }) => useAuthStore.getState().setSession(token, user),
  });
}
