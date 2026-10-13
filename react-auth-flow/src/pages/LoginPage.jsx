import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useLogin } from '../features/auth/hooks';
import { useAuthStore } from '../store/authStore';
import { getErrorMessage } from '../lib/http';

const DEMO_USERS = [
  { label: 'Student', email: 'student@demo.dev' },
  { label: 'Teacher (admin)', email: 'teacher@demo.dev' },
];

export function LoginPage() {
  const lastEmail = useAuthStore((s) => s.lastEmail); // persisted in localStorage
  const [email, setEmail] = useState(lastEmail);
  const [password, setPassword] = useState('');

  const login = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  // Where RequireAuth bounced us from (e.g. /admin). Default: dashboard.
  const from = location.state?.from?.pathname ?? '/dashboard';

  const handleSubmit = (e) => {
    e.preventDefault();
    login.mutate(
      { email, password },
      { onSuccess: () => navigate(from, { replace: true }) },
    );
  };

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <section className="card card--narrow">
      <p className="eyebrow">Welcome back</p>
      <h1>Log in</h1>
      {location.state?.from && (
        <p className="notice">
          You need to log in to see <code>{from}</code>.
        </p>
      )}

      <form onSubmit={handleSubmit} className="form">
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {/* mutation.isError / mutation.error come for free from useMutation */}
        {login.isError && <p className="form__error">{getErrorMessage(login.error)}</p>}

        <button className="btn btn--primary btn--block" disabled={login.isPending}>
          {login.isPending ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <div className="demo">
        <span className="muted">Demo accounts:</span>
        {DEMO_USERS.map((u) => (
          <button key={u.email} type="button" className="btn btn--ghost btn--sm" onClick={() => fillDemo(u.email)}>
            {u.label}
          </button>
        ))}
      </div>

      <p className="muted">
        No account? <Link to="/register">Create one</Link>
      </p>
    </section>
  );
}
