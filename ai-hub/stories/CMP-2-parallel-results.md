---
id: CMP-2
title: See each model's answer as soon as it's ready
epic: Compare
type: Story
priority: High
points: 3
status: To Do
depends_on: [CMP-1, CHAT-4]
labels: [compare, data]
spec: ../implementation-specs/CMP-2-parallel-results/SPEC.md
---

# CMP-2 · See each model's answer as soon as it's ready

**As a** user **I want** each model's answer to appear as soon as that model finishes **so that** a slow model doesn't hold up the others.

## Acceptance criteria
- [ ] **One** `POST /compare` request **per target** (`targets: [t]`), all sent in parallel.
- [ ] Each card shows a skeleton while loading, then Markdown content, latency, tokens and a Copy button, or an error `Alert`.
- [ ] Running again replaces the previous results. Usage is invalidated after each run.

**Source:** SPEC.md §2.4 CMP-2, §5.5
