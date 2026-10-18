import { randomUUID } from 'node:crypto';
import { db, type ConversationRecord, type MessageRecord } from '../db/store.js';
import { AppError, ProviderError, notFound } from '../lib/errors.js';
import { getAdapter } from '../providers/registry.js';
import type { ChatTurn } from '../providers/types.js';
import type { CompareResult, CompareTarget } from '../types/api.js';
import { requireConnection } from './connections.service.js';
import { recordUsage } from './usage.service.js';

export function findConversation(userId: string, id: string): ConversationRecord {
  const c = db.data.conversations.find((x) => x.id === id && x.userId === userId);
  if (!c) throw notFound('Conversation');
  return c;
}

export const messagesOf = (conversationId: string) =>
  db.data.messages.filter((m) => m.conversationId === conversationId);

/**
 * Turn stored messages into provider turns: skip failed replies and empty
 * content, then merge consecutive same-role turns (some providers require
 * strict user/assistant alternation).
 */
function buildHistory(messages: MessageRecord[]): ChatTurn[] {
  const turns: ChatTurn[] = [];
  for (const m of messages) {
    if (m.status === 'error' || !m.content.trim()) continue;
    const prev = turns.at(-1);
    if (prev && prev.role === m.role) prev.content += `\n\n${m.content}`;
    else turns.push({ role: m.role, content: m.content });
  }
  return turns;
}

const titleFrom = (text: string) => {
  const line = text.replace(/\s+/g, ' ').trim();
  return line.length > 60 ? `${line.slice(0, 57)}…` : line || 'New chat';
};

interface SendOptions {
  userId: string;
  conversationId: string;
  content: string;
  maxTokens?: number;
  signal?: AbortSignal;
  onUserMessage?: (m: MessageRecord) => void;
  onDelta?: (text: string) => void;
}

/**
 * The core chat flow, shared by the JSON and the streaming endpoints:
 * save the user message → call the provider → save the assistant message.
 * Provider failures are saved as an assistant message with status "error",
 * so they also show up when the conversation is reloaded.
 */
export async function sendMessage(opts: SendOptions) {
  const conversation = findConversation(opts.userId, opts.conversationId);
  const { apiKey } = requireConnection(opts.userId, conversation.providerId); // 409 before anything is saved

  const now = () => new Date().toISOString();
  const userMessage: MessageRecord = {
    id: randomUUID(),
    conversationId: conversation.id,
    role: 'user',
    content: opts.content,
    status: 'complete',
    error: null,
    providerId: null,
    model: null,
    usage: null,
    latencyMs: null,
    createdAt: now(),
  };
  const isFirst = messagesOf(conversation.id).length === 0;
  db.write((d) => {
    d.messages.push(userMessage);
    if (isFirst && conversation.title === 'New chat') conversation.title = titleFrom(opts.content);
    conversation.updatedAt = userMessage.createdAt;
  });
  opts.onUserMessage?.(userMessage);

  const started = performance.now();
  let partial = '';
  const assistant: MessageRecord = {
    id: randomUUID(),
    conversationId: conversation.id,
    role: 'assistant',
    content: '',
    status: 'complete',
    error: null,
    providerId: conversation.providerId,
    model: conversation.model,
    usage: null,
    latencyMs: null,
    createdAt: now(),
  };
  let failure: AppError | null = null;

  try {
    const result = await getAdapter(conversation.providerId).chat(
      apiKey,
      {
        model: conversation.model,
        messages: buildHistory(messagesOf(conversation.id)),
        systemPrompt: conversation.systemPrompt || undefined,
        maxTokens: opts.maxTokens,
        signal: opts.signal,
      },
      opts.onDelta &&
        ((text) => {
          partial += text;
          opts.onDelta!(text);
        }),
    );
    assistant.content = result.content;
    assistant.usage = result.usage;
  } catch (err) {
    if (opts.signal?.aborted) {
      assistant.status = 'stopped';
      assistant.content = partial;
    } else if (err instanceof AppError) {
      failure = err;
      assistant.status = 'error';
      assistant.error = err.message;
      assistant.content = partial;
    } else {
      console.error(err);
      failure = new ProviderError('PROVIDER_ERROR', 'Unexpected error while talking to the provider.');
      assistant.status = 'error';
      assistant.error = failure.message;
      assistant.content = partial;
    }
  }

  assistant.latencyMs = Math.round(performance.now() - started);
  assistant.createdAt = now();
  db.write((d) => {
    d.messages.push(assistant);
    conversation.updatedAt = assistant.createdAt;
  });
  if (assistant.status !== 'error') {
    recordUsage(opts.userId, conversation.providerId, conversation.model, 'chat', assistant.usage);
  }

  return { conversation, userMessage, assistantMessage: assistant, failure };
}

/** Send one prompt to several models in parallel. Nothing is saved except usage. */
export async function compare(
  userId: string,
  input: { prompt: string; systemPrompt?: string; targets: CompareTarget[]; maxTokens?: number },
): Promise<CompareResult[]> {
  // Fail fast (409) if any target's provider isn't connected.
  const keys = input.targets.map((t) => requireConnection(userId, t.providerId).apiKey);

  return Promise.all(
    input.targets.map(async (target, i): Promise<CompareResult> => {
      const started = performance.now();
      try {
        const result = await getAdapter(target.providerId).chat(keys[i]!, {
          model: target.model,
          messages: [{ role: 'user', content: input.prompt }],
          systemPrompt: input.systemPrompt,
          maxTokens: input.maxTokens,
        });
        recordUsage(userId, target.providerId, target.model, 'compare', result.usage);
        return {
          ...target,
          status: 'ok',
          content: result.content,
          error: null,
          usage: result.usage,
          latencyMs: Math.round(performance.now() - started),
        };
      } catch (err) {
        if (!(err instanceof AppError)) console.error(err);
        return {
          ...target,
          status: 'error',
          content: null,
          error: err instanceof AppError ? err.message : 'Unexpected error while talking to the provider.',
          usage: null,
          latencyMs: Math.round(performance.now() - started),
        };
      }
    }),
  );
}
