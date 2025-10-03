// src/pages/StudyDeck.jsx
// 🎴 A TRULY DIFFERENT UI: Swipeable one‑card deck
// - Focused, card-by-card browsing (left/right keys or drag to switch)
// - Works for both Documents (Students) and Exams (ExamsHome)
// - Minimal chrome, large readable cards, progress bar, quick actions
// - Queue rail shows next few cards; mobile-friendly with gestures
// - Tailwind + Framer Motion + Lucide

import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Library, ClipboardList, GraduationCap, Beaker,
  ChevronLeft, ChevronRight, Search as SearchIcon, Star, StarOff,
  ExternalLink, Download, Copy, Check, Calendar, Layers, Image as ImageIcon,
  AlertCircle
} from "lucide-react";

/* --------------------------------- Theme --------------------------------- */
const EASE = [0.22, 1, 0.36, 1];
const SPRING = { type: "spring", stiffness: 260, damping: 30, mass: 0.7 };

/* ------------------------------ API Endpoints ----------------------------- */
const API_DOCUMENTS_URL = "https://api.studentkrd.com/api/v1/documents";
const API_TEACHERS_URL  = "https://api.studentkrd.com/api/v1/teachers";
const API_PAPERS_URL    = "https://api.studentkrd.com/api/v1/papers";

/* -------------------------------- Utilities ------------------------------ */
const lsGet = (k, fb = null) => { try { const v = localStorage.getItem(k); return v ?? fb; } catch { return fb; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)); } catch {} };
const lsDel = (k) => { try { localStorage.removeItem(k); } catch {} };

const getExt = (url = "") => { try { const clean = url.split("?")[0].split("#")[0]; const p = clean.split("."); return p.length > 1 ? p.pop().toLowerCase() : ""; } catch { return ""; } };
const isPDF = (u) => getExt(u) === "pdf";
const isImage = (u) => ["png","jpg","jpeg","webp","gif"].includes(getExt(u));
const isVideoFile = (u) => ["mp4","webm","ogg","mov","m4v"].includes(getExt(u));

