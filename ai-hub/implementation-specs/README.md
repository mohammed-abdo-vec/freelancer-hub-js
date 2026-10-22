# Implementation specs

One folder per story: `<STORY-ID>-<slug>/SPEC.md`. Each one is a self-contained handover for an AI coding assistant (or a developer) to implement **that story only**. The matching board card is in [`../stories/`](../stories/).

- [CONVENTIONS.md](CONVENTIONS.md): architecture, folder mapping and rules shared by every spec. **Read it first.**
- [_TEMPLATE.md](_TEMPLATE.md): the shape of a new spec.
- Build order and status: [../stories/README.md](../stories/README.md).

## Handover prompt
Copy this into a fresh Claude session and replace the story ID:

```text
You are a senior frontend engineer working in ai-hub/client.

Read, in this order:
1. ai-hub/implementation-specs/CONVENTIONS.md
2. ai-hub/implementation-specs/<STORY-ID>-<slug>/SPEC.md
3. The SPEC.md sections it references, and the existing files it lists under "Current state".

Implement this story only, exactly as specified. Do not touch ai-hub/server.
When done: run `npm run lint` and `npm run build` in ai-hub/client and fix every issue,
then go through the "Acceptance criteria" list, report pass/fail for each, and stop.
```

## Workflow per story
1. Move the card to **In Progress** (and set `status:` in the story file if you track it in git).
2. Hand the spec to the AI with the prompt above.
3. Run the **Verify** steps yourself.
4. Commit, for example `feat(auth): AUTH-1 register`, and move the card to **Done**.

Only start a story after everything in its `Depends on` list is done.
