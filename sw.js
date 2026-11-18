// Minimal service worker: makes the app installable.
// Calls need the network, so nothing is cached. On activation, any caches left
// by older versions are deleted so stale HTML/JS can never be served.

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    } catch (e) {
      // caches API unavailable (rare); nothing to clear.
    }
    await self.clients.claim();
  })());
});

// Network-only: never intercept or serve from a cache.
self.addEventListener('fetch', () => {});
