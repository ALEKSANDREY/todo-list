/* Service worker for the Todo List PWA.
 * - Pre-caches the app shell on install
 * - Network-first for navigations with offline fallback to the cached shell (SPA support)
 * - Cache-first for static assets (script/style/image/font, /assets/*)
 * - Network-first with cache fallback for everything else
 */

const CACHE = 'todolist-v1';
const SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll(SHELL).catch((err) => {
          // A missing shell file should never kill the install.
          console.warn('[sw] shell precache failed:', err);
        }),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

const STATIC_DESTINATIONS = new Set(['script', 'style', 'image', 'font']);

function isStaticAsset(request) {
  return (
    STATIC_DESTINATIONS.has(request.destination) || request.url.includes('/assets/')
  );
}

async function networkFirst(request, fallback) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (fallback) return fallback();
    throw err;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    // SPA: try network, fall back to the cached app shell when offline.
    event.respondWith(
      networkFirst(request, () => caches.match('/index.html')),
    );
    return;
  }

  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Everything else: network-first, cache as fallback.
  event.respondWith(networkFirst(request));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
