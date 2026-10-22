---
id: FND-1
title: Finish client tooling and install dependencies
epic: Foundation
type: Task
priority: Highest
points: 2
status: To Do
depends_on: []
labels: [foundation, tooling]
spec: ../implementation-specs/FND-1-tooling-and-dependencies/SPEC.md
---

# FND-1 · Finish client tooling and install dependencies

**As a** developer **I want** every library, script and dev-server setting in place **so that** feature stories only have to write feature code.

## Acceptance criteria
- [ ] Every package from SPEC.md §4 is installed (latest stable).
- [ ] The Vite dev server proxies `/api` to `http://localhost:4000`.
- [ ] Prettier is configured (`singleQuote`, `printWidth: 110`), with `dev`, `build`, `lint`, `format` and `test` scripts.
- [ ] `src/shared/types/api.ts` is a verbatim copy of `server/src/types/api.ts`.
- [ ] `.env.example` contains `VITE_API_URL=/api`.
- [ ] `npm run dev`, `npm run build` and `npm run lint` all work.

## Out of scope
- Using any of the new libraries (that's what later stories do).

**Source:** SPEC.md §4, §8 Phase 1
