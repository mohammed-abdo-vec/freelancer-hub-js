# CHAT-7 · Browse, search and manage conversations: implementation spec

> **Story card:** [stories/CHAT-7-conversation-list.md](../../stories/CHAT-7-conversation-list.md) · **Depends on:** AUTH-3, FND-5 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Goal
Replace the mock history in the main sidebar with real, manageable conversations.

## Current state
- `src/features/chat/components/RecentChats.tsx` renders into the **main sidebar content slot** (see CONVENTIONS "Deliberate differences"). It reads `data/mockConversations.ts` and groups items into Pinned and Recents.
- "New chat" is already the first nav item (`⌘K`), so don't add another New chat button.

## API
- `GET /conversations?search=` returns `{ conversations: Conversation[] }`, pinned first, then most recent.
- `PATCH /conversations/:id` with `{ title?, pinned? }` returns `{ conversation }`.
- `DELETE /conversations/:id` returns 204.

## Files
| Action | Path | What |
|---|---|---|
| create | `src/features/chat/api/conversations.ts` | `listConversations(search)`, `updateConversation(id, body)`, `deleteConversation(id)` |
| create | `src/features/chat/hooks/useConversations.ts` | `useQuery(queryKeys.conversations(search))` with `placeholderData: keepPreviousData` |
| create | `src/features/chat/hooks/useUpdateConversation.ts` | mutation → invalidate `['conversations']`, update `['conversation', id]` if cached |
| create | `src/features/chat/hooks/useDeleteConversation.ts` | mutation → invalidate `['conversations']`, `removeQueries(['conversation', id])` |
| create | `src/shared/hooks/useDebouncedValue.ts` | `useDebouncedValue(value, 300)` |
| create | `src/features/chat/components/ConversationItem.tsx` | row + kebab menu + inline rename |
| modify | `src/features/chat/components/RecentChats.tsx` | search + sections + states |
| delete | `src/features/chat/data/mockConversations.ts` | after `ChatPage` stops importing it (leave a TODO there for CHAT-14, or switch it to the real hook) |
| modify | `src/features/chat/index.ts` | export `useConversations` (the dashboard uses it in DASH-4) |

## Steps
1. Search: a small `TextField` with a `SearchRounded` adornment and a clear button, at the top of the slot. Debounce it 300 ms. While a search is active, show one flat "Results" list instead of the sections.
2. Sections: split `conversations` by `pinned`. Keep the server order (it's already sorted).
3. `ConversationItem` (a `NavLink` like today, so `.active` highlighting keeps working): a 20 px `ProviderAvatar` (the color comes from `useProviders()` imported from `@/features/app-keys-config`; fall back to `action.selected`), the title (noWrap), and a `RelativeTime` of `updatedAt` in caption size. Hovering or focusing reveals a `MoreHorizRounded` kebab button (always visible on touch: `@media (hover: none)`).
4. Menu:
   - **Rename** swaps the title for an `InputBase` (autofocus, all text selected). Enter or blur saves (trimmed, 1–200 chars, unchanged → no request); Esc cancels.
   - **Pin/Unpin** → PATCH `{ pinned }`.
   - **Delete** → `ConfirmDialog` "Delete conversation? "{title}" will be permanently deleted." On success, if it's the current `conversationId`, `navigate(paths.chat, { replace: true })`. Snackbar "Conversation deleted".
5. States: 6 skeleton rows; a compact inline error with a Retry link; empty "No conversations yet" (or "No matches" while searching).
6. Keep `onNavigate` (it closes the mobile drawer) and `ChatPage.preload` on hover.

## Acceptance criteria
- [ ] The seeded "Welcome to AI Hub" shows under Pinned.
- [ ] Search narrows the list after a 300 ms pause, and clearing it restores the list.
- [ ] Rename, Pin/Unpin and Delete work and survive a reload. Deleting the open chat goes to `/chat`.
- [ ] The kebab menu is keyboard reachable and has an `aria-label`.

## Verify
After seeding: pin and unpin, rename, search "welcome", delete a test conversation (create one with `curl` or wait for CHAT-1).

## Out of scope
- Rendering the thread (CHAT-14). Creating conversations (CHAT-1).
