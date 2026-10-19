import type { RouteObject } from 'react-router';
import { paths } from '@/shared/config/paths';
import { lazyPage } from '@/shared/lib/lazyPage';

// Lazy so the page ships in its own chunk; `.preload()` warms it up from nav links.
export const ProvidersPage = lazyPage(() => import('./pages/ProvidersPage'), (m) => m.ProvidersPage);

export const providersRoutes: RouteObject[] = [{ path: paths.providers, Component: ProvidersPage }];
