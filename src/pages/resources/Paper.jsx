// src/pages/Papers.jsx
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FileText,
  FileCheck2,
  Image as ImageIcon,
  GraduationCap,
  ClipboardList,
  Layers,
  Loader2,
  Search,
  ArrowRightCircle,
  CalendarDays,
  User2,
  BookOpen,
  Download,
  BookOpenCheck,
  Filter,
  Maximize2,
  Images as ImagesIcon,
  ChevronRight,
  ChevronLeft,
  X,
  ZoomIn,
  ZoomOut,
  Minimize2,
} from "lucide-react";

/* =========================
   CONFIG / META
   ========================= */
const API_PAPERS = "https://api.studentkrd.com/api/v1/papers";
const PER_PAGE = 12;

const TYPE_META = {
  national_exam: { title: "ئه‌سیله‌ی نیشتیمانی(وزاری)", icon: FileCheck2, tone: "text-cyan-300", bg: "bg-cyan-900/20 ring-cyan-500/10" },
  important_note: { title: "تێبینی گرنگ", icon: FileText, tone: "text-purple-300", bg: "bg-purple-900/20 ring-purple-500/10" },
  important_questions: { title: "ئەسیلەی گرنگ", icon: ClipboardList, tone: "text-amber-300", bg: "bg-amber-900/20 ring-amber-500/10" },
  worksheet: { title: "ڕاهێنان/کارەکان", icon: Layers, tone: "text-emerald-300", bg: "bg-emerald-900/20 ring-emerald-500/10" },
  images_of_sessions: { title: "وێنەکان", icon: ImageIcon, tone: "text-sky-300", bg: "bg-sky-900/20 ring-sky-500/10" },
  book: { title: "کتێب و مه‌لزه‌مه‌", icon: BookOpenCheck, tone: "text-emerald-300", bg: "bg-emerald-900/20 ring-emerald-500/10" },
  bundle: { title: "کۆکردەوە", icon: FileText, tone: "text-zinc-300", bg: "bg-zinc-800/20 ring-zinc-500/10" },
};

const STREAM_MAP = { scientific: "زانستی", literary: "ئەدەبی", both: "هاوبەش" };

/* =========================
   UTILITIES
   ========================= */
async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("Network error");
  return r.json();
}
function buildQuery({ subjectId, subject, grade, stream, type, page = 1, perPage = PER_PAGE }) {
  const sp = new URLSearchParams();
  if (type) sp.set("type", type);
  if (subjectId) sp.set("subject_id", subjectId);
  else if (subject) sp.set("subject", subject);
  if (grade) sp.set("grade", grade);
  if (stream) sp.set("stream", stream);
  sp.set("page", String(page));
  sp.set("per_page", String(perPage));
  return `${API_PAPERS}?${sp.toString()}`;
}
function streamLabel(s) {
  return STREAM_MAP[(s || "").toLowerCase()] || s || "";
}
function formatDate(d) {
  if (!d) return null;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const da = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}
