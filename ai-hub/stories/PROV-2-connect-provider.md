---
id: PROV-2
title: Connect a provider with an API key
epic: Providers
type: Story
priority: Highest
points: 3
status: To Do
depends_on: [PROV-1]
labels: [providers, forms]
spec: ../implementation-specs/PROV-2-connect-provider/SPEC.md
---

# PROV-2 · Connect a provider with an API key

**As a** user **I want** to paste an API key and have it validated **so that** I can use that provider's models.

## Acceptance criteria
- [ ] "Connect" opens a dialog with an optional label and the API key (password field with show/hide, placeholder = `keyPlaceholder`), plus a "Get an API key ↗" link.
- [ ] The submit button "Validate & save" shows a spinner (validation takes 0.5–3 s).
- [ ] A 422 `PROVIDER_AUTH_FAILED` shows the message **under the key field** and keeps the dialog open.
- [ ] Success closes the dialog and shows the snackbar "<Provider> connected". The card updates.
- [ ] The raw key is never logged, cached or kept after the dialog closes.

**Source:** SPEC.md §2.2 PROV-2, §9 Providers & Security
