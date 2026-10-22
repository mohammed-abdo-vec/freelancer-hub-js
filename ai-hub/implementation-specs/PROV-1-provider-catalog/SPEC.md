# PROV-1 · See every supported provider: implementation spec

> **Story card:** [stories/PROV-1-provider-catalog.md](../../stories/PROV-1-provider-catalog.md) · **Depends on:** AUTH-3, FND-5 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Goal
`/providers` lists every provider with its live connection status. This story also creates the data layer the other PROV stories extend.

## Current state
`src/features/app-keys-config/pages/ProvidersPage.tsx` renders `PagePlaceholder`. The feature folder is `app-keys-config` (this is the "providers" feature).

## API
`GET /providers` returns `{ providers: Provider[] }`. Each provider has `id, name, description, website, apiKeyUrl, keyPlaceholder, color, suggestedModels, connection: Connection | null`. `Connection.status` is `'active' | 'invalid'`; `lastValidatedAt` and `lastError` are also on it.

## Files
| Action | Path | What |
|---|---|---|
| create | `src/features/app-keys-config/api/providers.ts` | `listProviders()` |
| create | `src/features/app-keys-config/hooks/useProviders.ts` | `useQuery(queryKeys.providers)` returning `Provider[]` |
| create | `src/features/app-keys-config/components/StatusChip.tsx` | `{ connection: Connection \| null }` |
| create | `src/features/app-keys-config/components/ProviderCard.tsx` | `{ provider: Provider }` |
| create | `src/features/app-keys-config/components/ProviderCardSkeleton.tsx` | same shape as the card |
| modify | `src/features/app-keys-config/pages/ProvidersPage.tsx` | header, tabs, grid |
| modify | `src/features/app-keys-config/index.ts` | export `useProviders` (chat, compare and home need it) |

## Steps
1. `StatusChip`: `null` → "Not connected" (`default`, outlined); `active` → "Connected" (`success`); `invalid` → "Invalid key" (`error`, with `lastError` as a tooltip). Small size, with a dot icon.
2. `ProviderCard` (layout from SPEC.md §6.4): an outlined `Card` with a header row (`ProviderAvatar` + name + `StatusChip`), the description (2-line clamp), then for connected providers a `Key` row in monospace showing `maskedKey` and "Checked <RelativeTime>" (or "Never checked"). The actions row:
   - connected: Test / Edit / Remove buttons, rendered but **disabled**, with a `// TODO(PROV-3/4/5)`. Plus a "Docs ↗" link to `website`.
   - not connected: a primary **Connect** button (disabled, `// TODO(PROV-2)`) plus a "Get API key ↗" link to `apiKeyUrl` (`target="_blank" rel="noreferrer"`).
   The card stretches to the row height (`height: '100%'`, actions pinned to the bottom).
3. Page: an `h4` "Providers" plus a subtitle, then `Tabs` All / Connected / Not connected with counts. Keep the selected tab in the URL search param `?filter=` so it survives a reload. Then the grid: `Grid` with `size={{ xs: 12, sm: 6, lg: 4 }}`, using a `Container maxWidth="lg"`.
4. States: 6 skeleton cards while loading; `ErrorState` with `refetch` on error; `EmptyState` when a filter matches nothing (for example "No connected providers yet").
5. `useDocumentTitle('Providers')`.

## Acceptance criteria
- [ ] All providers from the API render with the correct chip, avatar color and masked key.
- [ ] The tabs filter correctly, show counts and survive a reload.
- [ ] Loading, error and empty states work.
- [ ] The grid is 1, 2 and 3 columns at xs, sm and lg; no horizontal scroll at 360 px.

## Verify
After seeding, Mock AI shows **Connected** `mock••••••••…` and the others show Not connected. Stop the server and reload to see the error state.

## Out of scope
- The dialogs and actions (PROV-2 to PROV-5). The mock banner (PROV-6).
