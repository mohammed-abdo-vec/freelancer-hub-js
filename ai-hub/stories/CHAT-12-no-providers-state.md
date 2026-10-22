---
id: CHAT-12
title: Guide me when no provider is connected
epic: Chat
type: Story
priority: Medium
points: 1
status: To Do
depends_on: [CHAT-1]
labels: [chat, onboarding]
spec: ../implementation-specs/CHAT-12-no-providers-state/SPEC.md
---

# CHAT-12 · Guide me when no provider is connected

**As a** user with no providers connected **I want** chat to tell me what to do **so that** I'm not stuck in front of a composer that can't work.

## Acceptance criteria
- [ ] If nothing is connected, `/chat` shows an empty state with a "Connect a provider" CTA instead of the composer.
- [ ] Existing conversations can still be read; their composer shows the CHAT-6 connect alert when sending fails.

**Source:** SPEC.md §2.3 CHAT-12
