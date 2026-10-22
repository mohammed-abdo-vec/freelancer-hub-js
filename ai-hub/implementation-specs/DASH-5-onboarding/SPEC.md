# DASH-5 · Get started with my first provider: implementation spec

> **Story card:** [stories/DASH-5-onboarding.md](../../stories/DASH-5-onboarding.md) · **Depends on:** DASH-1 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Files
| Action | Path | What |
|---|---|---|
| create | `src/features/home/components/OnboardingCard.tsx` | a hero-style outlined card |
| modify | `src/features/home/pages/DashboardPage.tsx` | branch on the connected count |

## Steps
1. `connected = providers.filter(p => p.connection).length`. While providers are loading, show the normal skeletons (no flash of onboarding).
2. With `connected === 0`: keep the greeting and the stat cards (they show 0), and replace the chart, breakdown and table with `OnboardingCard`: the `KeyRounded` icon in a primary-tinted circle, the title "Connect your first AI provider", the text "Paste an API key for OpenAI, Anthropic, Gemini and more. No key yet? Connect Mock AI with any key starting with `mock-`.", and a contained button "Connect a provider" to `paths.providers`.
3. Recent conversations (DASH-4) can stay or hide. Recommend hiding it when it's empty too.

## Acceptance criteria
- [ ] A fresh account sees the onboarding card instead of the charts.
- [ ] After connecting Mock AI, the charts appear.

## Verify
Register a new user → `/` → connect Mock → `/`.

## Out of scope
- Nothing else.
