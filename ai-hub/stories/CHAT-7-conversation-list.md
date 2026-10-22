---
id: CHAT-7
title: Browse, search and manage conversations
epic: Chat
type: Story
priority: Highest
points: 5
status: To Do
depends_on: [AUTH-3, FND-5]
labels: [chat, sidebar]
spec: ../implementation-specs/CHAT-7-conversation-list/SPEC.md
---

# CHAT-7 · Browse, search and manage conversations

**As a** user **I want** my conversation history in the sidebar, with search, pinning, renaming and deleting, **so that** I can find and organize past chats.

## Acceptance criteria
- [ ] The sidebar lists real conversations: a **Pinned** section, then the rest by recent activity.
- [ ] A search field, debounced 300 ms, uses `?search=`.
- [ ] Each item shows the title, a provider avatar and a relative time; the active item is highlighted.
- [ ] Its kebab menu has Rename (inline edit), Pin/Unpin and Delete (confirm).
- [ ] Deleting the open conversation navigates to `/chat`.
- [ ] Loading, empty ("No conversations yet") and error states.

**Source:** SPEC.md §2.3 CHAT-7, §8 Phase 5
