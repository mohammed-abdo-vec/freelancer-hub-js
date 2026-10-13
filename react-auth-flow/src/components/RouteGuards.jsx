// =============================================================================
//  Route guards = layout routes that render <Outlet /> (the child page)
//  or redirect somewhere else.
//
//    <RequireAuth />      logged in?          no → /login (remember where they were going)
//    <GuestOnly />        logged OUT?         no → /dashboard (no login page for logged-in users)
//    <RequireRole />      right role?         no → "403 Forbidden" message
//
//  ⚠️ Guards are UX, not security. Anyone can edit the JS in their browser.
//  The real protection is the server answering 401/403.
// =============================================================================
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStatus } from '../store/authStore';
import { useMe } from '../features/auth/hooks';
import { Spinner } from './Spinner';

export function RequireAuth() {
  const status = useAuthStatus();
  const location = useLocation();

  if (status === 'checking') return <Spinner />;
  if (status === 'guest') {
    // `state.from` lets the login page send them back here afterwards.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

export function GuestOnly() {
  const status = useAuthStatus();
  if (status === 'checking') return <Spinner />;
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export function RequireRole({ role }) {
  const { data: user, isPending } = useMe();
  if (isPending) return <Spinner label="Checking permissions…" />;
  if (user?.role !== role) {
    return (
      <section className="card">
        <p className="eyebrow">403 — Forbidden</p>
        <h1>Not for you, {user?.name.split(' ')[0]}</h1>
        <p className="muted">
          You are logged in (so this is not a 401), but your role is <code>{user?.role}</code> and this page
          needs <code>{role}</code>.
        </p>
      </section>
    );
  }
  return <Outlet />;
}
