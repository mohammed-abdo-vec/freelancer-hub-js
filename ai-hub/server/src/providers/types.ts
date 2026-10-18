import type { Model, ProviderId, TokenUsage } from '../types/api.js';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  model: string;
  messages: ChatTurn[]; // alternating, ends with a user turn
  systemPrompt?: string;
  maxTokens?: number;
  signal?: AbortSignal;
}

export interface ChatResult {
  content: string;
  usage: TokenUsage | null;
}

/** Every AI provider is wrapped in this one interface. */
export interface ProviderAdapter {
  /** Lists chat models. Also how we validate a key: it throws ProviderError on a bad key. */
  listModels(apiKey: string): Promise<Model[]>;
  /** Pass `onDelta` to stream; the full result is returned either way. */
  chat(apiKey: string, request: ChatRequest, onDelta?: (text: string) => void): Promise<ChatResult>;
}

export interface ProviderMeta {
  id: ProviderId;
  name: string;
  description: string;
  website: string;
  apiKeyUrl: string;
  keyPlaceholder: string;
  color: string;
  suggestedModels: string[];
}
