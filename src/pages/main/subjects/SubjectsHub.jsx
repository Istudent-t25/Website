// src/pages/SubjectsHub.jsx — “Dashboard-style” Subjects Hub (RTL, Dark, Motion)
import React, { useEffect, useMemo, useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  LibraryBig,
  BookMarked,
  Calculator, Atom, Microscope, Languages, Pen, BookOpen,
  Star, CheckCircle2, CircleDashed, Info, ChevronDown, AlertTriangle, TrendingUp, Search
} from "lucide-react";

/* ============================== Config / APIs ============================== */
const API_SUBJECTS = "https://api.studentkrd.com/api/v1/subjects";
const API_DOCS = "https://api.studentkrd.com/api/v1/documents";
const API_PAPERS = "https://api.studentkrd.com/api/v1/papers";

/* ============================== Utils ============================== */
const EASE = [0.22, 1, 0.36, 1];
const SPRING = { type: "spring", stiffness: 260, damping: 24 };

async function fetchJSON(url, signal) {
  const r = await fetch(url, { signal, credentials: "omit" });
  if (!r.ok) throw new Error(`Network error: ${r.status} ${r.statusText}`);
  return r.json();
}
async function fetchAllPages(baseUrl, initialParams = "", signal) {
  const out = [];
  let url = `${baseUrl}${initialParams ? `?${initialParams}` : ""}`;
  let guard = 0;
  while (url && guard < 20) {
    const j = await fetchJSON(url, signal);
    if (Array.isArray(j?.data)) out.push(...j.data);
    url = j?.next_page_url || null;
    guard += 1;
  }
  return out;
}
function buildParams(obj) {
  const sp = new URLSearchParams();
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== "null" && v !== "") sp.set(k, String(v));
  });
  return sp.toString();
}
const lsGetRaw = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch { return d; } };
function normalizeTrack(v) {
  const t = (v || "").toLowerCase();
  if (t.includes("scientific") || t.includes("sci") || t === "زانستی") return "scientific";
  if (t.includes("literary") || t.includes("lit") || t === "ئەدەبی") return "literary";
  if (t.includes("both") || t === "هاوبەش") return "both";
  return null;
}
function streamKurdish(s) {
  if (s === "scientific") return "زانستی";
  if (s === "literary") return "ئەدەبی";
  if (s === "both") return "هاوبەش";
  return "—";
}
function iconForSubject(name = "") {
  const n = String(name).toLowerCase();
  if (/(math|بیر|بیەر|بیرکاری)/.test(n)) return Calculator;
  if (/(phys|فیز|فیزی)/.test(n)) return Atom;
  if (/(chem|کیمیا|كیمیا)/.test(n)) return BookOpen; // swapped to match Dashboard vibe
  if (/(bio|زیند|جین)/.test(n)) return Microscope;
  if (/(engl|ئینگ|انگلی)/.test(n)) return Languages;
  if (/(kurd|کورد|كورد)/.test(n)) return Pen;
  if (/(arab|عرب|عەرە)/.test(n)) return BookOpen;
  return BookMarked;
}

/* ============================== Reusable UI ============================== */
const Panel = memo(function Panel({ className = "", children }) {
  return (
    <div className={"rounded-3xl bg-zinc-900/70 backdrop-blur-2xl ring-1 ring-zinc-800/70 shadow-[0_10px_24px_rgba(0,0,0,0.35)] relative overflow-hidden " + className}>
      <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(120%_60%_at_100%_0%,black,transparent)]" />
      {children}
    </div>
  );
});

const StatTile = memo(function StatTile({ label, value, sub, icon: Icon }) {
  return (
    <div className="rounded-2xl ring-1 ring-white/10 bg-white/5 p-4 flex items-center gap-3 min-w-0">
      <div className="grid place-items-center w-10 h-10 rounded-xl bg-white/10 ring-1 ring-white/15 shrink-0">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <div className="text-zinc-300 text-[11.5px] truncate">{label}</div>
        <div className="text-zinc-50 font-bold text-lg leading-5">{value}</div>
        {sub && <div className="text-[11px] text-zinc-500">{sub}</div>}
      </div>
    </div>
  );
});

