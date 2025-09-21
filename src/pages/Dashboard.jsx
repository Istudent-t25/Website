// src/pages/Dashboard.jsx — StudentKRD Dashboard (RTL, Dark, Mobile-Responsive)

import React, { useEffect, useMemo, useRef, useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion, useMotionTemplate, useMotionValue } from "framer-motion";
import {
  ChevronRight, Book, NotebookText, Video, CalendarDays,
  Calculator, Atom, FlaskConical, Microscope, Languages, Pen, BookOpen, BookMarked,
  CheckCircle2, Lightbulb, Clock3, Flame, CircleDashed,
} from "lucide-react";

/* ============================== API ENDPOINTS (correct) ============================== */
const API_SUBJECTS = "https://api.studentkrd.com/api/v1/subjects";
const API_DOCS     = "https://api.studentkrd.com/api/v1/documents";
const API_PAPERS   = "https://api.studentkrd.com/api/v1/papers";

/* ============================== Utilities ============================== */
const EASE = [0.22, 1, 0.36, 1];
function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function todayStr() { return new Date().toISOString().slice(0, 10); }
async function fetchJSON(url) {
  const res = await fetch(url, { credentials: "omit" });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
const lsGetRaw = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch { return d; } };
function streamKurdish(s) {
  if (s === "scientific") return "زانستی";
  if (s === "literary")   return "ئەدەبی";
  if (s === "both")       return "هاوبەش";
  return "—";
}

/* Study activity counters used by Pomodoro + TopHero stats */
function addMinutesForToday(mins) {
  const key = "minutes_by_day";
  const t = todayStr();
  let map = {};
  try { map = JSON.parse(localStorage.getItem(key) || "{}"); } catch {}
  map[t] = (map[t] || 0) + mins;
  localStorage.setItem(key, JSON.stringify(map));
  localStorage.setItem("minutes_total", String(Number(localStorage.getItem("minutes_total") || "0") + mins));
  localStorage.setItem("xp_total", String(Number(localStorage.getItem("xp_total") || "0") + mins * 5));
  localStorage.setItem("streak_last", t);
  window.dispatchEvent(new CustomEvent("STUDY_ACTIVITY", { detail: { minutes: mins, today: t } }));
}

/* =========================== Layout Primitives =========================== */
const Panel = memo(function Panel({ className = "", children }) {
  return (
    <div className={"rounded-3xl bg-zinc-900/70 backdrop-blur-3xl ring-1 ring-zinc-800/70 shadow-[0_10px_24px_rgba(0,0,0,0.35)] relative overflow-hidden " + className}>
      <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(circle_at_top_right,black,transparent_70%)]" />
      {children}
    </div>
  );
});
const PanelHeader = ({ children, className = "" }) => <div className={"px-4 sm:px-5 pt-4 sm:pt-5 pb-3 " + className}>{children}</div>;
const PanelTitle  = ({ children, className = "" }) => (
  <h3 className={"text-zinc-100 font-semibold flex flex-wrap items-center gap-2 text-[13.5px] sm:text-base leading-snug " + className}>
    {children}
  </h3>
);
const PanelDesc   = ({ children, className = "" }) => (
  <p className={"text-[12px] sm:text-sm text-zinc-400 leading-snug break-words " + className}>{children}</p>
);
const PanelBody   = ({ children, className = "" }) => <div className={"px-4 sm:px-5 pb-5 " + className}>{children}</div>;

/* ============================== Smart Search ============================== */
function smartNavigateSearch(raw, navigate) {
  const q = String(raw || "").trim();
  const go = (path) => navigate(path, { replace: false });
  if (!q) return go("/search");

  const s = q.toLowerCase();
  const hasAny = (arr) => arr.some(k => s.includes(k));

  if (hasAny(["paper", "papers", "پرس", "پرسیار", "بانکی پرسیار", "ورقە", "ڕقە"])) {
    return go(`/exams?search=${encodeURIComponent(q)}`);
  }
  if (hasAny(["video", "videos", "ڤیدیۆ", "course", "courses", "وانە"])) {
    return go(`/subjects?t=videos&q=${encodeURIComponent(q)}`);
  }
  if (hasAny(["booklet", "booklets", "مەلزمە", "ملزمه"])) {
    return go(`/subjects?t=booklet&q=${encodeURIComponent(q)}`);
  }
  if (hasAny(["book", "books", "کتێب", "کتێبه‌کان"])) {
    return go(`/subjects?t=books&q=${encodeURIComponent(q)}`);
  }
  return go(`/subjects?q=${encodeURIComponent(q)}`);
}

