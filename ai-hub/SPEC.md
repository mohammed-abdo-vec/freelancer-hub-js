# AI Hub: Frontend Spec & Implementation Plan

> **One app for all your AI tools.** Paste an API key for OpenAI, Anthropic, Gemini, Mistral, Groq, DeepSeek, xAI or OpenRouter, then chat with any of their models, compare answers side by side, and track token usage, all from one place.

| | |
|---|---|
| **Frontend (to build)** | `ai-hub/client`: React + TypeScript + Vite + MUI |
| **Backend (done, don't change)** | `ai-hub/server`: Express 5 + TypeScript, running on `http://localhost:4000` |
| **API contract** | [`server/src/types/api.ts`](server/src/types/api.ts) is the source of truth for every request and response shape |
| **Spec version** | 1.0 |

---

## 0. How to use this document with Claude

This spec is written so that an AI coding assistant can build the frontend **one phase at a time** (see §8). Start each session with a prompt like this:

```text
You are a senior frontend engineer. Read ai-hub/SPEC.md completely before writing code.
Implement **Phase <N>** only, exactly as specified.

Rules:
- Do not modify anything in ai-hub/server. The backend is complete; it is the contract.
- Use the types from client/src/types/api.ts (a verbatim copy of server/src/types/api.ts).
- Follow the folder structure (§5.2), state rules (§5.3) and conventions (§5.6).
- When the phase is done, run `npm run lint` and `npm run build` in ai-hub/client and fix every error.
- Then check each "Done when" item for the phase, report which pass, and stop.
```

Work through the phases in order. Each phase ends with a working app, so commit after every phase.

---

## 1. Product overview

### 1.1 Problem
Developers and power users pay for several AI providers. Each one has its own console, its own chat UI and its own usage page. Comparing models means copying the same prompt across tabs, and nobody knows how many tokens they've used in total.

### 1.2 Solution
AI Hub is a single web app where a user:
1. **Connects** providers by pasting API keys. The backend validates each key with the provider, encrypts it and stores it. The browser never sees a raw key again.
2. **Chats** with any model from any connected provider, with streaming answers, Markdown and code highlighting, and conversation history.
3. **Compares** up to 4 models on the same prompt, side by side.
4. **Monitors** requests and token usage per provider, per model and per day.

### 1.3 Target users
- **Primary:** developers and AI enthusiasts who hold 2 or more provider keys.
- **Secondary:** students learning about LLMs. The built-in **Mock AI** provider lets them use every feature without paying for anything.

### 1.4 Goals and success criteria
| Goal | Measure |
|---|---|
| Connecting a provider is fast | Paste key → validated → usable in < 30 s |
| Chat feels native | First streamed token renders as soon as it arrives; Stop works instantly |
| Never leak keys | Raw keys are never stored client side, logged, or shown after saving |
| Works everywhere | Usable from 360 px phone width to wide desktop, in light and dark mode |

### 1.5 Non-goals (v1)
Image, audio or file uploads · tool calling and agents · team accounts and sharing · billing in currency (we count tokens, not dollars) · i18n/RTL · offline mode.

---

## 2. Features and user stories

Each story has acceptance criteria (AC). These ACs are what the QA checklist (§9) verifies.

### 2.1 Authentication
| ID | Story | Acceptance criteria |
|---|---|---|
| AUTH-1 | As a visitor I can create an account | Name, email and password (min 8 chars) form, validated client side with zod. Server validation errors (`details[]`) show under the matching field. A 409 shows "An account with this email already exists" under email. On success, store the token and go to `/`. |
| AUTH-2 | As a user I can sign in | Email and password form. A 401 shows the server message in an `Alert` above the form. On success, redirect to the `?redirect=` path or `/`. |
| AUTH-3 | My session survives reloads | Token and user are persisted. On app start, if a token exists, call `GET /auth/me` while showing a full-screen loader. If that fails with 401, clear the session. |
| AUTH-4 | Expired sessions are handled | **Any** 401 from any API call (except login) clears the session and redirects to `/login?redirect=<current path>`, with a snackbar saying "Session expired". |
| AUTH-5 | I can sign out | From the user menu and from Settings. Clears the session and the whole query cache, then goes to `/login`. |
| AUTH-6 | Route guards | Signed-out users who visit a private route go to `/login`. Signed-in users who visit `/login` or `/register` go to `/`. |

### 2.2 Providers and connections
| ID | Story | Acceptance criteria |
|---|---|---|
| PROV-1 | I can see every supported provider | Card grid from `GET /providers`. Each card shows a colored avatar, name, description, status chip (**Connected** green, **Invalid key** red, **Not connected** grey), masked key, and when the key was last checked ("2 min ago"). Filter tabs: All / Connected / Not connected. |
| PROV-2 | I can connect a provider | "Connect" opens a dialog with an optional label and the API key (password field with show/hide toggle, placeholder = `keyPlaceholder`), plus a "Get an API key ↗" link to `apiKeyUrl`. Submit button reads "Validate & save" and shows a spinner (validation calls the provider and takes 0.5–3 s). A 422 `PROVIDER_AUTH_FAILED` shows the message **under the key field** and keeps the dialog open. Success closes the dialog with the snackbar "OpenAI connected". |
| PROV-3 | I can test a connection | "Test" calls `POST /connections/:id/test`. While it runs, the button shows a spinner. Result is a snackbar: "Working · 37 models · 412 ms" or the error. The card's status updates. |
| PROV-4 | I can replace a key or rename | The "Edit" dialog has label and a new API key (optional; leave blank to keep the current key). Same 422 handling as PROV-2. |
| PROV-5 | I can remove a connection | Confirm dialog: "Remove OpenAI? Existing conversations stay, but you can't send messages with OpenAI until you reconnect." Then `DELETE`. |
| PROV-6 | Mock provider is obvious | If the `mock` provider is present, show a dismissible info banner at the top: "No API key yet? Connect **Mock AI** with any key starting with `mock-` to try everything for free." |

### 2.3 Chat
| ID | Story | Acceptance criteria |
|---|---|---|
| CHAT-1 | I can start a chat with any connected model | `/chat` shows a "new chat" empty state: a large model picker and 4 suggestion chips (for example "Explain a concept", "Write code", "Summarize text", "Brainstorm ideas") that fill the composer. The **first** send creates the conversation (`POST /conversations`), streams the answer, then replaces the URL with `/chat/:id`. |
| CHAT-2 | Answers stream in | Uses `POST /conversations/:id/messages/stream` (see §3.6). The user's message appears immediately (optimistic). The assistant bubble shows a typing indicator until the first delta, then the text grows token by token. |
| CHAT-3 | I can stop generation | While streaming, the Send button becomes a **Stop** button (and `Esc` stops). Stopping aborts the fetch. The partial answer stays and shows a "Stopped" chip. |
| CHAT-4 | Rich rendering | Assistant messages render GitHub-flavored Markdown (tables, lists, links open in a new tab) with syntax-highlighted code blocks, each with a language label and a **Copy** button. User messages render as plain text with line breaks kept. |
| CHAT-5 | Message metadata | Each assistant message shows a footer on hover (always visible on touch devices) with provider avatar, model, `↑ in / ↓ out` tokens, latency ("1.8 s") and a Copy button. |
| CHAT-6 | Errors are recoverable | A message with `status: 'error'` renders as an error `Alert` inside the thread with its `error` text and a **Retry** button. Retry re-sends the preceding user message's content. `CONNECTION_REQUIRED` (409) shows an alert with a "Connect provider" button that links to `/providers`. |
| CHAT-7 | Conversation list | A secondary sidebar inside the chat page: "New chat" button, a search field (debounced 300 ms, uses `?search=`), a **Pinned** section, then the rest sorted by recent activity. Each item shows the title, a provider avatar and a relative time. Its kebab menu has Rename (inline edit), Pin/Unpin and Delete (confirm). The active item is highlighted. |
| CHAT-8 | Switch model mid-conversation | The chat header's model picker sends `PATCH /conversations/:id` `{ providerId, model }`. The next message uses the new model. Older messages keep their own model label. |
| CHAT-9 | System prompt | A header button (icon: `TuneRounded`) opens a dialog to edit the conversation's system prompt (saved with PATCH). On a new chat, the system prompt is held locally and sent with `POST /conversations`. |
| CHAT-10 | Composer UX | A multiline auto-growing input (max 8 rows). **Enter** sends and **Shift+Enter** adds a new line (configurable in Settings). Send is disabled when the input is empty or while streaming. A hint below the input reads "AI can make mistakes. Check important info." |
| CHAT-11 | Smart auto-scroll | While streaming, keep the view pinned to the bottom unless the user has scrolled up more than 80 px. In that case, show a floating "↓ Jump to latest" button. |
| CHAT-12 | No providers connected | If nothing is connected, `/chat` shows an empty state with a "Connect a provider" CTA instead of the composer. |
| CHAT-13 | Model picker | An `Autocomplete` grouped by provider (connected providers only), with options loaded from `GET /providers/:id/models` for each connected provider. Users can search by model name or id. If a provider's model request fails, fall back to its `suggestedModels` and show a warning icon on that group. The selected value shows the provider avatar and model name. |

### 2.4 Compare
| ID | Story | Acceptance criteria |
|---|---|---|
| CMP-1 | I can compare models | `/compare` has a prompt textarea, an optional system prompt (collapsible) and 1–4 target rows (each one a model picker, as in CHAT-13), plus "+ Add model" and remove buttons. "Run" is disabled until there is a prompt and at least 1 target. `Ctrl/Cmd+Enter` runs. |
| CMP-2 | Results arrive independently | Send **one** `POST /compare` request **per target** (with `targets: [t]`), all in parallel, so each card fills as soon as its model finishes. Each card shows a skeleton while loading, then Markdown content, latency, tokens and a Copy button, or an error `Alert`. |
| CMP-3 | Layout | Cards sit in a responsive grid: 1 column on xs, 2 on md, and up to 4 on xl. Every card in a row has the same height and scrolls internally. |

### 2.5 Dashboard and usage
| ID | Story | Acceptance criteria |
|---|---|---|
| DASH-1 | Overview at a glance | `/` shows a greeting ("Good morning, Ada"), then 4 stat cards: **Connected providers** (x / total), **Requests**, **Input tokens** and **Output tokens** for the selected range. Format large numbers as `12.4k` or `1.2M`. |
| DASH-2 | Usage over time | A bar chart of daily requests (or tokens, via a toggle) from `GET /usage?days=` with a range selector of 7 / 14 / 30 days. Use `@mui/x-charts`. |
| DASH-3 | Breakdown | "By provider" (horizontal bars or a list with progress bars, in provider colors) and a "Top models" table. |
| DASH-4 | Recent conversations | The 5 most recent conversations, which link to `/chat/:id`, plus a "Start new chat" button. |
| DASH-5 | Onboarding | With 0 connections, a prominent "Connect your first AI provider" card replaces the charts and links to `/providers`. |

### 2.6 Settings
| ID | Story | Acceptance criteria |
|---|---|---|
| SET-1 | Profile | Edit name (`PATCH /auth/me`). Email is read-only. |
| SET-2 | Appearance | Theme: Light / Dark / System (`ToggleButtonGroup`), applied instantly and persisted. |
| SET-3 | Chat defaults | Default model (used to pre-select the picker on new chats) and an "Enter to send" switch. Both are stored locally. |
| SET-4 | Sign out | A button at the bottom of the page. |

---

## 3. Backend reference (already built)

### 3.1 Run it
```bash
cd ai-hub/server
npm install
cp .env.example .env      # defaults work for local dev
npm run seed              # optional: demo@aihub.dev / password123 with Mock AI connected
npm run dev               # http://localhost:4000  (npm run smoke = end-to-end self-test)
```

### 3.2 Conventions
- Base URL: `http://localhost:4000/api`. The Vite dev server proxies `/api`, so the client calls the relative path `/api`.
- Auth: `Authorization: Bearer <token>`. JWT lifetime is 7 days. There is no refresh token: when you get a 401, log the user out.
- Bodies are JSON. Timestamps are ISO-8601 strings.
- **Collections are wrapped:** `{ providers: [...] }`, `{ conversation: {...} }`, and so on.
- **Every error** has the shape `{ error: { code, message, details? } }`. `message` is always safe to show to the user.

| Status | `code` | Meaning → what the UI does |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `details: [{ path, message }]` → show under the matching form fields |
| 401 | `UNAUTHORIZED` | Session invalid → log out (except on the login form, where it means wrong credentials) |
| 404 | `NOT_FOUND` | Show a "not found" state (for example a deleted conversation) |
| 409 | `CONFLICT` | Duplicate email or provider already connected → inline message |
| 409 | `CONNECTION_REQUIRED` | Provider not connected → CTA to `/providers` |
| 422 | `PROVIDER_AUTH_FAILED` | The provider rejected the key → show under the key field / mark the connection invalid |
| 429 | `PROVIDER_RATE_LIMITED` / `RATE_LIMITED` | Show the message and suggest waiting |
| 502 | `PROVIDER_ERROR` | Upstream failure → show the message and offer Retry |
| 500 | `INTERNAL_ERROR` | Generic error snackbar |

> ⚠️ A bad **provider** key is a **422**, never a 401. Only a 401 means "your AI Hub session is invalid".

### 3.3 Endpoints
| Method & path | Body / query | Success response |
|---|---|---|
| `GET /health` | n/a | `HealthResponse` |
| `POST /auth/register` | `RegisterRequest` | 201 `AuthResponse` |
| `POST /auth/login` | `LoginRequest` | `AuthResponse` |
| `GET /auth/me` | n/a | `{ user: User }` |
| `PATCH /auth/me` | `UpdateProfileRequest` | `{ user: User }` |
| `GET /providers` | n/a | `{ providers: Provider[] }` (each provider includes its `connection` or `null`) |
| `GET /providers/:providerId/models` | n/a | `{ models: Model[] }`. Live from the provider and cached for 10 min. 409 if not connected |
| `GET /connections` | n/a | `{ connections: Connection[] }` |
| `POST /connections` | `CreateConnectionRequest` | 201 `{ connection }`. Validates the key with the provider first (422 if rejected, 409 if already connected) |
| `PATCH /connections/:id` | `UpdateConnectionRequest` | `{ connection }` |
| `DELETE /connections/:id` | n/a | 204 |
| `POST /connections/:id/test` | n/a | `TestConnectionResponse`, **always 200**: check `ok` |
| `GET /conversations` | `?search=` | `{ conversations: Conversation[] }`, pinned first, then most recent |
| `POST /conversations` | `CreateConversationRequest` | 201 `{ conversation }` (409 if the provider isn't connected) |
| `GET /conversations/:id` | n/a | `{ conversation: ConversationDetail }` (includes `messages`, oldest first) |
| `PATCH /conversations/:id` | `UpdateConversationRequest` | `{ conversation }` |
| `DELETE /conversations/:id` | n/a | 204 |
| `POST /conversations/:id/messages` | `SendMessageRequest` | 201 `SendMessageResponse` (non-streaming; not needed by the UI, but handy for tests) |
| `POST /conversations/:id/messages/stream` | `SendMessageRequest` | `text/event-stream` (see §3.6) |
| `POST /compare` | `CompareRequest` | `CompareResponse`. Per-target failures come back as `status: 'error'` inside a 200 |
| `GET /usage` | `?days=1..90` (default 14) | `{ usage: UsageSummary }` |

### 3.4 Behaviors worth knowing
- **Titles:** new conversations are called `"New chat"`. The server renames them from the first user message, and the new title comes back in the `assistant_message` event's `conversation`.
- **Failed and stopped replies are saved** as assistant messages with `status: 'error' | 'stopped'`, so reloading a conversation shows them too. Failed replies are left out of the context sent to the model.
- **Connections are one per provider.** Conversations reference `providerId`, not a connection, so removing a key and adding a new one keeps old conversations usable.
- **Model ids** are whatever the provider returns (`gpt-5`, `claude-opus-5-5`, `gemini-2.5-flash`, …). Never hard-code them; use `GET /providers/:id/models`.

### 3.5 Mock AI provider (for development)
Enabled by default. Connect it with any key that starts with `mock-` (for example `mock-123456`). Models: `mock-fast` and `mock-smart` (slower). Special prompts:

| Type… | You get… | Use it to test |
|---|---|---|
| anything | A Markdown reply with a table, list, link and code block | Markdown rendering |
| `/long` | A very long streamed answer | Stop button, auto-scroll, "Jump to latest" |
| `/error` | A 502-style provider error | Error alert and Retry |
| `/ratelimit` | A rate-limit error | 429 messaging |

A key that doesn't start with `mock-` → 422, which lets you test the invalid-key UI.

### 3.6 Streaming protocol
`POST /api/conversations/:id/messages/stream` with body `{ content }`. Pre-flight problems (validation, 404, 409, 401) come back as **normal JSON errors with a non-200 status**, before any stream opens. Otherwise the response is `200 text/event-stream`:

```
event: user_message
data: {"message":{...Message, role:"user"}}

event: delta
data: {"text":"Hel"}

event: delta
data: {"text":"lo!"}

event: assistant_message
data: {"message":{...Message, role:"assistant", status:"complete"|"stopped"|"error"},"conversation":{...Conversation}}
```

- The stream **always** ends with `assistant_message`. Provider failures arrive here as `status: 'error'` (with `error` text), not as an `error` event.
- `event: error` (an `ApiError` payload) only fires for unexpected server bugs.
- **Stop** = abort the `fetch`. The server sees the disconnect, aborts the provider call and saves the partial text as `status: 'stopped'`. No `assistant_message` reaches the client after an abort, so mark the local message as stopped yourself and refetch the conversation about 300 ms later.
- `EventSource` can't send POST requests or headers, so use `fetch` and read `response.body` (see §7.3).

---

## 4. Tech stack

Install the **latest stable** version of each package, and follow the docs for the major version you install (MUI APIs in particular change between majors).

| Package | Why |
|---|---|
| `vite`, `@vitejs/plugin-react`, `typescript` | Build tooling (`npm create vite@latest client -- --template react-ts`) |
| `react`, `react-dom` | UI |
| `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled` | Component library and icons (use the `…Rounded` icon variants) |
| `@mui/x-charts` | Dashboard charts |
| `@fontsource-variable/inter` | Self-hosted Inter font |
| `react-router` | Routing (data router: `createBrowserRouter`) |
| `@tanstack/react-query`, `@tanstack/react-query-devtools` | Server state, caching, mutations |
| `axios` | JSON requests with interceptors (streaming uses `fetch`) |
| `zustand` | Small client stores (auth session, preferences) with the `persist` middleware |
| `react-hook-form`, `zod`, `@hookform/resolvers` | Forms and validation |
| `notistack` | Snackbars (works with MUI) |
| `react-markdown`, `remark-gfm`, `rehype-highlight`, `highlight.js` | Markdown and code highlighting |
| `dayjs` | Relative times ("5 min ago") via the `relativeTime` plugin |
| Dev: `eslint`, `prettier`, `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom` | Lint, format, tests |

---

## 5. Architecture

### 5.1 Data flow
```
Pages / components
      │  use…() hooks           (never call axios directly from components)
      ▼
hooks/queries/*  ── TanStack Query (cache, loading/error state, invalidation)
      │
      ▼
api/*.ts  ── typed functions: listProviders(), createConnection(), streamMessage()...
      │
      ▼
api/client.ts  (axios: baseURL, auth header, 401 interceptor)   +   api/stream.ts (fetch + SSE parser)
      │
      ▼
Express API  (/api → localhost:4000 via the Vite proxy)
```

### 5.2 Folder structure
```
ai-hub/client/
├─ index.html
├─ vite.config.ts            # react plugin, '@' alias → src, proxy '/api' → http://localhost:4000
├─ .env.example              # VITE_API_URL=/api
└─ src/
   ├─ main.tsx               # fonts, highlight.js theme css, <App/>
   ├─ App.tsx                # providers: Theme, QueryClient, Snackbar, Router
   ├─ router.tsx             # route table (§5.4)
   ├─ theme/
   │  └─ theme.ts            # createTheme with light + dark colorSchemes (§6.1)
   ├─ types/
   │  └─ api.ts              # VERBATIM copy of server/src/types/api.ts
   ├─ api/
   │  ├─ client.ts           # axios instance + interceptors
   │  ├─ errors.ts           # isApiError(), getErrorMessage(), getFieldErrors()
   │  ├─ stream.ts           # streamMessage() — fetch + SSE parsing
   │  ├─ auth.ts  providers.ts  connections.ts  conversations.ts  compare.ts  usage.ts
   ├─ hooks/
   │  ├─ queries/            # useProviders, useModels, useAllModels, useConversations, useConversation,
   │  │                      # useUsage, + mutations (useCreateConnection, useDeleteConversation, …)
   │  ├─ queryKeys.ts        # query key factory (§5.5)
   │  ├─ useChatStream.ts    # streaming state machine (§7.4)
   │  ├─ useAutoScroll.ts
   │  ├─ useDebouncedValue.ts
   │  └─ useDocumentTitle.ts
   ├─ stores/
   │  ├─ auth.store.ts       # token, user, setSession(), clearSession()  (persisted)
   │  └─ preferences.store.ts# themeMode, defaultModel, enterToSend      (persisted)
   ├─ components/
   │  ├─ layout/             # AppShell, SideNav, TopBar (mobile), UserMenu
   │  ├─ routing/            # RequireAuth, PublicOnly
   │  └─ common/             # ProviderAvatar, ModelPicker, Markdown, CodeBlock, CopyButton, EmptyState,
   │                         # ErrorState, ConfirmDialog, LoadingScreen, RelativeTime, StatusChip
   ├─ features/
   │  ├─ auth/               # LoginPage, RegisterPage, schemas.ts
   │  ├─ dashboard/          # DashboardPage, StatCard, UsageChart, ProviderBreakdown, TopModelsTable, RecentConversations
   │  ├─ providers/          # ProvidersPage, ProviderCard, ConnectProviderDialog, EditConnectionDialog, MockBanner
   │  ├─ chat/               # ChatPage, ConversationSidebar, ConversationItem, ChatHeader, MessageList,
   │  │                      # MessageBubble, MessageFooter, Composer, SystemPromptDialog, NewChatState
   │  ├─ compare/            # ComparePage, TargetRow, CompareResultCard
   │  ├─ settings/           # SettingsPage, ProfileSection, AppearanceSection, ChatDefaultsSection
   │  └─ NotFoundPage.tsx
   └─ utils/
      ├─ format.ts           # formatNumber(12400) → "12.4k", formatLatency(1830) → "1.8 s"
      └─ greeting.ts
```

### 5.3 State ownership: one home per piece of state
| State | Lives in | Notes |
|---|---|---|
| Anything from the API | **TanStack Query** | Never copy query data into `useState` or zustand |
| Session (`token`, `user`) | `auth.store` (zustand + persist, key `ai-hub-auth`) | Read the token in the axios interceptor via `useAuthStore.getState()` |
| Preferences (`themeMode`, `defaultModel`, `enterToSend`) | `preferences.store` (persist, key `ai-hub-prefs`) | |
| In-flight stream (draft text, streaming status) | `useChatStream` local state | Merged into the query cache when it finishes |
| Form values | react-hook-form | zod schemas in each feature's `schemas.ts` |
| UI-only (dialog open, menu anchor) | Component `useState` | |
| Selected conversation | The URL (`/chat/:conversationId`) | The URL is the source of truth |

### 5.4 Routes
| Path | Page | Guard |
|---|---|---|
| `/login`, `/register` | LoginPage, RegisterPage (centered card, no shell) | PublicOnly |
| `/` | DashboardPage | RequireAuth + AppShell |
| `/chat` | ChatPage (new chat) | 〃 |
| `/chat/:conversationId` | ChatPage | 〃 |
| `/compare` | ComparePage | 〃 |
| `/providers` | ProvidersPage | 〃 |
| `/settings` | SettingsPage | 〃 |
| `*` | NotFoundPage | none |

Lazy-load each page with `React.lazy`, using a `Suspense` fallback `LinearProgress` at the top of the content area.

### 5.5 Query keys and invalidation
```ts
export const queryKeys = {
  me: ['me'] as const,
  providers: ['providers'] as const,
  models: (providerId: ProviderId) => ['providers', providerId, 'models'] as const,
  conversations: (search = '') => ['conversations', { search }] as const,
  conversation: (id: string) => ['conversation', id] as const,
  usage: (days: number) => ['usage', days] as const,
};
```
| After… | Invalidate / update |
|---|---|
| connect / edit / test / remove a connection | `['providers']` (this includes all model lists) |
| create / rename / pin / delete a conversation | `['conversations']`; on delete, remove `['conversation', id]` |
| stream finished (`assistant_message`) | `setQueryData(['conversation', id])` with the final messages and conversation; invalidate `['conversations']` and `['usage']` |
| compare finished | invalidate `['usage']` |

QueryClient defaults: `staleTime: 30_000`, `retry: (count, err) => count < 2 && status >= 500`, `refetchOnWindowFocus: false`. Models: `staleTime: 10 * 60_000`.

### 5.6 Conventions
- TypeScript `strict`. No `any`; use `unknown` and narrow it.
- One component per file, named exports, `PascalCase.tsx`. Hooks are `useX.ts`.
- Style with MUI: the `sx` prop for one-offs, theme overrides for anything repeated. No CSS files except the global highlight.js theme.
- Use theme tokens (`theme.palette.*`, `theme.spacing`), never hard-coded hex values. The only exception is provider brand colors from the API.
- Imports use the `@/` alias.
- Every async view handles **loading** (Skeletons that match the final layout), **empty** (`EmptyState` with an icon, title, text and CTA) and **error** (`ErrorState` with the message and a Retry button that calls `refetch`).
- Every mutation gives feedback: a button spinner while pending, plus a snackbar on success or error.
- Accessibility: icon buttons have an `aria-label` and a `Tooltip`; dialogs have titles; focus moves to the composer after sending; colors meet WCAG AA in both themes.

---

## 6. UI / UX specification

### 6.1 Theme
- `createTheme({ cssVariables: { colorSchemeSelector: 'class' }, colorSchemes: { light, dark } })`, and switch modes with `useColorScheme()` (wired to the preference store).
- **Primary** `#5B5BD6` (indigo-violet), **secondary** `#0EA5E9`. Backgrounds: light `#F7F7FB` / paper `#FFFFFF`; dark `#0F1117` / paper `#171A23`.
- **Typography:** Inter Variable. h4–h6 use weight 600. Body is 15 px. Code uses `ui-monospace, SFMono-Regular, Menlo, monospace`.
- **Shape:** `borderRadius: 10`. Cards are `variant="outlined"` with no shadow. Dialogs are 16 px radius.
- **Component overrides:** `MuiButton` uses `textTransform: 'none'`, weight 600 and `disableElevation`. `MuiTextField` defaults to `size="small"`. `MuiTooltip` uses `arrow`. `MuiPaper` sets `backgroundImage: 'none'` in dark mode.

### 6.2 App shell
```
┌──────────────┬───────────────────────────────────────────────────────┐
│ ◆ AI Hub     │                                                       │
│              │                                                       │
│ ⌂ Dashboard  │                  <page content>                       │
│ 💬 Chat      │                                                       │
│ ⇆ Compare    │                                                       │
│ 🔌 Providers │                                                       │
│ ⚙ Settings   │                                                       │
│              │                                                       │
│ ──────────── │                                                       │
│ ☾ theme      │                                                       │
│ (A) Ada  ⋮   │                                                       │
└──────────────┴───────────────────────────────────────────────────────┘
```
- **md and up:** a permanent `Drawer` 248 px wide, collapsible to a 72 px icon rail (the collapsed state is persisted). The active item is highlighted.
- **Below md:** an `AppBar` with a hamburger button that opens a temporary `Drawer`.
- The user menu (avatar with initials) offers Settings and Sign out.

### 6.3 Chat page
```
┌──────────────────┬──────────────────────────────────────────────────┐
│ [+ New chat]     │ (◎) Claude Opus 5.5  ▾        [⚙ system] [⋮]     │
│ 🔍 Search…        ├──────────────────────────────────────────────────┤
│ PINNED           │                                   ┌────────────┐ │
│ ● Welcome        │                                   │ user text  │ │
│ RECENT           │                                   └────────────┘ │
│ ● Trip plan  2h  │ (◎) assistant markdown…                          │
│ ● SQL help   1d  │     ```ts  code  [Copy]```                       │
│                  │     claude-opus-5-5 · ↑120 ↓480 · 1.8 s  [⧉]      │
│                  │                                                  │
│                  │                              [↓ Jump to latest]  │
│                  ├──────────────────────────────────────────────────┤
│                  │ ┌──────────────────────────────────────┐ [Send ▶]│
│                  │ │ Message Claude Opus 5.5…             │         │
│                  │ └──────────────────────────────────────┘         │
│                  │   AI can make mistakes. Check important info.    │
└──────────────────┴──────────────────────────────────────────────────┘
```
- The conversation sidebar is 280 px on lg and up. Below lg it becomes a `Drawer` opened from a header button (`ForumRounded`).
- The thread is centered with `maxWidth: 820px`. User messages are right-aligned bubbles in `primary` at 12 % opacity. Assistant messages are full width with no bubble, plus an avatar.
- The typing indicator is three animated dots.
- Code blocks have a dark background in both themes, a header bar with the language name and a Copy button, and horizontal scrolling.

### 6.4 Providers page
A responsive grid of `ProviderCard`s (xs 1, sm 2, lg 3 columns):
```
┌───────────────────────────────────────┐
│ (O) OpenAI                ● Connected │
│ GPT models for chat, reasoning…       │
│ Key  sk-p••••••••wxyz                 │
│ Checked 2 min ago                     │
│ [Test]  [Edit]  [Remove]      Docs ↗  │
└───────────────────────────────────────┘
```
Not connected: one primary **Connect** button plus a "Get API key ↗" link.

### 6.5 Responsive and polish rules
- Use the default MUI breakpoints. Nothing may scroll horizontally at 360 px, except code blocks and tables inside messages.
- Use `useDocumentTitle` on every page: "Chat · AI Hub", or the conversation title.
- Keyboard: `Ctrl/Cmd+K` starts a new chat, `Esc` stops a stream, `Ctrl/Cmd+Enter` runs compare.
- Every destructive action goes through `ConfirmDialog`.

---

## 7. Key implementation details

### 7.1 Axios client
```ts
// src/api/client.ts
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? '/api' });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(undefined, (error) => {
  const isLogin = error.config?.url?.includes('/auth/login');
  if (error.response?.status === 401 && !isLogin) {
    useAuthStore.getState().clearSession();       // RequireAuth then redirects to /login
    // show "Session expired" once (guard against duplicate snackbars)
  }
  return Promise.reject(error);
});
```

### 7.2 Error helpers
```ts
// src/api/errors.ts
export function getApiError(err: unknown): ApiError['error'] | null  // reads axios error.response.data.error
export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string
export function getFieldErrors(err: unknown): Record<string, string> // details[] → { email: '…' }
// in forms: Object.entries(getFieldErrors(e)).forEach(([k, m]) => setError(k, { message: m }))
```

### 7.3 Streaming client
```ts
// src/api/stream.ts
export interface StreamHandlers {
  onUserMessage(m: Message): void;
  onDelta(text: string): void;
  onAssistantMessage(m: Message, c: Conversation): void;
}

export async function streamMessage(
  conversationId: string,
  body: SendMessageRequest,
  handlers: StreamHandlers,
  signal: AbortSignal,
): Promise<void> {
  const res = await fetch(`${API_URL}/conversations/${conversationId}/messages/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAuthStore.getState().token}` },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) throw new StreamHttpError(res.status, (await res.json()) as ApiError); // pre-flight errors; 401 → clearSession()

  const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    let sep: number;
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      const event = block.match(/^event: (.*)$/m)?.[1];
      const data = JSON.parse(block.match(/^data: (.*)$/m)?.[1] ?? 'null');
      if (event === 'user_message') handlers.onUserMessage(data.message);
      else if (event === 'delta') handlers.onDelta(data.text);
      else if (event === 'assistant_message') handlers.onAssistantMessage(data.message, data.conversation);
      else if (event === 'error') throw new StreamHttpError(500, data);
    }
  }
}
```
An `AbortError` thrown by `fetch` or `read()` means the user pressed Stop. It is not a failure.

### 7.4 `useChatStream` hook
Signature: `const { send, stop, status, draft, error } = useChatStream(conversationId)` with `status: 'idle' | 'streaming'`.

1. `send(content)`: create an `AbortController` and set `status = 'streaming'`. **Optimistically** append a temp user message (`id: 'temp-…'`) to the `['conversation', id]` cache.
2. `onUserMessage`: replace the temp message with the real one.
3. `onDelta`: append to `draft` (local state, rendered as the in-progress assistant bubble). Batch updates with `requestAnimationFrame` if rendering lags.
4. `onAssistantMessage`: append the final message to the cache, merge the returned `conversation` fields (the title may change), clear `draft`, set `status = 'idle'`, and invalidate `['conversations']` and `['usage']`.
5. `stop()`: `controller.abort()`. Keep the draft visible as a "stopped" message, then `invalidateQueries(['conversation', id])` after 300 ms to load the saved version.
6. Pre-flight errors (`StreamHttpError`): roll back the optimistic message, then show the error (409 → connect CTA, others → snackbar).
7. Abort on unmount or when `conversationId` changes.

**New chat flow:** in `NewChatState`, `send` first runs the `POST /conversations` mutation, seeds `['conversation', newId]` with `{ ...conversation, messages: [] }`, starts the stream, then calls `navigate('/chat/' + newId, { replace: true })`. The stream must survive the navigation. Keep `ChatPage` mounted for both routes so the hook instance persists, or own the stream in a small context above the route.

### 7.5 Markdown
`<Markdown>` wraps `react-markdown` with `remarkGfm` and `rehypeHighlight`, and maps components to MUI: `a` → `Link target="_blank" rel="noreferrer"`, `table` → MUI `Table` inside a scrollable box, `code` (block) → `CodeBlock` with a copy button, `code` (inline) → monospace `Box` with a subtle background. Memoize it with `React.memo` so finished messages don't re-render while a new one streams. Never use `rehype-raw`: model output is untrusted.

### 7.6 Loading all models for the picker
`useAllModels()` runs `useQueries` over the connected providers and returns `{ groups: { provider, models, isLoading, isError }[] }`. If a group errors, it falls back to `provider.suggestedModels` mapped to `Model` objects.

---

## 8. Implementation plan

Each phase is one Claude session and one commit. Don't start a phase until the previous one's **Done when** list passes.

### Phase 0: Run the backend (5 min)
- [ ] `cd ai-hub/server && npm i && cp .env.example .env && npm run seed && npm run dev`
- [ ] `npm run smoke` (in a second terminal; it uses its own temp DB) prints "All smoke checks passed".

**Done when:** `curl localhost:4000/api/health` returns `{"status":"ok",…}`.

### Phase 1: Scaffold the client
- [ ] `npm create vite@latest client -- --template react-ts` inside `ai-hub/`.
- [ ] Install every package from §4.
- [ ] Set up `vite.config.ts` with the `@` alias and `server.proxy['/api'] = 'http://localhost:4000'`. Add matching `paths` in tsconfig.
- [ ] Add Prettier (`singleQuote`, `printWidth: 110`) and scripts for `dev`, `build`, `lint`, `format`, `test`.
- [ ] Copy `server/src/types/api.ts` to `client/src/types/api.ts`.
- [ ] Create `.env.example` with `VITE_API_URL=/api`.

**Done when:** `npm run dev` serves the Vite page; `npm run build` and `npm run lint` pass.

### Phase 2: Theme, shell and routing
- [ ] `theme/theme.ts` per §6.1, with `preferences.store` driving light/dark/system.
- [ ] `App.tsx` providers: `ThemeProvider` + `CssBaseline`, `QueryClientProvider` (+ devtools in dev), `SnackbarProvider`, `RouterProvider`.
- [ ] `router.tsx` with every route from §5.4 using placeholder pages (title + "Coming soon"), lazy loaded.
- [ ] `AppShell` with a collapsible permanent drawer on desktop and a temporary drawer on mobile, plus a theme toggle (§6.2).
- [ ] Shared components `EmptyState`, `ErrorState`, `LoadingScreen`, `ConfirmDialog`, `ProviderAvatar`, `RelativeTime`.

**Done when:** you can click through every route; the theme toggle persists across reloads; the layout works at 360 px; an unknown URL shows the 404 page.

### Phase 3: API layer and authentication
- [ ] `api/client.ts`, `api/errors.ts` and `api/auth.ts` (§7.1–7.2).
- [ ] `auth.store.ts` (persisted), plus the `RequireAuth` and `PublicOnly` guards.
- [ ] Login and Register pages: centered card, logo, RHF + zod, server field errors mapped onto fields, and a link to the other page.
- [ ] Session bootstrap: `GET /auth/me` on startup behind `LoadingScreen`.
- [ ] 401 handling and sign out (AUTH-4, AUTH-5). User menu shows the real name and initials.

**Done when:** AUTH-1 to AUTH-6 pass. Log in as `demo@aihub.dev` / `password123`, reload and stay logged in, then delete the token from localStorage and get sent to `/login`.

### Phase 4: Providers
- [ ] `api/providers.ts`, `api/connections.ts`, query hooks and mutations, with invalidation per §5.5.
- [ ] `ProvidersPage` with filter tabs, `ProviderCard`, `StatusChip` and `MockBanner`.
- [ ] `ConnectProviderDialog` and `EditConnectionDialog` with 422 errors shown inline.
- [ ] Test and Remove actions (with confirm).

**Done when:** PROV-1 to PROV-6 pass using Mock AI: `bad-key-123` shows an inline error, and `mock-123456` connects. If you have a real key, connect it as well.

### Phase 5: Chat, part A (conversations and reading)
- [ ] `api/conversations.ts` and hooks (list with search, detail, create, patch, delete).
- [ ] `ConversationSidebar` and `ConversationItem` (rename, pin, delete), responsive drawer below lg.
- [ ] `ModelPicker` (§7.6, CHAT-13), `ChatHeader` (model switch → PATCH) and `SystemPromptDialog`.
- [ ] `MessageList`, `MessageBubble`, `MessageFooter`, `Markdown` and `CodeBlock` with copy.
- [ ] Error-status and stopped-status message rendering (CHAT-6 display only, without Retry yet).

**Done when:** the seeded "Welcome to AI Hub" conversation renders correctly; rename, pin, delete and search work; switching the model persists after a reload.

### Phase 6: Chat, part B (sending and streaming)
- [ ] `api/stream.ts` (§7.3) and `useChatStream` (§7.4).
- [ ] `Composer` (CHAT-10), Stop and Esc (CHAT-3), typing indicator, `useAutoScroll` and "Jump to latest" (CHAT-11).
- [ ] New-chat flow with suggestion chips (CHAT-1), plus the no-connection states (CHAT-6 409, CHAT-12).
- [ ] Retry on error messages.

**Done when:** with Mock AI, a normal message streams word by word; `/long` can be stopped and shows "Stopped" (and still does after a reload); `/error` shows an alert and Retry works; a new chat gets an auto title in the sidebar; `Ctrl/Cmd+K` opens a new chat.

### Phase 7: Compare
- [ ] `ComparePage` with `TargetRow` × 1–4 (reusing `ModelPicker`) and a collapsible system prompt.
- [ ] Parallel per-target requests with independent loading per card (CMP-2), plus `CompareResultCard`.

**Done when:** comparing `mock-fast` vs `mock-smart` fills the two cards at different times; `/error` in the prompt shows an error card; the layout matches CMP-3.

### Phase 8: Dashboard and settings
- [ ] `DashboardPage`: greeting, `StatCard` × 4, `UsageChart` (range + metric toggle), `ProviderBreakdown`, `TopModelsTable`, `RecentConversations`, and the onboarding state (DASH-1 to DASH-5).
- [ ] `SettingsPage`: profile, appearance, chat defaults, sign out (SET-1 to SET-4). Wire `defaultModel` and `enterToSend` into chat.

**Done when:** numbers on the dashboard grow after chatting; the chart switches between 7, 14 and 30 days; a fresh account (0 connections) sees the onboarding card; settings persist after a reload.

### Phase 9: Polish and quality
- [ ] Audit every page for loading, empty and error states (§5.6) and test at 360 px, 768 px and 1440 px in both themes.
- [ ] Add `useDocumentTitle`, keyboard shortcuts and focus management (§6.5).
- [ ] Tests (Vitest + RTL): `format.ts`, `errors.ts`, the SSE parser (feed it chunked strings, including an event split across chunks), `LoginPage` validation and `ProviderCard` states.
- [ ] Check performance: finished messages don't re-render while streaming (React DevTools profiler), and route chunks are lazy.
- [ ] Write `client/README.md` (setup, scripts, structure).

**Done when:** every item in §9 passes, and `npm run lint`, `npm run test` and `npm run build` all succeed with zero warnings.

---

## 9. QA checklist (definition of done)

Run the server with Mock AI enabled, then go through this list in both light and dark mode, on desktop and at a 360 px width.

**Auth**
- [ ] Register with a short password → field error. Register with a taken email → email field error.
- [ ] Wrong password → alert. Correct password → dashboard.
- [ ] Reload → still signed in. Clear the token → next action redirects to `/login?redirect=…`, and signing in returns to that page.

**Providers**
- [ ] `bad-key-123` for Mock AI → inline error, dialog stays open.
- [ ] `mock-123456` → connected chip, masked key `mock••••••••3456`.
- [ ] Test → "Working · 2 models · N ms". Edit label → updates. Remove → confirm → Not connected.

**Chat**
- [ ] New chat → pick Mock Fast → suggestion chip → send → streams → URL becomes `/chat/:id` → sidebar shows the auto title.
- [ ] Markdown table, link (opens a new tab) and code block (Copy works) render properly.
- [ ] `/long` → scroll up → "Jump to latest" appears → Stop → "Stopped" chip → reload → still there.
- [ ] `/error` → error alert → Retry → (type something normal) works.
- [ ] Switch the model to Mock Smart → next reply footer says `mock-smart`.
- [ ] System prompt saved → the reply mentions "System prompt in effect".
- [ ] Rename, pin (moves to Pinned), search and delete conversations.
- [ ] Remove the Mock connection → sending shows the connect CTA.

**Compare**
- [ ] 2 targets → cards resolve independently; tokens and latency shown; `/error` → error cards.

**Dashboard and settings**
- [ ] Stats and chart reflect the activity above; range toggle works; a fresh account shows onboarding.
- [ ] Name change shows in the user menu; theme and Enter-to-send persist.

**Security**
- [ ] No raw API key appears in localStorage, the React Query cache or the console after saving.
- [ ] Markdown with `<script>` or raw HTML in a reply is rendered as text, not executed.

---

## 10. Future ideas (out of scope for v1)
Multiple keys per provider · prompt library and templates · export a conversation to Markdown · image input for vision models · per-model price table and cost estimates · shareable read-only conversation links · server-side search across message content · organization workspaces.
