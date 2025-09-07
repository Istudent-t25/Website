// src/pages/Dashboard.jsx
// iStudent — Dark, RTL Dashboard (Framer Motion + Lucide)
// Clean Search Modal: fetches by localStorage grade/track only; no visible selectors
// Subject cards still open type dropdown (book/booklet/videos/paper)
// Header shows small status badges: current grade + track
// Responsive Pomodoro + fullscreen; no Weekly Streak / Focus Goal

import React, { useEffect, useMemo, useRef, useState, forwardRef } from "react";
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from "framer-motion";
import {
  Book, Video, NotebookText, CalendarDays, Lightbulb, Bell,
  GraduationCap, Languages, Volume2, ChevronRight, ChevronDown, Clock3, CheckCircle2,
  Trophy, Sparkles, Instagram, Send, Target,
  Plus, Minus, Trash2, Pause, PlayCircle, RotateCcw, BookOpenCheck,
  Search as SearchIcon, ChartBarStacked, Maximize2, Minimize2, X, FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ---------------- Utilities ---------------- */
function useDebounce(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => { const id = setTimeout(() => setV(value), delay); return () => clearTimeout(id); }, [value, delay]);
  return v;
}
function normalizeTrack(raw) {
  const s = (raw || "").toString().trim().toLowerCase();
  const sciWords = ["scientific", "science", "zansti", "زانستی", "وێژەیی", "wêjeyî", "wezheyi"];
  const litWords = ["literary", "adabi", "ئەدەبی", "ادبی"];
  if (sciWords.some(w => s.includes(w))) return "scientific";
  if (litWords.some(w => s.includes(w))) return "literary";
  return "common"; // middle/general
}
function trackLabelKurdish(raw) {
  const n = normalizeTrack(raw);
  if (n === "scientific") return "زانستی/وێژەیی";
  if (n === "literary") return "ئەدەبی";
  return "گشتی/ئامادەی";
}
function Glow({ className = "", size = 340, color = "#22d3ee" }) {
  return (
    <div
      aria-hidden
      className={"pointer-events-none absolute blur-3xl opacity-30 " + className}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(50% 50% at 50% 50%, ${color}33 0%, transparent 70%)`,
      }}
    />
  );
}
const Panel = forwardRef(function PanelBase({ className = "", children }, ref) {
  return (
    <div
      ref={ref}
      className={
        "rounded-3xl bg-zinc-900/70 backdrop-blur-3xl ring-1 ring-zinc-800/70 shadow-[0_10px_30px_rgba(0,0,0,0.45)] " +
        "relative overflow-hidden transition-transform duration-300 hover:scale-[1.01] " +
        className
      }
    >
      <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(circle_at_top_right,black,transparent_70%)]" />
      {children}
    </div>
  );
});
function PanelHeader({ children, className = "" }) { return <div className={"px-5 pt-5 pb-3 " + className}>{children}</div>; }
function PanelTitle({ children, className = "" }) { return <h3 className={"text-zinc-100 font-semibold flex items-center gap-2 " + className}>{children}</h3>; }
function PanelDesc({ children, className = "" }) { return <p className={"text-sm text-zinc-400 " + className}>{children}</p>; }
function PanelBody({ children, className = "" }) { return <div className={"px-5 pb-5 " + className}>{children}</div>; }
function Spotlight({ className = "" }) { return <div className={"absolute w-40 h-40 rounded-full bg-sky-400/20 blur-2xl opacity-0 transition-opacity duration-300 " + className} />; }

/* ---------------- Fancy Widgets ---------------- */
function ProgressRing({ value = 72, size = 120, fg = "#22d3ee", bg = "#0b0b0b" }) {
  const v = Math.max(0, Math.min(100, value));
  const deg = v * 3.6;
  return (
    <div className="grid place-items-center" style={{ width: size, height: size }}>
      <div className="rounded-full p-[8px]" style={{ background: `conic-gradient(${fg} ${deg}deg, ${bg} ${deg}deg 360deg)` }}>
        <div className="rounded-full grid place-items-center bg-zinc-950 ring-1 ring-zinc-800/70" style={{ width: size - 16, height: size - 16 }}>
          <span className="text-zinc-200 text-xl font-extrabold">{v}%</span>
        </div>
      </div>
    </div>
  );
}
function StatPill({ icon: Icon, label, value, accent = "text-sky-300" }) {
  const IconEl = typeof Icon === "function" ? <Icon /> : <Clock3 />;
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-zinc-900/70 px-3 py-2 ring-1 ring-zinc-800/70">
      <span className={accent + " grid place-items-center"}>
        {typeof Icon === "function" ? <Icon width={18} height={18} /> : IconEl}
      </span>
      <span className="text-xs text-zinc-300 whitespace-nowrap">{label}: {value}</span>
    </div>
  );
}

/* ---------------- Quick Actions & Marquee ---------------- */
function QuickAction({ icon: Icon, text, sub, to = "/students" }) {
  const mouseX = useMotionValue(0), mouseY = useMotionValue(0);
  const background = useMotionTemplate`
    radial-gradient(160px at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.06) 0%, transparent 80%)
  `;
  return (
    <motion.a
      href={to}
      whileHover={{ y: -6, boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}
      whileTap={{ scale: 0.96 }}
      onMouseMove={(e) => {
        const { left, top } = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - left); mouseY.set(e.clientY - top);
      }}
      className="flex items-center justify-between rounded-3xl p-4 bg-zinc-900/60 transition-all duration-300 backdrop-blur-sm ring-1 ring-zinc-800/70 shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
      style={{ background }}
    >
      <div className="flex items-center gap-4">
        <div className="grid place-items-center rounded-2xl p-3 bg-gradient-to-tr from-sky-600/25 to-indigo-600/25 ring-1 ring-sky-500/25">
          <Icon width={24} height={24} className="text-sky-300" />
        </div>
        <div className="text-right">
          <div className="text-zinc-100 text-base font-semibold">{text}</div>
          <div className="text-sm text-zinc-400">{sub}</div>
        </div>
      </div>
      <ChevronRight width={20} height={20} className="text-zinc-500" />
    </motion.a>
  );
}
function Marquee({ items = [] }) {
  return (
    <div className="relative overflow-hidden rounded-2xl ring-1 ring-zinc-800/70 bg-zinc-900/60">
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "12px 12px" }} />
      <div className="flex gap-6 animate-[scroll_22s_linear_infinite] whitespace-nowrap p-3 text-sm will-change-transform">
        {items.concat(items).map((t, i) => (
          <div key={i} className="px-3 py-1 rounded-xl bg-zinc-900/70 ring-1 ring-zinc-800/70 text-zinc-300">{t}</div>
        ))}
      </div>
      <style>{`@keyframes scroll { from{ transform: translateX(0)} to{ transform: translateX(-50%) } }`}</style>
    </div>
  );
}

/* ---------------- Compact Promo Slider ---------------- */
function CompactPromoSlider({ ads = [] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => { if (!ads.length) return; const id = setInterval(() => setIdx((p) => (p + 1) % ads.length), 5000); return () => clearInterval(id); }, [ads.length]);
  if (!ads.length) return null;
  const ad = ads[idx];
  const Icon = ad.icon === "instagram" ? Instagram : Send;
  return (
    <div className="col-span-full z-10" dir="rtl">
      <div className="relative h-24 sm:h-28 rounded-3xl overflow-hidden bg-zinc-900/70 backdrop-blur-3xl ring-1 ring-zinc-800/70 shadow-[inset_0_2px_10px_rgba(0,0,0,0.35)]">
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "12px 12px" }} />
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -80 }} transition={{ duration: 0.35, ease: "easeOut" }} className="absolute inset-0">
            <div className={`absolute inset-0 ${ad.bg}`} />
            <div className="relative h-full px-5 sm:px-8 flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="grid place-items-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-zinc-900/70 ring-1 ring-zinc-800/70">
                  <Icon className="text-zinc-100" size={22} />
                </span>
                <div className="text-right">
                  <h3 className="text-zinc-100 font-extrabold text-base sm:text-lg leading-tight">{ad.title}</h3>
                  <p className="text-zinc-300 text-xs sm:text-sm">{ad.description}</p>
                </div>
              </div>
              <a href={ad.link} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-[12px] sm:text-sm font-bold bg-zinc-800/60 ring-1 ring-zinc-700/60 text-zinc-100 hover:bg-zinc-800/80 transition">
                {ad.cta || "بینینی زیاتر"}
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {ads.map((_, i) => (<button key={i} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-4 bg-zinc-200" : "w-2 bg-zinc-400/50"}`} aria-label={`سلاید ${i + 1}`} />))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Local fallback (only used if API fails) ---------------- */
const SUBJECTS_SEED = [
  { name: "بیرکاری" }, { name: "فیزیا" }, { name: "كیمیا" }, { name: "زیندەزانی" },
  { name: "كوردی" }, { name: "ئینگلیزی" }, { name: "عەرەبی" }, { name: "تاریخ" },
  { name: "ریازیات" }, { name: "علوم" },
];

