// src/pages/SubjectsIndex.jsx — Subjects catalog grid (mobile-first, animated)
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, GraduationCap, Users, PlayCircle, FileText, ArrowRight, Sparkles } from "lucide-react";

/** Demo subjects (replace with your API data) */
const demoSubjects = [
  {
    id: 1,
    slug: "kurdish",
    name: "کوردی",
    cover: "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 600'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#22d3ee'/><stop offset='1' stop-color='#a78bfa'/></linearGradient></defs><rect width='1200' height='600' fill='#0b1020'/><circle cx='220' cy='120' r='220' fill='url(#g)' opacity='.18'/><circle cx='900' cy='520' r='260' fill='url(#g)' opacity='.12'/></svg>`),
    teachers: [{ id: 71, name: "م. بهرام جلال" }, { id: 72, name: "م. آواز حمه" }],
    stats: { videos: 24, pdfs: 10, gradeRange: "10-12" },
    tagline: "وانە، ڤیدیۆ و تێبینییە گرنگەکان بۆ زمانانی کوردی.",
  },
  {
    id: 2,
    slug: "biology",
    name: "زیندەزانی",
    cover: "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 600'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#34d399'/><stop offset='1' stop-color='#22d3ee'/></linearGradient></defs><rect width='1200' height='600' fill='#0b1020'/><circle cx='300' cy='140' r='260' fill='url(#g)' opacity='.18'/><circle cx='880' cy='500' r='280' fill='url(#g)' opacity='.12'/></svg>`),
    teachers: [{ id: 3, name: "م. هوشیار عبید" }],
    stats: { videos: 31, pdfs: 18, gradeRange: "12" },
    tagline: "کۆرسێکی تەواو بۆ پۆلی ١٢ (زانستی) و ئامادەکاری یاسایی.",
  },
  {
    id: 3,
    slug: "chemistry",
    name: "کیمیا",
    cover: "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 600'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#60a5fa'/><stop offset='1' stop-color='#34d399'/></linearGradient></defs><rect width='1200' height='600' fill='#0b1020'/><circle cx='250' cy='110' r='220' fill='url(#g)' opacity='.18'/><circle cx='960' cy='520' r='260' fill='url(#g)' opacity='.12'/></svg>`),
    teachers: [{ id: 40, name: "م. ریبوار قادر" }],
    stats: { videos: 19, pdfs: 12, gradeRange: "11-12" },
    tagline: "وانە و ڕاهێنانی پرسیار بۆ کیمیا.",
  },
];

export default function SubjectsIndex({ subjects = demoSubjects }) {
  const nav = useNavigate();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return subjects;
    return subjects.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.tagline.toLowerCase().includes(term) ||
      s.teachers.some(t => t.name.toLowerCase().includes(term))
    );
  }, [q, subjects]);

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Hero / search */}
      <div className="px-4 pt-[max(16px,env(safe-area-inset-top))] pb-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 text-[12px] text-zinc-400 mb-2">
            <Sparkles size={14} className="text-sky-300" />
            بابەتی خوێندن
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">بابەتەکان</h1>

          <div className="mt-3 relative max-w-xl">
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"/>
            <input
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              placeholder="لە ناوی بابەت یان مامۆستا بگەڕێ…"
              className="w-full h-11 rounded-2xl bg-white/5 border border-white/10 pl-9 pr-3 text-sm placeholder:text-zinc-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 pb-[max(24px,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-7xl">
          <AnimatePresence initial={false}>
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {filtered.map(s => (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="group overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:bg-white/7.5"
                >
                  <div className="relative h-36 sm:h-40 overflow-hidden">
                    <img src={s.cover} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/35" />
                    <div className="absolute bottom-2 inset-x-3">
                      <div className="text-lg font-extrabold tracking-tight">{s.name}</div>
                      <div className="text-[12px] text-zinc-300 line-clamp-1">{s.tagline}</div>
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-[12px] text-zinc-300">
                      <span className="inline-flex items-center gap-1"><Users size={14}/> {s.teachers.map(t=>t.name).join("، ")}</span>
                      <span className="inline-flex items-center gap-1"><PlayCircle size={14}/> {s.stats.videos} ڤیدیۆ</span>
                      <span className="inline-flex items-center gap-1"><FileText size={14}/> {s.stats.pdfs} PDF</span>
                      <span className="inline-flex items-center gap-1"><GraduationCap size={14}/> پۆل {s.stats.gradeRange}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => nav(`/subjects/${s.slug}`)}
                        className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl bg-gradient-to-r from-sky-500/70 to-fuchsia-500/70 hover:from-sky-500 hover:to-fuchsia-500 text-white text-[13px] font-semibold"
                      >
                        بینینی بابەت <ArrowRight size={16}/>
                      </button>
                      <Link
                        to={`/subjects/${s.slug}`}
                        className="text-[12px] text-zinc-300 hover:text-zinc-100"
                      >
                        وردەکاری…
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-zinc-300"
              >
                هیچ بابەتێک نەدۆزرایەوە.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
