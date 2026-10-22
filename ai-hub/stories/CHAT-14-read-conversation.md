---
id: CHAT-14
title: Open and read a conversation
epic: Chat
type: Story
priority: Highest
points: 3
status: To Do
depends_on: [CHAT-7]
labels: [chat, thread]
spec: ../implementation-specs/CHAT-14-read-conversation/SPEC.md
---

# CHAT-14 · Open and read a conversation

> Added story: SPEC.md Phase 5 has this work but no story ID for it.

**As a** user **I want** to open a past conversation and read its messages **so that** I can pick up where I left off.

## Acceptance criteria
- [ ] `/chat/:id` loads `GET /conversations/:id` and renders messages oldest first.
- [ ] User messages are right-aligned bubbles (primary at 12 % opacity, plain text, line breaks kept); assistant messages are full width with an avatar and no bubble.
- [ ] Messages with `status: 'error'` render an error `Alert` with the `error` text; `status: 'stopped'` shows a "Stopped" chip.
- [ ] A deleted or unknown id shows a "Conversation not found" state with a "New chat" button.
- [ ] Skeleton while loading; the document title is the conversation title.

**Source:** SPEC.md §6.3, §8 Phase 5
