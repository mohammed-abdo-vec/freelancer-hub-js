---
id: FND-3
title: Add query client, snackbars and query keys
epic: Foundation
type: Task
priority: Highest
points: 2
status: To Do
depends_on: [FND-1]
labels: [foundation, data]
spec: ../implementation-specs/FND-3-app-providers/SPEC.md
---

# FND-3 · Add query client, snackbars and query keys

**As a** developer **I want** TanStack Query and notistack wired into the app **so that** features can fetch data and show feedback consistently.

## Acceptance criteria
- [ ] `QueryClientProvider` wraps the router, with defaults from SPEC.md §5.5. Devtools render in dev only.
- [ ] `SnackbarProvider` (notistack) is mounted and styled with MUI.
- [ ] `queryKeys` factory exists exactly as in SPEC.md §5.5.

## Out of scope
- Any real query or mutation.

**Source:** SPEC.md §5.5, §8 Phase 2