const toDl = (raw) => {
  if (!raw) return "";
  try {
    const u = new URL(raw, window.location.origin);
    if (/^\/api\/v1\/dl\//i.test(u.pathname)) { u.search = ""; return u.toString(); }
    if (/\.studentkrd\.com$/i.test(u.hostname)) {
      const m = u.pathname.match(/^\/storage\/(.+)$/i);
      if (m) { u.hostname = "api.studentkrd.com"; u.pathname = `/api/v1/dl/${m[1]}`; u.search = ""; return u.toString(); }
    }
    return u.toString();
  } catch { return raw; }
};

const getGrade = () => { const v = Number(lsGet("grade", "")); return Number.isFinite(v) && v >= 1 ? v : 12; };
const GRADE_NAME = (g) => `پۆل ${g}`;
const formatDate = (d) => { try { return new Date(d).toLocaleDateString("ku-IQ",{year:"numeric",month:"long",day:"numeric"}); } catch { return d||""; } };
const normalizeTrack = (raw) => {
  const s = (raw || "").toString().trim().toLowerCase();
  const sci = ["scientific","science","zansti","زانستی","وێژەیی","wezheyi","wêjeyî"];
  const lit = ["literary","adabi","ئەدەبی","ادبی"];
  const common = ["both","common","general","گشتی","عام","mid"];
  if (sci.some(w=>s.includes(w))) return "scientific";
  if (lit.some(w=>s.includes(w))) return "literary";
  if (common.some(w=>s.includes(w))) return "common";
  return "scientific";
};

/* ------------------------------ Small Primitives -------------------------- */
const KButton = ({children, className="", ...props}) => (
  <button {...props} className={`px-3 py-2 rounded-xl text-sm font-semibold border border-white/10 bg-white/5 hover:bg-white/10 text-white ${className}`}>
    {children}
  </button>
);
const KBadge = ({children, className=""}) => (
  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border border-white/10 bg-white/5 text-zinc-200 ${className}`}>{children}</span>
);

/* --------------------------------- Deck UI -------------------------------- */
function Deck({ items, renderCard, index, setIndex }) {
  const canPrev = index > 0;
  const canNext = index < items.length - 1;

  // keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" && canNext) setIndex((i) => Math.min(i + 1, items.length - 1));
      if (e.key === "ArrowLeft" && canPrev) setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canPrev, canNext, items.length, setIndex]);

  const onDragEnd = (info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const swipe = Math.abs(offset) > 120 || Math.abs(velocity) > 500;
    if (!swipe) return;
    if (offset < 0 && canNext) setIndex((i) => i + 1); // swiped left → next
    if (offset > 0 && canPrev) setIndex((i) => i - 1); // swiped right → prev
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr),280px] gap-4 items-start">
      <div className="relative min-h-[460px]">
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-zinc-50/[0.02] to-transparent pointer-events-none" />
        <AnimatePresence mode="wait">
          <motion.div
            key={items[index]?.id ?? index}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(e, info) => onDragEnd(info)}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={SPRING}
            className="rounded-3xl border border-white/10 bg-zinc-900/60 backdrop-blur p-4 sm:p-6"
          >
            {renderCard(items[index])}
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="mt-3 flex items-center justify-between text-sm text-zinc-300">
          <div className="inline-flex items-center gap-2">
            <KButton onClick={() => setIndex((i) => Math.max(i - 1, 0))} disabled={!canPrev} className={!canPrev?"opacity-50 cursor-not-allowed":""}>
              <ChevronLeft size={16}/> پێشتر
            </KButton>
            <KButton onClick={() => setIndex((i) => Math.min(i + 1, items.length - 1))} disabled={!canNext} className={!canNext?"opacity-50 cursor-not-allowed":""}>
              دواتر <ChevronRight size={16}/>
            </KButton>
          </div>
          <div className="font-semibold">{items.length ? index + 1 : 0} / {items.length}</div>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: items.length? `${((index+1)/items.length)*100}%` : 0 }} />
        </div>
      </div>

      {/* Queue rail */}
      <div className="hidden xl:block rounded-2xl border border-white/10 bg-zinc-900/40 p-3">
        <div className="text-xs text-zinc-400 mb-2">کارتە دواترەکان</div>
        <div className="space-y-2 max-h-[520px] overflow-auto pr-1">
          {items.slice(index+1, index+11).map((it) => (
            <button key={it.id} onClick={()=>setIndex(items.findIndex(x=>x.id===it.id))}
              className="w-full text-right rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 p-2">
              <div className="text-[12px] font-semibold text-white line-clamp-2">{it.title}</div>
              {it.subtitle && <div className="text-[11px] text-zinc-400 line-clamp-1">{it.subtitle}</div>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- Card Renderers --------------------------- */
function DocCard({ item, onOpen, onFav, isFav }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-white/5 ring-1 ring-white/10 grid place-items-center"><Library size={18} className="text-zinc-200"/></div>
          <div>
            <h3 className="text-lg font-extrabold text-white leading-snug line-clamp-2">{item.title}</h3>
            <div className="text-[12px] text-zinc-400 mt-0.5 flex flex-wrap gap-1.5">
              {item.subject && <KBadge><Calendar size={12}/> {item.subject}</KBadge>}
              {item.teacher && <KBadge>{item.teacher}</KBadge>}
              {item.date && <KBadge><Calendar size={12}/> {item.date}</KBadge>}
            </div>
          </div>
        </div>
        <button onClick={onFav} className="px-3 py-2 rounded-xl text-sm font-semibold border border-white/10 bg-white/5 hover:bg-white/10">
          {isFav ? <><Star size={14} className="text-amber-300"/> لابردن</> : <><StarOff size={14}/> دڵخواز</>}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr),360px] gap-4">
        <div>
          {item.thumb ? (
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-black/30">
              <img src={item.thumb} alt="" className="absolute inset-0 w-full h-full object-cover"/>
            </div>
          ) : (
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-black/30 grid place-items-center text-zinc-300">
              <Library size={28}/>
            </div>
          )}
        </div>
        <div className="flex flex-col">
          {item.desc && <p className="text-sm text-zinc-300 leading-7">{item.desc}</p>}
          <div className="mt-auto flex flex-wrap gap-2">
            {item.url && (
              <KButton as="a" onClick={onOpen}>
                <ExternalLink size={14}/> کردنەوە
              </KButton>
            )}
            {item.url && (
              <a href={item.url} download className="px-3 py-2 rounded-xl text-sm font-semibold border border-white/10 bg-white/5 hover:bg-white/10 inline-flex items-center gap-1">
                <Download size={14}/> داگرتن
              </a>
            )}
            {item.url && <CopyBtn text={item.url} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExamCard({ item, onOpen, onFav, isFav }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-white/5 ring-1 ring-white/10 grid place-items-center"><ClipboardList size={18} className="text-zinc-200"/></div>
          <div>
            <h3 className="text-lg font-extrabold text-white leading-snug line-clamp-2">{item.title}</h3>
            <div className="text-[12px] text-zinc-400 mt-0.5 flex flex-wrap gap-1.5">
              {item.year && <KBadge><Calendar size={12}/> {item.year}</KBadge>}
              {item.term && <KBadge><Layers size={12}/> خولی {item.term}</KBadge>}
              {item.subject && <KBadge>{item.subject}</KBadge>}
              {item.teacher && <KBadge>{item.teacher}</KBadge>}
            </div>
          </div>
        </div>
        <button onClick={onFav} className="px-3 py-2 rounded-xl text-sm font-semibold border border-white/10 bg-white/5 hover:bg-white/10">
          {isFav ? <><Star size={14} className="text-amber-300"/> لابردن</> : <><StarOff size={14}/> دڵخواز</>}
        </button>
      </div>

      {item.thumb && (
        <div className="mt-4 relative aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 bg-black/30">
          <img src={item.thumb} alt="" className="absolute inset-0 w-full h-full object-cover"/>
        </div>
      )}

      {!!(item.images?.length) && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-2">
          <div className="flex items-center gap-2 text-[12px] text-zinc-200 font-semibold">
            <div className="h-6 w-6 rounded-lg bg-white/10 ring-1 ring-white/10 grid place-items-center"><ImageIcon size={14} className="text-zinc-200" /></div>
            وێنەکان <span className="ml-1 text-[11px] text-zinc-400">({item.images.length})</span>
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 snap-x">
            {item.images.slice(0,8).map((im, idx) => (
              <a key={im.url+idx} href={im.url} target="_blank" rel="noreferrer" className="relative snap-start shrink-0" title={im.title || ""}>
                <img src={im.thumb || im.url} alt={im.title || "image"} className="h-24 w-36 object-cover rounded-lg ring-1 ring-white/10 bg-black/40" loading="lazy" />
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {item.url && (
          <KButton as="a" onClick={onOpen}>
            <ExternalLink size={14}/> بینین
          </KButton>
        )}
        {item.url && (
          <a href={item.url} download className="px-3 py-2 rounded-xl text-sm font-semibold border border-white/10 bg-white/5 hover:bg-white/10 inline-flex items-center gap-1">
            <Download size={14}/> داگرتن
          </a>
        )}
        {item.url && <CopyBtn text={item.url} />}
      </div>
    </div>
  );
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={async()=>{ try{ await navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false), 1200);}catch{}}}
      className="px-3 py-2 rounded-xl text-sm font-semibold border border-white/10 bg-white/5 hover:bg-white/10 inline-flex items-center gap-1">
      {copied ? (<><Check size={14}/> کۆپی کرا</>) : (<><Copy size={14}/> کۆپی لینک</>)}
    </button>
  );
}

/* --------------------------------- Data glue ------------------------------ */
function useDocuments(stream, grade, filters) {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true); setError("");
        const all = []; let page = 1;
        for (let i = 0; i < 30; i++) {
          const r = await fetch(`${API_DOCUMENTS_URL}?page=${page}`, { signal: ctrl.signal });
          if (!r.ok) throw new Error(`Failed page ${page}`);
          const j = await r.json(); const chunk = Array.isArray(j?.data) ? j.data : [];
          all.push(...chunk);
          const cur = Number(j?.current_page ?? page); const last = Number(j?.last_page ?? cur);
          if (!Number.isFinite(cur) || !Number.isFinite(last) || cur >= last) break; page = cur + 1;
        }
        setDocuments(all);
      } catch (e) { if (e?.name !== "AbortError") { console.error(e); setError("هەڵە لە بارکردن"); } }
      finally { setLoading(false); }
    })();
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    let dead = false;
    (async () => {
      try { const rt = await fetch(API_TEACHERS_URL); const jt = rt.ok ? await rt.json() : { data: [] }; if (!dead) setTeachers(Array.isArray(jt?.data) ? jt.data : []); }
      catch {}
    })();
    return () => { dead = true; };
  }, []);

  const items = useMemo(() => {
    const { q, type, subjectId, teacherId } = filters;
    const dq = (q||"").trim().toLowerCase();
    const BOTH = ["both","common","general","گشتی","عام"];

    const filtered = documents.filter((it) => {
      const byType = type === "all" ? true : it.type === type; if (!byType) return false;
      if (Number(it.grade) !== Number(grade)) return false;
      const s = (it.stream || "").toLowerCase();
      let ok = true; if (stream === "scientific") ok = s === "scientific" || BOTH.includes(s); else if (stream === "literary") ok = s === "literary" || BOTH.includes(s); else ok = BOTH.includes(s);
      if (!ok) return false;
      if (type === "booklet") { if (subjectId && Number(it.subject_id) !== Number(subjectId)) return false; if (teacherId && Number(it.teacher_id) !== Number(teacherId)) return false; }
      const hay = `${it.title} ${it.description ?? ""}`.toLowerCase(); if (dq && !hay.includes(dq)) return false;
      return true;
    });

    return filtered.map((it) => ({
      id: `doc-${it.id}`,
      title: it.title,
      subtitle: it.subject?.name || "",
      desc: it.description || "",
      subject: it.subject?.name || "",
      teacher: it.teacher?.full_name || "",
      date: it.created_at ? formatDate(it.created_at) : "",
      thumb: toDl(it.thumb_url || it.image_url || ""),
      url: toDl(it.pdf_url || it.file_url || it.image_url || it.thumb_url || ""),
      open: () => {
        const raw = it?.pdf_url || it?.file_url || it?.image_url || it?.thumb_url || "";
        const url = toDl(raw); if (!url) return;
        const title = it?.title || "Viewer";
        const type  = isPDF(url) ? "pdf" : isImage(url) ? "image" : isVideoFile(url) ? "video" : "file";
        navigate(`/viewer?u=${encodeURIComponent(url)}&t=${encodeURIComponent(title)}&type=${type}`);
      }
    }));
  }, [documents, grade, stream, filters]);

  return { items, teachers, loading, error };
}

function useExams(stream, grade, filters) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true); setError(""); let page = 1, last = 1, all = [];
        do {
          const res = await fetch(`${API_PAPERS_URL}?page=${page}`, { signal: ctrl.signal });
          if (!res.ok) throw new Error("Failed to load papers");
          const j = await res.json(); all = all.concat(Array.isArray(j?.data) ? j.data : []); last = Number(j?.last_page || 1); page += 1;
        } while (page <= last);

        const items = all.flatMap((p) => {
          const pType = (p?.type || "national_exam").toLowerCase();
          const teacher_id = Number(p?.teacher_id ?? p?.teacher?.id) || null;
          const teacher_name = teacher_id ? (p?.teacher?.full_name || p?.teacher?.name || "") : "";
          const subject_id = Number(p?.subject_id ?? p?.subject?.id) || null;
          const subject_name = p?.subject?.name || p?.subject?.code || p?.title || "";
          const images = Array.isArray(p.images) ? p.images.map((img) => {
            if (!img) return null; if (typeof img === "string") { const u = toDl(img); return u ? { url: u, thumb: u, title: "" } : null; }
            const url = toDl(img.url || img.path || img.image_url || img.file_url || img.src || "");
            const thumb = toDl(img.thumb_url || img.thumbnail_url || img.thumb || url);
            const title = img.title || img.caption || ""; return url ? { url, thumb, title } : null;
          }).filter(Boolean) : [];

          const pack = Array.isArray(p.items) && p.items.length ? p.items : [{ id: `single-${p.id}`, year_start: p.year_start, year_end: p.year_end, term: p.term, url: p.pdf_url || p.file_url, created_at: p.created_at, session_no: p.session_no, date: p.date || p.exam_date }];

          return pack.map(x => ({
            id: `${p.id}-${x.id}`,
            item_type: pType,
            title: subject_name && (x.year_start && x.year_end) ? `${subject_name} — ${x.year_start}-${x.year_end}${x.term?` • خولی ${x.term}`:``}` : (p.title || subject_name || "بەلگە"),
            subject: subject_name,
            teacher: teacher_name,
            grade: Number(p.grade),
            stream: (p.stream || "").toLowerCase() || "both",
            year: (x.year_start && x.year_end) ? `${x.year_start}–${x.year_end}` : "",
            term: x.term,
            date: x.date || x.exam_date || p.date || p.exam_date || null,
            url: toDl(x.url || p.pdf_url || p.file_url || ""),
            thumb: p.thumb_url || null,
            images,
            _score: Number(x.sort_order || 0) || (Number(x.year_end||0)*100 + Number(x.year_start||0)*10 + Number(x.term||0)),
          }));
        });

        setRows(items);
      } catch (e) { if (e?.name !== "AbortError") { console.error(e); setError("نەتوانرا بەلگەکان باردابێت."); } }
      finally { setLoading(false); }
    })();
    return () => ctrl.abort();
  }, []);

  const items = useMemo(() => {
    const { q, type, subject, teacher, year, fav } = filters;
    const dq = (q||"").trim().toLowerCase();

    const pool = rows.filter(r => {
      const st = (r.stream || "both").toLowerCase();
      const okTrack = stream === "common" ? true : (st === stream || st === "both");
      const okGrade = r.grade === Number(grade);
      const okTab = type === "all" ? true : r.item_type === type;
      const okFav = !filters.onlyFav || fav.has(r.id);
      return okTrack && okGrade && okTab && okFav;
    });

    const filtered = pool.filter(r => {
      const sOK = !subject || (r.subject || "").toLowerCase() === subject.toLowerCase();
      const tOK = !teacher || r.teacher_id === teacher; // teacher filter optional
      const yOK = !year || r.year === year;
      const qOK = !dq || `${r.title} ${r.subject || ""} ${r.teacher || ""}`.toLowerCase().includes(dq);
      return sOK && tOK && yOK && qOK;
    });

    return filtered.sort((a,b) => (b._score||0) - (a._score||0));
  }, [rows, grade, stream, filters]);

  return { items, loading, error };
}

/* -------------------------------- Main Page ------------------------------- */
export default function StudyHub() {
  const [mode, setMode] = useState("docs"); // docs | exams
  const [docType, setDocType] = useState(lsGet("docType", "all"));
  const [grade, setGrade] = useState(getGrade());
  const [track] = useState(normalizeTrack(lsGet("track","scientific")));
  const [q, setQ] = useState("");
  const dq = useDeferredValue(q);

  // Docs filters
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");

  // Exams filters
  const [examType, setExamType] = useState("all"); // all | national_exam | important_questions | important_note
  const [onlyFav, setOnlyFav] = useState(false);

  // Favorites (shared ids: prefix with doc-/exam- already)
  const [fav, setFav] = useState(new Set(JSON.parse(lsGet("deckFav","[]")||"[]")));
  const isFav = (id) => fav.has(id);
  const toggleFav = (id) => setFav(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  useEffect(()=>lsSet("deckFav", Array.from(fav)),[fav]);

  // Fetch data
  const docData = useDocuments(track, grade, { q: dq, type: docType, subjectId, teacherId });
  const examData = useExams(track, grade, { q: dq, type: examType, subject: "", teacher: null, year: "", onlyFav, fav });

  // Normalized list for deck by mode
  const cards = mode === "docs" ? docData.items : examData.items;

  // Deck index and bounds
  const [index, setIndex] = useState(0);
  useEffect(() => { setIndex(0); }, [mode, docType, examType, dq]);

  const navigate = useNavigate();
  const openUrl = (url, title="Viewer") => {
    const u = toDl(url); if (!u) return;
    const type = isPDF(u) ? "pdf" : isImage(u) ? "image" : isVideoFile(u) ? "video" : "file";
    navigate(`/viewer?u=${encodeURIComponent(u)}&t=${encodeURIComponent(title)}&type=${type}`);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-50">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-indigo-500/10 grid place-items-center ring-1 ring-cyan-400/30">
            <Sparkles size={18} className="text-cyan-300"/>
          </div>
          <div className="font-extrabold tracking-tight">کارت بە کارت</div>
          <div className="ml-auto inline-flex items-center gap-2">
            <KButton onClick={()=>setMode("docs")} className={mode==="docs"?"bg-cyan-500/15 border-cyan-400/40":""}><Library size={14} className="ml-1"/> فایلەکان</KButton>
            <KButton onClick={()=>setMode("exams")} className={mode==="exams"?"bg-cyan-500/15 border-cyan-400/40":""}><ClipboardList size={14} className="ml-1"/> تاقیکردنەوەکان</KButton>
            <KBadge><Beaker size={12}/> {track==="scientific"?"زانستی":track==="literary"?"ئەدەبی":"گشتی"}</KBadge>
            <KBadge><GraduationCap size={12}/> {GRADE_NAME(grade)}</KBadge>
          </div>
        </div>
      </div>

      {/* Filters row */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 items-end">
          {/* Search */}
          <div className="relative">
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="گەڕان…"
                   className="w-full rounded-xl bg-zinc-900/70 border border-white/10 px-3 py-2 pr-8 text-sm text-zinc-200 outline-none"/>
            <SearchIcon size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500"/>
          </div>

          {/* Mode-specific filters */}
          {mode === "docs" ? (
            <div className="flex flex-wrap gap-2">
              {[
                {k:"all",label:"هەموو"},
                {k:"book",label:"کتێب"},
                {k:"booklet",label:"مەڵزەمە"},
              ].map(d => (
                <KButton key={d.k} onClick={()=>setDocType(d.k)} className={docType===d.k?"bg-cyan-500/15 border-cyan-400/40":""}>{d.label}</KButton>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {[
                {k:"all",label:"هەموو"},
                {k:"national_exam",label:"ئەسیلە"},
                {k:"important_questions",label:"پرسیار"},
                {k:"important_note",label:"تێبینی"},
              ].map(t => (
                <KButton key={t.k} onClick={()=>setExamType(t.k)} className={examType===t.k?"bg-cyan-500/15 border-cyan-400/40":""}>{t.label}</KButton>
              ))}
              <KButton onClick={()=>setOnlyFav(v=>!v)} className={onlyFav?"bg-amber-500/15 border-amber-400/40":""}>{onlyFav?"هەموو":"تەنیا دڵخواز"}</KButton>
            </div>
          )}

          {/* Spacer / Tips */}
          <div className="text-[12px] text-zinc-400">
            <div>➡️/⬅️ یان drag بکە بۆ کارتە داهاتوو.</div>
          </div>
        </div>
      </div>

      {/* Deck */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-8">
        {mode === "docs" ? (
          docData.loading && !docData.items.length ? (
            <div className="py-16 text-center text-zinc-300 inline-flex items-center gap-2"><AlertCircle size={18}/> باردەکەوێت…</div>
          ) : docData.error ? (
            <div className="py-16 text-center text-rose-300 inline-flex items-center gap-2"><AlertCircle size={18}/> {docData.error}</div>
          ) : cards.length === 0 ? (
            <div className="py-16 text-center text-zinc-400">ھیچ کارت نیە بۆ پیشان دان.</div>
          ) : (
            <Deck
              items={cards}
              index={index}
              setIndex={setIndex}
              renderCard={(it) => (
                <DocCard
                  item={it}
                  isFav={isFav(it.id)}
                  onFav={() => toggleFav(it.id)}
                  onOpen={() => it.url && openUrl(it.url, it.title)}
                />
              )}
            />
          )
        ) : (
          examData.loading && !examData.items.length ? (
            <div className="py-16 text-center text-zinc-300 inline-flex items-center gap-2"><AlertCircle size={18}/> لە بارکردندا…</div>
          ) : examData.error ? (
            <div className="py-16 text-center text-rose-300 inline-flex items-center gap-2"><AlertCircle size={18}/> {examData.error}</div>
          ) : cards.length === 0 ? (
            <div className="py-16 text-center text-zinc-400">ھیچ کارت نیە بۆ پیشان دان.</div>
          ) : (
            <Deck
              items={cards}
              index={index}
              setIndex={setIndex}
              renderCard={(it) => (
                <ExamCard
                  item={it}
                  isFav={isFav(it.id)}
                  onFav={() => toggleFav(it.id)}
                  onOpen={() => it.url && openUrl(it.url, it.title)}
                />
              )}
            />
          )
        )}
      </div>
    </div>
  );
}
