import type { Connection, Conversation, Message, User } from '../types/api.js';
import { db, type ConnectionRecord, type ConversationRecord, type MessageRecord, type UserRecord } from './store.js';

// Records → public DTOs. Anything secret (password hash, encrypted key) is dropped here.

export const toUser = ({ id, name, email, createdAt }: UserRecord): User => ({ id, name, email, createdAt });

export const toConnection = ({ encryptedKey: _k, userId: _u, ...rest }: ConnectionRecord): Connection => rest;

export const toMessage = (m: MessageRecord): Message => ({ ...m });

export function toConversation({ userId: _u, ...c }: ConversationRecord): Conversation {
  const messages = db.data.messages.filter((m) => m.conversationId === c.id);
  const last = messages.at(-1);
  return {
    ...c,
    messageCount: messages.length,
    lastMessagePreview: last ? last.content.slice(0, 120) || null : null,
  };
}
