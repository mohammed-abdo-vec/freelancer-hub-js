# AI Hub API

Express 5 + TypeScript backend for AI Hub. **The full API reference is in [../SPEC.md §3](../SPEC.md#3-backend-reference-already-built)**, and every request and response type is in [`src/types/api.ts`](src/types/api.ts).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start with auto-reload on http://localhost:4000 |
| `npm run build` / `npm start` | Compile to `dist/` / run the compiled server |
| `npm run typecheck` | Type-check only |
| `npm run seed` | Create `demo@aihub.dev` / `password123` with Mock AI connected. **Stop the server first**: it keeps the DB in memory and would overwrite the seed |
| `npm run smoke` | End-to-end test of every endpoint against Mock AI (uses a temp DB) |

## Configuration (`.env`)

| Variable | Default | Notes |
|---|---|---|
| `PORT` | `4000` | |
| `CLIENT_ORIGIN` | `http://localhost:5173` | CORS allow-list, comma separated |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | dev value / `7d` | Required in production |
| `ENCRYPTION_KEY` | dev value | Encrypts provider keys (AES-256-GCM). Changing it makes stored keys unreadable |
| `DATA_FILE` | `./data/db.json` | JSON-file database, created automatically |
| `ENABLE_MOCK_PROVIDER` | `true` | Adds the free "Mock AI" provider |

## How it works

```
src/
├─ index.ts / app.ts          Express setup: helmet, CORS, JSON, routes, error handler
├─ config/env.ts              Validated environment (zod)
├─ routes/                    HTTP layer: parse input → call service → serialize output
├─ services/                  Business logic: connections, chat (shared by JSON + SSE), usage
├─ providers/                 One adapter per provider behind a common interface
│  ├─ types.ts                ProviderAdapter { listModels(key), chat(key, req, onDelta?) }
│  ├─ openaiCompatible.ts     OpenAI, Mistral, Groq, DeepSeek, xAI, OpenRouter
│  ├─ anthropic.ts            Claude (official @anthropic-ai/sdk)
│  ├─ gemini.ts               Google Gemini (REST)
│  ├─ mock.ts                 Free fake provider for development
│  ├─ catalog.ts              Display metadata for each provider
│  └─ registry.ts             providerId → adapter
├─ db/                        JSON-file store + record → DTO serializers (strip secrets)
├─ lib/                       crypto (AES-GCM, masking), password (scrypt), jwt, SSE helpers, errors
└─ middleware/                auth (Bearer JWT), zod validation, error handler, logger
```

- **Key safety:** keys are validated with the provider (`listModels`) before saving, encrypted at rest, and only ever returned masked (`sk-p••••••••wxyz`).
- **Errors:** every error is returned as `{ error: { code, message, details? } }`. A rejected provider key is a **422**, never a 401, so the frontend never confuses it with an expired session.
- **Streaming:** `POST /api/conversations/:id/messages/stream` sends Server-Sent Events (`user_message` → `delta`* → `assistant_message`). If the client disconnects, the provider call is aborted and the partial answer is saved as `stopped`.

### Adding a provider
1. If it speaks the OpenAI Chat Completions protocol, add one `createOpenAICompatibleAdapter({...})` entry in `providers/registry.ts`. Otherwise, implement `ProviderAdapter` in a new file.
2. Add its metadata to `providers/catalog.ts` and its id to `ProviderId` in `types/api.ts`.
3. Run `npm run typecheck`. The `Record<ProviderId, ProviderAdapter>` type flags anything you missed.

### Limits (by design, for a starter)
The JSON store is single-process and loads everything into memory. Swap `db/store.ts` for SQLite or Postgres before real traffic. There is no refresh token or password reset.
