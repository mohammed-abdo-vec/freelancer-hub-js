# CMP-2 · See each model's answer as soon as it's ready: implementation spec

> **Story card:** [stories/CMP-2-parallel-results.md](../../stories/CMP-2-parallel-results.md) · **Depends on:** CMP-1, CHAT-4 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## API
`POST /compare` `CompareRequest { prompt, systemPrompt?, targets: [t] }` returns `CompareResponse { results: [CompareResult] }`. Per-target failures come back as `status: 'error'` inside a **200**. HTTP errors (400, 401, 429) can still happen.

## Files
| Action | Path | What |
|---|---|---|
| create | `src/features/compare/api/compare.ts` | `compare(body)` |
| create | `src/features/compare/hooks/useCompareRun.ts` | runs N parallel requests and exposes per-card state |
| create | `src/features/compare/components/CompareResultCard.tsx` | `{ target; state: { status: 'loading' } \| { status: 'done'; result } \| { status: 'failed'; message } }` |
| modify | `src/features/compare/pages/ComparePage.tsx` | render cards under the form |

## Steps
1. `useCompareRun()` returns `{ run(values), cards: { key, target, state }[], isRunning }`. Each `run` gets a run id. For each target, call `compare({ prompt, systemPrompt, targets: [t] })` independently and update that card's state when it settles. Ignore results from an older run id (the user ran again). Abort older requests with `AbortController` (axios supports `signal`).
   This is ephemeral UI state, not cached server state, so local `useState`/`useReducer` is fine (comparisons aren't stored or re-fetched). When all settle, invalidate `['usage']`.
2. Card: an outlined `Card` with a header (`ProviderAvatar` + model name), a body (`Skeleton` lines while loading, `<Markdown>` when done, `Alert` for `status: 'error'` results or HTTP failures), and a footer with latency, `↑ in ↓ out` tokens and a `CopyButton`.
3. Show the cards only after the first run.

## Acceptance criteria
- [ ] `mock-fast` vs `mock-smart` fills the two cards at different times (the Network tab shows 2 parallel requests).
- [ ] `/error` as the prompt gives error cards; the other cards are unaffected.
- [ ] Running again while one is still loading discards the stale result.
- [ ] The dashboard usage goes up afterwards (after DASH-1).

## Verify
The QA checklist "Compare" line (SPEC.md §9).

## Out of scope
- Grid sizing and equal heights (CMP-3).
