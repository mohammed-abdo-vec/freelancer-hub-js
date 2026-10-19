import type { RouteObject } from 'react-router';
import { paths } from '@/shared/config/paths';
import { lazyPage } from '@/shared/lib/lazyPage';

// Lazy so the page ships in its own chunk; `.preload()` warms it up from nav links.
export const SettingsPage = lazyPage(() => import('./pages/SettingsPage'), (m) => m.SettingsPage);

export const settingsRoutes: RouteObject[] = [{ path: paths.settings, Component: SettingsPage }];
