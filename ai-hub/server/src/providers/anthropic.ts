import Anthropic from '@anthropic-ai/sdk';
import { ProviderError } from '../lib/errors.js';
import type { Model } from '../types/api.js';
import type { ProviderAdapter } from './types.js';

const NAME = 'Anthropic';

// Output caps per model, learned from the Models API, so we never ask for more than a model allows.
const maxOutputByModel = new Map<string, number>();

const client = (apiKey: string) => new Anthropic({ apiKey, maxRetries: 1 });

/** The SDK's `err.message` embeds the raw JSON body; prefer the inner human-readable message. */
function readable(err: InstanceType<typeof Anthropic.APIError>): string {
  const body = err.error as { error?: { message?: unknown } } | undefined;
  return typeof body?.error?.message === 'string' ? body.error.message : err.message;
}

function mapError(err: unknown): unknown {
  if (err instanceof Anthropic.APIUserAbortError) return err; // user pressed Stop
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
    return new ProviderError('PROVIDER_AUTH_FAILED', `${NAME} rejected the API key: ${readable(err)}`);
  }
  if (err instanceof Anthropic.RateLimitError) {
    return new ProviderError('PROVIDER_RATE_LIMITED', `${NAME} rate limit reached: ${readable(err)}`);
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return new ProviderError('PROVIDER_ERROR', `Could not reach ${NAME}. Check your internet connection.`);
  }
  if (err instanceof Anthropic.APIError) {
    return new ProviderError('PROVIDER_ERROR', `${NAME} error (${err.status ?? 'unknown'}): ${readable(err)}`);
  }
  return err;
}

export const anthropicAdapter: ProviderAdapter = {
  async listModels(apiKey) {
    try {
      const models: Model[] = [];
      for await (const m of client(apiKey).models.list({ limit: 100 })) {
        if (typeof m.max_tokens === 'number') maxOutputByModel.set(m.id, m.max_tokens);
        models.push({
          id: m.id,
          name: m.display_name,
          providerId: 'anthropic',
          contextWindow: typeof m.max_input_tokens === 'number' ? m.max_input_tokens : null,
        });
      }
      return models;
    } catch (err) {
      throw mapError(err);
    }
  },

  async chat(apiKey, req, onDelta) {
    const stream = Boolean(onDelta);
    // Streaming has no HTTP-timeout concern, so it can afford a bigger default.
    const requested = req.maxTokens ?? (stream ? 32000 : 16000);
    const cap = maxOutputByModel.get(req.model);
    const params: Anthropic.MessageCreateParamsNonStreaming = {
      model: req.model,
      max_tokens: cap ? Math.min(requested, cap) : requested,
      messages: req.messages,
      ...(req.systemPrompt ? { system: req.systemPrompt } : {}),
    };

    try {
      let message: Anthropic.Message;
      if (stream) {
        const s = client(apiKey).messages.stream(params, { signal: req.signal });
        for await (const event of s) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') onDelta!(event.delta.text);
        }
        message = await s.finalMessage();
      } else {
        message = await client(apiKey).messages.create(params, { signal: req.signal });
      }

      const content = message.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
      if (message.stop_reason === 'refusal' && !content) {
        throw new ProviderError('PROVIDER_ERROR', 'Claude declined to answer this request.');
      }
      return {
        content,
        usage: { inputTokens: message.usage.input_tokens, outputTokens: message.usage.output_tokens },
      };
    } catch (err) {
      throw mapError(err);
    }
  },
};
