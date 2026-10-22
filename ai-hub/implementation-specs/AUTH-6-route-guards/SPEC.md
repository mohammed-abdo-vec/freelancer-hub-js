# AUTH-6 · Protect private routes: implementation spec

> **Story card:** [stories/AUTH-6-route-guards.md](../../stories/AUTH-6-route-guards.md) · **Depends on:** AUTH-2 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Goal
Route-level guards driven by `auth.store`.

## Current state
`src/app/router.tsx`: `RootLayout` → (`authRoutes`, an `AppShell` element with feature children, `*` → `NotFoundPage`). Nothing is guarded.

## Files
| Action | Path | What |
|---|---|---|
| create | `src/features/auth/components/RequireAuth.tsx` | renders `<Outlet/>` or `<Navigate to=/login?redirect=…/>` |
| create | `src/features/auth/components/PublicOnly.tsx` | renders `<Outlet/>` or `<Navigate to="/" replace/>` |
| modify | `src/features/auth/index.ts` | export both |
| modify | `src/app/router.tsx` | wrap route groups |

## Steps
1. `RequireAuth`: `const token = useAuthStore((s) => s.token)`. Without a token, redirect to `` `${paths.login}?redirect=${encodeURIComponent(location.pathname + location.search)}` `` with `replace`.
2. `PublicOnly`: with a token, `<Navigate to={paths.dashboard} replace />`.
3. Router:
   ```tsx
   { element: <PublicOnly />, children: [...authRoutes] },
   { element: <RequireAuth />, children: [{ element: <AppShell …/>, children: [...] }] },
   { path: '*', element: <NotFoundPage /> },
   ```
4. Because the guards subscribe to the store, clearing the session (from the 401 interceptor or sign-out) re-renders `RequireAuth` and redirects automatically. AUTH-4 relies on this.

## Acceptance criteria
- [ ] Signed out, `/compare` goes to `/login?redirect=%2Fcompare`, and signing in returns to `/compare`.
- [ ] Signed in, `/login` goes to `/`.
- [ ] Signed out, `/nope` shows the 404 page.

## Verify
Try the three cases above, then delete `ai-hub-auth` from localStorage and reload a private page.

## Out of scope
- `GET /auth/me` bootstrap (AUTH-3).
