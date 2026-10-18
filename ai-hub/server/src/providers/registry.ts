import type { ProviderId } from '../types/api.js';
import { anthropicAdapter } from './anthropic.js';
import { geminiAdapter } from './gemini.js';
import { mockAdapter } from './mock.js';
import { createOpenAICompatibleAdapter, isOpenAIChatModel } from './openaiCompatible.js';
import type { ProviderAdapter } from './types.js';

const adapters: Record<ProviderId, ProviderAdapter> = {
  openai: createOpenAICompatibleAdapter({
    providerId: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    maxTokensParam: 'max_completion_tokens',
    isChatModel: isOpenAIChatModel,
  }),
  anthropic: anthropicAdapter,
  google: geminiAdapter,
  mistral: createOpenAICompatibleAdapter({
    providerId: 'mistral',
    name: 'Mistral AI',
    baseUrl: 'https://api.mistral.ai/v1',
    streamUsage: false,
    isChatModel: (id) => !/embed|moderation|ocr/i.test(id),
  }),
  groq: createOpenAICompatibleAdapter({
    providerId: 'groq',
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    isChatModel: (id) => !/whisper|tts|guard/i.test(id),
  }),
  deepseek: createOpenAICompatibleAdapter({ providerId: 'deepseek', name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1' }),
  xai: createOpenAICompatibleAdapter({
    providerId: 'xai',
    name: 'xAI',
    baseUrl: 'https://api.x.ai/v1',
    isChatModel: (id) => !/image|imagine|vision-only/i.test(id),
  }),
  openrouter: createOpenAICompatibleAdapter({
    providerId: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    keyCheckPath: '/key', // OpenRouter's /models is public, so it can't validate a key on its own
  }),
  mock: mockAdapter,
};

export const getAdapter = (id: ProviderId): ProviderAdapter => adapters[id];
