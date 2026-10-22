# AUTH-1 · Create an account: implementation spec

> **Story card:** [stories/AUTH-1-register.md](../../stories/AUTH-1-register.md) · **Depends on:** FND-4, FND-5 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Goal
A visitor can register at `/register` and lands on the dashboard signed in.

## Current state
- `src/features/auth/pages/RegisterPage.tsx` is a placeholder inside `AuthLayout` (a centered card with a logo, taking a `title`).
- `src/features/auth/routes.ts` already routes `/register`.

## API
`POST /auth/register`, body `RegisterRequest { name (1–80), email, password (min 8) }`, returns 201 `AuthResponse { token, user }`. Errors: 400 `VALIDATION_ERROR` with `details`, 409 `CONFLICT` (email taken).

## Files
| Action | Path | What |
|---|---|---|
| create | `src/features/auth/api/auth.ts` | `register(body): Promise<AuthResponse>` |
| create | `src/features/auth/schemas.ts` | `registerSchema` (zod) + `RegisterValues` type |
| create | `src/features/auth/hooks/useRegister.ts` | `useMutation` → on success `setSession` |
| create | `src/features/auth/components/PasswordField.tsx` | TextField with a show/hide adornment (reused in AUTH-2) |
| modify | `src/features/auth/pages/RegisterPage.tsx` | the form |

## Steps
1. `registerSchema`: `name` trimmed, 1–80 chars; `email` valid email; `password` at least 8 chars, with messages like "Password must be at least 8 characters".
2. Form with react-hook-form and `zodResolver`, `mode: 'onTouched'`. Use MUI `TextField`s with `autoComplete` (`name`, `email`, `new-password`), `error` and `helperText` from `formState.errors`, and `fullWidth`.
3. The submit button "Create account" (`fullWidth`, `size="large"`) shows a `CircularProgress` and is disabled while pending.
4. On error:
   - 409 → `setError('email', { message: 'An account with this email already exists' })`.
   - 400 → `Object.entries(getFieldErrors(e)).forEach(([k, m]) => setError(k as keyof RegisterValues, { message: m }))`.
   - Anything else → an `Alert severity="error"` above the form with `getErrorMessage(e)`.
5. On success: `useAuthStore.getState().setSession(token, user)` then `navigate(paths.dashboard, { replace: true })`.
6. Footer: "Already have an account? Sign in" links to `paths.login`.
7. `useDocumentTitle('Create account')`.

## Acceptance criteria
- [ ] A short password shows a field error without calling the API.
- [ ] A taken email (`demo@aihub.dev` after `npm run seed`) shows the 409 message under email.
- [ ] A valid registration stores the token and lands on `/`.
- [ ] Field errors from the server map onto fields.
- [ ] Usable at 360 px; the password has a show/hide toggle with an `aria-label`.

## Verify
Run the server with seed data. Try a short password, `demo@aihub.dev`, then a fresh email. Check localStorage `ai-hub-auth`.

## Out of scope
- Route guards (AUTH-6). Sign in (AUTH-2).
