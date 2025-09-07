// ================================================
// src/pages/Students.jsx  —  Clean track-by-localStorage + Beautiful Papers
// - NO stream (scientific/literary) UI; uses localStorage("track") silently
// - Papers: pretty year/term badges, per-item cards, actions (view / download / copy)
// - Subjects/Teachers via API; Documents + Papers fetched; infinite load + preview
// ================================================
import React, { useEffect, useMemo, useState, useDeferredValue, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Users, BookOpen, Book, Video, FileText, X, Hash, Calendar,
  AlertCircle, RefreshCcw, Grid3X3, Rows, Sparkles, Star, ChevronDown,
  Layers, GraduationCap, FlaskConical, ExternalLink, Download, Copy, Check
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

/* ---------- Helpers ---------- */
const EASE = [0.22, 1, 0.36, 1];
const API_DOCUMENTS_URL = "https://api.studentkrd.com/api/v1/documents";
const API_PAPERS_URL    = "https://api.studentkrd.com/api/v1/papers";
const API_SUBJECTS_URL  = "https://api.studentkrd.com/api/v1/subjects";
const API_TEACHERS_URL  = "https://api.studentkrd.com/api/v1/teachers";

const formatDate = (d) =>
  new Date(d).toLocaleDateString("ku-IQ", { year: "numeric", month: "long", day: "numeric" });

const equalsName = (a = "", b = "") =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

const safeGet = (k, fb) => { try { const v = localStorage.getItem(k); return v ?? fb; } catch { return fb; } };
const safeSet = (k, v) => { try { localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)); } catch {} };

const getStoredGrade = () => {
  const v = Number(safeGet("grade", ""));
  return Number.isFinite(v) && v >= 1 ? v : 12;
};
const normalizeTrack = (raw) => {
  const s = (raw || "").toString().trim().toLowerCase();
  const sci = ["scientific","science","zansti","زانستی","وێژەیی","wezheyi","wêjeyî"];
  const lit = ["literary","adabi","ئەدەبی","ادبی"];
  if (sci.some(w => s.includes(w))) return "scientific";
  if (lit.some(w => s.includes(w))) return "literary";
  return "common"; // include all
};
const getStoredStream = () => normalizeTrack(safeGet("track", "common"));

const getExt = (url = "") => {
  try {
    const clean = url.split("?")[0].split("#")[0];
    const parts = clean.split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "";
  } catch { return ""; }
};
const isPDF = (url) => getExt(url) === "pdf";
const isImage = (url) => ["png","jpg","jpeg","webp","gif"].includes(getExt(url));
const isVideoFile = (url) => ["mp4","webm","ogg","mov","m4v"].includes(getExt(url));
const isYouTube = (url = "") => /(?:youtube\.com|youtu\.be)/i.test(url);
const ytId = (url = "") => {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const parts = u.pathname.split("/"); const i = parts.indexOf("embed");
    return i !== -1 ? (parts[i+1] || "") : "";
  } catch { return ""; }
};

