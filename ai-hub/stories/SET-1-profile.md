---
id: SET-1
title: Edit my profile name
epic: Settings
type: Story
priority: Medium
points: 2
status: To Do
depends_on: [AUTH-3]
labels: [settings, forms]
spec: ../implementation-specs/SET-1-profile/SPEC.md
---

# SET-1 · Edit my profile name

**As a** user **I want** to change my display name **so that** the app greets me correctly.

## Acceptance criteria
- [ ] The Settings page has a Profile section: an editable name (`PATCH /auth/me`) and a read-only email.
- [ ] Saving shows a spinner and a snackbar; the user menu updates immediately.

**Source:** SPEC.md §2.6 SET-1, §9