/* ============================== TopHero ============================== */
function TopHero() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  /* live streak + minutes today (no XP) */
  const todayISO = useMemo(() => todayStr(), []);
  const { streak, minutesToday } = (function useStudyStats() {
    const [tick, setTick] = useState(0);
    useEffect(() => {
      const onEvt = () => setTick(t => t + 1);
      window.addEventListener("STUDY_ACTIVITY", onEvt);
      window.addEventListener("storage", onEvt);
      return () => { window.removeEventListener("STUDY_ACTIVITY", onEvt); window.removeEventListener("storage", onEvt); };
    }, []);
    return useMemo(() => {
      const byDay = lsGet("minutes_by_day", {});
      return {
        minutesToday: Number(byDay?.[todayISO] || 0),
        streak: Number(lsGetRaw("streak_current", "0")) || 0,
      };
    }, [todayISO, tick]);
  })();

  const cardRef = useRef(null);
  useEffect(() => {
    if (reduce) return;
    const el = cardRef.current; if (!el) return;
    let raf = 0;
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) / r.width;
        const y = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.style.setProperty("--rx", `${(-y * 2.2).toFixed(2)}deg`);
        el.style.setProperty("--ry", `${(x * 3.2).toFixed(2)}deg`);
        el.style.setProperty("--gx", `${(x * 14).toFixed(2)}%`);
        el.style.setProperty("--gy", `${(y * -14).toFixed(2)}%`);
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.style.setProperty("--rx", `0deg`);
      el.style.setProperty("--ry", `0deg`);
      el.style.setProperty("--gx", `0%`);
      el.style.setProperty("--gy", `0%`);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  const greet = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "بەیانی باش";
    if (h < 18) return "نیوەڕۆ باش";
    return "ئێوارە باش";
  }, []);

  const [q, setQ] = useState("");

  return (
    <div
      ref={cardRef}
      className="col-span-full relative z-10 overflow-hidden rounded-b-[28px] ring-1 ring-zinc-800/70
                   bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 will-change-transform"
      style={{ transform: reduce ? undefined : "perspective(1200px) rotateX(var(--rx,0)) rotateY(var(--ry,0))" }}
    >
      {/* background glows */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-24 -right-10 w-[320px] h-[320px] blur-3xl opacity-30"
             style={{ background: "radial-gradient(50% 50% at 50% 50%, #22d3ee55 0%, transparent 70%)" }} />
        <div className="absolute -bottom-10 -left-10 w-[420px] h-[420px] blur-3xl opacity-30"
             style={{ background: "radial-gradient(50% 50% at 50% 50%, #8b5cf655 0%, transparent 70%)",
                      transform: "translate(var(--gx,0), var(--gy,0))" }} />
      </div>

      <div className="px-4 sm:px-6 pt-4 pb-5" dir="rtl">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, ease: "easeOut" }}
          className="flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid place-items-center w-11 h-11 rounded-2xl bg-white/5 ring-1 ring-white/10 shrink-0">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-cyan-300">iS</span>
            </div>
            <div className="min-w-0">
              <div className="text-zinc-100 text-[12px] sm:text-sm opacity-80">{greet}</div>
              <div className="text-zinc-100 text-xl sm:text-3xl font-extrabold leading-tight truncate">
                بەخێربێیت بۆ StudentKRD
              </div>
              <p className="mt-1 text-zinc-300 text-[13px] sm:text-base leading-snug break-words">
                ئەمڕۆ چی بخوێنین؟ هەموو شتێک لێرە دەستیارە.
              </p>
            </div>
          </div>

          {/* stat chips */}
          <div className="shrink-0 hidden sm:flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-orange-600/15 ring-1 ring-orange-500/25 text-orange-200">
              <Flame size={16} className="shrink-0" />
              <span className="font-bold tabular-nums text-sm">ستریک: {streak}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/5 ring-1 ring-white/10 text-zinc-200">
              <Clock3 size={16} className="shrink-0" />
              <span className="text-sm">خولى ئەمڕۆ: <b className="tabular-nums">{Math.max(0, minutesToday)}</b> خ.</span>
            </div>
          </div>
        </motion.div>

        {/* big search */}
        <motion.form
          onSubmit={(e) => { e.preventDefault(); smartNavigateSearch(q, navigate); }}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut", delay: 0.04 }}
          className="mt-3 relative"
          role="search"
          aria-label="گەڕان"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") { setQ(""); e.currentTarget.blur(); } }}
            placeholder="کتێب، مەلزمە، ڤیدیۆ، پرسەکان..."
            className="w-full pe-24 ps-4 py-3 rounded-2xl bg-zinc-900/70 ring-1 ring-zinc-800/70 text-zinc-100
                         placeholder-zinc-500 outline-none focus:ring-zinc-700 text-[13.5px] sm:text-base"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-2">
            <button
              type="button"
              onClick={() => navigate('/schedule')}
              className="px-3 py-1.5 rounded-xl bg-white/5 ring-1 ring-white/10 text-[12px] sm:text-sm text-zinc-100 hover:bg-white/10 transition"
            >
              خشتەی ئەمڕۆ
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-cyan-600/25 ring-1 ring-cyan-500/25 text-[12px] sm:text-sm text-cyan-100 hover:bg-cyan-600/35 transition"
            >
              گەڕان
            </button>
          </div>
        </motion.form>

        {/* mobile stat chips */}
        <div className="mt-3 flex sm:hidden items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-orange-600/15 ring-1 ring-orange-500/25 text-orange-200">
            <Flame size={16} className="shrink-0" />
            <span className="font-bold tabular-nums text-sm">ستریک: {streak}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/5 ring-1 ring-white/10 text-zinc-200">
            <Clock3 size={16} className="shrink-0" />
            <span className="text-sm">خولى ئەمڕۆ: <b className="tabular-nums">{Math.max(0, minutesToday)}</b> خ.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== Quick Actions ============================== */
