import type { RouteObject } from 'react-router';
import { lazyPage } from '@/shared/lib/lazyPage';

// Lazy so the page ships in its own chunk; `.preload()` warms it up from nav links.
export const DashboardPage = lazyPage(() => import('./pages/DashboardPage'), (m) => m.DashboardPage);

export const homeRoutes: RouteObject[] = [{ index: true, Component: DashboardPage }];
