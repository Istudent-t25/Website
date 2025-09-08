// src/pages/ResourceViewer.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, ExternalLink, Download, Copy, Check } from "lucide-react";

/** Normalize *.studentkrd.com links:
 *  - If already /api/v1/dl/..., leave as-is (strip query).
 *  - If /storage/... -> rewrite to https://api.studentkrd.com/api/v1/dl/<rest>
 */
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
  } catch {
    return raw;
  }
}

export default function ResourceViewer() {
  const nav = useNavigate();
  const { search } = useLocation();
  const q = new URLSearchParams(search);
  const rawUrl = q.get("u") || "";
  // Optional: &preferText=1 to force text-only render for tricky PDFs
  const preferText = q.get("preferText") === "1";

  const normalizedUrl = useMemo(() => normalizeStudentKrdStrict(rawUrl), [rawUrl]);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(null);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef(null);

  // Lock outer scroll — only iframe scrolls
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOB = html.style.overscrollBehaviorY;
    const prevBodyOB = body.style.overscrollBehaviorY;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehaviorY = "none";
    body.style.overscrollBehaviorY = "none";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.overscrollBehaviorY = prevHtmlOB;
      body.style.overscrollBehaviorY = prevBodyOB;
    };
  }, []);

  // Progress + ready from inner viewer
  useEffect(() => {
    const onMsg = (e) => {
      if (!iframeRef.current || e.source !== iframeRef.current.contentWindow) return;
      const data = e?.data || {};
      if (data.type === "pdfviewer:progress" && typeof data.percent === "number") {
        setProgress(Math.max(0, Math.min(100, Math.round(data.percent))));
      }
      if (data.type === "pdfviewer:ready") {
        setReady(true);
        setProgress(null);
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  // Build the pdf-viewer.html URL
  // embed=1 → inner viewer hides its own UI/progress
  // z=0.6   → default zoom
  const src = useMemo(() => {
    const viewerPath = "pdf-viewer.html";
    const u = new URL(viewerPath, window.location.origin);
    if (normalizedUrl) u.searchParams.set("file", normalizedUrl);
    u.searchParams.set("embed", "1");
    u.searchParams.set("z", "0.6");
    if (preferText) u.searchParams.set("preferText", "1");
    return u.toString();
  }, [normalizedUrl, preferText]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(normalizedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <div dir="rtl" className="h-[100dvh] bg-zinc-950 text-zinc-50 grid grid-rows-[auto_1fr] overflow-hidden">
      {/* Header (title removed; compact buttons) */}
      <div className="border-b border-white/10 bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
        <div className="px-3 py-1.5 flex items-center justify-between gap-2">
          <button
            onClick={() => nav(-1)}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 inline-flex items-center gap-1 text-[12px]"
            title="گەڕانەوە"
          >
            <ArrowRight size={14} /> گەڕانەوە
          </button>

          <div className="flex items-center gap-1">
            {normalizedUrl && (
              <>
                <a
                  className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 inline-flex items-center gap-1 text-[12px]"
                  href={normalizedUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="کردنەوە لە لاپەڕەیەکی نوێ"
                >
                  <ExternalLink size={14} />
                  کردنەوە
                </a>
                <a
                  className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 inline-flex items-center gap-1 text-[12px]"
                  href={normalizedUrl}
                  title="داگرتن"
                >
                  <Download size={14} />
                  داگرتن
                </a>
                <button
                  onClick={copyLink}
                  className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 inline-flex items-center gap-1 text-[12px]"
                  title="لەبەرگرتنەوەی بەستەر"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "لەبەرگیرا" : "لەبەرگرتنەوە"}
                </button>
              </>
            )}
          </div>
        </div>

        {!ready && (
          <div className="px-3 pb-1.5">
            <div className="h-1 w-full rounded bg-white/10 overflow-hidden">
              <div
                className="h-full bg-emerald-400"
                style={{ width: `${progress ?? 10}%`, transition: "width 150ms linear" }}
              />
            </div>
            <div className="text-[11px] text-zinc-400 mt-1 text-center">
              {typeof progress === "number" ? `داگرتن ${progress}%` : "بارکردن…"}
            </div>
          </div>
        )}
      </div>

      {/* Only the iframe scrolls */}
      <div className="relative h-full overflow-hidden">
        <iframe
          ref={iframeRef}
          title="PDF Viewer"
          src={src}
          style={{ width: "100%", height: "100%", border: 0, display: "block" }}
          sandbox="allow-scripts allow-same-origin allow-downloads"
        />
      </div>
    </div>
  );
}
