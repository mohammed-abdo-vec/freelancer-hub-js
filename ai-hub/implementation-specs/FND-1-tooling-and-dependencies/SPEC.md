# FND-1 · Finish client tooling and install dependencies: implementation spec

> **Story card:** [stories/FND-1-tooling-and-dependencies.md](../../stories/FND-1-tooling-and-dependencies.md) · **Depends on:** none · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Goal
The client has every dependency, script and config later stories need, and the dev server can reach the API through `/api`.

## Current state
- `client/` was scaffolded with Vite (React + TS). It uses **yarn** (`yarn.lock`), so keep using yarn.
- Installed so far: React 19, MUI 9 + icons, Emotion, react-router 7, `@fontsource/roboto` (FND-2 replaces it).
- `vite.config.ts` has the `@` alias but **no proxy**. `tsconfig.app.json` already has `paths: { "@/*": ["./src/*"] }`.
- `package.json` scripts: `dev`, `build`, `lint`, `preview`. There's no Prettier, Vitest or `.env.example`.

## Files
| Action | Path | What |
|---|---|---|
| modify | `client/package.json` | dependencies + scripts |
| modify | `client/vite.config.ts` | `server.proxy`, Vitest `test` block |
| create | `client/.prettierrc.json`, `client/.prettierignore` | formatter config |
| create | `client/.env.example` | `VITE_API_URL=/api` |
| create | `client/src/shared/types/api.ts` | verbatim copy of `server/src/types/api.ts` |
| create | `client/src/test/setup.ts` | `import '@testing-library/jest-dom/vitest';` |
| modify | `client/src/vite-env.d.ts` (create it if missing) | type `ImportMetaEnv.VITE_API_URL?: string` |

## Steps
1. Install runtime packages: `@mui/x-charts @fontsource-variable/inter @tanstack/react-query @tanstack/react-query-devtools axios zustand react-hook-form zod @hookform/resolvers notistack react-markdown remark-gfm rehype-highlight highlight.js dayjs`.
2. Install dev packages: `prettier vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom`.
3. Check that the MUI X Charts major version is compatible with the installed `@mui/material` major. If it isn't, use the newest compatible version and say so in your report.
4. In `vite.config.ts`, add `server: { proxy: { '/api': 'http://localhost:4000' } }` and `test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'], globals: false }`. Use `defineConfig` from `vitest/config`, or a triple-slash reference, so the types check.
5. Scripts: `"format": "prettier --write ."`, `"format:check": "prettier --check ."`, `"test": "vitest run"`, `"test:watch": "vitest"`.
6. Prettier: `{ "singleQuote": true, "printWidth": 110 }`. Ignore `dist` and `node_modules`. Then run `format` once so the existing files match (some files currently use double quotes).
7. Copy `server/src/types/api.ts` exactly as it is (including the header comment).
8. Make sure `client/.gitignore` ignores `dist` and `.env`.

## Acceptance criteria
- [ ] Every package from SPEC.md §4 is installed.
- [ ] `/api` is proxied to `http://localhost:4000`.
- [ ] Prettier is configured; `dev`, `build`, `lint`, `format` and `test` scripts exist.
- [ ] `src/shared/types/api.ts` is byte-for-byte equal to the server file (`diff` prints nothing).
- [ ] `.env.example` exists.
- [ ] `yarn dev`, `yarn build` and `yarn lint` succeed. `yarn test` runs (exiting with "no tests" is fine, or add `passWithNoTests: true`).

## Verify
1. Start the server, then `yarn dev`. Opening `http://localhost:5173/api/health` returns `{"status":"ok",…}`.
2. `diff ../server/src/types/api.ts src/shared/types/api.ts` prints nothing.

## Out of scope
- Theme or font changes (FND-2), providers and query client (FND-3), axios instance (FND-4).
