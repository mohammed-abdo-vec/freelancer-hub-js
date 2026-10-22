# CHAT-8 · Switch model mid-conversation: implementation spec

> **Story card:** [stories/CHAT-8-switch-model.md](../../stories/CHAT-8-switch-model.md) · **Depends on:** CHAT-13, CHAT-14 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Files
| Action | Path | What |
|---|---|---|
| create | `src/features/chat/components/ChatHeader.tsx` | `{ conversation: Conversation }`: picker on the left; on the right, a `// TODO(CHAT-9)` system-prompt slot |
| modify | `src/features/chat/pages/ChatPage.tsx` | replace the title header with `ChatHeader` |

## Steps
1. Header layout (SPEC.md §6.3): `ModelPicker variant="header"` with `value={{ providerId, model }}`. On change, run `useUpdateConversation().mutate({ id, body: { providerId, model } })`.
2. Optimistic update: `setQueryData(queryKeys.conversation(id))` with the new fields right away, and roll back on error with a snackbar.
3. The header is visible on every breakpoint (it replaces the md-only title header). The conversation title already shows in the sidebar and the document title.
4. The composer placeholder becomes `Message {modelName}…`. Get the display name from `useAllModels`, falling back to the model id.

## Acceptance criteria
- [ ] Switching to `mock-smart` and reloading still shows `mock-smart`.
- [ ] Older assistant messages still show their original model in the footer (CHAT-5).
- [ ] A failed PATCH reverts the picker and shows an error.

## Verify
Seeded conversation → switch → reload. (After CHAT-2, the next reply's footer says `mock-smart`.)

## Out of scope
- System prompt (CHAT-9). The model for a new chat (CHAT-1).
