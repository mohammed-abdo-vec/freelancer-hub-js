# CHAT-5 · Show model, tokens and latency per answer: implementation spec

> **Story card:** [stories/CHAT-5-message-metadata.md](../../stories/CHAT-5-message-metadata.md) · **Depends on:** CHAT-14 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Files
| Action | Path | What |
|---|---|---|
| create | `src/features/chat/components/MessageFooter.tsx` | `{ message: Message }` |
| modify | `src/features/chat/components/MessageBubble.tsx` | render the footer for assistant messages that aren't errors |

## Steps
1. Content, as one caption row in `text.secondary`: a 16 px `ProviderAvatar`, then `model`, then `·`, then `↑{formatNumber(in)} ↓{formatNumber(out)}` (hidden when `usage` is null), then `·`, then `formatLatency(latencyMs)` (hidden when null), then a `CopyButton` with `text={message.content}`.
2. Visibility: `opacity: 0` by default and `1` when the message container is hovered or has focus inside (`'&:hover .footer, &:focus-within .footer'`); always `1` under `@media (hover: none)`. Keep it in the layout (no layout shift).
3. Add a token tooltip, e.g. "120 input tokens · 480 output tokens".

## Acceptance criteria
- [ ] The seeded assistant messages show model, tokens and latency.
- [ ] The footer appears on hover and on keyboard focus, and is always visible in DevTools touch emulation.
- [ ] Copy copies the raw Markdown.

## Verify
Hover the seeded messages; switch DevTools to a mobile device.

## Out of scope
- Footers on streaming drafts (CHAT-2 decides when the final message replaces the draft).
