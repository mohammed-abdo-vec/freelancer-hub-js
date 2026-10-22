---
id: CHAT-6
title: Recover from failed answers
epic: Chat
type: Story
priority: High
points: 3
status: To Do
depends_on: [CHAT-2]
labels: [chat, errors]
spec: ../implementation-specs/CHAT-6-recoverable-errors/SPEC.md
---

# CHAT-6 · Recover from failed answers

**As a** user **I want** failed answers to explain what went wrong and let me retry **so that** one error doesn't derail my conversation.

## Acceptance criteria
- [ ] A message with `status: 'error'` renders as an error `Alert` in the thread with its `error` text and a **Retry** button.
- [ ] Retry re-sends the preceding user message's content.
- [ ] `CONNECTION_REQUIRED` (409) shows an alert with a "Connect provider" button that links to `/providers`.
- [ ] Rate-limit (429) messages suggest waiting a moment.

**Source:** SPEC.md §2.3 CHAT-6, §3.2 error table, §9 Chat
