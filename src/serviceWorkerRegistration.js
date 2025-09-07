/* public/service-worker.js */
const APP_VERSION = 'v1.0.0';
const PRECACHE = `precache-${APP_VERSION}`;
const RUNTIME = `runtime-${APP_VERSION}`;

// Add the assets you want cached at install (app shell)
const PRECACHE_URLS = [
  '/',                 // for SPA routing
  '/index.html',
  '/offline.html',     // create this file for offline fallback
  '/favicon.ico',
  '/manifest.webmanifest',
];

// Install: pre-cache app shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== PRECACHE && key !== RUNTIME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

// Helper: network-first for API requests
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME);
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

// Helper: stale-while-revalidate for static resources (images, css, js)
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);

  return cached || networkPromise;
}

// Fetch: route by type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin
  if (url.origin !== location.origin) return;

  // HTML navigations: App Shell fallback (SPA)
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          // Successful fetch → update runtime cache
          const cache = await caches.open(RUNTIME);
          cache.put(request, networkResponse.clone());
          return networkResponse;
        } catch {
          // Offline: return cached index or offline page
          const cache = await caches.open(PRECACHE);
          return (
            (await cache.match('/index.html')) ||
            (await cache.match('/offline.html'))
          );
        }
      })()
    );
    return;
  }

  // API pattern (adjust to your API path)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets: images, js, css → SWR
  if (
    request.destination === 'image' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font'
  ) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Default: try cache → network → offline
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      try {
        return await fetch(request);
      } catch {
        const cache = await caches.open(PRECACHE);
        return cache.match('/offline.html');
      }
    })()
  );
});

// Optional: allow app to tell SW to skip waiting immediately
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
