# FND-2 · Align the theme with the design spec: implementation spec

> **Story card:** [stories/FND-2-theme-alignment.md](../../stories/FND-2-theme-alignment.md) · **Depends on:** FND-1 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Goal
`shared/theme/theme.ts` matches SPEC.md §6.1, so every later story builds on the final look.

## Current state
- `src/shared/theme/theme.ts` uses a Material Design 3 palette (`#6750A4`…), Roboto, `borderRadius: 12` and pill buttons (`borderRadius: 20`).
- `src/shared/theme/AppThemeProvider.tsx` imports `@fontsource/roboto/*` and renders `ThemeProvider defaultMode="dark"` with `CssBaseline enableColorScheme`.
- `colorSchemeSelector: 'class'` is already set. Keep it.

## Files
| Action | Path | What |
|---|---|---|
| modify | `src/shared/theme/theme.ts` | palette, typography, shape, component overrides |
| modify | `src/shared/theme/AppThemeProvider.tsx` | load `@fontsource-variable/inter` instead of Roboto |
| modify | `client/package.json` | remove `@fontsource/roboto` |

## Steps
1. Palette, per scheme:
   - light: `primary.main #5B5BD6`, `secondary.main #0EA5E9`, `background.default #F7F7FB`, `background.paper #FFFFFF`.
   - dark: same primary and secondary hues (pick lighter tints for dark if needed for AA contrast on `#0F1117`, and document the values in a comment), `background.default #0F1117`, `background.paper #171A23`.
   - Let MUI derive text, divider and error colors unless contrast fails.
2. Typography: `fontFamily: '"Inter Variable", system-ui, sans-serif'`, `fontSize: 15` (or `body1`/`body2` at 15/14 px), `h4`–`h6` `fontWeight: 600`. Export a `monoFontFamily = 'ui-monospace, SFMono-Regular, Menlo, monospace'` constant from `theme.ts` for CodeBlock and inline code.
3. `shape.borderRadius: 10`.
4. Component overrides:
   - `MuiButton`: `defaultProps.disableElevation`, `styleOverrides.root { textTransform: 'none', fontWeight: 600 }`. Remove the pill radius.
   - `MuiTextField`: `defaultProps.size: 'small'`.
   - `MuiTooltip`: `defaultProps.arrow: true`.
   - `MuiCard`: `defaultProps.variant: 'outlined'`, no elevation.
   - `MuiDialog`: paper `borderRadius: 16`.
   - `MuiPaper`: `backgroundImage: 'none'` in dark mode. With CSS variables, use `theme.applyStyles('dark', { backgroundImage: 'none' })` inside a `styleOverrides.root` callback.
5. Fonts: `import '@fontsource-variable/inter';` in `AppThemeProvider.tsx`. Delete the Roboto imports and uninstall the package.
6. Keep `defaultMode="dark"` and `disableTransitionOnChange`.

## Acceptance criteria
- [ ] The palette values above are applied in both schemes.
- [ ] Inter is loaded (check the Network tab) and Roboto is gone from `package.json`.
- [ ] Typography, shape and overrides match the list above.
- [ ] Primary text, secondary text and primary buttons pass AA contrast in both schemes (check with DevTools).
- [ ] Switching the theme from the user menu still works and doesn't flash on reload.

## Verify
Click through every page in light and dark mode. Buttons are not uppercase and not pills; tooltips have arrows. Then `yarn lint && yarn build`.

## Out of scope
- New components. The Settings appearance section (SET-2).
