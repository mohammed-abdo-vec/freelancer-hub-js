# CHAT-12 · Guide me when no provider is connected: implementation spec

> **Story card:** [stories/CHAT-12-no-providers-state.md](../../stories/CHAT-12-no-providers-state.md) · **Depends on:** CHAT-1 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Files
| Action | Path | What |
|---|---|---|
| modify | `src/features/chat/components/NewChatState.tsx` | early return when `!hasConnected` |

## Steps
1. Use `useAllModels().hasConnected` (CHAT-13). While providers are loading, show a skeleton, **not** the empty state, so it doesn't flash.
2. Empty state: `EmptyState` with the `KeyRounded` icon, "Connect a provider to start chatting", "Add an API key for OpenAI, Anthropic, Gemini… or try Mock AI for free." and a contained "Connect a provider" button to `paths.providers`.

## Acceptance criteria
- [ ] A fresh account (register a new user) on `/chat` sees the empty state, with no composer and no flash on load.
- [ ] After connecting Mock AI, `/chat` shows the picker and composer.

## Verify
Register a new user → `/chat` → connect Mock → `/chat`.

## Out of scope
- Dashboard onboarding (DASH-5).
