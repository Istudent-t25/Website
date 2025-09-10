// src/pages/Subjects.jsx — Single Accent • Dark • RTL • Smart Grouping
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Search as SearchIcon,
  Atom, BookText, Languages, Rocket, BookOpen, Layers, Video, FileText, X, SlidersHorizontal
} from "lucide-react";

/* ----------------------------- Config & Helpers ---------------------------- */
const API_SUBJECTS_URL = "https://api.studentkrd.com/api/v1/subjects";
const EASE = [0.22, 0.61, 0.36, 1];

const saveLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const readLS = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };
const PREF = { QUERY: "subjects2:q", DENSE: "subjects2:dense" };

const slug = (s = "") => s
  .normalize("NFKD")
  .replace(/[\u064A]/g, "ی")
  .replace(/[\u0643]/g, "ک")
  .replace(/[\u0640\u200C\u200D]/g, "")
  .replace(/\s+/g, "-")
  .replace(/[^\p{L}\p{N}-]/gu, "")
  .toLowerCase();

const ACCENT_GRAD = "from-sky-500/10 to-cyan-500/5";

/** normalize stream/track text -> scientific | literary | both | mid */
function normStream(v) {
  const s = (v ?? "").toString().trim().toLowerCase();
  if (!s) return "mid";
  const sci = ["scientific","zansti","زانستی","وێژەیی","wezheyi","wêjeyî","science","sci"];
  const lit = ["literary","adabi","ئەدەبی","ادبی","lit"];
  const both = ["both","هەردووک","hardook","herduk","two","dual"];
  const mid = ["mid","middle","ناوەڕاست","nawarasat","median","general","gisti","گشتی"];
  if (sci.includes(s)) return "scientific";
  if (lit.includes(s)) return "literary";
  if (both.includes(s)) return "both";
  if (mid.includes(s)) return "mid";
  // heuristic keywords
  if (s.startsWith("scien")) return "scientific";
  if (s.startsWith("liter")) return "literary";
  if (s.includes("both")) return "both";
  return "mid";
}

function displayTrack(t) {
  if (t === "scientific") return "زانستی";
  if (t === "literary")  return "ئەدەبی";
  if (t === "both")      return "هەردووک";
  return "Mid";
}

function iconFor(t){
  if (t === "scientific") return <Atom className="w-5 h-5"/>;
  if (t === "literary")   return <BookText className="w-5 h-5"/>;
  if (t === "both")       return <Languages className="w-5 h-5"/>;
  return <Languages className="w-5 h-5"/>;
}

/* ------------------------------ Backdrop ---------------------------------- */
function Aurora(){
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 right-10 h-[36rem] w-[36rem] rounded-full blur-3xl opacity-35 bg-gradient-to-br from-sky-400 via-cyan-400 to-sky-500"/>
      <div className="absolute -bottom-40 left-10 h-[34rem] w-[34rem] rounded-full blur-3xl opacity-25 bg-gradient-to-br from-sky-400 via-cyan-400 to-sky-500"/>
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:14px_14px]"/>
    </div>
  );
}

