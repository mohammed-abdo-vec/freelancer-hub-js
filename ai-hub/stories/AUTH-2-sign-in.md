---
id: AUTH-2
title: Sign in
epic: Authentication
type: Story
priority: Highest
points: 2
status: To Do
depends_on: [AUTH-1]
labels: [auth, forms]
spec: ../implementation-specs/AUTH-2-sign-in/SPEC.md
---

# AUTH-2 · Sign in

**As a** user **I want** to sign in with my email and password **so that** I can get back to my workspace.

## Acceptance criteria
- [ ] The form has email and password.
- [ ] A 401 shows the server message in an `Alert` above the form.
- [ ] On success, redirect to the `?redirect=` path, or `/`.

**Source:** SPEC.md §2.1 AUTH-2, §9 Auth
