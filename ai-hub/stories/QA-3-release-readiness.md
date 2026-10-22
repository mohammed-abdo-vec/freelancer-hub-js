---
id: QA-3
title: Pass the release checklist
epic: Quality
type: Task
priority: Medium
points: 2
status: To Do
depends_on: [QA-1, QA-2]
labels: [quality, security, docs]
spec: ../implementation-specs/QA-3-release-readiness/SPEC.md
---

# QA-3 · Pass the release checklist

**As a** team **we want** the full QA checklist, the security checks and performance verified, and a client README written, **so that** v1 is ready to ship.

## Acceptance criteria
- [ ] Every item in SPEC.md §9 passes in both themes, on desktop and at 360 px.
- [ ] Security: no raw API key in localStorage, the query cache or the console; raw HTML in replies is not executed.
- [ ] Performance: finished messages don't re-render while streaming; route chunks are lazy.
- [ ] `client/README.md` covers setup, scripts and structure.
- [ ] `yarn lint`, `yarn test` and `yarn build` all succeed with zero warnings.

**Source:** SPEC.md §8 Phase 9, §9
