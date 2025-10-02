// src/pages/BooksAndBooklets.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  FileDown,
  GraduationCap,
  BadgeInfo,
  User2,
  Loader2,
  Search,
  Filter,
} from "lucide-react";

const API_DOCS = "https://api.studentkrd.com/api/v1/documents";

/* ----------------- utils ----------------- */
async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("Network error");
  return r.json();
}

// normalize "track" to "stream"
function normalizeStream(v) {
  const s = String(v || "").trim().toLowerCase();
  if (["scientific", "science", "sci", "scinetific", "scentific", "scenitif"].includes(s)) return "scientific";
  if (["literary", "literature", "lit", "ltr"].includes(s)) return "literary";
  if (["both", "all"].includes(s)) return "both";
  return "";
}

function streamKurdish(s) {
  if (!s) return null;
  const v = String(s).toLowerCase();
  if (v === "scientific") return "زانستی";
  if (v === "literary") return "ئەدەبی";
  if (v === "both") return "هاوبەش";
  return "—";
}

function typeKurdish(t) {
  const v = (t || "").toLowerCase();
  if (v === "book") return "کتێب";
  if (v === "booklet") return "مه‌لزه‌مه‌";
  if (v === "guide") return "ڕێبرد";
  return "بەلگە";
}

function buildQuery({ subjectId, subject, grade, stream, page = 1, perPage = 12 }) {
  const sp = new URLSearchParams();
  if (subjectId) sp.set("subject_id", subjectId);
  else if (subject) sp.set("subject", subject);
  if (grade) sp.set("grade", grade);
  if (stream) sp.set("stream", stream);
  sp.set("page", String(page));
  sp.set("per_page", String(perPage));
  return `${API_DOCS}?${sp.toString()}`;
}

/* -------- viewer helpers (for openInViewer) -------- */
function toCU(raw) {
  if (!raw) return "";
  try {
    // make sure we return an absolute, well-formed URL (keeps query params)
    const u = new URL(raw, window.location.origin);
    return u.toString();
  } catch {
    // last resort: basic cleanup
    if (raw.startsWith("//")) return `${window.location.protocol}${raw}`;
    return raw;
  }
}
function getExt(u) {
  try {
    const path = new URL(u).pathname;
    const clean = path.includes(".") ? path.substring(path.lastIndexOf(".") + 1) : "";
    return clean.toLowerCase();
  } catch {
    const p = String(u).split("?")[0];
    return p.includes(".") ? p.substring(p.lastIndexOf(".") + 1).toLowerCase() : "";
  }
}
function isPDF(u) {
  return getExt(u) === "pdf";
}
function isImage(u) {
  return /^(png|jpg|jpeg|gif|webp|bmp|tiff|svg)$/i.test(getExt(u));
}
function isVideoFile(u) {
  return /^(mp4|webm|mov|mkv|m4v|m3u8|ts)$/i.test(getExt(u));
}

