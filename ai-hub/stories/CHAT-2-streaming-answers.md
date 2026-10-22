---
id: CHAT-2
title: Stream answers token by token
epic: Chat
type: Story
priority: Highest
points: 8
status: To Do
depends_on: [CHAT-14, AUTH-4]
labels: [chat, streaming]
spec: ../implementation-specs/CHAT-2-streaming-answers/SPEC.md
---

# CHAT-2 · Stream answers token by token

**As a** user **I want** to see the answer appear as it's generated **so that** the chat feels fast and alive.

## Acceptance criteria
- [ ] Sending in an existing conversation uses `POST /conversations/:id/messages/stream` (SSE over `fetch`).
- [ ] The user's message appears immediately (optimistic).
- [ ] The assistant bubble shows a typing indicator (three animated dots) until the first delta, then the text grows token by token.
- [ ] When the stream finishes, the final message (with footer) replaces the draft, the title updates, and the conversations list and usage refresh.
- [ ] Pre-flight errors roll back the optimistic message and show an error; a 401 signs out.
- [ ] The stream aborts on unmount or when the conversation changes.

**Source:** SPEC.md §2.3 CHAT-2, §3.6, §7.3, §7.4