function toDl(u) {
  try { return new URL(u).toString(); } catch { return u; }
}
function toCU(u) {
  if (!u) return "";
  try { return new URL(u).toString(); } catch { return String(u).trim(); }
}
function ext(u = "") {
  const m = /[#?]/.test(u) ? u.split(/[?#]/)[0] : u;
  const p = m.split(".").pop();
  return (p || "").toLowerCase();
}
function isPDF(u) { return ext(u) === "pdf"; }
function isImage(u) { return ["png","jpg","jpeg","webp","gif","bmp","svg","avif"].includes(ext(u)); }
function isVideoFile(u) { return ["mp4","m3u8","webm","mov","mkv","avi"].includes(ext(u)); }
function hasThumbnail(item) {
  return item?.thumb_url && isImage(item.thumb_url);
}

/* =========================
   UI PRIMITIVES
   ========================= */
function Pill({ className = "", children }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg ring-1 text-[11px] ${className}`}>
      {children}
    </span>
  );
}
function YearBadge({ ys, ye }) {
  if (!ys || !ye) return null;
  return <Pill className="bg-white/5 ring-white/10 text-zinc-300">{ys}–{String(ye).slice(-2)}</Pill>;
}
function TermBadge({ t }) {
  if (!t) return null;
  return <Pill className="bg-white/5 ring-white/10 text-zinc-300">خولی {t}</Pill>;
}
function SessionBadge({ s }) {
  if (s === undefined || s === null) return null;
  return <Pill className="bg-white/5 ring-white/10 text-zinc-300">به‌ندی {s}</Pill>;
}
function GradeBadge({ g }) {
  if (!g) return null;
  return (
    <Pill className="bg-white/5 ring-white/10 text-zinc-300">
      <GraduationCap className="w-3 h-3" />
      پۆل {g}
    </Pill>
  );
}
function TrackBadge({ tr }) {
  const lbl = streamLabel(tr);
  if (!lbl) return null;
  return <Pill className="bg-white/5 ring-white/10 text-zinc-300">{lbl}</Pill>;
}
function DateBadge({ d }) {
  const s = formatDate(d);
  if (!s) return null;
  return (
    <Pill className="bg-white/5 ring-white/10 text-zinc-300">
      <CalendarDays className="w-3 h-3" />
      {s}
    </Pill>
  );
}
function LoadingRow() {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-2.5 sm:p-3.5">
      <div className="flex items-start gap-2.5 sm:gap-3">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/5 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 bg-white/10 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
        <div className="w-20 h-8 bg-white/10 rounded animate-pulse hidden xs:block" />
      </div>
    </div>
  );
}

/* =========================
   BIG POST CARD for images_of_sessions
   ========================= */
function ImagePostCard({ item, onOpenInline }) {
  const meta = TYPE_META.images_of_sessions;
  const TypeIcon = meta.icon || ImageIcon;
  const displayLabel = useMemo(() => item.item_label || item.parent_title || "وێنە", [item]);
  const imgSrc = item.url && isImage(item.url) ? item.url : (item.thumb_url || "");

  return (
    <article className="max-w-5xl mx-auto w-full rounded-2xl overflow-hidden border border-white/10 bg-white/5 transition-all duration-300 hover:border-sky-400/30">
      <div className="p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Pill className="bg-white/10 ring-white/20 text-zinc-200">
            <TypeIcon className={`w-3.5 h-3.5 ${meta.tone}`} />
            {meta.title}
          </Pill>
          {item.subject_name && (
            <Pill className="bg-purple-900/20 ring-purple-800/40 text-purple-300">
              {item.subject_name}
            </Pill>
          )}
          {item.teacher_name && (
            <Pill className="bg-rose-900/20 ring-rose-800/40 text-rose-300">
              <User2 className="w-3 h-3" />
              <span className="line-clamp-1">{item.teacher_name}</span>
            </Pill>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenInline}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800/60 ring-1 ring-zinc-700/70 text-zinc-100 text-[12px] hover:bg-zinc-800 inline-flex items-center gap-1"
            title="بینین"
          >
            <Maximize2 className="w-3.5 h-3.5" /> کردنەوە
          </button>
          {item.url && (
            <a
              href={toDl(item.url)}
              download
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900/60 ring-1 ring-zinc-700/70 text-zinc-100 text-[12px] hover:bg-zinc-900 inline-flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5 -mt-0.5" /> داگرتن
            </a>
          )}
        </div>
      </div>

      {imgSrc ? (
        <button className="block w-full text-right" onClick={onOpenInline} title="کردنەوەی وێنە">
          <img
            src={imgSrc}
            alt={displayLabel}
            loading="lazy"
            className="w-full h-auto block select-none"
            draggable={false}
          />
        </button>
      ) : (
        <div className="w-full aspect-[3/2] grid place-items-center bg-zinc-900/60">
          <ImageIcon className="w-8 h-8 text-zinc-500" />
        </div>
      )}

      <div className="p-3 sm:p-4 border-t border-white/10 text-right">
        <h3 className="text-white font-semibold text-base">{displayLabel}</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <SessionBadge s={item.session_no} />
          <YearBadge ys={item.year_start} ye={item.year_end} />
          <TermBadge t={item.term} />
          <DateBadge d={item.date || item.created_at} />
          <GradeBadge g={item.grade} />
          <TrackBadge tr={item.stream} />
        </div>
        {item.parent_title && (
          <div className="mt-1.5 text-[11.5px] text-zinc-400 line-clamp-1">
            لە کۆمەڵەی: {item.parent_title}
          </div>
        )}
      </div>
    </article>
  );
}

/* =========================
   COMPACT ROW (default for other types)
   ========================= */
function ItemRow({ item, onOpen }) {
  const meta = TYPE_META[item.parent_type] || TYPE_META.bundle;
  const TypeIcon = meta.icon || FileText;
  const isImageWithThumb = hasThumbnail(item);

  const displayLabel = useMemo(() => {
    if (item.parent_type === "national_exam") {
      const yearStart = item.year_start ? String(item.year_start) : "";
      const yearEnd = item.year_end ? String(item.year_end).slice(-2) : "";
      const term = item.term ? `خولی ${item.term}` : "";
      return `${item.item_label || item.parent_title} ${yearStart}–${yearEnd} ${term}`.trim();
    }
    return item.item_label || item.parent_title || "پەڕە";
  }, [item]);

  return (
    <div className={`rounded-2xl border border-white/10 ${meta.bg} hover:bg-zinc-900/80 p-2.5 sm:p-3.5`}>
      <div className="flex items-start gap-2.5 sm:gap-3">
        {isImageWithThumb ? (
          <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-white/5">
            <img
              src={item.thumb_url}
              alt={item.item_label || item.parent_title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl grid place-items-center bg-zinc-800/60 ring-1 ring-white/10">
            <TypeIcon size={18} className={meta.tone || "text-zinc-200"} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
            <Pill className="bg-white/10 ring-white/20 text-zinc-200">{meta.title}</Pill>
            {item.subject_name && (
              <Pill className="bg-purple-900/20 ring-purple-800/40 text-purple-300">{item.subject_name}</Pill>
            )}
            {item.teacher_name && (
              <Pill className="bg-rose-900/20 ring-rose-800/40 text-rose-300">
                <User2 className="w-3 h-3" />
                <span className="line-clamp-1">{item.teacher_name}</span>
              </Pill>
            )}
          </div>

          <h3 className="text-[14.5px] sm:text-[15px] font-bold text-white leading-snug line-clamp-2">
            {displayLabel}
          </h3>

          <div className="mt-1.5 sm:mt-2 flex flex-wrap gap-1.5">
            <YearBadge ys={item.year_start} ye={item.year_end} />
            <TermBadge t={item.term} />
            <SessionBadge s={item.session_no} />
            <DateBadge d={item.date || item.created_at} />
            <GradeBadge g={item.grade} />
            <TrackBadge tr={item.stream} />
          </div>

          {item.parent_title && (
            <div className="mt-1.5 text-[11.5px] text-zinc-400 line-clamp-1">
              لە کۆمەڵەی: {item.parent_title}
            </div>
          )}

          <div className="mt-2 flex gap-2 sm:hidden">
            <button
              onClick={onOpen}
              className="flex-1 px-2.5 py-2 rounded-lg bg-zinc-800/60 ring-1 ring-zinc-700/70 text-zinc-100 text-[12px] hover:bg-zinc-800"
            >
              بینین
            </button>
            {item.url && (
              <a
                href={toDl(item.url)}
                download
                className="px-2.5 py-2 rounded-lg bg-zinc-900/60 ring-1 ring-zinc-700/70 text-zinc-100 text-[12px] hover:bg-zinc-900 inline-flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5 -mt-0.5" /> داگرتن
              </a>
            )}
          </div>
        </div>

        <div className="shrink-0 hidden sm:flex flex-col items-end gap-2">
          <button
            onClick={onOpen}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800/60 ring-1 ring-zinc-700/70 text-zinc-100 text-[12px] hover:bg-zinc-800"
          >
            بینین
          </button>
          {item.url && (
            <a
              href={toDl(item.url)}
              download
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900/60 ring-1 ring-zinc-700/70 text-zinc-100 text-[12px] hover:bg-zinc-900 inline-flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5 -mt-0.5" /> داگرتن
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================
   LIGHTBOX (Portal outside Papers)
   ========================= */
function LightboxPortal({
  items,
  index,
  onClose,
  onNext,
  onPrev,
  zoom,
  setZoom,
}) {
  const scrollerRef = useRef(null);

  // keyboard controls
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onNext();
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "+" || (e.ctrlKey && e.key === "=")) setZoom((z) => Math.min(4, z + 0.25));
      else if (e.key === "-" || (e.ctrlKey && e.key === "-")) setZoom((z) => Math.max(0.5, z - 0.25));
      if (["ArrowRight","ArrowLeft","+","-","="].includes(e.key)) e.preventDefault();
    };
    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onNext, onPrev, setZoom]);

  // body lock & scroll to top of overlay
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    scrollerRef.current?.scrollTo({ top: 0 });
    return () => { document.body.style.overflow = prev || "auto"; };
  }, [index]);

  if (!items[index]) return null;
  const cur = items[index];

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] bg-black/95 flex flex-col"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Top bar */}
      <div className="p-2 sm:p-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2 text-[12px] text-zinc-300">
          {cur?.subject_name && (
            <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10">
              {cur.subject_name}
            </span>
          )}
          {typeof cur?.session_no === "number" && (
            <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10">
              بەندی {cur.session_no}
            </span>
          )}
          <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10">
            وێنه‌{index + 1} / {items.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setZoom(1); scrollerRef.current?.scrollTo({ top: 0 }); }}
            className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10"
            title="فیت"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
            className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10"
            title="زوم کەم"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(z => Math.min(4, z + 0.25))}
            className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10"
            title="زوم زیاد"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <a
            href={toDl(cur.url || cur.thumb_url)}
            download={(cur.item_label || cur.parent_title || "image").toString()}
            className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10"
            title="داگرتن"
          >
            <Download className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="ml-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm"
            title="داخستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="relative flex-1 min-h-0">
        {items.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              title="پەڕەی پێشوو"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              title="پەڕەی داهاتوو"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </>
        )}

        <div ref={scrollerRef} className="h-full w-full overflow-y-auto overflow-x-hidden">
          <div className="max-w-5xl mx-auto w-full px-3 sm:px-4 pt-6 pb-24">
            <img
              src={cur.url || cur.thumb_url}
              alt={cur.item_label || cur.parent_title || "image"}
              className="select-none block"
              draggable={false}
              onDoubleClick={() => setZoom(z => (z >= 2 ? 1 : 2))}
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "top center",
                width: "100%",
                height: "auto",
              }}
            />
            <div className="mt-4 text-right">
              <div className="text-[13px] text-white font-semibold">
                {cur.item_label || cur.parent_title || "وێنە"}
              </div>
              <div className="text-[12px] text-zinc-300 leading-7">
                {cur.subject_name || ""}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* =========================
   PAGE
   ========================= */
export default function Papers() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const subjectId = params.get("subject_id") || "";
  const subject = params.get("subject") || "";
  const grade = params.get("grade") || "";
  const stream = params.get("stream") || "";
  const type = params.get("type") || "";

  const [loading, setLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [err, setErr] = useState("");
  const [meta, setMeta] = useState({ page: 1, last: 1, total: 0 });

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");

  // Session filter
  const [sessionFilter, setSessionFilter] = useState("");
  const sessionNumbers = useMemo(() => {
    const nums = new Set();
    rows.forEach(r => {
      if (r.session_no !== undefined && r.session_no !== null) nums.add(r.session_no);
    });
    return Array.from(nums).sort((a, b) => a - b);
  }, [rows]);

  const backParam = `${location.pathname}${location.search}`;
  const headerTitle = useMemo(() => {
    if (type && TYPE_META[type]) return TYPE_META[type].title;
    return "پەڕەکان";
  }, [type]);

  // Load first page
  useEffect(() => {
    let ok = true;
    setErr("");
    setLoading(true);
    setRows([]);
    setMeta({ page: 1, last: 1, total: 0 });

    (async () => {
      try {
        const url = buildQuery({ subjectId, subject, grade, stream, type, page: 1, perPage: PER_PAGE });
        const j = await fetchJSON(url);
        if (!ok) return;
        const data = j?.data || [];
        setRows(flattenItems(data));
        setMeta({
          page: j?.current_page || 1,
          last: j?.last_page || 1,
          total: j?.total || (data.length || 0),
        });
      } catch {
        if (!ok) return;
        setErr("نەتوانرا پەڕەکان باربکرێن.");
      } finally {
        if (ok) setLoading(false);
      }
    })();

    return () => { ok = false; };
  }, [subjectId, subject, grade, stream, type]);

  // Load more
  const loadMore = async () => {
    if (meta.page >= meta.last || moreLoading) return;
    const next = meta.page + 1;
    setMoreLoading(true);
    try {
      const url = buildQuery({ subjectId, subject, grade, stream, type, page: next, perPage: PER_PAGE });
      const j = await fetchJSON(url);
      const data = j?.data || [];
      setRows(prev => prev.concat(flattenItems(data)));
      setMeta({
        page: j?.current_page || next,
        last: j?.last_page || next,
        total: j?.total || 0,
      });
    } catch {
      setErr("نەتوانرا پەڕەی داهاتوو بکرێت.");
    } finally {
      setMoreLoading(false);
    }
  };

  // Filter + search + sort
  const filteredAndSortedRows = useMemo(() => {
    let result = [...rows];

    if (sessionFilter !== "") {
      result = result.filter(r => String(r.session_no) === sessionFilter);
    }

    const n = q.trim().toLowerCase();
    if (n) {
      const match = (s) => (s || "").toString().toLowerCase().includes(n);
      result = result.filter((r) =>
        match(r.item_label) ||
        match(r.parent_title) ||
        match(r.subject_name) ||
        match(r.teacher_name) ||
        match(r.parent_type) ||
        match(r.stream) ||
        match(String(r.grade || "")) ||
        match(String(r.year_start || "")) ||
        match(String(r.year_end || "")) ||
        match(String(r.session_no ?? ""))
      );
    }

    result.sort((a, b) => {
      const sessionA = a.session_no ?? Infinity;
      const sessionB = b.session_no ?? Infinity;
      const labelA = a.item_label || "";
      const labelB = b.item_label || "";
      if (sessionA !== sessionB) return sessionA - sessionB;
      return labelA.localeCompare(labelB);
    });

    return result;
  }, [rows, q, sessionFilter]);

  // Live counts
  const totalItems = filteredAndSortedRows.length;
  const totalPhotos = useMemo(
    () =>
      filteredAndSortedRows.filter(
        (r) =>
          r.parent_type === "images_of_sessions" &&
          (isImage(r.url) || isImage(r.thumb_url))
      ).length,
    [filteredAndSortedRows]
  );
  const sessionsInView = useMemo(() => {
    const s = new Set();
    filteredAndSortedRows.forEach((r) => {
      if (r.session_no !== undefined && r.session_no !== null) s.add(r.session_no);
    });
    return s.size;
  }, [filteredAndSortedRows]);

  const headerMeta = useMemo(() => {
    const arr = [];
    if (grade) arr.push({ icon: GraduationCap, label: `پۆل: ${grade}` });
    if (stream) arr.push({ icon: BookOpen, label: streamLabel(stream) });
    if (subject) arr.push({ icon: BookOpen, label: `بابەت: ${subject}` });
    return arr;
  }, [grade, stream, subject]);

  // Image lightbox state (portal)
  const imageItems = useMemo(
    () => filteredAndSortedRows.filter(r => r.parent_type === "images_of_sessions" && (isImage(r.url) || isImage(r.thumb_url))),
    [filteredAndSortedRows]
  );
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [zoom, setZoom] = useState(1);

  const openLightboxFor = (row) => {
    const i = imageItems.findIndex(x => x.row_key === row.row_key);
    if (i >= 0) {
      setLightboxIdx(i);
      setZoom(1);
      setLightboxOpen(true);
      // window scroll position can stay; overlay is fixed to viewport
    }
  };
  const closeLightbox = () => setLightboxOpen(false);
  const nextImg = useCallback(() => {
    if (imageItems.length === 0) return;
    setLightboxIdx(i => (i + 1) % imageItems.length);
    setZoom(1);
  }, [imageItems.length]);
  const prevImg = useCallback(() => {
    if (imageItems.length === 0) return;
    setLightboxIdx(i => (i - 1 + imageItems.length) % imageItems.length);
    setZoom(1);
  }, [imageItems.length]);

  const openInViewer = (item) => {
    // Keep viewer for non-images
    const raw = item?.url || item?.pdf_url || item?.file_url || item?.image_url || item?.thumb_url || "";
    const url = toCU(raw);
    if (!url) return;
    const title = item?.item_label || item?.title || item?.name || item?.parent_title || "Viewer";
    const vtype = isPDF(url) ? "pdf" : isImage(url) ? "image" : isVideoFile(url) ? "video" : "file";
    if (vtype === "image" && item.parent_type === "images_of_sessions") {
      openLightboxFor(item);
      return;
    }
    navigate(`/viewer?u=${encodeURIComponent(url)}&t=${encodeURIComponent(title)}&type=${vtype}&back=${encodeURIComponent(backParam)}`);
  };

  return (
    <div dir="rtl" className="p-2.5 sm:p-4 space-y-3 sm:space-y-4">
      {/* Sticky header */}
      <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-sky-500/5 p-2.5 sm:p-4 sticky top-2 z-10 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/40">
        <div className="flex flex-col gap-2.5 sm:gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-white min-w-0">
              <ClipboardList className="w-5 h-5 text-cyan-300 shrink-0" />
              <div className="font-extrabold text-base sm:text-lg md:text-xl truncate">{headerTitle}</div>
              {meta.total ? <span className="text-[10.5px] sm:text-[11px] text-zinc-300 shrink-0">({meta.total})</span> : null}
            </div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-sky-400/30"
              title="گەڕانەوە"
            >
              <ArrowRightCircle className="w-4 h-4" />
              گەڕانەوە
            </button>
          </div>

          {/* quick meta + live stats */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10.5px] sm:text-[11px] text-zinc-300">
            {headerMeta.map((m, i) => (
              <span key={i} className="px-2 py-0.5 rounded-xl bg-white/5 border border-white/10 inline-flex items-center gap-1">
                {m.icon ? <m.icon className="w-3 h-3" /> : null}
                {m.label}
              </span>
            ))}
            <span className="px-2 py-0.5 rounded-xl bg-white/5 border border-white/10 inline-flex items-center gap-1">
              <FileText className="w-3 h-3" /> هەموو: {totalItems}
            </span>
            <span className="px-2 py-0.5 rounded-xl bg-white/5 border border-white/10 inline-flex items-center gap-1">
              <ImagesIcon className="w-3 h-3" /> وێنەکان: {totalPhotos}
            </span>
            {sessionsInView > 0 && (
              <span className="px-2 py-0.5 rounded-xl bg-white/5 border border-white/10 inline-flex items-center gap-1">
                <Layers className="w-3 h-3" /> ژمارەی بەندەکان: {sessionsInView}
              </span>
            )}
          </div>

          {/* search + filter */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-[420px]">
              <input
                dir="rtl"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="گەڕان لە ناونیشان، مامۆستا، ساڵ، خولی، به‌ند..."
                className="w-full rounded-2xl bg-zinc-900/60 border border-white/10 text-white text-[13px] sm:text-sm px-9 sm:px-10 py-2 sm:py-2.5 outline-none focus:ring-2 focus:ring-sky-400/30"
              />
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            </div>

            {sessionNumbers.length > 0 && (
              <div className="relative">
                <select
                  value={sessionFilter}
                  onChange={(e) => setSessionFilter(e.target.value)}
                  className="rounded-2xl bg-zinc-900/60 border border-white/10 text-white text-[13px] sm:text-sm px-9 sm:px-10 py-2 sm:py-2.5 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-sky-400/30"
                >
                  <option value="">هەموو به‌نده‌كان</option>
                  {sessionNumbers.map((s) => (
                    <option key={s} value={s}>به‌ندی {s}</option>
                  ))}
                </select>
                <Filter className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Errors */}
      {err && <div className="text-red-300 text-sm">{err}</div>}

      {/* Loading */}
      {loading && (
        <div className="space-y-2.5 sm:space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <LoadingRow key={i} />)}
        </div>
      )}

      {/* Empty */}
      {!loading && filteredAndSortedRows.length === 0 && (
        <div className="max-w-5xl mx-auto w-full rounded-2xl border border-white/10 bg-zinc-900/60 p-5 sm:p-6 text-center text-zinc-300">
          هیچ پەڕەیەک نەدۆزرایەوە بەم فلتەرە.
        </div>
      )}

      {/* List */}
      {!loading && filteredAndSortedRows.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          {filteredAndSortedRows.map((it) =>
            it.parent_type === "images_of_sessions" ? (
              <ImagePostCard
                key={it.row_key}
                item={it}
                onOpenInline={() => openLightboxFor(it)}
              />
            ) : (
              <ItemRow key={it.row_key} item={it} onOpen={() => openInViewer(it)} />
            )
          )}
        </div>
      )}

      {/* Load more */}
      {!loading && meta.page < meta.last && (
        <div className="flex justify-center py-3 sm:py-4">
          <button
            onClick={loadMore}
            disabled={moreLoading}
            className="px-3.5 sm:px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-[13px] sm:text-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
          >
            {moreLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> زیاتر باربکە
              </span>
            ) : (
              "زیاتر باربکە"
            )}
          </button>
        </div>
      )}

      {/* --- PORTAL Lightbox --- */}
      {lightboxOpen && imageItems.length > 0 && (
        <LightboxPortal
          items={imageItems}
          index={lightboxIdx}
          onClose={() => setLightboxOpen(false)}
          onNext={nextImg}
          onPrev={prevImg}
          zoom={zoom}
          setZoom={setZoom}
        />
      )}
    </div>
  );

  /* -------- helpers -------- */
  function flattenItems(list) {
    const out = [];
    (list || []).forEach((p) => {
      const items = Array.isArray(p?.items) ? p.items : [];
      items.forEach((it, idx) => {
        out.push({
          row_key: `${p?.id || p?.title}-${it?.id || idx}`,
          url: it?.url || it?.pdf_url || it?.file_url || it?.image_url,
          thumb_url: it?.thumb_url,
          item_label: it?.label,
          year_start: it?.year_start ?? p?.year_start,
          year_end: it?.year_end ?? p?.year_end,
          term: it?.term ?? p?.term,
          session_no: it?.session_no,
          date: it?.date || p?.date || p?.created_at,
          grade: p?.grade,
          stream: p?.stream,
          subject_name: p?.subject?.name,
          teacher_name: p?.teacher?.full_name,
          parent_title: p?.title,
          parent_type: p?.type,
          created_at: p?.created_at,
        });
      });
    });
    return out;
  }
}
