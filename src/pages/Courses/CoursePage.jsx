// src/pages/CoursePage.jsx — premium, animated course page (locked PDFs/videos)
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play, BookOpen, FileText, HelpCircle, CheckCircle2, Circle, Clock, Star,
  Search as SearchIcon, Filter, ChevronDown, ChevronUp, Bookmark, BookmarkCheck,
  Users, GraduationCap, FlaskConical, ArrowRight, Video
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* Demo course (ids only; no direct URLs) */
const demoCourse = {
  id: "bio-12-sci-1",
  title: "زینده‌زانی — پۆلی ١٢ (زانستی)",
  tagline: "کۆرسێکی تەواو بۆ خوێندکارانی پۆلی ١٢، لە بنەمای زانست تا ئامادەکاریی یاسایی.",
  cover: "",
  teacher: { id: 3, name: "م. هوشیار عبید", photo: null },
  track: "scientific",
  grade: 12,
  rating: 4.9,
  ratingCount: 217,
  hours: 18.5,
  lastUpdated: "2025-09-07",
  tags: ["PDF", "وێنە", "پرسیار", "تێبینی گرنگ"],
  modules: [
    { id: "m1", title: "بەشی یەکەم — بنچینەکان", lessons: [
      { id: "L101", title: "چۆن زیندەیی کاردەکات؟", type: "video", duration: 12 },
      { id: "L102", title: "ڕستەی خانەوە — وێنە و تێبینی", type: "pdf", duration: 8 },
      { id: "L103", title: "پرسیارە گرنگەکان (Q&A)", type: "quiz", duration: 6 },
    ]},
    { id: "m2", title: "خۆراک و هەناسە", lessons: [
      { id: "L201", title: "فۆتۆسینتەز — گرینگی و هەموارکاری", type: "video", duration: 14 },
      { id: "L202", title: "تێبینی گرنگ: فۆتۆسینتەز", type: "pdf", duration: 9 },
      { id: "L203", title: "پرسیارەکان بۆ تاقیکردنەوە", type: "pdf", duration: 11 },
    ]},
  ],
};

/** Token mint stub — replace with your real API */
async function mintToken(resourceId, kind) {
  // const res = await fetch(`/api/v1/token?rid=${resourceId}&kind=${kind}`, { credentials:'include' });
  // const { token } = await res.json();
  // return token;
  return `${kind}.${resourceId}.demoToken`;
}

/* UI atoms */
const Chip = ({ children, className = "" }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] ring-1 ${className}`}>{children}</span>
);
function Stars({ value = 0, count = 0 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="inline-flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const active = i < full || (i === full && half);
        return <Star key={i} size={14} className={active ? "text-amber-400" : "text-zinc-500"} fill={active ? "currentColor" : "transparent"} />;
      })}
      <span className="text-[11px] text-zinc-400">({count})</span>
    </div>
  );
}
function ProgressBar({ pct }) {
  return (
    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
      <motion.div className="h-full bg-gradient-to-r from-sky-400 to-fuchsia-400" initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(0, pct))}%` }} transition={{ type: "spring", stiffness: 200, damping: 24 }} />
    </div>
  );
}
const LessonIcon = ({ type }) => type === "video" ? <Video size={16} className="text-sky-300" /> : type === "pdf" ? <FileText size={16} className="text-emerald-300" /> : <HelpCircle size={16} className="text-fuchsia-300" />;

