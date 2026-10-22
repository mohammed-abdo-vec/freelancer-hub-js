---
id: CHAT-5
title: Show model, tokens and latency per answer
epic: Chat
type: Story
priority: Medium
points: 2
status: To Do
depends_on: [CHAT-14]
labels: [chat]
spec: ../implementation-specs/CHAT-5-message-metadata/SPEC.md
---

# CHAT-5 · Show model, tokens and latency per answer

**As a** user **I want** to see which model answered, how many tokens it used and how long it took **so that** I can compare cost and speed.

## Acceptance criteria
- [ ] Each assistant message has a footer with the provider avatar, model, `↑ in / ↓ out` tokens, latency ("1.8 s") and a Copy button.
- [ ] It shows on hover or focus, and is always visible on touch devices.

**Source:** SPEC.md §2.3 CHAT-5
