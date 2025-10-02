// src/pages/DocsBooks.jsx — All Books (RTL, Dark, Polished Cards, Fixed Skeleton)
// - Uses server filters (grade/stream from localStorage)
// - Only shows type === "book"
// - Pretty, larger cards (still cover-first, object-contain, 2:3 frame)
// - Fixed loading: skeleton shows only when loading
// - Denser, beautiful responsive grid (auto-fill min column width)
// - Recents, favorites, search, subject, sort, pagination

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Download, ExternalLink, ChevronLeft, ChevronRight, Star,
  BookOpen, FileText, Video, Grid, Clock3
} from "lucide-react";

/* ===== API ===== */
const API_DOCS = "https://api.studentkrd.com/api/v1/documents";

/* ===== Utils ===== */
const storage = (() => {
  try { const k="__t"; localStorage.setItem(k,"1"); localStorage.removeItem(k); return localStorage; }
  catch { let mem={}; return { getItem:k=>mem[k]??null, setItem:(k,v)=>{mem[k]=String(v)}, removeItem:k=>{delete mem[k]} }; }
})();
const lsGetRaw = (k, fb=null) => { const v=storage.getItem(k); return v==null?fb:v; };
const lsGet = (k, fb) => { try { const v=storage.getItem(k); return v==null?fb:JSON.parse(v); } catch { return fb; } };
const lsSet = (k, v) => { try { storage.setItem(k, JSON.stringify(v)); } catch {} };

const toCU = (url) => url;
const isPDF = (url) => String(url).toLowerCase().includes(".pdf");
const isImage = (url) => /\.(jpe?g|png|gif|webp)$/i.test(url);
const isVideoFile = (url) => /\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i.test(url);

const EASE = [0.22, 1, 0.36, 1];
const SPRING = { type: "spring", stiffness: 260, damping: 24 };
const cn = (...a) => a.filter(Boolean).join(" ");
const toKurdishStream = s => String(s).toLowerCase()==="scientific" ? "زانستی" :
                          String(s).toLowerCase()==="literary"   ? "ئەدەبی" : "هاوبەش";

/* ================== STORAGE HOOKS ================== */
function useFavorites() {
  const [favorites, setFavorites] = useState(() => lsGet("doc_favorites", []));
  useEffect(() => { lsSet("doc_favorites", favorites); }, [favorites]);
  const toggleFavorite = useCallback((docId) => {
    setFavorites(prev => prev.includes(docId) ? prev.filter(id => id !== docId) : [docId, ...prev].slice(0, 50));
  }, []);
  const isFavorite = useCallback((docId) => favorites.includes(docId), [favorites]);
  return { favorites, isFavorite, toggleFavorite };
}
function useRecents() {
  const [recents, setRecents] = useState(() => lsGet("doc_recents", []));
  useEffect(() => { lsSet("doc_recents", recents); }, [recents]);
  const addRecent = useCallback((doc) => {
    const docId = doc.id;
    const newDoc = {
      id: doc.id,
      title: doc.title,
      thumb_url: doc.thumb_url,
      type: doc.type,
      subject_id: doc.subject_id ?? doc.subject?.id,
      stream: doc.stream
    };
    setRecents(prev => [newDoc, ...prev.filter(r => r.id !== docId)].slice(0, 6));
  }, []);
  return { recents, addRecent };
}

/* ================== UI BITS ================== */
function Badge({ children, className="" }) {
  return <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-slate-300", className)}>{children}</span>;
}

/* Bigger, prettier skeleton with soft shimmer */
function SkeletonCard() {
  const frame = { position: "relative", width: "100%", paddingTop: "150%" }; // 2:3
  const inner = { position: "absolute", inset: 0 };
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
      <div style={frame}>
        <div style={inner} className="relative bg-gradient-to-br from-slate-800/60 to-slate-900/60">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
      </div>
      <div className="p-3 space-y-3">
        <div className="h-3.5 bg-white/10 rounded" />
        <div className="h-3 bg-white/10 rounded w-2/3" />
        <div className="h-8 bg-white/10 rounded" />
      </div>
    </div>
  );
}