const SubjectsCard = memo(function SubjectsCard({ subject, count, onClick, isReady, colorIdx = 1 }) {
  const Icon = iconForSubject(subject.name);
  const reduce = useReducedMotion();
  
  // Refined palette: Deep, cool, non-childish gradients using related dark shades
  const deepCoolColors = {
    1: 'from-sky-700 to-blue-800',
    2: 'from-purple-700 to-violet-800',
    3: 'from-emerald-700 to-teal-800',
    4: 'from-indigo-700 to-fuchsia-800',
    5: 'from-cyan-700 to-sky-800',
    6: 'from-rose-700 to-pink-800',
    7: 'from-lime-700 to-green-800',
    8: 'from-blue-700 to-indigo-800',
  };
  const gradient = deepCoolColors[((colorIdx - 1) % 8) + 1];

  return (
    <motion.button
      onClick={isReady ? onClick : undefined}
      whileHover={reduce ? {} : { y: -4, scale: 1.01 }}
      whileTap={reduce ? {} : { scale: 0.98 }}
      className={`relative text-right w-full rounded-2xl p-4 transition group overflow-hidden
        ${isReady ? "cursor-pointer ring-1 ring-white/10 bg-white/[0.03]" : "cursor-not-allowed opacity-60 ring-1 ring-white/5 bg-white/[0.02]"}`
      }
      title={subject.name}
    >
      {/* background glow */}
      <div className={`absolute -top-10 -left-10 w-52 h-52 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${gradient}`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="grid place-items-center w-10 h-10 rounded-xl bg-white/10 ring-1 ring-white/15 shrink-0">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className={`flex items-center gap-1 text-[11.5px] ${isReady ? "text-emerald-300" : "text-rose-300"}`}>
            {isReady ? <CheckCircle2 className="w-3.5 h-3.5" /> : <CircleDashed className="w-3.5 h-3.5" />}
            <span>{isReady ? "ئامادەیە" : "ئامادە نییە"}</span>
          </div>
        </div>
        <div className="mt-3">
          <div className="text-white font-bold text-[13.5px] sm:text-lg truncate">{subject.name}</div>
        </div>
      </div>
    </motion.button>
  );
});

const SkeletonGrid = ({ rows = 12 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-28 rounded-2xl bg-white/5 ring-1 ring-white/10 animate-pulse" />
    ))}
  </div>
);

