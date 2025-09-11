// src/utils/api.js

// Resolve base URL:
// - Dev: use Vite proxy ("" → relative /api path; set up proxy in vite.config.js)
// - Prod: hit the real host
const DEFAULT_BASE =
  import.meta.env.MODE === "development" ? "" : "https://api.studentkrd.com";

export const API_BASE = (import.meta.env.VITE_API_BASE || DEFAULT_BASE).replace(
  /\/+$/,
  ""
);

/** Build a full API URL from a path and params (object or URLSearchParams). */
export function apiUrl(path, params) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const sp =
    params instanceof URLSearchParams ? params : toParams(params || undefined);
  const qs = sp.toString();
  return `${API_BASE}${p}${qs ? `?${qs}` : ""}`;
}

/** Convert a plain object to URLSearchParams, skipping null/undefined/empty. */
export function toParams(obj = {}) {
  const sp = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    const s = String(v);
    if (s === "") return;
    sp.set(k, s);
  });
  return sp;
}

/** Fetch JSON with optional bearer token and timeout. Throws on HTTP errors. */
export async function fetchJSON(
  input,
  { token, timeout = 20000, headers = {}, ...rest } = {}
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const h = {
    Accept: "application/json",
    ...headers,
  };
  if (token) h.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(input, {
      ...rest,
      headers: h,
      signal: controller.signal,
      credentials: "omit",
    });
  } finally {
    clearTimeout(timer);
  }

  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const payload = isJson ? await res.json().catch(() => ({})) : await res.text();

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} ${res.statusText || ""}`.trim());
    err.status = res.status;
    err.payload = payload;
    throw err;
  }
  return payload;
}

/** Normalize Kurdish/Arabic text: remove ZWNJ, unify Kaf/Ye, trim spaces. */
export const normalizeKurdish = (s = "") =>
  s
    .normalize("NFKC")
    .replace(/\u200c/g, "") // ZWNJ
    .replace(/[ىي]/g, "ی") // Ye variants → ی
    .replace(/ك/g, "ک") // Kaf variant → ک
    .replace(/\s+/g, " ")
    .trim();

/** Build viewer URL for a resource. */
export function buildViewerURL({ url, title, type = "pdf" }) {
  const u = encodeURIComponent(url || "");
  const t = encodeURIComponent(title || "");
  const ty = encodeURIComponent(type || "pdf");
  return `/viewer?u=${u}&t=${t}&type=${ty}`;
}

/* --------------------------
   High-level API wrappers
   -------------------------- */

export const API = {
  documents: {
    /**
     * List documents (books/booklets).
     * params: { grade, type, subject, stream, q, per_page, page }
     */
    list: (params, opts) =>
      fetchJSON(apiUrl("/api/v1/documents", params), opts),
  },

  papers: {
    /**
     * List papers (national_exam, important_note, important_questions).
     * params: { grade, subject, stream, type, per_page, page }
     */
    list: (params, opts) => fetchJSON(apiUrl("/api/v1/papers", params), opts),
  },

  notes: {
    /**
     * If you have a notes endpoint.
     * params: { grade, subject, stream, important, per_page, page }
     */
    list: (params, opts) => fetchJSON(apiUrl("/api/v1/notes", params), opts),
  },
};

export default API;
