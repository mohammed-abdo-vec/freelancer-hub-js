---
id: AUTH-4
title: Handle expired sessions
epic: Authentication
type: Story
priority: High
points: 1
status: To Do
depends_on: [AUTH-3]
labels: [auth]
spec: ../implementation-specs/AUTH-4-expired-session/SPEC.md
---

# AUTH-4 · Handle expired sessions

**As a** user **I want** to be told when my session expires and sent back to where I was after signing in **so that** I don't lose my place.

## Acceptance criteria
- [ ] **Any** 401 from any API call (except login) clears the session.
- [ ] The user is redirected to `/login?redirect=<current path>`.
- [ ] A snackbar says "Session expired", shown once.
- [ ] After signing in, the user returns to that path.

**Source:** SPEC.md §2.1 AUTH-4, §9 Auth
