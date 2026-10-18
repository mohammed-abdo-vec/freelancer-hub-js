import { ProviderError } from '../lib/errors.js';
import { readEventStream } from '../lib/sse.js';
import type { Model, ProviderId, TokenUsage } from '../types/api.js';
import { extractMessage, providerFetch } from './http.js';
import type { ProviderAdapter } from './types.js';

interface Options {
  providerId: ProviderId;
  name: string;
  baseUrl: string;
  /** OpenAI renamed `max_tokens` to `max_completion_tokens`; most clones still use the old name. */
  maxTokensParam?: 'max_tokens' | 'max_completion_tokens';
  /** Whether `stream_options.include_usage` is accepted (token counts while streaming). */
  streamUsage?: boolean;
  /** Drop non-chat models (embeddings, audio, images...) from the list. */
  isChatModel?: (id: string) => boolean;
  /** An authenticated endpoint to hit first, for providers whose /models is public (OpenRouter). */
  keyCheckPath?: string;
}

interface Completion {
  choices?: { message?: { content?: string | null }; delta?: { content?: string | null } }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number } | null;
  error?: { message?: string };
}

const toUsage = (u: Completion['usage']): TokenUsage | null =>
  u ? { inputTokens: u.prompt_tokens ?? 0, outputTokens: u.completion_tokens ?? 0 } : null;

/** One adapter for every provider that speaks the OpenAI Chat Completions protocol. */
export function createOpenAICompatibleAdapter(opts: Options): ProviderAdapter {
  const { providerId, name, baseUrl, maxTokensParam = 'max_tokens', streamUsage = true } = opts;
  const headers = (apiKey: string) => ({ Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' });

  return {
    async listModels(apiKey) {
      if (opts.keyCheckPath) await providerFetch(name, `${baseUrl}${opts.keyCheckPath}`, { headers: headers(apiKey) });
      const res = await providerFetch(name, `${baseUrl}/models`, { headers: headers(apiKey) });
      const json = (await res.json()) as {
        data?: { id: string; name?: string; context_length?: number; context_window?: number }[];
      };
      return (json.data ?? [])
        .filter((m) => !opts.isChatModel || opts.isChatModel(m.id))
        .map<Model>((m) => ({
          id: m.id,
          name: m.name ?? m.id,
          providerId,
          contextWindow: m.context_length ?? m.context_window ?? null,
        }))
        .sort((a, b) => a.id.localeCompare(b.id));
    },

    async chat(apiKey, req, onDelta) {
      const stream = Boolean(onDelta);
      const body = {
        model: req.model,
        messages: [...(req.systemPrompt ? [{ role: 'system', content: req.systemPrompt }] : []), ...req.messages],
        stream,
        ...(req.maxTokens ? { [maxTokensParam]: req.maxTokens } : {}),
        ...(stream && streamUsage ? { stream_options: { include_usage: true } } : {}),
      };
      const res = await providerFetch(name, `${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: headers(apiKey),
        body: JSON.stringify(body),
        signal: req.signal,
      });

      if (!stream || !res.body) {
        const json = (await res.json()) as Completion;
        return { content: json.choices?.[0]?.message?.content ?? '', usage: toUsage(json.usage) };
      }

      let content = '';
      let usage: TokenUsage | null = null;
      for await (const { data } of readEventStream(res.body)) {
        if (data === '[DONE]') break;
        let chunk: Completion;
        try {
          chunk = JSON.parse(data) as Completion;
        } catch {
          continue; // keep-alive comments etc.
        }
        if (chunk.error) throw new ProviderError('PROVIDER_ERROR', `${name}: ${chunk.error.message ?? extractMessage(data)}`);
        const delta = chunk.choices?.[0]?.delta?.content;
        if (delta) {
          content += delta;
          onDelta!(delta);
        }
        if (chunk.usage) usage = toUsage(chunk.usage);
      }
      return { content, usage };
    },
  };
}

const NON_CHAT = /embed|whisper|tts|dall-e|moderation|audio|realtime|transcribe|image|search|davinci|babbage|sora|computer-use/i;
export const isOpenAIChatModel = (id: string) => !NON_CHAT.test(id);
