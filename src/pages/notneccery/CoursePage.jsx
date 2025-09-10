// src/pages/CoursePage.jsx — premium, animated course page
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play, BookOpen, FileText, HelpCircle, CheckCircle2, Circle, Clock, Star,
  Search as SearchIcon, Filter, ChevronDown, ChevronUp, Download, ExternalLink,
  Bookmark, BookmarkCheck, Users, GraduationCap, FlaskConical, ArrowRight, Video
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ----------------------------- Demo data (replace with API) ----------------------------- */
const demoCourse = {
  id: "bio-12-sci-1",
  title: "زینده‌زانی — پۆلی ١٢ (زانستی)",
  tagline: "کۆرسێکی تەواو بۆ خوێندکارانی پۆلی ١٢، لە بنەمای زانست تا ئامادەکاریی یاسایی.",
  cover:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 600'>
        <defs>
          <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0' stop-color='#08b6f9'/><stop offset='1' stop-color='#6a67f5'/>
          </linearGradient>
        </defs>
        <rect width='1200' height='600' fill='#0b1020'/>
        <circle cx='200' cy='120' r='220' fill='url(#g)' opacity='.18'/>
        <circle cx='900' cy='520' r='260' fill='url(#g)' opacity='.12'/>
      </svg>`
    ),
  teacher: {
    id: 3,
    name: "م. هوشیار عبید",
    photo: null,
  },
  track: "scientific",
  grade: 12,
  rating: 4.9,
  ratingCount: 217,
  hours: 18.5,
  lastUpdated: "2025-09-07",
  tags: ["PDF", "وێنە", "پرسیار", "تێبینی گرنگ"],
  // Syllabus grouped by modules
  modules: [
    {
      id: "m1",
      title: "بەشی یەکەم — بنچینەکان",
      lessons: [
        { id: "L101", title: "چۆن زیندەیی کاردەکات؟", type: "video", duration: 12, url: "https://files.example.com/intro.mp4" },
        { id: "L102", title: "ڕستەی خانەوە — وێنە و تێبینی", type: "pdf", duration: 8, url: "https://api.studentkrd.com/api/v1/dl/biology/cell.pdf" },
        { id: "L103", title: "پرسیارە گرنگەکان (Q&A)", type: "quiz", duration: 6, url: "#" },
      ],
    },
    {
      id: "m2",
      title: "خۆراک و هەناسە",
      lessons: [
        { id: "L201", title: "فۆتۆسینتەز — گرینگی و هەموارکاری", type: "video", duration: 14, url: "https://files.example.com/photo.mp4" },
        { id: "L202", title: "تێبینی گرنگ: فۆتۆسینتەز", type: "pdf", duration: 9, url: "https://api.studentkrd.com/api/v1/dl/biology/photosynthesis.pdf" },
        { id: "L203", title: "پرسیارەکان بۆ تاقیکردنەوە", type: "pdf", duration: 11, url: "https://api.studentkrd.com/api/v1/dl/biology/revision.pdf" },
      ],
    },
    {
      id: "m3",
      title: "هەواڵگەی ڕەگەز و گەشە",
      lessons: [
        { id: "L301", title: "DNA و ڕاستەوخۆ گۆرانکارییەکان", type: "video", duration: 17, url: "https://files.example.com/dna.mp4" },
        { id: "L302", title: "کورتەیەک لە وەراثەت", type: "pdf", duration: 10, url: "https://api.studentkrd.com/api/v1/dl/biology/genetics.pdf" },
      ],
    },
  ],
};

/* ----------------------------- LocalStorage helpers ----------------------------- */
const k = (courseId, sub) => `course:${courseId}:${sub}`;
const getJson = (k, fb) => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; }
};
const setJson = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

/* ----------------------------- UI atoms ----------------------------- */
const Chip = ({ children, className = "" }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] ring-1 ${className}`} >
    {children}
  </span>
);

