// src/lib/host.js
// Stable :4000 default with localStorage override and optional Vite env
export function getHost() {
  const saved = (typeof localStorage !== 'undefined' && localStorage.getItem('host')) || '';
  if (saved) return saved.replace(/\/$/, '');
  const env = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:4000';
  return String(env).replace(/\/$/, '');
}

export function setHost(url) {
  if (!url) return;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('host', String(url).replace(/\/$/, ''));
  }
  if (typeof window !== 'undefined') window.location.reload();
}
