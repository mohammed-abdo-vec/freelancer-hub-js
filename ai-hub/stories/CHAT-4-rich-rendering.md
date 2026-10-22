---
id: CHAT-4
title: Render Markdown and code in answers
epic: Chat
type: Story
priority: High
points: 3
status: To Do
depends_on: [CHAT-14]
labels: [chat, markdown, security]
spec: ../implementation-specs/CHAT-4-rich-rendering/SPEC.md
---

# CHAT-4 · Render Markdown and code in answers

**As a** user **I want** answers rendered as formatted Markdown with highlighted, copyable code **so that** they are easy to read and reuse.

## Acceptance criteria
- [ ] Assistant messages render GitHub-flavored Markdown: tables, lists, and links that open in a new tab.
- [ ] Code blocks are syntax highlighted, with a language label and a **Copy** button, a dark background in both themes, and horizontal scroll.
- [ ] User messages stay plain text with line breaks kept.
- [ ] Raw HTML or `<script>` in a reply shows as text and never runs.

**Source:** SPEC.md §2.3 CHAT-4, §6.3, §7.5, §9 Security