function QuickAction({ icon: Icon, text, to = "/subjects" }) {
  const reduce = useReducedMotion();
  const mouseX = useMotionValue(0), mouseY = useMotionValue(0);
  const background = useMotionTemplate`radial-gradient(160px at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.06) 0%, transparent 80%)`;
  const navigate = useNavigate();
  return (
    <motion.button
      type="button"
      whileHover={reduce ? {} : { y: -6, boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}
      whileTap={reduce ? {} : { scale: 0.96 }}
      onMouseMove={(e) => { const { left, top } = e.currentTarget.getBoundingClientRect(); mouseX.set(e.clientX - left); mouseY.set(e.clientY - top); }}
      onClick={() => navigate(to)}
      className="w-full text-right flex items-center justify-between rounded-2xl p-3.5 sm:p-4 bg-zinc-900/60 transition-all duration-300 backdrop-blur-sm ring-1 ring-zinc-800/70 shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
      style={reduce ? undefined : { background }}
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div className="grid place-items-center rounded-xl p-2.5 sm:p-3 bg-gradient-to-tr from-sky-600/25 to-indigo-600/25 ring-1 ring-sky-500/25 shrink-0">
          <Icon width={22} height={22} className="text-sky-300" />
        </div>
        <div className="text-zinc-100 text-[13px] sm:text-base font-semibold leading-snug truncate">
          {text}
        </div>
      </div>
      <ChevronRight width={18} height={18} className="text-zinc-500 shrink-0" />
    </motion.button>
  );
}

/* ============================== Subjects (API + strict track) ============================== */
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

const SubjectsCard = memo(function SubjectsCard({ subject, count, fav, toggleFav, onClick, isReady }) {
  const Icon = iconForSubject(subject.name);
  return (
    <button
      onClick={isReady ? onClick : null}
      className={`relative w-full text-right rounded-2xl p-4 transition ${
        isReady
          ? "ring-1 ring-zinc-800/70 bg-zinc-900/60 backdrop-blur-sm hover:translate-y-[-3px] cursor-pointer"
          : "bg-zinc-900/40 ring-1 ring-zinc-900/50 cursor-not-allowed opacity-50"
      }`}
      title={subject.name}
    >
      <div className="relative flex items-start justify-between gap-2 min-w-0">
        <div className={`grid place-items-center w-10 h-10 rounded-xl ring-1 ${isReady ? "bg-white/5 ring-white/10" : "bg-zinc-800/50 ring-zinc-800/60"} shrink-0`}>
          <Icon size={20} className={isReady ? "text-zinc-100" : "text-zinc-500"} />
        </div>
        <button
          type="button"
          onClick={isReady ? (e) => { e.stopPropagation(); toggleFav?.(subject.id); } : null}
          disabled={!isReady}
          className={`p-1.5 rounded-lg ring-1 ring-white/10 transition ${fav && isReady ? "bg-amber-500/20 text-amber-300" : isReady ? "bg-white/5 text-zinc-300" : "bg-zinc-800/40 text-zinc-600"} shrink-0`}
          aria-label="favorite"
        >
          {fav ? "★" : "♡"}
        </button>
      </div>

      <div className="mt-3 min-w-0">
        <div className="font-bold text-[13.5px] sm:text-lg leading-snug truncate text-white">{subject.name}</div>
        <div className="text-[11.5px] sm:text-[12px] text-zinc-400">ژمارەی داتا: {count}</div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[11px] sm:text-[12px] leading-none">
          {isReady ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span className="text-zinc-300">ئامادەیە</span>
            </>
          ) : (
            <>
              <CircleDashed className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-zinc-500">ئامادە نییە</span>
            </>
          )}
        </div>
        <span className="text-[10.5px] sm:text-[11px] text-zinc-500">ID: {subject.id}</span>
      </div>
    </button>
  );
});

