# CHAT-14 · Open and read a conversation: implementation spec

> **Story card:** [stories/CHAT-14-read-conversation.md](../../stories/CHAT-14-read-conversation.md) · **Depends on:** CHAT-7 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Current state
- `src/features/chat/pages/ChatPage.tsx` handles both `/chat` (centered greeting + `Composer`) and `/chat/:conversationId` (a header with the title, a placeholder thread, `Composer` pinned to the bottom), using mock data.
- `src/features/chat/routes.ts` declares **two** routes with the same `ChatPage`.

## API
`GET /conversations/:id` returns `{ conversation: ConversationDetail }` (with `messages`, oldest first). Unknown ids return 404.

## Files
| Action | Path | What |
|---|---|---|
| modify | `src/features/chat/routes.ts` | **one** route `` `${paths.chat}/:conversationId?` `` (optional segment) so `ChatPage` stays mounted between `/chat` and `/chat/:id`. CHAT-1's stream must survive that navigation |
| modify | `src/features/chat/api/conversations.ts` | `getConversation(id)` |
| create | `src/features/chat/hooks/useConversation.ts` | `useQuery({ queryKey: queryKeys.conversation(id), enabled: !!id })` |
| create | `src/features/chat/components/MessageList.tsx` | `{ messages: Message[] }`, the scroll container lives in `ChatPage` |
| create | `src/features/chat/components/MessageBubble.tsx` | `{ message: Message }` (memoized) |
| create | `src/features/chat/components/AssistantAvatar.tsx` | `ProviderAvatar` from the message's `providerId` (via `useProviders`) |
| create | `src/features/chat/components/ThreadSkeleton.tsx` | alternating skeleton bubbles |
| modify | `src/features/chat/pages/ChatPage.tsx` | real data, states |

## Steps
1. Layout of the existing-conversation branch stays the same: header (title for now; CHAT-8 adds the picker), a scrollable thread (`flex: 1; overflowY: auto`), then `Composer`. The thread content is centered with `maxWidth: 820`.
2. `MessageBubble`:
   - user: right-aligned `Box`, `bgcolor` = primary at 12 % alpha (`theme.alpha` or `rgba(var(--mui-palette-primary-mainChannel) / 0.12)`), radius 2, `whiteSpace: 'pre-wrap'`, `wordBreak: 'break-word'`, `maxWidth: '85%'`.
   - assistant: avatar + content column. For now render `content` as plain pre-wrapped text with a `// TODO(CHAT-4)` for Markdown.
   - `status === 'error'`: `<Alert severity="error">{message.error}</Alert>` (CHAT-6 adds Retry).
   - `status === 'stopped'`: content plus a small `Chip label="Stopped"`.
   - Wrap it in `React.memo`.
3. Not found: when `getErrorStatus(error) === 404`, show `EmptyState` with "Conversation not found", "It may have been deleted." and a button to `paths.chat`. Other errors get `ErrorState` with refetch.
4. `useDocumentTitle(conversation?.title ?? 'Chat')`.
5. Keep the `/chat` (no id) branch as it is for now; CHAT-1 replaces it.
6. Remove the remaining `mockConversations` import and delete the file if CHAT-7 didn't.

## Acceptance criteria
- [ ] The seeded "Welcome to AI Hub" renders its messages in order with the correct alignment.
- [ ] Error and stopped messages render as specified (find them in seed data, or create them later via `/error` and `/long`).
- [ ] `/chat/does-not-exist` shows the not-found state.
- [ ] Navigating between `/chat` and `/chat/:id` does **not** remount `ChatPage` (check with a temporary `useEffect` log in dev, then remove it).
- [ ] No horizontal scroll at 360 px.

## Verify
Open the seeded conversation, then an invalid id, then switch between conversations in the sidebar.

## Out of scope
- Markdown (CHAT-4), footer metadata (CHAT-5), sending (CHAT-2).
