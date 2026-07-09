import { lazy } from 'react';

/**
 * Wraps React.lazy so a failed dynamic import — almost always a STALE hashed
 * chunk after a new deploy (the browser still holds the old index.html) —
 * triggers exactly ONE full reload to fetch the fresh index.html + chunks,
 * instead of crashing client-side navigation with "TypeError: x is not a function".
 *
 * A sessionStorage flag prevents an infinite reload loop if the import fails
 * for a genuine (non-stale) reason.
 */
export default function lazyWithRetry(factory) {
  return lazy(async () => {
    const KEY = 'chunk-reloaded-once';
    try {
      const mod = await factory();
      window.sessionStorage.removeItem(KEY);
      return mod;
    } catch (err) {
      if (!window.sessionStorage.getItem(KEY)) {
        window.sessionStorage.setItem(KEY, '1');
        window.location.reload();
        // Keep Suspense pending while the page reloads.
        return new Promise(() => {});
      }
      throw err;
    }
  });
}
