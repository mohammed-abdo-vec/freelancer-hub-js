# PROV-6 · Point new users to the free Mock AI provider: implementation spec

> **Story card:** [stories/PROV-6-mock-banner.md](../../stories/PROV-6-mock-banner.md) · **Depends on:** PROV-1 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Files
| Action | Path | What |
|---|---|---|
| create | `src/features/app-keys-config/components/MockBanner.tsx` | `Alert severity="info"` with an `onClose` |
| modify | `src/features/app-keys-config/pages/ProvidersPage.tsx` | render it above the tabs |

## Steps
1. Show it when `providers.some(p => p.id === 'mock')` and it hasn't been dismissed. Optionally also hide it once Mock is already connected (a nice touch; say so in your report).
2. Persist the dismissal with `useLocalStorageState('ai-hub-mock-banner-dismissed', false)` (it's a UI preference, not server data).
3. Render the copy with `<strong>Mock AI</strong>` and `` `mock-` `` in monospace. Optionally add a "Connect Mock AI" action button that opens the PROV-2 dialog for the mock provider.

## Acceptance criteria
- [ ] The banner shows when the mock provider exists and stays hidden after dismissing and reloading.
- [ ] Hidden when the server has no mock provider.

## Verify
Dismiss, reload. Clear the key in localStorage, reload.

## Out of scope
- Dashboard onboarding (DASH-5).
