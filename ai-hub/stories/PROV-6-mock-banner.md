---
id: PROV-6
title: Point new users to the free Mock AI provider
epic: Providers
type: Story
priority: Low
points: 1
status: To Do
depends_on: [PROV-1]
labels: [providers, onboarding]
spec: ../implementation-specs/PROV-6-mock-banner/SPEC.md
---

# PROV-6 · Point new users to the free Mock AI provider

**As a** new user with no API keys **I want** to know I can try everything for free **so that** I can explore the app right away.

## Acceptance criteria
- [ ] If the `mock` provider is present, a dismissible info banner shows at the top of `/providers`: "No API key yet? Connect **Mock AI** with any key starting with `mock-` to try everything for free."
- [ ] Dismissing it is remembered across reloads.

**Source:** SPEC.md §2.2 PROV-6
