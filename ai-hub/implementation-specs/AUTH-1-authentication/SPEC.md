# AUTH-1 · Sign up, sign in and stay signed in: implementation spec

> **Story card:** [stories/AUTH-1-authentication.md](../../stories/AUTH-1-authentication.md) · **Depends on:** FND-4, FND-5 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Goal
The whole authentication flow: a visitor registers or signs in, private pages need a session, the session survives reloads and is re-validated on start, an expired session sends the user to sign in and back, and the user can sign out.

Build it in the order of the parts below. Each part leaves the app working.

## Current state
- `shared/api/client.ts` (FND-4): attaches the bearer token; on a 401 that isn't from `/auth/login` it calls `clearSession()` and shows a deduplicated "Session expired" snackbar.
- `shared/stores/auth.store.ts` persists `token` and `user` (key `ai-hub-auth`).
- **Part 1 is implemented:** `features/auth/api/auth.ts` (`register`), `hooks/useRegister.ts`, `components/PasswordField.tsx`, and `components/register-form/` (zod schema in `config.ts`, with an extra Confirm password field).
- `pages/LoginPage.tsx` is a placeholder with a "Continue" button that jumps to `/`.
- `src/app/router.tsx`: `RootLayout` → (`authRoutes`, an `AppShell` element with feature children, `*` → `NotFoundPage`). Nothing is guarded.
- `components/UserMenu.tsx` uses a hard-coded `const user = { name: 'Ada Lovelace', … }`, and its "Sign out" item just navigates to `paths.login`.
- `src/shared/components/LoadingScreen.tsx` exists.

## API
| Call | Body | Returns | Errors |
|---|---|---|---|
| `POST /auth/register` | `RegisterRequest { name (1–80), email, password (min 8) }` | 201 `AuthResponse { token, user }` | 400 `VALIDATION_ERROR` with `details`, 409 `CONFLICT` (email taken) |
| `POST /auth/login` | `LoginRequest { email, password }` | `AuthResponse` | 401 wrong credentials (the interceptor deliberately ignores 401s from this URL) |
| `GET /auth/me` | | `{ user: User }` | 401 bad or expired token |

There's no sign-out endpoint: JWTs are stateless, so signing out is client side only.

## Files
| Action | Path | What |
|---|---|---|
| done | `src/features/auth/api/auth.ts` | `register(body)`; add `login(body)` and `getMe()` |
| done | `src/features/auth/hooks/useRegister.ts` | mutation → `setSession` |
| done | `src/features/auth/components/PasswordField.tsx` | TextField with a show/hide adornment |
| done | `src/features/auth/components/register-form/` | the register form and its schema |
| create | `src/features/auth/components/login-form/` | `index.tsx` + `config.ts` (`loginSchema`), same shape as `register-form/` |
| create | `src/features/auth/hooks/useLogin.ts` | mutation → `setSession` |
| create | `src/features/auth/lib/safeRedirect.ts` | `safeRedirect(value: string \| null): string` |
| modify | `src/features/auth/pages/LoginPage.tsx` | render the login form |
| create | `src/features/auth/components/RequireAuth.tsx` | `<Outlet/>` or `<Navigate to=/login?redirect=…/>` |
| create | `src/features/auth/components/PublicOnly.tsx` | `<Outlet/>` or `<Navigate to="/" replace/>` |
| create | `src/features/auth/hooks/useMe.ts` | `useQuery({ queryKey: queryKeys.me, enabled: !!token })`, writes `setUser` |
| create | `src/features/auth/components/SessionGate.tsx` | `LoadingScreen` while the first `me` fetch is pending |
| create | `src/shared/utils/initials.ts` | `getInitials('Ada Lovelace')` → `'AL'` |
| modify | `src/features/auth/components/UserMenu.tsx` | real user, real sign-out |
| create | `src/shared/api/handleUnauthorized.ts` | one 401 handler for axios and (later) the stream client |
| modify | `src/shared/api/client.ts` | call `handleUnauthorized()` |
| create | `src/features/auth/hooks/useSignOut.ts` | returns `() => void` |
| modify | `src/features/auth/index.ts` | export `RequireAuth`, `PublicOnly`, `SessionGate`, `useSignOut` |
| modify | `src/app/router.tsx` | wrap route groups |

## Steps

### Part 1 · Create an account (done)
1. Schema: `name` trimmed, 1–80 chars; valid `email`; `password` at least 8 chars ("Password must be at least 8 characters"); `confirmPassword` must match.
2. react-hook-form + `zodResolver`, `mode: 'onTouched'`. `TextField`s with `autoComplete` (`name`, `email`, `new-password`), `error`/`helperText` from `formState.errors`, `fullWidth`.
3. "Create account" (`fullWidth`, `size="large"`) shows a `CircularProgress` and is disabled while pending. Only `name`, `email`, `password` are sent.
4. Errors: 409 → `setError('email', { message: 'An account with this email already exists' })`; 400 → map `getFieldErrors(e)` onto the form fields; anything else → `Alert severity="error"` above the form with `getErrorMessage(e)`.
5. Success: `setSession(token, user)`, then `navigate(paths.dashboard, { replace: true })`.
6. Footer: "Already have an account? Sign in" links to `paths.login`.

