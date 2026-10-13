// =============================================================================
//  The route map. Guards are "layout routes": they wrap a group of pages
//  and decide whether to render them (<Outlet />) or redirect.
// =============================================================================
import { Link, Route, Routes } from 'react-router';
import { Layout } from './components/Layout';
import { GuestOnly, RequireAuth, RequireRole } from './components/RouteGuards';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route index element={<HomePage />} />

        {/* Only for logged-OUT users */}
        <Route element={<GuestOnly />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* Only for logged-IN users */}
        <Route element={<RequireAuth />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />

          {/* Logged in AND role === 'admin' */}
          <Route element={<RequireRole role="admin" />}>
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Route>

        <Route
          path="*"
          element={
            <section className="card">
              <h1>404</h1>
              <Link to="/">Go home</Link>
            </section>
          }
        />
      </Route>
    </Routes>
  );
}
