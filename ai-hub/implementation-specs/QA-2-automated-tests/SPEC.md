# QA-2 · Add automated tests for critical logic: implementation spec

> **Story card:** [stories/QA-2-automated-tests.md](../../stories/QA-2-automated-tests.md) · **Depends on:** CHAT-2, AUTH-2, PROV-1, FND-5 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Files
| Action | Path | What |
|---|---|---|
| create | `src/shared/utils/format.test.ts` | the examples from FND-5 plus edge cases (0, 999, 1000, 999_999) |
| create | `src/shared/api/errors.test.ts` | axios `ApiError` with details, network error, plain `Error`, `StreamHttpError`, unknown values |
| create | `src/features/chat/api/sse.test.ts` | `parseSSE`: a single event, several events in one chunk, an event split across 2–3 chunks, a trailing partial block kept in `rest` |
| create | `src/features/auth/pages/LoginPage.test.tsx` | empty submit shows errors; an invalid email shows an error; a 401 shows an `Alert` (mock `login`) |
| create | `src/features/app-keys-config/components/ProviderCard.test.tsx` | not connected / active / invalid render the right chip and actions |
| create | `src/test/renderWithProviders.tsx` | a helper with Theme, QueryClient (retry off), MemoryRouter and SnackbarProvider |

## Steps
1. Use `vi.mock` for API modules. Never hit the real server.
2. Use `@testing-library/user-event` for interactions and query by role and label (that also tests a11y).
3. Keep the tests fast and deterministic: fake timers for any debounce, and a fixed `Date` for relative times.

## Acceptance criteria
- [ ] All the listed test files exist and pass with `yarn test`.
- [ ] The split-chunk SSE case is covered.
- [ ] There are no React `act()` warnings in the output.

## Verify
`yarn test`, then `yarn lint && yarn build`.

## Out of scope
- E2E tests (Playwright). Coverage thresholds.
