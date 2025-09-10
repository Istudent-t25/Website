// src/pages/SubjectPage.jsx — Subject detail with teachers, intro, video playlist & locked PDFs/Videos
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search as SearchIcon, Filter, ChevronDown, ChevronUp,
  Clock, CheckCircle2, Circle, Play, FileText, Bookmark, BookmarkCheck,
  ArrowRight, Sparkles, GraduationCap, User
} from "lucide-react";

/** Demo loader by slug — replace with your API */
const demoBySlug = (slug) => {
  if (slug === "kurdish") {
    return {
      id: 1,
      slug: "kurdish",
      name: "کوردی",
      intro: "سەرپێچی تایبەتی بۆ زمانانی کوردی — وەرگێڕان، ڕستەنامە، نووسین و خوێندن.",
      cover: "",
      gradeRange: "10-12",
      teachers: [
        { id: 71, name: "م. بهرام جلال", bio: "مامۆستای زمان و ڕەوشتی نووسین.", photo: null },
        { id: 72, name: "م. آواز حمه", bio: "دەستکاریکاری زمان و ڕوونکردنەوەی ڕستە.", photo: null },
      ],
      playlists: [
        { teacherId: 71, title: "فێرکاری بنەمایی (م. بهرام)", videos: [
          { id: "K-101", title: "پێشەکی و ڕێنمایی کۆرس", minutes: 6 },
          { id: "K-102", title: "ڕستەی نووسین — بەشی یەکەم", minutes: 12 },
          { id: "K-103", title: "وەرگێڕان — تێبینی گرنگ", minutes: 9 },
        ]},
        { teacherId: 72, title: "خوێندن و ڕوونکردنەوە (م. آواز)", videos: [
          { id: "K-201", title: "چۆن خوێندن باشتر بکەین؟", minutes: 8 },
          { id: "K-202", title: "کورتەیەک لە ڕستەنامە", minutes: 15 },
        ]},
      ],
      resources: [
        { id: "R-1", title: "تێبینی گرنگ — ڕستەنامە", type: "pdf", minutes: 10 },
        { id: "R-2", title: "پرسیارە تایبەتەکان (PDF)", type: "pdf", minutes: 12 },
      ],
    };
  }
  return { id: 0, slug, name: slug, intro: "نموونە.", cover: "", gradeRange: "", teachers: [], playlists: [], resources: [] };
};

/** Token mint stub — replace with your real API */
async function mintToken(resourceId, kind) {
  // e.g., const res = await fetch(`/api/v1/token?rid=${resourceId}&kind=${kind}`, { credentials:'include' });
  // const { token } = await res.json();
  // return token;
  return `${kind}.${resourceId}.demoToken`;
}

const k = (slug, sub) => `subject:${slug}:${sub}`;
const getJson = (kk, fb) => { try { const v = localStorage.getItem(kk); return v ? JSON.parse(v) : fb; } catch { return fb; } };
const setJson = (kk, v) => { try { localStorage.setItem(kk, JSON.stringify(v)); } catch {} };

