import { useMe } from '../features/auth/hooks';
import { useAuthStore } from '../store/authStore';
import { Spinner } from '../components/Spinner';

// A JWT is three base64url chunks: header.payload.signature
// Anyone can READ the payload — it's encoded, NOT encrypted.
// The signature only proves the server made it and nobody changed it.
function decodeJwt(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function ProfilePage() {
  const { data: user, isPending } = useMe();
  const accessToken = useAuthStore((s) => s.accessToken);

  if (isPending) return <Spinner />;

  const payload = accessToken ? decodeJwt(accessToken) : null;

  return (
    <section className="card">
      <p className="eyebrow">Profile</p>
      <h1>{user.name}</h1>

      <dl className="details">
        <dt>Email</dt>
        <dd>{user.email}</dd>
        <dt>Role</dt>
        <dd>
          <span className={`badge badge--${user.role}`}>{user.role}</span>
        </dd>
        <dt>User id</dt>
        <dd className="mono">{user.id}</dd>
      </dl>

      <h2>What's inside your access token?</h2>
      <p className="muted">
        Decoded right here in the browser, no secret needed. That's why you never put passwords or private data
        in a JWT.
      </p>
      <pre className="code">
        {payload
          ? JSON.stringify(
              {
                ...payload,
                iat: `${payload.iat}  (${new Date(payload.iat * 1000).toLocaleTimeString()})`,
                exp: `${payload.exp}  (${new Date(payload.exp * 1000).toLocaleTimeString()})`,
              },
              null,
              2,
            )
          : 'Token is not a valid JWT (did you press "Break token"?)'}
      </pre>
    </section>
  );
}
