---
id: CHAT-13
title: Pick any model from connected providers
epic: Chat
type: Story
priority: Highest
points: 5
status: To Do
depends_on: [PROV-1]
labels: [chat, providers, component]
spec: ../implementation-specs/CHAT-13-model-picker/SPEC.md
---

# CHAT-13 · Pick any model from connected providers

**As a** user **I want** one searchable model picker grouped by provider **so that** I can choose exactly which model answers.

## Acceptance criteria
- [ ] An `Autocomplete` grouped by provider (connected providers only).
- [ ] Options come from `GET /providers/:id/models` for each connected provider.
- [ ] Search matches model name or id.
- [ ] If a provider's model request fails, it falls back to `suggestedModels` and shows a warning icon on that group.
- [ ] The selected value shows the provider avatar and model name.
- [ ] Reusable in Chat, Compare and Settings.

**Source:** SPEC.md §2.3 CHAT-13, §7.6
