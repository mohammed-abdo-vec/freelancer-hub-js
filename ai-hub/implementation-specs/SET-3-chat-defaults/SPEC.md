# SET-3 · Set my chat defaults: implementation spec

> **Story card:** [stories/SET-3-chat-defaults.md](../../stories/SET-3-chat-defaults.md) · **Depends on:** SET-1, CHAT-1, CHAT-10 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Current state
`shared/stores/preferences.store.ts` (from CHAT-10) has `defaultModel`, `enterToSend` and their setters. `NewChatState` (CHAT-1) and `CompareForm` (CMP-1) already read `defaultModel`. `Composer` reads `enterToSend`.

## Files
| Action | Path | What |
|---|---|---|
| create | `src/features/settings/components/ChatDefaultsSection.tsx` | `ModelPicker variant="field" label="Default model"` + `FormControlLabel` with a `Switch` |
| modify | `src/features/settings/pages/SettingsPage.tsx` | add the section |

## Steps
1. The picker is bound to `defaultModel`. Add a "Clear" option or button to reset it to `null` ("Use the first available model").
2. If the saved default is no longer available (provider removed), show helper text "Not available, new chats will use the first available model".
3. Switch label "Enter to send", helper "When off, use Ctrl+Enter (⌘+Enter) to send and Enter for a new line."
4. Changes save immediately (no Save button); an optional subtle "Saved" snackbar.

## Acceptance criteria
- [ ] Setting the default to Mock Smart makes `/chat` and `/compare` pre-select Mock Smart.
- [ ] Turning off Enter to send changes the composer's behavior.
- [ ] Both persist after a reload (localStorage `ai-hub-prefs`).

## Verify
The steps above.

## Out of scope
- Sign out (SET-4).
