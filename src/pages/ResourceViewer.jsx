// src/pages/ResourceViewer.jsx — PDF/Image viewer wrapper with bottom description support
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, ExternalLink, Download, Copy, Check } from "lucide-react";

function normalizeStudentKrdStrict(raw) {
  if (!raw) return "";
  try {
    const u = new URL(raw, window.location.origin);
    if (/^\/api\/v1\/dl\//i.test(u.pathname)) { u.search = ""; return u.toString(); }
    const isStudentKrd = /\.studentkrd\.com$/i.test(u.hostname);
    const m = u.pathname.match(/^\/storage\/(.+)$/i);
    if (isStudentKrd && m) {
      u.hostname = "api.studentkrd.com";
      u.pathname = `/api/v1/dl/${m[1]}`;
      u.search = "";
      return u.toString();
    }
    return u.toString();
  } catch { return raw; }
}

export default function ResourceViewer() {
  const nav = useNavigate();
  const { search } = useLocation();
  const q = new URLSearchParams(search);

  const rawUrl     = q.get("u") || "";
  const preferText = q.get("preferText") === "1";
  const descParam  = q.get("d") || ""; // optional description (plain text)

  const normalizedUrl = useMemo(() => normalizeStudentKrdStrict(rawUrl), [rawUrl]);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(null); // 0..100
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef(null);

  // Only iframe scrolls
  useEffect(() => {
    const html = document.documentElement, body = document.body;
    const a = html.style.overflow, b = body.style.overflow, c = html.style.overscrollBehaviorY, d = body.style.overscrollBehaviorY;
    html.style.overflow = "hidden"; body.style.overflow = "hidden";
    html.style.overscrollBehaviorY = "none"; body.style.overscrollBehaviorY = "none";
    return () => { html.style.overflow = a; body.style.overflow = b; html.style.overscrollBehaviorY = c; body.style.overscrollBehaviorY = d; };
  }, []);

  // Receive progress/ready from inner viewer
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
    // Ensure this path matches where pdf-viewer.html is served from
    const viewerPath = "/pdf-viewer.html";
    const u = new URL(viewerPath, window.location.origin);
    if (normalizedUrl) u.searchParams.set("file", normalizedUrl);
    u.searchParams.set("embed", "1");
    u.searchParams.set("z", "0.6");
    if (preferText) u.searchParams.set("preferText", "1");
    if (descParam)  u.searchParams.set("desc", descParam); // pass description into iframe
    return u.toString();
  }, [normalizedUrl, preferText, descParam]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(normalizedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const showTopProgress = !ready && (progress == null || progress < 100);
  const showOverlay = !ready && (progress == null || progress < 8);

  return (
    <div dir="rtl" className="fixed inset-0 bg-zinc-950 text-zinc-50 grid grid-rows-[auto_1fr] overflow-hidden z-50">
      {/* Top bar */}
      <div className="border-b border-white/10 bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
        <div className="px-2.5 sm:px-3 py-1.5 flex items-center justify-between gap-2">
          <button
            onClick={() => nav(-1)}
            className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 inline-flex items-center gap-1 text-[12px]"
            title="گەڕانەوە" aria-label="گەڕانەوە"
          >
            <ArrowRight size={14} />
            <span className="hidden sm:inline">گەڕانەوە</span>
          </button>

          <div className="flex items-center gap-1">
            {normalizedUrl && (
              <>
                <a className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 inline-flex items-center gap-1 text-[12px]"
                   href={normalizedUrl} target="_blank" rel="noreferrer" title="کردنەوە لە لاپەڕەیەکی نوێ" aria-label="کردنەوە">
                  <ExternalLink size={14} /><span className="hidden sm:inline">کردنەوە</span>
                </a>
                <a className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 inline-flex items-center gap-1 text-[12px]"
                   href={normalizedUrl} title="داگرتن" aria-label="داگرتن">
                  <Download size={14} /><span className="hidden sm:inline">داگرتن</span>
                </a>
                <button onClick={copyLink}
                        className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 inline-flex items-center gap-1 text-[12px]"
                        title="لەبەرگرتنەوەی بەستەر" aria-label="لەبەرگرتنەوەی بەستەر">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span className="hidden sm:inline">{copied ? "لەبەرگیرا" : "لەبەرگرتنەوە"}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progress (auto-hides when percent = 100) */}
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
        {/* Center spinner overlay — hides as soon as progress appears */}
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
          title="PDF Viewer"
          src={src}
          style={{ width: "100%", height: "100%", border: 0, display: "block" }}
          sandbox="allow-scripts allow-downloads"
        />
      </div>
    </div>
  );
}
