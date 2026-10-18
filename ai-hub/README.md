# AI Hub

Manage all your AI tools in one place: connect provider API keys (OpenAI, Anthropic, Gemini, Mistral, Groq, DeepSeek, xAI, OpenRouter), chat with any model, compare answers side by side, and track token usage.

| Folder | Status | What it is |
|---|---|---|
| [`server/`](server/) | ✅ Complete | Express 5 + TypeScript API: auth, encrypted key storage, provider adapters, streaming chat, compare, usage |
| `client/` | 🛠 To build | React + TypeScript + MUI frontend, specified in **[SPEC.md](SPEC.md)** |

## Quick start

```bash
cd server
npm install
cp .env.example .env
npm run seed     # demo@aihub.dev / password123, with the free "Mock AI" provider connected
npm run dev      # → http://localhost:4000/api/health
```

Then build the frontend phase by phase by following [SPEC.md §8](SPEC.md#8-implementation-plan).

No API keys? Connect the **Mock AI** provider with any key that starts with `mock-`. It streams realistic Markdown replies, and `/long`, `/error` and `/ratelimit` simulate edge cases.
