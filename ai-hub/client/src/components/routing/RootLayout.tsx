import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { LoadingScreen } from '@/components/common/LoadingScreen';

/** Catches lazy pages that render outside the shell (login, register, 404). */
export function RootLayout() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}
