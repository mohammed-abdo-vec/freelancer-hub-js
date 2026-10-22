---
id: QA-1
title: Polish states, responsiveness and keyboard support
epic: Quality
type: Task
priority: Medium
points: 3
status: To Do
depends_on: [CHAT-12, CMP-3, DASH-5, SET-4, PROV-6]
labels: [quality, a11y, responsive]
spec: ../implementation-specs/QA-1-polish-audit/SPEC.md
---

# QA-1 · Polish states, responsiveness and keyboard support

**As a** user **I want** every screen to handle loading, empty and error cases and to work on any device and from the keyboard **so that** the app feels finished.

## Acceptance criteria
- [ ] Every page has loading, empty and error states (SPEC.md §5.6).
- [ ] Every page works at 360, 768 and 1440 px in both themes, with no horizontal page scroll.
- [ ] `useDocumentTitle` on every page ("Chat · AI Hub" or the conversation title).
- [ ] Shortcuts: `Ctrl/Cmd+K` new chat, `Esc` stop, `Ctrl/Cmd+Enter` compare. Focus returns to the composer after sending.
- [ ] Every destructive action uses `ConfirmDialog`.

**Source:** SPEC.md §5.6, §6.5, §8 Phase 9
