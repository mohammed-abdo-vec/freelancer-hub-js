import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { env } from '../config/env.js';
import type { MessageRole, MessageStatus, ProviderId, TokenUsage } from '../types/api.js';

// ── Records (internal shapes, may hold secrets — never send these as-is) ──

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface ConnectionRecord {
  id: string;
  userId: string;
  providerId: ProviderId;
  label: string;
  encryptedKey: string;
  maskedKey: string;
  status: 'active' | 'invalid';
  lastValidatedAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationRecord {
  id: string;
  userId: string;
  title: string;
  providerId: ProviderId;
  model: string;
  systemPrompt: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRecord {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  error: string | null;
  providerId: ProviderId | null;
  model: string | null;
  usage: TokenUsage | null;
  latencyMs: number | null;
  createdAt: string;
}

export interface UsageRecord {
  id: string;
  userId: string;
  providerId: ProviderId;
  model: string;
  source: 'chat' | 'compare';
  inputTokens: number;
  outputTokens: number;
  createdAt: string;
}

export interface Data {
  users: UserRecord[];
  connections: ConnectionRecord[];
  conversations: ConversationRecord[];
  messages: MessageRecord[];
  usage: UsageRecord[];
}

const empty = (): Data => ({ users: [], connections: [], conversations: [], messages: [], usage: [] });

/**
 * A tiny JSON-file database. All reads/writes happen in memory; every
 * `write()` schedules an atomic flush to disk (write temp file → rename).
 * Good enough for a single-process dev server — swap for a real DB later.
 */
class JsonStore {
  private readonly file = resolve(env.DATA_FILE);
  private flushing: Promise<void> = Promise.resolve();
  private dirty = false;
  readonly data: Data;

  constructor() {
    mkdirSync(dirname(this.file), { recursive: true });
    this.data = existsSync(this.file) ? { ...empty(), ...JSON.parse(readFileSync(this.file, 'utf8')) } : empty();
  }

  /** Mutate data, then persist. Returns whatever the mutator returns. */
  write<T>(mutate: (data: Data) => T): T {
    const result = mutate(this.data);
    this.scheduleFlush();
    return result;
  }

  /** Resolves once everything written so far is on disk. */
  async flush(): Promise<void> {
    await this.flushing;
  }

  private scheduleFlush() {
    if (this.dirty) return;
    this.dirty = true;
    this.flushing = this.flushing.then(async () => {
      this.dirty = false;
      const tmp = `${this.file}.tmp`;
      await writeFile(tmp, JSON.stringify(this.data, null, 2));
      await rename(tmp, this.file);
    });
  }
}

export const db = new JsonStore();
