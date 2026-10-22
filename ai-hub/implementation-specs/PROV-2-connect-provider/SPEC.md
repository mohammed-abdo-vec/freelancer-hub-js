# PROV-2 · Connect a provider with an API key: implementation spec

> **Story card:** [stories/PROV-2-connect-provider.md](../../stories/PROV-2-connect-provider.md) · **Depends on:** PROV-1 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## API
`POST /connections`, body `CreateConnectionRequest { providerId, apiKey, label? }`, returns 201 `{ connection }`. Errors: 422 `PROVIDER_AUTH_FAILED` (bad key), 409 `CONFLICT` (already connected), 400 validation.

## Files
| Action | Path | What |
|---|---|---|
| create | `src/features/app-keys-config/api/connections.ts` | `createConnection(body)` |
| create | `src/features/app-keys-config/hooks/useCreateConnection.ts` | mutation, invalidates `queryKeys.providers` |
| create | `src/features/app-keys-config/schemas.ts` | `connectSchema { label?: string (≤ 60), apiKey: string (min 1, trimmed) }` |
| create | `src/features/app-keys-config/components/ApiKeyField.tsx` | password `TextField` + show/hide `InputAdornment` |
| create | `src/features/app-keys-config/components/ConnectProviderDialog.tsx` | `{ provider: Provider; open; onClose }` |
| modify | `src/features/app-keys-config/components/ProviderCard.tsx` | enable Connect |

## Steps
1. Dialog: title "Connect {provider.name}", with a `ProviderAvatar` in the title. Fields: Label (placeholder `provider.name`, helper "Optional") and API key (`ApiKeyField`, `autoFocus`, `autoComplete="off"`, `spellCheck={false}`, placeholder `keyPlaceholder`). Below the key, a link "Get an API key ↗" to `apiKeyUrl`.
2. Actions: Cancel, and a submit "Validate & save" with a spinner and disabled state while pending. Cancel stays enabled. While pending, block Esc and backdrop close so the request isn't orphaned.
3. Errors:
   - 422 → `setError('apiKey', { message })`.
   - 409 → `setError('apiKey', { message })` (it's already connected; rare, since the button is hidden for connected providers).
   - 400 → `getFieldErrors`.
   - Anything else → error snackbar.
4. Success: `enqueueSnackbar(`${provider.name} connected`, { variant: 'success' })`, close the dialog, `reset()` the form. Invalidating `['providers']` updates the card.
5. Security: don't put the key in a query key, don't `console.log` it, and `reset()` the form on close so the key doesn't stay in memory. The mutation's `variables` is the only place it lives during the request (acceptable).

## Acceptance criteria
- [ ] Mock AI with `bad-key-123` (after removing the seeded connection, or on a fresh account) shows an inline error under the key and the dialog stays open.
- [ ] `mock-123456` shows the spinner, then closes, shows "Mock AI connected", and the card shows **Connected** `mock••••••••3456`.
- [ ] Show/hide works and has an `aria-label`.
- [ ] Searching localStorage and the devtools query cache for `mock-123456` finds nothing after saving.

## Verify
On a fresh account (register a new user): connect Mock AI with a bad key, then a good one.

## Out of scope
- Test, edit, remove (PROV-3 to PROV-5).
