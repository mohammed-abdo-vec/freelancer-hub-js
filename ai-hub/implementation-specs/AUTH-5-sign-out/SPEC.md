# AUTH-5 · Sign out: implementation spec

> **Story card:** [stories/AUTH-5-sign-out.md](../../stories/AUTH-5-sign-out.md) · **Depends on:** AUTH-3 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Goal
A real sign-out. There's no server endpoint: JWTs are stateless, so signing out is client side only.

## Current state
The `UserMenu` "Sign out" item just runs `goTo(paths.login)`.

## Files
| Action | Path | What |
|---|---|---|
| create | `src/features/auth/hooks/useSignOut.ts` | returns `() => void` |
| modify | `src/features/auth/index.ts` | export `useSignOut` |
| modify | `src/features/auth/components/UserMenu.tsx` | use it |

## Steps
1. `useSignOut`: `clearSession()`, then `queryClient.clear()`, then `navigate(paths.login, { replace: true })`. Show no "Session expired" snackbar; an optional "Signed out" info snackbar is fine.
2. Close the menu and the mobile drawer (`onNavigate?.()`) before navigating.

## Acceptance criteria
- [ ] After sign-out, `/login` shows and localStorage `ai-hub-auth` has `token: null`.
- [ ] Signing in as a different user shows none of the previous user's cached data (check the React Query devtools: the cache was empty before login).
- [ ] The browser Back button doesn't show private pages (the guard redirects).

## Verify
Sign out from the user menu, open devtools, sign in again.

## Out of scope
- The Settings page button (SET-4).