/* ----------------- skeletons ----------------- */
function SkeletonBar({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-white/10 ${className}`} />;
}

function DocCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 overflow-hidden">
      <div className="aspect-[16/10] w-full bg-white/5" />
      <div className="p-4 space-y-3">
        <SkeletonBar className="h-4 w-3/4" />
        <div className="flex gap-2">
          <SkeletonBar className="h-3 w-20" />
          <SkeletonBar className="h-3 w-16" />
          <SkeletonBar className="h-3 w-24" />
        </div>
        <div className="flex justify-end gap-2">
          <SkeletonBar className="h-9 w-24 rounded-xl" />
          <SkeletonBar className="h-9 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ----------------- components ----------------- */
function Thumb({ src, alt, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-800 group"
      title={alt || "thumbnail"}
    >
      {src ? (
        <>
          <img
            src={src}
            alt={alt || "thumbnail"}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </>
      ) : (
        <div className="absolute inset-0 grid place-items-center text-zinc-500">
          <BookOpen className="w-8 h-8" />
        </div>
      )}
    </button>
  );
}

function BookCard({ doc }) {
  const navigate = useNavigate();
  const title = doc?.title || "کتێب/مه‌لزه‌مه‌";
  const fileUrl = doc?.file_url || doc?.pdf_url || doc?.image_url || doc?.thumb_url || "";
  const subject = doc?.subject?.name;
  const grade = doc?.grade;
  const track = streamKurdish(doc?.stream);
  const teacher = doc?.teacher?.full_name;
  const type = typeKurdish(doc?.type);

  const openInViewer = (item) => {
    const raw   = item?.pdf_url || item?.file_url || item?.image_url || item?.thumb_url || "";
    const url   = toCU(raw);
    if (!url) return;
    const t     = item?.title || item?.name || "Viewer";
    const kind  = isPDF(url) ? "pdf" : isImage(url) ? "image" : isVideoFile(url) ? "video" : "file";
    navigate(`/viewer?u=${encodeURIComponent(url)}&t=${encodeURIComponent(t)}&type=${kind}`);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 overflow-hidden hover:border-white/20 transition">
      <Thumb src={doc?.thumb_url} alt={title} onClick={() => openInViewer(doc)} />
      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-xl bg-black/30 border border-white/10 p-2">
            <BookOpen className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="flex-1 text-right">
            <div className="text-white font-semibold leading-6 line-clamp-2">{title}</div>

            <div className="mt-2 flex flex-wrap gap-2 text-[12px] text-zinc-300">
              {type && <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">{type}</span>}
              {subject && <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">{subject}</span>}
              {typeof grade !== "undefined" && grade !== null && (
                <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">
                  <GraduationCap className="inline w-3 h-3 ml-1" />
                  پۆل {grade}
                </span>
              )}
              {track && track !== "—" && (
                <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">جۆر {track}</span>
              )}
              {teacher && (
                <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 inline-flex items-center gap-1">
                  <User2 className="w-3 h-3" />
                  {teacher}
                </span>
              )}
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => openInViewer(doc)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm"
              >
                بینین
              </button>
              {fileUrl && (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm"
                >
                  <FileDown className="w-4 h-4" />
                  داگرتن
                </a>
              )}
            </div>
          </div>
        </div>

        {/* description (optional) */}
        {doc?.description && (
          <div className="mt-3 text-[12px] text-zinc-400 line-clamp-2">
            {doc.description}
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------- page ----------------- */
export default function BooksAndBooklets() {
  const loc = useLocation();
  const params = useMemo(() => new URLSearchParams(loc.search), [loc.search]);

  const subjectIdQS = params.get("subject_id");
  const subjectQS   = params.get("subject");
  const gradeQS     = params.get("grade");
  const streamQS    = params.get("stream");

  // sensible defaults if not provided via query
  const grade   = gradeQS || localStorage.getItem("grade") || "";
  const stream0 = normalizeStream(streamQS || localStorage.getItem("track") || "");
  const stream  = stream0 || ""; // empty means "no filter" for API

  const [docs, setDocs] = useState([]);
  const [meta, setMeta] = useState({ page: 1, last: 1, total: 0 });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [q, setQ] = useState("");

  const trackLabel = streamKurdish(stream);

  useEffect(() => {
    let ok = true;
    (async () => {
      setErr("");
      setInitialLoading(true);
      setDocs([]);
      setMeta({ page: 1, last: 1, total: 0 });
      try {
        const url = buildQuery({
          subjectId: subjectIdQS,
          subject: subjectQS,
          grade,
          stream,
          page: 1,
          perPage: 12,
        });
        const j = await fetchJSON(url);
        if (!ok) return;
        setDocs(j?.data || []);
        setMeta({
          page: j?.current_page || 1,
          last: j?.last_page || 1,
          total: j?.total || (j?.data?.length || 0),
        });
      } catch {
        if (!ok) return;
        setErr("نەتوانرا کتێب ەکان باربکرێن.");
      } finally {
        setInitialLoading(false);
      }
    })();
    return () => { ok = false; };
  }, [subjectIdQS, subjectQS, grade, stream]);

  const loadMore = async () => {
    if (meta.page >= meta.last) return;
    const next = meta.page + 1;
    setLoading(true);
    try {
      const url = buildQuery({
        subjectId: subjectIdQS,
        subject: subjectQS,
        grade,
        stream,
        page: next,
        perPage: 12,
      });
      const j = await fetchJSON(url);
      setDocs(prev => prev.concat(j?.data || []));
      setMeta({ page: j?.current_page || next, last: j?.last_page || next, total: j?.total || 0 });
    } catch {
      setErr("نەتوانرا پەڕەی داهاتوو بکرێت.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return docs;
    const match = (s) => (s || "").toString().toLowerCase().includes(n);
    return (docs || []).filter(d =>
      match(d?.title) ||
      match(d?.subject?.name) ||
      match(d?.type) ||
      match(String(d?.grade ?? "")) ||
      match(d?.description)
    );
  }, [docs, q]);

  return (
    <div dir="rtl" className="p-3 sm:p-5 space-y-4">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-3 sm:p-4 sticky top-2 z-10">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-white">
            <BookOpen className="w-5 h-5 text-emerald-300" />
            <div className="font-extrabold text-lg sm:text-xl">کتێب </div>
            {meta.total ? <span className="text-[11px] text-zinc-300">({meta.total})</span> : null}
          </div>

          {/* context badges */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-300">
            {subjectIdQS && <span className="px-2 py-1 rounded-xl bg-white/5 border border-white/10">#ID بابەت: {subjectIdQS}</span>}
            {subjectQS && <span className="px-2 py-1 rounded-xl bg-white/5 border border-white/10">بابەت: {subjectQS}</span>}
            {grade && (
              <span className="px-2 py-1 rounded-xl bg-white/5 border border-white/10">
                <GraduationCap className="inline w-3 h-3 mr-1" />
                پۆل: {grade}
              </span>
            )}
            {stream && <span className="px-2 py-1 rounded-xl bg-white/5 border border-white/10">جۆر: {trackLabel}</span>}
            <span className="px-2 py-1 rounded-xl bg-white/5 border border-white/10 inline-flex items-center gap-1">
              <BadgeInfo className="w-3 h-3" /> تکایە کرتە لە «بینین» بکە بۆ پەڕەی دیمەنەری فایل
            </span>
          </div>

          {/* search */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-[360px]">
              <input
                dir="rtl"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="گەڕان لە ناونیشان، جۆر، بابەت..."
                className="w-full rounded-2xl bg-zinc-900/60 border border-white/10 text-white text-sm px-10 py-2.5 outline-none focus:ring-2 focus:ring-emerald-400/30"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-[12px] text-zinc-400">
              <Filter className="w-4 h-4" /> فلتەری ناوەڕۆک
            </span>
          </div>
        </div>
      </div>

      {/* Error */}
      {err && <div className="text-red-300 text-sm">{err}</div>}

      {/* Initial Skeletons */}
      {initialLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <DocCardSkeleton key={i} />)}
        </div>
      )}

      {/* Empty */}
      {!initialLoading && filtered.length === 0 && (
        <div className="text-zinc-400">هیچ کتێب/مه‌لزه‌مه‌ێک نەدۆزرایەوە.</div>
      )}

      {/* Grid */}
      {!initialLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <BookCard key={`doc-${d.id}`} doc={d} />
          ))}
        </div>
      )}

      {/* Load more */}
      {!initialLoading && meta.page < meta.last && (
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
    </div>
  );
}
