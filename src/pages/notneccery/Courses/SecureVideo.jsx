// src/pages/SecureVideo.jsx — locked HLS player (no PiP/remote/download) + watermark
// Usage: /secure-video?id=<videoId>&t=<signedToken>
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function SecureVideo() {
  const nav = useNavigate();
  const { search } = useLocation();
  const q = new URLSearchParams(search);
  const id = q.get("id") || "";
  const token = q.get("t") || "";

  const [ready, setReady] = useState(false);
  const videoRef = useRef(null);

  const hlsUrl = useMemo(
    () => `/api/v1/view/hls/${encodeURIComponent(id)}/master.m3u8?t=${encodeURIComponent(token)}`,
    [id, token]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const uaIsSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    async function attach() {
      try {
        if (uaIsSafari || video.canPlayType("application/vnd.apple.mpegURL")) {
          video.src = hlsUrl;
          video.addEventListener("loadedmetadata", () => setReady(true), { once: true });
          await video.play().catch(() => {});
        } else {
          const Hls = (await import("hls.js")).default;
          if (Hls.isSupported()) {
            const hls = new Hls({
              lowLatencyMode: true,
              enableWorker: true,
              backBufferLength: 60,
              xhrSetup: (xhr) => {
                if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
                xhr.withCredentials = true;
              },
            });
            hls.loadSource(hlsUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => setReady(true));
          } else {
            video.src = hlsUrl;
            video.addEventListener("loadedmetadata", () => setReady(true), { once: true });
          }
        }
      } catch {}
    }
    attach();
  }, [hlsUrl, token]);

  useEffect(() => {
    const onCtx = (e) => e.preventDefault();
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && ["s", "p", "S", "P"].includes(e.key)) { e.preventDefault(); e.stopPropagation(); }
    };
    document.addEventListener("contextmenu", onCtx);
    window.addEventListener("keydown", onKey, { passive: false });
    return () => { document.removeEventListener("contextmenu", onCtx); window.removeEventListener("keydown", onKey); };
  }, []);

  const userLabel = "StudentKRD • " + new Date().toLocaleString();

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
      </div>

      <div className="relative h-full overflow-hidden">
        {!ready && (
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

        <div className="absolute inset-0 grid place-items-center">
          <video
            ref={videoRef}
            className="max-w-full max-h-full"
            playsInline
            controls
            controlsList="nodownload noremoteplayback noplaybackrate"
            disablePictureInPicture
            style={{ background: "#000" }}
          />
        </div>

        <div className="pointer-events-none absolute top-3 left-3 text-[11px] text-white/70 select-none mix-blend-screen">
          {userLabel}
        </div>
        <div className="pointer-events-none absolute bottom-3 right-3 text-[11px] text-white/60 select-none mix-blend-screen">
          Session {String(token).slice(0, 8)}…
        </div>
      </div>
    </div>
  );
}
