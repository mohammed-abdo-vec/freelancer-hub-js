# CHAT-3 · Stop a generating answer: implementation spec

> **Story card:** [stories/CHAT-3-stop-generation.md](../../stories/CHAT-3-stop-generation.md) · **Depends on:** CHAT-10 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md), SPEC.md §3.6 "Stop"

## Behavior to know
After an abort, **no** `assistant_message` reaches the client. The server saves the partial text as `status: 'stopped'`, so the client must mark the local draft as stopped itself and refetch about 300 ms later.

## Files
| Action | Path | What |
|---|---|---|
| modify | `src/features/chat/hooks/useChatStream.ts` | complete `stop()` |
| modify | `src/features/chat/components/Composer.tsx` | Stop button when `streaming` |
| modify | `src/features/chat/pages/ChatPage.tsx` | the `Esc` key listener while streaming |

## Steps
1. `stop()`: `controller.abort()`. Then append a local assistant message to the cache: `{ id: 'temp-stopped-…', role: 'assistant', content: draft, status: 'stopped', providerId/model from the conversation, usage: null, latencyMs: null }`. Clear `draft` and set `status = 'idle'`. Then `setTimeout(() => invalidateQueries({ queryKey: queryKeys.conversation(id) }), 300)` to load the saved version. Clear the timeout on unmount.
2. If you stop before any delta arrived, append nothing (or an empty stopped message, whichever matches what the server saved after the refetch; the refetch is the source of truth).
3. Composer: when `streaming`, render a `StopRounded` `IconButton` (`aria-label="Stop generating"`, tooltip "Stop (Esc)") in place of Send that calls `onStop`.
4. `Esc`: while streaming, a window `keydown` listener for `Escape` calls `stop()`. Don't steal Esc from open dialogs or menus: ignore it when `event.defaultPrevented` or when focus is inside `[role="dialog"]`.
5. `MessageBubble` already shows the "Stopped" chip (CHAT-14).

## Acceptance criteria
- [ ] `/long` → Stop → the partial text stays with a "Stopped" chip.
- [ ] Esc does the same.
- [ ] Reloading still shows the stopped message.
- [ ] You can send a new message straight after stopping.

## Verify
Mock AI `/long`, stopped both ways, then reload.

## Out of scope
- Auto-scroll (CHAT-11).
