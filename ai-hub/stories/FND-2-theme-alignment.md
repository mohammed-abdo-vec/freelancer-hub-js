---
id: FND-2
title: Align the theme with the design spec
epic: Foundation
type: Task
priority: High
points: 2
status: To Do
depends_on: [FND-1]
labels: [foundation, theme, ui]
spec: ../implementation-specs/FND-2-theme-alignment/SPEC.md
---

# FND-2 · Align the theme with the design spec

**As a** user **I want** a consistent, branded look in light and dark mode **so that** the app feels polished and readable.

## Acceptance criteria
- [ ] Primary `#5B5BD6`, secondary `#0EA5E9`, and backgrounds light `#F7F7FB`/`#FFFFFF`, dark `#0F1117`/`#171A23`.
- [ ] Inter Variable is the font (Roboto removed). Body is 15 px; h4–h6 use weight 600; code uses the monospace stack.
- [ ] `borderRadius: 10`. Cards are outlined with no shadow. Dialogs have a 16 px radius.
- [ ] Button, TextField, Tooltip and Paper overrides as in SPEC.md §6.1.
- [ ] Text meets WCAG AA contrast in both themes. Theme switching still works with no flash.

## Out of scope
- The Settings → Appearance UI (SET-2).

**Source:** SPEC.md §6.1
