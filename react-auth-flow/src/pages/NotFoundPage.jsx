import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <section className="card">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <Link to="/">Go home</Link>
    </section>
  );
}
