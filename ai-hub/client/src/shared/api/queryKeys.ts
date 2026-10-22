import type { ProviderId } from '@/shared/types/api';

export const queryKeys = {
  me: ['me'] as const,
  providers: ['providers'] as const,
  models: (providerId: ProviderId) => ['providers', providerId, 'models'] as const,
  conversations: (search = '') => ['conversations', { search }] as const,
  conversation: (id: string) => ['conversation', id] as const,
  usage: (days: number) => ['usage', days] as const,
};
