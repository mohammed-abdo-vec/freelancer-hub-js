# AI Hub client

## Project structure (feature-based)

```
src/
├─ main.tsx                 # entry: renders <App/>
├─ app/                     # composition root: wires features + shared together
│  ├─ App.tsx               # providers (theme, router)
│  ├─ router.tsx            # mounts each feature's routes inside the shell
│  ├─ navigation.ts         # sidebar links
│  └─ components/           # RootLayout, RouteError, NotFoundPage
├─ features/                # one folder per product area
│  └─ <feature>/
│     ├─ index.ts           # PUBLIC API: the only file other layers may import
│     ├─ routes.ts          # lazy pages + RouteObject[] for this feature
│     ├─ pages/             # route-level components (each its own chunk)
│     ├─ components/        # UI used only by this feature
│     ├─ hooks/ api/ data/ types.ts ...  # add as the feature needs them
└─ shared/                  # reusable by every feature, knows nothing about them
   ├─ layout/               # AppShell (sidebar + content), exposes slots + useSideNav()
   ├─ theme/                # MUI theme + AppThemeProvider
   ├─ components/           # generic UI (LoadingScreen, PagePlaceholder, ...)
   ├─ hooks/                # useDocumentTitle, useLocalStorageState, ...
   ├─ lib/                  # framework helpers (lazyPage)
   ├─ config/               # paths
   └─ assets/
```

### Rules (enforced by ESLint `no-restricted-imports`)
- Dependencies point one way: `app → features → shared`.
- `shared/` never imports from `features/` or `app/`. If shared UI needs feature content, it takes it as a prop/slot (see `AppShell`'s `content` and `footer`).
- A feature imports another feature only through `@/features/<name>` (its `index.ts`), never `@/features/<name>/...`.
- Inside a feature, use relative imports (`../components/Composer`).
- Pages are exported from `routes.ts` wrapped in `lazyPage()`, so each page stays in its own chunk. Don't re-export a page module directly from `index.ts`, or it lands in the main bundle.

### Adding a feature
1. Create `src/features/<name>/pages/<Name>Page.tsx`.
2. Add `routes.ts` with `lazyPage(...)` and a `RouteObject[]`, and export both from `index.ts`.
3. Spread the routes into `app/router.tsx`; add a sidebar link in `app/navigation.ts` if needed.

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
