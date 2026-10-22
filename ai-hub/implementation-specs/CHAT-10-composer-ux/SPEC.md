# CHAT-10 · Write messages comfortably: implementation spec

> **Story card:** [stories/CHAT-10-composer-ux.md](../../stories/CHAT-10-composer-ux.md) · **Depends on:** CHAT-2 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Current state
`src/features/chat/components/Composer.tsx` already does most of this: `InputBase multiline maxRows={8}`, Enter/Shift+Enter (with an IME `isComposing` guard), the hint, and a pill `Paper`. It's missing the preference, the streaming state, focus management and an external value API (CHAT-1's suggestion chips need to fill it).

## Files
| Action | Path | What |
|---|---|---|
| create | `src/shared/stores/preferences.store.ts` | zustand + persist `ai-hub-prefs`: `{ enterToSend: boolean (true); defaultModel: { providerId; model } \| null (null); setEnterToSend; setDefaultModel }` |
| modify | `src/features/chat/components/Composer.tsx` | props + behavior |

## Steps
1. New props: `{ onSend(text): void; onStop?(): void; streaming?: boolean; disabled?: boolean; placeholder?: string; value?: string; onValueChange?(v): void }`. Support controlled and uncontrolled use. Expose `focus()` through a ref (`useImperativeHandle`) or focus internally after sending.
2. Key handling: if `enterToSend` is on, Enter sends and Shift+Enter adds a newline. If it's off, Enter adds a newline and Ctrl/Cmd+Enter sends. Keep the `isComposing` guard.
3. `canSend = !streaming && !disabled && text.trim().length > 0`. While `streaming`, the send slot is reserved for the Stop button (CHAT-3); for now keep it disabled.
4. After `onSend`, clear the input and refocus it.
5. The hint stays the same. When `enterToSend` is off, add "Ctrl+Enter to send" (⌘ on Mac).

## Acceptance criteria
- [ ] The input grows to 8 rows, then scrolls.
- [ ] Enter and Shift+Enter behave as specified; calling `usePreferencesStore.getState().setEnterToSend(false)` (temporarily expose the store on `window` in dev) switches to Ctrl/Cmd+Enter.
- [ ] Send is disabled when empty or streaming.
- [ ] Focus is back in the input after sending.

## Verify
Type multi-line text, send while streaming (blocked), and check focus after sending.

## Out of scope
- The Settings toggle UI (SET-3). The Stop button (CHAT-3).
