# QA-1 · Polish states, responsiveness and keyboard support: implementation spec

> **Story card:** [stories/QA-1-polish-audit.md](../../stories/QA-1-polish-audit.md) · **Depends on:** all feature stories · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Goal
An audit pass that fixes gaps. Don't add new features.

## Steps
1. **Inventory**: list every page and async view (Dashboard cards, Providers grid, sidebar list, thread, compare cards, settings). For each, note whether it has loading, empty and error states and fix what's missing. Put the table in your final report.
2. **Responsive**: at 360, 768 and 1440 px in light and dark mode, check every route. Fix any overflow (common causes are long model ids, masked keys, table cells and flex children without `minWidth: 0`).
3. **Document titles**: check `useDocumentTitle` formats as `"<Page> · AI Hub"` (update the hook if it doesn't) and every page calls it.
4. **Keyboard**: tab through every page. All icon buttons have an `aria-label` and a `Tooltip`; menus and dialogs trap and restore focus; check the shortcuts.
5. **Destructive actions**: grep for `delete`/`remove` mutations and confirm each goes through `ConfirmDialog`.
6. **Contrast**: run Lighthouse accessibility (target ≥ 95) on Dashboard, Chat and Providers in both themes and fix AA failures.

## Acceptance criteria
- [ ] The inventory table in your report shows every view covered.
- [ ] No horizontal scroll at 360 px on any route.
- [ ] Lighthouse accessibility ≥ 95 on the three pages in both themes.
- [ ] All shortcuts work.

## Verify
DevTools device toolbar plus Lighthouse. `yarn lint && yarn build` with zero warnings.

## Out of scope
- Tests (QA-2). README (QA-3).
