// src/pages/Subjects.jsx — Grouped by Scientific / Literary / General
// Dark-only • Kurdish RTL • Neon cards + Quick Modal + Command Palette
// - Sections: زانستی (Scientific), ئەدەبی (Literary), گشتی (General)
// - Sticky jump chips with counts
// - Search across all groups
// - Same smooth, modern design you had

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Search as SearchIcon, Keyboard, Command,
  Atom, BookText, Languages, Rocket, BookOpen, Layers, Video, FileText, X
} from "lucide-react";

/* ----------------------------- Config & Helpers ---------------------------- */
const API_SUBJECTS_URL = "https://api.studentkrd.com/api/v1/subjects";
const EASE = [0.22, 0.61, 0.36, 1];

const saveLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const readLS = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };
const PREF = { QUERY: "subjects2:q" };

const slug = (s = "") => s
  .normalize("NFKD")
  .replace(/[\u064A]/g, "ی")
  .replace(/[\u0643]/g, "ک")
  .replace(/[\u0640\u200C\u200D]/g, "")
  .replace(/\s+/g, "-")
  .replace(/[^\p{L}\p{N}-]/gu, "")
  .toLowerCase();

const sampleGradients = [
  ["from-sky-500","via-cyan-400","to-emerald-400"],
  ["from-fuchsia-500","via-pink-500","to-rose-400"],
  ["from-violet-500","via-indigo-500","to-sky-400"],
  ["from-amber-500","via-orange-500","to-rose-400"],
  ["from-lime-500","via-emerald-500","to-teal-400"],
  ["from-blue-500","via-cyan-500","to-teal-400"],
];
function gradientFor(name = ""){
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const pick = sampleGradients[h % sampleGradients.length];
  return pick.join(" ");
}
function iconFor(code){
  const c = (code||"").toLowerCase();
  if (c.includes("scient")) return <Atom className="w-5 h-5"/>;
  if (c.includes("liter")) return <BookText className="w-5 h-5"/>;
  return <Languages className="w-5 h-5"/>;
}

/* ------------------------------ Fancy Backdrops --------------------------- */
function Aurora(){
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 right-10 h-[36rem] w-[36rem] rounded-full blur-3xl opacity-40 bg-gradient-to-br from-sky-400 via-cyan-400 to-emerald-400"/>
      <div className="absolute -bottom-40 left-10 h-[34rem] w-[34rem] rounded-full blur-3xl opacity-35 bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-400"/>
      <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:14px_14px]"/>
    </div>
  );
}
function Starfield(){
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,.2)_1px,transparent_1px)] [background-size:2px_2px] opacity-5"/>
    </div>
  );
}

