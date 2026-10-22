# PROV-3 · Test a connection: implementation spec

> **Story card:** [stories/PROV-3-test-connection.md](../../stories/PROV-3-test-connection.md) · **Depends on:** PROV-2 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## API
`POST /connections/:id/test` returns `TestConnectionResponse { ok, latencyMs, modelCount, error, connection }`. It **always returns 200**, so check `ok`.

## Files
| Action | Path | What |
|---|---|---|
| modify | `src/features/app-keys-config/api/connections.ts` | `testConnection(id)` |
| create | `src/features/app-keys-config/hooks/useTestConnection.ts` | mutation; on settle, invalidate `queryKeys.providers` |
| modify | `src/features/app-keys-config/components/ProviderCard.tsx` | enable Test |

## Steps
1. While pending, the Test button shows a small `CircularProgress` in place of its icon and is disabled. Only that card's button spins (one mutation instance per card).
2. On `ok: true`: success snackbar `Working · ${modelCount} models · ${formatLatency(latencyMs)}`. Leave out the models part when `modelCount` is null.
3. On `ok: false`: error snackbar with `error`.
4. On a network or HTTP failure: error snackbar with `getErrorMessage`.
5. Optionally write the returned `connection` into the `['providers']` cache with `setQueryData` before invalidating, so the chip updates instantly.

## Acceptance criteria
- [ ] Testing Mock AI shows "Working · 2 models · N ms".
- [ ] The "Checked …" time resets to "a few seconds ago".
- [ ] A failing test turns the chip into **Invalid key** with the error in its tooltip.

## Verify
Test Mock AI. To see a failure, connect a real provider with a key you then revoke, or note that you couldn't reproduce it with Mock.

## Out of scope
- Editing the key (PROV-4).
