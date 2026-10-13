// =============================================================================
//  The route map as plain objects — the format useRoutes() takes.
//
//  Same shape as <Route> JSX:  <Route path element>  →  { path, element }
//                              nested <Route>s       →  children: [...]
//
//  Guards are "layout routes": no path, just an element that renders
//  <Outlet /> (the matched child) or redirects.
//
//  CODE SPLITTING: every page is React.lazy(() => import(...)), so Vite puts
//  each one in its own JS file, downloaded the first time you visit that page.
//  A student never downloads AdminPage. The <Suspense> fallback lives in
//  Layout.jsx around <Outlet />, so the navbar stays put while a page loads.
// =============================================================================
import { lazy } from 'react';
import { Layout } from '../components/Layout';
import { GuestOnly, RequireAuth, RequireRole } from '../components/RouteGuards';

// React.lazy wants a module with a DEFAULT export. Our pages use named
// exports, so we pick the named one and hand it over as `default`.
const lazyPage = (load, name) => lazy(() => load().then((module) => ({ default: module[name] })));

const HomePage = lazyPage(() => import('../pages/HomePage'), 'HomePage');
const LoginPage = lazyPage(() => import('../pages/LoginPage'), 'LoginPage');
const RegisterPage = lazyPage(() => import('../pages/RegisterPage'), 'RegisterPage');
const DashboardPage = lazyPage(() => import('../pages/DashboardPage'), 'DashboardPage');
const ProfilePage = lazyPage(() => import('../pages/ProfilePage'), 'ProfilePage');
const AdminPage = lazyPage(() => import('../pages/AdminPage'), 'AdminPage');
const NotFoundPage = lazyPage(() => import('../pages/NotFoundPage'), 'NotFoundPage');

export const routes = [
  {
    element: <Layout />,
    children: [
      // Public
      { index: true, element: <HomePage /> },

      // Only for logged-OUT users
      {
        element: <GuestOnly />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
        ],
      },

      // Only for logged-IN users
      {
        element: <RequireAuth />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'profile', element: <ProfilePage /> },

          // Logged in AND role === 'admin'
          {
            element: <RequireRole role="admin" />,
            children: [{ path: 'admin', element: <AdminPage /> }],
          },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
