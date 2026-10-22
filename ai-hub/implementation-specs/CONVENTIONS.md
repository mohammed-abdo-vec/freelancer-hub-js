# Conventions for every implementation spec

Every story spec in this folder assumes you have read this file. It **adapts [SPEC.md](../SPEC.md) to the code that already exists** in `client/`. When this file and SPEC.md §5.2 disagree on *where* something lives, this file wins. SPEC.md still decides *what* to build (behavior, API, UX).

## 1. Ground rules
- **Never modify `ai-hub/server/`.** The backend is complete; [`server/src/types/api.ts`](../server/src/types/api.ts) is the contract.
- Implement **one story only**. Don't build parts of later stories, even if they're "right there". Leave a `// TODO(<STORY-ID>)` instead.
- Work in `ai-hub/client`. When you finish, run `npm run lint` and `npm run build` and fix every error and warning.
- At the end, go through the story's **Acceptance criteria** one by one, say which pass, and stop.

## 2. Architecture (already set up, enforced by ESLint)
```
src/
├─ main.tsx              # entry
├─ app/                  # composition root: App.tsx (providers), router.tsx, navigation.ts, components/
├─ features/<name>/      # one folder per product area
│  ├─ index.ts           # PUBLIC API: the only file other layers may import
│  ├─ routes.ts          # lazyPage(...) pages + RouteObject[]
│  ├─ pages/  components/  hooks/  api/  schemas.ts  types.ts
└─ shared/               # reusable, knows nothing about features
   ├─ layout/  theme/  components/  hooks/  lib/  config/paths.ts  assets/
   ├─ api/               # client.ts, errors.ts, queryClient.ts, queryKeys.ts      (FND-3, FND-4)
   ├─ stores/            # auth.store.ts, preferences.store.ts                     (FND-4, CHAT-10)
   ├─ types/api.ts       # VERBATIM copy of server/src/types/api.ts                (FND-1)
   └─ utils/             # format.ts, greeting.ts                                   (FND-5, DASH-1)
```
- Dependencies point one way: `app → features → shared`. `shared/` never imports `features/` or `app/`.
- Another feature is imported only through `@/features/<name>` (its `index.ts`). Inside a feature, use relative imports.
- Pages are exported from `routes.ts` wrapped in `lazyPage()`; never re-export a page module from `index.ts`.
- Paths come from `@/shared/config/paths`. Don't hard-code `'/chat'`.

### Where SPEC.md §5.2 names map to
| SPEC.md says | Lives here |
|---|---|
| `src/types/api.ts` | `src/shared/types/api.ts` |
| `src/api/client.ts`, `errors.ts` | `src/shared/api/` |
| `src/api/auth.ts` | `src/features/auth/api/auth.ts` |
| `src/api/providers.ts`, `connections.ts` | `src/features/app-keys-config/api/` (the providers feature) |
| `src/api/conversations.ts`, `stream.ts` | `src/features/chat/api/` |
| `src/api/compare.ts` | `src/features/compare/api/` |
| `src/api/usage.ts` | `src/features/home/api/` (the dashboard feature) |
| `hooks/queries/*` | `src/features/<feature>/hooks/` |
| `hooks/queryKeys.ts` | `src/shared/api/queryKeys.ts` |
| `stores/*.store.ts` | `src/shared/stores/` (the axios interceptor in `shared/` needs the token) |
| `components/common/*` | `src/shared/components/` |
| `components/routing/RequireAuth`, `PublicOnly` | `src/features/auth/components/` (exported from the auth `index.ts`) |
| `ModelPicker`, `useAllModels` | `src/features/app-keys-config/` (exported, used by chat, compare, settings) |
| `features/dashboard/*` | `src/features/home/` |
| `features/providers/*` | `src/features/app-keys-config/` |

### Deliberate differences from SPEC.md (keep them)
- **Conversation list** lives in the **main sidebar's content slot** (`RecentChats`, ChatGPT style), not in a second sidebar inside the chat page. "New chat" is the first main nav item (with `⌘K`).
- **Theme mode** (light/dark/system) is owned by MUI's `useColorScheme()`, which already persists it (localStorage key `mui-mode`). Don't duplicate it in `preferences.store`.
- The sidebar collapsed state is persisted with `useLocalStorageState('ai-hub-sidebar-collapsed')`.

## 3. State ownership (SPEC.md §5.3)
| State | Home |
|---|---|
| Anything from the API | TanStack Query. Never copy query data into `useState` or zustand |
| Session (`token`, `user`) | `shared/stores/auth.store.ts` (zustand + persist, key `ai-hub-auth`) |
| `defaultModel`, `enterToSend` | `shared/stores/preferences.store.ts` (persist, key `ai-hub-prefs`) |
| In-flight stream | `useChatStream` local state |
| Forms | react-hook-form + zod (`schemas.ts` in the feature) |
| Dialog open, menu anchor | component `useState` |
| Selected conversation | the URL `/chat/:conversationId` |

Query keys come only from `queryKeys` in `@/shared/api/queryKeys` (SPEC.md §5.5), and invalidation follows the table in §5.5.

## 4. Code conventions (SPEC.md §5.6)
- TypeScript strict, no `any` (use `unknown` and narrow it). Import API types from `@/shared/types/api`.
- One component per file, named exports, `PascalCase.tsx`; hooks are `useX.ts`. Use the `@/` alias across layers.
- MUI only: use `sx` for one-off styles and theme overrides for anything repeated. Use theme tokens, never hex values (provider brand colors from the API are the only exception). Use the `…Rounded` icons.
- Components never call axios directly. They go through a feature hook, which calls the feature's `api/*.ts`.
- Every async view has **loading** (Skeletons shaped like the result), **empty** (`EmptyState`) and **error** (`ErrorState` with Retry → `refetch`) states.
- Every mutation shows a spinner on its button while pending, plus a snackbar (`notistack`) on success or error.
- Accessibility: icon buttons get an `aria-label` and a `Tooltip`; dialogs have titles; text meets WCAG AA contrast in both themes.
- Nothing scrolls horizontally at 360 px (except code blocks and tables in messages).

## 5. Running things
```bash
cd ai-hub/server && npm run dev          # API on :4000 (npm run seed → demo@aihub.dev / password123)
cd ai-hub/client && npm run dev          # Vite, proxies /api → :4000 (after FND-1)
```
Mock AI: connect with any key starting with `mock-`. Prompts `/long`, `/error` and `/ratelimit` simulate edge cases (SPEC.md §3.5).
