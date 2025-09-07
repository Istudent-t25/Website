
/**
 * sw.js — Progressive Web App Service Worker (Full)
 * Features:
 * - App Shell precache (index.html, offline.html, manifest, icons)
 * - Precaches local fonts so they download on install
 * - Runtime caching:
 *    • Images (cache-first)
 *    • PDFs (cache-first, capped)
 *    • Google Fonts CSS (stale-while-revalidate)
 *    • Google Fonts files + local fonts (cache-first)
 *    • API JSON (network-first with timeout, fallback to cache)
 *    • Everything else GET (network-first, fallback to cache)
 * - SPA navigation fallback: cached index.html → offline.html
 * - Commands via postMessage: {type:'SKIP_WAITING'} and {type:'CLEAR_CACHES'}
 */

const VERSION = 'v2025-09-05-full-2';
const PRECACHE = `precache-${VERSION}`;
const RUNTIME_IMG = `rt-img-${VERSION}`;
const RUNTIME_PDF = `rt-pdf-${VERSION}`;
const RUNTIME_API = `rt-api-${VERSION}`;
const RUNTIME_FONT = `rt-font-${VERSION}`;
const RUNTIME_MISC = `rt-misc-${VERSION}`;

// ---- CONFIG ----
const APP_SHELL = [
  '/',               // SPA entry
  '/index.html',
  '/offline.html',
  //  '/pdf-viewer.html',
  '/manifest.webmanifest',
  // '/favicon.ico',
];

// >>>>> EDIT THESE TO MATCH YOUR LOCAL FONT FILES <<<<<
// Example local font files in /public/fonts/
const FONTS_TO_PRECACHE = [
  // '/fonts/YourFont-Regular.woff2',
  // '/fonts/YourFont-Bold.woff2',
];

// Limits to avoid unbounded growth (by entry count)
const LIMITS = {
  images: 200,
  pdfs: 60,
  fonts: 40,
};

// API hosts to treat as "network-first"
const API_HOSTS = [
  'api.studentkrd.com',
];

// ---- UTILITIES ----
function isNavigation(request) {
  return request.mode === 'navigate' || (request.destination === '' && request.headers.get('accept')?.includes('text/html'));
}
function isImageRequest(request) {
  if (request.destination === 'image') return true;
  try {
    const url = new URL(request.url);
    const ext = (url.pathname.split('.').pop() || '').toLowerCase();
    if (['png','jpg','jpeg','webp','gif','svg','avif'].includes(ext)) return true;
    if (url.hostname.includes('img.youtube.com')) return true;
  } catch {}
  return false;
}
function isPdfRequest(request) {
  try {
    const url = new URL(request.url);
    return (url.pathname.toLowerCase().endsWith('.pdf'));
  } catch {}
  return false;
}
function isGoogleFontsStylesheet(request) {
  try {
    const url = new URL(request.url);
    return url.hostname === 'fonts.googleapis.com';
  } catch {}
  return false;
}
function isGoogleFontsFile(request) {
  try {
    const url = new URL(request.url);
    return url.hostname === 'fonts.gstatic.com';
  } catch {}
  return false;
}
function isLocalFont(request) {
  try {
    const url = new URL(request.url);
    return (request.destination === 'font') || url.pathname.startsWith('/fonts/');
  } catch {}
  return false;
}
function isApiRequest(request) {
  try {
    const url = new URL(request.url);
    return API_HOSTS.includes(url.hostname);
  } catch {}
  return false;
}
function timeout(ms, promise) {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then((res) => { clearTimeout(id); resolve(res); }, (err) => { clearTimeout(id); reject(err); });
  });
}
async function putWithCap(cacheName, request, response, cap) {
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
  const keys = await cache.keys();
  if (keys.length > cap) {
    const toDelete = keys.length - cap;
    for (let i = 0; i < toDelete; i++) {
      await cache.delete(keys[i]);
    }
  }
}

// ---- LIFECYCLE ----
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(PRECACHE);
    // Precache app shell
    await cache.addAll(APP_SHELL);
    // Precache local fonts if any are listed (ignore failures)
    for (const fontUrl of FONTS_TO_PRECACHE) {
      try {
        const resp = await fetch(fontUrl, { mode: 'cors' });
        if (resp && (resp.ok || resp.type === 'opaque')) {
          await cache.put(fontUrl, resp.clone());
        }
      } catch (e) {
        // Ignore missing dev assets
      }
    }
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Delete old caches
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) =>
        ![PRECACHE, RUNTIME_IMG, RUNTIME_PDF, RUNTIME_API, RUNTIME_FONT, RUNTIME_MISC].includes(k)
      ).map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

