import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { toConversation, toMessage } from '../db/serializers.js';
import { db, type ConversationRecord } from '../db/store.js';
import { notFound } from '../lib/errors.js';
import { openEventStream } from '../lib/sse.js';
import { currentUser } from '../middleware/auth.js';
import { parse } from '../middleware/validate.js';
import { PROVIDER_IDS, getProviderMeta } from '../providers/catalog.js';
import { findConversation, messagesOf, sendMessage } from '../services/chat.service.js';
import { requireConnection } from '../services/connections.service.js';
import type { ConversationDetail, SendMessageResponse } from '../types/api.js';

export const conversationsRouter = Router();

const providerId = z.enum(PROVIDER_IDS);
const model = z.string().trim().min(1, 'Model is required').max(200);
const systemPrompt = z.string().max(8000);
const sendSchema = z.object({
  content: z.string().trim().min(1, 'Message cannot be empty').max(32000),
  maxTokens: z.number().int().min(1).max(128000).optional(),
});

const sortConversations = (a: ConversationRecord, b: ConversationRecord) =>
  Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt);

conversationsRouter.get('/', (req, res) => {
  const user = currentUser(req);
  const { search } = parse(z.object({ search: z.string().trim().optional() }), req.query);
  const needle = search?.toLowerCase();
  const conversations = db.data.conversations
    .filter((c) => c.userId === user.id)
    .filter((c) => !needle || c.title.toLowerCase().includes(needle))
    .sort(sortConversations)
    .map(toConversation);
  res.json({ conversations });
});

conversationsRouter.post('/', (req, res) => {
  const user = currentUser(req);
  const body = parse(
    z.object({ providerId, model, title: z.string().trim().max(120).optional(), systemPrompt: systemPrompt.optional() }),
    req.body,
  );
  if (!getProviderMeta(body.providerId)) throw notFound('Provider');
  requireConnection(user.id, body.providerId);
  const now = new Date().toISOString();
  const record: ConversationRecord = {
    id: randomUUID(),
    userId: user.id,
    title: body.title || 'New chat',
    providerId: body.providerId,
    model: body.model,
    systemPrompt: body.systemPrompt ?? '',
    pinned: false,
    createdAt: now,
    updatedAt: now,
  };
  db.write((d) => d.conversations.push(record));
  res.status(201).json({ conversation: toConversation(record) });
});

conversationsRouter.get('/:id', (req, res) => {
  const c = findConversation(currentUser(req).id, req.params.id);
  const detail: ConversationDetail = { ...toConversation(c), messages: messagesOf(c.id).map(toMessage) };
  res.json({ conversation: detail });
});

conversationsRouter.patch('/:id', (req, res) => {
  const user = currentUser(req);
  const c = findConversation(user.id, req.params.id);
  const body = parse(
    z.object({
      title: z.string().trim().min(1).max(120).optional(),
      providerId: providerId.optional(),
      model: model.optional(),
      systemPrompt: systemPrompt.optional(),
      pinned: z.boolean().optional(),
    }),
    req.body,
  );
  if (body.providerId && body.providerId !== c.providerId) requireConnection(user.id, body.providerId);
  db.write(() => {
    Object.assign(c, body);
    c.updatedAt = new Date().toISOString();
  });
  res.json({ conversation: toConversation(c) });
});

conversationsRouter.delete('/:id', (req, res) => {
  const c = findConversation(currentUser(req).id, req.params.id);
  db.write((d) => {
    d.conversations = d.conversations.filter((x) => x.id !== c.id);
    d.messages = d.messages.filter((m) => m.conversationId !== c.id);
  });
  res.status(204).end();
});

/** Plain JSON: waits for the whole answer. */
conversationsRouter.post('/:id/messages', async (req, res) => {
  const body = parse(sendSchema, req.body);
  const result = await sendMessage({ userId: currentUser(req).id, conversationId: req.params.id, ...body });
  if (result.failure) throw result.failure; // both messages are saved; the client refetches
  res.status(201).json({
    userMessage: toMessage(result.userMessage),
    assistantMessage: toMessage(result.assistantMessage),
    conversation: toConversation(result.conversation),
  } satisfies SendMessageResponse);
});

/**
 * Server-Sent Events: user_message → delta* → assistant_message.
 * Validation, 404 and 409 errors are returned as normal JSON *before* the
 * stream opens. Closing the connection (the Stop button) aborts the provider
 * call and saves the partial answer with status "stopped".
 */
conversationsRouter.post('/:id/messages/stream', async (req, res) => {
  const user = currentUser(req);
  const body = parse(sendSchema, req.body);
  const conversation = findConversation(user.id, req.params.id);
  requireConnection(user.id, conversation.providerId);

  const controller = new AbortController();
  res.on('close', () => {
    if (!res.writableEnded) controller.abort();
  });

  const stream = openEventStream(res);
  try {
    const result = await sendMessage({
      userId: user.id,
      conversationId: conversation.id,
      ...body,
      signal: controller.signal,
      onUserMessage: (m) => stream.send('user_message', { message: toMessage(m) }),
      onDelta: (text) => stream.send('delta', { text }),
    });
    stream.send('assistant_message', {
      message: toMessage(result.assistantMessage),
      conversation: toConversation(result.conversation),
    });
  } catch (err) {
    console.error(err);
    stream.send('error', { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong on our side.' } });
  } finally {
    stream.end();
  }
});
