# QA-3 · Pass the release checklist: implementation spec

> **Story card:** [stories/QA-3-release-readiness.md](../../stories/QA-3-release-readiness.md) · **Depends on:** QA-1, QA-2 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md), SPEC.md §9

## Steps
1. Go through SPEC.md §9 line by line with the server running Mock AI. Record pass or fail per line in your report; fix the failures, or file them as new stories if they're big.
2. **Security**: after connecting a provider, search localStorage, sessionStorage, the React Query devtools cache and the console for the raw key. Send a prompt that makes Mock echo HTML or `<script>` (or check `<Markdown>` with a crafted string) and confirm it isn't executed.
3. **Performance**: with the React DevTools Profiler, stream `/long` and confirm finished `MessageBubble`s don't re-render. Check that `yarn build` emits a separate chunk per page and that `@mui/x-charts` and `react-markdown` aren't in the entry chunk.
4. **README**: rewrite `client/README.md`. Keep the existing "Project structure" and "Rules" sections, remove the Vite template boilerplate, and add prerequisites, setup (`yarn`, `.env`), scripts, how to run against the server, Mock AI tips, and a link to `../implementation-specs/`.
5. Final run: `yarn lint && yarn test && yarn build`, zero warnings.

## Acceptance criteria
- [ ] A §9 pass/fail table with every line passing.
- [ ] The security and performance checks are documented as passing.
- [ ] The README is updated.
- [ ] All scripts are green.

## Out of scope
- Future ideas from SPEC.md §10.
