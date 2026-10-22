# CMP-3 · Compare answers side by side: implementation spec

> **Story card:** [stories/CMP-3-results-layout.md](../../stories/CMP-3-results-layout.md) · **Depends on:** CMP-2 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Files
| Action | Path | What |
|---|---|---|
| modify | `src/features/compare/pages/ComparePage.tsx` | grid container |
| modify | `src/features/compare/components/CompareResultCard.tsx` | flex column, internal scroll |

## Steps
1. Grid: `Grid container spacing={2}`. Item `size` is `{ xs: 12, md: 6, xl: 12 / Math.min(cards.length, 4) }` (with 3 cards on xl, use 4 columns each). Alternatively use CSS grid `gridTemplateColumns` with `repeat(n, minmax(0, 1fr))` per breakpoint, whichever is simpler.
2. Card: `height: '100%'`, `display: flex; flexDirection: column`. The body gets `flex: 1; minHeight: 0; overflowY: auto; maxHeight: { xs: 'none', md: 560 }` so cards in a row line up and long answers scroll inside the card.
3. Let the page container go wider than other pages (`maxWidth="xl"` or none) so 4 columns fit.

## Acceptance criteria
- [ ] 1, 2 and up-to-4 columns at xs, md and xl.
- [ ] Cards in a row have equal heights; long content scrolls inside the card.
- [ ] No horizontal page scroll at 360 px (code blocks scroll internally).

## Verify
Run 4 targets with `/long` and resize from 360 px to 1600 px.

## Out of scope
- Anything else.