export default function SubjectPage() {
  const params = useParams();
  const nav = useNavigate();
  const subject = useMemo(() => demoBySlug(params.slug), [params.slug]);

  const [fav, setFav] = useState(() => !!getJson(k(subject.slug, "fav"), false));
  useEffect(() => setJson(k(subject.slug, "fav"), fav), [fav, subject.slug]);

  const allVideos = useMemo(
    () => subject.playlists.flatMap(pl => pl.videos.map(v => ({ ...v, teacherId: pl.teacherId }))),
    [subject.playlists]
  );
  const [done, setDone] = useState(() => getJson(k(subject.slug, "done"), []));
  useEffect(() => setJson(k(subject.slug, "done"), done), [done, subject.slug]);

  const [openPlaylists, setOpenPlaylists] = useState(() => getJson(k(subject.slug, "open"), subject.playlists.map(p => p.title)));
  useEffect(() => setJson(k(subject.slug, "open"), openPlaylists), [openPlaylists, subject.slug]);

  const [teacherFilter, setTeacherFilter] = useState("all");
  const [q, setQ] = useState("");

  const filteredPlaylists = useMemo(() => {
    const term = q.trim().toLowerCase();
    const allowTeacher = (pl) => teacherFilter === "all" || String(pl.teacherId) === String(teacherFilter);
    return subject.playlists
      .filter(allowTeacher)
      .map(pl => ({ ...pl, videos: pl.videos.filter(v => term === "" || v.title.toLowerCase().includes(term)) }))
      .filter(pl => pl.videos.length > 0);
  }, [subject.playlists, q, teacherFilter]);

  const pct = useMemo(() => (done.length / Math.max(1, allVideos.length)) * 100, [done, allVideos.length]);
  const teacherById = (id) => subject.teachers.find(t => String(t.id) === String(id));
  const nextVideo = useMemo(() => allVideos.find(v => !done.includes(v.id)) || null, [allVideos, done]);

  const openPdfLocked = async (resourceId) => {
    const t = await mintToken(resourceId, "pdf");
    nav(`/secure-viewer?id=${encodeURIComponent(resourceId)}&t=${encodeURIComponent(t)}&preferText=1`);
  };
  const openVideoLocked = async (v) => {
    const t = await mintToken(v.id, "video");
    nav(`/secure-video?id=${encodeURIComponent(v.id)}&t=${encodeURIComponent(t)}`);
  };
  const toggleDone = (id) => setDone(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* HERO */}
      <div className="relative">
        <div className="absolute inset-0">
          {subject.cover ? (
            <img src={subject.cover} alt="" className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full bg-[radial-gradient(1200px_600px_at_80%_-10%,rgba(56,189,248,.20),transparent),radial-gradient(800px_500px_at_10%_-10%,rgba(232,121,249,.16),transparent)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-zinc-950/60" />
        </div>

        <div className="relative">
          <div className="mx-auto max-w-7xl px-4 pt-[max(20px,env(safe-area-inset-top))] pb-6">
            <div className="flex items-center gap-2 text-[12px] text-zinc-300 mb-1">
              <Sparkles size={14} className="text-sky-300" /> بابەت
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-end gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">{subject.name}</h1>
                <p className="mt-1 text-sm sm:text-base text-zinc-200/90">{subject.intro}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-zinc-300">
                  <span className="inline-flex items-center gap-1"><GraduationCap size={14}/> پۆل {subject.gradeRange}</span>
                  <span className="inline-flex items-center gap-1"><Users size={14}/> {subject.teachers.map(t => t.name).join("، ")}</span>
                  <span className="inline-flex items-center gap-1"><Clock size={14}/> پێشکەوتن: {Math.round(pct)}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => (window.history.length > 1 ? nav(-1) : nav("/subjects"))}
                  className="h-10 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[13px] inline-flex items-center gap-2"
                >
                  <ArrowRight size={16}/> گەڕانەوە
                </button>
                <button
                  onClick={() => setFav(f => !f)}
                  className={`h-10 px-3 rounded-xl border inline-flex items-center gap-2 text-[13px] ${fav ? "bg-amber-400/20 border-amber-300/30 text-amber-300" : "bg-white/5 border-white/10 text-zinc-300"}`}
                >
                  {fav ? <BookmarkCheck size={16}/> : <Bookmark size={16}/>} دڵخواز
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 pb-[max(24px,env(safe-area-inset-bottom))]">
        {/* Left: playlists & resources */}
        <div className="min-w-0">
          {/* Tools */}
          <div className="sticky top-[8px] z-10 bg-zinc-950/70 backdrop-blur rounded-2xl border border-white/10 p-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"/>
                <input
                  value={q}
                  onChange={(e)=>setQ(e.target.value)}
                  className="w-full h-10 rounded-xl bg-white/5 border border-white/10 pl-9 pr-3 text-sm placeholder:text-zinc-500 outline-none"
                  placeholder="لە ناونیشانی ڤیدیۆ بگەڕێ…"
                />
              </div>
              <div className="relative">
                <select
                  value={teacherFilter}
                  onChange={(e)=>setTeacherFilter(e.target.value)}
                  className="h-10 rounded-xl bg-white/5 border border-white/10 text-sm pr-8 pl-3"
                >
                  <option value="all">هەموو مامۆستایان</option>
                  {subject.teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <Filter size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"/>
              </div>
            </div>
          </div>

          {/* Playlists */}
          <div className="mt-3">
            <AnimatePresence initial={false}>
              {filteredPlaylists.map(pl => {
                const isOpen = openPlaylists.includes(pl.title);
                const t = teacherById(pl.teacherId);
                return (
                  <motion.div
                    key={pl.title}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="mb-3 rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenPlaylists(s => s.includes(pl.title) ? s.filter(x => x !== pl.title) : [...s, pl.title])}
                      className="w-full flex items-center justify-between px-3 py-2 text-right"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 grid place-items-center overflow-hidden">
                          {t?.photo ? <img src={t.photo} alt={t.name} className="w-full h-full object-cover"/> : <User size={16} className="text-zinc-300" />}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{pl.title}</div>
                          <div className="text-[12px] text-zinc-400">{t ? t.name : "ناوی مامۆستا"}</div>
                        </div>
                      </div>
                      {isOpen ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          transition={{ type: "spring", bounce: 0, duration: 0.35 }}
                          className="border-t border-white/10"
                        >
                          {pl.videos.map((v, idx) => {
                            const isDone = done.includes(v.id);
                            return (
                              <div key={v.id} className={`flex items-center gap-2 px-3 py-2 ${idx !== 0 ? "border-t border-white/5" : ""}`}>
                                <button
                                  onClick={() => toggleDone(v.id)}
                                  className={`h-7 w-7 grid place-items-center rounded-lg border transition ${
                                    isDone ? "bg-emerald-500/15 border-emerald-300/30 text-emerald-300" : "bg-white/5 border-white/10 text-zinc-300"
                                  }`}
                                  title={isDone ? "لابردنی وەک خوێندراو" : "نیشانکردن وەک خوێندراو"}
                                >
                                  {isDone ? <CheckCircle2 size={16}/> : <Circle size={16}/>}
                                </button>

                                <div className="h-8 w-8 rounded-lg bg-sky-500/15 border border-sky-300/30 grid place-items-center text-sky-200">
                                  <Play size={16}/>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="truncate font-medium">{v.title}</div>
                                  <div className="text-[11px] text-zinc-400 inline-flex items-center gap-1">
                                    <Clock size={12}/> {v.minutes} خولەک
                                  </div>
                                </div>

                                <button
                                  onClick={() => openVideoLocked(v)}  /* <-- uses v (fixed) */
                                  className="h-9 px-2.5 rounded-lg text-[12px] bg-sky-500/15 border border-sky-300/30 text-sky-200 hover:bg-sky-500/20 inline-flex items-center gap-1"
                                >
                                  <Play size={14}/> بینین
                                </button>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              {filteredPlaylists.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-zinc-300">
                  هیچ ڤیدیۆیەک نەدۆزرایەوە — فیتەر یان وشەیەکی تر تاقی بکەوە.
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Resources (PDF) — locked, no direct download links */}
          <div className="mt-3">
            <div className="mb-2 text-[12px] text-zinc-400">سەرچاوەکان (PDF)</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {subject.resources.map(r => (
                <div key={r.id} className="rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-300/30 grid place-items-center text-emerald-200">
                    <FileText size={18}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{r.title}</div>
                    <div className="text-[11px] text-zinc-400 inline-flex items-center gap-1"><Clock size={12}/> {r.minutes} خولەک</div>
                  </div>
                  <button
                    onClick={() => openPdfLocked(r.id)}
                    className="h-9 px-2.5 rounded-lg text-[12px] bg-emerald-500/15 border border-emerald-300/30 text-emerald-200 hover:bg-emerald-500/20"
                  >
                    بینینی PDF
                  </button>
                </div>
              ))}
              {subject.resources.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-zinc-300 text-center">
                  هیچ PDF نییە بۆ ئەم بابەتە.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: teachers / about */}
        <aside className="lg:sticky lg:top-[8px] space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="font-semibold mb-2">مامۆستایان</div>
            <div className="space-y-2">
              {subject.teachers.map(t => (
                <div key={t.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2">
                  <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 grid place-items-center overflow-hidden">
                    {t.photo ? <img src={t.photo} alt={t.name} className="w-full h-full object-cover"/> : <Users size={16} className="text-zinc-300" />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{t.name}</div>
                    <div className="text-[12px] text-zinc-400 truncate">{t.bio}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="font-semibold mb-2">دەربارەی بابەت</div>
            <p className="text-[13px] text-zinc-300">{subject.intro}</p>
          </div>
        </aside>
      </div>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-20 p-2 pb-[max(8px,env(safe-area-inset-bottom))]">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/90 backdrop-blur p-2 flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] text-zinc-400">وانەی داهاتوو</div>
            <div className="truncate text-sm">{nextVideo ? nextVideo.title : "هەموو ڤیدیۆکان تەواوە ✅"}</div>
          </div>
          <button
            onClick={() => nextVideo ? openVideoLocked(nextVideo) : window.scrollTo({ top: 0, behavior: "smooth" })}
            className="h-10 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-fuchsia-500 text-white text-[13px] font-semibold"
          >
            {nextVideo ? "بەردەوامبە" : "سەرەتا"}
          </button>
        </div>
      </div>
    </div>
  );
}
