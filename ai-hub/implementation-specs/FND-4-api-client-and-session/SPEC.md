# FND-4 · Add API client, error helpers and session store: implementation spec

> **Story card:** [stories/FND-4-api-client-and-session.md](../../stories/FND-4-api-client-and-session.md) · **Depends on:** FND-1, FND-3 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Goal
The shared plumbing every feature uses to call the API.

## API
- Every error has the shape `ApiError = { error: { code, message, details? } }`, and `message` is always safe to show.
- `details: ValidationIssue[]` (`{ path, message }`) is present on 400 `VALIDATION_ERROR`.

## Files
| Action | Path | What |
|---|---|---|
| create | `src/shared/stores/auth.store.ts` | zustand + persist |
| create | `src/shared/api/client.ts` | axios instance + interceptors |
| create | `src/shared/api/errors.ts` | error helpers |

## Steps
1. **auth.store.ts**
   ```ts
   interface AuthState {
     token: string | null;
     user: User | null;
     setSession(token: string, user: User): void;
     setUser(user: User): void;          // used by AUTH-3 and SET-1
     clearSession(): void;
   }
   ```
   Use `persist` with `name: 'ai-hub-auth'` and persist only `token` and `user`. Export `useAuthStore`.
2. **client.ts**: follow SPEC.md §7.1.
   - `baseURL: import.meta.env.VITE_API_URL ?? '/api'`. Also export `API_URL` (streaming in CHAT-2 needs it).
   - The request interceptor reads `useAuthStore.getState().token`.
   - The response interceptor: if the status is 401 and the URL doesn't include `/auth/login`, call `clearSession()` and `enqueueSnackbar('Session expired, please sign in again', { variant: 'warning', preventDuplicate: true })` (import `enqueueSnackbar` from `notistack`). Guard against a burst of parallel 401s with a module-level flag that resets after about 2 s.
   - Always `Promise.reject(error)`.
3. **errors.ts**: follow SPEC.md §7.2.
   - `isApiError(value: unknown): value is ApiError`, a structural check.
   - `getApiError(err)` returns `err.response.data.error` for axios errors, or the payload of a non-axios `{ status, body: ApiError }` error (the stream error class in CHAT-2 will use this shape: give it a `.apiError` property and check for it here). Otherwise `null`.
   - `getErrorStatus(err): number | undefined`.
   - `getErrorMessage(err, fallback = 'Something went wrong')`: API message, then `Error.message` for network errors ("Network Error" → "Can't reach the server"), then the fallback.
   - `getFieldErrors(err): Record<string, string>` maps `details[]` to `{ [path]: message }`, keeping the first message per path.
4. Switch `queryClient.ts` (FND-3) to use `getErrorStatus` from `errors.ts`.

## Acceptance criteria
- [ ] Requests carry the bearer token once a token is in the store.
- [ ] A 401 (not from login) clears the store and shows exactly one snackbar, even for 3 parallel 401s.
- [ ] A 401 from `/auth/login` is passed through untouched.
- [ ] The helpers return the right values for an axios `ApiError`, a network error and a plain `Error`.
- [ ] localStorage `ai-hub-auth` holds only `token` and `user`.

## Verify
In the browser console (temporarily expose `api` on `window` in dev, then remove it): `api.get('/auth/me')` with a fake token gives one snackbar and the store is cleared. `yarn lint && yarn build`. Unit tests for `errors.ts` come in QA-2.

## Out of scope
- Redirecting to `/login` (AUTH-4/AUTH-6). Auth API functions (AUTH-1/2).
