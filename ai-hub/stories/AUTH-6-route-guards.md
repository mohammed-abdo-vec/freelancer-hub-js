---
id: AUTH-6
title: Protect private routes
epic: Authentication
type: Story
priority: Highest
points: 2
status: To Do
depends_on: [AUTH-2]
labels: [auth, routing]
spec: ../implementation-specs/AUTH-6-route-guards/SPEC.md
---

# AUTH-6 · Protect private routes

**As a** user **I want** private pages to need a session, and the sign-in pages to skip when I'm already signed in, **so that** I always land in the right place.

## Acceptance criteria
- [ ] Signed-out users who visit a private route go to `/login?redirect=<path>`.
- [ ] Signed-in users who visit `/login` or `/register` go to `/`.
- [ ] The 404 page needs no session.

**Source:** SPEC.md §2.1 AUTH-6, §5.4
