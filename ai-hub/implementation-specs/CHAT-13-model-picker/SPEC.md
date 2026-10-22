# CHAT-13 · Pick any model from connected providers: implementation spec

> **Story card:** [stories/CHAT-13-model-picker.md](../../stories/CHAT-13-model-picker.md) · **Depends on:** PROV-1 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Goal
A reusable `ModelPicker`, owned by the providers feature (`app-keys-config`) and exported from its `index.ts`, because chat, compare and settings all use it.

## API
`GET /providers/:providerId/models` returns `{ models: Model[] }` (`id, name, providerId, contextWindow`). It's live from the provider and cached on the server for 10 min. A 409 means the provider isn't connected.

## Files
| Action | Path | What |
|---|---|---|
| modify | `src/features/app-keys-config/api/providers.ts` | `listModels(providerId)` |
| create | `src/features/app-keys-config/hooks/useAllModels.ts` | `useQueries` over the connected providers |
| create | `src/features/app-keys-config/components/ModelPicker.tsx` | the component |
| create | `src/features/app-keys-config/types.ts` | `export type ModelSelection = { providerId: ProviderId; model: string }` |
| modify | `src/features/app-keys-config/index.ts` | export `ModelPicker`, `useAllModels` and `ModelSelection` |

## Steps
1. `useAllModels()`: connected providers = `useProviders()` filtered by `connection?.status === 'active'` (decide whether `invalid` counts; recommend excluding it). For each, `useQueries` with `queryKeys.models(id)` and `staleTime: 10 * 60_000`. Return `{ groups: { provider, models, isLoading, isError }[], isLoading, hasConnected }`. A failed group's models = `provider.suggestedModels.map(id => ({ id, name: id, providerId, contextWindow: null }))`.
2. `ModelPicker` props: `{ value: ModelSelection | null; onChange(v: ModelSelection): void; size?: 'small' | 'medium'; variant?: 'header' | 'field'; label?: string; disabled?: boolean; fullWidth?: boolean }`.
   - Options are flattened models; `groupBy` = provider name; `getOptionLabel` = `name`; `isOptionEqualToValue` compares providerId + id; `filterOptions` = `createFilterOptions({ stringify: (m) => `${m.name} ${m.id}` })`.
   - `renderGroup` adds a header with a `ProviderAvatar`, the name, and a `WarningAmberRounded` icon with the tooltip "Couldn't load live models, showing suggestions" when `isError`.
   - The selected value renders a start adornment with `ProviderAvatar`. Options show the name and, when it differs, the id in caption monospace.
   - The `header` variant is compact and borderless (it sits in the chat header like the ChatGPT model switcher); the `field` variant is a normal outlined TextField.
   - Show `loading` while any group is loading. With no connected providers, it's disabled with the placeholder "Connect a provider first".
   - If `value` points to a model that isn't in the list (for example an old conversation), still show it, using `value.model` as the label.
3. Don't hard-code model ids anywhere.

## Acceptance criteria
- [ ] With Mock AI connected, the picker lists `mock-fast` and `mock-smart` under "Mock AI".
- [ ] Typing "smart" filters to `mock-smart`.
- [ ] Simulating a failure (temporarily throw in `listModels` for mock) shows suggestions plus the warning icon. Revert it afterwards.
- [ ] The selected value shows the avatar and name; keyboard navigation works.

## Verify
Render it temporarily on the Compare placeholder page, check it, then remove it (CHAT-8 and CMP-1 mount it for real).

## Out of scope
- Persisting a selection (CHAT-8, SET-3).
