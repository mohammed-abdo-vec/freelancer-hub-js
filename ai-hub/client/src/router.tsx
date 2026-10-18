import { createBrowserRouter } from 'react-router';
import { AppShell } from '@/components/layout/AppShell';
import { RootLayout } from '@/components/routing/RootLayout';
import { RouteError } from '@/components/routing/RouteError';
import * as pages from '@/routes/pages';
import { paths } from '@/routes/paths';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      // Full-screen pages, no shell
      { path: paths.login, element: <pages.LoginPage /> },
      { path: paths.register, element: <pages.RegisterPage /> },

      // Everything else lives inside the sidebar shell
      {
        element: <AppShell />,
        errorElement: <RouteError />,
        children: [
          { index: true, element: <pages.DashboardPage /> },
          { path: paths.chat, element: <pages.ChatPage /> },
          { path: '/chat/:conversationId', element: <pages.ChatPage /> },
          { path: paths.compare, element: <pages.ComparePage /> },
          { path: paths.providers, element: <pages.ProvidersPage /> },
          { path: paths.settings, element: <pages.SettingsPage /> },
        ],
      },

      { path: '*', element: <pages.NotFoundPage /> },
    ],
  },
]);
