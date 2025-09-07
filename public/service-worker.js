/* public/service-worker.js
   Silent auto-update PWA service worker.
   - App shell precache (index/offline/manifest)
   - Navigation Preload for faster first paint
   - Network-first for HTML (ensures new deploy is picked)
   - Cache-first for images/PDFs/fonts (capped)
   - Network-first (with timeout) for API
   - Messages: SKIP_WAITING, CLEAR_CACHES
*/

const VERSION = 'v2025-09-07-1';          // ← bump on every deploy
const PRECACHE   = `precache-${VERSION}`;
const RT_IMG     = `rt-img-${VERSION}`;
const RT_PDF     = `rt-pdf-${VERSION}`;
const RT_API     = `rt-api-${VERSION}`;
const RT_FONT    = `rt-font-${VERSION}`;
const RT_MISC    = `rt-misc-${VERSION}`;

const APP_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  // add your icons if you want: '/icons/pwa-192.png', '/icons/pwa-512.png',
];

// optional local fonts to precache
const FONTS_TO_PRECACHE = [
  // '/fonts/Ubuntu-Kurdish-Kurdfont.woff2',
];

const LIMITS = { images: 200, pdfs: 60, fonts: 40 };
const API_HOSTS = ['api.studentkrd.com'];

// ---------- helpers ----------
const isNav = (req) =>
  req.mode === 'navigate' ||
  (req.destination === '' && (req.headers.get('accept') || '').includes('text/html'));

const isGoogleCSS = (req) => { try { return new URL(req.url).hostname === 'fonts.googleapis.com'; } catch { return false; } };
const isGoogleFile = (req) => { try { return new URL(req.url).hostname === 'fonts.gstatic.com'; } catch { return false; } };
const isLocalFont  = (req) => req.destination === 'font' || (new URL(req.url)).pathname.startsWith('/fonts/');
const isImg = (req) => {
  if (req.destination === 'image') return true;
  try {
    const ext = (new URL(req.url).pathname.split('.').pop() || '').toLowerCase();
    return ['png','jpg','jpeg','webp','gif','svg','avif'].includes(ext) || (new URL(req.url).hostname.includes('img.youtube.com'));
  } catch { return false; }
};
const isPdf = (req) => { try { return new URL(req.url).pathname.toLowerCase().endsWith('.pdf'); } catch { return false; } };
const isApi = (req) => { try { return API_HOSTS.includes(new URL(req.url).hostname); } catch { return false; } };

const timeout = (ms, p) => new Promise((res, rej) => {
  const id = setTimeout(() => rej(new Error('timeout')), ms);
  p.then((v) => { clearTimeout(id); res(v); }, (e) => { clearTimeout(id); rej(e); });
});

async function putWithCap(cacheName, request, response, cap) {
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
  const keys = await cache.keys();
  if (keys.length > cap) {
    for (let i = 0; i < keys.length - cap; i++) await cache.delete(keys[i]);
  }
}

// ---------- lifecycle ----------
self.addEventListener('install', (event) => {
  // Install new worker, move to "waiting" immediately.
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(PRECACHE);
    await cache.addAll(APP_SHELL);
    for (const f of FONTS_TO_PRECACHE) {
      try {
        const r = await fetch(f, { mode: 'cors' });
        if (r && (r.ok || r.type === 'opaque')) await cache.put(f, r.clone());
      } catch {}
    }
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Enable Navigation Preload where supported.
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch {}
    }
    // Clean old caches.
    const keep = [PRECACHE, RT_IMG, RT_PDF, RT_API, RT_FONT, RT_MISC];
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => !keep.includes(k)).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// ---------- messages ----------
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (data.type === 'CLEAR_CACHES') {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    })());
  }
});

// ---------- fetch ----------
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // 1) SPA navigations: network-first (with nav preload), then cache, then offline.html
  if (isNav(req)) {
    event.respondWith((async () => {
      try {
        const preload = await event.preloadResponse;
        const net = preload || await fetch(req, { cache: 'no-store' });
        // keep cached index fresh for offline fallback
        const pc = await caches.open(PRECACHE);
        pc.put('/index.html', net.clone());
        return net;
      } catch {
        const pc = await caches.open(PRECACHE);
        return (await pc.match('/index.html')) ||
               (await pc.match('/offline.html')) ||
               new Response('<h1>Offline</h1>', { headers: { 'Content-Type': 'text/html' } });
      }
    })());
    return;
  }

  // 2) Google Fonts CSS: stale-while-revalidate
  if (isGoogleCSS(req)) {
    event.respondWith((async () => {
      const c = await caches.open(RT_FONT);
      const cached = await c.match(req);
      const fetching = fetch(req).then(r => { if (r && r.ok) c.put(req, r.clone()); return r; }).catch(() => cached);
      return cached || fetching;
    })());
    return;
  }

  // 3) Fonts (Google/local): cache-first (capped)
  if (isGoogleFile(req) || isLocalFont(req)) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      const r = await fetch(req, { mode: 'cors' }).catch(() => null);
      if (r && (r.ok || r.type === 'opaque')) await putWithCap(RT_FONT, req, r.clone(), LIMITS.fonts);
      return r || cached || Response.error();
    })());
    return;
  }

  // 4) Images: cache-first (capped)
  if (isImg(req)) {
    event.respondWith((async () => {
      const cached = await caches.match(req, { ignoreVary: true });
      if (cached) return cached;
      const r = await fetch(req, { mode: 'cors' }).catch(() => null);
      if (r && (r.ok || r.type === 'opaque')) await putWithCap(RT_IMG, req, r.clone(), LIMITS.images);
      return r || cached || new Response('', { status: 204 });
    })());
    return;
  }

  // 5) PDFs: cache-first (capped)
  if (isPdf(req)) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      const r = await fetch(req, { mode: 'cors' }).catch(() => null);
      if (r && (r.ok || r.type === 'opaque')) await putWithCap(RT_PDF, req, r.clone(), LIMITS.pdfs);
      return r || new Response(JSON.stringify({ error: 'offline' }), { status: 503, headers: { 'Content-Type': 'application/json' }});
    })());
    return;
  }

  // 6) API: network-first with timeout, fallback to cache
  if (isApi(req)) {
    event.respondWith((async () => {
      const cache = await caches.open(RT_API);
      try {
        const net = await timeout(4000, fetch(req, { cache: 'no-store', credentials: 'include' }));
        if (net && net.ok) cache.put(req, net.clone());
        return net;
      } catch {
        const cached = await cache.match(req);
        return cached || new Response(JSON.stringify({ error: 'offline' }), { status: 503, headers: { 'Content-Type': 'application/json' }});
      }
    })());
    return;
  }

  // 7) Everything else: network-first → cache → offline
  event.respondWith((async () => {
    const cache = await caches.open(RT_MISC);
    try {
      const net = await fetch(req);
      if (net && net.ok) cache.put(req, net.clone());
      return net;
    } catch {
      const cached = await cache.match(req);
      if (cached) return cached;
      if ((req.headers.get('accept') || '').includes('text/html')) {
        const pc = await caches.open(PRECACHE);
        const offline = await pc.match('/offline.html');
        if (offline) return offline;
      }
      return new Response('Offline', { status: 503 });
    }
  })());
});
