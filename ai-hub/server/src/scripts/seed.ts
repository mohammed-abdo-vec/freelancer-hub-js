/**
 * Creates a demo account with a Mock AI connection and a sample conversation.
 * Run with the server STOPPED (the server keeps the DB in memory):  npm run seed
 */
import { randomUUID } from 'node:crypto';
import { db } from '../db/store.js';
import { encrypt, maskKey } from '../lib/crypto.js';
import { hashPassword } from '../lib/password.js';

const EMAIL = 'demo@aihub.dev';
const PASSWORD = 'password123';

if (db.data.users.some((u) => u.email === EMAIL)) {
  console.log(`Demo user already exists → ${EMAIL} / ${PASSWORD}`);
  process.exit(0);
}

const now = new Date().toISOString();
const userId = randomUUID();
const conversationId = randomUUID();
const mockKey = 'mock-demo-key-123';

const reply = 'Hi! I am the **Mock AI** provider. Connect a real provider on the *Providers* page to chat with real models.';

db.write((d) => {
  d.users.push({ id: userId, name: 'Demo User', email: EMAIL, passwordHash: '', createdAt: now });
  d.connections.push({
    id: randomUUID(),
    userId,
    providerId: 'mock',
    label: 'Mock AI',
    encryptedKey: encrypt(mockKey),
    maskedKey: maskKey(mockKey),
    status: 'active',
    lastValidatedAt: now,
    lastError: null,
    createdAt: now,
    updatedAt: now,
  });
  d.conversations.push({
    id: conversationId,
    userId,
    title: 'Welcome to AI Hub',
    providerId: 'mock',
    model: 'mock-fast',
    systemPrompt: '',
    pinned: true,
    createdAt: now,
    updatedAt: now,
  });
  const base = { conversationId, status: 'complete' as const, error: null, createdAt: now };
  d.messages.push(
    { ...base, id: randomUUID(), role: 'user', content: 'Hello! What is this app?', providerId: null, model: null, usage: null, latencyMs: null },
    { ...base, id: randomUUID(), role: 'assistant', content: reply, providerId: 'mock', model: 'mock-fast', usage: { inputTokens: 6, outputTokens: 28 }, latencyMs: 420 },
  );
  d.usage.push({ id: randomUUID(), userId, providerId: 'mock', model: 'mock-fast', source: 'chat', inputTokens: 6, outputTokens: 28, createdAt: now });
});

const passwordHash = await hashPassword(PASSWORD);
db.write((d) => {
  d.users.find((u) => u.id === userId)!.passwordHash = passwordHash;
});
await db.flush();
console.log(`Seeded demo user → ${EMAIL} / ${PASSWORD}`);