/* ---------------- Search Modal (API-powered, minimal UI) ---------------- */
function SearchModal({ open, onClose }) {
  const navigate = useNavigate();

  // read-only filters from localStorage
  const [track] = useState(() => localStorage.getItem("track") || "scientific");
  const [grade] = useState(() => {
    const g = Number(localStorage.getItem("grade") || "");
    return Number.isFinite(g) && g >= 1 ? g : null;
  });

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [pickerIdx, setPickerIdx] = useState(null); // open dropdown index

  const debouncedQ = useDebounce(q, 300);
  const normTrack = normalizeTrack(track);

  // fetch subjects from API using ONLY localStorage filters
  useEffect(() => {
    if (!open) return;
    const ctrl = new AbortController();
    const run = async () => {
      setLoading(true);
      try {
        let base =
          normTrack === "scientific" ? "/api/subjects/scientific" :
          normTrack === "literary"  ? "/api/subjects/literary"  :
                                      "/api/subjects/common";
        const url = new URL(base, window.location.origin);
        if (grade) url.searchParams.set("grade", String(grade));
        if (debouncedQ) url.searchParams.set("q", debouncedQ);
        const res = await fetch(url.toString(), { signal: ctrl.signal });
        if (!res.ok) throw new Error("Bad status");
        const data = await res.json();
        setRows((Array.isArray(data) ? data : []).slice(0, 50));
      } catch {
        const list = SUBJECTS_SEED.filter(s =>
          !debouncedQ ? true : s.name.toLowerCase().includes(debouncedQ.toLowerCase())
        ).slice(0, 20);
        setRows(list);
      } finally {
        setLoading(false);
      }
    };
    run();
    return () => ctrl.abort();
  }, [open, normTrack, grade, debouncedQ]);

  // Enter key → open first subject (if any) with default type "book"
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "Enter" && rows[0]) {
        const s = rows[0];
        const params = new URLSearchParams();
        params.set("t", "book");
        if (grade) params.set("grade", String(grade));
        params.set("q", s.name || q || "");
        navigate(`/students?${params.toString()}`);
        onClose?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, rows, q, grade, onClose, navigate]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div role="dialog" aria-modal="true" className="fixed inset-x-0 top-[6vh] z-[71] mx-auto w-[min(920px,94vw)]"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}>
        <div className="rounded-3xl bg-zinc-950 ring-1 ring-white/10 shadow-2xl overflow-hidden" onClick={(e)=>e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-zinc-200 font-semibold">
              <SearchIcon size={18} className="text-cyan-300" />
              گەڕانی خێرا
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-zinc-400"><X size={18}/></button>
          </div>

          {/* Input + read-only badges */}
          <div className="p-4 sm:p-5 space-y-2" dir="rtl">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18}/>
              <input
                autoFocus
                value={q}
                onChange={(e)=>setQ(e.target.value)}
                className="w-full bg-zinc-900/60 ring-1 ring-zinc-800/70 rounded-xl pl-9 pr-3 py-2 text-sm text-zinc-200 outline-none"
                placeholder="ناوی وانە، کتێب، مامۆستا..."
              />
            </div>

            {/* status line (grade + track) */}
            <div className="flex items-center gap-2 text-[12px] text-zinc-400">
              <span className="px-2 py-0.5 rounded-full bg-white/5 ring-1 ring-white/10 inline-flex items-center gap-1">
                <GraduationCap size={12}/> {grade ? `پۆل ${grade}` : "پۆل دیاری نەکراوە"}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/5 ring-1 ring-white/10 inline-flex items-center gap-1">
                📚 {trackLabelKurdish(track)}
              </span>
              {loading && <span className="ml-auto text-zinc-400">… هەڵگرتنی وانەکان</span>}
            </div>
          </div>

          {/* Results (subject cards with dropdown) */}
          <div className="px-4 sm:px-5 pb-4">
            <div className="grid gap-2 max-h-[50vh] overflow-auto">
              {rows.length === 0 ? (
                <div className="text-sm text-zinc-500 p-3 rounded-xl bg-white/5 ring-1 ring-white/10">
                  هیچ وانەیەک نەدۆزرایەوە — وشەکە بگۆڕە.
                </div>
              ) : rows.map((s, i) => (
                <div key={(s.id || s.name) + i} className="relative">
                  <button
                    onClick={() => setPickerIdx(pickerIdx === i ? null : i)}
                    className="w-full flex items-center justify-between rounded-2xl px-4 py-3 bg-zinc-900/60 ring-1 ring-zinc-800/70 text-right"
                  >
                    <div>
                      <div className="text-zinc-100 font-medium">{s.name}</div>
                      <div className="text-[12px] text-zinc-400 mt-0.5">جۆرێک دیاری بکە (کتێب/مەلزمە/ڤیدیۆ/پەیپەر)</div>
                    </div>
                    <ChevronDown size={16} className="text-zinc-500" />
                  </button>

                  {/* Type dropdown */}
                  <AnimatePresence>
                    {pickerIdx === i && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                        className="absolute left-3 right-3 top-[calc(100%+6px)] z-20"
                      >
                        <div className="rounded-2xl bg-zinc-950 ring-1 ring-white/10 shadow-xl grid sm:grid-cols-4 grid-cols-2 overflow-hidden">
                          {[
                            { key: "book",    label: "کتێب",    Icon: Book },
                            { key: "booklet", label: "مەلزمە",  Icon: NotebookText },
                            { key: "videos",  label: "ڤیدیۆ",   Icon: Video },
                            { key: "paper",   label: "پەیپەر",  Icon: FileText },
                          ].map(({ key, label, Icon }) => (
                            <button
                              key={key}
                              onClick={() => {
                                const params = new URLSearchParams();
                                params.set("t", key);
                                if (grade) params.set("grade", String(grade));
                                params.set("q", s.name);
                                navigate(`/students?${params.toString()}`);
                                onClose?.();
                              }}
                              className="flex items-center justify-between gap-3 px-3 py-3 hover:bg-white/5 text-zinc-200"
                            >
                              <div className="flex items-center gap-2">
                                <Icon size={18} className="text-cyan-300" />
                                <span className="text-sm">{label}</span>
                              </div>
                              <ChevronRight size={16} className="text-zinc-500" />
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------------- Responsive Pomodoro (adjustable + fullscreen) ---------------- */
function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => { const on = () => setW(window.innerWidth); window.addEventListener("resize", on); return () => window.removeEventListener("resize", on); }, []);
  return w;
}
function PomodoroTimer() {
  const [workMins, setWorkMins] = useState(() => Number(localStorage.getItem("pom_work") || 25));
  const [breakMins, setBreakMins] = useState(() => Number(localStorage.getItem("pom_break") || 5));
  const WORK = workMins * 60, BREAK = breakMins * 60;
  const [seconds, setSeconds] = useState(WORK);
  const [mode, setMode] = useState("work");
  const [running, setRunning] = useState(false);

  const panelRef = useRef(null);
  const [isFs, setIsFs] = useState(false);
  useEffect(() => { const onFs = () => setIsFs(!!document.fullscreenElement); document.addEventListener("fullscreenchange", onFs); return () => document.removeEventListener("fullscreenchange", onFs); }, []);
  const enterFs = async () => { try { await panelRef.current?.requestFullscreen?.(); } catch {} };
  const exitFs = async () => { try { await document.exitFullscreen?.(); } catch {} };

  const beep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = 880;
      o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      o.start();
      setTimeout(() => { g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25); o.stop(ctx.currentTime + 0.26); }, 240);
    } catch {}
  };

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s > 0) return s - 1;
        const nextMode = mode === "work" ? "break" : "work";
        const nextSec = nextMode === "work" ? WORK : BREAK;
        setMode(nextMode); beep(); return nextSec;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, mode, WORK, BREAK]);

  useEffect(() => { try { localStorage.setItem("pom_work", String(workMins)); } catch {} }, [workMins]);
  useEffect(() => { try { localStorage.setItem("pom_break", String(breakMins)); } catch {} }, [breakMins]);

  useEffect(() => { if (!running && mode === "work") setSeconds(WORK); }, [WORK]);   // eslint-disable-line
  useEffect(() => { if (!running && mode === "break") setSeconds(BREAK); }, [BREAK]); // eslint-disable-line

  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  const total = mode === "work" ? WORK : BREAK;
  const pct = Math.round(((total - seconds) / total) * 100);

  const width = useWindowWidth();
  const ringSize = width < 380 ? 120 : width < 640 ? 160 : 180;
  const timeText = width < 380 ? "text-3xl" : width < 640 ? "text-4xl" : "text-5xl";

  const start = () => setRunning(true);
  const pause = () => setRunning(false);
  const reset = () => { setRunning(false); setMode("work"); setSeconds(WORK); };
  const addTime = (deltaSec) => setSeconds((s) => Math.max(0, Math.min(60 * 60 * 3, s + deltaSec)));
  const adjustPreset = (type, delta) => {
    if (type === "work") setWorkMins((m) => Math.max(5, Math.min(180, m + delta)));
    if (type === "break") setBreakMins((m) => Math.max(3, Math.min(60, m + delta)));
  };

  return (
    <Panel ref={panelRef}>
      <PanelHeader className="flex items-center justify-between">
        <div>
          <PanelTitle className="text-emerald-300"><Clock3 size={18}/> تایمەر (Pomodoro)</PanelTitle>
          <PanelDesc>خێرا، پڕسکرین، و ڕێکخستن</PanelDesc>
        </div>
        <div className="flex items-center gap-2">
          {!isFs ? (
            <button onClick={enterFs} className="px-3 py-1.5 rounded-xl bg-zinc-800/60 ring-1 ring-zinc-700 text-zinc-100 inline-flex items-center gap-1" title="Full Screen">
              <Maximize2 size={16}/> پڕسکرین
            </button>
          ) : (
            <button onClick={exitFs} className="px-3 py-1.5 rounded-xl bg-zinc-800/60 ring-1 ring-zinc-700 text-zinc-100 inline-flex items-center gap-1" title="Exit Full Screen">
              <Minimize2 size={16}/> داخستن
            </button>
          )}
        </div>
      </PanelHeader>

      <PanelBody>
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          {/* Big timer */}
          <div className="flex items-center gap-4">
            <ProgressRing value={pct} size={ringSize} />
            <div>
              <div className={`text-zinc-200 ${timeText} font-extrabold tabular-nums`}>{minutes}:{secs}</div>
              <div className="text-xs text-zinc-400 mt-0.5">{mode === "work" ? "کاتێکی خوێندن" : "پشووی"} • {pct}%</div>

              {/* On-the-fly +/- 1 min */}
              <div className="mt-3 flex items-center gap-2">
                <button onClick={() => addTime(-60)} className="px-2 py-1.5 rounded-xl bg-zinc-800/60 ring-1 ring-zinc-700 text-zinc-100 inline-flex items-center gap-1">
                  <Minus size={16}/> 1 خولەک
                </button>
                <button onClick={() => addTime(+60)} className="px-2 py-1.5 rounded-xl bg-zinc-800/60 ring-1 ring-zinc-700 text-zinc-100 inline-flex items-center gap-1">
                  <Plus size={16}/> 1 خولەک
                </button>
              </div>

              {/* Start/Pause/Reset */}
              <div className="mt-2 flex items-center gap-2">
                {running ? (
                  <button onClick={pause} className="px-3 py-1.5 rounded-xl bg-zinc-800/60 ring-1 ring-zinc-700 text-zinc-100 inline-flex items-center gap-1">
                    <Pause size={16}/> وەستاندن
                  </button>
                ) : (
                  <button onClick={start} className="px-3 py-1.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white inline-flex items-center gap-1">
                    <PlayCircle size={16}/> دەستپێک
                  </button>
                )}
                <button onClick={reset} className="px-3 py-1.5 rounded-xl bg-zinc-800/60 ring-1 ring-zinc-700 text-zinc-100 inline-flex items-center gap-1">
                  <RotateCcw size={16}/> ڕێست
                </button>
              </div>
            </div>
          </div>

          {/* Presets (stack on mobile) */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl bg-zinc-900/60 ring-1 ring-zinc-800/70 p-3">
              <div className="text-xs text-zinc-400 mb-1">Work (خولەکی خوێندن)</div>
              <div className="flex items-center justify-between">
                <div className="text-zinc-200 text-xl font-bold">{workMins} min</div>
                <div className="flex items-center gap-1">
                  <button onClick={() => adjustPreset("work", -5)} className="px-2 py-1 rounded-lg bg-white/5 ring-1 ring-white/10"><Minus size={14}/></button>
                  <button onClick={() => adjustPreset("work", +5)} className="px-2 py-1 rounded-lg bg-white/5 ring-1 ring-white/10"><Plus size={14}/></button>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-zinc-900/60 ring-1 ring-zinc-800/70 p-3">
              <div className="text-xs text-zinc-400 mb-1">Break (پشووی)</div>
              <div className="flex items-center justify-between">
                <div className="text-zinc-200 text-xl font-bold">{breakMins} min</div>
                <div className="flex items-center gap-1">
                  <button onClick={() => adjustPreset("break", -5)} className="px-2 py-1 rounded-lg bg-white/5 ring-1 ring-white/10"><Minus size={14}/></button>
                  <button onClick={() => adjustPreset("break", +5)} className="px-2 py-1 rounded-lg bg-white/5 ring-1 ring-white/10"><Plus size={14}/></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PanelBody>
    </Panel>
  );
}

