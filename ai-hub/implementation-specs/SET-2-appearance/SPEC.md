# SET-2 · Choose light, dark or system theme: implementation spec

> **Story card:** [stories/SET-2-appearance.md](../../stories/SET-2-appearance.md) · **Depends on:** SET-1, FND-2 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md) (theme mode is owned by MUI `useColorScheme`)

## Current state
`UserMenu` already switches modes through `useColorScheme()`, and MUI persists the choice (`mui-mode`).

## Files
| Action | Path | What |
|---|---|---|
| create | `src/features/settings/components/AppearanceSection.tsx` | `ToggleButtonGroup` bound to `useColorScheme()` |
| modify | `src/features/settings/pages/SettingsPage.tsx` | add the section |

## Steps
1. `const { mode, setMode } = useColorScheme();`. `mode` can be `undefined` on the first render, so render a disabled group until it's defined.
2. Three buttons with icons (`LightModeRounded`, `DarkModeRounded`, `SettingsBrightnessRounded`) and labels. Use `exclusive` and ignore a `null` change (no deselecting).
3. Don't add `themeMode` to `preferences.store`. One source of truth.

## Acceptance criteria
- [ ] Switching applies instantly with no flash, and persists after a reload.
- [ ] Changing it in the user menu updates the toggle, and the other way round.
- [ ] "System" follows the OS setting (check by toggling emulation in DevTools).

## Verify
Toggle in both places, reload, emulate `prefers-color-scheme`.

## Out of scope
- Theme tokens (FND-2).