function normalizeTrack(raw) {
  const s = String(raw || "").trim().toLowerCase();
  if (["scientific","science","sci","sci.","scinetific","scentific","scenitif"].includes(s)) return "scientific";
  if (["literary","literature","lit","ltr"].includes(s)) return "literary";
  if (["both","all"].includes(s)) return "both";
  return "both";
}
function normStream(v) {
  const s = String(v || "both").trim().toLowerCase();
  return s === "scientific" ? "scientific" : s === "literary" ? "literary" : "both";
}

function SubjectsGrid() {
  const navigate = useNavigate();

  // favorites (by subject id)
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("fav_subjects_ids") || "[]"); } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem("fav_subjects_ids", JSON.stringify(favorites)); } catch {} }, [favorites]);

  // filters from localStorage
  const grade = Number(lsGetRaw("grade", "12")) || 12; // default 12
  const track = normalizeTrack(lsGetRaw("track", "scientific"));

  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [counts, setCounts] = useState({});   // { [subjectId]: totalCount }

  // resource-level track filter: always include "both" when track is specific
  const resourceMatchesTrack = (streamLike) => {
    const v = normStream(streamLike);
    if (track === "both") return true;
    if (v === "both") return true;
    return v === track;
  };
  const resourceMatchesGrade = (g) => {
    const val = Number(g);
    if (!Number.isFinite(val)) return true; // keep if missing
    return val === grade;
  };

  // subject-level STRICT filter (NO null unless track == both)
  const subjectMatchesTrack = (subjectCode) => {
    const v = (subjectCode ?? "").toString().trim().toLowerCase();
    if (track === "scientific") return v === "scientific" || v === "both";
    if (track === "literary")   return v === "literary"   || v === "both";
    return true; // track === "both"
  };

  useEffect(() => {
    let closed = false;
    (async () => {
      setLoading(true);
      try {
        // 1) fetch subjects (✅ correct endpoint)
        const subjResp = await fetchJSON(`${API_SUBJECTS}?page=1&per_page=1000`);
        const allSubjects = Array.isArray(subjResp?.data)
          ? subjResp.data.map(s => ({ id: s.id, name: s.name, code: (s.code || "").toLowerCase() }))
          : [];

        // 2) resources
        const [docsRes, papersRes] = await Promise.allSettled([
          fetchJSON(`${API_DOCS}?per_page=500`),
          fetchJSON(`${API_PAPERS}?per_page=500`),
        ]);
        const docs   = docsRes.status === "fulfilled"   && Array.isArray(docsRes.value?.data)   ? docsRes.value.data   : [];
        const papers = papersRes.status === "fulfilled" && Array.isArray(papersRes.value?.data) ? papersRes.value.data : [];

        // 3) count resources per subject with grade + track filters (✅ subject_id)
        const map = {};
        for (const it of docs) {
          if (!resourceMatchesGrade(it.grade)) continue;
          if (!resourceMatchesTrack(it.stream)) continue;
          const sid = it.subject_id || it.subject?.id;
          if (!sid) continue;
          map[sid] = (map[sid] || 0) + 1;
        }
        for (const p of papers) {
          if (p.grade != null && !resourceMatchesGrade(p.grade)) continue;
          if (p.stream != null && !resourceMatchesTrack(p.stream)) continue;
          const sid = p.subject_id || p.subject?.id;
          if (!sid) continue;
          map[sid] = (map[sid] || 0) + 1;
        }

        // 4) subject list STRICT: (Scientific + Both) or (Literary + Both) depending on track
        const filtered = allSubjects.filter((s) => subjectMatchesTrack(s.code));

        if (!closed) { setSubjects(filtered); setCounts(map); }
      } catch (e) {
        console.error(e);
        if (!closed) { setSubjects([]); setCounts({}); }
      } finally {
        if (!closed) setLoading(false);
      }
    })();
    return () => { closed = true; };
  }, [grade, track]);

  const toggleFav = (id) =>
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]).slice(0, 24));

  const items = useMemo(() => {
    const arr = subjects.slice();
    arr.sort((a, b) => {
      const fa = favorites.includes(a.id) ? 1 : 0;
      const fb = favorites.includes(b.id) ? 1 : 0;
      if (fb !== fa) return fb - fa;
      return String(a.name).localeCompare(String(b.name), "ar");
    });
    return arr;
  }, [subjects, favorites]);

  return (
    <Panel className="col-span-full">
      <PanelHeader>
        <PanelTitle className="text-sky-300">📚 بابەتەکان</PanelTitle>
        <PanelDesc>
          پۆل: {grade} • تڕاک: {streamKurdish(track)} — تەنیا {track === "scientific" ? "زانستی + هاوبەش" : track === "literary" ? "ئەدەبی + هاوبەش" : "هەموو"}، و ئەوانەی داتایان هەیە.
        </PanelDesc>
      </PanelHeader>
      <PanelBody>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-white/5 ring-1 ring-white/10 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-[12.5px] sm:text-sm text-zinc-400 leading-snug">
            هیچ بابەتێک نیشان نەدرا — تکایە پۆل/تڕاک دڵنیابکە لە localStorage.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4" dir="rtl">
            {items.map((s) => (
              <SubjectsCard
                key={s.id}
                subject={s}
                count={counts[s.id] || 0}
                fav={favorites.includes(s.id)}
                toggleFav={toggleFav}
                onClick={() => navigate(`/subjects/${s.id}`)}   
                isReady={(counts[s.id] || 0) > 0}
              />
            ))}
          </div>
        )}
      </PanelBody>
    </Panel>
  );
}

