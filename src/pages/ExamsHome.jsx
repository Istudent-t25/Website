// src/pages/ExamsHome.jsx — render cards immediately (no more touch-to-show)
import React, {
  useEffect, useMemo, useRef, useState, useDeferredValue
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Search as SearchIcon, ExternalLink, Download, Copy, Check,
  Calendar, Layers, FlaskConical, Star, StarOff, Filter, Clock, X, ChevronDown,
  Sparkles, FileText, ClipboardList, ShieldAlert, Hourglass, Wrench
} from "lucide-react";
import { Link } from "react-router-dom";

// mini normalizer: /storage/...  -> https://api.studentkrd.com/api/v1/dl/...
const toDl = (raw) => {
  if (!raw) return "";
  try {
    const u = new URL(raw, window.location.origin);

    // already correct
    if (/^\/api\/v1\/dl\//i.test(u.pathname)) { u.search = ""; return u.toString(); }

    // *.studentkrd.com + /storage/...
    if (/\.studentkrd\.com$/i.test(u.hostname)) {
      const m = u.pathname.match(/^\/storage\/(.+)$/i);
      if (m) {
        u.hostname = "api.studentkrd.com";
        u.pathname = `/api/v1/dl/${m[1]}`;
        u.search = "";
        return u.toString();
      }
    }
    return u.toString();
  } catch { return raw; }
};

/* ----------------- Config ----------------- */
const API_PAPERS_URL = "https://api.studentkrd.com/api/v1/papers";
const EASE = [0.22, 1, 0.36, 1];

/* ----------------- LocalStorage helpers ----------------- */
const lsGet = (k, fb = null) => { try { const v = localStorage.getItem(k); return v ?? fb; } catch { return fb; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)); } catch {} };
const getGrade = () => { const v = Number(lsGet("grade", "")); return Number.isFinite(v) && v >= 1 ? v : 12; };
const GRADE_NAME = (g) => `پۆل ${g}`;
const normalizeTrack = (raw) => {
  const s = (raw || "").toString().trim().toLowerCase();
  const sci = ["scientific","science","zansti","زانستی","وێژەیی","wezheyi","wêjeyî"];
  const lit = ["literary","adabi","ئەدەبی","ادبی"];
  if (sci.some(w=>s.includes(w))) return "scientific";
  if (lit.some(w=>s.includes(w))) return "literary";
  return "common";
};
const getTrack = () => normalizeTrack(lsGet("track", "common"));

/* ----------------- URL helpers (for /storage → /dl) ----------------- */
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

/* ----------------- Utility: Error Boundary ----------------- */
class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(){ return { hasError: true }; }
  componentDidCatch(err, info){ console.error("ExamsHome crashed:", err, info); }
  render(){
    if (this.state.hasError) return <WIPPanel reason="error" />;
    return this.props.children;
  }
}

