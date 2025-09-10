// src/pages/Students.jsx — Documents (Books + Booklets)
// - Stream/track read from localStorage("track") e.g., "زانستی", "ئەدەبی", "گشتی" (or English)
// - NEW: When stream is Scientific or Literary, items with stream "Both/Common/General" also match
// - No Subject/Teacher pickers
// - Loads ALL pages from /api/v1/documents (server pagination)
// - Toggle document type: All / Book / Booklet
// - Search, favorites (persisted), infinite display (client-side), mobile sheet preview
// - CORS-safe /storage → /api/v1/dl/ converter
// - Grade picker persists to localStorage

import React, { useEffect, useMemo, useRef, useState, useDeferredValue } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, BookOpen, X, Calendar, AlertCircle, Sparkles, Star,
  GraduationCap, FlaskConical, ChevronDown, Library, Loader2,
  Sigma, Atom, Languages, Calculator
} from "lucide-react";

/* ===== Helpers ===== */
const EASE = [0.22, 1, 0.36, 1];
const API_DOCUMENTS_URL = "https://api.studentkrd.com/api/v1/documents";
const API_SUBJECTS_URL  = "https://api.studentkrd.com/api/v1/subjects";
const API_TEACHERS_URL  = "https://api.studentkrd.com/api/v1/teachers";

const DOC_TYPES = [
  { key: "all",     label: "هەموو" },
  { key: "book",    label: "کتێب" },
  { key: "booklet", label: "مه‌لزه‌مه‌" },
];

const safeGet = (k, fb) => { try { const v = localStorage.getItem(k); return v ?? fb; } catch { return fb; } };
const safeSet = (k, v) => { try { localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)); } catch {} };

const formatDate = (d) => {
  try { return new Date(d).toLocaleDateString("ku-IQ", { year: "numeric", month: "long", day: "numeric" }); }
  catch { return d || ""; }
};

const getStoredGrade = () => {
  const v = Number(safeGet("grade", ""));
  return Number.isFinite(v) && v >= 1 ? v : 12;
};

// Normalize the chosen track → API stream value
const normalizeStreamFromTrack = (t) => {
  const s = (t || "").toString().trim().toLowerCase();
  const sci = ["scientific","zansti","زانستی","وێژەیی","wezheyi","wêjeyî"]; // science
  const lit = ["literary","adabi","ئەدەبی","ادبی"]; // literature
  const common = ["common","both","general","گشتی","عام","mid"]; // both/general
  if (sci.some(w => s.includes(w))) return "scientific";
  if (lit.some(w => s.includes(w))) return "literary";
  if (common.some(w => s.includes(w))) return "common";
  return "scientific"; // fallback
};

// Generic normalizer for any object's stream-like field (e.g., subjects.code/stream)
const normalizeStreamString = (val) => {
  // Robust normalizer for stream/track strings → "scientific" | "literary" | "common"
  // Treat unknown/empty as "common" (Both)
  let s = (val ?? "").toString().trim();
  if (!s) return "common";

  // Lowercase + strip Latin accents
  s = s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");

  // Unify Arabic/Kurdish letter variants
  s = s
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ی")   // alif maqsura → yeh
    .replace(/ي/g, "ی")   // Arabic yeh → Farsi yeh
    .replace(/ك/g, "ک")   // Arabic kaf → Farsi kaf
    .replace(/ة/g, "ه")   // ta marbuta → heh
    .replace(/ۆ/g, "و")
    .replace(/û/g, "u").replace(/î/g, "i").replace(/ê/g, "e");

  const has = (arr) => arr.some((w) => s.includes(w));

  const sci = [
    "scientific", "science", "sci",
    "علمي", "علميه", "علوم",
    "زانستی", "وێژەیی", "wezheyi", "zansti", "zanisti", "wezhayi"
  ];
  const lit = [
    "literary", "literature", "lit",
    "ادبي", "أدبي", "الأدبي", "ادبی",
    "ئەدەبی", "ئه‌ده‌بی", "adabi"
  ];
  const common = [
    "both", "common", "general", "shared",
    "مشترك", "مشتركة", "عمومي", "عام", "عامة",
    "گشتی", "گشتي", "mid"
  ];

  if (has(sci)) return "scientific";
  if (has(lit)) return "literary";
  if (has(common)) return "common";

  // Default to Both/Common
  return "common";
};