/* ---------------- Tasks, Notes, Subject Progress ---------------- */
function TasksWidget({ storageKey = "istudent_tasks" }) {
  const [tasks, setTasks] = useState([]); const [text, setText] = useState("");
  useEffect(() => { try { setTasks(JSON.parse(localStorage.getItem(storageKey) || "[]") || []); } catch {} }, [storageKey]);
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(tasks)); } catch {} }, [tasks, storageKey]);
  const addTask = () => { const t = text.trim(); if (!t) return; setTasks((prev) => [{ id: crypto.randomUUID(), title: t, done: false }, ...prev].slice(0, 8)); setText(""); };
  const toggle = (id) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const del = (id) => setTasks((prev) => prev.filter((t) => t.id !== id));
  return (
    <Panel>
      <PanelHeader><PanelTitle className="text-cyan-300"><Target size={18}/> ئەرکان</PanelTitle><PanelDesc>مانەوەی کارەکانت — هەرچی کەمتر، باشتر</PanelDesc></PanelHeader>
      <PanelBody>
        <div className="flex items-center gap-2 mb-3">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e)=> e.key === "Enter" && addTask()} className="flex-1 bg-zinc-900/60 ring-1 ring-zinc-800/70 rounded-xl px-3 py-2 text-sm text-zinc-200 outline-none" placeholder="ئەرکی نوێ بنووسە…" />
          <button onClick={addTask} className="px-3 py-2 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-sm inline-flex items-center gap-1"><Plus size={16}/> زیادکردن</button>
        </div>
        <ul className="space-y-2">
          {tasks.length === 0 && <li className="text-sm text-zinc-500">هیچ ئەرکێک نییە — یەکێک زیادبکە 🔥</li>}
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center justify-between rounded-xl px-3 py-2 bg-zinc-900/60 ring-1 ring-zinc-800/70">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} className="accent-emerald-400" />
                <span className={t.done ? "line-through text-zinc-500" : "text-zinc-200"}>{t.title}</span>
              </label>
              <button onClick={() => del(t.id)} className="text-zinc-500 hover:text-zinc-200" aria-label="سڕینەوە"><Trash2 size={16}/></button>
            </li>
          ))}
        </ul>
      </PanelBody>
    </Panel>
  );
}
function QuickNotes({ storageKey = "istudent_notes" }) {
  const [val, setVal] = useState("");
  useEffect(() => { try { setVal(localStorage.getItem(storageKey) || ""); } catch {} }, [storageKey]);
  useEffect(() => { const id = setTimeout(() => { try { localStorage.setItem(storageKey, val); } catch {} }, 300); return () => clearTimeout(id); }, [val, storageKey]);
  return (
    <Panel>
      <PanelHeader><PanelTitle className="text-amber-300"><BookOpenCheck size={18}/> تێبینی خێرا</PanelTitle><PanelDesc>شتێکی گرنگ بنووسە — خۆکارانە پارێزرێت</PanelDesc></PanelHeader>
      <PanelBody>
        <textarea value={val} onChange={(e) => setVal(e.target.value)} rows={7} className="w-full bg-zinc-900/60 ring-1 ring-zinc-800/70 rounded-2xl p-3 text-sm text-zinc-200 outline-none resize-y" placeholder="بنووسە: فۆرمولا، مات، ژمارەی وانە..." />
        <div className="mt-2 text-[12px] text-zinc-500">Autosaved ✓</div>
      </PanelBody>
    </Panel>
  );
}
function SubjectProgress({ items = [] }) {
  return (
    <Panel>
      <PanelHeader><PanelTitle className="text-emerald-300"><ChartBarStacked size={18}/> پێشکەوتنی بابەتەکان</PanelTitle><PanelDesc>بڕوانامەکانت نزیکە!</PanelDesc></PanelHeader>
      <PanelBody className="space-y-3">
        {items.map((s, i) => (
          <div key={i}>
            <div className="flex items-center justify-between text-sm">
              <div className="text-zinc-200">{s.name}</div>
              <div className="text-zinc-400">{s.value}%</div>
            </div>
            <div className="h-2 rounded-full bg-zinc-800/70 overflow-hidden ring-1 ring-zinc-700/60">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400" style={{ width: `${s.value}%` }} />
            </div>
          </div>
        ))}
      </PanelBody>
    </Panel>
  );
}

