---
id: CHAT-1
title: Start a new chat with any model
epic: Chat
type: Story
priority: Highest
points: 5
status: To Do
depends_on: [CHAT-2, CHAT-9, CHAT-10]
labels: [chat, streaming]
spec: ../implementation-specs/CHAT-1-new-chat/SPEC.md
---

# CHAT-1 · Start a new chat with any model

**As a** user **I want** to pick a model and just start typing **so that** a new conversation is one message away.

## Acceptance criteria
- [ ] `/chat` shows a new-chat state: a large model picker, and 4 suggestion chips ("Explain a concept", "Write code", "Summarize text", "Brainstorm ideas") that fill the composer.
- [ ] The picker is pre-selected from the `defaultModel` preference, or else the first available model.
- [ ] The system prompt button works locally and its value is sent with `POST /conversations`.
- [ ] The **first** send creates the conversation, streams the answer, and replaces the URL with `/chat/:id` without interrupting the stream.
- [ ] The sidebar shows the new conversation with its auto title.
- [ ] `Ctrl/Cmd+K` opens a new chat.

**Source:** SPEC.md §2.3 CHAT-1, §7.4 "New chat flow", §9 Chat
