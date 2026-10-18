/**
 * End-to-end check of every endpoint against the Mock AI provider.
 * Uses a throwaway database file; does not touch ./data.   npm run smoke
 */
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';

process.env.DATA_FILE = join(mkdtempSync(join(tmpdir(), 'ai-hub-smoke-')), 'db.json');
process.env.ENABLE_MOCK_PROVIDER = 'true';
process.env.NODE_ENV = 'test';
const { createApp } = await import('../app.js');

const server = createApp().listen(0);
const base = `http://localhost:${(server.address() as AddressInfo).port}/api`;
let token = '';

async function call(method: string, path: string, body?: unknown) {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, json: text ? JSON.parse(text) : null };
}

async function stream(path: string, body: unknown, abortAfterDeltas?: number) {
  const controller = new AbortController();
  const res = await fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
    signal: controller.signal,
  });
  const events: { event: string; data: any }[] = [];
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let i: number;
      while ((i = buffer.indexOf('\n\n')) !== -1) {
        const block = buffer.slice(0, i);
        buffer = buffer.slice(i + 2);
        const event = /^event: (.*)$/m.exec(block)?.[1] ?? 'message';
        const data = JSON.parse(/^data: (.*)$/m.exec(block)?.[1] ?? 'null');
        events.push({ event, data });
        if (abortAfterDeltas && events.filter((e) => e.event === 'delta').length >= abortAfterDeltas) controller.abort();
      }
    }
  } catch (err) {
    if (!controller.signal.aborted) throw err;
  }
  return { status: res.status, events };
}

const step = (name: string) => console.log(`✓ ${name}`);

