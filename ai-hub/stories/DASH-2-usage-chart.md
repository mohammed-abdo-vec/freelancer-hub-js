---
id: DASH-2
title: See usage over time
epic: Dashboard
type: Story
priority: Medium
points: 3
status: To Do
depends_on: [DASH-1]
labels: [dashboard, charts]
spec: ../implementation-specs/DASH-2-usage-chart/SPEC.md
---

# DASH-2 · See usage over time

**As a** user **I want** a daily chart of my activity **so that** I can spot trends.

## Acceptance criteria
- [ ] A bar chart of daily requests, or tokens via a toggle, from `GET /usage?days=`.
- [ ] It follows the 7 / 14 / 30 day range selector.
- [ ] Built with `@mui/x-charts`, readable in both themes, responsive.

**Source:** SPEC.md §2.5 DASH-2
