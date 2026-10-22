# AUTH-3 · Keep me signed in across reloads: implementation spec

> **Story card:** [stories/AUTH-3-session-persistence.md](../../stories/AUTH-3-session-persistence.md) · **Depends on:** AUTH-6 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Goal
On reload, the stored session is re-validated before any private page renders, and the UI shows the real user.

## Current state
- `auth.store` persists `token` and `user` (FND-4).
- `src/features/auth/components/UserMenu.tsx` uses a hard-coded `const user = { name: 'Ada Lovelace', … }` with a `TODO(Phase 3)`.
- `src/shared/components/LoadingScreen.tsx` exists.

## API
`GET /auth/me` returns `{ user: User }`.

## Files
| Action | Path | What |
|---|---|---|
| modify | `src/features/auth/api/auth.ts` | `getMe()` |
| create | `src/features/auth/hooks/useMe.ts` | `useQuery({ queryKey: queryKeys.me, enabled: !!token })`, writes `setUser` on success |
| create | `src/features/auth/components/SessionGate.tsx` | shows `LoadingScreen` while the first `me` fetch is pending |
| modify | `src/features/auth/index.ts` | export `SessionGate` |
| modify | `src/app/router.tsx` or `RequireAuth.tsx` | render private routes inside `SessionGate` |
| create | `src/shared/utils/initials.ts` | `getInitials('Ada Lovelace')` → `'AL'` |
| modify | `src/features/auth/components/UserMenu.tsx` | read `user` from the store |

## Steps
1. `SessionGate` (used inside `RequireAuth`, so it only runs with a token): call `useMe()`. While `isPending`, render `<LoadingScreen />`. On success, render children. On a 401, the FND-4 interceptor has already cleared the session and `RequireAuth` redirects. On another error (server down), render `ErrorState` with Retry.
2. `useMe` `onSuccess`-style sync: inside the query function, `const { user } = await getMe(); useAuthStore.getState().setUser(user); return user;`.
3. `UserMenu`: `const user = useAuthStore((s) => s.user)`. Fall back gracefully if it's null. Use `getInitials`.
4. Only gate once per app load. Navigating between pages must not show the loader again (the query is cached and fresh for `staleTime`).

## Acceptance criteria
- [ ] Reloading any private page while signed in shows the loader briefly, then the page.
- [ ] A tampered token in localStorage, after reload, lands on `/login`.
- [ ] The user menu shows the signed-in user's name, email and initials.

## Verify
Sign in, reload. Edit `ai-hub-auth` → `token` to garbage, reload. Stop the server and reload to see the error state with Retry.

## Out of scope
- Sign out (AUTH-5).