/* ============================== Widgets ============================== */
function PomodoroTimer() {
  const [baseMinutes, setBaseMinutes] = useState(() => Number(lsGetRaw("pomodoro_minutes", "25")) || 25);
  const [seconds, setSeconds]         = useState(() => Number(lsGetRaw("pomodoro_seconds", String(baseMinutes * 60))) || baseMinutes * 60);
  const [running, setRunning]         = useState(() => lsGet("pomodoro_running", false));

  useEffect(() => { if (!running) { setSeconds(baseMinutes * 60); try { localStorage.setItem("pomodoro_minutes", String(baseMinutes)); } catch {} } }, [baseMinutes, running]);
  useEffect(() => { try { localStorage.setItem("pomodoro_seconds", String(seconds)); } catch {} }, [seconds]);
  useEffect(() => {
    try { localStorage.setItem("pomodoro_running", JSON.stringify(running)); } catch {}
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => {
      if (s <= 1) { addMinutesForToday(baseMinutes); return baseMinutes * 60; }
      return s - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [running, baseMinutes]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const adjust = (d) => { if (running) return; const next = clamp(baseMinutes + d, 5, 120); setBaseMinutes(next); setSeconds(next * 60); };

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle className="text-emerald-300"><Clock3 size={18} /> پۆمۆدۆرۆ</PanelTitle>
        <PanelDesc>كاتی یەك خولەك: دەستکاری بكە پێش دەستپێك</PanelDesc>
      </PanelHeader>
      <PanelBody>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button onClick={() => adjust(-5)} disabled={running} className={"px-3 py-1.5 rounded-xl ring-1 ring-white/10 text-[13px] sm:text-sm " + (running ? "bg-zinc-800/40 text-zinc-500" : "bg-white/5 text-zinc-100")}>-5</button>
            <div className="text-2xl sm:text-4xl font-extrabold text-zinc-100 tabular-nums leading-tight">{mm}:{ss}</div>
            <button onClick={() => adjust(+5)} disabled={running} className={"px-3 py-1.5 rounded-xl ring-1 ring-white/10 text-[13px] sm:text-sm " + (running ? "bg-zinc-800/40 text-zinc-500" : "bg-white/5 text-zinc-100")}>+5</button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setRunning((v) => !v)} className="px-3 py-1.5 rounded-xl bg-white/5 ring-1 ring-white/10 text-zinc-100 text-[13px] sm:text-sm">{running ? "واستاندن" : "دەستپێکردن"}</button>
            <button onClick={() => setSeconds(baseMinutes * 60)} className="px-3 py-1.5 rounded-xl bg-white/5 ring-1 ring-white/10 text-zinc-100 text-[13px] sm:text-sm">ڕێست</button>
            <button onClick={() => { addMinutesForToday(baseMinutes); }} className="px-3 py-1.5 rounded-xl bg-emerald-600/20 ring-1 ring-emerald-500/20 text-emerald-200 text-[13px] sm:text-sm">✓ تەواو</button>
          </div>
        </div>
      </PanelBody>
    </Panel>
  );
}

function TasksWidget() {
  const [tasks, setTasks] = useState(() => lsGet("tasks_widget", []));
  const [txt, setTxt] = useState("");
  useEffect(() => { try { localStorage.setItem("tasks_widget", JSON.stringify(tasks)); } catch {} }, [tasks]);
  const add = () => { const t = txt.trim(); if (!t) return; setTasks([{ id: crypto.randomUUID(), name: t, done: false }, ...tasks]); setTxt(""); };
  const toggle = (id) => setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const del    = (id) => setTasks(tasks.filter((t) => t.id !== id));
  const doneCount = tasks.filter((t) => t.done).length;
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle className="text-sky-300"><CheckCircle2 size={18} /> ئەرکەکان</PanelTitle>
        <PanelDesc>{doneCount}/{tasks.length} تەواو</PanelDesc>
      </PanelHeader>
      <PanelBody>
        <div className="flex gap-2 mb-3">
          <input value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="ئەرکی نوێ..." className="flex-1 px-3 py-2 rounded-xl bg-white/5 ring-1 ring-white/10 text-[13px] sm:text-sm text-zinc-100 outline-none" />
          <button onClick={add} className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-100 ring-1 ring-zinc-700 text-[13px] sm:text-sm">زیادکردن</button>
        </div>
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          {tasks.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 ring-1 ring-white/10">
              <label className="flex items-center gap-2 text-zinc-200 text-[13px] sm:text-sm">
                <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} className="accent-sky-400" />
                <span className={t.done ? "line-through opacity-60" : ""}>{t.name}</span>
              </label>
              <button onClick={() => del(t.id)} className="text-zinc-400 hover:text-zinc-200 text-[13px] sm:text-sm">✕</button>
            </div>
          ))}
          {tasks.length === 0 && <div className="text-[13px] sm:text-sm text-zinc-400">هیچ ئەرکێک نیە</div>}
        </div>
      </PanelBody>
    </Panel>
  );
}

