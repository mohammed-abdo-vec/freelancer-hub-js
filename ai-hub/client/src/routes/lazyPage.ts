import { lazy, type ComponentType } from 'react';

/**
 * React.lazy for named exports, plus a `preload()` that fetches the chunk early
 * (call it on hover/focus so the page is usually ready by the time the user clicks).
 */
export function lazyPage<M>(load: () => Promise<M>, pick: (module: M) => ComponentType) {
  const Page = lazy(() => load().then((module) => ({ default: pick(module) })));
  const preload = () => {
    // A failed preload is fine: the real navigation retries and surfaces the error
    load().catch(() => {});
  };
  return Object.assign(Page, { preload });
}
