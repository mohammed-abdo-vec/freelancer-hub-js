---
id: AUTH-1
title: Sign up, sign in and stay signed in
epic: Authentication
type: Story
priority: Highest
points: 13
status: In Progress
depends_on: [FND-4, FND-5]
labels: [auth, forms, routing]
spec: ../implementation-specs/AUTH-1-authentication/SPEC.md
---

# AUTH-1 · Sign up, sign in and stay signed in

**As a** user **I want** to create an account, sign in, stay signed in across reloads and sign out **so that** my provider keys and conversations are mine alone and I always land in the right place.

## Acceptance criteria

### Create an account
- [ ] The form has name, email and password (min 8 chars), validated client side with zod.
- [ ] Server validation errors (`details[]`) show under the matching field.
- [ ] A 409 shows "An account with this email already exists" under email.
- [ ] On success the token is stored and the user goes to `/`.
- [ ] There's a link to the sign-in page.

### Sign in
- [ ] The form has email and password.
- [ ] A 401 shows the server message in an `Alert` above the form.
- [ ] On success, redirect to the `?redirect=` path, or `/`. External redirects (`https://…`, `//…`) go to `/`.

### Protect private routes
- [ ] Signed-out users who visit a private route go to `/login?redirect=<path>`.
- [ ] Signed-in users who visit `/login` or `/register` go to `/`.
- [ ] The 404 page needs no session.

### Stay signed in
- [ ] The token and user are persisted.
- [ ] On app start with a token, `GET /auth/me` runs behind a full-screen loader.
- [ ] A 401 from that call clears the session.
- [ ] The user menu shows the real name, email and initials.

### Expired session
- [ ] **Any** 401 from any API call (except login) clears the session and the query cache.
- [ ] The user is redirected to `/login?redirect=<current path>`.
- [ ] A snackbar says "Session expired", shown once.
- [ ] After signing in, the user returns to that path.

### Sign out
- [ ] "Sign out" in the user menu clears the session and the **whole query cache**, then goes to `/login`.
- [ ] A reusable `useSignOut()` hook is exported for Settings (SET-4).

**Source:** SPEC.md §2.1 AUTH-1 to AUTH-6, §5.4, §9 Auth
