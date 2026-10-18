import { env } from '../config/env.js';
import type { ProviderId } from '../types/api.js';
import type { ProviderMeta } from './types.js';

// `suggestedModels` are only a fallback — the UI should prefer the live list
// from GET /api/providers/:id/models, which is always current.
const ALL: ProviderMeta[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT models for chat, reasoning and coding.',
    website: 'https://openai.com',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    keyPlaceholder: 'sk-...',
    color: '#10A37F',
    suggestedModels: ['gpt-5', 'gpt-5-mini'],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude models for writing, analysis and coding.',
    website: 'https://www.anthropic.com',
    apiKeyUrl: 'https://console.anthropic.com/settings/keys',
    keyPlaceholder: 'sk-ant-...',
    color: '#D97757',
    suggestedModels: ['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5'],
  },
  {
    id: 'google',
    name: 'Google Gemini',
    description: 'Gemini models with long context and multimodal skills.',
    website: 'https://ai.google.dev',
    apiKeyUrl: 'https://aistudio.google.com/app/apikey',
    keyPlaceholder: 'AIza...',
    color: '#4285F4',
    suggestedModels: ['gemini-2.5-pro', 'gemini-2.5-flash'],
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Fast, efficient open-weight and commercial models.',
    website: 'https://mistral.ai',
    apiKeyUrl: 'https://console.mistral.ai/api-keys',
    keyPlaceholder: 'Your Mistral API key',
    color: '#FA520F',
    suggestedModels: ['mistral-large-latest', 'mistral-small-latest'],
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Open models served at very high speed.',
    website: 'https://groq.com',
    apiKeyUrl: 'https://console.groq.com/keys',
    keyPlaceholder: 'gsk_...',
    color: '#F55036',
    suggestedModels: ['llama-3.3-70b-versatile'],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'Strong, low-cost chat and reasoning models.',
    website: 'https://www.deepseek.com',
    apiKeyUrl: 'https://platform.deepseek.com/api_keys',
    keyPlaceholder: 'sk-...',
    color: '#4D6BFE',
    suggestedModels: ['deepseek-chat', 'deepseek-reasoner'],
  },
  {
    id: 'xai',
    name: 'xAI',
    description: 'Grok models with real-time knowledge.',
    website: 'https://x.ai',
    apiKeyUrl: 'https://console.x.ai',
    keyPlaceholder: 'xai-...',
    color: '#111111',
    suggestedModels: ['grok-4'],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'One key for hundreds of models from many providers.',
    website: 'https://openrouter.ai',
    apiKeyUrl: 'https://openrouter.ai/keys',
    keyPlaceholder: 'sk-or-...',
    color: '#6566F1',
    suggestedModels: ['openrouter/auto'],
  },
  {
    id: 'mock',
    name: 'Mock AI',
    description: 'A free fake provider for development. Any key starting with "mock-" works.',
    website: 'https://example.com',
    apiKeyUrl: 'https://example.com',
    keyPlaceholder: 'mock-anything',
    color: '#9C27B0',
    suggestedModels: ['mock-fast', 'mock-smart'],
  },
];

export const PROVIDER_IDS = ALL.map((p) => p.id) as [ProviderId, ...ProviderId[]];

export function listProviderMeta(): ProviderMeta[] {
  return ALL.filter((p) => p.id !== 'mock' || env.ENABLE_MOCK_PROVIDER);
}

export function getProviderMeta(id: ProviderId): ProviderMeta | undefined {
  return listProviderMeta().find((p) => p.id === id);
}