function Stars({ value = 0, count = 0 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const arr = Array.from({ length: 5 }).map((_, i) => {
    const active = i < full || (i === full && half);
    return (
      <Star
        key={i}
        size={14}
        className={active ? "text-amber-400" : "text-zinc-500"}
        fill={active ? "currentColor" : "transparent"}
      />
    );
  });
  return (
    <div className="inline-flex items-center gap-1">
      {arr}
      <span className="text-[11px] text-zinc-400">({count})</span>
    </div>
  );
}

function ProgressBar({ pct }) {
  return (
    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-sky-400 to-fuchsia-400"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        transition={{ type: "spring", stiffness: 200, damping: 24 }}
      />
    </div>
  );
}

/* Lesson icon by type */
const LessonIcon = ({ type }) => {
  switch (type) {
    case "video": return <Video size={16} className="text-sky-300" />;
    case "pdf":   return <FileText size={16} className="text-emerald-300" />;
    case "quiz":  return <HelpCircle size={16} className="text-fuchsia-300" />;
    default:      return <BookOpen size={16} className="text-zinc-300" />;
  }
};

/* ----------------------------- Course Page ----------------------------- */
export default function CoursePage({ course = demoCourse }) {
  const nav = useNavigate();

  // Progress (set of completed lesson IDs)
  const [done, setDone] = useState(() => getJson(k(course.id, "done"), []));
  useEffect(() => setJson(k(course.id, "done"), done), [done, course.id]);

  // Favourite course toggle
  const [fav, setFav] = useState(() => !!getJson(k(course.id, "fav"), false));
  useEffect(() => setJson(k(course.id, "fav"), fav), [fav, course.id]);

  // UI state
  const [openModules, setOpenModules] = useState(() =>
    getJson(k(course.id, "openModules"), course.modules.map(m => m.id))
  );
  useEffect(() => setJson(k(course.id, "openModules"), openModules), [openModules, course.id]);

  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all|video|pdf|quiz
  const [onlyUnseen, setOnlyUnseen] = useState(false);

  const allLessons = useMemo(() => course.modules.flatMap(m => m.lessons), [course.modules]);
  const pct = useMemo(() => (done.length / Math.max(1, allLessons.length)) * 100, [done, allLessons.length]);

  const nextLesson = useMemo(() => {
    for (const m of course.modules) {
      for (const l of m.lessons) if (!done.includes(l.id)) return l;
    }
    return null;
  }, [course.modules, done]);

  const toggleModule = (id) =>
    setOpenModules((s) => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]));

  const filteredModules = useMemo(() => {
    const term = q.trim().toLowerCase();
    const pass = (l) =>
      (typeFilter === "all" || l.type === typeFilter) &&
      (!onlyUnseen || !done.includes(l.id)) &&
      (term === "" || l.title.toLowerCase().includes(term));

    return course.modules.map(m => ({
      ...m,
      lessons: m.lessons.filter(pass),
    })).filter(m => m.lessons.length > 0);
  }, [course.modules, q, typeFilter, onlyUnseen, done]);

  const openResource = (lesson) => {
    if (lesson.type === "pdf") {
      // Use your ResourceViewer (change the route if yours is different)
      nav(`/resource-viewer?u=${encodeURIComponent(lesson.url)}&preferText=1`);
    } else if (lesson.type === "video") {
      // In a real app, route to a video player page; for now open externally
      window.open(lesson.url, "_blank", "noreferrer");
    } else {
      // quizzes/others
      if (lesson.url && lesson.url !== "#") window.open(lesson.url, "_blank", "noreferrer");
    }
  };

  const markDone = (lessonId) =>
    setDone((s) => (s.includes(lessonId) ? s.filter(id => id !== lessonId) : [...s, lessonId]));

  const trackText = course.track === "scientific" ? "زانستی" : course.track === "literary" ? "ئەدەبی" : "گشتی";

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* HERO */}
      <div className="relative">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: `url(${course.cover})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(20px)",
          }}
          aria-hidden
        />
        <div className="relative">
          <div className="mx-auto max-w-7xl px-4 pt-[max(24px,env(safe-area-inset-top))] pb-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-end gap-4">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 text-[12px] text-zinc-300">
                  <Chip className="bg-sky-900/20 ring-sky-800/40 text-sky-300"><GraduationCap size={12}/> پۆل {course.grade}</Chip>
                  <Chip className="bg-fuchsia-900/20 ring-fuchsia-800/40 text-fuchsia-300"><FlaskConical size={12}/> {trackText}</Chip>
                  <Chip className="bg-teal-900/20 ring-teal-800/40 text-teal-300"><Clock size={12}/> {course.hours} کاتژمێر</Chip>
                  <Chip className="bg-emerald-900/20 ring-emerald-800/40 text-emerald-300">نوێکراوە: {course.lastUpdated}</Chip>
                </div>
                <h1 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">{course.title}</h1>
                <p className="mt-1 text-sm sm:text-base text-zinc-200/90">{course.tagline}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Stars value={course.rating} count={course.ratingCount} />
                  {course.tags.map(t => (
                    <span key={t} className="text-[11px] text-zinc-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </div>

              {/* Teacher + favourite */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/15 grid place-items-center overflow-hidden">
                  {/* Teacher photo fallback */}
                  {course.teacher.photo ? (
                    <img src={course.teacher.photo} alt={course.teacher.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users size={18} className="text-zinc-300" />
                  )}
                </div>
                <div className="text-right">
                  <div className="text-[12px] text-zinc-400">مامۆستا</div>
                  <div className="font-semibold">{course.teacher.name}</div>
                </div>
                <button
                  onClick={() => setFav(f => !f)}
                  className={`h-10 w-10 rounded-xl grid place-items-center border ${fav ? "bg-amber-400/20 border-amber-300/30 text-amber-300" : "bg-white/5 border-white/10 text-zinc-300"}`}
                  title={fav ? "لابردنی دڵخواز" : "زیادکردن بۆ دڵخواز"}
                >
                  {fav ? <BookmarkCheck size={18}/> : <Bookmark size={18}/>}
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-[12px] text-zinc-400 mb-1">
                <span>پێشکەوتن</span>
                <span>{Math.round(pct)}%</span>
              </div>
              <ProgressBar pct={pct} />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN + SIDEBAR */}
      <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 pb-[max(24px,env(safe-area-inset-bottom))]">
        {/* Main */}
        <div className="min-w-0">
          {/* toolbar */}
          <div className="sticky top-[8px] z-10 bg-zinc-950/70 backdrop-blur rounded-2xl border border-white/10 p-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"/>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full h-10 rounded-xl bg-white/5 border border-white/10 pl-9 pr-3 text-sm placeholder:text-zinc-500 outline-none"
                  placeholder="لە ناونیشانی وانەکان بگەڕێ…"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={typeFilter}
                    onChange={(e)=>setTypeFilter(e.target.value)}
                    className="h-10 rounded-xl bg-white/5 border border-white/10 text-sm pr-8 pl-3"
                  >
                    <option value="all">هەموو جۆرەکان</option>
                    <option value="video">ڤیدیۆ</option>
                    <option value="pdf">PDF</option>
                    <option value="quiz">پرسیار</option>
                  </select>
                  <Filter size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"/>
                </div>
                <label className="inline-flex items-center gap-2 text-[12px]">
                  <input type="checkbox" checked={onlyUnseen} onChange={e=>setOnlyUnseen(e.target.checked)} />
                  تەنها نەنەخوێندراوەکان
                </label>
              </div>
            </div>
          </div>

          {/* Modules */}
          <div className="mt-3">
            <AnimatePresence initial={false}>
              {filteredModules.map((m) => {
                const isOpen = openModules.includes(m.id);
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="mb-3 rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
                  >
                    {/* Header */}
                    <button
                      onClick={() => toggleModule(m.id)}
                      className="w-full flex items-center justify-between px-3 py-2 text-right"
                    >
                      <div className="font-semibold">{m.title}</div>
                      {isOpen ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                    </button>

                    {/* Body */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: "spring", bounce: 0, duration: 0.35 }}
                          className="border-t border-white/10"
                        >
                          {m.lessons.map((l, idx) => {
                            const isDone = done.includes(l.id);
                            return (
                              <div key={l.id} className={`flex items-center gap-2 px-3 py-2 ${idx !== 0 ? "border-t border-white/5" : ""}`}>
                                <button
                                  onClick={() => markDone(l.id)}
                                  className={`h-7 w-7 grid place-items-center rounded-lg border transition ${
                                    isDone ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-300"
                                           : "bg-white/5 border-white/10 text-zinc-300"
                                  }`}
                                  title={isDone ? "لابردنی وەک خوێندراو" : "نیشانکردن وەک خوێندراو"}
                                >
                                  {isDone ? <CheckCircle2 size={16}/> : <Circle size={16}/>}
                                </button>

                                <LessonIcon type={l.type} />

                                <div className="flex-1 min-w-0">
                                  <div className="truncate font-medium">{l.title}</div>
                                  <div className="text-[11px] text-zinc-400 inline-flex items-center gap-1">
                                    <Clock size={12}/> {l.duration} خولەک
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {l.type === "pdf" ? (
                                    <>
                                      <button
                                        onClick={() => openResource(l)}
                                        className="h-9 px-2.5 rounded-lg text-[12px] bg-emerald-500/15 border border-emerald-300/30 text-emerald-200 hover:bg-emerald-500/20"
                                      >
                                        بینینی PDF
                                      </button>
                                      <a
                                        className="h-9 px-2.5 rounded-lg text-[12px] bg-white/5 border border-white/10 hover:bg-white/10 inline-flex items-center gap-1"
                                        href={l.url} target="_blank" rel="noreferrer"
                                      >
                                        <Download size={14}/> داگرتن
                                      </a>
                                    </>
                                  ) : l.type === "video" ? (
                                    <button
                                      onClick={() => openResource(l)}
                                      className="h-9 px-2.5 rounded-lg text-[12px] bg-sky-500/15 border border-sky-300/30 text-sky-200 hover:bg-sky-500/20 inline-flex items-center gap-1"
                                    >
                                      <Play size={14}/> بینینی ڤیدیۆ
                                    </button>
                                  ) : (
                                    <a
                                      href={l.url} target="_blank" rel="noreferrer"
                                      className="h-9 px-2.5 rounded-lg text-[12px] bg-fuchsia-500/15 border border-fuchsia-300/30 text-fuchsia-200 hover:bg-fuchsia-500/20 inline-flex items-center gap-1"
                                    >
                                      <ExternalLink size={14}/> کردنەوە
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              {/* Empty state if filters remove all */}
              {filteredModules.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-zinc-300"
                >
                  هیچ وانەیەک نەدۆزرایەوە — فیتەر یان وشەیەکی تر تاقی بکەوە.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-[8px] space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm text-zinc-300">بەردەوامبە لە کۆرس</div>
            <div className="mt-1 font-semibold">{nextLesson ? nextLesson.title : "هەموو وانەکانتە تەواو کرد!"}</div>
            <div className="mt-3">
              <button
                onClick={() => nextLesson ? openResource(nextLesson) : window.scrollTo({ top: 0, behavior: "smooth" })}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-sky-500/80 to-fuchsia-500/80 hover:from-sky-500 hover:to-fuchsia-500 text-zinc-50 font-semibold"
              >
                {nextLesson ? "بەردەوامبە" : "گەڕانە سەرەتا"}
              </button>
            </div>
            <div className="mt-3 text-[12px] text-zinc-400">
              {Math.round(pct)}% تەواو • {allLessons.length} وانە • {course.hours} کاتژمێر
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="font-semibold mb-2">زانیاری کۆرس</div>
            <ul className="space-y-2 text-[13px] text-zinc-300">
              <li className="flex items-center gap-2"><GraduationCap size={14}/> پۆل {course.grade}</li>
              <li className="flex items-center gap-2"><FlaskConical size={14}/> {trackText}</li>
              <li className="flex items-center gap-2"><Clock size={14}/> {course.hours} کاتژمێر</li>
              <li className="flex items-center gap-2"><Star size={14} className="text-amber-400"/> هەڵسەنگاندن {course.rating}</li>
              <li className="flex items-center gap-2"><Users size={14}/> مامۆستا: {course.teacher.name}</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-20 p-2 pb-[max(8px,env(safe-area-inset-bottom))]">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/90 backdrop-blur p-2 flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] text-zinc-400">وانەی داهاتوو</div>
            <div className="truncate text-sm">{nextLesson ? nextLesson.title : "هەموو وانەکان تەواوە ✅"}</div>
          </div>
          <button
            onClick={() => nextLesson ? openResource(nextLesson) : window.scrollTo({ top: 0, behavior: "smooth" })}
            className="h-10 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-fuchsia-500 text-white text-[13px] font-semibold"
          >
            {nextLesson ? "بەردەوامبە" : "سەرەتا"}
          </button>
        </div>
      </div>
    </div>
  );
}
