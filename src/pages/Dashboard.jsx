// src/pages/Dashboard.jsx — Elite Hero Edition (RTL, Dark)
// Changes requested:
// - Top hero ("mook") connects to topbar (no top padding), only bottom radius
// - In-hero streak (with flame icon) + quote
// - Promo slider directly under hero
// - Below: Quick buttons (books, booklet, videos, schedule)
// - Below: Subjects
// - Below: Cool Course Playlist showcasing teachers' courses
// - Removed study heatmap
// - Pomodoro can increase/decrease session minutes
// - Suggestions at the very bottom
// - All buttons navigate to real routes
//
// Tech: TailwindCSS + framer-motion + lucide-react + React Router

import React, { useEffect, useMemo, useRef, useState, forwardRef, memo } from "react";
import { motion, AnimatePresence, useMotionTemplate, useMotionValue, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  // UI / General
  ChevronRight, X,
  // Quick actions / dashboard
  Book, NotebookText, Video, CalendarDays, Lightbulb, Volume2,
  // Subjects icons
  Calculator, Atom, FlaskConical, Microscope, Languages, Pen, BookOpen,
  // Status
  Star, Heart, CheckCircle2, Clock3, Trophy, Search as SearchIcon,
  // New icons
  Flame, Award, Crown, Medal, Play, Users
} from "lucide-react";

/* -------------------------------- Utilities -------------------------------- */
function useDebounce(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => { const id = setTimeout(() => setV(value), delay); return () => clearTimeout(id); }, [value, delay]);
  return v;
}
function useLocalJson(key, initial) {
  const [val, setVal] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || "null") ?? initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }, [key, val]);
  return [val, setVal];
}
const todayStr = () => new Date().toISOString().slice(0,10);
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function emit(name, detail) { window.dispatchEvent(new CustomEvent(name, { detail })); }
function initials(name) {
  const parts = String(name||"").trim().split(/\s+/).slice(0,2);
  return parts.map(p=>p[0]?.toUpperCase()||"").join("")
}

/* ------------------------------- Base Panels ------------------------------- */
const Glow = memo(function Glow({ className = "", size = 340, color = "#22d3ee" }) {
  return (
    <div aria-hidden className={"pointer-events-none absolute blur-3xl opacity-30 " + className} style={{ width: size, height: size, background: `radial-gradient(50% 50% at 50% 50%, ${color}33 0%, transparent 70%)` }} />
  );
});
const Panel = forwardRef(function PanelBase({ className = "", children }, ref) {
  return (
    <div ref={ref} className={"rounded-3xl bg-zinc-900/70 backdrop-blur-3xl ring-1 ring-zinc-800/70 shadow-[0_10px_24px_rgba(0,0,0,0.35)] relative overflow-hidden " + className}>
      <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(circle_at_top_right,black,transparent_70%)]" />
      {children}
    </div>
  );
});
const PanelHeader = ({ children, className = "" }) => <div className={"px-4 sm:px-5 pt-4 sm:pt-5 pb-3 " + className}>{children}</div>;
const PanelTitle = ({ children, className = "" }) => <h3 className={"text-zinc-100 font-semibold flex items-center gap-2 " + className}>{children}</h3>;
const PanelDesc = ({ children, className = "" }) => <p className={"text-sm text-zinc-400 " + className}>{children}</p>;
const PanelBody = ({ children, className = "" }) => <div className={"px-4 sm:px-5 pb-5 " + className}>{children}</div>;

/* --------------------------------- Widgets -------------------------------- */
const ProgressRing = memo(function ProgressRing({ value = 72, size = 120, fg = "#22d3ee", bg = "#0b0b0b" }) {
  const v = clamp(value, 0, 100);
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
});

