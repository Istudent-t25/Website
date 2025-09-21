// src/pages/Gallery.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  Image as ImageIcon,
  Loader2,
  Search,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Download,
  ChevronRight,
  ChevronLeft,
  X,
  Filter
} from "lucide-react";

const API_PAPERS = "https://api.studentkrd.com/api/v1/papers";

async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) {
    const errorBody = await r.text();
    console.error("API Error Response:", errorBody);
    throw new Error(`Network error: ${r.status} ${r.statusText}`);
  }
  return r.json();
}

function streamKurdish(s) {
  if (s === "scientific") return "زانستی";
  if (s === "literary") return "ئەدەبی";
  if (s === "both") return "هاوبەش";
  return null;
}

const SKELETONS = new Array(12).fill(0);

function buildQuery({ subjectId, subject, grade, stream, page = 1, perPage = 24 }) {
  const sp = new URLSearchParams();
  sp.set("type", "images_of_sessions");
  if (subjectId) sp.set("subject_id", subjectId);
  else if (subject) sp.set("subject", subject);
  if (grade) sp.set("grade", grade);
  if (stream) sp.set("stream", stream);
  sp.set("page", String(page));
  sp.set("per_page", String(perPage));
  return `${API_PAPERS}?${sp.toString()}`;
}

export default function Gallery() {
  const loc = useLocation();
  const params = useMemo(() => new URLSearchParams(loc.search), [loc.search]);

  const subjectId = params.get("subject_id");
  const subject   = params.get("subject");
  const grade     = params.get("grade");
  const stream    = params.get("stream");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [meta, setMeta] = useState({ page: 1, last: 1, total: 0 });
  const [images, setImages] = useState([]);

  // search + session filter
  const [q, setQ] = useState("");
  const [sessionFilter, setSessionFilter] = useState("all"); // 'all' | number

  // sessions list derived from data
  const sessions = useMemo(() => {
    const set = new Set();
    images.forEach((x) => typeof x.session === "number" && set.add(x.session));
    return Array.from(set).sort((a, b) => a - b);
  }, [images]);

  // Lightbox
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const imgRef = useRef(null);

  const streamLabel = streamKurdish(stream);

  useEffect(() => {
    let ok = true;
    (async () => {
      setErr("");
      setLoading(true);
      setImages([]);
      setMeta({ page: 1, last: 1, total: 0 });
      setSessionFilter("all");
      try {
        const url = buildQuery({ subjectId, subject, grade, stream, page: 1, perPage: 24 });
        const j = await fetchJSON(url);
        if (!ok) return;

        const flat = flattenImages(j?.data || []);
        setImages(flat);
        setMeta({
          page: j?.current_page || 1,
          last: j?.last_page || 1,
          total: j?.total ?? flat.length,
        });
      } catch (e) {
        if (!ok) return;
        setErr("هەڵە لە بارکردنی گەلەری.");
        console.error("Failed to load gallery:", e);
      } finally {
        setLoading(false);
      }
    })();
    return () => { ok = false; };
  }, [subjectId, subject, grade, stream]);

  const loadMore = async () => {
    if (meta.page >= meta.last) return;
    const next = meta.page + 1;
    setLoading(true);
    try {
      const url = buildQuery({ subjectId, subject, grade, stream, page: next, perPage: 24 });
      const j = await fetchJSON(url);
      const flat = flattenImages(j?.data || []);
      setImages(prev => prev.concat(flat));
      setMeta({
        page: j?.current_page || next,
        last: j?.last_page || Math.max(next, meta.last),
        total: j?.total ?? (images.length + flat.length),
      });
    } catch {
      setErr("نەتوانرا پەڕەی دواتر بكرێت.");
    } finally {
      setLoading(false);
    }
  };

  function flattenImages(papers) {
    const list = [];
    for (const p of papers) {
      const base = {
        paperId: p.id,
        subjectId: p?.subject_id || p?.subject?.id,
        subjectName: p?.subject?.name,
        grade: p?.grade,
        stream: p?.stream,
        title: p?.title,
      };
      if (Array.isArray(p?.items)) {
        for (const it of p.items) {
          if (!it?.url) continue;
          const description =
            (it?.meta && (it.meta.description || it.meta.desc)) ||
            it?.label ||
            p?.title ||
            "وێنە";
          list.push({
            ...base,
            url: it.url,
            thumb: it.thumb_url || it.url,
            label: it.label,
            description,
            session: typeof it.session_no === "number" ? it.session_no : null,
            sort: it.sort_order || 0,
          });
        }
      }
    }
    list.sort((a, b) => (a.session || 0) - (b.session || 0) || a.sort - b.sort);
    return list;
  }

  // Apply filters
  const filteredBySession = useMemo(() => {
    if (sessionFilter === "all") return images;
    const sNum = Number(sessionFilter);
    return images.filter((x) => x.session === sNum);
  }, [images, sessionFilter]);

  const view = useMemo(() => {
    if (!q.trim()) return filteredBySession;
    const n = q.trim().toLowerCase();
    return filteredBySession.filter(x =>
      (x.description || "").toLowerCase().includes(n) ||
      (x.title || "").toLowerCase().includes(n) ||
      (x.subjectName || "").toLowerCase().includes(n)
    );
  }, [filteredBySession, q]);

  // Lightbox controls
  const openAt = (i) => { setIdx(i); setZoom(1); setOpen(true); };
  const close = () => setOpen(false);

  const next = useCallback(() => {
    if (view.length === 0) return;
    setIdx((i) => (i + 1) % view.length);
    setZoom(1);
  }, [view.length]);

  const prev = useCallback(() => {
    if (view.length === 0) return;
    setIdx((i) => (i - 1 + view.length) % view.length);
    setZoom(1);
  }, [view.length]);

  const onKey = useCallback((e) => {
    if (!open) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") prev();
    else if (e.key === "+") setZoom(z => Math.min(4, z + 0.25));
    else if (e.key === "-") setZoom(z => Math.max(0.5, z - 0.25));
    if (["ArrowRight", "ArrowLeft", "+", "-"].includes(e.key)) e.preventDefault();
  }, [open, next, prev]);

  useEffect(() => {
    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  // Lock page scroll while lightbox open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const downloadCurrent = () => {
    const cur = view[idx];
    if (!cur?.url) return;
    const a = document.createElement("a");
    a.href = cur.url;
    a.download = (cur.label || cur.title || "image").toString();
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const fit     = () => setZoom(1);
  const zoomIn  = () => setZoom((z) => Math.min(4, z + 0.25));
  const zoomOut = () => setZoom((z) => Math.max(0.5, z - 0.25));

  return (
    <div dir="rtl" className="p-3 sm:p-5 space-y-4 font-kurdish">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg p-3 sm:p-4 sticky top-2 z-10">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-white flex-shrink-0">
              <ImageIcon className="w-5 h-5 text-sky-300" />
              <div className="font-extrabold text-lg">گەلەری — وێنەکان</div>
              {meta.total > 0 && <span className="text-[11px] text-zinc-300">({meta.total})</span>}
            </div>
            <div className="flex-1" />
            <div className="grid grid-cols-1 gap-3 w-full sm:w-auto">
              {/* search */}
              <div className="relative">
                <input
                  dir="rtl"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="گەڕان لە ناونیشان/وەسف/بابەت…"
                  className="w-full sm:w-[320px] rounded-2xl bg-white/5 border border-white/10 text-white text-sm px-10 py-2.5 outline-none focus:ring-2 focus:ring-sky-400/30"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              </div>
            </div>
          </div>

          {/* filters row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[12px] text-zinc-300 flex-shrink-0">
              <Filter className="w-4 h-4" /> فلتەر:
            </span>

            {/* Session select */}
            <label className="flex items-center gap-2 text-[12px] text-zinc-300 flex-shrink-0">
              بەندی:
              <select
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
                className="rounded-xl bg-white/5 border border-white/10 text-white px-2 py-1 outline-none focus:ring-2 focus:ring-sky-400/30"
              >
                <option value="all">هەموو بەندەکان</option>
                {sessions.map((s) => (
                  <option key={s} value={s}>
                    بەندی {s}
                  </option>
                ))}
              </select>
            </label>

            {/* Quick chips */}
            {sessions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 flex-1 min-w-0 overflow-x-auto custom-scrollbar">
                <button
                  onClick={() => setSessionFilter("all")}
                  className={`px-2 py-1 rounded-lg text-[11px] border flex-shrink-0 ${
                    sessionFilter === "all" ? "bg-sky-500/20 border-sky-400/30 text-white" : "bg-white/5 border-white/10 text-zinc-300"
                  }`}
                >
                  هەموو
                </button>
                {sessions.slice(0, 8).map((s) => (
                  <button
                    key={`chip-${s}`}
                    onClick={() => setSessionFilter(String(s))}
                    className={`px-2 py-1 rounded-lg text-[11px] border flex-shrink-0 ${
                      String(sessionFilter) === String(s) ? "bg-sky-500/20 border-sky-400/30 text-white" : "bg-white/5 border-white/10 text-zinc-300"
                    }`}
                  >
                    {`بەندی ${s}`}
                  </button>
                ))}
                {sessions.length > 8 && (
                  <span className="px-2 py-1 text-[11px] text-zinc-400 flex-shrink-0">…</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {err && <div className="text-red-300 text-sm">{err}</div>}

      {/* Grid / States */}
      {loading && images.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {SKELETONS.map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
              <div className="aspect-w-3 aspect-h-4 w-full animate-pulse bg-zinc-800/80" />
              <div className="p-3 space-y-2">
                <div className="h-3 w-3/4 bg-zinc-800/70 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-zinc-800/60 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : view.length === 0 ? (
        <div className="text-zinc-400 text-center py-12">هیچ وێنەیەک بەم فلتەرە نییە.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {view.map((im, i) => (
              <button
                key={`${im.paperId}-${im.session}-${im.sort}-${i}`}
                className="group text-right rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-sky-400/30 transition-all duration-300 relative"
                onClick={() => openAt(i)}
              >
                <div className="relative aspect-w-3 aspect-h-4 w-full overflow-hidden">
                  <img
                    src={im.thumb}
                    alt={im.description || im.label || "image"}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                </div>
                {/* badges on top of image */}
                <div className="absolute top-3 right-3 flex flex-col gap-1 items-end pointer-events-none">
                  {typeof im.session === "number" && (
                    <span className="px-2 py-1 rounded-lg text-[10px] bg-black/50 backdrop-blur-sm border border-white/10 text-sky-200">
                      بەندی {im.session}
                    </span>
                  )}
                  {im.subjectName && (
                    <span className="px-2 py-1 rounded-lg text-[10px] bg-black/50 backdrop-blur-sm border border-white/10 text-zinc-100">
                      {im.subjectName}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-[12px] text-zinc-200 font-medium">
                    {im.title || "وێنە"}
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    {im.description || im.label || "—"}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {meta.page < meta.last && (
            <div className="flex justify-center py-4">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm border border-white/10 transition-all duration-300"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> زیاتر باربکە
                  </span>
                ) : "زیاتر باربکە"}
              </button>
            </div>
          )}
        </>
      )}

      {/* LIGHTBOX */}
      {open && view[idx] && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex flex-col"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          {/* Top bar */}
          <div className="p-2 sm:p-3 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-2 text-[12px] text-zinc-300">
              <div className="hidden sm:inline-block px-2 py-1 rounded-lg bg-white/5 border border-white/10">{view[idx]?.subjectName || "بابەت"}</div>
              {typeof view[idx]?.session === "number" && (
                <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/10">بەندی {view[idx].session}</div>
              )}
              <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/10">پەڕە {idx + 1} / {view.length}</div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={fit} className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-sm transition-colors duration-200 hover:bg-white/10" title="فیت"><Minimize2 className="w-4 h-4" /></button>
              <button onClick={zoomOut} className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-sm transition-colors duration-200 hover:bg-white/10" title="زوم کەم"><ZoomOut className="w-4 h-4" /></button>
              <button onClick={zoomIn} className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-sm transition-colors duration-200 hover:bg-white/10" title="زوم زیاد"><ZoomIn className="w-4 h-4" /></button>
              <button onClick={downloadCurrent} className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-sm transition-colors duration-200 hover:bg-white/10" title="داگرتن"><Download className="w-4 h-4" /></button>
              <button onClick={close} className="ml-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm transition-colors duration-200" title="داخستن"><X className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Viewer stage */}
          <div className="relative flex-1 min-h-0 overflow-hidden flex items-center justify-center">
            {/* Side Prev / Next */}
            {view.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="absolute left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
                  title="پەڕەی پێشوو"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  className="absolute right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
                  title="پەڕەی داهاتوو"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </>
            )}

            <div className="h-full w-full overflow-auto">
              <div className="mx-auto h-full flex justify-center items-start pt-8 pb-16">
                <img
                  ref={imgRef}
                  src={view[idx].url}
                  alt={view[idx].description || view[idx].title || view[idx].label || "image"}
                  style={{ width: `${zoom * 100}%`, height: "auto", display: "block", maxWidth: "100%" }}
                  className="select-none"
                  draggable={false}
                />
              </div>
            </div>
          </div>

          {/* Bottom caption */}
          <div className="shrink-0 w-full border-t border-white/5 bg-black/50 backdrop-blur-lg">
            <div className="max-w-5xl mx-auto p-3 sm:p-4 text-right">
              <div className="text-[13px] text-white font-semibold">{view[idx].title || "وێنە"}</div>
              <div className="text-[12px] text-zinc-300 leading-6">{view[idx].description || view[idx].label || "—"}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}