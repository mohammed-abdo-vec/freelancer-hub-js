# CMP-1 · Set up a model comparison: implementation spec

> **Story card:** [stories/CMP-1-compare-form.md](../../stories/CMP-1-compare-form.md) · **Depends on:** CHAT-13 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Current state
`src/features/compare/pages/ComparePage.tsx` is a `PagePlaceholder`.

## Files
| Action | Path | What |
|---|---|---|
| create | `src/features/compare/schemas.ts` | `compareSchema { prompt: string (1–32000), systemPrompt: string (optional), targets: ModelSelection[] (1–4) }` |
| create | `src/features/compare/components/TargetRow.tsx` | `{ index; value; onChange; onRemove?; canRemove }` → `ModelPicker variant="field"` + remove `IconButton` |
| create | `src/features/compare/components/CompareForm.tsx` | RHF + `useFieldArray('targets')`; `onRun(values)` prop |
| modify | `src/features/compare/pages/ComparePage.tsx` | header + form (results come in CMP-2) |

## Steps
1. Defaults: one target, pre-filled like CHAT-1 (the `defaultModel` preference, otherwise the first model). "+ Add model" appends the next model that isn't already selected, if there is one.
2. System prompt: a `Collapse` toggled by a text button ("Add system prompt" / "Hide system prompt", `TuneRounded`).
3. Prompt: a multiline `TextField` (minRows 3, maxRows 12), placeholder "Ask something to compare…".
4. Run: a contained `Button` labelled "Run" plus a shortcut hint chip (⌘↵ or Ctrl ↵). `Ctrl/Cmd+Enter` inside the form submits.
5. With no connected providers: the same `EmptyState` as CHAT-12.
6. `useDocumentTitle('Compare')`.
7. For now `onRun` logs nothing and just calls a `// TODO(CMP-2)` handler.

## Acceptance criteria
- [ ] Add up to 4 rows; Add hides at 4; remove hides at 1.
- [ ] Run is disabled without a prompt or targets; `Ctrl/Cmd+Enter` triggers it.
- [ ] Usable at 360 px.

## Verify
Fill the form with Mock Fast and Mock Smart.

## Out of scope
- Sending requests and showing results (CMP-2, CMP-3).
