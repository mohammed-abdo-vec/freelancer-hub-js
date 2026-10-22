---
id: PROV-5
title: Remove a connection
epic: Providers
type: Story
priority: Medium
points: 1
status: To Do
depends_on: [PROV-2]
labels: [providers]
spec: ../implementation-specs/PROV-5-remove-connection/SPEC.md
---

# PROV-5 · Remove a connection

**As a** user **I want** to remove a provider key **so that** AI Hub no longer stores it.

## Acceptance criteria
- [ ] A confirm dialog: "Remove OpenAI? Existing conversations stay, but you can't send messages with OpenAI until you reconnect."
- [ ] Confirming calls `DELETE /connections/:id`, shows a snackbar and the card returns to **Not connected**.

**Source:** SPEC.md §2.2 PROV-5
