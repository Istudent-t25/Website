// src/sw-register.js
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  const EXPECTED_SW = new URL('/service-worker.js', location.origin).href;

  // --- One-time cleanup: unregister stray SWs at other URLs (e.g., /sw.js)
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const r of regs) {
      const url = (r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || '');
      if (url && url !== EXPECTED_SW) {
        // Unregister any SW that isn't our current one
        await r.unregister().catch(() => {});
      }
    }
  } catch {}

  // Safety latch to avoid multiple reloads in a row
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;

    // If we already reloaded this tab after an SW update, don't do it again
    if (sessionStorage.getItem('__SW_RELOADED__') === '1') return;

    sessionStorage.setItem('__SW_RELOADED__', '1');
    setTimeout(() => window.location.reload(), 50);
  });

  // Register & silently auto-activate updates
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });

      // If a new worker is already waiting, activate it now
      if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });

      // If a new one starts installing, activate it as soon as it's installed
      reg.addEventListener('updatefound', () => {
        const sw = reg.installing;
        if (!sw) return;
        sw.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) {
            reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });

      // Silent periodic checks (no loop if SW bytes don't change)
      const check = () => reg.update().catch(() => {});
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check();
      });
      check();
      setInterval(check, 60 * 60 * 1000); // hourly
    } catch {}
  });
}
