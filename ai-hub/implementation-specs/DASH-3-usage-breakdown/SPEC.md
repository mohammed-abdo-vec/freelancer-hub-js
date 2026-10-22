# DASH-3 · See usage by provider and model: implementation spec

> **Story card:** [stories/DASH-3-usage-breakdown.md](../../stories/DASH-3-usage-breakdown.md) · **Depends on:** DASH-1 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Files
| Action | Path | What |
|---|---|---|
| create | `src/features/home/components/ProviderBreakdown.tsx` | `{ byProvider; providers: Provider[] }` |
| create | `src/features/home/components/TopModelsTable.tsx` | `{ byModel; providers }` |
| modify | `src/features/home/pages/DashboardPage.tsx` | two cards side by side on lg (`Grid size={{ xs: 12, lg: 5 }}` and `{{ xs: 12, lg: 7 }}`) |

## Steps
1. **ProviderBreakdown**: for each `byProvider` row, show `ProviderAvatar`, the name (looked up from `providers` by id), `formatNumber(requests)` requests, and a `LinearProgress variant="determinate"` with value `requests / max * 100`. Its bar color is the provider `color` through `sx` (`'& .MuiLinearProgress-bar': { bgcolor: color }`), the allowed brand-color exception.
2. **TopModelsTable**: a MUI `Table size="small"` with columns Model (monospace), Provider (avatar + name), Requests, Input and Output (right-aligned, `formatNumber`). Wrap it in `overflowX: auto` for mobile, or hide the input/output columns on xs.
3. Empty: `EmptyState` with a compact "No usage yet" in each card.
4. Loading: skeleton rows.

## Acceptance criteria
- [ ] After chatting with Mock Fast and Mock Smart, both show up in the table and Mock AI shows in the breakdown.
- [ ] Bars use the provider brand color.
- [ ] No horizontal page scroll at 360 px.

## Verify
Chat with both mock models, then check `/`.

## Out of scope
- Recent conversations (DASH-4).