// Optional CORS helper for thumbnails coming from /storage
const toCU = (raw) => {
  try {
    if (!raw) return raw;
    const u = new URL(raw, window.location.origin);
    if (/\/(v1\/)?dl\//i.test(u.pathname)) return u.toString();
    if ((/^api\.studentkrd\.com$/i).test(u.hostname) || (/\.studentkrd\.com$/i).test(u.hostname)) {
      const m = u.pathname.match(/^\/storage\/(.+)$/i);
      if (m && m[1]) return `https://api.studentkrd.com/api/v1/dl/${m[1]}`;
    }
    return u.toString();
  } catch { return raw; }
};

/* ---------- Small UI atoms ---------- */
function Badge({ children, className = "", asButton = false, onClick }) {
  const base = "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-white/10 bg-white/5";
  if (asButton) {
    return (
      <button type="button" onClick={onClick} className={`${base} hover:bg-white/10 ${className}`}>
        {children}
      </button>
    );
  }
  return <span className={`${base} ${className}`}>{children}</span>;
}
function PillButton({ active, children, onClick, className = "" }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors border ${
        active ? "bg-sky-500/10 text-sky-400 border-sky-400/30"
               : "bg-zinc-900/40 text-zinc-300 border-white/10 hover:bg-zinc-900/70"
      } ${className}`}>
      {children}
    </button>
  );
}
function SectionCard({ title, subtitle, icon, children }) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500/0 via-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition" />
      <div className="relative rounded-2xl border border-white/10 bg-white/5 dark:bg-zinc-900/60 backdrop-blur-sm p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            {icon} <span>{title}</span>
          </div>
          {subtitle && <div className="text-xs text-zinc-400">{subtitle}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 animate-pulse h-56" />
  );
}

/* ---------- Document card ---------- */
function DocCard({ item, onOpen, isFav, onToggleFav }) {
  const Icon = item.type === "book" ? BookOpen : item.type === "booklet" ? Book : Video;
  return (
    <motion.button type="button" onClick={() => onOpen?.(item)}
      whileHover={{ y: -2 }} transition={{ duration: 0.2, ease: EASE }}
      className="block w-full rounded-2xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-900/80 shadow-sm overflow-hidden text-right">
      <div className="aspect-[3/4] sm:aspect-[3/4] lg:aspect-[2/3] relative bg-zinc-900">
        <div className="absolute top-2 left-2 z-10">
          <button onClick={(e)=>{e.stopPropagation(); onToggleFav?.();}}
            className={`px-2 py-1 rounded-lg text-xs font-semibold border ${isFav? 'bg-amber-400/20 border-amber-200/30 text-amber-200':'bg-white/10 border-white/20 text-white/90'} backdrop-blur hover:bg-white/20`}>
            <span className="inline-flex items-center gap-1"><Star size={14} /> {isFav? 'دڵخواز':'حەزبەوە'}</span>
          </button>
        </div>
        {(() => {
          let thumb = item.thumb_url || item.image_url || "";
          if (!thumb && item.type === "video" && item.file_url && isYouTube(item.file_url)) {
            const id = ytId(item.file_url);
            if (id) thumb = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
          }
          return thumb ? (
            <img src={toCU(thumb)} alt="" loading="eager" className="absolute inset-0 w-full h-full sm:object-cover bg-white" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
              <div className="p-4 rounded-xl bg-sky-500/10 text-sky-400 ring-1 ring-sky-400/20"><Icon size={24} /></div>
            </div>
          );
        })()}
      </div>
      <div className="p-3">
        <p className="text-sm font-bold text-white line-clamp-2">{item.title}</p>
        {item.description && <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{item.description}</p>}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.subject?.name && <Badge className="text-purple-300">{item.subject.name}</Badge>}
          {item.teacher?.full_name && <Badge className="text-amber-300">{item.teacher.full_name}</Badge>}
          <Badge className="text-zinc-300"><Calendar size={12} /> {formatDate(item.created_at)}</Badge>
        </div>
      </div>
    </motion.button>
  );
}

/* ---------- Papers: badges + actions ---------- */
const TermBadge = ({ term }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-emerald-900/20 ring-1 ring-emerald-800/40 text-emerald-300">
    <Layers size={12}/> ترم {term ?? "?"}
  </span>
);
const YearBadge = ({ start, end }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-sky-900/20 ring-1 ring-sky-800/40 text-sky-300">
    <Calendar size={12}/> {start}–{end}
  </span>
);
const GradeBadge = ({ grade }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-indigo-900/20 ring-1 ring-indigo-800/40 text-indigo-300">
    <GraduationCap size={12}/> پۆل {grade ?? "?"}
  </span>
);
const StreamBadge = ({ stream }) => {
  const txt = stream === "scientific" ? "زانستی/وێژەیی" : stream === "literary" ? "ئەدەبی" : "گشتی";
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-fuchsia-900/20 ring-1 ring-fuchsia-800/40 text-fuchsia-300">
      <FlaskConical size={12}/> {txt}
    </span>
  );
};
function PaperActions({ pdfUrl }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <a href={pdfUrl || "#"} target="_blank" rel="noopener noreferrer"
         className="px-3 py-1.5 rounded-xl bg-zinc-800/60 ring-1 ring-zinc-700/70 text-zinc-100 inline-flex items-center gap-1 text-[12px] hover:bg-zinc-800">
        <ExternalLink size={14}/> بینین
      </a>
      <a href={pdfUrl || "#"} download
         className="px-3 py-1.5 rounded-xl bg-zinc-900/60 ring-1 ring-zinc-700/70 text-zinc-100 inline-flex items-center gap-1 text-[12px] hover:bg-zinc-900">
        <Download size={14}/> داگرتن
      </a>
      <button
        onClick={async () => { try { await navigator.clipboard.writeText(pdfUrl || ""); setCopied(true); setTimeout(()=>setCopied(false), 1200);} catch {} }}
        className="px-3 py-1.5 rounded-xl bg-zinc-900/60 ring-1 ring-zinc-700/70 text-zinc-100 inline-flex items-center gap-1 text-[12px] hover:bg-zinc-900"
      >
        {copied ? <><Check size={14}/> کۆپی کرا</> : <><Copy size={14}/> کۆپی لینک</>}
      </button>
    </div>
  );
}
function PaperCard({ item, onOpen, isFav, onToggleFav }) {
  return (
    <motion.button type="button" onClick={() => onOpen?.(item)}
      whileHover={{ y: -2 }} transition={{ duration: 0.2, ease: EASE }}
      className="block w-full rounded-2xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-900/80 shadow-sm overflow-hidden text-right">
      <div className="aspect-[3/4] sm:aspect-[3/4] lg:aspect-[2/3] relative bg-zinc-900">
        <div className="absolute top-2 left-2 z-10">
          <button onClick={(e)=>{e.stopPropagation(); onToggleFav?.();}}
            className={`px-2 py-1 rounded-lg text-xs font-semibold border ${isFav? 'bg-amber-400/20 border-amber-200/30 text-amber-200':'bg-white/10 border-white/20 text-white/90'} backdrop-blur hover:bg-white/20`}>
            <span className="inline-flex items-center gap-1"><Star size={14} /> {isFav? 'دڵخواز':'حەزبەوە'}</span>
          </button>
        </div>
        {item.thumb_url || item.image_url ? (
          <img src={toCU(item.thumb_url || item.image_url)} alt="" loading="eager" className="absolute inset-0 w-full h-full object-contain sm:object-cover bg-white" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-400/20"><FileText size={24} /></div>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-bold text-white line-clamp-2">{item.title}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <YearBadge start={item.year_start} end={item.year_end} />
          <TermBadge term={item.term} />
          {item.grade != null && <GradeBadge grade={item.grade} />}
          {item.stream && <StreamBadge stream={item.stream} />}
          {item.subject?.name && <Badge className="text-purple-300">{item.subject.name}</Badge>}
          {item.teacher?.full_name && <Badge className="text-amber-300">{item.teacher.full_name}</Badge>}
        </div>
        <div className="mt-3">
          <PaperActions pdfUrl={item.pdf_url} />
        </div>
      </div>
    </motion.button>
  );
}

/* ---------- Tabs ---------- */
const TYPE_TABS = [
  { key: "all",     name: "هەموو",       icon: Grid3X3 },
  { key: "book",    name: "کتێب",        icon: BookOpen },
  { key: "booklet", name: "مەلزمە",      icon: Book },
  { key: "video",   name: "ڤیدیۆ",       icon: Video },
  { key: "papers",  name: "ئەسیلەکان",   icon: FileText },
];

/* =================== Main Component =================== */
export default function StudentsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [tab, setTab] = useState("all");
  const [grade, setGrade] = useState(getStoredGrade());
  const [stream] = useState(getStoredStream()); // <- fixed by localStorage; no UI to change
  const [subject, setSubject] = useState("");
  const [teacher, setTeacher] = useState("");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const [documents, setDocuments] = useState([]);
  const [papers, setPapers] = useState([]); // flattened national_exam items
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isGrid, setIsGrid] = useState(true);
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [fav, setFav] = useState(new Set(JSON.parse(safeGet("fav","[]")||"[]")));
  useEffect(()=>safeSet("fav", Array.from(fav)),[fav]);

  const [visibleCount, setVisibleCount] = useState(24);
  const sentinelRef = useRef(null);

  const [previewItem, setPreviewItem] = useState(null);

  // read deep-link (ignore grade param; grade comes from LS)
  useEffect(() => {
    try {
      const sp = new URLSearchParams(location.search);
      const t = sp.get("t");
      if (t && ["all","book","booklet","video","papers"].includes(t)) setTab(t);
      const sub = sp.get("q"); if (sub) setSearch(sub);
    } catch {}
  }, [location.search]);

  useEffect(() => {
    const el = sentinelRef.current; if (!el) return;
    const io = new IntersectionObserver((entries) => entries.forEach(e => { if (e.isIntersecting) setVisibleCount((n)=>n+16); }), { rootMargin: "1200px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  useEffect(() => { setVisibleCount(24); }, [tab, subject, teacher, deferredSearch, showFavOnly]);

  // Fetch + flatten
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true); setError("");
        const [d1, d2, d3, d4] = await Promise.all([
          fetch(API_DOCUMENTS_URL, { signal: ctrl.signal }),
          fetch(API_PAPERS_URL,    { signal: ctrl.signal }),
          fetch(API_SUBJECTS_URL,  { signal: ctrl.signal }),
          fetch(API_TEACHERS_URL,  { signal: ctrl.signal }),
        ]);
        if (![d1,d2,d3,d4].every(r => r.ok)) throw new Error("Failed to load one or more endpoints");
        const [j1,j2,j3,j4] = await Promise.all([d1.json(), d2.json(), d3.json(), d4.json()]);

        const docs = Array.isArray(j1?.data) ? j1.data : [];
        const papersRaw = Array.isArray(j2?.data) ? j2.data : [];
        const subs = Array.isArray(j3?.data) ? j3.data : [];
        const tchs = Array.isArray(j4?.data) ? j4.data : [];

        // flatten national exams
        const scoreItem = (it) => {
          const so = Number(it.sort_order || 0);
          if (so) return so;
          const ye = Number(it.year_end || 0);
          const ys = Number(it.year_start || 0);
          const t  = Number(it.term || 0);
          return ye * 100 + ys * 10 + t;
        };
        const pps = papersRaw
          .filter(p => (p?.type || "").toLowerCase() === "national_exam")
          .flatMap((p) => {
            const subjectName = p?.subject?.name || p?.subject?.code || p?.title || "";
            const items = Array.isArray(p.items) ? p.items : [];
            return items.map((it) => ({
              id: `${p.id}-${it.id}`,
              type: "paper",
              title: `${subjectName} — ${it.year_start}-${it.year_end} • ترم ${it.term}`,
              subject: p.subject,
              teacher: p.teacher,
              grade: Number(p.grade),
              stream: (p.stream || "").toLowerCase(),
              year_start: it.year_start,
              year_end: it.year_end,
              term: it.term,
              label: it.label,
              pdf_url: it.url,
              thumb_url: it.thumb_url || p.thumb_url || null,
              image_url: (it.images && it.images[0]) || p.thumb_url || null,
              created_at: it.created_at || p.created_at,
              _score: scoreItem(it),
            }));
          })
          .sort((a,b) => (b._score||0) - (a._score||0));

        setDocuments(docs);
        setPapers(pps);
        setSubjects(subs);
        setTeachers(tchs);
      } catch (e) {
        if (e?.name === "AbortError") return;
        console.error(e);
        setError("لە کاتی بارکردن هەڵەیەک ڕوویدا. هەوڵبدەوە.");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  // Subject options are derived from *available* items for this grade/track
  const subjectOptions = useMemo(() => {
    const pool = [
      ...documents.filter(d => d.grade === grade && (stream === "common" ? true : d.stream === stream)).map(d => d.subject?.name).filter(Boolean),
      ...papers.filter(p => p.grade === grade && (stream === "common" ? true : p.stream === stream)).map(p => p.subject?.name).filter(Boolean),
    ];
    const uniq = Array.from(new Set(pool.map(s => (s || "").trim()))).filter(Boolean);
    return uniq.sort((a,b)=>a.localeCompare(b));
  }, [documents, papers, grade, stream]);

  const teacherOptions = useMemo(
    () => Array.from(new Set(teachers.map(t => t.full_name))).filter(Boolean),
    [teachers]
  );

  // Favorites
  const toggleFav = (item) => {
    setFav(prev => {
      const next = new Set(prev);
      if (next.has(item.id)) next.delete(item.id); else next.add(item.id);
      return next;
    });
  };
  const isFav = (id) => fav.has(id);

  // Build data
  const combinedData = useMemo(() => {
    const all = [
      ...documents,
      ...papers, // already type: 'paper'
    ];
    const q = deferredSearch;
    return all.filter((item) => {
      const itemType = item.type || (item.pdf_url ? "paper" : "book");
      if (tab !== "all") {
        if (tab === "papers" && itemType !== "paper") return false;
        if (tab !== "papers" && itemType !== tab) return false;
      }
      const byGrade = Number(item.grade) === Number(grade);
      const bySubject = !subject || equalsName(item.subject?.name || "", subject);
      const byStream = stream === "common" ? true : (item.stream || "").toLowerCase() === stream;
      const hay = `${item.title} ${item.description ?? ""}`.toLowerCase();
      const bySearch = !q || hay.includes(q);
      const byFav = !showFavOnly || fav.has(item.id);
      const byTeacher = teacher ? equalsName(item.teacher?.full_name || "", teacher) : true;
      return byGrade && bySubject && byStream && bySearch && byFav && byTeacher;
    });
  }, [documents, papers, tab, grade, stream, subject, teacher, deferredSearch, showFavOnly, fav]);

  const data = combinedData;

  const stats = useMemo(() => {
    const q = deferredSearch;
    const docBase = documents.filter((d) => {
      const byGrade = Number(d.grade) === Number(grade);
      const bySubject = !subject || equalsName(d.subject?.name || "", subject);
      const byStream = stream === "common" ? true : (d.stream || "").toLowerCase() === stream;
      const bySearch = !q || `${d.title} ${d.description ?? ""}`.toLowerCase().includes(q);
      return byGrade && bySubject && byStream && bySearch;
    });
    const papersBase = papers.filter((p) => {
      const byGrade = Number(p.grade) === Number(grade);
      const bySubject = !subject || equalsName(p.subject?.name || "", subject);
      const byStream = stream === "common" ? true : (p.stream || "").toLowerCase() === stream;
      const bySearch = !q || `${p.title}`.toLowerCase().includes(q);
      return byGrade && bySubject && byStream && bySearch;
    });
    return {
      books: docBase.filter((d) => d.type === "book").length,
      booklets: docBase.filter((d) => d.type === "booklet").length,
      videos: docBase.filter((d) => d.type === "video").length,
      papers: papersBase.length,
      total: docBase.length + papersBase.length,
    };
  }, [documents, papers, grade, stream, subject, deferredSearch]);

  const openInViewer = (item) => {
    const raw   = item?.pdf_url || item?.file_url || item?.image_url || item?.thumb_url || "";
    const url   = toCU(raw); if (!url) return;
    const title = item?.title || item?.name || "Viewer";
    const type  = item?.type || (isYouTube(url) ? "youtube" : isPDF(url) ? "pdf" : isImage(url) ? "image" : isVideoFile(url) ? "video" : "file");
    navigate(`/viewer?u=${encodeURIComponent(url)}&t=${encodeURIComponent(title)}&type=${type}`);
  };

  const clearAll = () => {
    setSubject(""); setTeacher(""); setSearch(""); setShowFavOnly(false); setTab("all");
  };

  const GRADE_NAME = (g) => `پۆل ${g}`;

  // -------- grade picker actions --------
  const [showGradePicker, setShowGradePicker] = useState(false);
  const setGradeAndSave = (g) => { setGrade(g); safeSet("grade", g); setShowGradePicker(false); };

  /* =================== RENDER =================== */
  return (
    <div className="relative p-3 sm:p-5" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <Sparkles size={20} className="text-sky-300" />
            خوێندنگەی خوێندنەکان
          </div>
          <div className="flex items-center gap-2">
            <Badge asButton onClick={()=>setShowGradePicker(v=>!v)} className="text-indigo-300">
              <GraduationCap size={14}/> {GRADE_NAME(grade)} <ChevronDown size={12}/>
            </Badge>
            {/* Stream badge (read-only from LS) */}
            <Badge className="text-fuchsia-300">
              <FlaskConical size={14}/> {stream === "scientific" ? "زانستی/وێژەیی" : stream === "literary" ? "ئەدەبی" : "گشتی"}
            </Badge>
          </div>
        </div>

        {/* Grade dropdown */}
        <AnimatePresence>
          {showGradePicker && (
            <>
              <motion.div className="fixed inset-0 z-40" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setShowGradePicker(false)} />
              <motion.div
                initial={{opacity:0, y:-6}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-6}}
                transition={{duration:0.18}}
                className="absolute z-50 mt-2 right-40 sm:right-48 rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur p-2 shadow-xl"
              >
                <div className="grid grid-cols-3 gap-2 w-[220px]">
                  {[7,8,9,10,11,12].map(g => (
                    <button key={g} onClick={()=>setGradeAndSave(g)}
                      className={`px-3 py-2 rounded-xl text-sm border ${grade===g?'bg-sky-500/10 text-sky-300 border-sky-400/30':'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}>
                      {GRADE_NAME(g)}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Search */}
        <div className="relative mt-2">
          <motion.input initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} transition={{duration:0.45, ease:EASE}}
            value={search} onChange={(e) => setSearch(e.target.value)} type="search"
            placeholder="بەدوای ناونیشان بگەڕێ..."
            className="w-full rounded-2xl bg-zinc-900/60 border border-white/10 px-3 py-3 pr-10 text-sm text-zinc-200 outline-none"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        </div>

        {/* Tabs + filters (NO STREAM UI) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {TYPE_TABS.map((t) => (
              <PillButton key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}>
                <div className="inline-flex items-center gap-2"><t.icon size={16} /> {t.name}</div>
              </PillButton>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <PillButton active={showFavOnly} onClick={()=>setShowFavOnly(v=>!v)}>دڵخوازەکان</PillButton>
            <select value={subject} onChange={(e) => setSubject(e.target.value)}
              className="bg-zinc-900/70 border border-white/10 rounded-xl px-2.5 py-2 text-sm">
              <option value="">هەموو بابەتەکان</option>
              {subjectOptions.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
            <select value={teacher} onChange={(e) => setTeacher(e.target.value)}
              className="bg-zinc-900/70 border border-white/10 rounded-xl px-2.5 py-2 text-sm">
              <option value="">هەموو مامۆستایان</option>
              {teacherOptions.map((t) => (<option key={t} value={t}>{t}</option>))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-4">
        <SectionCard
          title={TYPE_TABS.find((t) => t.key === tab)?.name || "هەموو"}
          subtitle={stats.total ? `داواکارییەکان: ${stats.total}` : ""}
          icon={<Sparkles size={18} className="text-sky-300" />}
        >
          {loading && documents.length === 0 && papers.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3 sm:gap-4">
              {Array.from({ length: 10 }).map((_, i) => (<SkeletonCard key={i}/>))}
            </div>
          ) : error ? (
            <div className="py-10 text-center">
              <div className="inline-flex items-center gap-2 text-rose-300"><AlertCircle size={18} /> {error}</div>
              <div className="mt-3">
                <button onClick={() => window.location.reload()} className="px-3 py-2 rounded-xl text-sm font-semibold bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20">هەوڵدانەوە</button>
              </div>
            </div>
          ) : (
            <>
              {data.length === 0 ? (
                <div className="py-14 text-center text-zinc-400">
                  <p>ھیچ شتێک نەدۆزرایەوە. هەوڵ بدە فلتەرەکان گۆڕە یان وشەی تر بگەڕێ.</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <PillButton onClick={() => setSearch("")}>پاککردنەوەی گەڕان</PillButton>
                    <PillButton onClick={clearAll}>هەموو فلتەرەکان بسڕەوە</PillButton>
                  </div>
                </div>
              ) : (
                <div className={
                  "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3 sm:gap-4"
                }>
                  {data.slice(0, visibleCount).map((item) => {
                    const favd = isFav(item.id);
                    const open = () => setPreviewItem(item);
                    const toggle = () => toggleFav(item);

                    if ((item.type || (item.pdf_url ? "paper" : "book")) === "paper") {
                      return <PaperCard key={item.id} item={item} onOpen={open} isFav={favd} onToggleFav={toggle} />;
                    }
                    return <DocCard key={item.id} item={item} onOpen={open} isFav={favd} onToggleFav={toggle} />;
                  })}
                  {data.length > visibleCount && (<div ref={sentinelRef} className="h-8 col-span-full" />)}
                </div>
              )}
            </>
          )}
        </SectionCard>

        {/* Preview overlay + panel */}
        <AnimatePresence>
          {previewItem && (
            <>
              <motion.div onClick={() => setPreviewItem(null)} initial={{opacity:0}} animate={{opacity:0.6}} exit={{opacity:0}} transition={{duration:0.2}} className="fixed inset-0 bg-black/60 z-40" />
              {window.matchMedia('(max-width: 640px)').matches ? (
                <motion.div initial={{y: "100%"}} animate={{y: 0}} exit={{y: "100%"}}
                  transition={{duration:0.25, ease:EASE}} className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border border-white/10 bg-zinc-950 p-4 pb-24">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white text-base line-clamp-2">{previewItem.title}</h3>
                    <button onClick={() => setPreviewItem(null)} className="p-2 rounded-lg bg-white/5 border border-white/10"><X size={16}/></button>
                  </div>
                  <div className="text-xs text-zinc-300 space-y-1">
                    <div className="flex flex-wrap gap-1">
                      {previewItem.type === "paper" ? (
                        <>
                          <YearBadge start={previewItem.year_start} end={previewItem.year_end} />
                          <TermBadge term={previewItem.term} />
                        </>
                      ) : null}
                      {previewItem.stream && <StreamBadge stream={previewItem.stream} />}
                      {previewItem.subject?.name && <Badge className="text-purple-300">{previewItem.subject.name}</Badge>}
                      {previewItem.teacher?.full_name && <Badge className="text-amber-300">{previewItem.teacher.full_name}</Badge>}
                    </div>
                    {previewItem.created_at && <div className="text-zinc-400">بەروار: {formatDate(previewItem.created_at)}</div>}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={()=>toggleFav(previewItem)}
                      className={`px-3 py-2 rounded-xl text-sm font-semibold border ${fav.has(previewItem.id)?'bg-amber-400/20 border-amber-200/30 text-amber-200':'bg-white/5 border-white/10 text-white'}`}>
                      <span className="inline-flex items-center gap-1"><Star size={14}/> {fav.has(previewItem.id)?'لابردن لە دڵخواز':'زیادکردن بۆ دڵخواز'}</span>
                    </button>
                    <button onClick={()=>openInViewer(previewItem)}
                      className="px-3 py-2 rounded-xl text-sm font-semibold bg-sky-500/20 border border-sky-400/30 text-sky-200 hover:border-sky-400/20 hover:bg-sky-500/25">کردنەوەی پەڕەی گەورە</button>
                    {previewItem.type === "paper" && previewItem.pdf_url && (
                      <>
                        <a href={previewItem.pdf_url} target="_blank" rel="noopener noreferrer"
                           className="px-3 py-2 rounded-xl text-sm font-semibold bg-zinc-800/60 border border-zinc-700/70 text-zinc-100 inline-flex items-center gap-1">
                          <ExternalLink size={14}/> بینین
                        </a>
                        <a href={previewItem.pdf_url} download
                           className="px-3 py-2 rounded-xl text-sm font-semibold bg-zinc-900/60 border border-zinc-700/70 text-zinc-100 inline-flex items-center gap-1">
                          <Download size={14}/> داگرتن
                        </a>
                      </>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:20}}
                  transition={{duration:0.2, ease:EASE}} className="fixed right-4 bottom-4 z-50 w-[440px] max-w-[92vw] rounded-2xl border border-white/10 bg-zinc-950 p-4 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base line-clamp-2">{previewItem.title}</h3>
                    <button onClick={() => setPreviewItem(null)} className="p-2 rounded-lg bg-white/5 border border-white/10"><X size={16}/></button>
                  </div>
                  <div className="mt-2 text-xs text-zinc-300 space-y-1">
                    <div className="flex flex-wrap gap-1">
                      {previewItem.type === "paper" ? (
                        <>
                          <YearBadge start={previewItem.year_start} end={previewItem.year_end} />
                          <TermBadge term={previewItem.term} />
                        </>
                      ) : null}
                      {previewItem.stream && <StreamBadge stream={previewItem.stream} />}
                      {previewItem.subject?.name && <Badge className="text-purple-300">{previewItem.subject.name}</Badge>}
                      {previewItem.teacher?.full_name && <Badge className="text-amber-300">{previewItem.teacher.full_name}</Badge>}
                      {previewItem.created_at && <Badge className="text-zinc-300"><Calendar size={12}/> {formatDate(previewItem.created_at)}</Badge>}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={()=>toggleFav(previewItem)}
                      className={`px-3 py-2 rounded-xl text-sm font-semibold border ${fav.has(previewItem.id)?'bg-amber-400/20 border-amber-200/30 text-amber-200':'bg-white/5 border-white/10 text-white'}`}>
                      <span className="inline-flex items-center gap-1"><Star size={14}/> {fav.has(previewItem.id)?'لابردن لە دڵخواز':'زیادکردن بۆ دڵخواز'}</span>
                    </button>
                    <button onClick={()=>openInViewer(previewItem)}
                      className="px-3 py-2 rounded-xl text-sm font-semibold bg-sky-500/20 border border-sky-400/30 text-sky-200 hover:border-sky-400/20 hover:bg-sky-500/25">کردنەوەی پەڕەی گەورە</button>
                    {previewItem.type === "paper" && previewItem.pdf_url && (
                      <>
                        <a href={previewItem.pdf_url} target="_blank" rel="noopener noreferrer"
                           className="px-3 py-2 rounded-xl text-sm font-semibold bg-zinc-800/60 border border-zinc-700/70 text-zinc-100 inline-flex items-center gap-1">
                          <ExternalLink size={14}/> بینین
                        </a>
                        <a href={previewItem.pdf_url} download
                           className="px-3 py-2 rounded-xl text-sm font-semibold bg-zinc-900/60 border border-zinc-700/70 text-zinc-100 inline-flex items-center gap-1">
                          <Download size={14}/> داگرتن
                        </a>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