/* ---------------- Demo Data ---------------- */
const todaySubjects = [
  { time: "08:00", subject: "بیرکاری" },
  { time: "09:30", subject: "کوردی" },
  { time: "11:00", subject: "فیزیا" },
];
const exams = [
  { title: "بیرکاری", date: "٢٧ی ٥", days: 3 },
  { title: "زیندەزانی", date: "٢٧ی ٥", days: 3 },
  { title: "كیمیا", date: "٢٧ی ٥", days: 3 },
  { title: "كوردی", date: "٢٩ی ٥", days: 5 },
];
const notifications = ["کتێبی ماتماتیک زیادکرا", "ڤیدیۆی تازەی فیزیا زیادکرا"];
const suggestions = [
  { icon: Languages, color: "text-sky-300", text: "گرامەری ئینگلیزی", type: "گرامەر" },
  { icon: Volume2, color: "text-emerald-300", text: "دەنگەکان", type: "دەنگەکان" , url:"/sounds" },
  { icon: Lightbulb, color: "text-violet-300", text: "چۆن باشتر بخوێنین", type: "پەندەکان" },
];
const motivationalQuote = "هەرچەندە ڕێگا درێژ بێت، بەهێز بەرەوپێش دەچیت 🔥";
const adsData = [
  { icon: "telegram", title: "بیە بۆ گرووپی Telegram ـەوە", description: "کتێب، مەلزمە و پرسیارەکان — بەخۆڕایی.", link: "https://t.me/your_channel", bg: "bg-gradient-to-r from-sky-900/40 via-sky-800/25 to-cyan-900/40" },
  { icon: "instagram", title: "Follow لە Instagram بکە", description: "Motivation + Study Hacks هەموو ڕۆژ.", link: "https://instagram.com/your_page", bg: "bg-gradient-to-r from-pink-900/40 via-fuchsia-900/25 to-violet-900/40" },
  { icon: "telegram", title: "هەموو کتێبە نوێکان لێرە", description: "دانلودی خێرا و ڕێکخستن.", link: "/books", bg: "bg-gradient-to-r from-indigo-950/50 via-indigo-900/25 to-blue-950/50" },
];

