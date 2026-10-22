# SET-1 · Edit my profile name: implementation spec

> **Story card:** [stories/SET-1-profile.md](../../stories/SET-1-profile.md) · **Depends on:** AUTH-3 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Current state
`src/features/settings/pages/SettingsPage.tsx` is a `PagePlaceholder`. Replace it with a sectioned page; SET-2 to SET-4 add more sections.

## API
`PATCH /auth/me` `UpdateProfileRequest { name }` returns `{ user }`.

## Files
| Action | Path | What |
|---|---|---|
| create | `src/features/settings/api/profile.ts` | `updateProfile(body)` |
| create | `src/features/settings/hooks/useUpdateProfile.ts` | mutation → `auth.store.setUser(user)` + `setQueryData(queryKeys.me, user)` |
| create | `src/features/settings/schemas.ts` | `profileSchema { name: string trimmed 1–80 }` |
| create | `src/features/settings/components/SettingsSection.tsx` | `{ title; description?; children }`, an outlined card with a heading |
| create | `src/features/settings/components/ProfileSection.tsx` | the form |
| modify | `src/features/settings/pages/SettingsPage.tsx` | `Container maxWidth="sm"`, `h4` "Settings", a stack of sections |

## Steps
1. Name field (RHF + zod), prefilled from `auth.store.user`. Email is a `TextField` with `disabled` (or `slotProps.input.readOnly`) and helper text "Email can't be changed".
2. The Save button is enabled only when the form is dirty and valid. Spinner while pending. After success, reset with the new value.
3. Map server field errors with `getFieldErrors`.
4. `useDocumentTitle('Settings')`.

## Acceptance criteria
- [ ] Changing the name updates the user menu without a reload and persists after a reload.
- [ ] An empty name shows a field error.
- [ ] Email is read-only.

## Verify
Rename "Demo User" → "Ada", check the menu and the dashboard greeting, then reload.

## Out of scope
- Other sections.
