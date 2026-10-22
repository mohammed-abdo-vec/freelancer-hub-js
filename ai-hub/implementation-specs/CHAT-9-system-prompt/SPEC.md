# CHAT-9 · Set a system prompt: implementation spec

> **Story card:** [stories/CHAT-9-system-prompt.md](../../stories/CHAT-9-system-prompt.md) · **Depends on:** CHAT-8 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Files
| Action | Path | What |
|---|---|---|
| create | `src/features/chat/components/SystemPromptDialog.tsx` | `{ open; value: string; onSave(v: string): void \| Promise<void>; onClose; saving?: boolean }`, controlled and storage-agnostic |
| create | `src/features/chat/components/SystemPromptButton.tsx` | `TuneRounded` `IconButton` + `Badge variant="dot"` when `value` is non-empty |
| modify | `src/features/chat/components/ChatHeader.tsx` | mount the button and dialog; save → PATCH `{ systemPrompt }` |

## Steps
1. Dialog: title "System prompt", helper "Instructions the model follows for this whole conversation.", a multiline `TextField` (minRows 4, maxRows 12, max 4000 chars with a counter), and Cancel / Save (spinner).
2. The dialog doesn't know about the API: the header passes `onSave`. CHAT-1 reuses the same dialog with local state for new chats.
3. Success: close plus a snackbar "System prompt saved". An empty string clears it.
4. The button has a tooltip and `aria-label` "System prompt".

## Acceptance criteria
- [ ] Saving updates the conversation (it persists after a reload) and the badge appears.
- [ ] Clearing it removes the badge.
- [ ] After CHAT-2: a Mock AI reply mentions "System prompt in effect".

## Verify
Seeded conversation → set "Answer like a pirate" → reload → reopen the dialog.

## Out of scope
- Using it on new chats (CHAT-1).
