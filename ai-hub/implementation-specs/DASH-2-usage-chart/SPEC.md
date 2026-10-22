# DASH-2 · See usage over time: implementation spec

> **Story card:** [stories/DASH-2-usage-chart.md](../../stories/DASH-2-usage-chart.md) · **Depends on:** DASH-1 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Files
| Action | Path | What |
|---|---|---|
| create | `src/features/home/components/UsageChart.tsx` | `{ daily: UsageSummary['daily']; loading? }` |
| modify | `src/features/home/pages/DashboardPage.tsx` | a full-width card under the stats |

## Steps
1. Metric toggle in the card header: "Requests" or "Tokens" (`ToggleButtonGroup size="small"`), kept in local state.
2. Requests: one bar series `requests`. Tokens: two **stacked** series, input and output (`stack: 'tokens'`).
3. X axis: `scaleType: 'band'`, `date` formatted with dayjs `MMM D` (with 30 days, show every other or every 5th label so they don't overlap). Y axis: `valueFormatter: formatNumber`.
4. Colors come from the theme palette (primary, secondary), not hex. Height 280 px. Tooltip on (axis trigger).
5. Loading: a `Skeleton variant="rounded"` at the same height. All zeros: show the chart plus a small "No activity in this range" overlay or caption.
6. Lazy cost: `@mui/x-charts` is heavy, so it must only ship in the dashboard chunk (check the build output).

## Acceptance criteria
- [ ] The chart shows 7, 14 or 30 bars according to the range.
- [ ] The toggle switches between requests and stacked tokens.
- [ ] Readable in light and dark mode, and at 360 px.
- [ ] `@mui/x-charts` isn't in the main entry chunk.

## Verify
Toggle the ranges and metric; inspect `yarn build` chunk names and sizes.

## Out of scope
- Breakdown (DASH-3).
