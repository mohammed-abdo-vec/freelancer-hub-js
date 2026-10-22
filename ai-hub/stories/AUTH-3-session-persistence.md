---
id: AUTH-3
title: Keep me signed in across reloads
epic: Authentication
type: Story
priority: High
points: 2
status: To Do
depends_on: [AUTH-6]
labels: [auth]
spec: ../implementation-specs/AUTH-3-session-persistence/SPEC.md
---

# AUTH-3 · Keep me signed in across reloads

**As a** user **I want** my session to survive a page reload **so that** I don't have to sign in again.

## Acceptance criteria
- [ ] The token and user are persisted.
- [ ] On app start with a token, `GET /auth/me` runs behind a full-screen loader.
- [ ] A 401 from that call clears the session.
- [ ] The user menu shows the real name, email and initials.

**Source:** SPEC.md §2.1 AUTH-3, §8 Phase 3
