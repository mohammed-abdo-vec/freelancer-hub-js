---
id: PROV-1
title: See every supported provider
epic: Providers
type: Story
priority: Highest
points: 3
status: To Do
depends_on: [AUTH-3, FND-5]
labels: [providers, ui]
spec: ../implementation-specs/PROV-1-provider-catalog/SPEC.md
---

# PROV-1 · See every supported provider

**As a** user **I want** to see every provider AI Hub supports and its connection status **so that** I know what I can connect.

## Acceptance criteria
- [ ] A card grid from `GET /providers` (xs 1, sm 2, lg 3 columns).
- [ ] Each card shows a colored avatar, name, description, a status chip (**Connected** green, **Invalid key** red, **Not connected** grey), the masked key, and "Checked 2 min ago".
- [ ] Filter tabs: All / Connected / Not connected.
- [ ] Loading skeletons, an error state with Retry, and an empty state for a filter that matches nothing.
- [ ] Not-connected cards show a **Connect** button (disabled until PROV-2) and a "Get API key ↗" link.

**Source:** SPEC.md §2.2 PROV-1, §6.4