### Part 2 · Sign in
1. `loginSchema`: valid `email`; `password` at least 1 character ("Enter your password").
2. Same layout as Part 1: email (`autoComplete="email"`, autofocus), `PasswordField` (`current-password`), and a "Sign in" button with a spinner.
3. On 401 (or any non-field error): `<Alert severity="error">{getErrorMessage(e)}</Alert>` above the fields. Clear it when the user edits a field.
4. `safeRedirect`: accept only values that start with `/` and not `//`; otherwise return `/`. This prevents open redirects.
5. Success: `setSession`, then `navigate(safeRedirect(searchParams.get('redirect')), { replace: true })`.
6. Footer: "No account? Sign up" links to `paths.register`, keeping the `redirect` param. After registering, the register form should also honor it.
7. Dev convenience: when `import.meta.env.DEV`, show a caption "Demo: demo@aihub.dev / password123".

### Part 3 · Protect private routes
1. `RequireAuth`: `const token = useAuthStore((s) => s.token)`. Without a token, `<Navigate replace>` to `` `${paths.login}?redirect=${encodeURIComponent(location.pathname + location.search)}` ``.
2. `PublicOnly`: with a token, `<Navigate to={paths.dashboard} replace />`.
3. Router:
   ```tsx
   { element: <PublicOnly />, children: [...authRoutes] },
   { element: <RequireAuth />, children: [{ element: <AppShell …/>, children: [...] }] },
   { path: '*', element: <NotFoundPage /> },
   ```
4. The guards subscribe to the store, so clearing the session (from the 401 handler or sign-out) re-renders `RequireAuth` and redirects automatically. Part 5 relies on this.

### Part 4 · Stay signed in
1. `useMe` query function: `const { user } = await getMe(); useAuthStore.getState().setUser(user); return user;`.
2. `SessionGate`, rendered inside `RequireAuth` so it only runs with a token: while `isPending`, render `<LoadingScreen />`; on success, render children. On a 401 the interceptor has already cleared the session and `RequireAuth` redirects. On another error (server down), render `ErrorState` with Retry.
3. Gate once per app load. Navigating between pages must not show the loader again (the query is cached and fresh for `staleTime`).
4. `UserMenu`: `const user = useAuthStore((s) => s.user)`, fall back gracefully if it's null, and use `getInitials`.

### Part 5 · Expired session
1. Move the 401 handling into `handleUnauthorized()`: `clearSession()`, `queryClient.clear()` (so stale private data isn't shown to the next user), and the deduplicated snackbar "Session expired, please sign in again". The axios interceptor calls it; CHAT-2's stream client will too.
2. The redirect must use the path the user was on, not a path changed by a previous redirect.
3. Signing in afterwards returns to that path through `safeRedirect`.

### Part 6 · Sign out
1. `useSignOut`: `clearSession()`, then `queryClient.clear()`, then `navigate(paths.login, { replace: true })`. No "Session expired" snackbar; an optional "Signed out" info snackbar is fine.
2. Close the menu and the mobile drawer (`onNavigate?.()`) before navigating.
3. Export `useSignOut` for the Settings page (SET-4).

## Acceptance criteria
**Register**
- [ ] A short password shows a field error without calling the API.
- [ ] A taken email (`demo@aihub.dev` after `npm run seed`) shows the 409 message under email.
- [ ] Field errors from the server map onto fields.
- [ ] A valid registration stores the token and lands on `/`.

**Sign in**
- [ ] A wrong password shows the server message in an `Alert`, and no "Session expired" snackbar.
- [ ] Valid credentials go to `/`, or to `?redirect=/providers` when given.
- [ ] `?redirect=https://evil.com` or `//evil.com` goes to `/`.

**Guards**
- [ ] Signed out, `/compare` goes to `/login?redirect=%2Fcompare`, and signing in returns to `/compare`.
- [ ] Signed in, `/login` and `/register` go to `/`.
- [ ] Signed out, `/nope` shows the 404 page.

**Session**
- [ ] Reloading a private page while signed in shows the loader briefly, then the page.
- [ ] A tampered token in localStorage, after reload, lands on `/login`.
- [ ] The user menu shows the signed-in user's name, email and initials.

**Expiry**
- [ ] Signed in on `/providers`, set `token` in `ai-hub-auth` to garbage and trigger a request: you land on `/login?redirect=%2Fproviders` with one snackbar, and signing in returns to `/providers`.
- [ ] `handleUnauthorized` is exported for reuse.

**Sign out**
- [ ] After sign-out, `/login` shows and `ai-hub-auth` has `token: null`.
- [ ] Signing in as a different user shows none of the previous user's cached data (React Query devtools show an empty cache before login).
- [ ] The browser Back button doesn't show private pages.

**Everywhere**
- [ ] Usable at 360 px; password fields have a show/hide toggle with an `aria-label`.

## Verify
Run the server with seed data (`npm run seed && npm run dev`), then walk through the acceptance criteria in order: register, sign in, guards, reload, tampered token, server stopped (error state with Retry), sign out. Finish with `yarn lint && yarn build`.

## Out of scope
- Streaming 401s (CHAT-2 calls `handleUnauthorized`).
- The Settings page sign-out button (SET-4) and profile editing (SET-1).