function QuickNotes() {
  const [txt, setTxt] = useState(() => lsGetRaw("quick_notes", ""));
  useEffect(() => { try { localStorage.setItem("quick_notes", txt); } catch {} }, [txt]);
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle className="text-amber-300"><Lightbulb size={18} /> تێبینی خێرا</PanelTitle>
        <PanelDesc>هەموو شتێک بنوسە</PanelDesc>
      </PanelHeader>
      <PanelBody>
        <textarea value={txt} onChange={(e) => setTxt(e.target.value)} rows={6}
                  className="w-full rounded-2xl bg-white/5 ring-1 ring-white/10 p-3 text-zinc-100 outline-none text-[13px] sm:text-sm leading-snug" placeholder="..." />
      </PanelBody>
    </Panel>
  );
}

function SubjectsProgress({ items }) {
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle className="text-violet-300">پێشکەوتن</PanelTitle>
        <PanelDesc>ڕەوشی خوێندن</PanelDesc>
      </PanelHeader>
      <PanelBody>
        <div className="grid grid-cols-2 gap-3">
          {items.map((it) => (
            <div key={it.name} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 ring-1 ring-white/10">
              <div className="text-zinc-200 text-[13px] sm:text-sm">{it.name}</div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-24 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-2 bg-sky-400" style={{ width: `${clamp(it.value,0,100)}%` }} />
                </div>
                <span className="text-zinc-300 text-[11px] sm:text-xs tabular-nums">{clamp(it.value,0,100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </PanelBody>
    </Panel>
  );
}

function TodaySchedule({ rows }) {
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle className="text-cyan-300">خشتەی ئەمڕۆ</PanelTitle>
        <PanelDesc>کات و بابەت</PanelDesc>
      </PanelHeader>
      <PanelBody>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 ring-1 ring-white/10">
              <div className="text-zinc-200 text-[13px] sm:text-sm">{r.subjects}</div>
              <div className="text-zinc-400 text-[11px] sm:text-xs">{r.time}</div>
            </div>
          ))}
        </div>
      </PanelBody>
    </Panel>
  );
}
function NotificationsPanel({ items }) {
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle className="text-rose-300">ئاگادارییەکان</PanelTitle>
        <PanelDesc>هەواڵ و نوێکاری</PanelDesc>
      </PanelHeader>
      <PanelBody>
        <div className="space-y-2">
          {items.map((t, i) => (
            <div key={i} className="px-3 py-2 rounded-xl bg-white/5 ring-1 ring-white/10 text-[13px] sm:text-sm text-zinc-200 leading-snug break-words">{t}</div>
          ))}
        </div>
      </PanelBody>
    </Panel>
  );
}
function ExamsPanel({ items }) {
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle className="text-emerald-300">تاقیکردنەوەکان</PanelTitle>
        <PanelDesc>نزیکترین</PanelDesc>
      </PanelHeader>
      <PanelBody>
        <div className="space-y-2">
          {items.map((e, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 ring-1 ring-white/10">
              <div className="text-zinc-200 text-[13px] sm:text-sm">{e.title}</div>
              <div className="text-zinc-400 text-[11px] sm:text-xs">{e.date}</div>
            </div>
          ))}
        </div>
      </PanelBody>
    </Panel>
  );
}
function SuggestionsPanel({ items }) {
  return (
    <Panel className="col-span-full">
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
                <div className="text-zinc-100 text-[13px] sm:text-sm font-semibold truncate">{s.text}</div>
              </div>
              {s.url && (
                <a href={s.url} className="inline-block mt-3 text-[12px] sm:text-xs px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-100 ring-1 ring-zinc-700">کردنەوە</a>
              )}
            </div>
          ))}
        </div>
      </PanelBody>
    </Panel>
  );
}
function Marquee({ items = [] }) {
  const reduce = useReducedMotion();
  if (!items?.length) return null;
  return (
    <div className="relative overflow-hidden rounded-2xl ring-1 ring-zinc-800/70 bg-zinc-900/60">
      <div className="absolute inset-0 opacity-[0.08]"
           style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "12px 12px" }} />
      <div className={"flex gap-3 sm:gap-6 whitespace-nowrap p-2.5 sm:p-3 will-change-transform " + (reduce ? "" : "animate-[scroll_22s_linear_infinite]")}>
        {items.concat(items).map((t, i) => (
          <div key={i} className="px-2.5 sm:px-3 py-1 rounded-xl bg-zinc-900/70 ring-1 ring-zinc-800/70 text-[12px] sm:text-sm text-zinc-300">{t}</div>
        ))}
      </div>
      <style>{`@keyframes scroll { from{ transform: translateX(0)} to{ transform: translateX(-50%) } }`}</style>
    </div>
  );
}

