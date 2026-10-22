# PROV-4 · Replace a key or rename a connection: implementation spec

> **Story card:** [stories/PROV-4-edit-connection.md](../../stories/PROV-4-edit-connection.md) · **Depends on:** PROV-2 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## API
`PATCH /connections/:id`, body `UpdateConnectionRequest { label?, apiKey? }` (the key is re-validated), returns `{ connection }`. A bad key gives a 422.

## Files
| Action | Path | What |
|---|---|---|
| modify | `src/features/app-keys-config/api/connections.ts` | `updateConnection(id, body)` |
| create | `src/features/app-keys-config/hooks/useUpdateConnection.ts` | mutation, invalidates providers |
| modify | `src/features/app-keys-config/schemas.ts` | `editConnectionSchema { label: string (1–60), apiKey: string (optional, may be '') }` |
| create | `src/features/app-keys-config/components/EditConnectionDialog.tsx` | `{ provider; connection; open; onClose }` |
| modify | `src/features/app-keys-config/components/ProviderCard.tsx` | enable Edit |

## Steps
1. Prefill `label` with `connection.label`. The key field (reuse `ApiKeyField`) starts empty, with helper text "Leave blank to keep the current key (`{maskedKey}`)".
2. Build the body with only the fields that changed. Send `apiKey` only when it's non-empty. If nothing changed, just close.
3. The submit label is "Validate & save" when a new key is entered, otherwise "Save". Spinner while pending.
4. Error handling is the same as `ConnectProviderDialog`. Extract a shared `applyConnectionErrors(err, setError)` helper if it keeps the code DRY.
5. Success: snackbar "{provider.name} updated", close, reset.

## Acceptance criteria
- [ ] Renaming only sends `{ label }` and updates the card.
- [ ] A bad new key shows an inline error and the old key stays.
- [ ] A good new key updates the masked key.

## Verify
Edit Mock AI's label, then try `bad-key`, then `mock-999999`.

## Out of scope
- Remove (PROV-5).
