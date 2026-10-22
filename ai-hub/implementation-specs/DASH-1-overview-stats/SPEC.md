# DASH-1 · See my usage at a glance: implementation spec

> **Story card:** [stories/DASH-1-overview-stats.md](../../stories/DASH-1-overview-stats.md) · **Depends on:** PROV-1, FND-5 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Current state
`src/features/home/pages/DashboardPage.tsx` is a `PagePlaceholder`. The feature folder is `home` (this is the "dashboard" feature).

## API
`GET /usage?days=7|14|30` returns `{ usage: UsageSummary { rangeDays, totals, byProvider, byModel, daily } }`. Connected providers come from `useProviders()` (`@/features/app-keys-config`).

## Files
| Action | Path | What |
|---|---|---|
| create | `src/features/home/api/usage.ts` | `getUsage(days)` |
| create | `src/features/home/hooks/useUsage.ts` | `useQuery(queryKeys.usage(days))` with `placeholderData: keepPreviousData` |
| create | `src/shared/utils/greeting.ts` | `getGreeting(date = new Date())`: before 12 → "Good morning", before 18 → "Good afternoon", otherwise "Good evening" |
| create | `src/features/home/components/StatCard.tsx` | `{ icon; label; value: string; hint?: string; loading? }` |
| create | `src/features/home/components/RangeSelector.tsx` | `ToggleButtonGroup` 7d / 14d / 30d |
| modify | `src/features/home/pages/DashboardPage.tsx` | header + range + stat grid |

## Steps
1. The range lives in the URL (`?days=14`, default 14, only 7, 14 or 30 allowed), so it's shareable and survives a reload.
2. Header: `h4` `${getGreeting()}, ${firstName}` (first word of `user.name` from `auth.store`), a subtitle "Here's your AI usage for the last N days", and `RangeSelector` on the right (it wraps below on xs).
3. Stat grid: `Grid size={{ xs: 12, sm: 6, lg: 3 }}`.
   - Connected providers: `${connected}/${total}` (`hint`: "Manage" link to `/providers`).
   - Requests, Input tokens, Output tokens: `formatNumber(totals.x)`.
4. Loading: `StatCard loading` renders a `Skeleton` in place of the value. Error: `ErrorState` with `refetch`.
5. `useDocumentTitle('Dashboard')`.

## Acceptance criteria
- [ ] The greeting uses the time of day and the user's first name.
- [ ] The four stats show correct numbers; changing the range updates them without flashing back to skeletons.
- [ ] Numbers above 1000 are abbreviated.

## Verify
Chat a few messages, return to `/`, and compare the numbers with `curl -H "Authorization: Bearer …" localhost:4000/api/usage?days=7`.

## Out of scope
- Chart (DASH-2), breakdown (DASH-3), recents (DASH-4), onboarding (DASH-5).
