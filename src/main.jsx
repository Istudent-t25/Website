import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import "./index.css"
// import { registerSW } from 'virtual:pwa-register';
// registerSW({ immediate: true });

// src/main.jsx (or src/index.jsx)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(reg => {
      // Auto-activate new versions
      if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      reg.addEventListener('updatefound', () => {
        const sw = reg.installing;
        if (!sw) return;
        sw.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) {
            // New version ready → take over and refresh
            reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    }).catch(() => {/* ignore */});
  });
}


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
