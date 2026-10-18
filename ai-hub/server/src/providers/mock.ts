import { AbortedError, ProviderError } from '../lib/errors.js';
import type { Model } from '../types/api.js';
import type { ChatRequest, ProviderAdapter } from './types.js';

/**
 * A fake provider so the frontend can be built without real API keys.
 * Keys: anything starting with "mock-". Special prompts:
 *   /error     → simulated provider failure
 *   /ratelimit → simulated rate limit
 *   /long      → long answer (good for testing Stop and auto-scroll)
 */

const MODELS: Model[] = [
  { id: 'mock-fast', name: 'Mock Fast', providerId: 'mock', contextWindow: 8192 },
  { id: 'mock-smart', name: 'Mock Smart (slower)', providerId: 'mock', contextWindow: 32768 },
];

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new AbortedError());
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => (clearTimeout(t), reject(new AbortedError())), { once: true });
  });

const approxTokens = (s: string) => Math.max(1, Math.ceil(s.length / 4));

function compose(req: ChatRequest): string {
  const last = req.messages.at(-1)?.content ?? '';
  const quoted = last.length > 200 ? `${last.slice(0, 200)}…` : last;
  const parts = [
    `**Mock AI** (\`${req.model}\`) received your message:`,
    `> ${quoted.replace(/\n/g, '\n> ')}`,
    req.systemPrompt ? `_System prompt in effect:_ "${req.systemPrompt.slice(0, 100)}"` : '',
    'Here is some sample content to test your Markdown rendering:',
    '1. **Bold**, *italic* and `inline code`\n2. A [link to MUI](https://mui.com)\n3. A table and a code block',
    '| Provider | Status |\n| --- | --- |\n| Mock AI | ✅ Connected |\n| Your real providers | Add a key on the Providers page |',
    '```ts\nconst greet = (name: string): string => `Hello, ${name}!`;\nconsole.log(greet("AI Hub"));\n```',
    `This conversation has ${req.messages.length} message(s) so far. Try \`/long\`, \`/error\` or \`/ratelimit\`.`,
  ];
  if (/\/long\b/.test(last)) {
    for (let i = 1; i <= 12; i++) {
      parts.push(`### Section ${i}\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.`);
    }
  }
  return parts.filter(Boolean).join('\n\n');
}

export const mockAdapter: ProviderAdapter = {
  async listModels(apiKey) {
    await sleep(150);
    if (!apiKey.startsWith('mock-')) {
      throw new ProviderError('PROVIDER_AUTH_FAILED', 'Mock AI rejected the API key: mock keys must start with "mock-".');
    }
    return MODELS;
  },

  async chat(apiKey, req, onDelta) {
    if (!apiKey.startsWith('mock-')) throw new ProviderError('PROVIDER_AUTH_FAILED', 'Mock AI rejected the API key.');
    const last = req.messages.at(-1)?.content ?? '';
    await sleep(300, req.signal); // "time to first token"
    if (/\/error\b/.test(last)) throw new ProviderError('PROVIDER_ERROR', 'Mock AI error (500): simulated failure — you typed /error.');
    if (/\/ratelimit\b/.test(last)) throw new ProviderError('PROVIDER_RATE_LIMITED', 'Mock AI rate limit reached: simulated — you typed /ratelimit.');

    const full = compose(req);
    const usage = {
      inputTokens: approxTokens((req.systemPrompt ?? '') + req.messages.map((m) => m.content).join('')),
      outputTokens: approxTokens(full),
    };
    if (!onDelta) return { content: full, usage };

    const delay = req.model === 'mock-smart' ? 35 : 15;
    for (const piece of full.match(/\S+\s*/g) ?? []) {
      await sleep(delay, req.signal);
      onDelta(piece);
    }
    return { content: full, usage };
  },
};
