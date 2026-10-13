import { Suspense } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { useIsAuthenticated } from '../store/authStore';
import { useLogout, useMe } from '../features/auth/hooks';
import { DebugPanel } from './DebugPanel';
import { Spinner } from './Spinner';

export function Layout() {
  return (
    <div className="app">
      <Navbar />
      <main className="container">
        {/* Pages are lazy-loaded (routes/index.jsx). While a page's JS file
            downloads, its component "suspends" and this fallback shows. */}
        <Suspense fallback={<Spinner label="Loading page…" />}>
          <Outlet />
        </Suspense>
      </main>
      <DebugPanel />
    </div>
  );
}

function Navbar() {
  const isAuthenticated = useIsAuthenticated();
  const { data: user } = useMe();
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => navigate('/login', { replace: true }),
    });
  };

  return (
    <header className="nav">
      <div className="container nav__inner">
        <NavLink to="/" className="nav__brand">
          🔐 AuthFlow
        </NavLink>

        <nav className="nav__links">
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/profile">Profile</NavLink>
              <NavLink to="/admin">Admin</NavLink>
              <span className="nav__user">
                {user ? user.name : '…'}
                {user && <span className={`badge badge--${user.role}`}>{user.role}</span>}
              </span>
              <button className="btn btn--ghost" onClick={handleLogout} disabled={logout.isPending}>
                {logout.isPending ? 'Logging out…' : 'Log out'}
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/register" className="btn btn--primary">
                Sign up
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