/* --------------------------------- Card ----------------------------------- */
function NeonCard({ s, onOpen, onQuick, dense, compact }){
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect?.(); if (!r) return;
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setPos({ x, y });
  };
  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      whileHover={{ y: -3 }}
      transition={{ duration: .18, ease: EASE }}
      className="group relative rounded-3xl bg-zinc-900/60 overflow-hidden ring-1 ring-white/15 hover:ring-2 hover:ring-sky-400/40 transition-shadow duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.25)] after:content-[''] after:absolute after:inset-0 after:rounded-3xl after:pointer-events-none after:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
      role="button" aria-label={`بابەت: ${s.name}`}
      onClick={()=>onOpen?.(s)}
    >
      {/* glow following cursor */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(350px 220px at ${pos.x}% ${pos.y}%, rgba(56,189,248,.15), transparent 45%)` }}
      />
      <div className={`relative ${dense?"p-3 min-h-[120px]":"p-4 min-h-[140px]"} flex flex-col justify-between bg-gradient-to-br ${ACCENT_GRAD}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-white/10 border border-white/10 text-white/90">{iconFor(s._track)}</div>
            <div>
              <div className="text-base font-extrabold leading-tight">{s.name}</div>
              <div className="text-[12px] text-zinc-300/90">{displayTrack(s._track)}</div>
            </div>
          </div>
          <button
            onClick={(e)=>{e.stopPropagation(); onQuick?.(s);}}
            className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/25 inline-flex items-center gap-1"
          >
            <Rocket className="w-3.5 h-3.5"/> خێرا
          </button>
        </div>

        {/* Hide the mini list while searching (compact mode) */}
        {!compact && (
          <div className={`${dense?"mt-2 grid-cols-4":"mt-3 grid-cols-4"} grid gap-2`}>
            {[{k:"book",label:"کتێب",icon:<BookOpen className="w-3.5 h-3.5"/>},
              {k:"booklet",label:"مەڵزەمە",icon:<Layers className="w-3.5 h-3.5"/>},
              {k:"video",label:"ڤیدیۆ",icon:<Video className="w-3.5 h-3.5"/>},
              {k:"papers",label:"ئەسیلە",icon:<FileText className="w-3.5 h-3.5"/>},
            ].map(btn => (
              <span key={btn.k} className="text-center text-[11px] bg-black/20 rounded-lg px-2 py-1 inline-flex items-center justify-center gap-1 ring-1 ring-white/15 hover:ring-sky-300/30">
                {btn.icon} {btn.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------- Quick Modal ------------------------------- */
function QuickModal({ open, onClose, subject, onGoto }){
  return (
    <AnimatePresence>
      {open && subject && (
        <>
          <motion.div className="fixed inset-0 z-50 bg-black/60" initial={{opacity:0}} animate={{opacity:.6}} exit={{opacity:0}} />
          <motion.div
            className="fixed z-50 inset-x-0 top-[12vh] mx-auto max-w-lg w-[92%] rounded-3xl border border-white/10 bg-zinc-950/95 backdrop-blur p-4"
            initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} exit={{y:10, opacity:0}} transition={{duration:.2, ease:EASE}}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-white/10 border border-white/10"><Languages className="w-5 h-5"/></div>
                <div>
                  <div className="text-lg font-extrabold">{subject.name}</div>
                  <div className="text-[12px] text-zinc-400">{displayTrack(subject._track)}</div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg bg-white/5 border border-white/10"><X className="w-4 h-4"/></button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={()=>onGoto("book")} className="rounded-xl px-3 py-2 text-right bg-sky-500/12 border border-sky-400/25 text-sky-200 hover:bg-sky-500/20">
                <div className="text-sm font-bold flex items-center gap-2"><BookOpen className="w-4 h-4"/> کتێب</div>
                <div className="text-[11px] text-sky-100/80 mt-0.5">هەموو کتێبە پەیوەستەکان</div>
              </button>
              <button onClick={()=>onGoto("booklet")} className="rounded-xl px-3 py-2 text-right bg-sky-500/12 border border-sky-400/25 text-sky-200 hover:bg-sky-500/20">
                <div className="text-sm font-bold flex items-center gap-2"><Layers className="w-4 h-4"/> مەڵزەمە</div>
                <div className="text-[11px] text-sky-100/80 mt-0.5">کردەوە و مەڵزەمەکان</div>
              </button>
              <button onClick={()=>onGoto("video")} className="rounded-xl px-3 py-2 text-right bg-sky-500/12 border border-sky-400/25 text-sky-200 hover:bg-sky-500/20">
                <div className="text-sm font-bold flex items-center gap-2"><Video className="w-4 h-4"/> ڤیدیۆ</div>
                <div className="text-[11px] text-sky-100/80 mt-0.5">وانە و شارەزایی</div>
              </button>
              <button onClick={()=>onGoto("papers")} className="rounded-xl px-3 py-2 text-right bg-sky-500/12 border border-sky-400/25 text-sky-200 hover:bg-sky-500/20">
                <div className="text-sm font-bold flex items-center gap-2"><FileText className="w-4 h-4"/> ئەسیلە</div>
                <div className="text-[11px] text-sky-100/80 mt-0.5">سەرقاڵبوون و تاقیکردنەوە</div>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* --------------------------------- Page ----------------------------------- */
export default function SubjectsPage(){
  const nav = useNavigate();
  const loc = useLocation();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState(readLS(PREF.QUERY, ""));
  const [quickFor, setQuickFor] = useState(null);
  const [dense, setDense] = useState(readLS(PREF.DENSE, false));

  // fetch subjects
  useEffect(()=>{
    const ctrl = new AbortController();
    (async()=>{
      try {
        setLoading(true); setErr("");
        const r = await fetch(API_SUBJECTS_URL, { signal: ctrl.signal });
        if (!r.ok) throw new Error("fetch failed");
        const j = await r.json();
        const arr = Array.isArray(j?.data) ? j.data : [];
        const mapped = arr.map(s => {
          const _track = normStream(s.code ?? s.stream);
          return { id: s.id, name: s.name, code: s.code, stream: s.stream, _track };
        });
        setSubjects(mapped);
      } catch {
        setErr("ناتوانرێت بابەتەکان بهێنرێن. لیستی بنەڕەتی پیشان دەدرێت.");
        const fallback = [
          { id: 1,  name: "ئینگلیزی",  code: null },
          { id: 2,  name: "کوردی",    code: null },
          { id: 3,  name: "عەرەبی",   code: "both" },
          { id: 4,  name: "فیزیا",    code: "Scientific" },
          { id: 5,  name: "کیمیا",    code: "Scientific" },
          { id: 6,  name: "زیندەزانی", code: "Scientific" },
          { id: 7,  name: "مێژوو",    code: "Literary" },
          { id: 8,  name: "جووگرافیا", code: "Literary" },
        ].map(s => ({ ...s, _track: normStream(s.code) }));
        setSubjects(fallback);
      } finally { setLoading(false); }
    })();
    return ()=> ctrl.abort();
  }, []);

  // deep-link: #slug → open quick modal
  useEffect(()=>{
    const key = (loc.hash||"").replace("#","");
    if (!key) return;
    const found = subjects.find(s => slug(s.name)===key);
    if (found) setQuickFor(found);
  }, [loc.hash, subjects]);

  useEffect(()=>{ saveLS(PREF.QUERY, q); }, [q]);
  useEffect(()=>{ saveLS(PREF.DENSE, dense); }, [dense]);

  // search
  const filtered = useMemo(()=>{
    const norm = (s="") => s.normalize("NFKC").replace(/\s+/g," ").trim().toLowerCase();
    const qq = norm(q);
    if (!qq) return subjects;
    return subjects.filter(s => norm(s.name).includes(qq) || norm(s._track).includes(qq));
  }, [q, subjects]);

  // groups:
  // - scientificPlus: scientific OR both
  // - literaryPlus:   literary   OR both
  // - mid:            mid OR null/empty
  const scientificPlus = filtered.filter(s => s._track === "scientific" || s._track === "both");
  const literaryPlus   = filtered.filter(s => s._track === "literary"   || s._track === "both");
  const midGroup       = filtered.filter(s => s._track === "mid");

  const goto = (type, subj) => {
    const sp = new URLSearchParams();
    if (type && type!=="book") sp.set("t", type);
    sp.set("sub", subj.name);
    nav(`/students?${sp.toString()}`);
  };

  const Section = ({ title, desc, list, compact }) => {
    if (!list?.length) return null;
    return (
      <section className="scroll-mt-20">
        {!compact && (
          <div className="mt-8 mb-2 flex items-baseline justify-between">
            <h2 className="text-lg font-extrabold text-white">{title}</h2>
            <span className="text-[12px] text-zinc-400">{desc}</span>
          </div>
        )}
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${dense?"lg:grid-cols-4":"lg:grid-cols-4"} gap-3 sm:gap-4`}>
          {list.map(s => (
            <NeonCard key={s.id} s={s} onOpen={setQuickFor} onQuick={setQuickFor} dense={dense} compact={compact} />
          ))}
        </div>
      </section>
    );
  };

  const isSearching = q.trim().length > 0;

  return (
    <div dir="rtl" className="min-h-screen relative bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-50">
      <Aurora />

      {/* Rounded container wraps header + content */}
      <section className="relative pt-10 sm:pt-12">
        <div className="max-w-6xl mx-auto px-2 sm:px-4">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur">
            {/* header area */}
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-sky-500/20 ring-1 ring-sky-400/40 grid place-items-center">
                    <Sparkles className="w-6 h-6 text-cyan-300"/>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">بابەتەکان — هاوپۆلەکان</h1>
                    <p className="text-sm text-zinc-400 mt-1">جیاکردنەوەی زانستی/ئەدەبی/هەردووک + Mid</p>
                  </div>
                </div>
              </div>

              {/* Search + controls (no result list text, no jump chips) */}
              <div className="relative mt-5 flex flex-col gap-2">
                <div className="flex items-center gap-2 rounded-2xl bg-zinc-900/70 border border-white/10 px-3 py-2">
                  <SearchIcon className="w-4 h-4 text-zinc-500"/>
                  <input
                    value={q}
                    onChange={(e)=>setQ(e.target.value)}
                    type="search"
                    placeholder="بە ناوی بابەت بگەڕێ…"
                    className="w-full bg-transparent outline-none text-sm"
                    aria-label="گەڕان"
                  />
                  <button
                    onClick={()=>setDense(v=>!v)}
                    className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-zinc-300 hover:bg-white/10 inline-flex items-center gap-1"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5"/> {dense?"تەواو":"دانس"}
                  </button>
                </div>
              </div>
            </div>

            {/* divider */}
            <div className="h-px bg-white/10"></div>

            {/* content area */}
            <main className="px-4 sm:px-6 pb-8">
              {loading ? (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {Array.from({length:8}).map((_,i)=> (
                    <div key={i} className="h-[150px] rounded-3xl border border-white/10 bg-white/5 animate-pulse"/>
                  ))}
                </div>
              ) : (
                <>
                  {err && <div className="mt-4 text-[12px] text-amber-300">{err}</div>}

                  {/* If searching → single compact grid (no section headers, no mini list on cards) */}
                  {isSearching ? (
                    <Section title="" desc="" list={filtered} compact />
                  ) : (
                    <>
                      <Section
                        title="👩‍🔬 زانستی + هەردووک"
                        desc="سەبارەت بە هاوپۆلی زانستی و هەردووک"
                        list={scientificPlus}
                        compact={false}
                      />
                      <Section
                        title="📚 ئەدەبی + هەردووک"
                        desc="سەبارەت بە هاوپۆلی ئەدەبی و هەردووک"
                        list={literaryPlus}
                        compact={false}
                      />
                      <Section
                        title="⚖️ Mid"
                        desc="هەمانەی نادیار/ناوەڕاست"
                        list={midGroup}
                        compact={false}
                      />
                      {(scientificPlus.length + literaryPlus.length + midGroup.length === 0) && (
                        <div className="text-center text-zinc-400 py-10">ھیچ شتێک نەدۆزرایەوە — هەوڵ بدە وشەیەکی تر.</div>
                      )}
                    </>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* Quick Modal */}
      <QuickModal
        open={!!quickFor}
        subject={quickFor}
        onClose={()=>setQuickFor(null)}
        onGoto={(type)=>{ const s = quickFor; setQuickFor(null); if (s) goto(type, s); }}
      />
    </div>
  );
}
