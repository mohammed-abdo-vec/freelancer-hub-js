import type { RouteObject } from 'react-router';
import { paths } from '@/shared/config/paths';
import { lazyPage } from '@/shared/lib/lazyPage';

// Lazy so the page ships in its own chunk; `.preload()` warms it up from nav links.
export const ComparePage = lazyPage(() => import('./pages/ComparePage'), (m) => m.ComparePage);

export const compareRoutes: RouteObject[] = [{ path: paths.compare, Component: ComparePage }];
