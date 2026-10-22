# FND-3 · Add query client, snackbars and query keys: implementation spec

> **Story card:** [stories/FND-3-app-providers.md](../../stories/FND-3-app-providers.md) · **Depends on:** FND-1 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Goal
App-wide providers exist, so any feature can `useQuery`, `useMutation` and `enqueueSnackbar`.

## Current state
`src/app/App.tsx` renders `<AppThemeProvider><RouterProvider router={router} /></AppThemeProvider>`. There's no data layer yet.

## Files
| Action | Path | What |
|---|---|---|
| create | `src/shared/api/queryClient.ts` | exported `queryClient` singleton |
| create | `src/shared/api/queryKeys.ts` | key factory (SPEC.md §5.5) |
| modify | `src/app/App.tsx` | provider tree |

## Steps
1. `queryClient.ts`:
   ```ts
   export const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         staleTime: 30_000,
         refetchOnWindowFocus: false,
         retry: (count, err) => count < 2 && (getStatus(err) ?? 0) >= 500,
       },
     },
   });
   ```
   `getStatus` reads `err.response.status` when `axios.isAxiosError(err)`, otherwise `undefined`. Keep it local to this file, because `errors.ts` arrives in FND-4.
   The singleton is exported so that sign-out (AUTH-5) can call `queryClient.clear()`.
2. `queryKeys.ts`: copy SPEC.md §5.5 verbatim, typed with `ProviderId` from `@/shared/types/api`.
3. `App.tsx` order (outer → inner): `AppThemeProvider` → `QueryClientProvider` → `SnackbarProvider` (`maxSnack={3}`, `anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}`, `autoHideDuration={4000}`) → `RouterProvider`. Add `ReactQueryDevtools` only when `import.meta.env.DEV`.
4. If notistack's default colors clash with the theme, pass `Components` or `sx` overrides that use theme tokens. Don't use hex.

## Acceptance criteria
- [ ] `QueryClientProvider` is mounted with the defaults above, and `queryClient` is exported.
- [ ] Devtools show in `yarn dev` and are absent from `yarn build` output.
- [ ] Temporarily calling `enqueueSnackbar('Hello', { variant: 'success' })` shows a themed snackbar (remove the call afterwards).
- [ ] `queryKeys` matches SPEC.md §5.5.

## Verify
`yarn dev`, open the devtools button, then `yarn lint && yarn build`.

## Out of scope
- Axios instance and error helpers (FND-4).
