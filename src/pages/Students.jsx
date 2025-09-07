// ================================================
// src/pages/Students.jsx
// - Grade shown only in header (click to change, persists in localStorage)
// - Subject options adapt by stream + grade per your rules
// - Desktop cards: narrower & taller
// - "See all" and "Load more" remain
// ================================================
import React, { useEffect, useMemo, useState, useDeferredValue, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Users, BookOpen, Book, Video, FileText, X, Hash, Calendar,
  AlertCircle, RefreshCcw, Grid3X3, Rows, Sparkles, Star, ChevronDown,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

/* ---------- CORS: rewrite /storage/... to /api/v1/dl/... ---------- */
(function patchFetchAndAxios(){
  const API = 'https://api.studentkrd.com';
  const toCorsUrl = (raw) => {
    try {
      if (!raw) return raw;
      const u = new URL(raw, window.location.origin);
      if (/\/(v1\/)?dl\//i.test(u.pathname)) return u.toString();
      if (/(^|\.)api\.studentkrd\.com$/i.test(u.hostname)) {
        const m = u.pathname.match(/^\/storage\/(.+)$/i);
        if (m && m[1]) return `${API}/api/v1/dl/${m[1]}`;
      }
      return u.toString();
    } catch { return raw; }
  };
  if (typeof window !== "undefined" && window.fetch) {
    const _fetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
      if (typeof input === 'string') input = toCorsUrl(input);
      else if (input && input.url) input = new Request(toCorsUrl(input.url), input);
      return _fetch(input, init);
    };
  }
  if (typeof window !== "undefined" && window.axios?.interceptors) {
    window.axios.interceptors.request.use((config) => {
      if (config?.url) config.url = toCorsUrl(config.url);
      return config;
    });
  }
  if (typeof window !== "undefined") window.__toCorsUrl = toCorsUrl;
})();
const toCU = (typeof window !== 'undefined' && window.__toCorsUrl)
  ? window.__toCorsUrl
  : ((u) => u);

/* =================== Config & Helpers =================== */
const EASE = [0.22, 0.61, 0.36, 1];
const GRADE_NAME = (g) => `پۆلی ${g}`;

const TYPE_TABS = [
  { key: "all",     name: "هەموو",      icon: Grid3X3 },
  { key: "book",    name: "کتێب",       icon: BookOpen },
  { key: "booklet", name: "مەڵزەمەکان",  icon: Book },
  { key: "video",   name: "ڤیدیۆ",      icon: Video },
  { key: "papers",  name: "ئەسیلەکان",   icon: FileText },
];

const API_DOCUMENTS_URL = "https://api.studentkrd.com/api/v1/documents";
const API_PAPERS_URL    = "https://api.studentkrd.com/api/v1/papers";
const API_SUBJECTS_URL  = "https://api.studentkrd.com/api/v1/subjects";
const API_TEACHERS_URL  = "https://api.studentkrd.com/api/v1/teachers";

const formatDate = (d) =>
  new Date(d).toLocaleDateString("ku-IQ", { year: "numeric", month: "long", day: "numeric" });

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

// localStorage helpers
const safeGet = (k, fallback) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
const safeSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// Pull grade from localStorage (several keys), fallback 12
const getStoredGrade = () => {
  const candidates = [
    () => safeGet("grade", null),
    () => safeGet("user", null)?.grade,
    () => safeGet("profile", null)?.grade,
    () => safeGet("settings", null)?.grade,
  ];
  for (const f of candidates) {
    const v = f();
    const n = Number(v);
    if (Number.isInteger(n) && n >= 7 && n <= 12) return n;
  }
  return 12;
};

/* ---------- Kurdish/Arabic normalization for name matching ---------- */
const norm = (s="") =>
  s.normalize("NFKD")
   .replace(/[\u064A]/g, "ی") // AR yeh -> Persian yeh
   .replace(/[\u0643]/g, "ک") // AR kaf -> Persian kaf
   .replace(/[\u0626]/g, "ئ")
   .replace(/[\u0629]/g, "ه")
   .replace(/[\u0647][\u0654]/g, "ە")
   .replace(/[\u0640\u200C\u200D]/g, "") // tatweel & ZW*J
   .replace(/[\u064B-\u0652]/g, "")      // harakat
   .trim();

const includesName = (name="", target="") => norm(name).includes(norm(target));
const equalsName   = (a="", b="") => norm(a) === norm(b);

/* ---------- Subject helpers (find actual API name for a target label) ---------- */
const findNameInSubjects = (subjects, target) => {
  // try exact normalized equality first
  const eq = subjects.find(s => equalsName(s.name, target));
  if (eq) return eq.name;
  // then includes
  const inc = subjects.find(s => includesName(s.name, target));
  return inc ? inc.name : target; // fallback to target text
};

/* ---------- UI bits ---------- */
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
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 blur-xl transition" />
      <div className="relative rounded-2xl border border-white/10 bg-white/5 dark:bg-zinc-900/60 backdrop-blur-sm p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 ring-1 ring-sky-400/20">{icon}</div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">{title}</h3>
              {subtitle && <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 overflow-hidden animate-pulse">
      <div className="aspect-[3/4] sm:aspect-[3/4] lg:aspect-[2/3] bg-white/5" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-white/10 rounded" />
        <div className="h-3 bg-white/10 rounded w-2/3" />
        <div className="flex gap-2 mt-3">
          <div className="h-5 w-16 bg-white/10 rounded-full" />
          <div className="h-5 w-20 bg-white/10 rounded-full" />
        </div>
      </div>
    </div>
  );
}
function DocumentCard({ item, onOpen, isFav, onToggleFav }) {
  const Icon = item.type === "book" ? BookOpen : item.type === "booklet" ? Book : Video;
  return (
    <motion.button type="button" onClick={() => onOpen?.(item)}
      whileHover={{ y: -2 }} transition={{ duration: 0.2, ease: EASE }}
      className="block w-full rounded-2xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-900/80 shadow-sm overflow-hidden text-right">
      <div className="aspect-[3/4] sm:aspect-[3/4] lg:aspect-[2/3] relative bg-zinc-900">
        <div className="absolute top-2 left-2 z-10">
          <button onClick={(e)=>{e.stopPropagation(); onToggleFav?.();}}
            className={`px-2 py-1 rounded-lg text-xs font-semibold border ${isFav? 'bg-amber-400/20 border-amber-300 text-amber-200':'bg-white/10 border-white/20 text-white/90'} backdrop-blur hover:bg-white/20`}>
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
function PaperCard({ item, onOpen, isFav, onToggleFav }) {
  return (
    <motion.button type="button" onClick={() => onOpen?.(item)}
      whileHover={{ y: -2 }} transition={{ duration: 0.2, ease: EASE }}
      className="block w-full rounded-2xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-900/80 shadow-sm overflow-hidden text-right">
      <div className="aspect-[3/4] sm:aspect-[3/4] lg:aspect-[2/3] relative bg-zinc-900">
        <div className="absolute top-2 left-2 z-10">
          <button onClick={(e)=>{e.stopPropagation(); onToggleFav?.();}}
            className={`px-2 py-1 rounded-lg text-xs font-semibold border ${isFav? 'bg-amber-400/20 border-amber-300 text-amber-200':'bg-white/10 border-white/20 text-white/90'} backdrop-blur hover:bg-white/20`}>
            <span className="inline-flex items-center gap-1"><Star size={14} /> {isFav? 'دڵخواز':'حەزبەوە'}</span>
          </button>
        </div>
        {item.thumb_url || item.image_url ? (
          <img src={toCU(item.thumb_url || item.image_url)} alt="" loading="eager" className="absolute inset-0 w-full h-full object-contain sm:object-cover bg-white" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-400/20">
              <FileText size={24} />
            </div>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-bold text-white line-clamp-2">{item.title}</p>
        <p className="mt-1 text-xs text-zinc-400">{item.pdf_url ? "فایل PDF" : "پێشبینین"}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.stream && <Badge className="text-indigo-300">{item.stream === "scientific" ? "زانستی" : "ئەدەبی"}</Badge>}
          {item.subject?.name && <Badge className="text-purple-300">{item.subject.name}</Badge>}
          {item.teacher?.full_name && <Badge className="text-amber-300">{item.teacher.full_name}</Badge>}
          <Badge className="text-zinc-300"><Calendar size={12} /> {formatDate(item.created_at)}</Badge>
        </div>
      </div>
    </motion.button>
  );
}

/* =================== Main Component =================== */
export default function StudentsPageRefined() {
  const navigate = useNavigate();
  const location = useLocation();

  const [tab, setTab] = useState("all");
  const [grade, setGrade] = useState(getStoredGrade()); // header badge controls this
  const [stream, setStream] = useState("");
  const [subject, setSubject] = useState("");
  const [teacher, setTeacher] = useState("");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [showGradePicker, setShowGradePicker] = useState(false);

  const deferredSearch = useDeferredValue(search);

  const [documents, setDocuments] = useState([]);
  const [papers, setPapers]       = useState([]);
  const [subjects, setSubjects]   = useState([]);
  const [teachers, setTeachers]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  const [fav, setFav] = useState(() => new Set(safeGet("fav", [])));
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);
  const sentinelRef = useRef(null);

  const [previewItem, setPreviewItem] = useState(null);
  const [recent, setRecent] = useState(() => safeGet("recent", []));

  useEffect(() => {
    const onStorage = (e) => {
      if (["grade", "user", "profile", "settings"].includes(e.key)) {
        const g = getStoredGrade();
        setGrade(g);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const openInViewer = (item) => {
    try {
      const r = safeGet('recent', []);
      const min = {
        id: item.id, title: item.title, grade: item.grade,
        type: item.type || (tab === 'papers' ? 'papers' : 'doc'),
        thumb_url: item.thumb_url || item.image_url || '',
        subject: item.subject, teacher: item.teacher, stream: item.stream,
        created_at: item.created_at,
        file_url: item.pdf_url || item.file_url || item.image_url || item.thumb_url || ''
      };
      const next = [min, ...r.filter((x)=>x.id!==min.id)].slice(0,12);
      safeSet('recent', next); setRecent(next);
    } catch {}
    const raw   = item?.pdf_url || item?.file_url || item?.image_url || item?.thumb_url || "";
    const url   = (window.__toCorsUrl || ((u)=>u))(raw); if (!url) return;
    const title = item?.title || item?.name || "Viewer";
    const type  = item?.type || (isYouTube(url) ? "youtube" : isPDF(url) ? "pdf" : isImage(url) ? "image" : isVideoFile(url) ? "video" : "file");
    navigate(`/viewer?u=${encodeURIComponent(url)}&t=${encodeURIComponent(title)}&type=${type}`);
  };

  useEffect(() => {
    const list = (tab === 'papers' ? papers : documents).slice(0, 60);
    list.forEach((it) => {
      const src = it.thumb_url || it.image_url || (it.type === 'video' && it.file_url && isYouTube(it.file_url) ? `https://img.youtube.com/vi/${ytId(it.file_url)}/hqdefault.jpg` : '');
      if (!src) return;
      const img = new Image(); img.src = src;
    });
  }, [documents, papers, tab]);

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
        if (![d1,d2,d3,d4].every((r)=>r.ok)) throw new Error("Failed to load one or more endpoints");
        const [j1,j2,j3,j4] = await Promise.all([d1.json(), d2.json(), d3.json(), d4.json()]);
        const docs = Array.isArray(j1?.data) ? j1.data : [];
        const pps  = Array.isArray(j2?.data) ? j2.data : [];
        const subs = Array.isArray(j3?.data) ? j3.data : [];
        const tchs = Array.isArray(j4?.data) ? j4.data : [];
        setDocuments(docs); setPapers(pps); setSubjects(subs); setTeachers(tchs);
      } catch (e) {
        if (e?.name === 'AbortError') return;
        console.error(e);
        setError("لە کاتی بارکردن هەڵەیەک ڕوویدا. هەوڵبدەوە یاخود پەیوەندیەک نییە.");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  // Clear filters (grade fixed in header)
  const clearAll = () => { setStream(""); setSubject(""); setTeacher(""); setSearch(""); setShowFavOnly(false); };

  // Reset subject when grade/stream changes (options change)
  useEffect(() => { setSubject(""); }, [grade, stream]);

  // ---------- SUBJECT OPTIONS (stream + grade rules) ----------
  const subjectOptions = useMemo(() => {
    if (!subjects?.length) return [];

    const scientificBase = subjects.filter(s => (s.code || "").toLowerCase() === "scientific").map(s => s.name);
    const literaryBase   = subjects.filter(s => (s.code || "").toLowerCase() === "literary").map(s => s.name);

    const addNamed = (arr, label) => {
      const real = findNameInSubjects(subjects, label);
      if (!arr.some(x => equalsName(x, real))) arr.push(real);
    };
    const dedup = (arr) => {
      const seen = new Set(); const out = [];
      for (const n of arr) {
        const k = norm(n);
        if (!seen.has(k)) { seen.add(k); out.push(n); }
      }
      return out;
    };

    // Common across both streams
    const COMMON = ["بیرکاری","عه‌ره‌بی","ئینگلیزی","ئاین","كوردی"];

    if (stream === "scientific") {
      let opts = [...scientificBase];
      COMMON.forEach(n => addNamed(opts, n));
      if (grade === 11) addNamed(opts, "كۆمپیوتەر");
      if (grade === 10) ["كۆمپیوتەر", "ماف", "جینۆساید"].forEach(n => addNamed(opts, n));
      return dedup(opts);
    }

    if (stream === "literary") {
      if (grade === 12) {
        // exact set you requested for literary grade 12
        const fixed = ["مێژوو","كوردی","بیركاری","ئاین","ئابووری","ئینگلیزی","عه‌ره‌بی","جووگرافیا"];
        const opts = [];
        fixed.forEach(n => addNamed(opts, n));
        return dedup(opts);
      }
      let opts = [...literaryBase];
      COMMON.forEach(n => addNamed(opts, n));
      if (grade === 11) addNamed(opts, "فه‌لسه‌فه‌");
      if (grade === 10) addNamed(opts, "كۆمه‌ڵناسی");
      return dedup(opts);
    }

    // No stream selected: show everything (all subjects)
    return dedup(subjects.map(s => s.name));
  }, [subjects, stream, grade]);

  // drop subject if no longer present
  useEffect(() => {
    if (subject && !subjectOptions.some((s) => equalsName(s, subject))) {
      setSubject("");
    }
  }, [subjectOptions, subject]);

  const teacherOptions = useMemo(() => teachers.map((t) => t.full_name), [teachers]);

  // Deep link read (ignore grade param; grade is from localStorage)
  useEffect(() => {
    try {
      const sp = new URLSearchParams(location.search);
      const t = sp.get('t'); if (t && ["all","book","booklet","video","papers"].includes(t)) setTab(t);
      const s = sp.get('s') || ''; if (s) setStream(s);
      const sub = sp.get('sub') || ''; if (sub) setSubject(sub);
      const q = sp.get('q') || ''; if (q) setSearch(q);
      const f = sp.get('f') === '1'; setShowFavOnly(f);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Deep link write (no grade)
  useEffect(() => {
    const sp = new URLSearchParams();
    if (tab && tab !== 'all') sp.set('t', tab);
    if (stream) sp.set('s', stream);
    if (subject) sp.set('sub', subject);
    if (search.trim()) sp.set('q', search.trim());
    if (showFavOnly) sp.set('f', '1');
    const qs = sp.toString(); const url = qs ? `?${qs}` : location.pathname;
    window.history.replaceState(null, '', url);
  }, [tab, stream, subject, search, showFavOnly, location.pathname]);

  const toggleFav = (id) => {
    setFav((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      safeSet('fav', [...next]); return next;
    });
  };
  const isFav = (id) => fav.has(id);

  useEffect(() => {
    const el = sentinelRef.current; if (!el) return;
    const io = new IntersectionObserver((entries) => entries.forEach((e)=>{ if (e.isIntersecting) setVisibleCount((n)=>n+16); }), { rootMargin: '1200px' });
    io.observe(el); return () => io.disconnect();
  }, [sentinelRef]);
  useEffect(() => { setVisibleCount(24); }, [tab, stream, subject, teacher, deferredSearch, showFavOnly]);

  const combinedData = useMemo(() => {
    const allItems = [...documents, ...papers.map(p => ({ ...p, type: 'paper' }))];
    const q = deferredSearch.trim().toLowerCase();
    return allItems.filter((item) => {
      const itemType = item.type || (item.pdf_url ? 'paper' : 'book');
      if (tab !== "all") {
        if (tab === "papers" && itemType !== "paper") return false;
        if (tab !== "papers" && itemType !== tab) return false;
      }
      const byGrade = item.grade === grade;
      const bySubject = !subject || equalsName(item.subject?.name || "", subject);
      const byStream = !stream || item.stream === stream;
      const bySearch = !q || `${item.title} ${item.description ?? ""}`.toLowerCase().includes(q);
      const byFav = !showFavOnly || fav.has(item.id);
      const byTeacher = teacher ? equalsName(item.teacher?.full_name || "", teacher) : true;
      return byGrade && bySubject && byStream && bySearch && byFav && byTeacher;
    });
  }, [documents, papers, tab, grade, stream, subject, teacher, deferredSearch, showFavOnly, fav]);

  const data = combinedData;

  const stats = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    const docBase = documents.filter((d) => {
      const byGrade = d.grade === grade;
      const bySubject = !subject || equalsName(d.subject?.name || "", subject);
      const byStream = !stream || d.stream === stream;
      const bySearch = !q || `${d.title} ${d.description ?? ""}`.toLowerCase().includes(q);
      return byGrade && bySubject && byStream && bySearch;
    });
    const papersBase = papers.filter((p) => {
      const byGrade = p.grade === grade;
      const bySubject = !subject || equalsName(p.subject?.name || "", subject);
      const byStream = !stream || p.stream === stream;
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
  }, [documents, papers, grade, subject, stream, deferredSearch]);

  const openPreview = (item) => setPreviewItem(item);

  // -------- grade picker actions --------
  const setGradeAndSave = (g) => {
    setGrade(g);
    safeSet("grade", g);
    setShowGradePicker(false);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-50 p-3 sm:p-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(1200px_600px_at_120%_-20%,rgba(56,189,248,.15),transparent),radial-gradient(800px_400px_at_-10%_10%,rgba(16,185,129,.12),transparent)] p-6 sm:p-10">
        <motion.div initial={{opacity:0, y:12}} animate={{opacity:1, y:0}} transition={{duration:0.5, ease:EASE}} className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-sky-500/15 ring-1 ring-sky-400/20 flex items-center justify-center">
              <Users size={36} className="text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold">ناوەندی سەرچاوەی خوێندن</h1>
                {/* Clickable Grade badge */}
                <Badge asButton className="text-sky-200 ring-sky-400/30 bg-sky-500/10" onClick={()=>setShowGradePicker(v=>!v)}>
                  <Hash size={12}/> {GRADE_NAME(grade)} <ChevronDown size={14}/>
                </Badge>
              </div>
              <p className="text-zinc-400 text-sm sm:text-base mt-1">کتێب، مەڵزەمەکان، ڤیدیۆ و ئەسیلەکان — هەموو لە یەک شوێندا</p>
              <motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} transition={{duration:0.45, ease:EASE}} className="mt-2 text-[12px] sm:text-sm text-sky-200/90 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>📚 کتێب: {stats.books}</span>
                <span>📘 مەڵزەمەکان: {stats.booklets}</span>
                <span>🎬 ڤیدیۆ: {stats.videos}</span>
                <span>📝 ئەسیلەکان: {stats.papers}</span>
              </motion.div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={clearAll} className="px-3 py-2 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10 flex items-center gap-2">
              <RefreshCcw size={16} /> ڕێکخستنەکان بسڕەوە
            </button>
            <button onClick={() => setView((v) => (v === "grid" ? "list" : "grid"))} className="px-3 py-2 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10 flex items-center gap-2">
              {view === "grid" ? (<><Rows size={16} /> لیست</>) : (<><Grid3X3 size={16} /> گرید</>)}
            </button>
          </div>
        </motion.div>

        {/* Grade dropdown */}
        <AnimatePresence>
          {showGradePicker && (
            <>
              <motion.div className="fixed inset-0 z-40" initial={{opacity:0}} animate={{opacity:0.0}} exit={{opacity:0}} onClick={()=>setShowGradePicker(false)} />
              <motion.div
                initial={{opacity:0, y:-6}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-6}}
                transition={{duration:0.18}}
                className="absolute z-50 mt-2 right-40 sm:right-60 top-24 sm:top-20 rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur p-2 shadow-xl"
              >
                <div className="grid grid-cols-3 gap-2 w-[220px]">
                  {[7,8,9,10,11,12].map(g => (
                    <button key={g} onClick={()=>setGradeAndSave(g)}
                      className={`px-3 py-2 rounded-xl text-sm border ${g===grade?'bg-sky-500/15 text-sky-200 border-sky-400/30':'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}>
                      {GRADE_NAME(g)}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Search */}
        <div className="relative mt-5">
          <motion.input initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} transition={{duration:0.45, ease:EASE}}
            value={search} onChange={(e) => setSearch(e.target.value)} type="search"
            placeholder="بەدوای ناونیشان بگەڕێ..."
            className="w-full rounded-2xl bg-zinc-900/70 border border-white/10 px-4 py-3 pr-12 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          />
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Recently viewed */}
      {recent.length > 0 && (
        <div className="mt-3 -mx-2 px-2">
          <div className="text-xs text-zinc-400 mb-2">دوایین بینینەکان</div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {recent.map((it) => (
              <button key={it.id} onClick={() => setPreviewItem(it)} className="shrink-0 w-24 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 overflow-hidden text-right">
                <div className="aspect-[3/4] bg-zinc-900 relative">
                  {it.thumb_url ? (
                    <img src={toCU(it.thumb_url)} alt="" loading="eager" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                      {it.type === 'papers' ? <FileText size={18}/> : <BookOpen size={18}/>}
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <div className="text-xs font-semibold line-clamp-2">{it.title}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Filter Toolbar (Desktop) — grade REMOVED */}
      <div className="sticky top-2 z-30 mt-4 hidden sm:block">
        <div className="rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              {TYPE_TABS.map((t) => (
                <PillButton key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}>
                  <div className="inline-flex items-center gap-2"><t.icon size={16} /> {t.name}</div>
                </PillButton>
              ))}
            </div>
            <div className="flex items-center gap-1 ml-2">
              <PillButton active={!stream} onClick={()=>setStream("")}>هەموو</PillButton>
              <PillButton active={stream==="scientific"} onClick={()=>setStream("scientific")}>زانستی</PillButton>
              <PillButton active={stream==="literary"}  onClick={()=>setStream("literary")}>ئەدەبی</PillButton>
            </div>
            <div className="h-6 w-px bg-white/10 mx-1" />
            <div className="flex items-center gap-2">
              <PillButton active={showFavOnly} onClick={()=>setShowFavOnly(v=>!v)}>دڵخوازەکان</PillButton>

              <select value={stream} onChange={(e) => setStream(e.target.value)} className="bg-zinc-900/70 border border-white/10 rounded-xl px-2.5 py-2 text-sm">
                <option value="">هەموو بەشەکان</option>
                <option value="scientific">زانستی</option>
                <option value="literary">ئەدەبی</option>
              </select>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="bg-zinc-900/70 border border-white/10 rounded-xl px-2.5 py-2 text-sm">
                <option value="">هەموو بابەتەکان</option>
                {subjectOptions.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
              <select value={teacher} onChange={(e) => setTeacher(e.target.value)} className="bg-zinc-900/70 border border-white/10 rounded-xl px-2.5 py-2 text-sm">
                <option value="">هەموو مامۆستایان</option>
                {teacherOptions.map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile filters — grade REMOVED */}
      <div className="sm:hidden mt-4 space-y-3">
        <div className="-mx-3 px-3">
          <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
            {TYPE_TABS.map((t) => (
              <div key={t.key} className="snap-start">
                <PillButton active={tab === t.key} onClick={() => setTab(t.key)} className="whitespace-nowrap">
                  <div className="inline-flex items-center gap-2"><t.icon size={16} /> {t.name}</div>
                </PillButton>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur p-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-zinc-400">بەش</label>
              <select value={stream} onChange={(e)=>setStream(e.target.value)} className="mt-1 w-full bg-zinc-900/70 border border-white/10 rounded-xl px-3 py-2 text-sm">
                <option value="">هەموو بەشەکان</option>
                <option value="scientific">زانستی</option>
                <option value="literary">ئەدەبی</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-400">بابەت</label>
              <select value={subject} onChange={(e)=>setSubject(e.target.value)} className="mt-1 w-full bg-zinc-900/70 border border-white/10 rounded-xl px-3 py-2 text-sm">
                <option value="">هەموو بابەتەکان</option>
                {subjectOptions.map((s)=>(<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-zinc-400">مامۆستا</label>
              <select value={teacher} onChange={(e)=>setTeacher(e.target.value)} className="mt-1 w-full bg-zinc-900/70 border border-white/10 rounded-xl px-3 py-2 text-sm">
                <option value="">هەموو مامۆستایان</option>
                {teacherOptions.map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-4">
        <SectionCard title={TYPE_TABS.find((t) => t.key === tab)?.name || "سەرچاوەکان"} subtitle="ئەمانە ئەنجامی فلتەرەکانن" icon={<Sparkles size={18} className="text-sky-300" />}>
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
                  <AnimatePresence>
                    {data.slice(0, visibleCount).map((item) => (
                      <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2, ease: EASE }}>
                        {item.type === "paper" ? (
                          <PaperCard item={item} onOpen={setPreviewItem} isFav={isFav(item.id)} onToggleFav={()=>toggleFav(item.id)} />
                        ) : view === "grid" ? (
                          <DocumentCard item={item} onOpen={setPreviewItem} isFav={isFav(item.id)} onToggleFav={()=>toggleFav(item.id)} />
                        ) : (
                          <button type="button" onClick={() => setPreviewItem(item)} className="w-full text-right flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-900/80 p-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                              <p className="text-xs text-zinc-400 truncate">{item.subject?.name} • {item.teacher?.full_name}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={(e)=>{e.stopPropagation(); toggleFav(item.id);}} className={`px-2 py-1 rounded-lg text-xs font-semibold border ${isFav(item.id)?'bg-amber-400/20 border-amber-300 text-amber-200':'bg-white/10 border-white/20 text-white/90'} backdrop-blur hover:bg-white/20`}>
                                <span className="inline-flex items-center gap-1"><Star size={14} /> {isFav(item.id)?'لابردن لە دڵخواز':'زیادکردن بۆ دڵخواز'}</span>
                              </button>
                            </div>
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {data.length > visibleCount && (
                    <div className="col-span-full flex items-center justify-center gap-2 py-3">
                      <PillButton onClick={() => setVisibleCount((n) => n + 24)}>بینینی زیاتر</PillButton>
                      <PillButton onClick={() => setVisibleCount(data.length)}>بینینی هەموو شتان</PillButton>
                    </div>
                  )}
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
                <motion.div initial={{y: "100%"}} animate={{y: 0}} exit={{y: "100%"}} transition={{duration:0.25, ease:EASE}} className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border border-white/10 bg-zinc-950 p-4 pb-25">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white text-base line-clamp-2">{previewItem.title}</h3>
                    <button onClick={() => setPreviewItem(null)} className="p-2 rounded-lg bg-white/5 border border-white/10"><X size={16}/></button>
                  </div>
                  <div className="text-xs text-zinc-300 space-y-1">
                    <div className="flex flex-wrap gap-1">
                      {previewItem.stream && (<Badge>{previewItem.stream==='scientific'?'زانستی':'ئەدەبی'}</Badge>)}
                      {previewItem.subject?.name && (<Badge className="text-purple-300">{previewItem.subject.name}</Badge>)}
                      {previewItem.teacher?.full_name && (<Badge className="text-amber-300">{previewItem.teacher.full_name}</Badge>)}
                    </div>
                    <div className="text-zinc-400">بەروار: {formatDate(previewItem.created_at)}</div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={()=>{toggleFav(previewItem.id);}} className={`px-3 py-2 rounded-xl text-sm font-semibold border ${isFav(previewItem.id)?'bg-amber-400/20 border-amber-300 text-amber-200':'bg-white/5 border-white/10 text-white'}`}>
                      <span className="inline-flex items-center gap-2"><Star size={16}/> {isFav(previewItem.id)?'لابردن لە دڵخواز':'زیادکردن بۆ دڵخواز'}</span>
                    </button>
                    <button onClick={()=>openInViewer(previewItem)} className="px-3 py-2 rounded-xl text-sm font-semibold bg-sky-500/15 text-sky-200 border border-sky-400/20 hover:bg-sky-500/25">کردنەوەی پەڕەی گەورە</button>
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{x: "100%"}} animate={{x: 0}} exit={{x: "100%"}} transition={{duration:0.25, ease:EASE}} className="fixed right-0 top-0 bottom-0 w-[420px] z-50 border-l border-white/10 bg-zinc-950 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white text-base line-clamp-2">{previewItem.title}</h3>
                    <button onClick={() => setPreviewItem(null)} className="p-2 rounded-lg bg-white/5 border border-white/10"><X size={16}/></button>
                  </div>
                  <div className="text-xs text-zinc-300 space-y-1">
                    <div className="flex flex-wrap gap-1">
                      {previewItem.stream && (<Badge>{previewItem.stream==='scientific'?'زانستی':'ئەدەبی'}</Badge>)}
                      {previewItem.subject?.name && (<Badge className="text-purple-300">{previewItem.subject.name}</Badge>)}
                      {previewItem.teacher?.full_name && (<Badge className="text-amber-300">{previewItem.teacher.full_name}</Badge>)}
                    </div>
                    <div className="text-zinc-400">بەروار: {formatDate(previewItem.created_at)}</div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={()=>{toggleFav(previewItem.id);}} className={`px-3 py-2 rounded-xl text-sm font-semibold border ${isFav(previewItem.id)?'bg-amber-400/20 border-amber-300 text-amber-200':'bg-white/5 border-white/10 text-white'}`}>
                      <span className="inline-flex items-center gap-2"><Star size={16}/> {isFav(previewItem.id)?'لابردن لە دڵخواز':'زیادکردن بۆ دڵخواز'}</span>
                    </button>
                    <button onClick={()=>openInViewer(previewItem)} className="px-3 py-2 rounded-xl text-sm font-semibold bg-sky-500/15 text-sky-200 border border-sky-400/20 hover:bg-sky-500/25">کردنەوەی پەڕەی گەورە</button>
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
