/**
 * Public API contract — every JSON shape the API sends or accepts.
 * The frontend should copy this file verbatim to `src/types/api.ts`.
 */

export type ProviderId =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'mistral'
  | 'groq'
  | 'deepseek'
  | 'xai'
  | 'openrouter'
  | 'mock';

// ── Errors ────────────────────────────────────────────────

export type ApiErrorCode =
  | 'VALIDATION_ERROR' // 400 — `details` holds per-field issues
  | 'UNAUTHORIZED' // 401 — missing/expired token → log out
  | 'FORBIDDEN' // 403
  | 'NOT_FOUND' // 404
  | 'CONFLICT' // 409 — e.g. email taken, provider already connected
  | 'CONNECTION_REQUIRED' // 409 — the provider has no saved API key
  | 'PROVIDER_AUTH_FAILED' // 422 — the provider rejected the API key
  | 'PROVIDER_RATE_LIMITED' // 429 — the provider is rate limiting this key
  | 'RATE_LIMITED' // 429 — this API is rate limiting the client
  | 'PROVIDER_ERROR' // 502 — any other upstream failure
  | 'INTERNAL_ERROR'; // 500

export interface ValidationIssue {
  path: string; // e.g. "email"
  message: string;
}

export interface ApiError {
  error: {
    code: ApiErrorCode;
    message: string; // human readable, safe to show in a toast
    details?: ValidationIssue[];
  };
}

// ── Auth ──────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string; // ISO 8601
}

export interface RegisterRequest {
  name: string; // 1–80 chars
  email: string;
  password: string; // min 8 chars
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string; // JWT — send as `Authorization: Bearer <token>`
  user: User;
}

export interface UpdateProfileRequest {
  name: string;
}

// ── Providers & connections ───────────────────────────────

export interface Connection {
  id: string;
  providerId: ProviderId;
  label: string;
  maskedKey: string; // e.g. "sk-p••••••••wxyz" — the raw key is never returned
  status: 'active' | 'invalid';
  lastValidatedAt: string | null;
  lastError: string | null; // set when the last test failed
  createdAt: string;
  updatedAt: string;
}

export interface Provider {
  id: ProviderId;
  name: string; // "OpenAI"
  description: string;
  website: string;
  apiKeyUrl: string; // where the user creates a key
  keyPlaceholder: string; // input placeholder, e.g. "sk-..."
  color: string; // brand-ish hex for avatars/chips
  suggestedModels: string[]; // fallback when the live model list is unavailable
  connection: Connection | null; // null = not connected
}

export interface CreateConnectionRequest {
  providerId: ProviderId;
  apiKey: string;
  label?: string; // defaults to the provider name
}

export interface UpdateConnectionRequest {
  label?: string;
  apiKey?: string; // re-validated before saving
}

export interface TestConnectionResponse {
  ok: boolean;
  latencyMs: number;
  modelCount: number | null;
  error: string | null;
  connection: Connection;
}

export interface Model {
  id: string; // what you send back as `model`
  name: string; // display name
  providerId: ProviderId;
  contextWindow: number | null;
}

// ── Conversations & messages ──────────────────────────────

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export type MessageRole = 'user' | 'assistant';
export type MessageStatus = 'complete' | 'stopped' | 'error';

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string; // Markdown for assistant messages
  status: MessageStatus; // 'stopped' = user aborted mid-stream; content is partial
  error: string | null; // set when status === 'error'
  providerId: ProviderId | null; // assistant messages only
  model: string | null; // assistant messages only
  usage: TokenUsage | null; // assistant messages only
  latencyMs: number | null; // assistant messages only
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  providerId: ProviderId;
  model: string;
  systemPrompt: string;
  pinned: boolean;
  messageCount: number;
  lastMessagePreview: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDetail extends Conversation {
  messages: Message[]; // oldest first
}

export interface CreateConversationRequest {
  providerId: ProviderId;
  model: string;
  title?: string; // defaults to "New chat", then auto-set from the first message
  systemPrompt?: string;
}

export interface UpdateConversationRequest {
  title?: string;
  providerId?: ProviderId; // switching model mid-conversation is allowed
  model?: string;
  systemPrompt?: string;
  pinned?: boolean;
}

export interface SendMessageRequest {
  content: string; // 1–32,000 chars
  maxTokens?: number; // optional output cap
}

export interface SendMessageResponse {
  userMessage: Message;
  assistantMessage: Message;
  conversation: Conversation;
}

/**
 * Events on `POST /api/conversations/:id/messages/stream` (text/event-stream).
 * Order: user_message → delta* → assistant_message → (stream closes)
 * `error` is only sent if something fails before the assistant message exists.
 */
export type ChatStreamEvent =
  | { event: 'user_message'; data: { message: Message } }
  | { event: 'delta'; data: { text: string } }
  | { event: 'assistant_message'; data: { message: Message; conversation: Conversation } }
  | { event: 'error'; data: ApiError };

// ── Compare ───────────────────────────────────────────────

export interface CompareTarget {
  providerId: ProviderId;
  model: string;
}

export interface CompareRequest {
  prompt: string;
  systemPrompt?: string;
  targets: CompareTarget[]; // 1–4
  maxTokens?: number;
}

export interface CompareResult extends CompareTarget {
  status: 'ok' | 'error';
  content: string | null;
  error: string | null;
  usage: TokenUsage | null;
  latencyMs: number;
}

export interface CompareResponse {
  results: CompareResult[]; // same order as `targets`
}

// ── Usage ─────────────────────────────────────────────────

export interface UsageBucket {
  requests: number;
  inputTokens: number;
  outputTokens: number;
}

export interface UsageSummary {
  rangeDays: number;
  totals: UsageBucket;
  byProvider: (UsageBucket & { providerId: ProviderId })[]; // sorted by requests desc
  byModel: (UsageBucket & { providerId: ProviderId; model: string })[]; // top 10
  daily: (UsageBucket & { date: string })[]; // "YYYY-MM-DD", one entry per day, oldest first
}

export interface HealthResponse {
  status: 'ok';
  version: string;
  time: string;
  mockProviderEnabled: boolean;
}
