---
id: FND-5
title: Build the shared UI kit and format helpers
epic: Foundation
type: Task
priority: High
points: 3
status: To Do
depends_on: [FND-1, FND-2]
labels: [foundation, ui]
spec: ../implementation-specs/FND-5-shared-ui-kit/SPEC.md
---

# FND-5 · Build the shared UI kit and format helpers

**As a** developer **I want** shared empty, error, confirm and avatar components plus number and time formatters **so that** every page handles states the same way.

## Acceptance criteria
- [ ] `EmptyState`, `ErrorState`, `ConfirmDialog`, `ProviderAvatar`, `RelativeTime` and `CopyButton` exist in `shared/components`.
- [ ] `formatNumber(12400)` returns `"12.4k"`, `formatNumber(1_200_000)` returns `"1.2M"`, and `formatLatency(1830)` returns `"1.8 s"`.
- [ ] Each component is accessible (labels, tooltips, dialog title) and works in both themes.

## Out of scope
- Feature-specific components (StatusChip, ModelPicker, Markdown).

**Source:** SPEC.md §5.2 components/common, §5.6, §8 Phase 2