/* ---------------- Page ---------------- */
export default function Dashboard() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  // status badges near the search trigger
  const [lsGrade, setLsGrade] = useState(null);
  const [lsTrack, setLsTrack] = useState("scientific");
  useEffect(() => {
    try {
      const g = Number(localStorage.getItem("grade") || "");
      setLsGrade(Number.isFinite(g) && g > 0 ? g : null);
      setLsTrack(localStorage.getItem("track") || "scientific");
    } catch {}
  }, []);

  const kpis = { minutes: 64, tasks: 5, done: 3, progress: 72 };
  const topSubjects = useMemo(() => ([
    { name: "بیرکاری", value: 78 },
    { name: "فیزیا", value: 64 },
    { name: "كیمیا", value: 52 },
    { name: "كوردی", value: 85 },
  ]), []);

  useEffect(() => {
    document.documentElement.style.colorScheme = "dark";
    document.body.style.backgroundColor = "#0b0d12";
    document.body.style.color = "#a1a1aa";
    return () => {
      document.documentElement.style.colorScheme = "";
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 -z-20 bg-[#0b0d12]" />
      <div className="fixed inset-0 -z-10 bg-gradient-to-tr from-zinc-950/90 via-zinc-950/60 to-indigo-950/80 animate-bg-gradient" />
      <style>{`
        @keyframes bg-gradient { 0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% } }
        .animate-bg-gradient { background-size: 200% 200%; animation: bg-gradient 25s ease infinite; }
      `}</style>

      {/* SEARCH MODAL */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative p-0 sm:p-4 min-h-screen grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-hidden"
        dir="rtl"
      >
        {/* ambient glows */}
        <Glow className="-z-10 -top-16 -left-10" color="#22d3ee" />
        <Glow className="-z-10 bottom-0 -right-10" color="#6366f1" size={420} />

        {/* HERO (FULL WIDTH) */}
        <div className="col-span-full -mx-4 sm:mx-0 relative z-10">
          <Panel className="p-6 sm:p-8 rounded-none sm:rounded-3xl">
            <div className="relative grid gap-6 lg:grid-cols-3 lg:items-center">
              <div className="lg:col-span-2">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-50 tracking-tight flex items-center gap-2">
                  <Sparkles width={28} height={28} className="text-sky-300" /> بەخێربێیت، پلانت لێرەیە
                </h1>
                <p className="mt-2 text-zinc-400 text-base">کتێب، مەلزمە، ڤیدیۆ و خشته‌ — هەمووی لە یەک شوێن.</p>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatPill icon={Clock3} label="خولەک خوێندن" value={kpis.minutes} />
                  <StatPill icon={CheckCircle2} label="ئەرك تەواو" value={`${kpis.done}/${kpis.tasks}`} accent="text-emerald-300" />
                  <StatPill
                    label="پێشکەوتن"
                    value={`${kpis.progress}%`}
                    accent="text-yellow-300"
                    icon={() => (
                      <motion.div initial={{ rotate: 0 }} animate={{ rotate: [0, -15, 15, -15, 15, 0] }} transition={{ delay: 0.5, duration: 0.6, type: "keyframes", ease: "easeInOut" }}>
                        <Trophy width={18} height={18} />
                      </motion.div>
                    )}
                  />
                </div>

                {/* Search trigger (opens modal) */}
                <div className="mt-5">
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="w-full text-right flex items-center gap-2 rounded-xl bg-zinc-900/60 ring-1 ring-zinc-800/70 px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-900/80"
                  >
                    <SearchIcon size={18} className="text-cyan-300" />
                    گەڕانی خێرا: ناوی وانە، کتێب، مامۆستا...
                  </button>

                  {/* status badges under the trigger */}
                  <div className="mt-2 flex items-center gap-2 text-[12px] text-zinc-400">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 ring-1 ring-white/10 inline-flex items-center gap-1">
                      <GraduationCap size={12}/> {lsGrade ? `پۆل ${lsGrade}` : "پۆل دیاری نەکراوە"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/5 ring-1 ring-white/10 inline-flex items-center gap-1">
                      📚 {trackLabelKurdish(lsTrack)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex items-center justify-center">
                <ProgressRing value={kpis.progress} size={120} />
              </div>
            </div>
          </Panel>
        </div>

        {/* PROMO SLIDER */}
        <CompactPromoSlider ads={adsData} />

        {/* QUICK ACTIONS */}
        <div className="col-span-full lg:col-span-1 xl:col-span-2 grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 z-10">
          <QuickAction icon={Book} text="کتێبەکان" sub="هەموو وانەکان" to="/students" />
          <QuickAction icon={NotebookText} text="مەلزمەکان" sub="خلاصە و تمرین" to="/students?t=booklet" />
          <QuickAction icon={Video} text="ڤیدیۆکان" sub="فیرکاری بەدەنگ" to="/students?t=videos" />
          <QuickAction icon={CalendarDays} text="خشتە" sub="کاتژمێری ئێمە" to="/schedule" />
        </div>

        {/* TIMER + TASKS */}
        <div className="col-span-full lg:col-span-2 xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 z-10">
          <PomodoroTimer />
          <TasksWidget />
        </div>

        {/* QUICK NOTES + SUBJECT PROGRESS */}
        <div className="col-span-full lg:col-span-2 xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 z-10">
          <QuickNotes />
          <SubjectProgress items={topSubjects} />
        </div>

        {/* TODAY + NOTIFICATIONS */}
        <Panel className="col-span-full sm:col-span-1 lg:col-span-1 xl:col-span-2 relative z-10">
          <div className="flex flex-col h-full">
            <PanelHeader className="flex-shrink-0">
              <PanelTitle><CalendarDays width={18} height={18} className="text-sky-300" /> خشتەی ئەمڕۆ</PanelTitle>
              <PanelDesc>کاتەکان و وانەکان</PanelDesc>
            </PanelHeader>
            <PanelBody className="flex-1">
              <ul className="space-y-4 text-sm">
                {todaySubjects.map((s, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
                    <span className="text-zinc-200 font-medium text-base">{s.subject}</span>
                    <span className="text-zinc-400 font-mono">{s.time}</span>
                  </motion.li>
                ))}
              </ul>
            </PanelBody>
            <PanelHeader className="flex-shrink-0 pt-0">
              <PanelTitle className="text-sky-300">
                <motion.div initial={{ scale: 1 }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 2 }}>
                  <Bell width={18} height={18} />
                </motion.div> ئاگادارییەکان
              </PanelTitle>
              <PanelDesc>نوێکارییەکان لەم هەفتەیە</PanelDesc>
            </PanelHeader>
            <PanelBody className="flex-1">
              {notifications?.length ? (
                <ul className="space-y-2 text-sm">
                  {notifications.map((n, i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} className="flex items-center justify-between rounded-xl px-3 py-2 bg-zinc-900/60 ring-1 ring-zinc-800/70">
                      <span className="text-zinc-200">{n}</span>
                      <span className="text-[10px] text-zinc-500">نوێ</span>
                    </motion.li>
                  ))}
                </ul>
              ) : (<p className="text-zinc-500 text-sm">هیچ ئاگادارییەک نییە.</p>)}
            </PanelBody>
          </div>
        </Panel>

        {/* EXAMS + SUGGESTIONS */}
        <div className="col-span-full lg:col-span-2 xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 z-10">
          <Panel>
            <PanelHeader>
              <PanelTitle className="text-rose-300"><GraduationCap width={18} height={18} /> تاقیکردنەوەی داهاتوو</PanelTitle>
              <PanelDesc>بەردەوام بخوێنە بۆ ئامادەکاری</PanelDesc>
            </PanelHeader>
            <PanelBody className="space-y-3">
              {exams.map((e, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3 bg-zinc-900/60 ring-1 ring-zinc-800/70">
                  <div className="text-sm text-zinc-100 font-medium flex items-center gap-2">
                    <GraduationCap width={18} height={18} className="text-rose-300" /> {e.title}
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-zinc-400">{e.date}</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-900/20 text-rose-300 ring-1 ring-rose-900/30">{e.days ?? "?"} ڕۆژ ماوە</span>
                  </div>
                </div>
              ))}
            </PanelBody>
          </Panel>

          <Panel className="bg-gradient-to-r from-zinc-950/70 via-zinc-950/70 to-zinc-950/70">
            <PanelHeader>
              <PanelTitle>🧠 پێشنیارەکانی فێرکاری</PanelTitle>
              <PanelDesc>بابەتە گرنگەکان بۆ فێربوونی باشتر</PanelDesc>
            </PanelHeader>
            <PanelBody>
              <div className="space-y-3">
                {suggestions.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.a key={i} href={s.url} whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }} className="block rounded-2xl p-4 bg-zinc-900/70 ring-1 ring-zinc-800/70 transition-transform duration-300">
                      <div className="flex items-center gap-3">
                        <Icon width={26} height={26} className={s.color} />
                        <div>
                          <div className="text-zinc-100 font-semibold">{s.text}</div>
                          <div className="text-xs text-zinc-400 mt-0.5">{s.type}</div>
                        </div>
                      </div>
                    </motion.a>
                  );
                })}
              </div>
            </PanelBody>
          </Panel>
        </div>

        {/* QUOTE */}
        <Panel className="col-span-full sm:col-span-1 lg:col-span-2 xl:col-span-2 relative z-10 bg-gradient-to-b from-zinc-900/70 to-zinc-950/70">
          <PanelHeader><PanelTitle className="text-amber-300"><Lightbulb width={18} height={18} /> هێمای ئەمڕۆ</PanelTitle><PanelDesc>هۆسەرۆکی لەخۆگر</PanelDesc></PanelHeader>
          <PanelBody><p className="text-lg text-zinc-200 leading-7 font-medium">{motivationalQuote}</p></PanelBody>
          <Spotlight className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />
        </Panel>

        {/* MARQUEE */}
        <div className="col-span-full z-10">
          <Marquee items={["لیستەی کتێبە نوێکان", "وانەی فیزیا لەدوای نیوەڕ", "هاوکاری لە گرووپی خوێندن"]} />
        </div>
      </motion.div>
    </>
  );
}
