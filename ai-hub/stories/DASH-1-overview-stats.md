---
id: DASH-1
title: See my usage at a glance
epic: Dashboard
type: Story
priority: High
points: 3
status: To Do
depends_on: [PROV-1, FND-5]
labels: [dashboard, data]
spec: ../implementation-specs/DASH-1-overview-stats/SPEC.md
---

# DASH-1 · See my usage at a glance

**As a** user **I want** a greeting and the key numbers on the home page **so that** I know how much I've been using AI.

## Acceptance criteria
- [ ] `/` shows a greeting ("Good morning, Ada").
- [ ] 4 stat cards: **Connected providers** (x / total), **Requests**, **Input tokens** and **Output tokens** for the selected range.
- [ ] Large numbers are formatted as `12.4k` or `1.2M`.
- [ ] A range selector (7 / 14 / 30 days) drives the numbers. Its state is shared with the chart (DASH-2).
- [ ] Skeletons while loading, an error state with Retry.

**Source:** SPEC.md §2.5 DASH-1
