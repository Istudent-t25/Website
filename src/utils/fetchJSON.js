export async function fetchJSON(url, opts = {}) {
  const method = (opts.method || "GET").toUpperCase();
  const headers = new Headers(opts.headers || {});
  // For GET/HEAD, don't set Content-Type (avoids preflight)
  if (method !== "GET" && method !== "HEAD" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  // It's fine to set Accept; it's a simple header
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  const res = await fetch(url, {
    ...opts,
    method,
    headers,
    mode: "cors",
    credentials: "omit", // don't send cookies unless you need them
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
