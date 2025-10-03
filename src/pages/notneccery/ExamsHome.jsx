// src/pages/ExamsHome.jsx — Dashboard + spring animations + track toggle + data-driven grades + images as separate card
import React, { useEffect, useMemo, useRef, useState, useDeferredValue } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import {
  GraduationCap, Search as SearchIcon, ExternalLink, Download, Copy, Check,
  Calendar, Layers, FlaskConical, Star, StarOff, Filter, Clock, X, ChevronDown,
  Sparkles, FileText, ClipboardList, ShieldAlert, Hourglass, Wrench, User, History,
  FolderOpen, Heart, Images as ImagesIcon
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
/* ----------------- Config ----------------- */
const API_PAPERS_URL = "https://api.studentkrd.com/api/v1/papers";
const EASE = [0.22, 1, 0.36, 1];
const SPRING = { type: "spring", stiffness: 260, damping: 24, mass: 0.6 };

/* ----------------- LocalStorage helpers ----------------- */
const lsGet = (k, fb = null) => { try { const v = localStorage.getItem(k); return v ?? fb; } catch { return fb; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)); } catch {} };
const lsDel = (k) => { try { localStorage.removeItem(k); } catch {} };
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

/* ----------------- URL helper ----------------- */
const toDl = (raw) => {
  if (!raw) return "";
  try {
    const u = new URL(raw, window.location.origin);
    if (/^\/api\/v1\/dl\//i.test(u.pathname)) { u.search = ""; return u.toString(); }
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

/* ----------------- Error Boundary ----------------- */
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
const Pill = ({ children, className = "" }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ring-1 ${className}`}>{children}</span>
);

function YearBadge({ ys, ye }) {
  return (
    <Pill className="bg-sky-900/20 ring-sky-800/40 text-sky-300">
      <Calendar size={12} /> {ys}–{ye}
    </Pill>
  );
}

function TermBadge({ t }) {
  return (
    <Pill className="bg-emerald-900/20 ring-emerald-800/40 text-emerald-300">
      <Layers size={12} /> خولی {t}
    </Pill>
  );
}

function GradeBadge({ g }) {
  return (
    <Pill className="bg-indigo-900/20 ring-indigo-800/40 text-indigo-300">
      <GraduationCap size={12} /> پۆل {g}
    </Pill>
  );
}

function TrackBadge({ tr }) {
  const txt =
    tr === "scientific" ? "زانستی"
    : tr === "literary"   ? "ئەدەبی"
    : tr === "both"       ? "هەردوو"
    : "گشتی";
  return (
    <Pill className="bg-fuchsia-900/20 ring-fuchsia-800/40 text-fuchsia-300">
      <FlaskConical size={12} /> {txt}
    </Pill>
  );
}

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

function TinyBtn({ children, onClick, active=false, className="" }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={`h-9 px-2.5 rounded-lg text-[12px] font-semibold border transition ${
        active ? "bg-sky-500/10 text-sky-300 border-sky-400/30"
               : "bg-white/5 text-zinc-200 border-white/10 hover:bg-white/10"
      } ${className}`}
    >
      {children}
    </motion.button>
  );
}

/* Track segmented (tiny) */
function TrackSegment({ value, onChange }) {
  const opts = [
    { v: "common", label: "گشتی" },
    { v: "scientific", label: "زانستی" },
    { v: "literary", label: "ئەدەبی" },
  ];
  return (
    <div className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5">
      {opts.map(o => (
        <motion.button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          whileTap={{ scale: 0.96 }}
          className={`px-2.5 h-8 text-[12px] rounded-md font-semibold ${
            value === o.v ? "bg-sky-500/15 text-sky-300" : "text-zinc-300 hover:bg-white/10"
          }`}
        >
          {o.label}
        </motion.button>
      ))}
    </div>
  );
}

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

/* ----------------- Dropdown ----------------- */
function Dropdown({
  label, value, onChange, options,
  searchable = false, placeholder = "هەموو",
  className = "", align = "end", clearValue = ""
}) {
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
      <motion.button
        type="button"
        onClick={() => setOpen(v => !v)}
        whileTap={{ scale: 0.97 }}
        className="h-9 inline-flex items-center gap-2 px-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[12px] text-white"
      >
        <Filter size={14} className="text-sky-300" />
        <span className="text-[11.5px]">{label}:</span>
        <span className="font-semibold">{current?.label || placeholder}</span>
        <ChevronDown size={14} className={`transition ${open?"rotate-180":""}`} />
      </motion.button>

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
                {[{ value: clearValue, label: placeholder, count: undefined }, ...filtered].map((o) => (
                  <button key={String(o.value)}
                    onClick={() => { onChange(o.value); setOpen(false); setQ(""); }}
                    className={`w-full text-right px-3 py-2 text-sm hover:bg-white/5 rounded-lg flex items-center justify-between ${
                      o.value === value ? "text-sky-300" : "text-zinc-200"
                    }`}
                  >
                    <span className="truncate">{o.label}</span>
                    {typeof o.count === "number" && (
                      <span className="text-[11px] text-zinc-400">{o.count}</span>
                    )}
                  </button>
                ))}
              </div>
              {value !== clearValue && value != null && (
                <div className="pt-2">
                  <button onClick={() => { onChange(clearValue); setOpen(false); setQ(""); }}
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

/* ----------------- Item / Images Cards ----------------- */
const TYPE_META = {
  national_exam: { title: "ئەسیلە نیشتمانی", icon: ClipboardList },
  important_questions: { title: "پرسیاری گرنگ", icon: ShieldAlert },
  important_note: { title: "تێبینی گرنگ", icon: FileText },
};

function recordLastOpened(item) {
  const payload = {
    id: item.id,
    title: item.title,
    subject_name: item.subject_name,
    teacher_id: item.teacher_id || null,
    teacher_name: item.teacher_name || "",
    pdf_url: item.pdf_url || "",
    thumb_url: item.thumb_url || "",
    created_at: item.created_at || null,
    ts: Date.now(),
  };
  lsSet("examLastOpened", payload);
}

function ItemCard({ item, favored, onToggleFav }) {
  const [copied, setCopied] = useState(false);
  const [hideImg, setHideImg] = useState(false);
  const M = TYPE_META[item.item_type] || TYPE_META.national_exam;
  const TypeIcon = (M && M.icon) || ClipboardList;
  const hasYear = item.year_start && item.year_end;
  const pdfOK = Boolean(item.pdf_url);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={SPRING}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      className="rounded-3xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-900/80 overflow-hidden shadow-sm"
    >
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
              <SessionBadge s={item.session_no} />
              <DateBadge d={item.date || item.created_at} />
              <GradeBadge g={item.grade} />
              {item.stream && <TrackBadge tr={item.stream} />}
              {item.subject_name && (
                <Pill className="bg-purple-900/20 ring-purple-800/40 text-purple-300">{item.subject_name}</Pill>
              )}
              {item.teacher_id && item.teacher_name && (
                <Pill className="bg-rose-900/20 ring-rose-800/40 text-rose-300">{item.teacher_name}</Pill>
              )}
            </div>
          </div>
          <motion.button
            onClick={onToggleFav}
            whileTap={{ scale: 0.96 }}
            className="px-2 py-1 rounded-lg text-[11px] font-semibold border bg-white/10 border-white/20 text-white/90 backdrop-blur hover:bg-white/20"
            title="દڵخواز"
          >
            {favored ? (
              <span className="inline-flex items-center gap-1"><Star size={14} className="text-amber-300" /> لابردن</span>
            ) : (
              <span className="inline-flex items-center gap-1"><StarOff size={14} className="text-zinc-400" /> دڵخواز</span>
            )}
          </motion.button>
        </div>

        {pdfOK && (
          <div className="mt-3 flex items-center gap-2">
            <Link
              to={`/viewer?u=${encodeURIComponent(toDl(item.pdf_url))}&t=${encodeURIComponent(item.title || "PDF")}`}
              onClick={() => recordLastOpened(item)}
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
            <motion.button
              whileTap={{ scale: 0.96 }}
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
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ImagesCard({ images = [] }) {
  if (!images.length) return null;
  const MAX = 8;
  const shown = images.slice(0, MAX);
  const extra = images.length - shown.length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={SPRING}
      className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden"
    >
      <div className="px-3 sm:px-4 pt-3 sm:pt-4">
        <div className="flex items-center gap-2 text-[12px] text-zinc-300 font-semibold">
          <div className="h-6 w-6 rounded-lg bg-zinc-800/60 ring-1 ring-white/10 grid place-items-center">
            <ImagesIcon size={14} className="text-zinc-200" />
          </div>
          وێنەکان
          <span className="ml-1 text-[11px] text-zinc-500">({images.length})</span>
        </div>
      </div>

      <div className="p-3 sm:p-4 pt-2">
        <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory">
          {shown.map((im, idx) => {
            const last = idx === shown.length - 1;
            return (
              <a
                key={im.url + idx}
                href={im.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative snap-start shrink-0"
                title={im.title || ""}
              >
                <img
                  src={im.thumb || im.url}
                  alt={im.title || "image"}
                  className="h-24 w-36 object-cover rounded-xl ring-1 ring-white/10 bg-zinc-900/40"
                  loading="lazy"
                  onError={(e)=>{ e.currentTarget.src = im.url; }}
                />
                {last && extra > 0 && (
                  <div className="absolute inset-0 rounded-xl bg-black/60 grid place-items-center">
                    <span className="text-white text-sm font-bold">+{extra}</span>
                  </div>
                )}
              </a>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ----------------- Spotlight & Last Opened ----------------- */
function LastOpenedCard({ item, onClear }) {
  if (!item) return null;
  return (
    <motion.div layout transition={SPRING} className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="inline-flex items-center gap-2 text-sm text-zinc-300 font-semibold">
          <History size={16} className="text-sky-300" /> دواین كردنه‌وه‌كان
        </div>
        <TinyBtn onClick={onClear}>سڕینەوە</TinyBtn>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-zinc-800/60 ring-1 ring-white/10 grid place-items-center">
          <FolderOpen size={16} className="text-zinc-300" />
        </div>
        <div className="min-w-0">
          <div className="text-white text-sm font-bold truncate">{item.title}</div>
          <div className="text-[12px] text-zinc-400 truncate">{item.subject_name}{item.teacher_name ? ` • ${item.teacher_name}` : ""}</div>
        </div>
        {item.pdf_url && (
          <a
            href={toDl(item.pdf_url)}
            onClick={() => lsSet("examLastOpened", { ...item, ts: Date.now() })}
            className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-800/60 ring-1 ring-zinc-700/70 text-zinc-100 text-[12px] hover:bg-zinc-800"
          >
            <ExternalLink size={14} /> بینین
          </a>
        )}
      </div>
    </motion.div>
  );
}

/* ----------------- Subject Accordion ----------------- */
function SubjectAccordion({ subject, count, children, rightExtra = null }) {
  const [open, setOpen] = useState(true);
  return (
    <motion.div layout transition={SPRING} className="rounded-3xl border border-white/10 bg-white/5 dark:bg-zinc-900/60 overflow-hidden">
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.98 }}
        className="w-full text-right px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between hover:bg-white/5"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-5 w-1.5 rounded-full bg-gradient-to-b from-sky-400 to-fuchsia-400" />
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-extrabold text-white truncate">{subject}</h3>
            <p className="text-[12px] text-zinc-400">{count} فایل</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {rightExtra}
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="p-1 rounded-lg border border-white/10">
            <ChevronDown size={16} className="text-zinc-300" />
          </motion.div>
        </div>
      </motion.button>

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

/* ----------------- WIP / Loading ----------------- */
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
            <Wrench className="w-4 h-4" /> وەشانێکی کارا — فلتەرەکان و فێچرەکان دەکرێ زیاتر بکرێنەوە.
          </div>
        </div>
      </div>
    </div>
  );
}
function LoadingBanner() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-zinc-200"
         aria-live="polite" aria-busy="true">
      <Hourglass className="w-4 h-4 animate-spin text-sky-300" />
      لە بارکردندا...
    </div>
  );
}

/* ----------------- Helpers ----------------- */
const initials = (name = "") => (name.trim().split(/\s+/).slice(0,2).map(w=>w[0]?.toUpperCase()).join("") || "؟");
function TeacherChip({ label, count, active, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={`group px-2.5 py-1.5 rounded-2xl border inline-flex items-center gap-2 text-xs transition ${
        active ? "border-sky-400/40 bg-sky-500/10 text-sky-300"
               : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
      }`}
      title={label}
    >
      <div className={`h-6 w-6 rounded-full grid place-items-center ${active ? "bg-sky-500/20" : "bg-zinc-800/60"}`}>
        <User size={14} className={active ? "text-sky-300" : "text-zinc-400"} />
      </div>
      <span className="truncate max-w-[140px]">{label}</span>
      {typeof count === "number" && (
        <span className="px-1.5 py-0.5 rounded-lg text-[10px] border border-white/10 bg-white/5 text-zinc-400">
          {count}
        </span>
      )}
    </motion.button>
  );
}

/* ----------------- Main Section ----------------- */
function DocumentsCenter() {
  const [grade, setGrade] = useState(getGrade());
  const [track, setTrack] = useState(getTrack());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]); // flattened items

  // Global filters (DOWN filters bar)
  const [q, setQ] = useState("");
  const dq = useDeferredValue(q.trim().toLowerCase());
  const [subject, setSubject] = useState("");
  const [teacher, setTeacher] = useState(null); // numeric id or null
  const [year, setYear] = useState("");
  const [sort, setSort] = useState("new"); // new | old

  // Mode controls
  const [tab, setTab] = useState("national_exam"); // all | national_exam | important_question | important_note
  const [favOnly, setFavOnly] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [showGradePicker, setShowGradePicker] = useState(false);
  const updateGrade = (g) => { setGrade(g); lsSet("grade", g); };

  // Favorites
  const [fav, setFav] = useState(new Set(JSON.parse(lsGet("examFav","[]")||"[]")));
  useEffect(()=>lsSet("examFav", Array.from(fav)),[fav]);
  const isFav = (id) => fav.has(id);
  const toggleFav = (id) => setFav(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const location = useLocation();
  // Last opened
  const [lastOpened, setLastOpened] = useState(null);
  useEffect(() => {
    try {
      const raw = lsGet("examLastOpened", null);
      setLastOpened(raw ? JSON.parse(raw) : null);
    } catch { setLastOpened(null); }
  }, []);
  const clearLastOpened = () => { lsDel("examLastOpened"); setLastOpened(null); };
 // —— URL → state (q, subject, teacher, year, grade)
useEffect(() => {
  const sp = new URLSearchParams(location.search);
  const qParam       = (sp.get("q") || "").trim();
  const subjectParam = (sp.get("subject") || "").trim();
  const teacherParam = sp.get("teacher");
  const yearParam    = (sp.get("year") || "").trim();
  const gradeParam   = Number(sp.get("grade") || "");

  if (qParam) setQ(qParam);
  if (subjectParam) setSubject(subjectParam);
  if (yearParam) setYear(yearParam);

  const teacherNum = Number(teacherParam);
  setTeacher(Number.isFinite(teacherNum) ? teacherNum : null);

  if (Number.isFinite(gradeParam) && gradeParam >= 1) {
    updateGrade(gradeParam);
  }
}, [location.search]);
  // Fetch & flatten — teacher from PAPER ONLY (.full_name if exists) + paper images
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

          // Teacher strictly from paper
          const teacherIdRaw = p?.teacher_id ?? p?.teacher?.id;
          const teacher_id = Number(teacherIdRaw) || null;
          const teacher_name = teacher_id ? (p?.teacher?.full_name || p?.teacher?.name || "") : "";

          // Subject
          const subjectIdRaw = p?.subject_id ?? p?.subject?.id;
          const subject_id = Number(subjectIdRaw) || null;
          const subject_name = p?.subject?.name || p?.subject?.code || p?.title || "";

          // Paper images -> normalized
          const images = Array.isArray(p.images)
            ? p.images.map((img) => {
                if (!img) return null;
                if (typeof img === "string") {
                  const u = toDl(img);
                  return u ? { url: u, thumb: u, title: "" } : null;
                }
                const url = toDl(img.url || img.path || img.image_url || img.file_url || img.src || "");
                const thumb = toDl(img.thumb_url || img.thumbnail_url || img.thumb || url);
                const title = img.title || img.caption || "";
                return url ? { url, thumb, title } : null;
              }).filter(Boolean)
            : [];

          // Items (or pseudo if none)
          const pack = Array.isArray(p.items) && p.items.length ? p.items : [{
            id: `single-${p.id}`,
            year_start: p.year_start || undefined,
            year_end: p.year_end || undefined,
            term: p.term || undefined,
            url: p.pdf_url || p.file_url,
            created_at: p.created_at,
            session_no: p.session_no,
            date: p.date || p.exam_date,
          }];

          return pack.map(x => ({
            id: `${p.id}-${x.id}`,
            paper_id: p.id,
            item_type: pType,
            title: subject_name && (x.year_start && x.year_end)
              ? `${subject_name} — ${x.year_start}-${x.year_end}${x.term?` • خولی ${x.term}`:""}`
              : (p.title || subject_name || "بەلگە"),
            subject_id,
            subject_name,
            teacher_id,
            teacher_name,
            grade: Number(p.grade),
            stream: (p.stream || "").toLowerCase() || "both",
            year_start: x.year_start,
            year_end: x.year_end,
            term: x.term,
            session_no: x.session_no ?? p.session_no ?? null,
            date: x.date || x.exam_date || p.date || p.exam_date || null,
            pdf_url: toDl(x.url || p.pdf_url || p.file_url || ""),
            thumb_url: x.thumb_url || p.thumb_url || null,
            created_at: x.created_at || p.created_at,
            images, // attach paper images to each flattened item
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

  // Track + tab + favorites pool
  const pool = useMemo(() => rows.filter(r => {
    const byGrade = r.grade === Number(grade);
    const st = (r.stream || "both").toLowerCase();
    const byTrack = track === "common" ? true : (st === track || st === "both");
    const byTab = tab === "all" ? true : (r.item_type === tab);
    const byFav = !favOnly || fav.has(r.id);
    return byGrade && byTrack && byTab && byFav;
  }), [rows, grade, track, tab, favOnly, fav]);

  // Counts for quick cards (respect track/grade)
  const typeCounts = useMemo(() => {
    const m = { all: 0, national_exam: 0, important_questions: 0, important_note: 0, fav: 0 };
    for (const r of rows) {
      const st = (r.stream || "both").toLowerCase();
      const okTrack = track === "common" ? true : (st === track || st === "both");
      const okGrade = r.grade === Number(grade);
      if (okTrack && okGrade) {
        m.all++; if (m[r.item_type] != null) m[r.item_type]++;
        if (fav.has(r.id)) m.fav++;
      }
    }
    return m;
  }, [rows, grade, track, fav]);

  // Data-driven grade options (only grades that have data under current track + tab/favorites)
  const gradeOptions = useMemo(() => {
    const set = new Set();
    for (const r of rows) {
      const st = (r.stream || "both").toLowerCase();
      const okTrack = track === "common" ? true : (st === track || st === "both");
      const okTab = tab === "all" ? true : (r.item_type === tab);
      const okFav = !favOnly || fav.has(r.id);
      if (okTrack && okTab && okFav) set.add(r.grade);
    }
    return Array.from(set).sort((a,b)=>a-b);
  }, [rows, track, tab, favOnly, fav]);

  // Ensure selected grade exists; if not, pick the first available
  useEffect(() => {
    if (gradeOptions.length && !gradeOptions.includes(grade)) {
      const g = gradeOptions[0];
      setGrade(g);
      lsSet("grade", g);
    }
  }, [gradeOptions]); // eslint-disable-line react-hooks/exhaustive-deps

  // Global toolbar options (built from current pool)
  const subjectOptions = useMemo(() => {
    const m = new Map();
    for (const r of pool) m.set(r.subject_name || "بی‌ناو", (m.get(r.subject_name || "بی‌ناو")||0)+1);
    return Array.from(m.entries()).sort((a,b)=>a[0].localeCompare(b[0]))
      .map(([label,count]) => ({ value: label, label, count }));
  }, [pool]);

  const teacherOptions = useMemo(() => {
    const m = new Map(); // id -> { label, count }
    for (const r of pool) {
      if (!r.teacher_id) continue;
      const id = r.teacher_id;
      const label = r.teacher_name || `#${id}`;
      const cur = m.get(id) || { label, count: 0 };
      cur.count++;
      m.set(id, cur);
    }
    return Array.from(m.entries())
      .map(([value, {label, count}]) => ({ value, label, count }))
      .sort((a,b)=> b.count - a.count || a.label.localeCompare(b.label));
  }, [pool]);

  const yearOptions = useMemo(() => {
    const m = new Map();
    for (const r of pool) { const k = `${r.year_start || "?"}–${r.year_end || "?"}`; m.set(k, (m.get(k)||0)+1); }
    return Array.from(m.entries()).sort((a,b)=>b[0].localeCompare(a[0]))
      .map(([value,count]) => ({ value, label: value, count }));
  }, [pool]);

  // Filter + sort + search
  const data = useMemo(() => {
    const filtered = pool.filter(r => {
      const sOK = !subject || (r.subject_name || "بی‌ناو").toLowerCase() === subject.toLowerCase();
      const tOK = !teacher || r.teacher_id === teacher;
      const yOK = !year || `${r.year_start || "?"}–${r.year_end || "?"}` === year;
      const qOK = !dq || `${r.title} ${r.subject_name || ""} ${r.teacher_name || ""}`.toLowerCase().includes(dq);
      return sOK && tOK && yOK && qOK;
    });
    const sorted = filtered.slice().sort((a,b) => {
      const A = a._score || 0, B = b._score || 0; return sort === "new" ? (B - A) : (A - B);
    });
    return sorted;
  }, [pool, subject, teacher, year, dq, sort]);

  // Group by subject (then per-subject teacher chips)
  const grouped = useMemo(() => {
    const map = new Map();
    for (const it of data) {
      const key = it.subject_name || "بی‌ناو";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(it);
    }
    for (const [k, arr] of map.entries())
      map.set(k, arr.slice().sort((a,b)=> (sort === "new" ? (b._score||0)-(a._score||0) : (a._score||0)-(b._score||0))));
    return Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0]));
  }, [data, sort]);

  // Per-subject teacher selection (paper-level only, id-based)
  const [sectionTeacher, setSectionTeacher] = useState({}); // { [subjectName]: teacherId|null }
  const [visibleMap, setVisibleMap] = useState({});
  const incVisible = (key) => setVisibleMap((m) => ({ ...m, [key]: (m[key] || 12) + 12 }));
  useEffect(() => { setVisibleMap({}); }, [subject, teacher, year, q, sort, tab, favOnly, grade, track, JSON.stringify(sectionTeacher)]);

  // Helpers
  const resetFilters = () => { setSubject(""); setTeacher(null); setYear(""); setQ(""); setSort("new"); };

  const showWIP = (!!error) || (!loading && !error && rows.length === 0);

  return (
    <MotionConfig transition={SPRING}>
      <section className="space-y-4" dir="rtl">
        {/* Header (tiny controls) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <Sparkles size={20} className="text-sky-300" /> خوێندنگەی پرسیاره‌كان و تێبینییەكان
          </div>
          <div className="flex items-center gap-2">
            <TrackSegment
              value={track}
              onChange={(v) => { setTrack(v); lsSet("track", v); }}
            />
            <TinyBtn onClick={()=>setShowFilters(v=>!v)}><Filter size={12}/> فلتەر</TinyBtn>
            <TinyBtn onClick={()=>setShowGradePicker(v=>!v)}><GraduationCap size={12}/> {GRADE_NAME(grade)} <ChevronDown size={12}/></TinyBtn>
          </div>
        </div>

        {/* Last opened */}
        <LastOpenedCard item={lastOpened && typeof lastOpened === "object" ? lastOpened : null} onClear={clearLastOpened} />

        {/* Quick Cards row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <QuickCard
            active={tab==='national_exam' && !favOnly}
            title="ئەسیلە نیشتمانی"
            count={typeCounts.national_exam}
            icon={ClipboardList}
            onClick={() => { setTab('national_exam'); setFavOnly(false); }}
          />
          <QuickCard
            active={tab==='important_questions' && !favOnly}
            title="پرسیاری گرنگ"
            count={typeCounts.important_questions}
            icon={ShieldAlert}
            onClick={() => { setTab('important_questions'); setFavOnly(false); }}
          />
          <QuickCard
            active={tab==='important_note' && !favOnly}
            title="تێبینی گرنگ"
            count={typeCounts.important_note}
            icon={FileText}
            onClick={() => { setTab('important_note'); setFavOnly(false); }}
          />
          <QuickCard
            active={favOnly}
            title="دڵخوازەکان"
            count={typeCounts.fav}
            icon={Heart}
            onClick={() => { setFavOnly(v=>!v); if (!favOnly) setTab('all'); }}
          />
        </div>

        {/* Grade picker (data-driven) */}
        <AnimatePresence>
          {showGradePicker && (
            <>
              <motion.div className="fixed inset-0 z-40" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setShowGradePicker(false)} />
              <motion.div
                initial={{opacity:0, y:-6}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-6}}
                transition={{duration:0.18}}
                className="absolute z-50 mt-2 right-40 sm:right-48 rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur p-2 shadow-xl"
              >
                {gradeOptions.length === 0 ? (
                  <div className="text-zinc-400 text-sm px-2 py-1">هیچ پۆلەکە نییە بۆ ئەم دیاریکردنە</div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 w-[220px]">
                    {gradeOptions.map(g => (
                      <motion.button key={g}
                        whileTap={{ scale: 0.96 }}
                        onClick={()=>{updateGrade(g); setShowGradePicker(false);}}
                        className={`px-3 py-2 rounded-xl text-sm border ${grade===g?'bg-sky-500/10 text-sky-300 border-sky-400/30':'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}>
                        {GRADE_NAME(g)}
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* DOWN Filters bar (collapsible) */}
        <AnimatePresence initial={false}>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-3 sm:p-4"
            >
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Dropdown label="بابەت" value={subject} onChange={setSubject} options={subjectOptions} searchable placeholder="هەموو بابەتەکان" />
                <Dropdown label="مامۆستا" value={teacher} onChange={setTeacher} options={teacherOptions} searchable placeholder="هەموو مامۆستاکان" clearValue={null} />
                <Dropdown label="ساڵ" value={year} onChange={setYear} options={yearOptions} placeholder="هەموو ساڵەکان" />
                <Dropdown label="ڕیزکردن" value={sort} onChange={setSort} options={[{value:"new",label:"نوێترین"},{value:"old",label:"کۆنترین"}]} placeholder="دیاریكردن" />
                <div className="relative ml-auto min-w-[12rem] flex-1 sm:flex-none">
                  <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="گەڕان بە ناونیشان/بابەت/مامۆستا/ساڵ…"
                    className="w-full h-9 bg-white/5 border border-white/10 rounded-lg pr-3 pl-8 text-[12px] text-zinc-200 outline-none focus:ring-2 focus:ring-sky-500" />
                  <SearchIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                </div>
                <TinyBtn onClick={resetFilters}>ریستکردن</TinyBtn>
                <Pill className="bg-white/10 ring-white/20 text-zinc-300"><Clock size={12}/> {data.length} دۆزراوە</Pill>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        {loading && <LoadingBanner />}
        {showWIP ? (
          <WIPPanel reason={error ? "error" : "loading"} />
        ) : (
          <div className="space-y-3">
            {grouped.length === 0 ? (
              <div className="py-10 text-center text-zinc-400">ھیچ فایلێك نەدۆزرایەوە. فلتەرەکان یان گەڕان گۆڕە.</div>
            ) : (
              grouped.map(([subj, items], idx) => {
                const key = subj || `s-${idx}`;

                // Build teacher options from PAPER LEVEL ONLY (id-based)
                const counts = new Map(); // id -> {label, count}
                for (const it of items) {
                  if (!it.teacher_id) continue;
                  const id = it.teacher_id;
                  const label = it.teacher_name || `#${id}`;
                  const cur = counts.get(id) || { label, count: 0 };
                  cur.count++;
                  counts.set(id, cur);
                }
                let teacherOpts = Array.from(counts.entries())
                  .map(([value, {label, count}]) => ({ value, label, count }))
                  .sort((a,b)=> b.count - a.count || a.label.localeCompare(b.label));

                const selectedTeacher = sectionTeacher[key] ?? null;
                const filteredInSection = selectedTeacher
                  ? items.filter(it => it.teacher_id === selectedTeacher)
                  : items;

                const show = (visibleMap[key] ?? 12);
                const displayCount = filteredInSection.length;

                // Teacher chips + “more” dropdown
                const topChips = teacherOpts.slice(0, 6);
                const moreOpts = teacherOpts.slice(6);

                const rightExtra = teacherOpts.length > 0 ? (
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 max-w-[520px] justify-end">
                      {topChips.map(t => (
                        <TeacherChip
                          key={t.value}
                          label={`${t.label}`}
                          count={t.count}
                          active={selectedTeacher === t.value}
                          onClick={() => setSectionTeacher(prev => ({ ...prev, [key]: prev[key] === t.value ? null : t.value }))}
                        />
                      ))}
                    </div>
                    {moreOpts.length > 0 && (
                      <Dropdown
                        label="زیاتر"
                        value={selectedTeacher}
                        onChange={(val) => setSectionTeacher(prev => ({ ...prev, [key]: val ?? null }))}
                        options={moreOpts}
                        searchable
                        placeholder="زیاتر"
                        clearValue={null}
                      />
                    )}
                  </div>
                ) : null;

                return (
                  <SubjectAccordion key={key} subject={subj} count={displayCount} rightExtra={rightExtra}>
                    {/* Mobile teacher filter */}
                    {teacherOpts.length > 0 && (
                      <div className="sm:hidden mb-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {topChips.map(t => (
                            <TeacherChip
                              key={t.value}
                              label={`${t.label}`}
                              count={t.count}
                              active={selectedTeacher === t.value}
                              onClick={() => setSectionTeacher(prev => ({ ...prev, [key]: prev[key] === t.value ? null : t.value }))}
                            />
                          ))}
                          {moreOpts.length > 0 && (
                            <Dropdown
                              label="زیاتر"
                              value={selectedTeacher}
                              onChange={(val) => setSectionTeacher(prev => ({ ...prev, [key]: val ?? null }))}
                              options={moreOpts}
                              searchable
                              placeholder="زیاتر"
                              clearValue={null}
                            />
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredInSection.slice(0, show).flatMap((it) => {
                        const pair = [
                          <ItemCard
                            key={it.id}
                            item={it}
                            favored={isFav(it.id)}
                            onToggleFav={() => toggleFav(it.id)}
                          />
                        ];
                        if (Array.isArray(it.images) && it.images.length) {
                          pair.push(<ImagesCard key={`${it.id}-images`} images={it.images} />);
                        }
                        return pair;
                      })}
                    </div>

                    {displayCount > show && (
                      <div className="pt-3 flex justify-center">
                        <TinyBtn onClick={() => incVisible(key)}>زیاتر پیشاندان</TinyBtn>
                      </div>
                    )}
                  </SubjectAccordion>
                );
              })
            )}
          </div>
        )}
      </section>
    </MotionConfig>
  );
}

/* ----------------- Quick Cards ----------------- */
function QuickCard({ active, title, count, icon: Icon, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={`rounded-3xl border text-right p-3 sm:p-4 transition ${
        active ? "border-sky-400/30 bg-sky-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className={`h-9 w-9 rounded-xl grid place-items-center ${active ? "bg-sky-500/20" : "bg-zinc-800/60"} ring-1 ring-white/10`}>
          <Icon size={16} className={active ? "text-sky-300" : "text-zinc-300"} />
        </div>
        <div className="min-w-0">
          <div className={`text-sm font-extrabold ${active ? "text-sky-200" : "text-white"} truncate`}>{title}</div>
          <div className="text-[12px] text-zinc-400">{count} فایل</div>
        </div>
      </div>
    </motion.button>
  );
}

/* ----------------- Page shell ----------------- */
export default function ExamsHome() {
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-50 p-3 sm:p-5">
      <ErrorBoundary>
        <div className="max-w-6xl mx-auto space-y-4">
          <DocumentsCenter />
        </div>
      </ErrorBoundary>
    </div>
  );
}
