# CHAT-1 · Start a new chat with any model: implementation spec

> **Story card:** [stories/CHAT-1-new-chat.md](../../stories/CHAT-1-new-chat.md) · **Depends on:** CHAT-2, CHAT-9, CHAT-10 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md), SPEC.md §7.4 "New chat flow"

## Current state
- `ChatPage` with no id renders "What can I help with?" plus a centered `Composer`. Keep this ChatGPT-style layout and add the picker and chips.
- CHAT-14 made `/chat/:conversationId?` a single route, so `ChatPage` stays mounted across the navigation.
- `⌘K` is already handled in `AppShell` (it navigates to `/chat`). Make sure it also resets the new-chat state when you're already on `/chat`.

## API
`POST /conversations` `CreateConversationRequest { providerId, model, title?, systemPrompt? }` returns 201 `{ conversation }`. A 409 `CONNECTION_REQUIRED` means the provider isn't connected.

## Files
| Action | Path | What |
|---|---|---|
| modify | `src/features/chat/api/conversations.ts` | `createConversation(body)` |
| create | `src/features/chat/hooks/useCreateConversation.ts` | mutation |
| create | `src/features/chat/components/NewChatState.tsx` | greeting, `ModelPicker variant="field"` (large), `SystemPromptButton` + dialog (local state), suggestion chips, composer |
| create | `src/features/chat/components/SuggestionChips.tsx` | `{ onPick(text) }` with 4 chips and prompt templates |
| modify | `src/features/chat/hooks/useChatStream.ts` | `send(content, { conversationId? })` so it can target a just-created id |
| modify | `src/features/chat/pages/ChatPage.tsx` | own `useChatStream` above both branches |

## Steps
1. **Picker default**: `preferences.defaultModel` if it's still available in `useAllModels`, otherwise the first model of the first connected group. Keep the selection in local state.
2. **Chips** fill the composer with a starter template (for example "Explain the concept of … in simple terms"), place the cursor at the end, and focus it. Use the controlled `value` from CHAT-10.
3. **Send flow** (§7.4):
   1. `createConversation({ providerId, model, systemPrompt: local || undefined })`.
   2. `setQueryData(queryKeys.conversation(newId), { ...conversation, messages: [] })`.
   3. Start the stream for `newId` (the optimistic user message renders right away).
   4. `navigate(paths.conversation(newId), { replace: true })`.
   5. Invalidate `['conversations']` so the item appears (the auto title arrives with `assistant_message`, which invalidates again).
   The hook instance must not abort on this navigation: its "conversation changed" cleanup must not fire when the id goes from `undefined` to the id it is already streaming. Track the active stream's id in a ref.
4. While the create mutation is pending, the composer is disabled and shows a spinner in the send slot.
5. A 409 on create shows the same CTA as CHAT-6 (or a snackbar until CHAT-6 is done).
6. `useDocumentTitle('New chat')`.

## Acceptance criteria
- [ ] New chat → Mock Fast → chip → send: the message shows instantly, streams, the URL becomes `/chat/:id`, and the sidebar shows the auto title.
- [ ] The stream is **not** interrupted by the URL change (no duplicate request, the text keeps growing).
- [ ] A system prompt set before the first send is saved on the new conversation.
- [ ] `⌘K`/`Ctrl+K` from anywhere opens a fresh new-chat state.

## Verify
The QA checklist "Chat" first line (SPEC.md §9), then reload to confirm persistence.

## Out of scope
- The no-providers empty state (CHAT-12). Retry (CHAT-6).
