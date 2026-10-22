---
id: CHAT-8
title: Switch model mid-conversation
epic: Chat
type: Story
priority: High
points: 2
status: To Do
depends_on: [CHAT-13, CHAT-14]
labels: [chat]
spec: ../implementation-specs/CHAT-8-switch-model/SPEC.md
---

# CHAT-8 · Switch model mid-conversation

**As a** user **I want** to switch the model in the middle of a conversation **so that** I can get a second opinion without starting over.

## Acceptance criteria
- [ ] The chat header's model picker sends `PATCH /conversations/:id` `{ providerId, model }`.
- [ ] The next message uses the new model; older messages keep their own model label.
- [ ] The choice persists after a reload.

**Source:** SPEC.md §2.3 CHAT-8, §6.3
