---
id: CMP-1
title: Set up a model comparison
epic: Compare
type: Story
priority: High
points: 3
status: To Do
depends_on: [CHAT-13]
labels: [compare, forms]
spec: ../implementation-specs/CMP-1-compare-form/SPEC.md
---

# CMP-1 · Set up a model comparison

**As a** user **I want** to write one prompt and choose up to 4 models **so that** I can compare their answers.

## Acceptance criteria
- [ ] `/compare` has a prompt textarea, an optional system prompt (collapsible), and 1–4 target rows, each with a model picker.
- [ ] "+ Add model" (hidden at 4) and per-row remove buttons (hidden at 1).
- [ ] "Run" is disabled until there's a prompt and at least 1 target. `Ctrl/Cmd+Enter` runs.
- [ ] With no connected providers, show the connect CTA instead.

**Source:** SPEC.md §2.4 CMP-1
