# FND-5 · Build the shared UI kit and format helpers: implementation spec

> **Story card:** [stories/FND-5-shared-ui-kit.md](../../stories/FND-5-shared-ui-kit.md) · **Depends on:** FND-1, FND-2 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Goal
Reusable building blocks for the loading, empty and error states and destructive actions every later story needs.

## Current state
`src/shared/components/` has `LoadingScreen.tsx` and `PagePlaceholder.tsx`. Keep both.

## Files
| Action | Path | API |
|---|---|---|
| create | `src/shared/components/EmptyState.tsx` | `{ icon: SvgIconComponent; title: string; description?: string; action?: ReactNode }` |
| create | `src/shared/components/ErrorState.tsx` | `{ title?: string; message: string; onRetry?: () => void }` → Retry button calls `onRetry` |
| create | `src/shared/components/ConfirmDialog.tsx` | `{ open; title; description: ReactNode; confirmLabel?='Delete'; destructive?=true; loading?; onConfirm; onClose }` |
| create | `src/shared/components/ProviderAvatar.tsx` | `{ name: string; color: string; size?: number }`: first letter of `name` on `color`; text color picked for contrast |
| create | `src/shared/components/RelativeTime.tsx` | `{ date: string; prefix?: string }` → `<time dateTime title="full date">5 min ago</time>` |
| create | `src/shared/components/CopyButton.tsx` | `{ text: string; label?='Copy'; size? }`: icon button, check icon for 1.5 s after copying, tooltip "Copied" |
| create | `src/shared/utils/format.ts` | `formatNumber`, `formatLatency` |
| create | `src/shared/lib/dayjs.ts` | dayjs with the `relativeTime` plugin, imported once |

## Steps
1. **EmptyState**: centered `Stack`; the icon at 48 px in `text.secondary`; title `h6`; description `body2`; then the optional action.
2. **ErrorState**: same layout with `ErrorOutlineRounded` in `error.main` and a Retry button (`ReplayRounded`) only when `onRetry` is set. Use `role="alert"`.
3. **ConfirmDialog**: MUI `Dialog` with a `DialogTitle`. The confirm button is `color="error"` when destructive and shows a spinner and stays disabled while `loading`. Cancel gets `autoFocus`.
4. **ProviderAvatar**: `color` comes from the API (the only allowed hex). Choose white or black text with a small luminance helper. `aria-hidden` when it sits next to a visible name.
5. **RelativeTime**: `dayjs(date).fromNow()`. Re-render every 60 s with one interval per instance (cleared on unmount). The tooltip or title shows `dayjs(date).format('LLL')` (load the `localizedFormat` plugin).
6. **CopyButton**: `navigator.clipboard.writeText`. On failure, show an error snackbar. Give it an `aria-label` and a `Tooltip`.
7. **format.ts**:
   - `formatNumber(n)`: below 1000 → `String(n)`; below 1e6 → `x.xk`; otherwise `x.xM`. Drop a trailing `.0` (`12000` → `12k`).
   - `formatLatency(ms)`: below 1000 → `"412 ms"`; otherwise one decimal plus `" s"` (`1830` → `"1.8 s"`).

## Acceptance criteria
- [ ] All six components and the helpers exist with the props above.
- [ ] The format examples produce the right output (`12400` → `12.4k`, `1_200_000` → `1.2M`, `999` → `999`, `1830` → `1.8 s`, `412` → `412 ms`).
- [ ] Icon buttons have an `aria-label` and a `Tooltip`; ConfirmDialog has a title and focuses Cancel.
- [ ] They look right in both themes (check them by temporarily rendering them on the Settings placeholder page, then remove that).

## Verify
`yarn lint && yarn build`. Unit tests for `format.ts` come in QA-2.

## Out of scope
- `StatusChip` (PROV-1), `ModelPicker` (CHAT-13), `Markdown`/`CodeBlock` (CHAT-4).
