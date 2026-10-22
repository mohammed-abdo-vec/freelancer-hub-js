# CHAT-6 · Recover from failed answers: implementation spec

> **Story card:** [stories/CHAT-6-recoverable-errors.md](../../stories/CHAT-6-recoverable-errors.md) · **Depends on:** CHAT-2 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Behavior to know
- Provider failures inside a stream arrive as `assistant_message` with `status: 'error'` and are **saved** (they survive a reload). The server leaves them out of the model context, so retrying is safe.
- `CONNECTION_REQUIRED` is a **pre-flight** 409 (thrown as a `StreamHttpError` by `streamMessage`).

## Files
| Action | Path | What |
|---|---|---|
| modify | `src/features/chat/components/MessageBubble.tsx` | the error alert gets an `action` Retry button (shown only on the **last** message, so old errors don't invite confusing retries) |
| create | `src/features/chat/components/ConnectionRequiredAlert.tsx` | `Alert severity="warning"` + `Button component={RouterLink} to={paths.providers}` "Connect provider" |
| modify | `src/features/chat/hooks/useChatStream.ts` | keep the pre-flight `error` (with code) in state; add `clearError()` |
| modify | `src/features/chat/pages/ChatPage.tsx` | pass `onRetry`; render `ConnectionRequiredAlert` above the composer when `error.code === 'CONNECTION_REQUIRED'` |

## Steps
1. `onRetry(errorMessage)`: find the nearest preceding `role: 'user'` message and call `send(thatMessage.content)`. Disable Retry while streaming.
2. 429 (`PROVIDER_RATE_LIMITED` / `RATE_LIMITED`): this one is saved as an error message too, so append the hint "Wait a moment and try again." to the alert.
3. The 409 alert names the provider: "Mock AI isn't connected. Connect it to keep chatting." Dismiss it on the next successful send or with `clearError`.
4. Other pre-flight errors stay as snackbars (CHAT-2).

## Acceptance criteria
- [ ] `/error` shows an error alert with Retry. Retry re-sends `/error` (and errors again, as expected). Sending something normal afterwards works.
- [ ] `/ratelimit` shows the rate-limit message with the wait hint.
- [ ] Removing the Mock connection (PROV-5) and sending shows the "Connect provider" alert linking to `/providers`.
- [ ] The error messages are still there after a reload.

## Verify
Run each of the three cases with Mock AI.

## Out of scope
- The no-connection empty state on `/chat` (CHAT-12).
