---
id: PROV-4
title: Replace a key or rename a connection
epic: Providers
type: Story
priority: Medium
points: 2
status: To Do
depends_on: [PROV-2]
labels: [providers, forms]
spec: ../implementation-specs/PROV-4-edit-connection/SPEC.md
---

# PROV-4 · Replace a key or rename a connection

**As a** user **I want** to rename a connection or swap in a new key **so that** I can rotate keys without losing conversations.

## Acceptance criteria
- [ ] The "Edit" dialog has a label and an optional new API key (leave it blank to keep the current key).
- [ ] Same 422 handling as PROV-2 (inline under the key, dialog stays open).
- [ ] Success shows a snackbar and the card updates.

**Source:** SPEC.md §2.2 PROV-4
