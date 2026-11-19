/**
 * Register the PWA service worker (production builds only).
 *
 * @param {function(function): void} onUpdate - called with an `applyUpdate`
 *   callback when a new service worker is waiting to take over.
 */
export default function registerSW(onUpdate) {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  navigator.serviceWorker.register('/sw.js').then(
    (registration) => {
      registration.onupdatefound = () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.onstatechange = () => {
          if (
            installing.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            // A fresh worker is waiting while an old one controls the page:
            // a newer version is available.
            onUpdate(() => {
              registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
            });
          }
        };
      };
    },
    (error) => {
      console.warn('[pwa] service worker registration failed:', error);
    },
  );
}
