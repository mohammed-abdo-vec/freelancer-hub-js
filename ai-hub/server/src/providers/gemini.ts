import { ProviderError } from '../lib/errors.js';
import { readEventStream } from '../lib/sse.js';
import type { Model, TokenUsage } from '../types/api.js';
import { providerFetch } from './http.js';
import type { ChatRequest, ProviderAdapter } from './types.js';

const NAME = 'Google Gemini';
const BASE = 'https://generativelanguage.googleapis.com/v1beta';

interface GenerateResponse {
  candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; thoughtsTokenCount?: number };
}

const headers = (apiKey: string) => ({ 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' });

function buildBody(req: ChatRequest) {
  return {
    contents: req.messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
    ...(req.systemPrompt ? { systemInstruction: { parts: [{ text: req.systemPrompt }] } } : {}),
    ...(req.maxTokens ? { generationConfig: { maxOutputTokens: req.maxTokens } } : {}),
  };
}

function readText(res: GenerateResponse): string {
  if (res.promptFeedback?.blockReason) {
    throw new ProviderError('PROVIDER_ERROR', `${NAME} blocked the prompt (${res.promptFeedback.blockReason}).`);
  }
  const parts = res.candidates?.[0]?.content?.parts ?? [];
  return parts.filter((p) => !p.thought).map((p) => p.text ?? '').join('');
}

function readUsage(res: GenerateResponse): TokenUsage | null {
  const u = res.usageMetadata;
  if (!u) return null;
  return { inputTokens: u.promptTokenCount ?? 0, outputTokens: (u.candidatesTokenCount ?? 0) + (u.thoughtsTokenCount ?? 0) };
}

export const geminiAdapter: ProviderAdapter = {
  async listModels(apiKey) {
    const res = await providerFetch(NAME, `${BASE}/models?pageSize=1000`, { headers: headers(apiKey) });
    const json = (await res.json()) as {
      models?: { name: string; displayName?: string; inputTokenLimit?: number; supportedGenerationMethods?: string[] }[];
    };
    return (json.models ?? [])
      .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
      .map<Model>((m) => {
        const id = m.name.replace(/^models\//, '');
        return { id, name: m.displayName ?? id, providerId: 'google', contextWindow: m.inputTokenLimit ?? null };
      });
  },

  async chat(apiKey, req, onDelta) {
    const model = encodeURIComponent(req.model);
    const init = { method: 'POST', headers: headers(apiKey), body: JSON.stringify(buildBody(req)), signal: req.signal };

    if (!onDelta) {
      const res = await providerFetch(NAME, `${BASE}/models/${model}:generateContent`, init);
      const json = (await res.json()) as GenerateResponse;
      return { content: readText(json), usage: readUsage(json) };
    }

    const res = await providerFetch(NAME, `${BASE}/models/${model}:streamGenerateContent?alt=sse`, init);
    let content = '';
    let usage: TokenUsage | null = null;
    if (!res.body) return { content, usage };
    for await (const { data } of readEventStream(res.body)) {
      const chunk = JSON.parse(data) as GenerateResponse;
      const text = readText(chunk);
      if (text) {
        content += text;
        onDelta(text);
      }
      usage = readUsage(chunk) ?? usage;
    }
    return { content, usage };
  },
};
