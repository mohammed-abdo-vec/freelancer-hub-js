---
id: CHAT-9
title: Set a system prompt
epic: Chat
type: Story
priority: Medium
points: 2
status: To Do
depends_on: [CHAT-8]
labels: [chat]
spec: ../implementation-specs/CHAT-9-system-prompt/SPEC.md
---

# CHAT-9 · Set a system prompt

**As a** user **I want** to give the model standing instructions for a conversation **so that** every reply follows them.

## Acceptance criteria
- [ ] A header button (icon `TuneRounded`) opens a dialog to edit the conversation's system prompt, saved with PATCH.
- [ ] On a new chat, the system prompt is held locally and sent with `POST /conversations` (wired up in CHAT-1).
- [ ] The button shows when a system prompt is active (for example a dot badge).

**Source:** SPEC.md §2.3 CHAT-9, §9 Chat
