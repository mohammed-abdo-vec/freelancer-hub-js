import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useRegister } from '../features/auth/hooks';
import { getErrorMessage, getFieldErrors } from '../lib/http';

export function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const register = useRegister();
  const navigate = useNavigate();

  // The server validates and returns { errors: { email: '...' } } on 400/409.
  const fieldErrors = getFieldErrors(register.error);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Registering also logs you in: the server returns a session right away.
    register.mutate(form, { onSuccess: () => navigate('/dashboard', { replace: true }) });
  };

  return (
    <section className="card card--narrow">
      <p className="eyebrow">New here?</p>
      <h1>Create an account</h1>

      {/* noValidate: skip browser validation so students can see SERVER validation errors */}
      <form onSubmit={handleSubmit} className="form" noValidate>
        <Field label="Name" error={fieldErrors.name}>
          <input value={form.name} onChange={update('name')} autoComplete="name" />
        </Field>
        <Field label="Email" error={fieldErrors.email}>
          <input type="email" value={form.email} onChange={update('email')} autoComplete="email" />
        </Field>
        <Field label="Password" error={fieldErrors.password} hint="At least 8 characters">
          <input type="password" value={form.password} onChange={update('password')} autoComplete="new-password" />
        </Field>

        {register.isError && <p className="form__error">{getErrorMessage(register.error)}</p>}

        <button className="btn btn--primary btn--block" disabled={register.isPending}>
          {register.isPending ? 'Creating account…' : 'Sign up'}
        </button>
      </form>

      <p className="muted">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </section>
  );
}

function Field({ label, error, hint, children }) {
  return (
    <label className={error ? 'has-error' : ''}>
      {label}
      {children}
      {error ? <small className="field__error">{error}</small> : hint && <small className="muted">{hint}</small>}
    </label>
  );
}
