---
id: CHAT-10
title: Write messages comfortably
epic: Chat
type: Story
priority: High
points: 2
status: To Do
depends_on: [CHAT-2]
labels: [chat, composer]
spec: ../implementation-specs/CHAT-10-composer-ux/SPEC.md
---

# CHAT-10 · Write messages comfortably

**As a** user **I want** a composer that grows with my text and sends with Enter **so that** writing prompts is quick.

## Acceptance criteria
- [ ] A multiline, auto-growing input (max 8 rows).
- [ ] **Enter** sends and **Shift+Enter** adds a new line. This is configurable via the `enterToSend` preference (when it's off: Ctrl/Cmd+Enter sends).
- [ ] Send is disabled when the input is empty or while streaming.
- [ ] The hint "AI can make mistakes. Check important info." shows below.
- [ ] Focus returns to the composer after sending.

**Source:** SPEC.md §2.3 CHAT-10, §5.6 a11y
