# AUTH-2 · Sign in: implementation spec

> **Story card:** [stories/AUTH-2-sign-in.md](../../stories/AUTH-2-sign-in.md) · **Depends on:** AUTH-1 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Goal
A user signs in at `/login` and returns to where they were heading.

## Current state
`src/features/auth/pages/LoginPage.tsx` is a placeholder with a "Continue" button that jumps to `/`. Replace it. `api/auth.ts`, `schemas.ts` and `PasswordField` already exist from AUTH-1.

## API
`POST /auth/login`, body `LoginRequest { email, password }`, returns `AuthResponse`. A 401 means wrong credentials (the FND-4 interceptor deliberately ignores 401s from this URL).

## Files
| Action | Path | What |
|---|---|---|
| modify | `src/features/auth/api/auth.ts` | add `login(body)` |
| modify | `src/features/auth/schemas.ts` | add `loginSchema` |
| create | `src/features/auth/hooks/useLogin.ts` | mutation → `setSession` |
| create | `src/features/auth/lib/safeRedirect.ts` | `safeRedirect(value: string \| null): string` |
| modify | `src/features/auth/pages/LoginPage.tsx` | the form |

## Steps
1. `loginSchema`: valid `email`; `password` at least 1 character ("Enter your password").
2. Form layout as in AUTH-1: email (`autoComplete="email"`, autofocus), `PasswordField` (`current-password`), and a "Sign in" submit button with a spinner.
3. On 401 (or any non-field error): show `<Alert severity="error">{getErrorMessage(e)}</Alert>` above the fields. Clear it when the user edits a field.
4. `safeRedirect`: only accept values that start with `/` and not `//`; otherwise return `/`. This prevents open redirects.
5. On success: `setSession`, then `navigate(safeRedirect(searchParams.get('redirect')), { replace: true })`.
6. Footer: "No account? Sign up" links to `paths.register`. Keep the `redirect` param on that link.
7. `useDocumentTitle('Sign in')`.
8. Dev convenience: when `import.meta.env.DEV`, show a caption "Demo: demo@aihub.dev / password123".

## Acceptance criteria
- [ ] A wrong password shows the server message in an `Alert`.
- [ ] Valid credentials go to `/`, or to `?redirect=/providers` when given.
- [ ] `?redirect=https://evil.com` or `//evil.com` goes to `/`.
- [ ] Usable at 360 px.

## Verify
Sign in as `demo@aihub.dev` / `password123`, then try a wrong password, then visit `/login?redirect=/compare` and sign in.

## Out of scope
- Guards that bounce signed-in users away from `/login` (AUTH-6).
