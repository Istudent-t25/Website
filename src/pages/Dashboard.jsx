// src/pages/Dashboard.jsx — StudentKRD Dashboard (RTL, Dark)
// v3 — REAL localStorage wiring + daily streak + minutes today + XP/Level + subject counts by subject_id
// Notes:
// - Persists:
//   grade (string), track ("scientific"|"literary"|"both"),
//   streak_current (number), streak_last (YYYY-MM-DD),
//   minutes_by_day (JSON object {YYYY-MM-DD:number}), minutes_total (number),
//   xp_total (number), fav_subjects_ids (JSON array of ids),
//   pomodoro_minutes (number, default 25), pomodoro_seconds (number), pomodoro_running (bool),
//   tasks_widget, quick_notes.
// - Minutes counter: adds +1 every minute while tab is visible.
// - Streak: increments when you visit on consecutive calendar days; resets if a gap > 1 day.
// - XP: +1 per minute on app; +25 bonus when a Pomodoro finishes. Level = floor(xp_total/100)+1.
// - Subject grid: counts merged from Documents + Papers + Exams endpoints when available.

import React, { useEffect, useMemo, useRef, useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, Book, NotebookText, Video, CalendarDays,
  Calculator, Atom, FlaskConical, Microscope, Languages, Pen, BookOpen, BookMarked,
  CheckCircle2, Lightbulb, Clock3, Flame, Star, Plus, Target,
  TrendingUp, Award, Zap, Globe, Search, Menu, Bell, Settings, User,
  Play, Pause, RotateCw, Save, PlusCircle, Trash2, ChevronUp
} from "lucide-react";

/* ============================== API ENDPOINTS ============================== */
const API_SUBJECTS = "https://api.studentkrd.com/api/v1/subjects";
const API_DOCS     = "https://api.studentkrd.com/api/v1/documents";
const API_PAPERS   = "https://api.studentkrd.com/api/v1/papers";
const API_EXAMS    = "https://api.studentkrd.com/api/v1/exams"; // best-guess; safely ignored if 404

/* ============================== Utilities ============================== */
const EASE = [0.22, 1, 0.36, 1];
const SPRING = { type: "spring", stiffness: 260, damping: 24 };
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const todayStr = () => new Date().toISOString().slice(0, 10);

// Safe localStorage helpers (JSON + raw)
const storage = (() => {
  try {
    const testKey = "__test__"; localStorage.setItem(testKey, "1"); localStorage.removeItem(testKey);
    return localStorage;
  } catch (_) {
    // Fallback in environments without real localStorage
    let mem = {};
    return {
      getItem: (k) => (k in mem ? mem[k] : null),
      setItem: (k, v) => { mem[k] = String(v); },
      removeItem: (k) => { delete mem[k]; }
    };
  }
})();

const lsGetRaw = (k, fallback = null) => {
  const v = storage.getItem(k);
  return v == null ? fallback : v;
};
const lsSetRaw = (k, v) => { try { storage.setItem(k, String(v)); } catch {} };
const lsGet = (k, fallback) => {
  try {
    const v = storage.getItem(k);
    return v == null ? fallback : JSON.parse(v);
  } catch { return fallback; }
};
const lsSet = (k, v) => { try { storage.setItem(k, JSON.stringify(v)); } catch {} };

const streamKurdish = (s) => s === "scientific" ? "زانستی" : s === "literary" ? "ئەدەبی" : s === "both" ? "هاوبەش" : "—";

