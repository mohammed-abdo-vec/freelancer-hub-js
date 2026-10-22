---
id: AUTH-5
title: Sign out
epic: Authentication
type: Story
priority: High
points: 1
status: To Do
depends_on: [AUTH-3]
labels: [auth]
spec: ../implementation-specs/AUTH-5-sign-out/SPEC.md
---

# AUTH-5 · Sign out

**As a** user **I want** to sign out **so that** nobody else using this browser can see my data.

## Acceptance criteria
- [ ] "Sign out" in the user menu clears the session and the **whole query cache**, then goes to `/login`.
- [ ] A reusable `useSignOut()` hook is exported for Settings (SET-4).

**Source:** SPEC.md §2.1 AUTH-5
