import { lazyPage } from './lazyPage';

// Every page is its own chunk; only the shell ships in the main bundle.
export const DashboardPage = lazyPage(() => import('@/features/home/DashboardPage'), (m) => m.DashboardPage);
export const ChatPage = lazyPage(() => import('@/features/chat/ChatPage'), (m) => m.ChatPage);
export const ComparePage = lazyPage(() => import('@/features/compare/ComparePage'), (m) => m.ComparePage);
export const ProvidersPage = lazyPage(
  () => import('@/features/app-keys-config/ProvidersPage'),
  (m) => m.ProvidersPage,
);
export const SettingsPage = lazyPage(() => import('@/features/settings/SettingsPage'), (m) => m.SettingsPage);
export const LoginPage = lazyPage(() => import('@/features/auth/LoginPage'), (m) => m.LoginPage);
export const RegisterPage = lazyPage(() => import('@/features/auth/RegisterPage'), (m) => m.RegisterPage);
export const NotFoundPage = lazyPage(() => import('@/features/NotFoundPage'), (m) => m.NotFoundPage);
