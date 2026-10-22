# CHAT-2 · Stream answers token by token: implementation spec

> **Story card:** [stories/CHAT-2-streaming-answers.md](../../stories/CHAT-2-streaming-answers.md) · **Depends on:** CHAT-14, AUTH-4 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md), then **SPEC.md §3.6, §7.3 and §7.4 in full**

## Goal
The core chat loop: send, stream and finish in an existing conversation. Stop (CHAT-3), auto-scroll (CHAT-11), new chats (CHAT-1) and retry (CHAT-6) build on this.

## Current state
`Composer` takes an optional `onSend`; without it the send button stays disabled. `ChatPage` renders it without `onSend`.

## API (SPEC.md §3.6)
`POST /api/conversations/:id/messages/stream`, body `{ content }`.
- **Pre-flight** errors (400, 401, 404, 409) are normal JSON errors with a non-200 status.
- Otherwise `200 text/event-stream`: `user_message` → `delta`* → `assistant_message { message, conversation }`. The stream **always** ends with `assistant_message`; provider failures arrive there as `status: 'error'`.
- `event: error` only fires for server bugs.

## Files
| Action | Path | What |
|---|---|---|
| create | `src/features/chat/api/sse.ts` | `parseSSE(buffer): { events: { event: string; data: unknown }[]; rest: string }`, a pure function (unit-tested in QA-2) |
| create | `src/features/chat/api/stream.ts` | `streamMessage(id, body, handlers, signal)` + `class StreamHttpError extends Error { status; apiError }` |
| create | `src/features/chat/hooks/useChatStream.ts` | the state machine (§7.4) |
| create | `src/features/chat/components/TypingIndicator.tsx` | three dots with a CSS keyframe animation through `sx`, respecting `prefers-reduced-motion` |
| create | `src/features/chat/components/StreamingBubble.tsx` | `{ draft: string }`: the typing indicator while empty, then `<Markdown>` of the draft |
| modify | `src/features/chat/components/MessageList.tsx` | render `StreamingBubble` after the messages while streaming |
| modify | `src/features/chat/pages/ChatPage.tsx` | wire `useChatStream` → `Composer onSend` |

## Steps
1. **`stream.ts`**: follow §7.3, but put the block parsing in `parseSSE` so it can be tested with chunked input (an event split across two chunks must work). Use `API_URL` from `@/shared/api/client` and the token from `useAuthStore.getState()`. On `!res.ok`: parse the JSON as `ApiError`, call `handleUnauthorized()` (AUTH-4) if the status is 401, then throw `StreamHttpError`. Make `getApiError` and `getErrorStatus` (FND-4) understand `StreamHttpError`. Type the `data` payloads with `ChatStreamEvent` from the API types and narrow them; no `any`.
2. **`useChatStream(conversationId)`** returns `{ send(content), stop(), status: 'idle' | 'streaming', draft, error }`:
   1. `send`: create an `AbortController` (kept in a ref) and set `status = 'streaming'`, `draft = ''`. Optimistically append `{ id: 'temp-' + crypto.randomUUID(), role: 'user', content, status: 'complete', … }` to `['conversation', id]` via `setQueryData`.
   2. `onUserMessage`: replace the temp message with the real one.
   3. `onDelta`: append to a ref buffer and flush it to `draft` state once per `requestAnimationFrame`.
   4. `onAssistantMessage(message, conversation)`: append `message`, merge the `conversation` fields into the cache (the title may change), clear `draft`, set `status = 'idle'`, and invalidate `['conversations']` and `['usage']`.
   5. Pre-flight `StreamHttpError`: remove the temp message, set `status = 'idle'`, set `error`, and show a snackbar with the message. CHAT-6 adds the 409 CTA.
   6. `AbortError` is not a failure. CHAT-3 handles the stopped draft; for now just set idle.
   7. Abort on unmount and when `conversationId` changes (an effect cleanup).
   8. `stop()` exists and calls `controller.abort()` (CHAT-3 completes it).
3. While `status === 'streaming'`, disable `Composer` sending (CHAT-10 refines this).
4. Performance: finished `MessageBubble`s are memoized, so only `StreamingBubble` re-renders per frame.

## Acceptance criteria
- [ ] With Mock AI, a message appears at once, then dots, then the text grows word by word.
- [ ] After it finishes, the bubble has a footer, the sidebar title updates, and reloading shows the same thread.
- [ ] Pre-flight errors (for example a 404 on a deleted conversation) roll back the optimistic message and show a snackbar.
- [ ] Navigating to another conversation mid-stream aborts it (check the Network tab).
- [ ] `parseSSE` handles an event split across chunks (prove it with a quick test or a console check; full tests come in QA-2).

## Verify
Seeded conversation: send "hello". Then send and immediately switch conversations. Then send in a conversation deleted from another tab.

## Out of scope
- Stop UX and the "Stopped" chip (CHAT-3), auto-scroll (CHAT-11), new chat (CHAT-1), Retry and 409 CTA (CHAT-6).
