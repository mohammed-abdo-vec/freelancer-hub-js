# SET-4 · Sign out from Settings: implementation spec

> **Story card:** [stories/SET-4-settings-sign-out.md](../../stories/SET-4-settings-sign-out.md) · **Depends on:** SET-1, AUTH-5 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Files
| Action | Path | What |
|---|---|---|
| modify | `src/features/settings/pages/SettingsPage.tsx` | a final section with a `Button color="error" variant="outlined" startIcon={<LogoutRounded/>}` |

## Steps
1. `const signOut = useSignOut()` from `@/features/auth`. Reuse it; don't reimplement it.
2. Optionally add the caption "Signed in as {email}" above the button.

## Acceptance criteria
- [ ] Clicking it signs out exactly like the user menu: session cleared, cache cleared, on `/login`.

## Verify
Click it, then check the devtools cache and localStorage.

## Out of scope
- Nothing else.