export default function CoursePage({ course = demoCourse }) {
  const nav = useNavigate();

  const [done, setDone] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`course:${course.id}:done`) || "[]"); } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem(`course:${course.id}:done`, JSON.stringify(done)); } catch {} }, [done, course.id]);

  const [fav, setFav] = useState(() => { try { return !!JSON.parse(localStorage.getItem(`course:${course.id}:fav`) || "false"); } catch { return false; } });
  useEffect(() => { try { localStorage.setItem(`course:${course.id}:fav`, JSON.stringify(fav)); } catch {} }, [fav, course.id]);

  const [openModules, setOpenModules] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`course:${course.id}:openModules`) || JSON.stringify(course.modules.map(m => m.id))); } catch { return course.modules.map(m => m.id); }
  });
  useEffect(() => { try { localStorage.setItem(`course:${course.id}:openModules`, JSON.stringify(openModules)); } catch {} }, [openModules, course.id]);

  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [onlyUnseen, setOnlyUnseen] = useState(false);

  const allLessons = useMemo(() => course.modules.flatMap(m => m.lessons), [course.modules]);
  const pct = useMemo(() => (done.length / Math.max(1, allLessons.length)) * 100, [done, allLessons.length]);

  const nextLesson = useMemo(() => {
    for (const m of course.modules) for (const l of m.lessons) if (!done.includes(l.id)) return l;
    return null;
  }, [course.modules, done]);

  const toggleModule = (id) => setOpenModules(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const filteredModules = useMemo(() => {
    const term = q.trim().toLowerCase();
    const pass = (l) =>
      (typeFilter === "all" || l.type === typeFilter) &&
      (!onlyUnseen || !done.includes(l.id)) &&
      (term === "" || l.title.toLowerCase().includes(term));
    return course.modules.map(m => ({ ...m, lessons: m.lessons.filter(pass) })).filter(m => m.lessons.length > 0);
  }, [course.modules, q, typeFilter, onlyUnseen, done]);

  const trackText = course.track === "scientific" ? "زانستی" : course.track === "literary" ? "ئەدەبی" : "گشتی";

  /* Open locked viewers */
  const openPdfLocked = async (lesson) => {
    const t = await mintToken(lesson.id, "pdf");
    nav(`/secure-viewer?id=${encodeURIComponent(lesson.id)}&t=${encodeURIComponent(t)}&preferText=1`);
  };
  const openVideoLocked = async (l) => {
    const t = await mintToken(l.id, "video");
    nav(`/secure-video?id=${encodeURIComponent(l.id)}&t=${encodeURIComponent(t)}`);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* HERO */}
      <div className="relative">
        <div className="absolute inset-0 opacity-60" style={{ backgroundImage: course.cover ? `url(${course.cover})` : "none", backgroundSize: "cover", backgroundPosition: "center", filter: course.cover ? "blur(20px)" : "none" }} />
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
                  {course.tags.map(t => <span key={t} className="text-[11px] text-zinc-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">{t}</span>)}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/15 grid place-items-center overflow-hidden">
                  {course.teacher.photo ? <img src={course.teacher.photo} alt={course.teacher.name} className="w-full h-full object-cover" /> : <Users size={18} className="text-zinc-300" />}
                </div>
                <div className="text-right">
                  <div className="text-[12px] text-zinc-400">مامۆستا</div>
                  <div className="font-semibold">{course.teacher.name}</div>
                </div>
                <button
                  onClick={() => setFav(f => !f)}
                  className={`h-10 px-3 rounded-xl border inline-flex items-center gap-2 text-[13px] ${fav ? "bg-amber-400/20 border-amber-300/30 text-amber-300" : "bg-white/5 border-white/10 text-zinc-300"}`}
                  title={fav ? "لابردنی دڵخواز" : "زیادکردن بۆ دڵخواز"}
                >
                  {fav ? <BookmarkCheck size={16}/> : <Bookmark size={16}/>}
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-[12px] text-zinc-400 mb-1">
                <span>پێشکەوتن</span><span>{Math.round(pct)}%</span>
              </div>
              <ProgressBar pct={pct} />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 pb-[max(24px,env(safe-area-inset-bottom))]">
        <div className="min-w-0">
          {/* toolbar */}
          <div className="sticky top-[8px] z-10 bg-zinc-950/70 backdrop-blur rounded-2xl border border-white/10 p-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"/>
                <input
                  value={q} onChange={(e) => setQ(e.target.value)}
                  className="w-full h-10 rounded-xl bg-white/5 border border-white/10 pl-9 pr-3 text-sm placeholder:text-zinc-500 outline-none"
                  placeholder="لە ناونیشانی وانەکان بگەڕێ…"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select value={typeFilter} onChange={(e)=>setTypeFilter(e.target.value)} className="h-10 rounded-xl bg-white/5 border border-white/10 text-sm pr-8 pl-3">
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
                  <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="mb-3 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                    <button onClick={() => toggleModule(m.id)} className="w-full flex items-center justify-between px-3 py-2 text-right">
                      <div className="font-semibold">{m.title}</div>
                      {isOpen ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: "spring", bounce: 0, duration: 0.35 }} className="border-t border-white/10">
                          {m.lessons.map((l, idx) => {
                            const isDone = done.includes(l.id);
                            return (
                              <div key={l.id} className={`flex items-center gap-2 px-3 py-2 ${idx !== 0 ? "border-t border-white/5" : ""}`}>
                                <button
                                  onClick={() => setDone(s => s.includes(l.id) ? s.filter(id => id !== l.id) : [...s, l.id])}
                                  className={`h-7 w-7 grid place-items-center rounded-lg border transition ${isDone ? "bg-emerald-500/15 border-emerald-300/30 text-emerald-300" : "bg-white/5 border-white/10 text-zinc-300"}`}
                                  title={isDone ? "لابردنی وەک خوێندراو" : "نیشانکردن وەک خوێندراو"}
                                >
                                  {isDone ? <CheckCircle2 size={16}/> : <Circle size={16}/>}
                                </button>

                                <LessonIcon type={l.type} />

                                <div className="flex-1 min-w-0">
                                  <div className="truncate font-medium">{l.title}</div>
                                  <div className="text-[11px] text-zinc-400 inline-flex items-center gap-1"><Clock size={12}/> {l.duration} خولەک</div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {l.type === "pdf" ? (
                                    <button
                                      onClick={() => openPdfLocked(l)}
                                      className="h-9 px-2.5 rounded-lg text-[12px] bg-emerald-500/15 border border-emerald-300/30 text-emerald-200 hover:bg-emerald-500/20"
                                    >
                                      بینینی PDF
                                    </button>
                                  ) : l.type === "video" ? (
                                    <button
                                      onClick={() => openVideoLocked(l)}  /* <-- uses l (fixed) */
                                      className="h-9 px-2.5 rounded-lg text-[12px] bg-sky-500/15 border border-sky-300/30 text-sky-200 hover:bg-sky-500/20 inline-flex items-center gap-1"
                                    >
                                      <Play size={14}/> بینینی ڤیدیۆ
                                    </button>
                                  ) : (
                                    <span className="text-[12px] text-zinc-400">پرسیار/وانەی ناوەکی</span>
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

              {filteredModules.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-zinc-300">
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
                onClick={() => nextLesson ? (nextLesson.type === "pdf" ? openPdfLocked(nextLesson) : nextLesson.type === "video" ? openVideoLocked(nextLesson) : null) : window.scrollTo({ top: 0, behavior: "smooth" })}
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
            onClick={() => nextLesson ? (nextLesson.type === "pdf" ? openPdfLocked(nextLesson) : nextLesson.type === "video" ? openVideoLocked(nextLesson) : null) : window.scrollTo({ top: 0, behavior: "smooth" })}
            className="h-10 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-fuchsia-500 text-white text-[13px] font-semibold"
          >
            {nextLesson ? "بەردەوامبە" : "سەرەتا"}
          </button>
        </div>
      </div>
    </div>
  );
}
