---
id: CHAT-11
title: Follow the answer while it streams
epic: Chat
type: Story
priority: Medium
points: 2
status: To Do
depends_on: [CHAT-2]
labels: [chat, ux]
spec: ../implementation-specs/CHAT-11-smart-autoscroll/SPEC.md
---

# CHAT-11 · Follow the answer while it streams

**As a** user **I want** the view to follow a streaming answer unless I scroll up to read **so that** I neither miss text nor get yanked around.

## Acceptance criteria
- [ ] While streaming, the view stays pinned to the bottom unless the user has scrolled up more than 80 px.
- [ ] When scrolled up, a floating "↓ Jump to latest" button appears and scrolls to the bottom.
- [ ] Opening a conversation starts at the bottom.

**Source:** SPEC.md §2.3 CHAT-11
