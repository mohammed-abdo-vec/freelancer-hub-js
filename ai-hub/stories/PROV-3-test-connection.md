---
id: PROV-3
title: Test a connection
epic: Providers
type: Story
priority: High
points: 2
status: To Do
depends_on: [PROV-2]
labels: [providers]
spec: ../implementation-specs/PROV-3-test-connection/SPEC.md
---

# PROV-3 · Test a connection

**As a** user **I want** to check that a saved key still works **so that** I can fix it before chatting.

## Acceptance criteria
- [ ] "Test" calls `POST /connections/:id/test` and shows a spinner while it runs.
- [ ] The result is a snackbar: "Working · 37 models · 412 ms", or the error.
- [ ] The card's status chip and "Checked …" time update.

**Source:** SPEC.md §2.2 PROV-3
