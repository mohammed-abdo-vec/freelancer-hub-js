// =============================================================================
//  Runs ONCE when the app loads: "Do I still have a session?"
//
//  The access token lived in memory, so a page reload wiped it. But the
//  httpOnly refresh cookie is still in the browser. So we call /auth/refresh:
//    200 → we get a fresh access token → status 'authenticated'
//    401 → no (valid) cookie            → status 'guest'
//
//  Until that answer arrives, status is 'checking' and the route guards show
//  a spinner instead of wrongly bouncing a logged-in user to /login.
// =============================================================================
import { useEffect } from 'react';
import { refreshSession } from '../lib/http';
import { useAuthStore, useAuthStatus } from '../store/authStore';
import { Spinner } from './Spinner';

export function AuthBootstrap({ children }) {
  const status = useAuthStatus();

  useEffect(() => {
    // StrictMode runs this effect twice in dev — that's fine, refreshSession()
    // returns the same in-flight promise, so only ONE request goes out.
    refreshSession().catch(() => useAuthStore.getState().clearSession());
  }, []);

  if (status === 'checking') return <Spinner full label="Restoring your session…" />;
  return children;
}
