import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  Image as ImageIcon,
  Loader2,
  Search,
  Maximize2,
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
  if (!r.ok) throw new Error("Network error");
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
  const subject = params.get("subject");
  const grade = params.get("grade");
  const stream = params.get("stream");

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
          total: j?.total || flat.length,
        });
      } catch (e) {
        if (!ok) return;
        setErr("هەڵە لە بارکردنی گەلەری.");
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
        last: j?.last_page || next,
        total: j?.total || (prev => prev?.length || 0),
      });
    } catch {
      setErr("نەتوانرا پەڕەی دواتر بکرێت.");
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
          // Prefer meta?.description if your API adds it later; fallback to label
          const description = (it?.meta && (it.meta.description || it.meta.desc)) || it?.label || p?.title || "وێنە";
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

  // Lightbox
  const openAt = (i) => { setIdx(i); setZoom(1); setOpen(true); };
  const close = () => setOpen(false);
  const next = useCallback(() => {
    setIdx((i) => (i + 1) % view.length);
    setZoom(1);
  }, [view.length]);
  const prev = useCallback(() => {
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

  const fit = () => setZoom(1);
  const zoomIn = () => setZoom((z) => Math.min(4, z + 0.25));
  const zoomOut = () => setZoom((z) => Math.max(0.5, z - 0.25));

  return (
    <div dir="rtl" className="p-3 sm:p-5 space-y-4">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-sky-500/10 to-indigo-500/5 p-3 sm:p-4 sticky top-2 z-10">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-white">
              <ImageIcon className="w-5 h-5 text-sky-300" />
              <div className="font-extrabold text-lg">گەلەری — وێنەکانی به‌نده‌كان</div>
              {meta.total ? <span className="text-[11px] text-zinc-300">({meta.total})</span> : null}
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
                  className="w-full sm:w-[320px] rounded-2xl bg-zinc-900/60 border border-white/10 text-white text-sm px-10 py-2.5 outline-none focus:ring-2 focus:ring-sky-400/30"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              </div>
            </div>
          </div>

          {/* filters row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[12px] text-zinc-300">
              <Filter className="w-4 h-4" /> فلتەر:
            </span>

            {/* Session select */}
            <label className="flex items-center gap-2 text-[12px] text-zinc-300">
              به‌ندی:
              <select
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
                className="rounded-xl bg-zinc-900/60 border border-white/10 text-white px-2 py-1 outline-none focus:ring-2 focus:ring-sky-400/30"
              >
                <option value="all">هەموو به‌نده‌كان</option>
                {sessions.map((s) => (
                  <option key={s} value={s}>
                    به‌ندی {s}
                  </option>
                ))}
              </select>
            </label>

            {/* Quick chips */}
            {sessions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSessionFilter("all")}
                  className={`px-2 py-1 rounded-lg text-[11px] border ${
                    sessionFilter === "all" ? "bg-sky-500/20 border-sky-400/30 text-white" : "bg-white/5 border-white/10 text-zinc-300"
                  }`}
                >
                  هەموو
                </button>
                {sessions.slice(0, 8).map((s) => (
                  <button
                    key={`chip-${s}`}
                    onClick={() => setSessionFilter(String(s))}
                    className={`px-2 py-1 rounded-lg text-[11px] border ${
                      String(sessionFilter) === String(s) ? "bg-sky-500/20 border-sky-400/30 text-white" : "bg-white/5 border-white/10 text-zinc-300"
                    }`}
                  >
                    {`به‌ندی ${s}`}
                  </button>
                ))}
                {sessions.length > 8 && (
                  <span className="px-2 py-1 text-[11px] text-zinc-400">…</span>
                )}
              </div>
            )}

            {/* Active filters (subject/grade/stream) */}
            <div className="flex flex-wrap gap-2 ml-auto text-[11px] text-zinc-300">
              {/* {subjectId && <span className="px-2 py-1 rounded-xl bg-white/5 border border-white/10">#ID بابەت: {subjectId}</span>} */}
              {/* {subject && <span className="px-2 py-1 rounded-xl bg-white/5 border border-white/10">بابەت: {subject}</span>} */}
              {grade && <span className="px-2 py-1 rounded-xl bg-white/5 border border-white/10">پۆل: {grade}</span>}
              {stream && <span className="px-2 py-1 rounded-xl bg-white/5 border border-white/10">پۆڵێن: {streamLabel}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {err && <div className="text-red-300 text-sm">{err}</div>}

      {/* Grid */}
      {loading && images.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {SKELETONS.map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-zinc-900/60 border border-white/10">
              <div className="aspect-[3/4] w-full animate-pulse bg-zinc-800/80" />
              <div className="p-3 space-y-2">
                <div className="h-3 w-3/4 bg-zinc-800/70 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-zinc-800/60 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : view.length === 0 ? (
        <div className="text-zinc-400">هیچ وێنەیەک بەم فلتەرە نییە.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {view.map((im, i) => (
              <button
                key={`${im.paperId}-${im.session}-${im.sort}-${i}`}
                className="group text-right rounded-2xl overflow-hidden bg-zinc-900/60 border border-white/10 hover:border-sky-400/30 transition"
                onClick={() => openAt(i)}
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-800">
                  <img
                    src={im.thumb}
                    alt={im.description || im.label || "image"}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* badges */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    {typeof im.session === "number" && (
                      <span className="px-2 py-1 rounded-lg text-[10px] bg-black/50 backdrop-blur border border-white/10 text-sky-200">
                        به‌ندی {im.session}
                      </span>
                    )}
                    {im.subjectName && (
                      <span className="px-2 py-1 rounded-lg text-[10px] bg-black/50 backdrop-blur border border-white/10 text-zinc-100">
                        {im.subjectName}
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>
                <div className="p-3">
                  {/* Title/Description block */}
                  <div className="text-[12px] text-zinc-200 font-medium line-clamp-1">
                    {im.title || "وێنە"}
                  </div>
                  <div className="text-[11px] text-zinc-400 line-clamp-2">
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
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm border border-white/10"
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
          className="fixed inset-0 bg-black/90 z-50 flex flex-col"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          {/* Top bar */}
          <div className="p-2 sm:p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[12px] text-zinc-300">
              <span className="hidden sm:inline-block px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                {view[idx]?.subjectName || "بابەت"}
              </span>
              {typeof view[idx]?.session === "number" && (
                <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                  به‌ندی {view[idx].session}
                </span>
              )}
              <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                پەڕە {idx + 1} / {view.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={fit} className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-sm" title="فیت">
                <Minimize2 className="w-4 h-4" />
              </button>
              <button onClick={zoomOut} className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-sm" title="زوم کەم">
                <ZoomOut className="w-4 h-4" />
              </button>
              <button onClick={zoomIn} className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-sm" title="زوم زیاد">
                <ZoomIn className="w-4 h-4" />
              </button>
              <button onClick={downloadCurrent} className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-sm" title="داگرتن">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={close} className="ml-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm" title="داخستن">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Viewer */}
          <div className="relative flex-1 overflow-hidden">
            {/* Prev / Next */}
            <div className="absolute inset-y-0 left-0 w-16 flex items-center justify-center">
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white"
                title="پەڕەی پێشوو"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-0 w-16 flex items-center justify-center">
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white"
                title="پەڕەی داهاتوو"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>

            {/* Image canvas */}
            <div className="w-full h-full flex items-center justify-center select-none">
              <div className="max-w-[95vw] max-h-[75vh] overflow-auto">
                <img
                  ref={imgRef}
                  src={view[idx].url}
                  alt={view[idx].description || view[idx].label || "image"}
                  style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
                  className="transition-transform duration-200 block mx-auto"
                  draggable={false}
                />
              </div>
            </div>
          </div>

          {/* Bottom caption */}
          <div className="w-full border-t border-white/10 bg-black/70 backdrop-blur">
            <div className="max-w-5xl mx-auto p-3 sm:p-4">
              <div className="text-right">
                <div className="text-[13px] text-white font-semibold">
                  {view[idx].title || "وێنە"}
                </div>
                <div className="text-[12px] text-zinc-300 leading-6">
                  {view[idx].description || view[idx].label || "—"}
                </div>
                <div className="mt-1 text-[11px] text-zinc-400 flex flex-wrap gap-2">
                  {view[idx]?.subjectName && <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">{view[idx].subjectName}</span>}
                  {typeof view[idx]?.session === "number" && <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">به‌ندی {view[idx].session}</span>}
                  <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">پەڕە {idx + 1}/{view.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
