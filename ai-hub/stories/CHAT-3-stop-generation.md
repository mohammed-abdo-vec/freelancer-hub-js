---
id: CHAT-3
title: Stop a generating answer
epic: Chat
type: Story
priority: High
points: 3
status: To Do
depends_on: [CHAT-10]
labels: [chat, streaming]
spec: ../implementation-specs/CHAT-3-stop-generation/SPEC.md
---

# CHAT-3 · Stop a generating answer

**As a** user **I want** to stop an answer that's going the wrong way **so that** I don't waste time or tokens.

## Acceptance criteria
- [ ] While streaming, Send becomes a **Stop** button, and `Esc` also stops.
- [ ] Stopping aborts the fetch. The partial answer stays and shows a "Stopped" chip.
- [ ] After a reload the stopped message is still there with its chip (the server saved it).

**Source:** SPEC.md §2.3 CHAT-3, §3.6, §7.4 step 5