const getExt = (url = "") => {
  try { const clean = url.split("?")[0].split("#")[0]; const p = clean.split("."); return p.length > 1 ? p.pop().toLowerCase() : ""; }
  catch { return ""; }
};
const isPDF = (u) => getExt(u) === "pdf";
const isImage = (u) => ["png","jpg","jpeg","webp","gif"].includes(getExt(u));
const isVideoFile = (u) => ["mp4","webm","ogg","mov","m4v"].includes(getExt(u));

// Convert /storage/uploads/... to CORS-safe /api/v1/dl/uploads/... URL
const toCU = (raw) => {
  try {
    if (!raw) return raw;
    const u = new URL(raw, window.location.origin);
    if (/(v1\/)?dl\//i.test(u.pathname)) return u.toString();
    if ((/^api\.studentkrd\.com$/i).test(u.hostname) || (/\.studentkrd\.com$/i).test(u.hostname)) {
      const m = u.pathname.match(/^\/storage\/(.+)$/i);
      if (m && m[1]) return `https://api.studentkrd.com/api/v1/dl/${m[1]}`;
    }
    return u.toString();
  } catch { return raw; }
};

// Subject icon by name heuristics
function SubjectIcon({ name = "", size = 14, className = "" }) {
  const n = (name || "").toLowerCase();
  if (/math|ریاز|مات/.test(n)) return <Sigma size={size} className={className} />;
  if (/chem|کیمیا|chemy/.test(n)) return <FlaskConical size={size} className={className} />;
  if (/phys|فیزیا|physics/.test(n)) return <Atom size={size} className={className} />;
  if (/bio|زیند|biology/.test(n)) return <Atom size={size} className={className} />;
  if (/english|ingliz|eng/.test(n)) return <Languages size={size} className={className} />;
  if (/kurd|کورد/.test(n)) return <BookOpen size={size} className={className} />;
  if (/arab|عەرەب/.test(n)) return <Languages size={size} className={className} />;
  if (/comp|computer|ئۆفیس|IT|informatics/i.test(name || "")) return <Calculator size={size} className={className} />;
  return <BookOpen size={size} className={className} />;
}

/* ===== Small UI Atoms ===== */
function Badge({ children, className = "", asButton = false, onClick }) {
  const base = "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-white/10 bg-white/5";
  if (asButton) return (<button type="button" onClick={onClick} className={`${base} hover:bg-white/10 ${className}`}>{children}</button>);
  return <span className={`${base} ${className}`}>{children}</span>;
}

function PillButton({ active, children, onClick, className = "", disabled = false }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors border disabled:opacity-60 disabled:cursor-not-allowed ${
        active ? "bg-sky-500/10 text-sky-300 border-sky-400/30" : "bg-zinc-900/40 text-zinc-300 border-white/10 hover:bg-zinc-900/70"
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
          <div className="flex items-center gap-2 text-white font-semibold">{icon} <span>{title}</span></div>
          {subtitle && <div className="text-xs text-zinc-400">{subtitle}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}

function SkeletonCard() { return <div className="rounded-2xl border border-white/10 bg-white/5 animate-pulse h-56" />; }

function DocCard({ item, onOpen, isFav, onToggleFav }) {
  return (
    <motion.button type="button" onClick={() => onOpen?.(item)} whileHover={{ y: -2 }} transition={{ duration: 0.2, ease: EASE }}
      className="block w-full rounded-2xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-900/80 shadow-sm overflow-hidden text-right">
      <div className="aspect-[3/4] relative bg-zinc-900">
        <div className="absolute top-2 left-2 z-10">
          <div role="button" onClick={(e)=>{e.stopPropagation(); onToggleFav?.();}}
            className={`cursor-pointer px-2 py-1 rounded-lg text-xs font-semibold border ${isFav? 'bg-amber-400/20 border-amber-200/30 text-amber-200':'bg-white/10 border-white/20 text-white/90'} backdrop-blur hover:bg-white/20`}>
            <span className="inline-flex items-center gap-1"><Star size={14} /> {isFav? 'دڵخواز':'حەزبەوە'}</span>
          </div>
        </div>
        {(() => {
          const thumb = item.thumb_url || item.image_url || "";
          return thumb ? (
            <img src={toCU(thumb)} alt="" loading="eager" className="absolute inset-0 w-full h-full sm:object-cover bg-white" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
              <div className="p-4 rounded-xl bg-sky-500/10 text-sky-400 ring-1 ring-sky-400/20"><BookOpen size={24} /></div>
            </div>
          );
        })()}
      </div>
      <div className="p-3">
        <p className="text-sm font-bold text-white line-clamp-2">{item.title}</p>
        {item.description && <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{item.description}</p>}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.subject?.name && <Badge className="text-purple-300"><SubjectIcon name={item.subject.name} className="mr-1" /> {item.subject.name}</Badge>}
          {item.teacher?.full_name && <Badge className="text-amber-300">{item.teacher.full_name}</Badge>}
          {item.created_at && <Badge className="text-zinc-300"><Calendar size={12} /> {formatDate(item.created_at)}</Badge>}
        </div>
      </div>
    </motion.button>
  );
}

/* ===== Main Component ===== */
export default function StudentsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Track/stream (read-only selector from localStorage)
  const [track, setTrack] = useState(localStorage.getItem("track") || "زانستی");
  const stream = useMemo(() => normalizeStreamFromTrack(track), [track]);

  // Doc type
  const [docType, setDocType] = useState(safeGet("docType", "all"));
  useEffect(() => safeSet("docType", docType), [docType]);

  // Data (moved up to avoid TDZ when used in subjectOptions)
  const [documents, setDocuments] = useState([]);

  // Grade (moved up to avoid TDZ in subjectOptions)
  const [grade, setGrade] = useState(getStoredGrade());
  const [showGradePicker, setShowGradePicker] = useState(false);
  const setGradeAndSave = (g) => { setGrade(g); safeSet("grade", g); setShowGradePicker(false); };

// Booklet-only filters
const [teachers, setTeachers] = useState([]);
const [subjectId, setSubjectId] = useState(""); // empty = All
const [teacherId, setTeacherId] = useState(""); // empty = All

// Subjects derived from loaded documents (booklets only), filtered by grade + track (Both included)
const subjectOptions = useMemo(() => {
  if (docType !== "booklet") return [];
  const BOTH = ["both","common","general","گشتی","عام"];
  const seen = new Set();
  const out = [];
  for (const it of documents) {
    if (it.type !== "booklet") continue;
    if (Number(it.grade) !== Number(grade)) continue;
    const itemStream = (it.stream || "").toLowerCase();
    let ok = true;
    if (stream === "scientific") ok = (itemStream === "scientific" || BOTH.includes(itemStream));
    else if (stream === "literary") ok = (itemStream === "literary" || BOTH.includes(itemStream));
    else if (stream === "common") ok = BOTH.includes(itemStream);
    if (!ok) continue;
    const s = it.subject || {};
    if (!s || s.id == null) continue;
    const id = Number(s.id);
    if (!seen.has(id)) { seen.add(id); out.push({ id, name: s.name || `#${id}` }); }
  }
  return out.sort((a,b)=> (a.name||"").localeCompare(b.name||"", "ku"));
}, [documents, docType, grade, stream]);

// If selected subject becomes hidden due to filters, clear it
useEffect(() => {
  if (subjectId && !subjectOptions.some(s => Number(s.id) === Number(subjectId))) setSubjectId("");
}, [subjectOptions, subjectId]);

  // Search
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  // Favorites
  const [fav, setFav] = useState(new Set(JSON.parse(safeGet("fav","[]")||"[]")));
  const isFav = (id) => fav.has(id);
  const toggleFav = (item) => setFav(prev => { const n = new Set(prev); n.has(item.id) ? n.delete(item.id) : n.add(item.id); return n; });
  useEffect(()=>safeSet("fav", Array.from(fav)),[fav]);
  const [showFavOnly, setShowFavOnly] = useState(false);
  // Data
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Infinite display
  const [visibleCount, setVisibleCount] = useState(24);
  const sentinelRef = useRef(null);
  useEffect(() => {
    const el = sentinelRef.current; if (!el) return;
    const io = new IntersectionObserver((entries) => entries.forEach(e => { if (e.isIntersecting) setVisibleCount(n=>n+16); }), { rootMargin: "1200px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  useEffect(() => { setVisibleCount(24); }, [grade, stream, docType, deferredSearch, showFavOnly, fav]);

  // Preview
  const [previewItem, setPreviewItem] = useState(null);
// —— URL → state (q, t, grade, subject_id, subject)
const pendingSubjectNameRef = useRef(null);
useEffect(() => {
  const sp = new URLSearchParams(location.search);
  const qParam       = (sp.get("q") || "").trim();
  const tParam       = (sp.get("t") || "").trim().toLowerCase();   // all | book | booklet
  const gradeParam   = Number(sp.get("grade") || "");
  const subjectIdRaw = Number(sp.get("subject_id") || "");
  const subjectName  = (sp.get("subject") || "").trim();

  if (qParam) setSearch(qParam);

  if (["all","book","booklet"].includes(tParam)) {
    setDocType(tParam);
  }

  if (Number.isFinite(gradeParam) && gradeParam >= 1) {
    setGradeAndSave(gradeParam);
  }

  // Only meaningful for booklet mode; we accept either subject_id
  // or a subject name (matched after subjectOptions load).
  if (tParam === "booklet") {
    if (Number.isFinite(subjectIdRaw) && subjectIdRaw > 0) {
      setSubjectId(String(subjectIdRaw));
    } else if (subjectName) {
      pendingSubjectNameRef.current = subjectName;
    }
  } else {
    setSubjectId("");
  }
}, [location.search]); // also updates on back/forward

// If only a subject *name* was provided, match it as soon as the
// derived subjectOptions are ready (grade/track aware).
useEffect(() => {
  const wanted = (pendingSubjectNameRef.current || "").toLowerCase();
  if (!wanted || !subjectOptions.length) return;
  const hit = subjectOptions.find(
    s => (s.name || "").toLowerCase().includes(wanted)
  );
  if (hit) {
    setSubjectId(String(hit.id));
    pendingSubjectNameRef.current = null;
  }
}, [subjectOptions]);

  // Load ALL pages from API
useEffect(() => {
  const ctrl = new AbortController();
  (async () => {
    try {
      setLoading(true); setError("");
      const all = [];
      let page = 1;
      for (let i=0; i<30; i++) {
        const url = `${API_DOCUMENTS_URL}?page=${page}`;
        const r = await fetch(url, { signal: ctrl.signal });
        if (!r.ok) throw new Error(`Failed to load page ${page}`);
        const j = await r.json();
        const chunk = Array.isArray(j?.data) ? j.data : [];
        all.push(...chunk);
        const cur = Number(j?.current_page ?? page);
        const last = Number(j?.last_page ?? cur);
        if (!Number.isFinite(cur) || !Number.isFinite(last) || cur >= last) break;
        page = cur + 1;
      }
      setDocuments(all);
    } catch (e) {
      if (e?.name !== "AbortError") { console.error(e); setError("لە کاتی بارکردن هەڵەیەک ڕوویدا. هەوڵبدەوە."); }
    } finally { setLoading(false); }
  })();
  return () => ctrl.abort();
}, []);

// Fetch teachers for booklet filter (subjects are derived from documents)
useEffect(() => {
  let dead = false;
  (async () => {
    try {
      const rt = await fetch(API_TEACHERS_URL);
      const jt = rt.ok ? await rt.json() : { data: [] };
      if (!dead) setTeachers(Array.isArray(jt?.data) ? jt.data : []);
    } catch (e) { console.warn("Failed to load teachers", e); }
  })();
  return () => { dead = true; };
}, []);

  // Filter logic
  const data = useMemo(() => {
    const q = deferredSearch;
    return documents.filter((item) => {
      // 1) Type
      const byType = docType === "all" ? true : (item.type === docType);
      if (!byType) return false;

      // 2) Grade
      const byGrade = Number(item.grade) === Number(grade);
      if (!byGrade) return false;

      // 3) Stream with BOTH support
const itemStream = (item.stream || "").toLowerCase();
const BOTH = ["both","common","general","گشتی","عام"]; // values treated as shared
let byStream = true;
if (stream === "scientific") byStream = (itemStream === "scientific" || BOTH.includes(itemStream));
else if (stream === "literary") byStream = (itemStream === "literary" || BOTH.includes(itemStream));
else if (stream === "common") byStream = BOTH.includes(itemStream);
if (!byStream) return false;

// 3.5) Booklet-only subject/teacher filtering
if (docType === "booklet") {
  if (subjectId && Number(item.subject_id) !== Number(subjectId)) return false;
  if (teacherId && Number(item.teacher_id) !== Number(teacherId)) return false;
}

      // 4) Search
      const hay = `${item.title} ${item.description ?? ""}`.toLowerCase();
      const bySearch = !q || hay.includes(q);
      if (!bySearch) return false;

      // 5) Favorites view
      if (showFavOnly && !fav.has(item.id)) return false;

      return true;
    });
  }, [documents, docType, grade, stream, deferredSearch, showFavOnly, fav]);

  const statsTotal = data.length;

  // Open in viewer
  const openInViewer = (item) => {
    const raw   = item?.pdf_url || item?.file_url || item?.image_url || item?.thumb_url || "";
    const url   = toCU(raw); if (!url) return;
    const title = item?.title || item?.name || "Viewer";
    const type  = isPDF(url) ? "pdf" : isImage(url) ? "image" : isVideoFile(url) ? "video" : "file";
    navigate(`/viewer?u=${encodeURIComponent(url)}&t=${encodeURIComponent(title)}&type=${type}`);
  };

  const clearAll = () => { setSearch(""); setShowFavOnly(false); };
  const GRADE_NAME = (g) => `پۆل ${g}`;

  return (
    <div className="relative p-3 sm:p-5" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <Sparkles size={20} className="text-sky-300" /> خوێندنگەی فایله‌كان
          </div>
          <div className="flex items-center gap-2">
            <Badge asButton onClick={()=>setShowGradePicker(v=>!v)} className="text-indigo-300">
              <GraduationCap size={14}/> {GRADE_NAME(grade)} <ChevronDown size={12}/>
            </Badge>
            <Badge className="text-fuchsia-300">
              <FlaskConical size={14}/> {stream === "scientific" ? "زانستی" : stream === "literary" ? "ئەدەبی" : "گشتی"}
            </Badge>
          </div>
        </div>

        {/* Grade dropdown */}
        <AnimatePresence>
          {showGradePicker && (
            <>
              <motion.div className="fixed inset-0 z-40" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setShowGradePicker(false)} />
              <motion.div initial={{opacity:0, y:-6}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-6}} transition={{duration:0.18}}
                className="absolute z-50 mt-2 right-40 sm:right-48 rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur p-2 shadow-xl">
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

        {/* Doc type segmented control */}
<div className="flex flex-col gap-2 py-1">
  <div className="flex items-center gap-2 overflow-x-auto">
    {DOC_TYPES.map(dt => (
      <PillButton key={dt.key} active={docType === dt.key} onClick={() => setDocType(dt.key)} className="shrink-0">
        {dt.label}
      </PillButton>
    ))}
  </div>

  {/* Booklet-only subject/teacher filters */}
  {docType === "booklet" && (
    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
      <div className="relative">
        <select value={subjectId} onChange={(e)=>setSubjectId(e.target.value)}
          className="w-full appearance-none rounded-xl bg-zinc-900/60 border border-white/10 px-3 py-2 text-sm text-zinc-200 pr-8">
          <option value="">هەموو وانەکان</option>
          {subjectOptions.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500"><ChevronDown size={16}/></span>
      </div>
      <div className="relative">
        <select value={teacherId} onChange={(e)=>setTeacherId(e.target.value)}
          className="w-full appearance-none rounded-xl bg-zinc-900/60 border border-white/10 px-3 py-2 text-sm text-zinc-200 pr-8">
          <option value="">هەموو مامۆستاکان</option>
          {teachers.map(t => (
            <option key={t.id} value={t.id}>{t.full_name || t.name}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500"><ChevronDown size={16}/></span>
      </div>
      {(subjectId || teacherId) && (
        <PillButton onClick={()=>{ setSubjectId(""); setTeacherId(""); }}>سڕینەوەی فلتەر</PillButton>
      )}
    </div>
  )}
</div>

{/* Search */}
      <div className="relative mt-1">
        <motion.input initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} transition={{duration:0.45, ease:EASE}}
          value={search} onChange={(e) => setSearch(e.target.value)} type="search"
          placeholder="بەدوای ناونیشان بگەڕێ..."
          className="w-full rounded-2xl bg-zinc-900/60 border border-white/10 px-3 py-3 pr-10 text-sm text-zinc-200 outline-none"/>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
      </div>

      {/* Quick controls */}
      <div className="flex items-center gap-2">
        <PillButton active={showFavOnly} onClick={()=>setShowFavOnly(v=>!v)}>دڵخوازەکان</PillButton>
        {search && <PillButton onClick={() => setSearch("")}>پاککردنەوەی گەڕان</PillButton>}
        {/* <PillButton onClick={clearAll}>هەموو فلتەرەکان بسڕەوە</PillButton> */}
      </div>
      </div>

      {/* Content */}
      <div className="mt-4">
        <SectionCard title="فایله‌كان" subtitle={statsTotal ? `ئامادە: ${statsTotal}` : ""} icon={<Library size={18} className="text-sky-300" />}> 
          {loading && documents.length === 0 ? (
            <div className="py-10 flex items-center justify-center gap-2 text-zinc-300">
              <Loader2 className="animate-spin" /> باردەکەوێت...
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
                  <p>ھیچ شتێک نەدۆزرایەوە. وشەیەکی تر تاقی بکەرەوە.</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <PillButton onClick={() => setSearch("")}>پاککردنەوەی گەڕان</PillButton>
                    <PillButton onClick={clearAll}>هەموو فلتەرەکان بسڕەوە</PillButton>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3 sm:gap-4">
                  {data.slice(0, visibleCount).map((item) => (
                    <DocCard key={item.id} item={item} onOpen={setPreviewItem} isFav={isFav(item.id)} onToggleFav={() => toggleFav(item)} />
                  ))}
                  {data.length > visibleCount && (<div ref={sentinelRef} className="h-8 col-span-full" />)}
                </div>
              )}
            </>
          )}
        </SectionCard>

        {/* Preview */}
        <AnimatePresence>
          {previewItem && (
            <>
              <motion.div onClick={() => setPreviewItem(null)} initial={{opacity:0}} animate={{opacity:0.6}} exit={{opacity:0}} transition={{duration:0.2}} className="fixed inset-0 bg-black/60 z-40" />
              {window.matchMedia('(max-width: 640px)').matches ? (
                <motion.div initial={{y: "100%"}} animate={{y: 0}} exit={{y: "100%"}} transition={{duration:0.25, ease:EASE}}
                  className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border border-white/10 bg-zinc-950 p-4 pb-24">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white text-base line-clamp-2">{previewItem.title}</h3>
                    <button onClick={() => setPreviewItem(null)} className="p-2 rounded-lg bg-white/5 border border-white/10"><X size={16}/></button>
                  </div>
                  <div className="text-xs text-zinc-300 space-y-1">
                    <div className="flex flex-wrap gap-1">
                      {previewItem.subject?.name && <Badge className="text-purple-300">{previewItem.subject.name}</Badge>}
                      {previewItem.teacher?.full_name && <Badge className="text-amber-300">{previewItem.teacher.full_name}</Badge>}
                      {previewItem.created_at && <Badge className="text-zinc-300"><Calendar size={12}/> {formatDate(previewItem.created_at)}</Badge>}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <div role="button" onClick={()=>toggleFav(previewItem)} className={`cursor-pointer px-3 py-2 rounded-xl text-sm font-semibold border ${fav.has(previewItem.id)?'bg-amber-400/20 border-amber-200/30 text-amber-200':'bg-white/5 border-white/10 text-white'}`}>
                      <span className="inline-flex items-center gap-1"><Star size={14}/> {fav.has(previewItem.id)?'لابردن لە دڵخواز':'زیادکردن بۆ دڵخواز'}</span>
                    </div>
                    <button onClick={()=>openInViewer(previewItem)} className="px-3 py-2 rounded-xl text-sm font-semibold bg-sky-500/20 border border-sky-400/30 text-sky-200 hover:border-sky-400/20 hover:bg-sky-500/25">کردنەوەی پەڕەی گەورە</button>
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:20}} transition={{duration:0.2, ease:EASE}}
                  className="fixed right-4 bottom-4 z-50 w-[440px] max-w-[92vw] rounded-2xl border border-white/10 bg-zinc-950 p-4 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base line-clamp-2">{previewItem.title}</h3>
                    <button onClick={() => setPreviewItem(null)} className="p-2 rounded-lg bg-white/5 border border-white/10"><X size={16}/></button>
                  </div>
                  <div className="mt-2 text-xs text-zinc-300 space-y-1">
                    <div className="flex flex-wrap gap-1">
                      {previewItem.subject?.name && <Badge className="text-purple-300">{previewItem.subject.name}</Badge>}
                      {previewItem.teacher?.full_name && <Badge className="text-amber-300">{previewItem.teacher.full_name}</Badge>}
                      {previewItem.created_at && <Badge className="text-zinc-300"><Calendar size={12}/> {formatDate(previewItem.created_at)}</Badge>}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <div role="button" onClick={()=>toggleFav(previewItem)} className={`cursor-pointer px-3 py-2 rounded-xl text-sm font-semibold border ${fav.has(previewItem.id)?'bg-amber-400/20 border-amber-200/30 text-amber-200':'bg-white/5 border-white/10 text-white'}`}>
                      <span className="inline-flex items-center gap-1"><Star size={14}/> {fav.has(previewItem.id)?'لابردن لە دڵخواز':'زیادکردن بۆ دڵخواز'}</span>
                    </div>
                    <button onClick={()=>openInViewer(previewItem)} className="px-3 py-2 rounded-xl text-sm font-semibold bg-sky-500/20 border border-sky-400/30 text-sky-200 hover:border-sky-400/20 hover:bg-sky-500/25">کردنەوەی پەڕەی گەورە</button>
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
