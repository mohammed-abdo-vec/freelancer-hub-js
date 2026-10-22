---
id: AUTH-1
title: Create an account
epic: Authentication
type: Story
priority: Highest
points: 3
status: To Do
depends_on: [FND-4, FND-5]
labels: [auth, forms]
spec: ../implementation-specs/AUTH-1-register/SPEC.md
---

# AUTH-1 · Create an account

**As a** visitor **I want** to create an account **so that** I can save my provider keys and conversations.

## Acceptance criteria
- [ ] The form has name, email and password (min 8 chars), validated client side with zod.
- [ ] Server validation errors (`details[]`) show under the matching field.
- [ ] A 409 shows "An account with this email already exists" under email.
- [ ] On success the token is stored and the user goes to `/`.
- [ ] There's a link to the sign-in page.

**Source:** SPEC.md §2.1 AUTH-1, §9 Auth
