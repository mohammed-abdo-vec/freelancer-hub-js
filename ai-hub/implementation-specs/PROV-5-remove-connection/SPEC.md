# PROV-5 · Remove a connection: implementation spec

> **Story card:** [stories/PROV-5-remove-connection.md](../../stories/PROV-5-remove-connection.md) · **Depends on:** PROV-2 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## API
`DELETE /connections/:id` returns 204.

## Files
| Action | Path | What |
|---|---|---|
| modify | `src/features/app-keys-config/api/connections.ts` | `deleteConnection(id)` |
| create | `src/features/app-keys-config/hooks/useDeleteConnection.ts` | mutation, invalidates providers |
| modify | `src/features/app-keys-config/components/ProviderCard.tsx` | Remove → `ConfirmDialog` |

## Steps
1. The Remove button (text, `color="error"`) opens the shared `ConfirmDialog` with title `Remove ${name}?`, the description from the story, `confirmLabel="Remove"`, and `loading` while pending.
2. Success: close, snackbar "{name} removed". The card goes back to Not connected through invalidation.
3. Error: keep the dialog open and show an error snackbar.

## Acceptance criteria
- [ ] The copy matches the story exactly (with the provider name substituted).
- [ ] After confirming, the card shows Not connected and the Connected tab count drops.
- [ ] Cancel does nothing.

## Verify
Remove Mock AI, then reconnect it with `mock-123456`.

## Out of scope
- The chat-side "connect provider" CTA (CHAT-6, CHAT-12).
