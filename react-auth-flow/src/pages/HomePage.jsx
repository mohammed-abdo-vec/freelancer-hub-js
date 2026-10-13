import { Link } from 'react-router';
import { useIsAuthenticated } from '../store/authStore';

const STEPS = [
  ['Log in', 'POST /auth/login → server returns an access token (JSON) and sets a refresh token (httpOnly cookie).'],
  ['Store', 'Access token → Zustand (memory only). User object → React Query cache.'],
  ['Request', 'Axios adds "Authorization: Bearer <token>" to every request.'],
  ['Expire', 'After 30s the server answers 401. The interceptor calls /auth/refresh, then retries.'],
  ['Reload', 'Memory is wiped, but the cookie survives. On startup we call /auth/refresh to restore the session.'],
  ['Log out', 'POST /auth/logout kills the refresh token. We clear Zustand AND the React Query cache.'],
];

export function HomePage() {
  const isAuthenticated = useIsAuthenticated();
  return (
    <section className="card">
      <p className="eyebrow">Lesson demo</p>
      <h1>Auth flow with Zustand + React Query</h1>
      <p className="muted">
        A complete login flow: register, login, protected routes, roles, silent token refresh, session restore on
        reload and logout. Keep the debug panel open to watch it happen.
      </p>

      <ol className="steps">
        {STEPS.map(([title, text], i) => (
          <li key={title}>
            <span className="steps__num">{i + 1}</span>
            <div>
              <strong>{title}</strong>
              <p className="muted">{text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="row">
        {isAuthenticated ? (
          <Link to="/dashboard" className="btn btn--primary">
            Go to dashboard
          </Link>
        ) : (
          <>
            <Link to="/login" className="btn btn--primary">
              Log in
            </Link>
            <Link to="/dashboard" className="btn btn--ghost">
              Try a protected page
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