// ---- MESSAGES ----
self.addEventListener('message', (event) => {
  const { type } = event.data || {};
  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (type === 'CLEAR_CACHES') {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    })());
  }
});

// ---- FETCH ----
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // 1) SPA navigation handling
  if (isNavigation(request)) {
    event.respondWith((async () => {
      try {
        const net = await timeout(4000, fetch(request));
        // Optionally update cached index
        const cache = await caches.open(PRECACHE);
        if (net && net.ok) cache.put('/index.html', net.clone());
        return net;
      } catch (e) {
        // Fallback to cached index, then offline page
        const cache = await caches.open(PRECACHE);
        const cachedIndex = await cache.match('/index.html');
        if (cachedIndex) return cachedIndex;
        const offline = await cache.match('/offline.html');
        if (offline) return offline;
        return new Response('<h1>Offline</h1>', { headers: { 'Content-Type': 'text/html' } });
      }
    })());
    return;
  }

  // 2) Google Fonts CSS (stale-while-revalidate)
  if (isGoogleFontsStylesheet(request)) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_FONT);
      const cached = await cache.match(request);
      const fetchPromise = fetch(request).then((resp) => {
        if (resp && resp.ok) cache.put(request, resp.clone());
        return resp;
      }).catch(() => cached);
      return cached || fetchPromise;
    })());
    return;
  }

  // 3) Google Fonts files + Local fonts (cache-first)
  if (isGoogleFontsFile(request) || isLocalFont(request)) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      try {
        const resp = await fetch(request, { mode: 'cors' });
        if (resp && (resp.ok || resp.type === 'opaque')) {
          await putWithCap(RUNTIME_FONT, request, resp.clone(), LIMITS.fonts);
        }
        return resp;
      } catch (e) {
        // If local font was precached, return it
        const cache = await caches.open(PRECACHE);
        const fromPrecache = await cache.match(request.url);
        if (fromPrecache) return fromPrecache;
        throw e;
      }
    })());
    return;
  }

  // 4) Images (cache-first)
  if (isImageRequest(request)) {
    event.respondWith((async () => {
      const cached = await caches.match(request, { ignoreVary: true, ignoreSearch: false });
      if (cached) return cached;
      try {
        const resp = await fetch(request, { mode: 'cors' });
        if (resp && (resp.ok || resp.type === 'opaque')) {
          await putWithCap(RUNTIME_IMG, request, resp.clone(), LIMITS.images);
        }
        return resp;
      } catch (e) {
        // 1x1 transparent PNG fallback
        const fallback =
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
        return fetch(fallback);
      }
    })());
    return;
  }

  // 5) PDFs (cache-first)
  if (isPdfRequest(request)) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      try {
        const resp = await fetch(request, { mode: 'cors' });
        if (resp && (resp.ok || resp.type === 'opaque')) {
          await putWithCap(RUNTIME_PDF, request, resp.clone(), LIMITS.pdfs);
        }
        return resp;
      } catch (e) {
        return new Response(
          JSON.stringify({ error: 'offline', message: 'PDF unavailable offline yet.' }),
          { headers: { 'Content-Type': 'application/json' }, status: 503 }
        );
      }
    })());
    return;
  }

  // 6) API (network-first with timeout → cache)
  if (isApiRequest(request)) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_API);
      try {
        const net = await timeout(4000, fetch(request));
        if (net && net.ok) cache.put(request, net.clone());
        return net;
      } catch (e) {
        const cached = await cache.match(request);
        if (cached) return cached;
        return new Response(JSON.stringify({ error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' }, status: 503
        });
      }
    })());
    return;
  }

  // 7) Everything else GET (network-first → cache → offline)
  event.respondWith((async () => {
    const cache = await caches.open(RUNTIME_MISC);
    try {
      const net = await fetch(request);
      if (net && net.ok) cache.put(request, net.clone());
      return net;
    } catch (e) {
      const cached = await cache.match(request);
      if (cached) return cached;
      // As a last resort, return offline.html for text/html
      if (request.headers.get('accept')?.includes('text/html')) {
        const precache = await caches.open(PRECACHE);
        const offline = await precache.match('/offline.html');
        if (offline) return offline;
      }
      return new Response('Offline', { status: 503 });
    }
  })());
});
