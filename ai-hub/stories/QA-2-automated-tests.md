---
id: QA-2
title: Add automated tests for critical logic
epic: Quality
type: Task
priority: Medium
points: 3
status: To Do
depends_on: [CHAT-2, AUTH-2, PROV-1, FND-5]
labels: [quality, tests]
spec: ../implementation-specs/QA-2-automated-tests/SPEC.md
---

# QA-2 · Add automated tests for critical logic

**As a** developer **I want** tests for the riskiest logic **so that** future changes don't silently break it.

## Acceptance criteria
- [ ] Vitest + RTL tests for `format.ts`, `errors.ts`, the SSE parser (including an event split across chunks), `LoginPage` validation and `ProviderCard` states.
- [ ] `yarn test` passes with zero warnings.

**Source:** SPEC.md §8 Phase 9