try {
  assert.equal((await call('GET', '/health')).json.status, 'ok');
  step('health');

  assert.equal((await call('GET', '/providers')).status, 401);
  step('protected routes need a token');

  let r = await call('POST', '/auth/register', { name: 'Ada', email: 'bad', password: 'x' });
  assert.equal(r.status, 400);
  assert.equal(r.json.error.code, 'VALIDATION_ERROR');
  assert.ok(r.json.error.details.length >= 2);
  step('register validation');

  r = await call('POST', '/auth/register', { name: 'Ada', email: 'Ada@Example.com', password: 'password123' });
  assert.equal(r.status, 201);
  token = r.json.token;
  assert.equal(r.json.user.email, 'ada@example.com');
  assert.equal((await call('POST', '/auth/register', { name: 'A', email: 'ada@example.com', password: 'password123' })).status, 409);
  step('register + duplicate email');

  assert.equal((await call('POST', '/auth/login', { email: 'ada@example.com', password: 'nope-nope' })).status, 401);
  r = await call('POST', '/auth/login', { email: 'ada@example.com', password: 'password123' });
  assert.equal(r.status, 200);
  token = r.json.token;
  assert.equal((await call('GET', '/auth/me')).json.user.name, 'Ada');
  assert.equal((await call('PATCH', '/auth/me', { name: 'Ada L.' })).json.user.name, 'Ada L.');
  step('login, me, update profile');

  r = await call('GET', '/providers');
  assert.ok(r.json.providers.length >= 9);
  assert.equal(r.json.providers.find((p: any) => p.id === 'mock').connection, null);
  assert.equal((await call('GET', '/providers/mock/models')).json.error.code, 'CONNECTION_REQUIRED');
  step('providers list, models need a connection');

  r = await call('POST', '/connections', { providerId: 'mock', apiKey: 'wrong-key-123' });
  assert.equal(r.status, 422);
  assert.equal(r.json.error.code, 'PROVIDER_AUTH_FAILED');
  r = await call('POST', '/connections', { providerId: 'mock', apiKey: 'mock-secret-key-9999' });
  assert.equal(r.status, 201);
  const connection = r.json.connection;
  assert.equal(connection.maskedKey, 'mock••••••••9999');
  assert.equal(connection.encryptedKey, undefined);
  assert.equal((await call('POST', '/connections', { providerId: 'mock', apiKey: 'mock-other-key' })).status, 409);
  step('connect provider: bad key 422, good key 201, duplicate 409, key masked');

  r = await call('POST', `/connections/${connection.id}/test`);
  assert.equal(r.json.ok, true);
  assert.equal(r.json.modelCount, 2);
  assert.equal((await call('PATCH', `/connections/${connection.id}`, { label: 'My mock' })).json.connection.label, 'My mock');
  r = await call('GET', '/providers/mock/models');
  assert.deepEqual(r.json.models.map((m: any) => m.id), ['mock-fast', 'mock-smart']);
  step('test connection, rename, list models');

  r = await call('POST', '/conversations', { providerId: 'openai', model: 'gpt-5' });
  assert.equal(r.json.error.code, 'CONNECTION_REQUIRED');
  r = await call('POST', '/conversations', { providerId: 'mock', model: 'mock-fast', systemPrompt: 'Be brief.' });
  assert.equal(r.status, 201);
  const convId = r.json.conversation.id;
  assert.equal(r.json.conversation.title, 'New chat');
  step('create conversation');

  r = await call('POST', `/conversations/${convId}/messages`, { content: 'Hello from the smoke test' });
  assert.equal(r.status, 201);
  assert.equal(r.json.assistantMessage.status, 'complete');
  assert.match(r.json.assistantMessage.content, /Mock AI/);
  assert.equal(r.json.conversation.title, 'Hello from the smoke test');
  step('send message (JSON) + auto title');

  const s = await stream(`/conversations/${convId}/messages/stream`, { content: 'Stream please' });
  const names = s.events.map((e) => e.event);
  assert.equal(names[0], 'user_message');
  assert.equal(names.at(-1), 'assistant_message');
  const deltas = s.events.filter((e) => e.event === 'delta').map((e) => e.data.text).join('');
  assert.equal(deltas, s.events.at(-1)!.data.message.content);
  step(`stream: ${names.length} events, deltas match final message`);

  const stopped = await stream(`/conversations/${convId}/messages/stream`, { content: '/long please' }, 5);
  assert.ok(stopped.events.length >= 6);
  await new Promise((res) => setTimeout(res, 200));
  r = await call('GET', `/conversations/${convId}`);
  const last = r.json.conversation.messages.at(-1);
  assert.equal(last.status, 'stopped');
  assert.ok(last.content.length > 0);
  step('stop mid-stream saves partial answer as "stopped"');

  r = await call('POST', `/conversations/${convId}/messages`, { content: '/error' });
  assert.equal(r.status, 502);
  assert.equal(r.json.error.code, 'PROVIDER_ERROR');
  const errStream = await stream(`/conversations/${convId}/messages/stream`, { content: '/ratelimit' });
  assert.equal(errStream.events.at(-1)!.data.message.status, 'error');
  r = await call('GET', `/conversations/${convId}`);
  assert.equal(r.json.conversation.messages.length, 10);
  step('provider errors: JSON 502, stream ends with an error message, both saved');

  r = await call('PATCH', `/conversations/${convId}`, { title: 'Renamed', pinned: true, model: 'mock-smart' });
  assert.equal(r.json.conversation.pinned, true);
  r = await call('GET', '/conversations?search=renam');
  assert.equal(r.json.conversations.length, 1);
  assert.equal(r.json.conversations[0].messageCount, 10);
  step('update + search conversations');

  r = await call('POST', '/compare', {
    prompt: 'Compare me',
    targets: [{ providerId: 'mock', model: 'mock-fast' }, { providerId: 'mock', model: 'mock-smart' }],
  });
  assert.equal(r.json.results.length, 2);
  assert.ok(r.json.results.every((x: any) => x.status === 'ok'));
  step('compare');

  r = await call('GET', '/usage?days=7');
  assert.equal(r.json.usage.daily.length, 7);
  assert.equal(r.json.usage.totals.requests, 5); // 3 chat (JSON, stream, stopped) + 2 compare; failed calls are not counted
  assert.equal(r.json.usage.byProvider[0].providerId, 'mock');
  step('usage summary');

  assert.equal((await call('DELETE', `/conversations/${convId}`)).status, 204);
  assert.equal((await call('GET', `/conversations/${convId}`)).status, 404);
  assert.equal((await call('DELETE', `/connections/${connection.id}`)).status, 204);
  assert.equal((await call('GET', '/connections')).json.connections.length, 0);
  step('delete conversation + connection');

  assert.equal((await call('GET', '/nope')).json.error.code, 'NOT_FOUND');
  step('unknown route 404');

  console.log('\nAll smoke checks passed.');
} finally {
  server.close();
}