/* ============================== Page ============================== */
export default function SubjectsHub() {
  const nav = useNavigate();
  const reduce = useReducedMotion();

  // State (persisted like dashboard)
  const [grade, setGrade] = useState(() => {
    try {
      const gRaw = lsGetRaw("grade", "12");
      const g = gRaw ? Number(gRaw) : null;
      return Number.isFinite(g) ? g : null;
    } catch { return null; }
  });
  const [track, setTrack] = useState(() => {
    try { return normalizeTrack(lsGetRaw("track", "scientific")); } catch { return null; }
  });

  const [allSubjects, setAllSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [onlyReady, setOnlyReady] = useState(false);

  // availability sets + totals for dashboard tiles
  const [avail, setAvail] = useState({ any: new Set(), scientific: new Set(), literary: new Set(), both: new Set(), basic: new Set() });
  const [totals, setTotals] = useState({ docs: 0, papers: 0 });

  useEffect(() => {
    let ok = true;
    const controller = new AbortController();
    (async () => {
      setLoading(true); setError("");
      try {
        const [subjectsJSON, docs, papers] = await Promise.all([
          fetchJSON(`${API_SUBJECTS}?page=1&per_page=100`, controller.signal),
          // Fetch all data for the selected grade and track
          fetchAllPages(API_DOCS, buildParams({ grade, stream: track, per_page: "100" }), controller.signal),
          fetchAllPages(API_PAPERS, buildParams({ grade, stream: track, per_page: "100" }), controller.signal),
        ]);
        if (!ok) return;

        const subjects = (subjectsJSON?.data || []).map((s) => ({
          id: s.id, name: s.name, code: (s.code || "").toLowerCase() || null
        }));
        setAllSubjects(subjects);

        const sets = { any: new Set(), scientific: new Set(), literary: new Set(), both: new Set(), basic: new Set() };
        for (const d of docs) {
          const sid = d?.subject_id; if (!sid) continue; sets.any.add(sid);
          const st = d?.stream ? String(d.stream).toLowerCase() : null;
          if (st === "scientific") sets.scientific.add(sid); else if (st === "literary") sets.literary.add(sid); else if (st === "both") sets.both.add(sid); else sets.basic.add(sid);
        }
        for (const p of papers) {
          const sid = p?.subject_id; if (!sid) continue; sets.any.add(sid);
          const st = p?.stream ? String(p.stream).toLowerCase() : null;
          if (st === "scientific") sets.scientific.add(sid); else if (st === "literary") sets.literary.add(sid); else if (st === "both") sets.both.add(sid); else sets.basic.add(sid);
        }
        setAvail(sets);
        setTotals({ docs: docs.length, papers: papers.length });
      } catch (e) {
        if (!ok || controller.signal.aborted) return;
        setError(e?.message || "هەڵەیەك ڕوویدا");
        setAvail({ any: new Set(), scientific: new Set(), literary: new Set(), both: new Set(), basic: new Set() });
        setTotals({ docs: 0, papers: 0 });
      } finally {
        if (ok) setLoading(false);
      }
    })();
    return () => { ok = false; controller.abort(); };
  }, [grade, track]);

  // search & grouping
  const queryFiltered = useMemo(() => {
    if (!q.trim()) return allSubjects;
    const needle = q.trim().toLowerCase();
    return allSubjects.filter((s) => (s.name || "").toLowerCase().includes(needle));
  }, [q, allSubjects]);

  const wantsStream = typeof grade === "number" && grade >= 10;
  const grouped = useMemo(() => {
    const src = queryFiltered;
    if (!wantsStream) return { mode: "basic", basic: src };
    const sci = src.filter((s) => s.code === "scientific" || s.code === "both");
    const lit = src.filter((s) => s.code === "literary" || s.code === "both");
    if (track === "scientific") return { mode: "scientific", sci };
    if (track === "literary") return { mode: "literary", lit };
    // 'both' or null/default track when grade >= 10
    return { mode: "both", sci, lit }; 
  }, [queryFiltered, wantsStream, track]);

  const filterReady = (arr) => (onlyReady ? arr.filter((s) => avail.any.has(s.id)) : arr);
  const getCount = (subjectId) => {
    // simple “readiness score” — how many buckets include this subject
    return (avail.scientific.has(subjectId) ? 1 : 0)
      + (avail.literary.has(subjectId) ? 1 : 0)
      + (avail.both.has(subjectId) ? 1 : 0)
      + (avail.basic.has(subjectId) ? 1 : 0);
  };

  const totalSubjects = allSubjects.length;
  const readySubjects = allSubjects.filter((s) => avail.any.has(s.id)).length;

  // handlers
  const handleGradeChange = (e) => {
    const newGrade = e.target.value === "null" ? null : Number(e.target.value);
    setGrade(newGrade);
    localStorage.setItem("grade", newGrade == null ? "" : String(newGrade));
    if (newGrade == null || newGrade < 10) { setTrack(null); localStorage.removeItem("track"); }
  };
  const handleTrackChange = (e) => {
    const newTrack = e.target.value === "null" ? null : e.target.value;
    setTrack(newTrack);
    if (newTrack == null) localStorage.removeItem("track"); else localStorage.setItem("track", newTrack);
  };

  /* ============================== Render ============================== */
  return (
    <div dir="rtl" className="relative p-3 sm:p-5 font-sans space-y-5 bg-zinc-950 min-h-screen text-right">
      {/* dotted page bg like dashboard */}
      <div className="fixed inset-0 -z-10 h-full w-full" />

      {/* Hero / Header Bar */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: EASE }}
        className="relative z-10 overflow-hidden rounded-b-[28px] ring-1 ring-zinc-800/70 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80"
      >
        {/* glow blobs */}
        <div className="absolute -top-24 -right-10 w-[320px] h-[320px] blur-3xl opacity-30"
          style={{ background: "radial-gradient(50% 50% at 50% 50%, #22d3ee55 0%, transparent 70%)" }} />
        <div className="absolute -bottom-10 -left-10 w-[420px] h-[420px] blur-3xl opacity-30"
          style={{ background: "radial-gradient(50% 50% at 50% 50%, #8b5cf655 0%, transparent 70%)" }} />

        <div className="relative p-4 sm:p-6 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-white/5 ring-1 ring-white/10 shrink-0">
                <LibraryBig className="w-6 h-6 text-lime-400" />
              </span>
              <div className="min-w-0">
                <div className="font-extrabold text-[clamp(18px,2.2vw,24px)] leading-6 text-zinc-100">سەنتەری بابەتەکان</div>
                <div className="text-[12px] sm:text-sm text-zinc-300 truncate">هەموو بابەتەکانت بە شێوازی داشبۆرد — خێرا، سادە، جوان.</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[13px] font-medium">
              <div className="relative">
                <select value={grade ?? "null"} onChange={handleGradeChange} className="rounded-2xl bg-zinc-900/70 ring-1 ring-zinc-800/70 text-zinc-100 px-4 py-2 text-center appearance-none cursor-pointer pr-10 outline-none focus:ring-zinc-700 text-sm">
                  <option value="null">هەڵبژاردنی پۆل</option>
                  {[...Array(12).keys()].map((i) => i + 1).map((g) => (
                    <option key={g} value={g}>پۆل {g}</option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>
              {grade >= 10 && (
                <div className="relative">
                  <select value={track ?? "null"} onChange={handleTrackChange} className="rounded-2xl bg-zinc-900/70 ring-1 ring-zinc-800/70 text-zinc-100 px-4 py-2 text-center appearance-none cursor-pointer pr-10 outline-none focus:ring-zinc-700 text-sm">
                    <option value="null">هەڵبژاردنی جۆر</option>
                    <option value="scientific">زانستی</option>
                    <option value="literary">ئەدەبی</option>
                    <option value="both">هاوبەش</option>
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                </div>
              )}
            </div>
          </div>

          {/* search + toggles */}
          <form onSubmit={(e) => e.preventDefault()} className="mt-4 relative" role="search" aria-label="گەڕان">
            <input
              dir="rtl"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="گەڕان بۆ ناوی بابەت..."
              className="w-full ps-3 pe-4 py-3 rounded-2xl bg-zinc-900/70 ring-1 ring-zinc-800/70 text-zinc-100 placeholder-zinc-500 outline-none focus:ring-zinc-700 text-[13.5px] sm:text-base"
            />
            <div className="absolute inset-y-0 left-0 flex items-center gap-2 pl-2">
              <button type="button"
                onClick={() => setOnlyReady((v) => !v)}
                className={`px-3 py-1.5 rounded-xl ring-1 text-[12px] sm:text-sm transition
                  ${onlyReady ? "bg-cyan-600/25 ring-cyan-500/25 text-cyan-100" : "bg-white/5 ring-white/10 text-zinc-200 hover:bg-white/10"}`}>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4" /> تەنیا ئامادە
                </div>
              </button>
            </div>
          </form>

          <div className="mt-2 text-[11px] text-zinc-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            <span>بابەتەکان بەپێی پۆل/جۆر فلتەر دەبن. داتاکان لە کتێب/فایله‌كانه‌وه‌ هاتوون.</span>
          </div>

          {/* dashboard-like stat tiles */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <StatTile label="کۆی بابەتەکان" value={totalSubjects} sub="هەموو پۆلەکان" icon={BookMarked} />
            <StatTile label="بابه‌ته‌ ئاماده‌كان" value={readySubjects} sub="هەمان ئێستا داتایان هەیە" icon={CheckCircle2} />
            <StatTile label="ژمارەی کتێب" value={totals.docs} sub="كتێبه‌كان" icon={TrendingUp} />
            <StatTile label="ژمارەی فایله‌كان" value={totals.papers} sub="فایله‌كان" icon={Star} />
          </div>
        </div>
      </motion.div>

      {/* error banner */}
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 flex items-start gap-3" aria-live="polite">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold mb-1">هه‌ڵه‌!</div>
            <div className="text-sm leading-6">ناتوانرێت زانیاریه‌کان بکرێنەوە. تکایە دوبارە هەوڵبدەوە.</div>
            <div className="mt-1 text-xs opacity-70 ltr:font-mono rtl:font-mono break-words">{error}</div>
          </div>
        </div>
      )}

      {/* body / grids (dashboard sections) */}
      <Panel>
        <div className="p-5">
          {loading ? (
            <SkeletonGrid rows={12} />
          ) : (
            <>
              {/* If basic (grades < 10) → single grid. Otherwise → grouped like the dashboard sections. */}
              {(!wantsStream) ? (
                filterReady(queryFiltered).length === 0 ? (
                  <div className="text-[12.5px] sm:text-sm text-zinc-400">هیچ بابەتێك نەدۆزرایەوە.</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    <AnimatePresence>
                      {filterReady(queryFiltered).map((s, i) => (
                        <motion.div
                          key={s.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={SPRING}
                        >
                          <SubjectsCard
                            subject={s}
                            count={getCount(s.id)}
                            isReady={avail.any.has(s.id)}
                            colorIdx={i + 1}
                            onClick={() => nav(`/subjects/${s.id}`)}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )
              ) : (
                <div className="space-y-6">
                  {/* scientific / both */}
                  {(grouped.mode === "scientific" || grouped.mode === "both") && (
                    <div>
                      <div className="text-sky-400 font-semibold mb-3 flex items-center gap-2">
                        <Atom className="w-4 h-4" /> زانستی و هاوبەش
                      </div>
                      {filterReady(grouped.sci || []).length === 0 ? (
                        <div className="text-[12.5px] sm:text-sm text-zinc-400">نییە.</div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                          {(grouped.sci || []).filter((s) => !onlyReady || avail.any.has(s.id)).map((s, i) => (
                            <SubjectsCard
                              key={s.id}
                              subject={s}
                              count={getCount(s.id)}
                              isReady={avail.any.has(s.id)}
                              colorIdx={i + 1}
                              onClick={() => nav(`/subjects/${s.id}`)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* literary */}
                  {(grouped.mode === "literary" || grouped.mode === "both") && (
                    <div>
                      <div className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                        <Pen className="w-4 h-4" /> ئەدەبی
                      </div>
                      {filterReady(grouped.lit || []).length === 0 ? (
                        <div className="text-[12.5px] sm:text-sm text-zinc-400">نییە.</div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                          {(grouped.lit || []).filter((s) => !onlyReady || avail.any.has(s.id)).map((s, i) => (
                            <SubjectsCard
                              key={s.id}
                              subject={s}
                              count={getCount(s.id)}
                              isReady={avail.any.has(s.id)}
                              colorIdx={i + 5} 
                              onClick={() => nav(`/subjects/${s.id}`)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </Panel>
    </div>
  );
}