function QuickAction({ icon: Icon, text, sub, to = "/students" }) {
  const shouldReduce = useReducedMotion();
  const mouseX = useMotionValue(0), mouseY = useMotionValue(0);
  const background = useMotionTemplate`radial-gradient(160px at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.06) 0%, transparent 80%)`;
  const navigate = useNavigate();
  return (
    <motion.button
      type="button"
      whileHover={shouldReduce ? {} : { y: -6, boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}
      whileTap={shouldReduce ? {} : { scale: 0.96 }}
      onMouseMove={(e) => { const { left, top } = e.currentTarget.getBoundingClientRect(); mouseX.set(e.clientX - left); mouseY.set(e.clientY - top); }}
      onClick={() => navigate(to)}
      className="w-full text-right flex items-center justify-between rounded-3xl p-3.5 sm:p-4 bg-zinc-900/60 transition-all duration-300 backdrop-blur-sm ring-1 ring-zinc-800/70 shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
      style={shouldReduce ? undefined : { background }}
      aria-label={text}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="grid place-items-center rounded-2xl p-2.5 sm:p-3 bg-gradient-to-tr from-sky-600/25 to-indigo-600/25 ring-1 ring-sky-500/25">
          <Icon width={22} height={22} className="text-sky-300" />
        </div>
        <div className="text-right">
          <div className="text-zinc-100 text-[13px] sm:text-base font-semibold">{text}</div>
          {sub && <div className="text-[11px] sm:text-sm text-zinc-400">{sub}</div>}
        </div>
      </div>
      <ChevronRight width={18} height={18} className="text-zinc-500" />
    </motion.button>
  );
}

/* ------------------------- Compact Promo Slider (NEW) ------------------------- */
const CompactPromoSlider = memo(function CompactPromoSlider({ ads = [] }) {
  const [idx, setIdx] = useState(0);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    if (!ads.length || shouldReduce) return;
    const id = setInterval(() => setIdx((p) => (p + 1) % ads.length), 5000);
    return () => clearInterval(id);
  }, [ads.length, shouldReduce]);

  if (!ads.length) return null;
  const ad = ads[idx];

  return (
    <div className="col-span-full z-10" dir="rtl">
      <div className="relative h-24 sm:h-28 rounded-3xl overflow-hidden bg-zinc-900/70 backdrop-blur-3xl ring-1 ring-zinc-800/70 shadow-[inset_0_2px_10px_rgba(0,0,0,0.35)]">
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "12px 12px" }} />
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={shouldReduce ? false : { opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={shouldReduce ? { opacity: 0 } : { opacity: 0, x: -80 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {/* gradient background from ad.bg class */}
            <div className={`absolute inset-0 ${ad.bg || "bg-gradient-to-r from-indigo-900/40 via-indigo-800/25 to-blue-900/40"}`} />
            <div className="relative h-full px-4 sm:px-8 flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <span className="grid place-items-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-zinc-900/70 ring-1 ring-zinc-800/70 shrink-0">
                  <Trophy className="text-zinc-100" size={20} />
                </span>
                <div className="text-right min-w-0">
                  <h3 className="text-zinc-100 font-extrabold text-sm sm:text-lg leading-tight truncate">
                    {ad.title}
                  </h3>
                  <p className="text-zinc-300 text-[11px] sm:text-sm truncate">
                    {ad.description}
                  </p>
                </div>
              </div>
              {ad.link && (
                <a
                  href={ad.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm font-bold bg-zinc-800/60 ring-1 ring-zinc-700/60 text-zinc-100 hover:bg-zinc-800/80 transition"
                >
                  {ad.cta || "بینینی زیاتر"}
                </a>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {ads.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-4 bg-zinc-200" : "w-2 bg-zinc-400/50"}`}
              aria-label={`سلاید ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

/* --------------------------------- Streaks -------------------------------- */
function calcStreakAfter(lastISO) {
  const last = lastISO ? new Date(lastISO) : null;
  const today = new Date();
  const d0 = new Date(today.toISOString().slice(0,10));
  const d1 = last ? new Date(last.toISOString().slice(0,10)) : null;
  if (!d1) return { isNewDay: true, delta: Infinity };
  const ms = d0 - d1; const days = Math.round(ms / 86400000);
  return { isNewDay: days !== 0, delta: days };
}
function addMinutesForToday(mins) {
  const key = "minutes_by_day";
  const today = todayStr();
  let map = {};
  try { map = JSON.parse(localStorage.getItem(key) || "{}"); } catch {}
  map[today] = (map[today] || 0) + mins;
  try { localStorage.setItem(key, JSON.stringify(map)); } catch {}
  const total = Number(localStorage.getItem("minutes_total") || "0") + mins;
  localStorage.setItem("minutes_total", String(total));
  const xp = Number(localStorage.getItem("xp_total") || "0") + mins * 5; // 5 XP per minute
  localStorage.setItem("xp_total", String(xp));
  // streak ping
  localStorage.setItem("streak_last", today);
  emit("STUDY_ACTIVITY", { minutes: mins, today });
}
function useStreaks() {
  const [current, setCurrent] = useLocalJson("streak_current", 0);
  const [longest, setLongest] = useLocalJson("streak_longest", 0);
  const [last, setLast] = useLocalJson("streak_last", null);

  useEffect(() => {
    const onActivity = () => {
      const today = todayStr();
      if (!last) { setCurrent(1); setLongest(1); localStorage.setItem("streak_last", today); return; }
      const { delta } = calcStreakAfter(last);
      if (delta === 0) { localStorage.setItem("streak_last", today); return; } // already counted today
      if (delta === 1) { const nxt = current + 1; setCurrent(nxt); setLongest(Math.max(longest, nxt)); localStorage.setItem("streak_last", today); return; }
      if (delta > 1 || delta < -1) { setCurrent(1); localStorage.setItem("streak_last", today); setLongest(Math.max(longest, 1)); }
    };
    window.addEventListener("STUDY_ACTIVITY", onActivity);
    return () => window.removeEventListener("STUDY_ACTIVITY", onActivity);
  }, [current, longest, last, setCurrent, setLast, setLongest]);

  const manualCheckIn = () => { addMinutesForToday(5); };
  return { current, longest, last, manualCheckIn };
}

/* ------------------------------ Subjects Row ------------------------------ */
const SUBJECTS_ROW = [
  { key: "math", label: "بیرکاری", en: "Math", icon: Calculator, gradient: "from-cyan-600/25 to-cyan-500/10" },
  { key: "physics", label: "فیزیا", en: "Physics", icon: Atom, gradient: "from-indigo-600/25 to-indigo-500/10" },
  { key: "chemistry", label: "كیمیا", en: "Chemistry", icon: FlaskConical, gradient: "from-emerald-600/25 to-emerald-500/10" },
  { key: "biology", label: "زیندەزانی", en: "Biology", icon: Microscope, gradient: "from-pink-600/25 to-rose-500/10" },
  { key: "english", label: "ئینگلیزی", en: "English", icon: Languages, gradient: "from-yellow-600/25 to-amber-500/10" },
  { key: "kurdish", label: "كوردی", en: "Kurdish", icon: Pen, gradient: "from-fuchsia-600/25 to-purple-500/10" },
  { key: "arabic", label: "عەرەبی", en: "Arabic", icon: BookOpen, gradient: "from-sky-600/25 to-blue-500/10" },
];

function SubjectCard({ s, onClick, fav, toggleFav }) {
  const Icon = s.icon;
  return (
    <motion.button whileHover={{ y: -6 }} whileTap={{ scale: 0.97 }} onClick={onClick} className="relative shrink-0 w-[160px] sm:w-[180px] lg:w-[200px] text-right rounded-2xl p-4 ring-1 ring-zinc-800/70 bg-zinc-900/60 backdrop-blur-sm">
      <div className={`absolute -right-8 -top-16 h-40 w-40 rounded-full blur-2xl opacity-30 bg-gradient-to-tr ${s.gradient}`} />
      <div className="relative flex items-start justify-between gap-2">
        <div className="grid place-items-center w-10 h-10 rounded-xl bg-white/5 ring-1 ring-white/10">
          <Icon size={20} className="text-zinc-100" />
        </div>
        <button type="button" onClick={(e) => { e.stopPropagation(); toggleFav?.(s.key); }} className={`p-1.5 rounded-lg ring-1 ring-white/10 ${fav ? "bg-amber-500/20 text-amber-300" : "bg-white/5 text-zinc-300"}`} title={fav ? "لابردنی دڵخواز" : "دڵخوازکردن"} aria-label="favorite">
          {fav ? <Star size={16} /> : <Heart size={16} />}
        </button>
      </div>
      <div className="relative mt-4">
        <div className="text-zinc-100 font-bold text-base sm:text-lg leading-tight">{s.label}</div>
        <div className="text-[11px] text-zinc-400">{s.en}</div>
      </div>
      <div className="relative mt-4 flex items-center justify-between">
        <span className="text-[11px] px-2 py-0.5 rounded-full bg:white/5 ring-1 ring-white/10 text-zinc-300 bg-white/5">مامۆستایان</span>
        <ChevronRight size={16} className="text-zinc-500" />
      </div>
    </motion.button>
  );
}
function SubjectsRow() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useLocalJson("fav_subjects", []);
  const [recents, setRecents] = useLocalJson("recent_teachers", []);

  const grade = (() => { const g = Number(localStorage.getItem("grade") || ""); return Number.isFinite(g) && g > 0 ? g : null; })();
  const track = localStorage.getItem("track") || "scientific";

  const goTeachers = (s) => {
    setRecents((old) => { const next = [s.key, ...old.filter((k) => k !== s.key)].slice(0, 6); return next; });
    const params = new URLSearchParams();
    params.set("subject", s.label);
    params.set("subject_key", s.key);
    if (grade) params.set("grade", String(grade));
    if (track) params.set("track", String(track));
    navigate(`/teachers?${params.toString()}`);
  };

  const toggleFav = (key) => setFavorites((old) => (old.includes(key) ? old.filter((k) => k !== key) : [key, ...old]).slice(0, 12));

  const items = [...SUBJECTS_ROW].sort((a, b) => {
    const fa = favorites.includes(a.key) ? 1 : 0; const fb = favorites.includes(b.key) ? 1 : 0;
    if (fb !== fa) return fb - fa; return a.label.localeCompare(b.label, "ar");
  });
  const recentItems = recents.map((k) => SUBJECTS_ROW.find((x) => x.key === k)).filter(Boolean);

  return (
    <Panel className="col-span-full z-10">
      <PanelHeader>
        <PanelTitle className="text-sky-300">📚 بابەتەکان (سەرەکی)</PanelTitle>
        <PanelDesc>7 بابەت — کلیک بکە بۆ لاپەڕەی مامۆستایان</PanelDesc>
      </PanelHeader>
      <PanelBody className="space-y-4">
        {recentItems.length > 0 && (
          <div>
            <div className="text-[12px] text-zinc-400 mb-2">دوایین سەردانکردن</div>
            <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory">
              {recentItems.map((s) => (
                <button key={s.key} onClick={() => goTeachers(s)} className="snap-start shrink-0 px-3 py-1.5 rounded-xl bg-white/5 ring-1 ring-white/10 text-[12px] text-zinc-200 hover:bg-white/10">{s.label}</button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory" dir="rtl">
          {items.map((s) => (
            <div key={s.key} className="snap-start">
              <SubjectCard s={s} onClick={() => goTeachers(s)} fav={favorites.includes(s.key)} toggleFav={toggleFav} />
            </div>
          ))}
        </div>
      </PanelBody>
    </Panel>
  );
}

/* -------------------------- Pomodoro (tunable minutes) -------------------------- */
function PomodoroTimer() {
  const [baseMinutes, setBaseMinutes] = useLocalJson("pomodoro_minutes", 25);
  const [seconds, setSeconds] = useLocalJson("pomodoro_seconds", baseMinutes * 60);
  const [running, setRunning] = useLocalJson("pomodoro_running", false);

  // if baseMinutes changes and not running, sync seconds
  useEffect(() => { if (!running) setSeconds(baseMinutes * 60); }, [baseMinutes]); // eslint-disable-line

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => {
      if (s <= 1) {
        emit("POMODORO_DONE", { minutes: baseMinutes });
        addMinutesForToday(baseMinutes);
        return baseMinutes * 60;
      }
      return s - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [running, setSeconds, baseMinutes]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const adjust = (d) => {
    if (running) return;
    const next = clamp(baseMinutes + d, 5, 120);
    setBaseMinutes(next);
    setSeconds(next * 60);
  };

  return (
    <Panel className="z-10">
      <PanelHeader>
        <PanelTitle className="text-emerald-300"><Clock3 size={18} /> پۆمۆدۆرۆ</PanelTitle>
        <PanelDesc>كاتی یەك خولەك: دەستکاری بكە پێش دەستپێك</PanelDesc>
      </PanelHeader>
      <PanelBody>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button onClick={() => adjust(-5)} disabled={running} className={"px-3 py-1.5 rounded-xl ring-1 ring-white/10 " + (running ? "bg-zinc-800/40 text-zinc-500" : "bg-white/5 text-zinc-100")}>-5</button>
            <div className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tabular-nums">{mm}:{ss}</div>
            <button onClick={() => adjust(+5)} disabled={running} className={"px-3 py-1.5 rounded-xl ring-1 ring-white/10 " + (running ? "bg-zinc-800/40 text-zinc-500" : "bg-white/5 text-zinc-100")}>+5</button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setRunning((v) => !v)} className="px-3 py-1.5 rounded-xl bg-white/5 ring-1 ring-white/10 text-zinc-100">{running ? "واستاندن" : "دەستپێکردن"}</button>
            <button onClick={() => setSeconds(baseMinutes * 60)} className="px-3 py-1.5 rounded-xl bg-white/5 ring-1 ring-white/10 text-zinc-100">ڕێست</button>
            <button onClick={() => { addMinutesForToday(baseMinutes); emit("POMODORO_DONE", { minutes: baseMinutes }); }} className="px-3 py-1.5 rounded-xl bg-emerald-600/20 ring-1 ring-emerald-500/20 text-emerald-200">✓ تەواو</button>
          </div>
        </div>
      </PanelBody>
    </Panel>
  );
}

/* ----------------------------- Course Playlist ----------------------------- */
const teacherCourses = [
  { id: "algebra-crash", title: "Algebra Crash", subject: "بیرکاری", subject_key: "math", teacher: "Mr. Ali", lessons: 24, rating: 4.8, students: 320 },
  { id: "physics-speed", title: "Speed & Motion", subject: "فیزیا", subject_key: "physics", teacher: "Dr. Sara", lessons: 18, rating: 4.9, students: 410 },
  { id: "chem-react", title: "Reactions 101", subject: "كیمیا", subject_key: "chemistry", teacher: "Prof. Ahmed", lessons: 20, rating: 4.7, students: 275 },
  { id: "bio-cells", title: "Cells & Life", subject: "زیندەزانی", subject_key: "biology", teacher: "Miss Rawan", lessons: 22, rating: 4.6, students: 350 },
  { id: "eng-speak", title: "Speak Confidently", subject: "ئینگلیزی", subject_key: "english", teacher: "Mr. John", lessons: 16, rating: 4.8, students: 290 },
  { id: "arabic-gram", title: "نحو سريع", subject: "عەرەبی", subject_key: "arabic", teacher: "أ. مصطفى", lessons: 14, rating: 4.5, students: 210 },
];

function CourseCard({ c }) {
  const navigate = useNavigate();
  const goTeacher = () => {
    const p = new URLSearchParams();
    p.set("teacher", c.teacher);
    p.set("subject", c.subject);
    p.set("subject_key", c.subject_key);
    navigate(`/teachers?${p.toString()}`);
  };
  const goCourse = () => navigate(`/courses/${c.id}`);

  return (
    <motion.div whileHover={{ y: -6 }} className="w-[260px] shrink-0 rounded-2xl ring-1 ring-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl grid place-items-center ring-1 ring-white/10 bg-gradient-to-tr from-sky-800/30 to-indigo-800/20 text-zinc-100 font-bold">
            {initials(c.teacher)}
          </div>
          <div className="min-w-0">
            <div className="text-zinc-100 text-sm font-semibold truncate">{c.teacher}</div>
            <div className="text-[11px] text-zinc-400">{c.subject}</div>
          </div>
        </div>
        <div className="px-2 py-1 text-[11px] rounded-lg bg-zinc-900/70 ring-1 ring-zinc-800/70 text-zinc-300">{c.lessons} وانە</div>
      </div>

      <div className="mt-3 text-zinc-100 font-bold truncate">{c.title}</div>

      <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400">
        <div className="flex items-center gap-1"><Star size={14} className="text-amber-300" /> {c.rating}</div>
        <div className="flex items-center gap-1"><Users size={14} /> {c.students}</div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button onClick={goCourse} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-200 ring-1 ring-emerald-500/20 text-sm">
          <Play size={16}/> دەستپێك
        </button>
        <button onClick={goTeacher} className="px-3 py-1.5 rounded-xl bg-zinc-800/70 text-zinc-100 ring-1 ring-zinc-700/70 text-sm">
          مامۆستا
        </button>
      </div>
    </motion.div>
  );
}

function CoursePlaylist() {
  return (
    <Panel className="col-span-full z-10">
      <PanelHeader>
        <PanelTitle className="text-violet-300">لیستی کۆرسەکان</PanelTitle>
        <PanelDesc>مامۆستایان کۆرسی تایبەتیان هەیە — دەستبکە بە خوێندن</PanelDesc>
      </PanelHeader>
      <PanelBody>
        <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory">
          {teacherCourses.map((c) => (
            <div key={c.id} className="snap-start">
              <CourseCard c={c} />
            </div>
          ))}
        </div>
      </PanelBody>
    </Panel>
  );
}

/* ------------------------------ Simple Panels ------------------------------ */
function TodaySchedule({ rows }) {
  return (
    <Panel className="z-10">
      <PanelHeader>
        <PanelTitle className="text-cyan-300">خشتەی ئەمڕۆ</PanelTitle>
        <PanelDesc>کات و بابەت</PanelDesc>
      </PanelHeader>
      <PanelBody>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 ring-1 ring-white/10">
              <div className="text-zinc-200 text-sm">{r.subject}</div>
              <div className="text-zinc-400 text-xs">{r.time}</div>
            </div>
          ))}
        </div>
      </PanelBody>
    </Panel>
  );
}
function NotificationsPanel({ items }) {
  return (
    <Panel className="z-10">
      <PanelHeader>
        <PanelTitle className="text-rose-300">ئاگادارییەکان</PanelTitle>
        <PanelDesc>هەواڵ و نوێکاری</PanelDesc>
      </PanelHeader>
      <PanelBody>
        <div className="space-y-2">
          {items.map((t, i) => (
            <div key={i} className="px-3 py-2 rounded-xl bg-white/5 ring-1 ring-white/10 text-sm text-zinc-200">{t}</div>
          ))}
        </div>
      </PanelBody>
    </Panel>
  );
}
function ExamsPanel({ items }) {
  return (
    <Panel className="z-10">
      <PanelHeader>
        <PanelTitle className="text-emerald-300">تاقیکردنەوەکان</PanelTitle>
        <PanelDesc>نزیکترین</PanelDesc>
      </PanelHeader>
      <PanelBody>
        <div className="space-y-2">
          {items.map((e, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 ring-1 ring-white/10">
              <div className="text-zinc-200 text-sm">{e.title}</div>
              <div className="text-zinc-400 text-xs">{e.date}</div>
            </div>
          ))}
        </div>
      </PanelBody>
    </Panel>
  );
}
function SuggestionsPanel({ items }) {
  return (
    <Panel className="col-span-full z-10">
      <PanelHeader>
        <PanelTitle className="text-indigo-300">پێشنیارەکان</PanelTitle>
        <PanelDesc>شتە گرنگەکان بۆ ڕاهێنان</PanelDesc>
      </PanelHeader>
      <PanelBody>
        <div className="flex gap-2 overflow-x-auto">
          {items.map((s, i) => (
            <div key={i} className="shrink-0 w-[220px] rounded-2xl p-4 ring-1 ring-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <s.icon className={s.color} size={18} />
                <div className="text-zinc-100 text-sm font-semibold truncate">{s.text}</div>
              </div>
              {s.url && (
                <a href={s.url} className="inline-block mt-3 text-xs px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-100 ring-1 ring-zinc-700">کردنەوە</a>
              )}
            </div>
          ))}
        </div>
      </PanelBody>
    </Panel>
  );
}
function Marquee({ items = [] }) {
  const shouldReduce = useReducedMotion();
  if (!items?.length) return null;
  return (
    <div className="relative overflow-hidden rounded-2xl ring-1 ring-zinc-800/70 bg-zinc-900/60">
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "12px 12px" }} />
      <div className={"flex gap-3 sm:gap-6 whitespace-nowrap p-2.5 sm:p-3 will-change-transform " + (shouldReduce ? "" : "animate-[scroll_22s_linear_infinite]")}>
        {items.concat(items).map((t, i) => (
          <div key={i} className="px-2.5 sm:px-3 py-1 rounded-xl bg-zinc-900/70 ring-1 ring-zinc-800/70 text-[12px] sm:text-sm text-zinc-300">{t}</div>
        ))}
      </div>
      <style>{`@keyframes scroll { from{ transform: translateX(0)} to{ transform: translateX(-50%) } }`}</style>
    </div>
  );
}

/* -------------------------------- Demo Data -------------------------------- */
const todaySubjects = [ { time: "08:00", subject: "بیرکاری" }, { time: "09:30", subject: "كوردی" }, { time: "11:00", subject: "فیزیا" } ];
const exams = [ { title: "بیرکاری", date: "٢٧ی ٥" }, { title: "زیندەزانی", date: "٢٧ی ٥" }, { title: "كیمیا", date: "٢٧ی ٥" }, { title: "كوردی", date: "٢٩ی ٥" } ];
const notifications = ["کتێبی ماتماتیک زیادکرا", "ڤیدیۆی تازەی فیزیا زیادکرا"];
const suggestions = [ { icon: Languages, color: "text-sky-300", text: "گرامەری ئینگلیزی", url: "/grammars/english" }, { icon: Volume2, color: "text-emerald-300", text: "دەنگەکان", url: "/sounds" }, { icon: Lightbulb, color: "text-violet-300", text: "چۆن باشتر بخوێنین", url: "/tips" } ];
const motivationalQuote = "هەرچەندە ڕێگا درێژ بێت، بەهێز بەرەوپێش دەچیت 🔥";
const adsData = [
  { title: "بیە بۆ گرووپی Telegram ـەوە", description: "کتێب، مەلزمە و پرسیارەکان — بەخۆڕایی.", link: "https://t.me/your_channel", bg: "bg-gradient-to-r from-sky-900/40 via-sky-800/25 to-cyan-900/40" },
  { title: "Follow لە Instagram بکە", description: "Motivation + Study Hacks هەموو ڕۆژ.", link: "https://instagram.com/your_page", bg: "bg-gradient-to-r from-pink-900/40 via-fuchsia-900/25 to-violet-900/40" },
  { title: "هەموو کتێبە نوێکان لێرە", description: "دانلودی خێرا و ڕێکخستن.", link: "/books", bg: "bg-gradient-to-r from-indigo-950/50 via-indigo-900/25 to-blue-950/50" },
];

/* ---------------------------------- Top Hero ---------------------------------- */
function TopHero() {
  const navigate = useNavigate();
  const shouldReduce = useReducedMotion();
  const { current } = useStreaks();

  return (
    <div className="col-span-full relative z-10 overflow-hidden rounded-b-[28px] ring-1 ring-zinc-800/70 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80">
      {/* No top padding: connects to topbar */}
      <div className="absolute inset-0 -z-10">
        <Glow className="-top-20 -right-10" color="#22d3ee" />
        <Glow className="bottom-0 -left-8" color="#8b5cf6" size={420} />
      </div>

      <div className="px-4 sm:px-6 pt-4 pb-5">
        <div className="flex items-center justify-between gap-4" dir="rtl">
          <div className="min-w-0">
            {/* <div className="text-zinc-300 text-sm">خوێندکارە جوانەکان 😎</div> */}
            <div className="text-zinc-100 text-2xl sm:text-3xl font-extrabold leading-tight truncate">بەخێربێیتەوه‌ </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-orange-600/15 ring-1 ring-orange-500/20 text-orange-200">
              <Flame size={16} />
              <span className="font-bold">ستیریك: {current || 0}</span>
            </div>
            <button onClick={() => navigate('/students')} className="px-3 py-2 rounded-xl bg-zinc-800/70 ring-1 ring-zinc-700/70 text-sm text-zinc-100">خوێندکاران</button>
            <button onClick={() => navigate('/teachers')} className="px-3 py-2 rounded-xl bg-zinc-800/70 ring-1 ring-zinc-700/70 text-sm text-zinc-100">مامۆستایان</button>
          </div>
        </div>

        <p className="mt-3 text-zinc-200 leading-7 font-medium text-base sm:text-lg">{motivationalQuote}</p>

        <div className="mt-3 flex items-center gap-2">
          <button onClick={() => navigate('/search')} className="px-3 py-2 rounded-xl bg-zinc-900/70 ring-1 ring-zinc-800/70 text-sm text-zinc-100 flex items-center gap-2">
            <SearchIcon size={16}/> گەڕان
          </button>
          <button onClick={() => navigate('/schedule')} className="px-3 py-2 rounded-xl bg-zinc-900/70 ring-1 ring-zinc-800/70 text-sm text-zinc-100">
            خشتەی ئەمڕۆ
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Page ---------------------------------- */
export default function Dashboard() {
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    document.documentElement.style.colorScheme = "dark";
    document.body.style.backgroundColor = "#0b0d12";
    document.body.style.color = "#a1a1aa";
    return () => { document.documentElement.style.colorScheme = ""; document.body.style.backgroundColor = ""; document.body.style.color = ""; };
  }, []);

  return (
    <>
      <div className="fixed inset-0 -z-20 bg-[#0b0d12]" />
      <div className="fixed inset-0 -z-10 bg-gradient-to-tr from-zinc-950/90 via-zinc-950/60 to-indigo-950/80 animate-bg-gradient" />
      <style>{`
        @keyframes bg-gradient { 0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% } }
        .animate-bg-gradient { background-size: 200% 200%; animation: bg-gradient 25s ease infinite; }
        @media (prefers-reduced-motion: reduce) { .animate-bg-gradient { animation: none !important; } }
      `}</style>

      {/* GRID: no top padding so hero touches topbar */}
      <motion.div initial={shouldReduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="relative pt-0 px-0 sm:px-4 min-h-screen grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 overflow-hidden pb-[calc(env(safe-area-inset-bottom,0px)+12px)]" dir="rtl">
        {/* HERO (connected to topbar) */}
        <TopHero />

        {/* REKLAM directly under hero */}
        <CompactPromoSlider ads={adsData} />

        {/* BUTTONS row */}
        <div className="col-span-full lg:col-span-1 xl:grid-cols-2 grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3.5 sm:gap-4 z-10">
          <QuickAction icon={Book} text="کتێبەکان" to="/students?t=books" />
          <QuickAction icon={NotebookText} text="مەلزمەکان" to="/students?t=booklet" />
          <QuickAction icon={Video} text="ڤیدیۆکان" to="/students?t=videos" />
          <QuickAction icon={CalendarDays} text="خشتە" to="/schedule" />
        </div>

        {/* SUBJECTS */}
        <SubjectsRow />

        {/* COURSE PLAYLIST */}
        <CoursePlaylist />

        {/* CORE WIDGETS (keep the rest) */}
        <PomodoroTimer />
        <TasksWidget />
        <QuickNotes />
        <SubjectProgress items={[ { name: "بیرکاری", value: 78 }, { name: "فیزیا", value: 64 }, { name: "كیمیا", value: 52 }, { name: "كوردی", value: 85 } ]} />
        <TodaySchedule rows={todaySubjects} />
        <NotificationsPanel items={notifications} />
        <ExamsPanel items={exams} />

        {/* SUGGESTIONS at very bottom */}
        <SuggestionsPanel items={suggestions} />

        {/* FOOTER MARQUEE */}
        <div className="col-span-full z-10">
          <Marquee items={["لیستەی کتێبە نوێکان", "وانەی فیزیا لەدوای نیوەڕ", "هاوکاری لە گرووپی خوێندن"]} />
        </div>
      </motion.div>
    </>
  );
}

/* ----------------------------- Search Modal (optional route) ---------------------------- */
// If you already have a global search route, you can remove this modal.
// Kept here for completeness of earlier builds.
function SearchModal({ open, onClose }) { return null; } // no-op

/* ------------------------------- Tasks & Notes ------------------------------ */
function TasksWidget() {
  const [tasks, setTasks] = useLocalJson("tasks_widget", []);
  const [txt, setTxt] = useState("");
  const add = () => { const t = txt.trim(); if (!t) return; setTasks([{ id: crypto.randomUUID(), name: t, done: false }, ...tasks]); setTxt(""); };
  const toggle = (id) => setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const del = (id) => setTasks(tasks.filter((t) => t.id !== id));
  const doneCount = tasks.filter((t) => t.done).length;
  return (
    <Panel className="z-10">
      <PanelHeader>
        <PanelTitle className="text-sky-300"><CheckCircle2 size={18} /> ئەرکەکان</PanelTitle>
        <PanelDesc>{doneCount}/{tasks.length} تەواو</PanelDesc>
      </PanelHeader>
      <PanelBody>
        <div className="flex gap-2 mb-3">
          <input value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="ئەرکی نوێ..." className="flex-1 px-3 py-2 rounded-xl bg-white/5 ring-1 ring-white/10 text-sm text-zinc-100 outline-none" />
          <button onClick={add} className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-100 ring-1 ring-zinc-700">زیادکردن</button>
        </div>
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          {tasks.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 ring-1 ring-white/10">
              <label className="flex items-center gap-2 text-zinc-200 text-sm">
                <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} className="accent-sky-400" />
                <span className={t.done ? "line-through opacity-60" : ""}>{t.name}</span>
              </label>
              <button onClick={() => del(t.id)} className="text-zinc-400 hover:text-zinc-200">✕</button>
            </div>
          ))}
          {tasks.length === 0 && <div className="text-sm text-zinc-400">هیچ ئەرکێک نیە</div>}
        </div>
      </PanelBody>
    </Panel>
  );
}
function QuickNotes() {
  const [txt, setTxt] = useLocalJson("quick_notes", "");
  return (
    <Panel className="z-10">
      <PanelHeader>
        <PanelTitle className="text-amber-300"><Lightbulb size={18} /> تێبینی خێرا</PanelTitle>
        <PanelDesc>هەموو شتێک بنوسە</PanelDesc>
      </PanelHeader>
      <PanelBody>
        <textarea value={txt} onChange={(e) => setTxt(e.target.value)} rows={6} className="w-full rounded-2xl bg-white/5 ring-1 ring-white/10 p-3 text-zinc-100 outline-none text-sm" placeholder="..." />
      </PanelBody>
    </Panel>
  );
}
function SubjectProgress({ items }) {
  return (
    <Panel className="z-10">
      <PanelHeader>
        <PanelTitle className="text-violet-300">پێشکەوتن</PanelTitle>
        <PanelDesc>ڕەوشی خوێندن</PanelDesc>
      </PanelHeader>
      <PanelBody>
        <div className="grid grid-cols-2 gap-3">
          {items.map((it) => (
            <div key={it.name} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 ring-1 ring-white/10">
              <div className="text-zinc-200 text-sm">{it.name}</div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-24 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-2 bg-sky-400" style={{ width: `${clamp(it.value,0,100)}%` }} />
                </div>
                <span className="text-zinc-300 text-xs tabular-nums">{clamp(it.value,0,100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </PanelBody>
    </Panel>
  );
}
