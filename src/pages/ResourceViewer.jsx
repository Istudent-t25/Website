// src/pages/ResourceViewer.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Normalize api.studentkrd.com links to direct PDF file
function normalizeStudentKrdStrict(raw) {
  if (!raw) return "";
  try {
    const u = new URL(raw, location.origin);
    if (u.hostname === "api.studentkrd.com") {
      const full = u.pathname + (u.search || "");
      const m = full.match(/([^\/?#]+\.pdf)(?:[?#].*)?$/i);
      let file = m ? m[1] : null;
      if (!file) {
        const last = u.pathname.split("/").filter(Boolean).pop();
        if (last && /^[a-z0-9-]{10,}$/i.test(last))
          file = last.endsWith(".pdf") ? last : `${last}.pdf`;
      }
      if (file) {
        u.pathname = `/api/dl/uploads/${file}`;
        u.search = "";
      }
    }
    return encodeURI(u.toString());
  } catch {
    try { return encodeURI(raw); } catch { return raw; }
  }
}

export default function ResourceViewer() {
  const nav = useNavigate();
  const { search } = useLocation();
  const q = new URLSearchParams(search);
  const rawUrl = q.get("u") || "";
  const title = q.get("t") || "پیشاندان";

  const normalizedUrl = useMemo(() => normalizeStudentKrdStrict(rawUrl), [rawUrl]);

  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(null);
  const iframeRef = useRef(null);

  // Lock outer page scroll: only iframe scrolls
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

  // Listen for progress/ready messages from the inner viewer
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

  const src = useMemo(() => {
    const viewerPath = "pdf-viewer.html";
    const u = new URL(viewerPath, location.origin);
    if (normalizedUrl) u.searchParams.set("file", normalizedUrl);
    if (title) u.searchParams.set("t", title);
    return u.toString();
  }, [normalizedUrl, title]);

  return (
    <div dir="rtl" className="h-[100dvh] bg-zinc-950 text-zinc-50 grid grid-rows-[auto_1fr] overflow-hidden">
      {/* Header (no scaling animations) */}
      <div className="border-b border-white/10 bg-zinc-950/80 backdrop-blur">
        <div className="px-3 py-2 flex items-center gap-2">
          <button
            onClick={() => nav(-1)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center gap-2"
          >
            <ArrowRight size={16} /> گەڕانەوە
          </button>
          <div className="truncate font-semibold text-sm sm:text-base">{title}</div>
        </div>

        {!ready && (
          <div className="px-3 pb-2">
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
