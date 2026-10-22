# AUTH-4 · Handle expired sessions: implementation spec

> **Story card:** [stories/AUTH-4-expired-session.md](../../stories/AUTH-4-expired-session.md) · **Depends on:** AUTH-3 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Goal
Make the end-to-end expiry flow solid. Most of the pieces exist already: the FND-4 interceptor clears the session and AUTH-6's `RequireAuth` redirects. This story wires them together and closes the gaps.

## Current state
- The interceptor clears the session and shows a deduplicated snackbar (FND-4).
- `RequireAuth` redirects with `?redirect=` (AUTH-6).

## Files
| Action | Path | What |
|---|---|---|
| modify | `src/shared/api/client.ts` | also `queryClient.clear()` on 401 so stale private data isn't shown to the next user |
| modify | `src/features/auth/components/RequireAuth.tsx` | keep `location.pathname + search` in the redirect (check it) |
| create | `src/shared/api/handleUnauthorized.ts` | one function used by both axios and (later) the fetch stream client |

## Steps
1. Extract the 401 handling into `handleUnauthorized()`: `clearSession()`, `queryClient.clear()`, and the deduplicated snackbar "Session expired, please sign in again". The axios interceptor calls it. CHAT-2's stream client will call it too.
2. Make sure the redirect happens from the path the user was on, not from a path changed by a previous redirect.
3. Make sure that signing in afterwards returns to that path (AUTH-2's `safeRedirect`).

## Acceptance criteria
- [ ] Signed in on `/providers`, delete `token` from localStorage `ai-hub-auth` (or set it to garbage) and trigger any request (switch tabs or pages). You land on `/login?redirect=%2Fproviders` with one snackbar.
- [ ] Signing in returns to `/providers`.
- [ ] `handleUnauthorized` is exported for reuse.

## Verify
The steps above, plus a wrong password on `/login` must **not** show "Session expired".

## Out of scope
- Streaming 401s (CHAT-2 calls `handleUnauthorized`).
