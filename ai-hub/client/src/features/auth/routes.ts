import type { RouteObject } from 'react-router';
import { paths } from '@/shared/config/paths';
import { lazyPage } from '@/shared/lib/lazyPage';

// Lazy so each page ships in its own chunk.
const LoginPage = lazyPage(() => import('./pages/LoginPage'), (m) => m.LoginPage);
const RegisterPage = lazyPage(() => import('./pages/RegisterPage'), (m) => m.RegisterPage);

/** Full-screen routes, rendered outside the app shell. */
export const authRoutes: RouteObject[] = [
  { path: paths.login, Component: LoginPage },
  { path: paths.register, Component: RegisterPage },
];
