# CHAT-11 · Follow the answer while it streams: implementation spec

> **Story card:** [stories/CHAT-11-smart-autoscroll.md](../../stories/CHAT-11-smart-autoscroll.md) · **Depends on:** CHAT-2 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Files
| Action | Path | What |
|---|---|---|
| create | `src/shared/hooks/useAutoScroll.ts` | `useAutoScroll(ref, deps, { threshold = 80 })` → `{ isAtBottom, scrollToBottom(behavior?) }` |
| create | `src/features/chat/components/JumpToLatest.tsx` | a floating `Fab size="small" variant="extended"` |
| modify | `src/features/chat/pages/ChatPage.tsx` | attach it to the thread scroll container |

## Steps
1. The hook tracks `isAtBottom` on `scroll` (`scrollHeight - scrollTop - clientHeight <= threshold`), using a passive listener.
2. When `deps` change (messages length, draft), call `scrollToBottom('auto')` only if the view was at the bottom **before** the change. Use a ref, so content growth doesn't count as the user scrolling up.
3. On conversation change, jump to the bottom instantly once the messages render.
4. Sending a message always scrolls to the bottom (the user expects to see their message).
5. `JumpToLatest` is absolutely positioned bottom-center above the composer, shown with `Zoom` when `!isAtBottom`. Clicking it calls `scrollToBottom('smooth')`. Label: "Jump to latest" with `ArrowDownwardRounded`.

## Acceptance criteria
- [ ] `/long` stays pinned to the bottom while you watch.
- [ ] Scrolling up more than 80 px stops the follow and shows the button; clicking it returns and resumes following.
- [ ] Opening a long conversation starts at the bottom.

## Verify
Mock `/long` with scrolling up and down mid-stream, on desktop and at 360 px.

## Out of scope
- Virtualizing the list.