/* ------------------------------ Hotkeys / Palette ------------------------- */
function useHotkeys(map){
  useEffect(()=>{
    const onKey = (e)=>{
      const key = [e.ctrlKey||e.metaKey?"mod":"", e.shiftKey?"shift":"", e.key.toLowerCase()].filter(Boolean).join("+");
      if (map[key]) { e.preventDefault(); map[key](e); }
    };
    window.addEventListener("keydown", onKey);
    return ()=> window.removeEventListener("keydown", onKey);
  }, [map]);
}
function CommandPalette({ open, onClose, list, onPick }){
  const [q, setQ] = useState("");
  useEffect(()=>{ if (open) setQ(""); }, [open]);
  const filtered = useMemo(()=>{
    const n=(s="")=>s.normalize("NFKC").toLowerCase(); const qq=n(q);
    if (!qq) return list.slice(0, 30);
    return list.filter(x=> n(x.title).includes(qq) || n(x.subtitle).includes(qq)).slice(0, 30);
  }, [q, list]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-50 bg-black/60" initial={{opacity:0}} animate={{opacity:.6}} exit={{opacity:0}}/>
          <motion.div className="fixed z-50 inset-x-0 top-[10vh] mx-auto max-w-xl w-[92%] rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur p-3"
            initial={{y:-10, opacity:0}} animate={{y:0, opacity:1}} exit={{y:-10, opacity:0}} transition={{duration:.18, ease:EASE}}>
            <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-white/5 border border-white/10">
              <Command className="w-4 h-4 text-cyan-300"/>
              <input autoFocus value={q} onChange={(e)=>setQ(e.target.value)} placeholder="گەڕان... (بابەت یان هاوبەشیار)"
                     className="w-full bg-transparent outline-none text-sm"/>
              <kbd className="text-[10px] text-zinc-400">Enter</kbd>
            </div>
            <div className="mt-2 max-h-[50vh] overflow-auto">
              {filtered.length===0 ? (
                <div className="text-xs text-zinc-400 px-3 py-6 text-center">ھیچ شتێک نەدۆزرایەوە</div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {filtered.map((x)=> (
                    <li key={x.key}>
                      <button onClick={()=>onPick(x)} className="w-full text-right px-3 py-2 hover:bg-white/5 rounded-lg">
                        <div className="text-sm font-semibold text-white">{x.title}</div>
                        <div className="text-[12px] text-zinc-400">{x.subtitle}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mt-2 text-[11px] text-zinc-500 px-2">ESC بۆ داخستن</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* --------------------------------- Card ---------------------------------- */
function NeonCard({ s, onOpen, onQuick }){
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
      className="group relative rounded-3xl bg-zinc-900/60 overflow-hidden ring-1 ring-white/15 hover:ring-2 hover:ring-cyan-400/40 transition-shadow duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.25)] after:content-[''] after:absolute after:inset-0 after:rounded-3xl after:pointer-events-none after:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
      role="button" aria-label={`بابەت: ${s.name}`}
      onClick={()=>onOpen?.(s)}
    >
      {/* glow following cursor */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
           style={{ background: `radial-gradient(350px 220px at ${pos.x}% ${pos.y}%, rgba(56,189,248,.15), transparent 45%)` }} />

      <div className={`relative p-4 min-h-[140px] flex flex-col justify-between bg-gradient-to-br ${gradientFor(s.name)}/[0.06]`}> 
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-white/10 border border-white/10 text-white/90">{iconFor(s.code)}</div>
            <div>
              <div className="text-base font-extrabold leading-tight">{s.name}</div>
              <div className="text-[12px] text-zinc-300/90">{s.code ? (s.code.toLowerCase()==="scientific"?"زانستی":"ئەدەبی") : "گشتی"}</div>
            </div>
          </div>
          <button onClick={(e)=>{e.stopPropagation(); onQuick?.(s);}}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white/10 hover:bg-white/15 border border-white/10 inline-flex items-center gap-1">
            <Rocket className="w-3.5 h-3.5"/> خێرا
          </button>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[{k:"book",label:"کتێب",icon:<BookOpen className="w-3.5 h-3.5"/>},
            {k:"booklet",label:"مەڵزەمە",icon:<Layers className="w-3.5 h-3.5"/>},
            {k:"video",label:"ڤیدیۆ",icon:<Video className="w-3.5 h-3.5"/>},
            {k:"papers",label:"ئەسیلە",icon:<FileText className="w-3.5 h-3.5"/>},
          ].map(btn => (
            <span key={btn.k} className="text-center text-[11px] bg-black/20 rounded-lg px-2 py-1 inline-flex items-center justify-center gap-1 ring-1 ring-white/15 hover:ring-cyan-300/30">
              {btn.icon} {btn.label}
            </span>
          ))}
        </div>
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
          <motion.div className="fixed z-50 inset-x-0 top-[12vh] mx-auto max-w-lg w-[92%] rounded-3xl border border-white/10 bg-zinc-950/95 backdrop-blur p-4"
            initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} exit={{y:10, opacity:0}} transition={{duration:.2, ease:EASE}}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-white/10 border border-white/10">{iconFor(subject.code)}</div>
                <div>
                  <div className="text-lg font-extrabold">{subject.name}</div>
                  <div className="text-[12px] text-zinc-400">{subject.code ? (subject.code.toLowerCase()==="scientific"?"زانستی":"ئەدەبی") : "گشتی"}</div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg bg-white/5 border border-white/10"><X className="w-4 h-4"/></button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={()=>onGoto("book")} className="rounded-xl px-3 py-2 text-right bg-sky-500/15 border border-sky-400/25 text-sky-200 hover:bg-sky-500/25">
                <div className="text-sm font-bold flex items-center gap-2"><BookOpen className="w-4 h-4"/> کتێب</div>
                <div className="text-[11px] text-sky-100/80 mt-0.5">هەموو کتێبە پەیوەستەکان</div>
              </button>
              <button onClick={()=>onGoto("booklet")} className="rounded-xl px-3 py-2 text-right bg-indigo-500/15 border border-indigo-400/25 text-indigo-200 hover:bg-indigo-500/25">
                <div className="text-sm font-bold flex items-center gap-2"><Layers className="w-4 h-4"/> مەڵزەمە</div>
                <div className="text-[11px] text-indigo-100/80 mt-0.5">کردەوە و مەڵزەمەکان</div>
              </button>
              <button onClick={()=>onGoto("video")} className="rounded-xl px-3 py-2 text-right bg-emerald-500/15 border border-emerald-400/25 text-emerald-200 hover:bg-emerald-500/25">
                <div className="text-sm font-bold flex items-center gap-2"><Video className="w-4 h-4"/> ڤیدیۆ</div>
                <div className="text-[11px] text-emerald-100/80 mt-0.5">وانە و شارەزایی</div>
              </button>
              <button onClick={()=>onGoto("papers")} className="rounded-xl px-3 py-2 text-right bg-rose-500/15 border border-rose-400/25 text-rose-200 hover:bg-rose-500/25">
                <div className="text-sm font-bold flex items-center gap-2"><FileText className="w-4 h-4"/> ئەسیلە</div>
                <div className="text-[11px] text-rose-100/80 mt-0.5">سەرقاڵبوون و تاقیکردنەوە</div>
              </button>
            </div>
            <div className="mt-3 text-[11px] text-zinc-500">تێبینی: پۆلی تۆ لەسەر پەڕەی سەرچاوەکان هەڵبژێردراوە، ئەنجامەکان وەک پۆلیت دەڕێژن.</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* --------------------------------- Page ---------------------------------- */
export default function SubjectsPage(){
  const nav = useNavigate();
  const loc = useLocation();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState(readLS(PREF.QUERY, ""));
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [quickFor, setQuickFor] = useState(null);

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
        const mapped = arr.map(s => ({ id: s.id, name: s.name, code: s.code }));
        setSubjects(mapped);
      } catch {
        setErr("ناتوانرێت بابەتەکان بهێنرێن. لیستی بنەڕەتی پیشان دەدرێت.");
        setSubjects([
          { id: 1, name: "ئینگلیزی", code: null },
          { id: 2, name: "کوردی", code: null },
          { id: 3, name: "عەرەبی", code: null },
          { id: 4, name: "فیزیا", code: "Scientific" },
          { id: 5, name: "کیمیا", code: "Scientific" },
          { id: 6, name: "زیندەزانی", code: "Scientific" },
          { id: 7, name: "مێژوو", code: "Literary" },
          { id: 8, name: "جووگرافیا", code: "Literary" },
        ]);
      } finally { setLoading(false); }
    })();
    return ()=> ctrl.abort();
  }, []);

  // deep-link: #slug opens quick modal
  useEffect(()=>{
    const key = (loc.hash||"").replace("#","");
    if (!key) return;
    const found = subjects.find(s => slug(s.name)===key);
    if (found) setQuickFor(found);
  }, [loc.hash, subjects]);

  // hotkeys
  const searchRef = useRef(null);
  useHotkeys({
    "/": ()=> searchRef.current?.focus?.(),
    "mod+k": ()=> setPaletteOpen(v=>!v),
    "escape": ()=> { setPaletteOpen(false); setQuickFor(null); },
  });

  useEffect(()=>{ saveLS(PREF.QUERY, q); }, [q]);

  // search
  const filtered = useMemo(()=>{
    const norm = (s="") => s.normalize("NFKC").replace(/\s+/g," ").trim().toLowerCase();
    const qq = norm(q);
    if (!qq) return subjects;
    return subjects.filter(s => norm(s.name).includes(qq) || norm(s.code||"").includes(qq));
  }, [q, subjects]);

  // groups
  const sci = filtered.filter(s => (s.code||"").toLowerCase().startsWith("scient"));
  const lit = filtered.filter(s => (s.code||"").toLowerCase().startsWith("liter"));
  const gen = filtered.filter(s => !s.code || (!/^(scient|liter)/i.test(s.code)));

  // palette items
  const paletteItems = useMemo(()=> subjects.map(s=>({
    key: slug(s.name),
    title: s.name,
    subtitle: s.code ? (s.code.toLowerCase()==="scientific"?"زانستی":"ئەدەبی") : "گشتی",
    raw: s,
  })), [subjects]);

  const goto = (type, subj) => {
    const sp = new URLSearchParams();
    if (type && type!=="book") sp.set("t", type);
    sp.set("sub", subj.name);
    nav(`/students?${sp.toString()}`);
  };

  const JumpChips = () => (
    <div className="sticky top-[8px] z-20 mt-3 flex flex-wrap gap-2 bg-transparent">
      {[
        { id:"scientific", label:`زانستی (${sci.length})`, show:sci.length },
        { id:"literary",   label:`ئەدەبی (${lit.length})`, show:lit.length },
        { id:"general",    label:`گشتی (${gen.length})`,  show:gen.length },
      ].filter(x=>x.show).map(x=>(
        <a key={x.id} href={`#${x.id}`} className="px-3 py-1.5 rounded-xl text-[12px] bg-white/5 border border-white/10 text-zinc-200 hover:bg-white/10">
          {x.label}
        </a>
      ))}
    </div>
  );

  const Section = ({ id, title, desc, list }) => {
    if (!list?.length) return null;
    return (
      <section id={id} className="scroll-mt-20">
        <div className="mt-8 mb-2 flex items-baseline justify-between">
          <h2 className="text-lg font-extrabold text-white">{title}</h2>
          <span className="text-[12px] text-zinc-400">{desc}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {list.map(s => (
            <NeonCard key={s.id} s={s} onOpen={setQuickFor} onQuick={setQuickFor} />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div dir="rtl" className="min-h-screen relative bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-50">
      <Aurora />
      <Starfield />

      {/* Hero */}
      <header className="relative pt-10 sm:pt-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-cyan-500/20 ring-1 ring-cyan-400/40 grid place-items-center">
                <Sparkles className="w-6 h-6 text-cyan-300"/>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">بابەتەکان — هاوپۆلەکان</h1>
                <p className="text-sm text-zinc-400 mt-1">جیاکردنەوەی زانستی / ئەدەبی / گشتی + گەڕانی خێرا</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <div className="px-2 py-1 rounded-xl bg-white/5 border border-white/10 text-[11px] text-zinc-300 inline-flex items-center gap-1"><Keyboard className="w-3.5 h-3.5"/> "/" بۆ گەڕان</div>
              <div className="px-2 py-1 rounded-xl bg-white/5 border border-white/10 text-[11px] text-zinc-300 inline-flex items-center gap-1"><Command className="w-3.5 h-3.5"/> Ctrl/Cmd + K</div>
            </div>
          </div>

          {/* Search + jump chips */}
          <div className="relative mt-5">
            <div className="flex items-center gap-2 rounded-2xl bg-zinc-900/70 border border-white/10 px-3 py-2">
              <SearchIcon className="w-4 h-4 text-zinc-500"/>
              <input ref={searchRef} value={q} onChange={(e)=>setQ(e.target.value)} type="search" placeholder="بە ناوی بابەت بگەڕێ…" className="w-full bg-transparent outline-none text-sm" aria-label="گەڕان"/>
              <button onClick={()=>setPaletteOpen(true)} className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-zinc-300 hover:bg-white/10"><Command className="w-3.5 h-3.5 inline"/> پەلەتە</button>
            </div>
            <JumpChips />
            {q && <div className="mt-1 text-[12px] text-zinc-400">ئەنجام بۆ: <span className="text-zinc-200">{q}</span></div>}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative max-w-6xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({length:8}).map((_,i)=> (
              <div key={i} className="h-[150px] rounded-3xl border border-white/10 bg-white/5 animate-pulse"/>
            ))}
          </div>
        ) : (
          <>
            {err && <div className="mt-4 text-[12px] text-amber-300">{err}</div>}

            <Section id="scientific" title="👩‍🔬 هاوپۆلی زانستی" desc="فێرکاری و بابەتە زانستییەکان" list={sci} />
            <Section id="literary"   title="📚 هاوپۆلی ئەدەبی"   desc="فێرکاری و بابەتە ئەدەبییەکان" list={lit} />
            <Section id="general"    title="🌐 گشتی"           desc="بابەتە گشتییەکان"             list={gen} />

            {(sci.length + lit.length + gen.length === 0) && (
              <div className="text-center text-zinc-400 py-10">ھیچ شتێک نەدۆزرایەوە — هەوڵ بدە وشەیەکی تر.</div>
            )}
          </>
        )}
      </main>

      {/* Command Palette */}
      <CommandPalette
        open={paletteOpen}
        onClose={()=>setPaletteOpen(false)}
        list={paletteItems}
        onPick={(x)=>{ setPaletteOpen(false); setQuickFor(x.raw); }}
      />

      {/* Quick Modal */}
      <QuickModal
        open={!!quickFor}
        subject={quickFor}
        onClose={()=>setQuickFor(null)}
        onGoto={(type)=>{ const s = quickFor; setQuickFor(null); if (s) goto(type, s); }}
      />

      <footer className="max-w-6xl mx-auto px-4 pb-10 mt-6">
        <div className="text-[11px] text-zinc-500">🚀 ڕێنمایی خێرا: کلیلی “/” بۆ گەڕان، Ctrl/Cmd + K بۆ پەلەتە.</div>
      </footer>
    </div>
  );
}