async function fetchJSON(url) {
  const res = await fetch(url, { credentials: "omit" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// Minute accounting + XP: adds to storage, returns updated { minutesToday, totalMinutes, xp }
function creditMinute({ bonusXP = 0 } = {}) {
  const today = todayStr();
  const byDay = lsGet("minutes_by_day", {});
  byDay[today] = (byDay[today] || 0) + 1;
  lsSet("minutes_by_day", byDay);

  const total = Number(lsGetRaw("minutes_total", "0")) || 0;
  lsSetRaw("minutes_total", total + 1);

  const xpPrev = Number(lsGetRaw("xp_total", "0")) || 0;
  lsSetRaw("xp_total", xpPrev + 1 + bonusXP);

  return { minutesToday: byDay[today], totalMinutes: total + 1, xp: xpPrev + 1 + bonusXP };
}

// Streak logic: update on app open/refresh
function updateStreak() {
  const today = todayStr();
  const last = lsGetRaw("streak_last", "");
  let cur = Number(lsGetRaw("streak_current", "0")) || 0;

  const dToday = new Date(today);
  const dLast  = last ? new Date(last) : null;
  let changed = false;

  if (!dLast) {
    cur = Math.max(1, cur || 1);
    changed = true;
  } else {
    const diffDays = Math.floor((dToday - dLast) / (24*60*60*1000));
    if (diffDays === 0) {
      // same day, no change
    } else if (diffDays === 1) {
      cur = cur + 1; changed = true;
    } else if (diffDays > 1) {
      cur = 1; changed = true;
    }
  }

  if (changed) lsSetRaw("streak_current", cur);
  lsSetRaw("streak_last", today);
  return cur;
}

/* ============================== Layout Components ============================== */
const GlassPanel = memo(function GlassPanel({ className = "", children, glow = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className={`
        relative rounded-3xl backdrop-blur-xl border border-white/10
        ${glow ? 'bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5' : 'bg-white/[0.02]'}
        shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)]
        transition-all duration-500 group overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 rounded-3xl opacity-60">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-xl scale-105" />
      </div>
      <div className="relative z-10">{children}</div>
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
});

/* ============================== Header ============================== */
function EnhancedTopHero({ streak, minutesToday, xp, grade, track }) {
  const greet = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "بەیانی باش";
    if (h < 18) return "نیوەڕۆ باش";
    return "ئێوارە باش";
  }, []);

  const level = Math.floor((Number(xp)||0) / 100) + 1;
  const xpToNext = (level * 100) - (Number(xp)||0);
  const xpProgress = ((Number(xp)||0) % 100) / 100 * 100;

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-400/30 to-blue-600/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-600/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 p-4 sm:p-6 md:p-8" dir="rtl">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.div className="relative" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 p-0.5">
                <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center">
                  <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">iS</span>
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse" />
            </motion.div>
            <div>
              <div className="text-slate-400 text-xs sm:text-sm">{greet} 👋</div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">بەخێربێیت بۆ StudentKRD</h1>
              <p className="text-slate-300 mt-1 text-sm">پۆل: {grade} • تڕاک: {streamKurdish(track)}</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <button className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"><Bell size={20} className="text-slate-300"/></button>
            <button className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"><Settings size={20} className="text-slate-300"/></button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="relative p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/20">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-xl bg-orange-500/20"><Flame size={18} className="text-orange-300"/></div>
              <div><div className="text-xl sm:text-2xl font-bold text-white">{streak}</div><div className="text-orange-200 text-xs sm:text-sm">ڕۆژ ستریک</div></div>
            </div>
          </div>
          <div className="relative p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20"><Clock3 size={18} className="text-cyan-300"/></div>
              <div><div className="text-xl sm:text-2xl font-bold text-white">{minutesToday}</div><div className="text-cyan-200 text-xs sm:text-sm">خولەکی ئەمڕۆ</div></div>
            </div>
          </div>
          <div className="relative p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20"><Award size={18} className="text-purple-300"/></div>
              <div><div className="text-xl sm:text-2xl font-bold text-white">{Math.floor((Number(xp)||0)/100)+1}</div><div className="text-purple-200 text-xs sm:text-sm">ئاست</div></div>
            </div>
          </div>
        </div>

        {/* XP Progress */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs sm:text-sm text-slate-300">ئاستی داهاتوو</span>
            <span className="text-xs sm:text-sm text-slate-400">{xpToNext} XP مایە</span>
          </div>
          <div className="h-1.5 sm:h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }} transition={{ duration: 1 }} className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full" />
          </div>
        </div>

        {/* Search */}
        <SearchBar/>
      </div>
    </div>
  );
}

function SearchBar(){
  const [q, setQ] = useState("");
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl" />
      <div className="relative p-0.5 rounded-2xl bg-gradient-to-r from-cyan-500/30 to-purple-500/30">
        <div className="relative flex items-center bg-slate-900/90 rounded-2xl">
          <div className="absolute left-4"><Search size={18} className="text-slate-400"/></div>
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="گەڕان بۆ کتێب، مەلزەمە، ڤیدیۆ، پرسیار..." className="w-full pl-10 pr-4 py-3 sm:pl-12 sm:pr-6 sm:py-4 bg-transparent text-white placeholder-slate-400 outline-none text-sm sm:text-lg"/>
          <button className="absolute right-1 sm:right-2 px-4 py-1 sm:px-6 sm:py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm sm:text-base">گەڕان</button>
        </div>
      </div>
    </div>
  );
}

/* ============================== Subject Grid ============================== */
function iconForSubject(name = "") {
  const n = String(name).toLowerCase();
  if (/(math|بیر|بیەر|بیرکاری)/.test(n)) return Calculator;
  if (/(phys|فیز|فیزی)/.test(n)) return Atom;
  if (/(chem|کیمیا|كیمیا)/.test(n)) return FlaskConical;
  if (/(bio|زیند|جین)/.test(n)) return Microscope;
  if (/(engl|ئینگ|انگلی)/.test(n)) return Languages;
  if (/(kurd|کورد|كورد)/.test(n)) return Pen;
  if (/(arab|عرب|عەرە)/.test(n)) return BookOpen;
  return BookMarked;
}

const EnhancedSubjectCard = memo(function EnhancedSubjectCard({ subject, count, fav, toggleFav, onClick, isReady }) {
  const Icon = iconForSubject(subject.name);
  const palette = {
    1: 'from-cyan-500 to-blue-500', 2: 'from-purple-500 to-pink-500', 3: 'from-green-500 to-emerald-500',
    4: 'from-orange-500 to-red-500', 5: 'from-indigo-500 to-purple-500', 6: 'from-pink-500 to-rose-500', 7: 'from-teal-500 to-cyan-500'
  };
  const gradient = palette[subject.id] || 'from-slate-500 to-slate-600';

  return (
    <motion.div whileHover={isReady ? { y: -6, scale: 1.02 } : {}} whileTap={isReady ? { scale: 0.98 } : {}} className={`group cursor-pointer transition-all duration-500 ${!isReady && 'opacity-50'}`} onClick={isReady ? onClick : null}>
      <div className={`relative p-4 sm:p-5 rounded-3xl border backdrop-blur-xl overflow-hidden transition-all duration-500 ${isReady ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:border-white/30' : 'bg-white/5 border-white/10'}`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 ${isReady && 'group-hover:opacity-20'} transition-opacity duration-500`} />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className={`p-2 sm:p-3 rounded-2xl bg-gradient-to-br ${gradient} bg-opacity-20`}><Icon size={20} className="text-white"/></div>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={isReady ? (e)=>{e.stopPropagation(); toggleFav?.(subject.id);} : null} className={`p-1.5 sm:p-2 rounded-xl transition-all ${fav && isReady ? 'bg-yellow-500/20 text-yellow-300 scale-110' : isReady ? 'bg-white/10 text-slate-400 hover:text-yellow-300' : 'bg-white/5 text-slate-600'}`}>
              <Star size={16} fill={fav && isReady ? 'currentColor':'none'}/>
            </motion.button>
          </div>
          <div className="mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-bold text-white mb-1 truncate">{subject.name}</h3>
            <p className="text-slate-400 text-xs sm:text-sm">ژمارەی داتا: {count}</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isReady ? (<><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/><span className="text-green-300 text-xs sm:text-sm font-medium">ئامادەیە</span></>) : (<><div className="w-2 h-2 bg-red-400 rounded-full"/><span className="text-red-300 text-xs sm:text-sm">ئامادە نییە</span></>)}
            </div>
            <span className="text-slate-500 text-xs">#{subject.id}</span>
          </div>
          {isReady && (
            <div className="mt-3">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (count/20)*100)}%` }} transition={{ duration: 1 }} className={`h-full bg-gradient-to-r ${gradient} rounded-full`}/>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

function EnhancedSubjectsGrid({ grade, track }) {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState(() => lsGet("fav_subjects_ids", []));
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [counts, setCounts] = useState({});

  // Persist favorites
  useEffect(() => { lsSet("fav_subjects_ids", favorites); }, [favorites]);

  // Load subjects
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetchJSON(API_SUBJECTS);
        const all = Array.isArray(res?.data) ? res.data : res;
        // filter by track if needed (scientific/literary/both)
        const filtered = (all || []).filter(s => track === 'both' || s.code === track || s.code === 'both');
        if (alive) setSubjects(filtered);
      } catch (e) {
        console.error("subjects fetch:", e); if (alive) setSubjects([]);
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [track]);

  // Load counts from Documents + Papers + Exams
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [docsRes, papersRes] = await Promise.allSettled([
          fetchJSON(API_DOCS),
          fetchJSON(API_PAPERS)
        ]);
        let examsArr = [];
        try { const ex = await fetchJSON(API_EXAMS); examsArr = Array.isArray(ex?.data) ? ex.data : (ex || []); } catch {}

        const docsArr   = docsRes.status === 'fulfilled'   ? (Array.isArray(docsRes.value?.data) ? docsRes.value.data : docsRes.value) : [];
        const papersArr = papersRes.status === 'fulfilled' ? (Array.isArray(papersRes.value?.data) ? papersRes.value.data : papersRes.value) : [];

        const map = {};
        const bump = (sid) => { if (!sid) return; map[sid] = (map[sid] || 0) + 1; };
        docsArr.forEach(it => bump(it.subject_id || it.subjectId));
        papersArr.forEach(it => bump(it.subject_id || it.subjectId));
        examsArr.forEach(it => bump(it.subject_id || it.subjectId));

        if (alive) setCounts(map);
      } catch (e) { console.error("counts fetch:", e); }
    })();
    return () => { alive = false; };
  }, []);

  const toggleFav = (id) => setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id].slice(0, 10));

  const sortedSubjects = useMemo(() => {
    return [...subjects].sort((a, b) => {
      const aFav = favorites.includes(a.id) ? 1 : 0;
      const bFav = favorites.includes(b.id) ? 1 : 0;
      if (bFav !== aFav) return bFav - aFav;
      return String(a.name).localeCompare(String(b.name), "ar");
    });
  }, [subjects, favorites]);

  return (
    <GlassPanel className="col-span-full" glow>
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 bg-opacity-20"><BookMarked size={22} className="text-white"/></div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">بابەتەکان</h2>
              <p className="text-slate-400 text-xs sm:text-sm">پۆل: {grade} • تڕاک: {streamKurdish(track)}</p>
            </div>
          </div>
          <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm">هەموویان ببینە</button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => (<div key={i} className="h-40 sm:h-48 rounded-3xl bg-white/5 animate-pulse"/>))}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" dir="rtl">
            {sortedSubjects.map((subject) => (
              <EnhancedSubjectCard key={subject.id} subject={subject} count={counts[subject.id] || 0} fav={favorites.includes(subject.id)} toggleFav={toggleFav} onClick={() => navigate(`/subjects/${subject.id}`)} isReady={(counts[subject.id] || 0) > 0} />
            ))}
          </div>
        )}
      </div>
    </GlassPanel>
  );
}

/* ============================== Pomodoro (persisted) ============================== */
function EnhancedPomodoroTimer({ onPomodoroFinish }) {
  const [minutes, setMinutes] = useState(() => Number(lsGetRaw('pomodoro_minutes','25')) || 25);
  const [seconds, setSeconds] = useState(() => Number(lsGetRaw('pomodoro_seconds', String((Number(lsGetRaw('pomodoro_minutes','25'))||25)*60))) || minutes*60);
  const [running, setRunning] = useState(() => lsGetRaw('pomodoro_running','false') === 'true');

  useEffect(() => { lsSetRaw('pomodoro_minutes', minutes); }, [minutes]);
  useEffect(() => { lsSetRaw('pomodoro_seconds', seconds); }, [seconds]);
  useEffect(() => { lsSetRaw('pomodoro_running', running ? 'true' : 'false'); }, [running]);

  useEffect(() => {
    let timerId;
    if (running && seconds > 0) {
      timerId = setInterval(() => setSeconds(s => s - 1), 1000);
    } else if (running && seconds === 0) {
      setRunning(false);
      // Bonus on finish
      onPomodoroFinish?.(minutes);
      // reset to full session for next run
      setSeconds(minutes * 60);
    }
    return () => clearInterval(timerId);
  }, [running, seconds, minutes, onPomodoroFinish]);

  const resetTimer = () => { setRunning(false); setSeconds(minutes * 60); };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const progress = ((minutes * 60 - seconds) / (minutes * 60)) * 100;

  return (
    <GlassPanel glow>
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="p-2 sm:p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 bg-opacity-20"><Clock3 size={22} className="text-emerald-300"/></div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">پۆمۆدۆرۆ</h3>
            <p className="text-slate-400 text-xs sm:text-sm">كاتی فۆكس</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <label className="text-slate-300 text-sm">ماوە (خولەک)</label>
          <input type="number" min={5} max={120} value={minutes} onChange={(e)=>{ const v = clamp(Number(e.target.value)||25,5,120); setMinutes(v); setSeconds(v*60); }} className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-right text-white"/>
        </div>

        {/* Ring */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-4 sm:mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="rgb(30 41 59)" strokeWidth="12"/>
            <motion.circle cx="100" cy="100" r="90" fill="none" strokeWidth="12" strokeLinecap="round" stroke="url(#grad)" strokeDasharray={2*Math.PI*90} animate={{ strokeDashoffset: 2*Math.PI*90*(1 - progress/100) }} transition={{ duration: 0.5 }}/>
            <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#06b6d4"/></linearGradient></defs>
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums">{mm}:{ss}</div>
              <div className="text-slate-400 text-xs sm:text-sm mt-1">{running ? 'ئیش دەكات' : 'ئامادەیە'}</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-3 sm:gap-4">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={()=>setRunning(r=>!r)} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500/20 text-emerald-300 grid place-items-center">{running ? <Pause size={26}/> : <Play size={26} className="translate-x-0.5"/>}</motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={resetTimer} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 text-white grid place-items-center"><RotateCw size={18}/></motion.button>
        </div>
      </div>
    </GlassPanel>
  );
}

/* ============================== Quick Notes ============================== */
function QuickNotes() {
  const [notes, setNotes] = useState(() => lsGetRaw('quick_notes',''));
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => { setIsSaved(notes === lsGetRaw('quick_notes','')); }, [notes]);
  const handleSave  = () => { lsSetRaw('quick_notes', notes); setIsSaved(true); };
  const handleClear = () => { setNotes(''); lsSetRaw('quick_notes',''); setIsSaved(true); };

  return (
    <GlassPanel className="relative p-4 sm:p-5 col-span-full">
      <div className="flex items-center justify-between mb-3 sm:mb-4 cursor-pointer" onClick={()=>setIsExpanded(v=>!v)}>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 bg-opacity-20"><Pen size={22} className="text-white"/></div>
          <div><h3 className="text-lg sm:text-xl font-bold text-white">تێبینی خێرا</h3><p className="text-slate-400 text-xs sm:text-sm">هەرچی دەتەوێ بیكه‌ نووسین</p></div>
        </div>
        <motion.div initial={false} animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}><ChevronUp size={22} className="text-slate-400"/></motion.div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={SPRING} className="overflow-hidden">
            <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="لێرە بنووسە..." className="w-full h-32 sm:h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none transition-all duration-300 text-sm" dir="rtl"/>
            <div className="flex justify-end gap-2 mt-4">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleClear} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/5 text-slate-400 rounded-xl font-semibold flex items-center gap-2 text-sm"><Trash2 size={16}/>سڕینەوە</motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSave} disabled={isSaved} className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-semibold flex items-center gap-2 transition-all text-sm ${isSaved ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}><Save size={16}/>پاشەکەوتکردن</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassPanel>
  );
}

/* ============================== App Entry Point ============================== */
export default function Dashboard() {
  // grade/track from localStorage (defaults)
  const [grade] = useState(() => lsGetRaw('grade','12'));
  const [track] = useState(() => lsGetRaw('track','scientific'));

  // streak + minutes + xp reactive state
  const [streak, setStreak] = useState(() => updateStreak());
  const [minutesToday, setMinutesToday] = useState(() => (lsGet('minutes_by_day', {})[todayStr()] || 0));
  const [xp, setXp] = useState(() => Number(lsGetRaw('xp_total','0')) || 0);

  // Minute ticker: +1 minute while tab visible
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') {
        const { minutesToday: mt, xp: newXP } = creditMinute();
        setMinutesToday(mt);
        setXp(newXP);
        // Also ensure streak date is set for today (no change to count if same-day)
        lsSetRaw('streak_last', todayStr());
      }
    };
    // align to minute boundary roughly
    const firstDelay = 60000 - (Date.now() % 60000);
    const first = setTimeout(() => { tick(); const id = setInterval(tick, 60000); (window)._minuteTimerId = id; }, firstDelay);
    return () => { clearTimeout(first); if ((window)._minuteTimerId) clearInterval((window)._minuteTimerId); };
  }, []);

  // Pomodoro finish handler — add minutes + bonus XP
  const handlePomodoroFinish = (sessionMinutes) => {
    // Credit the remaining seconds as minutes (already handled by minute ticker over time), give bonus
    const bonus = 25; // fixed bonus XP per completed session
    const today = todayStr();
    // Increase minutes_by_day by sessionMinutes to reflect session (optional if you prefer ticker-only). We add to be explicit.
    const byDay = lsGet('minutes_by_day', {});
    byDay[today] = (byDay[today] || 0) + sessionMinutes;
    lsSet('minutes_by_day', byDay);
    lsSetRaw('minutes_total', (Number(lsGetRaw('minutes_total','0'))||0) + sessionMinutes);
    lsSetRaw('xp_total', (Number(lsGetRaw('xp_total','0'))||0) + sessionMinutes + bonus);
    setMinutesToday(byDay[today]);
    setXp(Number(lsGetRaw('xp_total','0'))||0);
  };

  return (
    <div dir="rtl" className="relative p-3 sm:p-5 font-sans space-y-4 sm:space-y-5 bg-zinc-950 min-h-screen text-right">
      <EnhancedTopHero streak={streak} minutesToday={minutesToday} xp={xp} grade={grade} track={track} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 relative z-0">
        <QuickAction icon={Book} title="کتێب و مەلزەمەکان" subtitle="هەموو کتێبەکان بەردەستن" color="from-cyan-500 to-blue-500" to="/subjects?t=books" />
        <QuickAction icon={Video} title="ڤیدیۆ و وانەکان" subtitle="وانەکان بە ڤیدیۆ ببینە" color="from-purple-500 to-pink-500" to="/subjects?t=videos" />
        <QuickAction icon={NotebookText} title="بانکی پرسیار" subtitle="وەڵامی هەموو پرسیارەکان" color="from-green-500 to-emerald-500" to="/subjects?t=papers" />
        <QuickAction icon={CalendarDays} title="پلانی خوێندن" subtitle="ڕێکخستنی کاتی خوێندن" color="from-orange-500 to-red-500" to="/schedule" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        <EnhancedSubjectsGrid grade={grade} track={track} />
        <div className="col-span-full xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <EnhancedPomodoroTimer onPomodoroFinish={handlePomodoroFinish} />
        </div>
        <QuickNotes />
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, title, subtitle, color, to = "/subjects" }) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  return (
    <motion.div whileHover={reduce ? {} : { y: -8, scale: 1.02 }} whileTap={{ scale: 0.98 }} className="group cursor-pointer" onClick={() => navigate(to)}>
      <div className="relative p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:border-white/20">
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className={`p-2 sm:p-3 rounded-2xl bg-gradient-to-br ${color} bg-opacity-20`}><Icon size={22} className="text-white"/></div>
            <ChevronRight size={18} className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{title}</h3>
          <p className="text-slate-400 text-xs sm:text-sm">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
}