/* ============================== Demo Data ============================== */
const todaySubjects = [ { time: "08:00", subjects: "بیرکاری" }, { time: "09:30", subjects: "كوردی" }, { time: "11:00", subjects: "فیزیا" } ];
const exams         = [ { title: "بیرکاری", date: "٢٧ی ٥" }, { title: "زیندەزانی", date: "٢٧ی ٥" }, { title: "كیمیا", date: "٢٧ی ٥" }, { title: "كوردی", date: "٢٩ی ٥" } ];
const notifications = ["کتێبی ماتماتیک زیادکرا", "ڤیدیۆی تازەی فیزیا زیادکرا"];
const suggestions   = [
  { icon: Languages, color: "text-sky-300",    text: "گرامەری ئینگلیزی", url: "/grammars/english" },
  { icon: Lightbulb, color: "text-violet-300", text: "چۆن باشتر بخوێنین", url: "/how-to-study" },
  { icon: Clock3,    color: "text-cyan-300",   text: "چۆن کات ڕێکبخەین", url: "/how-to-plan" },
];
const marqueeItems = [
  "بەخێربێن بۆ StudentKRD",
  "ئێمە لێرەین بۆ یارمەتیدانت",
  "تاقیکردنەوەی ئۆنڵاین",
  "گەشەپێدان بە بەردەوامی",
  "پرسیار و وەڵام",
];

/* ============================== Main Component ============================== */
export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div dir="rtl" className="relative p-3 sm:p-5 font-sans space-y-5 bg-zinc-950 min-h-screen text-right">

      <TopHero />

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 relative z-0">
        <QuickAction text="کتێب و مەلزەمەکان" to="/subjects?t=books" icon={Book} />
        <QuickAction text="ڤیدیۆ و وانەکان" to="/subjects?t=videos" icon={Video} />
        <QuickAction text="بانکی پرسیار" to="/subjects?t=papers" icon={NotebookText} />
        <QuickAction text="پلانی خوێندن" to="/schedule" icon={CalendarDays} />
      </div>

      <Marquee items={marqueeItems} />

      {/* Main Content Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        <SubjectsGrid />

        <div className="col-span-full xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <PomodoroTimer />
          <TasksWidget />
        </div>

        <QuickNotes />

        <div className="col-span-full md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <TodaySchedule rows={todaySubjects} />
          <ExamsPanel items={exams} />
          <NotificationsPanel items={notifications} />
          <SubjectsProgress items={[{ name: "بیرکاری", value: 40 }, { name: "فیزیا", value: 70 }]} />
        </div>

        <SuggestionsPanel items={suggestions} />
      </div>
    </div>
  );
}
