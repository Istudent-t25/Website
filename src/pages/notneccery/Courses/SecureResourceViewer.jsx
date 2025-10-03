// src/pages/SecureResourceViewer.jsx — app-locked PDF viewer (no download/share)
// Usage: /secure-viewer?id=<resourceId>&t=<signedToken>
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function SecureResourceViewer() {
  const nav = useNavigate();
  const { search } = useLocation();
  const q = new URLSearchParams(search);
  const id = q.get("id") || "";
  const token = q.get("t") || "";
  const preferText = q.get("preferText") === "1";

  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    const html = document.documentElement, body = document.body;
    const a = html.style.overflow, b = body.style.overflow, c = html.style.overscrollBehaviorY, d = body.style.overscrollBehaviorY;
    html.style.overflow = "hidden"; body.style.overflow = "hidden";
    html.style.overscrollBehaviorY = "none"; body.style.overscrollBehaviorY = "none";
    return () => { html.style.overflow = a; body.style.overflow = b; html.style.overscrollBehaviorY = c; body.style.overscrollBehaviorY = d; };
  }, []);

  useEffect(() => {
    const onMsg = (e) => {
      if (!iframeRef.current || e.source !== iframeRef.current.contentWindow) return;
      const data = e?.data || {};
      if (data.type === "pdfviewer:progress" && typeof data.percent === "number") {
        setProgress(Math.max(0, Math.min(100, Math.round(data.percent))));
      }
      if (data.type === "pdfviewer:ready") setReady(true);
    };
    window.addEventListener("message", onMsg, { passive: true });
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const src = useMemo(() => {
    const u = new URL("/pdf-viewer-locked.html", window.location.origin);
    if (id) u.searchParams.set("id", id);
    if (token) u.searchParams.set("t", token);
    u.searchParams.set("embed", "1");
    u.searchParams.set("z", "0.6");
    if (preferText) u.searchParams.set("preferText", "1");
    return u.toString();
  }, [id, token, preferText]);

  const showTopProgress = !ready && (progress == null || progress < 100);
  const showOverlay = !ready && (progress == null || progress < 8);

  return (
    <div dir="rtl" className="fixed inset-0 bg-zinc-950 text-zinc-50 grid grid-rows-[auto_1fr] overflow-hidden z-50">
      <div className="border-b border-white/10 bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
        <div className="px-2.5 sm:px-3 py-1.5 flex items-center justify-between gap-2">
          <button
            onClick={() => (window.history.length > 1 ? nav(-1) : nav("/"))}
            className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 inline-flex items-center gap-1 text-[12px]"
            title="گەڕانەوە" aria-label="گەڕانەوە"
          >
            <ArrowRight size={14} /><span className="hidden sm:inline">گەڕانەوە</span>
          </button>
          <div className="text-[11px] text-zinc-400" />
        </div>

        {showTopProgress && (
          <div className="px-2.5 sm:px-3 pb-1.5">
            <div className="h-1 w-full rounded bg-white/10 overflow-hidden">
              <div className="h-full bg-emerald-400" style={{ width: `${progress ?? 10}%`, transition: "width 150ms linear" }} />
            </div>
            <div className="text-[11px] text-zinc-400 mt-1 text-center">
              {typeof progress === "number" ? `داگرتن ${progress}%` : "بارکردن…"}
            </div>
          </div>
        )}
      </div>

      <div className="relative h-full overflow-hidden">
        {showOverlay && (
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900/70 px-4 py-3">
              <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity=".2"></circle>
                <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" fill="none"></path>
              </svg>
              <span className="text-sm text-zinc-200">بارکردن…</span>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          title="PDF Viewer (Locked)"
          src={src}
          style={{ width: "100%", height: "100%", border: 0, display: "block" }}
          sandbox="allow-scripts allow-same-origin" /* no downloads/popup */
        />
      </div>
    </div>
  );
}
