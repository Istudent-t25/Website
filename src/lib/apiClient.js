// src/lib/apiClient.js
import { auth } from "./firebase";

async function authHeader() {
  const u = auth.currentUser;
  const tok = u ? await u.getIdToken(/* refresh? */ true) : null;
  return tok ? { Authorization: `Bearer ${tok}` } : {};
}

export async function api(path, { method = "GET", headers = {}, body } = {}) {
  const base = import.meta.env.VITE_API_BASE; // e.g. https://api.yourdomain.com
  const res = await fetch(`${base}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(await authHeader()), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(err.message || `HTTP ${res.status}`), { status: res.status, data: err });
  }
  return res.json();
}