/* ----------------- UI atoms ----------------- */
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
const Pill = ({ children, className = "" }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ring-1 ${className}`}>{children}</span>
);
const YearBadge  = ({ ys, ye }) => <Pill className="bg-sky-900/20 ring-sky-800/40 text-sky-300"><Calendar size={12}/> {ys}–{ye}</Pill>;
const TermBadge  = ({ t }) => <Pill className="bg-emerald-900/20 ring-emerald-800/40 text-emerald-300"><Layers size={12}/> خولی {t}</Pill>;
const GradeBadge = ({ g }) => <Pill className="bg-indigo-900/20 ring-indigo-800/40 text-indigo-300"><GraduationCap size={12}/> پۆل {g}</Pill>;
const TrackBadge = ({ tr }) => {
  const txt = tr === "scientific" ? "زانستی" : tr === "literary" ? "ئەدەبی" : tr === "both" ? "هەردوو" : "گشتی";
  return <Pill className="bg-fuchsia-900/20 ring-fuchsia-800/40 text-fuchsia-300"><FlaskConical size={12}/> {txt}</Pill>;
};
/* NEW: badges for session + date */
const SessionBadge = ({ s }) => s ? (
  <Pill className="bg-amber-900/20 ring-amber-800/40 text-amber-300"><Layers size={12}/> بەشی {s}</Pill>
) : null;

const DateBadge = ({ d }) => {
  if (!d) return null;
  let out = "";
  try {
    const dt = new Date(d);
    if (!isNaN(dt.getTime())) {
      const y = dt.getFullYear();
      const m = String(dt.getMonth()+1).padStart(2,"0");
      const day = String(dt.getDate()).padStart(2,"0");
      out = `${y}-${m}-${day}`;
    }
  } catch {}
  if (!out) return null;
  return <Pill className="bg-teal-900/20 ring-teal-800/40 text-teal-300"><Clock size={12}/> {out}</Pill>;
};

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

/* ----------------- Hooks ----------------- */
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => { if (!ref.current || ref.current.contains(e.target)) return; handler(e); };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

/* ----------------- Cool Dropdown (custom select) ----------------- */
function Dropdown({ label, value, onChange, options, searchable = false, placeholder = "هەموو", className = "", align = "end" }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);
  useOnClickOutside(ref, () => setOpen(false));

  const filtered = useMemo(() => {
    const txt = q.trim().toLowerCase();
    let base = options || [];
    if (txt) base = base.filter(o => (o.label || "").toLowerCase().includes(txt));
    return base.slice(0, 300);
  }, [options, q]);

  const current = options?.find(o => o.value === value);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="h-10 inline-flex items-center gap-2 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-white">
        <Filter size={16} className="text-sky-300" />
        <span className="text-[12.5px]">{label}:</span>
        <span className="font-semibold">{current?.label || placeholder}</span>
        <ChevronDown size={16} className={`transition ${open?"rotate-180":""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15, ease: EASE }}
            className={`absolute z-50 min-w-[220px] mt-2 ${align === "end" ? "right-0" : "left-0"}`}
          >
            <div className="rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur p-2 shadow-2xl">
              {searchable && (
                <div className="relative">
                  <input
                    autoFocus
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="گەڕان لە هەڵبژاردەکان…"
                    className="w-full bg-zinc-900/70 border border-white/10 rounded-xl pr-3 pl-8 py-2 text-sm text-zinc-200 outline-none"
                  />
                  <SearchIcon size={16} className="absolute left-2.5 top-2.5 text-zinc-500" />
                </div>
              )}
              <div className="max-h-[320px] overflow-auto mt-2 divide-y divide-white/5">
                {[{ value: "", label: placeholder, count: undefined }, ...filtered].map((o) => (
                  <button key={o.value || "__all"}
                    onClick={() => { onChange(o.value); setOpen(false); setQ(""); }}
                    className={`w-full text-right px-3 py-2 text-sm hover:bg-white/5 rounded-lg flex items-center justify-between ${
                      (o.value || "") === (value || "") ? "text-sky-300" : "text-zinc-200"
                    }`}
                  >
                    <span className="truncate">{o.label}</span>
                    {typeof o.count === "number" && (
                      <span className="text-[11px] text-zinc-400">{o.count}</span>
                    )}
                  </button>
                ))}
              </div>
              {value && (
                <div className="pt-2">
                  <button onClick={() => { onChange(""); setOpen(false); setQ(""); }}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300">
                    <X size={14}/> سڕینەوەی فلتەر
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ----------------- Item Card ----------------- */
const TYPE_META = {
  national_exam: { title: "ئەسیلە نیشتمانی", icon: ClipboardList },
  important_exam: { title: "ئەسیلە گرنگ", icon: ShieldAlert },
  important_note: { title: "تێبینی گرنگ", icon: FileText },
};

function ItemCard({ item, favored, onToggleFav }) {
  const [copied, setCopied] = useState(false);
  const [hideImg, setHideImg] = useState(false);
  const M = TYPE_META[item.item_type] || TYPE_META.national_exam;
  const TypeIcon = (M && M.icon) || ClipboardList;
  const hasYear = item.year_start && item.year_end;
  const pdfOK = Boolean(item.pdf_url);

  return (
    <motion.div
      /* CHANGE: render immediately; no IntersectionObserver dependency */
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: EASE }}
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-900/80 overflow-hidden shadow-sm"
    >
      {/* Thumbnail (safe) */}
      {!hideImg && item.thumb_url ? (
        <div className="relative w-full aspect-video overflow-hidden">
          <img
            src={item.thumb_url}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={() => setHideImg(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
          <div className="absolute top-2 left-2">
            <Pill className="bg-white/10 ring-white/20 text-zinc-100">{TYPE_META[item.item_type]?.title || ""}</Pill>
          </div>
        </div>
      ) : (
        <div className="p-3 sm:p-4 pt-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg ring-1 ring-white/10 bg-white/5 flex items-center justify-center">
              <TypeIcon size={16} className="text-zinc-200" />
            </div>
            <Pill className="bg-white/10 ring-white/20 text-zinc-200">{TYPE_META[item.item_type]?.title || ""}</Pill>
          </div>
        </div>
      )}
      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          {!item.thumb_url && !hideImg && (
            <div className="w-0.5 self-stretch bg-gradient-to-b from-white/10 via-white/5 to-transparent rounded-full" />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white line-clamp-2">{item.title}</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {hasYear && <YearBadge ys={item.year_start} ye={item.year_end} />}
              {item.term && <TermBadge t={item.term} />}
              {/* session + date badges */}
              <SessionBadge s={item.session_no} />
              <DateBadge d={item.date || item.created_at} />
              <GradeBadge g={item.grade} />
              {item.stream && <TrackBadge tr={item.stream} />}
              {item.subject?.name && (
                <Pill className="bg-purple-900/20 ring-purple-800/40 text-purple-300">{item.subject.name}</Pill>
              )}
            </div>
          </div>
          <button
            onClick={onToggleFav}
            className="px-2 py-1 rounded-lg text-xs font-semibold border bg-white/10 border-white/20 text-white/90 backdrop-blur hover:bg-white/20"
            title="دڵخواز"
          >
            {favored ? (
              <span className="inline-flex items-center gap-1"><Star size={14} className="text-amber-300" /> لابردن</span>
            ) : (
              <span className="inline-flex items-center gap-1"><StarOff size={14} className="text-zinc-400" /> دڵخواز</span>
            )}
          </button>
        </div>

        {pdfOK && (
          <div className="mt-3 flex items-center gap-2">
            <Link
  to={`/viewer?u=${encodeURIComponent(toDl(item.pdf_url))}&t=${encodeURIComponent(item.title || "PDF")}`}
  className="px-3 py-1.5 rounded-xl bg-zinc-800/60 ring-1 ring-zinc-700/70 text-zinc-100 inline-flex items-center gap-1 text-[12px] hover:bg-zinc-800"
>
  <ExternalLink size={14} /> بینین
</Link>

            <a
              href={item.pdf_url}
              download
              className="px-3 py-1.5 rounded-xl bg-zinc-900/60 ring-1 ring-zinc-700/70 text-zinc-100 inline-flex items-center gap-1 text-[12px] hover:bg-zinc-900"
            >
              <Download size={14} /> داگرتن
            </a>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(item.pdf_url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1200);
                } catch {}
              }}
              className="px-3 py-1.5 rounded-xl bg-zinc-900/60 ring-1 ring-zinc-700/70 text-zinc-100 inline-flex items-center gap-1 text-[12px] hover:bg-zinc-900"
            >
              {copied ? (<><Check size={14} /> کۆپی کرا</>) : (<><Copy size={14} /> کۆپی لینک</>)}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* Small section title */
function SectionTitle({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 text-zinc-300 text-sm font-semibold px-1">
      {Icon ? <Icon size={14} className="text-sky-300" /> : null}
      {children}
    </div>
  );
}

/* Spotlight (single "Newest" block) */
function Spotlight({ items }) {
  if (!items?.length) return null;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <SectionTitle icon={Sparkles}>نوێترین</SectionTitle>
      <div className="mt-2 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1">
        {items.map((it, idx) => (
          <motion.a
            key={it.id}
            href={it.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="snap-start min-w-[260px] max-w-[260px] rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-3"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.03 }}
          >
            <div className="text-[11px] text-zinc-400">{TYPE_META[it.item_type]?.title}</div>
            <div className="font-bold text-white text-sm line-clamp-2 mt-1">{it.title}</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {it.year_start && it.year_end && <YearBadge ys={it.year_start} ye={it.year_end} />}
              {it.term && <TermBadge t={it.term} />}
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}

/* ----------------- Subject Accordion (parent card) ----------------- */
function SubjectAccordion({ subject, count, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.div layout transition={{ duration: 0.25, ease: EASE }} className="rounded-2xl border border-white/10 bg-white/5 dark:bg-zinc-900/60 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-right px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between hover:bg-white/5"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2 h-2 rounded-full bg-sky-400" />
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-extrabold text-white truncate">{subject}</h3>
            <p className="text-[12px] text-zinc-400">{count} فایل</p>
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="p-1 rounded-lg bg-white/5 border border-white/10">
          <ChevronDown size={16} className="text-zinc-300" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            <div className="p-3 sm:p-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ----------------- WIP / Fallback Panel ----------------- */
function WIPPanel({ reason = "loading" }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur p-6 sm:p-8 text-right">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-2xl bg-sky-500/20 ring-1 ring-sky-400/40 grid place-items-center">
          <Hourglass className="w-6 h-6 text-cyan-300" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold">ئەم پەڕەکە لەسەر کاردایە</h2>
          <p className="text-sm text-zinc-400 mt-1">
            {reason === "error" ? "هەڵە ڕویدا — کاتێک ئەم پەڕەیە چاک دەکەین." : "تکایە چاوەڕوان بە. زوو دایەخەینەوە."}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 text-[12px] text-zinc-400">
            <Wrench className="w-4 h-4" /> وەشانێکی کارا — فێتچەکان و فلتەرەکان دەکرێ زیاتر بکرێنەوە.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------- Loading banner ----------------- */
function LoadingBanner() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-zinc-200"
         aria-live="polite" aria-busy="true">
      <Hourglass className="w-4 h-4 animate-spin text-sky-300" />
      لە بارکردندا...
    </div>
  );
}

/* ----------------- Main Section ----------------- */
function DocumentsCenter() {
  const [grade, setGrade] = useState(getGrade());
  const track = getTrack();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]); // flattened items with type

  // Filters
  const [q, setQ] = useState("");
  const dq = useDeferredValue(q.trim().toLowerCase());
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [sort, setSort] = useState("new"); // new | old
  const [tab, setTab] = useState("all"); // all | national_exam | important_exam | important_note

  // Header grade picker
  const [showGradePicker, setShowGradePicker] = useState(false);
  const updateGrade = (g) => { setGrade(g); lsSet("grade", g); };

  // Favorites
  const [fav, setFav] = useState(new Set(JSON.parse(lsGet("examFav","[]")||"[]")));
  useEffect(()=>lsSet("examFav", Array.from(fav)),[fav]);
  const isFav = (id) => fav.has(id);
  const toggleFav = (id) => setFav(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  // Fetch & flatten all paper types
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true); setError("");
        let page = 1, last = 1, all = [];
        do {
          const res = await fetch(`${API_PAPERS_URL}?page=${page}`, { signal: ctrl.signal });
          if (!res.ok) throw new Error("Failed to load papers");
          const j = await res.json();
          all = all.concat(Array.isArray(j?.data) ? j.data : []);
          last = Number(j?.last_page || 1);
          page += 1;
        } while (page <= last);

        const items = all.flatMap((p) => {
          const pType = (p?.type || "national_exam").toLowerCase();
          const subjectName = p?.subject?.name || p?.subject?.code || p?.title || "";
          const it = Array.isArray(p.items) && p.items.length ? p.items : [{
            id: `single-${p.id}`,
            year_start: p.year_start || undefined,
            year_end: p.year_end || undefined,
            term: p.term || undefined,
            url: p.pdf_url || p.file_url,
            created_at: p.created_at,
            session_no: p.session_no,
            date: p.date || p.exam_date,
          }];
          return it.map(x => ({
            id: `${p.id}-${x.id}`,
            item_type: pType,
            title: subjectName && (x.year_start && x.year_end)
              ? `${subjectName} — ${x.year_start}-${x.year_end}${x.term?` • خولی ${x.term}`:""}`
              : (p.title || subjectName || "بەلگە"),
            subject: p.subject,
            grade: Number(p.grade),
            stream: (p.stream || "").toLowerCase() || "both",
            year_start: x.year_start,
            year_end: x.year_end,
            term: x.term,
            session_no: x.session_no ?? p.session_no ?? null,
            date: x.date || x.exam_date || p.date || p.exam_date || null,
            pdf_url: toCU(x.url || p.pdf_url || p.file_url || ""),
            thumb_url: x.thumb_url || p.thumb_url || null,
            created_at: x.created_at || p.created_at,
            _score: Number(x.sort_order || 0)
              || (Number(x.year_end||0)*100 + Number(x.year_start||0)*10 + Number(x.term||0)),
          }));
        });
        setRows(items);
      } catch (e) {
        if (e?.name !== "AbortError") {
          console.error(e);
          setError("نەتوانرا بەلگەکان باردابێت.");
        }
      } finally { setLoading(false); }
    })();
    return () => ctrl.abort();
  }, []);

  // Track-aware pool (include BOTH with sci/lit) + tab type
  const pool = useMemo(() => rows.filter(r => {
    const byGrade = r.grade === Number(grade);
    const st = (r.stream || "both").toLowerCase();
    const byTrack = track === "common" ? true : (st === track || st === "both");
    const byTab = tab === "all" ? true : (r.item_type === tab);
    return byGrade && byTrack && byTab;
  }), [rows, grade, track, tab]);

  // Counts by type for tabs
  const typeCounts = useMemo(() => {
    const m = { all: 0, national_exam: 0, important_exam: 0, important_note: 0 };
    for (const r of rows) {
      const st = (r.stream || "both").toLowerCase();
      const okTrack = track === "common" ? true : (st === track || st === "both");
      const okGrade = r.grade === Number(grade);
      if (okTrack && okGrade) {
        m.all++; if (m[r.item_type] != null) m[r.item_type]++;
      }
    }
    return m;
  }, [rows, grade, track]);

  // Subject/Year options
  const subjectCounts = useMemo(() => {
    const m = new Map();
    for (const r of pool) { const k = r.subject?.name || "بی‌ناو"; m.set(k, (m.get(k)||0)+1); }
    return Array.from(m.entries()).sort((a,b)=>a[0].localeCompare(b[0]));
  }, [pool]);
  const yearCounts = useMemo(() => {
    const m = new Map();
    for (const r of pool) { const k = `${r.year_start || "?"}–${r.year_end || "?"}`; m.set(k, (m.get(k)||0)+1); }
    return Array.from(m.entries()).sort((a,b)=>b[0].localeCompare(a[0]));
  }, [pool]);
  const subjectOptions = useMemo(() => subjectCounts.map(([label,count]) => ({ value: label, label, count })), [subjectCounts]);
  const yearOptions = useMemo(() => yearCounts.map(([label,count]) => ({ value: label, label, count })), [yearCounts]);

  // Filter + sort + search
  const data = useMemo(() => {
    const filtered = pool.filter(r => {
      const sOK = !subject || (r.subject?.name || "بی‌ناو").toLowerCase() === subject.toLowerCase();
      const yOK = !year || `${r.year_start || "?"}–${r.year_end || "?"}` === year;
      const qOK = !dq || `${r.title} ${r.subject?.name || ""}`.toLowerCase().includes(dq);
      return sOK && yOK && qOK;
    });
    const sorted = filtered.slice().sort((a,b) => {
      const A = a._score || 0, B = b._score || 0; return sort === "new" ? (B - A) : (A - B);
    });
    return sorted;
  }, [pool, subject, year, dq, sort]);

  // Group by subject (for accordions)
  const grouped = useMemo(() => {
    const map = new Map();
    for (const it of data) {
      const key = it.subject?.name || "بی‌ناو"; if (!map.has(key)) map.set(key, []);
      map.get(key).push(it);
    }
    for (const [k, arr] of map.entries())
      map.set(k, arr.slice().sort((a,b)=> (sort === "new" ? (b._score||0)-(a._score||0) : (a._score||0)-(b._score||0))));
    return Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0]));
  }, [data, sort]);

  // Per-accordion visible counts (simple paging)
  const [visibleMap, setVisibleMap] = useState({});
  const incVisible = (key) => setVisibleMap((m) => ({ ...m, [key]: (m[key] || 12) + 12 }));
  useEffect(() => { setVisibleMap({}); }, [subject, year, dq, sort, tab, grade]);

  // UI
  const searchRef = useRef(null);

  // SHOW WIP ONLY for error or truly empty after load
  const showWIP =
    (!!error) || (!loading && !error && rows.length === 0);

  return (
    <section className="space-y-4" dir="rtl">
      {/* Header + controls */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <Sparkles size={20} className="text-sky-300" /> خوێندنگەی پرسیاره‌كان و تێبینیەكان
          </div>
          <div className="flex items-center gap-2">
            <Badge asButton onClick={()=>setShowGradePicker(v=>!v)} className="text-indigo-300">
              <GraduationCap size={14}/> {GRADE_NAME(grade)} <ChevronDown size={12}/>
            </Badge>
            <Badge className="text-fuchsia-300">
              <FlaskConical size={14}/> {track === "scientific" ? "زانستی" : track === "literary" ? "ئەدەبی" : "گشتی"}
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
                    <button key={g} onClick={()=>{updateGrade(g); setShowGradePicker(false);}}
                      className={`px-3 py-2 rounded-xl text-sm border ${grade===g?'bg-sky-500/10 text-sky-300 border-sky-400/30':'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}>
                      {GRADE_NAME(g)}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <PillButton active={tab==='all'} onClick={()=>setTab('all')}>هەموو <span className="text-zinc-400">({typeCounts.all})</span></PillButton>
          <PillButton active={tab==='national_exam'} onClick={()=>setTab('national_exam')}>ئەسیلە نیشتمانی <span className="text-zinc-400">({typeCounts.national_exam})</span></PillButton>
          <PillButton active={tab==='important_exam'} onClick={()=>setTab('important_exam')}>ئەسیلەی گرنگ <span className="text-zinc-400">({typeCounts.important_exam})</span></PillButton>
          <PillButton active={tab==='important_note'} onClick={()=>setTab('important_note')}>تێبینیە گرنگەکان <span className="text-zinc-400">({typeCounts.important_note})</span></PillButton>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Dropdown label="بابەت" value={subject} onChange={setSubject} options={subjectOptions} searchable placeholder="هەموو بابەتەکان" />
          <Dropdown label="ساڵ" value={year} onChange={setYear} options={yearOptions} placeholder="هەموو ساڵەکان" />
          <Dropdown label="ڕیزکردن" value={sort} onChange={setSort} options={[{value:"new",label:"نوێترین"},{value:"old",label:"کۆنترین"}]} placeholder="دیاریكردن" />
          <div className="relative ml-auto min-w=[12rem] flex-1 sm:flex-none">
            <input ref={searchRef} value={q} onChange={(e)=>setQ(e.target.value)} placeholder="گەڕان بە ناونیشان/بابەت/ساڵ…"
              className="w-full h-10 bg-white/5 border border-white/10 rounded-xl pr-3 pl-8 text-sm text-zinc-200 outline-none focus:ring-2 focus:ring-sky-500" />
            <SearchIcon size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          </div>
          <Badge className="text-zinc-300"><Clock size={14}/> {data.length} دۆزراوە</Badge>
        </div>

        {/* Loading banner */}
        {loading && <LoadingBanner />}
      </div>

      {/* Content */}
      {showWIP ? (
        <WIPPanel reason={error ? "error" : "loading"} />
      ) : (
        <div className="space-y-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 animate-pulse h-48" />
              <div className="rounded-2xl border border-white/10 bg-white/5 animate-pulse h-48" />
              <div className="rounded-2xl border border-white/10 bg-white/5 animate-pulse h-48" />
            </div>
          ) : grouped.length === 0 ? (
            <div className="py-10 text-center text-zinc-400">ھیچ فایلێك نەدۆزرایەوە. فلتەرەکان یان گەڕان گۆڕە.</div>
          ) : (
            grouped.map(([subj, items], idx) => {
              const key = subj || `s-${idx}`;
              const show = (visibleMap[key] ?? 12);
              return (
                <SubjectAccordion key={key} subject={subj} count={items.length}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.slice(0, show).map(it => (
                      <ItemCard key={it.id} item={it} favored={isFav(it.id)} onToggleFav={() => toggleFav(it.id)} />
                    ))}
                  </div>
                  {items.length > show && (
                    <div className="pt-3 flex justify-center">
                      <button onClick={() => incVisible(key)} className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-200">زیاتر پیشاندان</button>
                    </div>
                  )}
                </SubjectAccordion>
              );
            })
          )}
        </div>
      )}
    </section>
  );
}

/* ----------------- Page shell ----------------- */
export default function ExamsHome() {
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-50 p-3 sm:p-5">
      <ErrorBoundary>
        <div className="max-w-6xl mx-auto">
          <DocumentsCenter />
        </div>
      </ErrorBoundary>
    </div>
  );
}
