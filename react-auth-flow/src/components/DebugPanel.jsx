// =============================================================================
//  Classroom-only panel (bottom right). Lets you SEE the invisible parts:
//  the token, its countdown, and every request / 401 / refresh / retry.
//  Delete this file and its <DebugPanel /> in Layout.jsx for a "real" app.
// =============================================================================
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '../store/authStore';
import { useDebugLog } from '../store/debugStore';
import { http } from '../lib/http';
import { authKeys } from '../features/auth/hooks';

export function DebugPanel() {
  const [open, setOpen] = useState(true);
  // Picking several values as an object? Wrap the selector in useShallow.
  // Without it the selector returns a NEW object every time → Zustand v5 thinks
  // the state changed every render → "Maximum update depth exceeded".
  const { status, accessToken, expiresAt } = useAuthStore(
    useShallow((s) => ({ status: s.status, accessToken: s.accessToken, expiresAt: s.expiresAt })),
  );
  const entries = useDebugLog((s) => s.entries);
  const clear = useDebugLog((s) => s.clear);
  const queryClient = useQueryClient();
  const secondsLeft = useSecondsUntil(expiresAt);

  // Simulates "the token got corrupted / expired" → next request gets 401 → refresh.
  const breakToken = () => useAuthStore.setState({ accessToken: 'this.is.broken' });

  // Kills the refresh token on the server but keeps the access token here.
  // Requests work until the access token expires, then refresh fails → logout.
  const revokeOnServer = () => http.post('/auth/logout');

  const refetchMe = () => queryClient.invalidateQueries({ queryKey: authKeys.me });

  if (!open) {
    return (
      <button className="debug debug--closed" onClick={() => setOpen(true)}>
        🛠 Debug
      </button>
    );
  }

  return (
    <aside className="debug">
      <header className="debug__head">
        <strong>🛠 Auth debug</strong>
        <button onClick={() => setOpen(false)} aria-label="Close debug panel">
          ×
        </button>
      </header>

      <dl className="debug__grid">
        <dt>status</dt>
        <dd>
          <span className={`pill pill--${status}`}>{status}</span>
        </dd>
        <dt>token</dt>
        <dd className="mono">{accessToken ? `${accessToken.slice(0, 18)}…` : '—'}</dd>
        <dt>expires</dt>
        <dd className={secondsLeft !== null && secondsLeft <= 0 ? 'danger' : ''}>
          {secondsLeft === null ? '—' : secondsLeft > 0 ? `in ${secondsLeft}s` : 'expired (next request will refresh)'}
        </dd>
      </dl>

      {status === 'authenticated' && (
        <div className="debug__actions">
          <button onClick={refetchMe}>Refetch /me</button>
          <button onClick={breakToken}>Break token</button>
          <button onClick={revokeOnServer}>Revoke refresh</button>
        </div>
      )}

      <div className="debug__logHead">
        <span>Network log</span>
        <button onClick={clear}>clear</button>
      </div>
      <ol className="debug__log">
        {entries.length === 0 && <li className="muted">No requests yet</li>}
        {entries.map((e) => (
          <li key={e.id} className={`log log--${e.kind}`}>
            <time>{e.at.toLocaleTimeString([], { hour12: false })}</time>
            <span className="log__kind">{e.kind}</span>
            <span>{e.text}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function useSecondsUntil(timestamp) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return timestamp ? Math.round((timestamp - now) / 1000) : null;
}
