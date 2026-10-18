import { randomUUID } from 'node:crypto';
import { db, type ConnectionRecord } from '../db/store.js';
import { decrypt, encrypt, maskKey } from '../lib/crypto.js';
import { AppError, ProviderError, notFound } from '../lib/errors.js';
import { getProviderMeta } from '../providers/catalog.js';
import { getAdapter } from '../providers/registry.js';
import type { Model, ProviderId } from '../types/api.js';

const MODELS_TTL_MS = 10 * 60 * 1000;
const modelCache = new Map<string, { at: number; models: Model[] }>(); // key: connection id + updatedAt

export function findConnection(userId: string, connectionId: string): ConnectionRecord {
  const c = db.data.connections.find((x) => x.id === connectionId && x.userId === userId);
  if (!c) throw notFound('Connection');
  return c;
}

/** The saved key for a provider, or a 409 the UI can turn into a "Connect provider" prompt. */
export function requireConnection(userId: string, providerId: ProviderId): { connection: ConnectionRecord; apiKey: string } {
  const meta = getProviderMeta(providerId);
  if (!meta) throw notFound('Provider');
  const connection = db.data.connections.find((c) => c.userId === userId && c.providerId === providerId);
  if (!connection) throw new AppError(409, 'CONNECTION_REQUIRED', `Connect ${meta.name} first by adding an API key.`);
  return { connection, apiKey: decrypt(connection.encryptedKey) };
}

/** Calls the provider with the key; throws ProviderError (422) if the key is rejected. */
export async function validateKey(providerId: ProviderId, apiKey: string): Promise<Model[]> {
  return getAdapter(providerId).listModels(apiKey);
}

export async function createConnection(userId: string, providerId: ProviderId, apiKey: string, label?: string) {
  const meta = getProviderMeta(providerId);
  if (!meta) throw notFound('Provider');
  if (db.data.connections.some((c) => c.userId === userId && c.providerId === providerId)) {
    throw new AppError(409, 'CONFLICT', `${meta.name} is already connected. Update or remove the existing key instead.`);
  }
  const models = await validateKey(providerId, apiKey);
  const now = new Date().toISOString();
  const record: ConnectionRecord = {
    id: randomUUID(),
    userId,
    providerId,
    label: label?.trim() || meta.name,
    encryptedKey: encrypt(apiKey),
    maskedKey: maskKey(apiKey),
    status: 'active',
    lastValidatedAt: now,
    lastError: null,
    createdAt: now,
    updatedAt: now,
  };
  db.write((d) => d.connections.push(record));
  modelCache.set(cacheKey(record), { at: Date.now(), models });
  return record;
}

export async function updateConnection(userId: string, id: string, patch: { label?: string; apiKey?: string }) {
  const record = findConnection(userId, id);
  if (patch.apiKey) await validateKey(record.providerId, patch.apiKey);
  const now = new Date().toISOString();
  db.write(() => {
    if (patch.label !== undefined) record.label = patch.label.trim() || record.label;
    if (patch.apiKey) {
      record.encryptedKey = encrypt(patch.apiKey);
      record.maskedKey = maskKey(patch.apiKey);
      record.status = 'active';
      record.lastValidatedAt = now;
      record.lastError = null;
    }
    record.updatedAt = now;
  });
  return record;
}

export function deleteConnection(userId: string, id: string) {
  const record = findConnection(userId, id);
  db.write((d) => {
    d.connections = d.connections.filter((c) => c.id !== record.id);
  });
}

export async function testConnection(userId: string, id: string) {
  const record = findConnection(userId, id);
  const started = performance.now();
  let ok = true;
  let error: string | null = null;
  let modelCount: number | null = null;
  try {
    const models = await validateKey(record.providerId, decrypt(record.encryptedKey));
    modelCount = models.length;
    modelCache.set(cacheKey(record), { at: Date.now(), models });
  } catch (err) {
    if (!(err instanceof ProviderError)) throw err;
    ok = false;
    error = err.message;
  }
  const latencyMs = Math.round(performance.now() - started);
  db.write(() => {
    record.lastValidatedAt = new Date().toISOString();
    // Only a rejected key marks the connection invalid; outages/rate limits don't.
    record.status = ok || !error?.includes('rejected the API key') ? 'active' : 'invalid';
    record.lastError = error;
  });
  return { ok, latencyMs, modelCount, error, connection: record };
}

export async function listModels(userId: string, providerId: ProviderId): Promise<Model[]> {
  const { connection, apiKey } = requireConnection(userId, providerId);
  const key = cacheKey(connection);
  const cached = modelCache.get(key);
  if (cached && Date.now() - cached.at < MODELS_TTL_MS) return cached.models;
  const models = await validateKey(providerId, apiKey);
  modelCache.set(key, { at: Date.now(), models });
  return models;
}

const cacheKey = (c: ConnectionRecord) => `${c.id}:${c.updatedAt}`;
