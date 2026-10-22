---
id: FND-4
title: Add API client, error helpers and session store
epic: Foundation
type: Task
priority: Highest
points: 3
status: To Do
depends_on: [FND-1, FND-3]
labels: [foundation, data, auth]
spec: ../implementation-specs/FND-4-api-client-and-session/SPEC.md
---

# FND-4 · Add API client, error helpers and session store

**As a** developer **I want** one typed HTTP client that adds the token, handles 401s and normalizes errors **so that** every feature talks to the API the same way.

## Acceptance criteria
- [ ] An `api` axios instance with `baseURL` from `VITE_API_URL` (default `/api`) adds `Authorization: Bearer <token>`.
- [ ] Any 401 except on `/auth/login` clears the session and shows a single "Session expired" snackbar.
- [ ] `getApiError`, `getErrorMessage` and `getFieldErrors` helpers exist.
- [ ] A persisted `auth.store` (key `ai-hub-auth`) has `token`, `user`, `setSession()` and `clearSession()`.

## Out of scope
- Login and register UI (AUTH-1, AUTH-2). Redirects on 401 (AUTH-4, AUTH-6).

**Source:** SPEC.md §3.2, §7.1, §7.2