/* ================== RECENTS ROW ================== */
function DocRecents({ recents, subjects, onOpen }) {
  if (!recents.length) return null;
  const getSubjectName = (subjectId) => subjects.find(s => String(s.id) === String(subjectId))?.name ?? "—";
  return (
    <div className="col-span-full mb-5">
      <h2 className="text-lg sm:text-xl font-bold mb-3 text-slate-200 flex items-center gap-2">
        <Clock3 size={20} className="text-blue-400"/> سه‌ردانكراوه‌كانی دوایی
      </h2>
      <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
        {recents.map(doc => {
          const TypeIcon = doc.type?.includes("video") ? Video : doc.type?.includes("paper") ? FileText : BookOpen;
          return (
            <motion.button
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              transition={SPRING}
              onClick={() => onOpen(doc)}
              className="group text-left rounded-2xl p-3 border border-white/10 bg-white/5 hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20"><TypeIcon size={18} className="text-blue-300"/></div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold line-clamp-1">{doc.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    {getSubjectName(doc.subject_id)} • کتێب
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}

/* ================== CARD (bigger, prettier, still narrow) ================== */
function PrettyBookCard({ doc, openInViewer, isFavorite, toggleFavorite }) {
  const subjectName = doc.subject?.name ?? "—";
  const created = doc.created_at ? new Date(doc.created_at).toLocaleDateString("ku-IQ") : "";
  const docId = doc.id;

  // 2:3 frame, keep full image
  const frame = { position: "relative", width: "100%", paddingTop: "150%" };
  const inner = { position: "absolute", inset: 0 };

  return (
    <motion.div
      layout
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2, ease: EASE }}
      className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] overflow-hidden backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.45)] transition-shadow"
    >
      {/* Cover */}
      <div style={frame}>
        <div style={inner} className="relative">
          {doc.thumb_url ? (
            // eslint-disable-next-line
            <img
              src={doc.thumb_url}
              alt={doc.title}
              className="w-full h-full object-contain bg-slate-900/70"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full grid place-items-center bg-slate-900/70 text-slate-400">
              <BookOpen className="opacity-70" />
            </div>
          )}

          {/* soft vignettes */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/30 to-transparent" />

          {/* corner badges */}
          <div className="absolute top-2 right-2 flex gap-2">
            <Badge className="border-sky-500/20 bg-sky-500/10 text-sky-200/90">کتێب</Badge>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2 min-w-0">
  <h3 className="text-white text-sm font-semibold leading-tight line-clamp-2 md:line-clamp-3 break-words [overflow-wrap:anywhere] flex-1 min-w-0">
            {doc.title}
          </h3>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => toggleFavorite(docId)}
            title="Favorite"
            className={cn(
              "p-1.5 rounded-md border transition-all shrink-0",
              isFavorite(docId)
                ? "bg-yellow-600/30 border-yellow-500/50 text-yellow-300"
                : "bg-white/5 border-white/10 text-slate-300 hover:text-yellow-300"
            )}
          >
            <Star size={16} fill={isFavorite(docId) ? 'currentColor' : 'none'} />
          </motion.button>
        </div>

        <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-300/90">
          <Badge className="border-sky-500/20 bg-sky-500/10 text-sky-200/90">{subjectName}</Badge>
          <Badge className="border-purple-500/20 bg-purple-500/10 text-purple-200/90">
            {toKurdishStream(doc.stream)}
          </Badge>
          {created && <span className="ml-auto">{created}</span>}
        </div>

        {/* Actions */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => openInViewer(doc)}
            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/25 transition-all text-sm"
          >
            پیشاندان
          </button>
          <a
            href={doc.file_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-500/25 transition-all text-sm"
          >
            <ExternalLink size={15}/> کردنەوە
          </a>
        </div>

        {/* Secondary (download) */}
        <div className="mt-2">
          <a
            href={doc.file_url}
            download
            className="inline-flex w-full items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 border border-white/10 transition-all text-sm"
          >
            <Download size={15}/> دابەزاندن
          </a>
        </div>
      </div>
    </motion.div>
  );
}

/* ================== MAIN PAGE ================== */
export default function DocsBooks() {
  const navigate = useNavigate();

  // Filters (books only)
  const [q, setQ] = useState("");
  const [subjectId, setSubjectId] = useState("all");
  const [sort, setSort] = useState("newest");

  // Data & pagination
  const [docs, setDocs] = useState([]);
  const [subjects, setSubjects] = useState([{ id: "all", name: "هەموو بابەتەکان" }]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const PER_PAGE = 100;

  // Recents & Favorites
  const { recents, addRecent } = useRecents();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  // Viewer
  const openInViewer = useCallback((item) => {
    const raw = item?.pdf_url || item?.file_url || item?.image_url || item?.thumb_url || "";
    const url = toCU(raw);
    if (!url) return;
    const t = item?.title || item?.name || "Viewer";
    const kind = isPDF(url) ? "pdf" : isImage(url) ? "image" : isVideoFile(url) ? "video" : "file";
    addRecent(item);
    navigate(`/viewer?u=${encodeURIComponent(url)}&t=${encodeURIComponent(t)}&type=${kind}`);
  }, [navigate, addRecent]);

  // Fetch books
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const grade = lsGetRaw("grade", "12");
        const stream = lsGetRaw("track", "scientific");

        const url = `${API_DOCS}?grade=${encodeURIComponent(grade)}&stream=${encodeURIComponent(stream)}&per_page=${PER_PAGE}&page=${page}`;
        const res = await fetch(url, { credentials: "omit" });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const json = await res.json();

        // Only books
        const rows = (Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [])
          .filter(d => String(d.type || "").toLowerCase() === "book");

        if (!alive) return;

        setDocs(rows);
        setPage(json?.current_page || 1);
        setLastPage(json?.last_page || 1);

        // Subjects from payload
        const map = new Map();
        rows.forEach(d => {
          const id = d.subject?.id ?? d.subject_id;
          const name = d.subject?.name ?? "—";
          if (id) map.set(id, name);
        });
        setSubjects([{ id: "all", name: "هەموو بابەتەکان" }, ...[...map.entries()].map(([id, name]) => ({ id, name }))]);
      } catch (e) {
        console.error("books fetch:", e);
        if (alive) {
          setDocs([]);
          setSubjects([{ id: "all", name: "هەموو بابەتەکان" }]);
          setPage(1); setLastPage(1);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [page]);

  // Client filters + favorites-first sort
  const filtered = useMemo(() => {
    let r = docs.slice();

    if (subjectId !== "all") {
      const sid = Number(subjectId);
      r = r.filter(d => (d.subject?.id ?? d.subject_id) === sid);
    }
    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      r = r.filter(d =>
        String(d.title || "").toLowerCase().includes(qq) ||
        String(d.description || "").toLowerCase().includes(qq)
      );
    }

    r.sort((a,b) => {
      const aFav = favorites.includes(a.id) ? 1 : 0;
      const bFav = favorites.includes(b.id) ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;

      if (sort === "newest") {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      } else if (sort === "title") {
        return String(a.title).localeCompare(String(b.title), "ar");
      } else if (sort === "subject") {
        return String(a.subject?.name).localeCompare(String(b.subject?.name), "ar");
      }
      return 0;
    });

    return r;
  }, [docs, q, subjectId, sort, favorites]);

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-950 text-white p-3 sm:p-5">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 bg-opacity-20 border border-white/10">
            <Grid size={20} className="text-white"/>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              هەموو کتێبەکان
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              پۆل: {lsGetRaw("grade","12")} • تڕاک: {toKurdishStream(lsGetRaw("track","scientific"))}
            </p>
          </div>
        </div>
        <button onClick={()=>navigate(-1)} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10">
          گەڕانەوە
        </button>
      </div>

      {/* Toolbar */}
      <div className="mb-4 sm:mb-6 grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-5">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Search size={18}/></div>
            <input
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              placeholder="گەڕان بۆ ناونیشانی کتێب یان وەسف..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 placeholder-slate-500 outline-none"
            />
          </div>
        </div>
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <select value={subjectId} onChange={e=>setSubjectId(e.target.value)} className="px-3 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm">
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={sort} onChange={e=>setSort(e.target.value)} className="px-3 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm">
            <option value="newest">نوێترین</option>
            <option value="title">ناونیشان (A→Z)</option>
            <option value="subject">بابەت</option>
          </select>
        </div>
      </div>

      {/* Recents */}
      <DocRecents recents={recents} subjects={subjects} onOpen={openInViewer} />

      {/* Grid — pretty larger cards; shows skeleton only when loading */}
      {loading ? (
        <div
          className={cn(
            "grid gap-3 sm:gap-4",
            "[grid-template-columns:repeat(auto-fill,minmax(180px,1fr))]"
          )}
        >
          {Array.from({length: 12}).map((_,i)=><SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-slate-400 py-16">
          هیچ کتێبێک نەدۆزرایەوە.
        </div>
      ) : (
        <motion.div
          layout
          className={cn(
            "grid gap-3 sm:gap-4",
            "[grid-template-columns:repeat(auto-fill,minmax(180px,1fr))]"
          )}
        >
          {filtered.map(doc => (
            <PrettyBookCard
              key={doc.id}
              doc={doc}
              openInViewer={openInViewer}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
            />
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          onClick={()=>setPage(p=>Math.max(1, p-1))}
          disabled={page<=1}
          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 disabled:opacity-40"
        >
          <ChevronRight className="inline -scale-x-100" /> پێشوو
        </button>
        <span className="text-slate-400 text-sm">لە {page} / {lastPage}</span>
        <button
          onClick={()=>setPage(p=>Math.min(lastPage, p+1))}
          disabled={page>=lastPage}
          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 disabled:opacity-40"
        >
          دواهاتوو <ChevronLeft className="inline" />
        </button>
      </div>
    </div>
  );
}
