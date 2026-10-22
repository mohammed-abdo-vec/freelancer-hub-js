import { api } from '@/shared/api/client';
import type { AuthResponse, RegisterRequest } from '@/shared/types/api';

export async function register(body: RegisterRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', body);
  return data;
}
