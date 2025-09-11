// src/pages/Viewer.jsx
import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Download } from "lucide-react";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Viewer() {
  const q = useQuery();
  const nav = useNavigate();

  const url = q.get("url") || "";
  const title = q.get("title") || "بینین";
  const label = q.get("label") || "";
  const referer = q.get("from") || "";

  const isPDF = /\.pdf(\?|$)/i.test(url);
  const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(url);

  const back = () => (referer ? nav(referer) : nav(-1));

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-950 text-white">
      {/* top bar */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-zinc-900/70 backdrop-blur px-3 sm:px-5 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={back}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"
            title="گەڕانەوە"
          >
            <ArrowRight className="w-4 h-4" />
            گەڕانەوە
          </button>
          <div className="flex-1" />
          <div className="truncate text-sm sm:text-base font-semibold">{title}</div>
          {label && (
            <span className="ml-2 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-zinc-300 truncate">
              {label}
            </span>
          )}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"
            >
              <Download className="w-4 h-4" />
              داگرتن
            </a>
          )}
        </div>
      </div>

      {/* viewer */}
      <div className="p-3 sm:p-5">
        {!url ? (
          <div className="text-zinc-300">ناونیشانی فایل نەهاتووە.</div>
        ) : isPDF ? (
          <div className="w-full h-[78vh] bg-black/40 rounded-2xl overflow-hidden border border-white/10">
            <iframe
              title={title}
              src={url}
              className="w-full h-full"
              allow="fullscreen"
            />
          </div>
        ) : isImage ? (
          <div className="w-full flex items-center justify-center">
            <img
              src={url}
              alt={title}
              className="max-w-full max-h-[80vh] rounded-2xl border border-white/10"
            />
          </div>
        ) : (
          <div className="text-zinc-300">
            جۆری فایل پشتیوانی نەکراوە — تکایە بکەوە{" "}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-sky-300"
            >
              لە نوێتابێکدا
            </a>.
          </div>
        )}
      </div>
    </div>
  );
}
