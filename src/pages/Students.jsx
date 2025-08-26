// StudentsBeautiful.jsx — compact, modern Students page (RTL, Tailwind, Motion)
// - Sticky, compact filter/search bar (top-0)
// - Tiny animated chips (horizontal scroll) so more cards fit on screen
// - Subject/Teacher filters + search + track (for grade ≥ 10)
// - Responsive, dark-mode friendly cards with gradient overlays & copy-link
// - Self-contained: ContentDisplay is inside this file

import React, { useMemo, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Video,
  FileText,
  Book,
  Filter,
  ChevronLeft,
  Search,
  X,
  Link as LinkIcon,
  ExternalLink,
  PlayCircle,
  Bookmark,
  CheckCircle2,
} from "lucide-react";

// ---------------------------- Demo Data ----------------------------
const subjects = ["کوردی", "ئینگلیزی", "بیركاری", "فیزیا", "کیمیا", "ئەندازیارى"];

const teachersBySubject = {
  "کوردی": ["مامۆستا عومەر", "مامۆستا هێمن", "مامۆستا دڵشاد"],
  "ئینگلیزی": ["مامۆستا سارا", "مامۆستا ریبوار", "مامۆستا ژیار"],
  "بیركاری": ["مامۆستا ئارام", "مامۆستا ڕێژین"],
  "فیزیا": ["مامۆستا هوراز", "مامۆستا بەرزان"],
  "کیمیا": ["مامۆستا ناز", "مامۆستا زانیار"],
  "ئەندازیارى": ["مامۆستا رێبوار", "مامۆستا تارا"],
};

const sampleProducts = [
  {
    title: "کتێبی بیركاری پۆلی ١٢ - بەشی یەکەم",
    url: "https://example.com/math-book-12-part1",
    type: "book",
    subject: "بیركاری",
    teacher: "مامۆستا ئارام",
    track: "زانیاری",
    image: "https://placehold.co/800x500/50b2ed/ffffff?text=Math+Book",
  },
  {
    title: "ڤیدیۆی فیزیا پۆلی ١٢ - بەندی وزە",
    url: "https://youtube.com/physics-energy-video",
    type: "video",
    subject: "فیزیا",
    teacher: "مامۆستا هوراز",
    track: "زانیاری",
    image: "https://placehold.co/800x500/ef4444/ffffff?text=Physics+Video",
  },
  {
    title: "تاقی ئەنجامی کوردی پۆلی ٩",
    url: "https://example.com/kurdish-exam-9",
    type: "exam",
    subject: "کوردی",
    teacher: "",
    track: "گشتی",
    image: "https://placehold.co/800x500/f97316/ffffff?text=Kurdish+Exam",
  },
  {
    title: "کتێبی ئینگلیزی پۆلی ١٠ - گرامەر",
    url: "https://example.com/english-grammar-book",
    type: "book",
    subject: "ئینگلیزی",
    teacher: "مامۆستا سارا",
    track: "گشتی",
    image: "https://placehold.co/800x500/3b82f6/ffffff?text=English+Book",
  },
  {
    title: "ڤیدیۆی کیمیا پۆلی ١١ - کاردانەوەکان",
    url: "https://youtube.com/chemistry-reactions-video",
    type: "video",
    subject: "کیمیا",
    teacher: "مامۆستا ناز",
    track: "زانیاری",
    image: "https://placehold.co/800x500/a855f7/ffffff?text=Chemistry+Video",
  },
  {
    title: "تاقی ئەنجامی بیركاری پۆلی ١٢ - بەشی دووەم",
    url: "https://example.com/math-exam-12-part2",
    type: "exam",
    subject: "بیركاری",
    teacher: "",
    track: "زانیاری",
    image: "https://placehold.co/800x500/22c55e/ffffff?text=Math+Exam",
  },
  {
    title: "کتێبی کوردی پۆلی ٨ - نووسین",
    url: "https://example.com/kurdish-writing-book",
    type: "book",
    subject: "کوردی",
    teacher: "مامۆستا عومەر",
    track: "گشتی",
    image: "https://placehold.co/800x500/ec4899/ffffff?text=Kurdish+Book",
  },
  {
    title: "ڤیدیۆی ئەندازیارى پۆلی ١٢ - سێڕوویی",
    url: "https://youtube.com/engineering-3d-video",
    type: "video",
    subject: "ئەندازیارى",
    teacher: "مامۆستا رێبوار",
    track: "زانستی",
    image: "https://placehold.co/800x500/14b8a6/ffffff?text=Engineering+Video",
  },
  {
    title: "تاقی ئەنجامی ئینگلیزی پۆلی ١٠",
    url: "https://example.com/english-exam-10",
    type: "exam",
    subject: "ئینگلیزی",
    teacher: "",
    track: "گشتی",
    image: "https://placehold.co/800x500/fcd34d/000000?text=English+Exam",
  },
  {
    title: "کتێبی فیزیا پۆلی ١٠ - جووڵە",
    url: "https://example.com/physics-motion-book",
    type: "book",
    subject: "فیزیا",
    teacher: "مامۆستا هوراز",
    track: "زانیاری",
    image: "https://placehold.co/800x500/c026d3/ffffff?text=Physics+Book",
  },
  {
    title: "ڤیدیۆی کوردی پۆلی ٧ - چیرۆک",
    url: "https://youtube.com/kurdish-story-video",
    type: "video",
    subject: "کوردی",
    teacher: "مامۆستا هێمن",
    track: "گشتی",
    image: "https://placehold.co/800x500/fb7185/ffffff?text=Kurdish+Video",
  },
  {
    title: "تاقی ئەنجامی کیمیا پۆلی ١١",
    url: "https://example.com/chemistry-exam-11",
    type: "exam",
    subject: "کیمیا",
    teacher: "",
    track: "زانیاری",
    image: "https://placehold.co/800x500/60a5fa/ffffff?text=Chemistry+Exam",
  },
  {
    title: "کتێبی کیمیا پۆلی ١٢ - بەشی ئۆرگانی",
    url: "https://example.com/organic-chemistry-book",
    type: "book",
    subject: "کیمیا",
    teacher: "مامۆستا ناز",
    track: "زانیاری",
    image: "https://placehold.co/800x500/84cc16/ffffff?text=Organic+Chem",
  },
];

const filterItems = [
  { name: "کتێب", type: "book", icon: BookOpen, hue: "from-sky-600/20 to-blue-600/20" },
  { name: "مه‌لزه‌مه‌", type: "booklet", icon: Book, hue: "from-violet-600/20 to-fuchsia-600/20" },
  { name: "ڤیدیۆ", type: "video", icon: Video, hue: "from-red-500/20 to-rose-500/20" },
  { name: "ئه‌سیله‌", type: "exam", icon: FileText, hue: "from-amber-500/20 to-yellow-500/20" },
];

const scienceFilter = ["زانستی", "ئەدەبی"]; // shown for >= grade10

const gradeNames = {
  grade7: "پۆلی 7",
  grade8: "پۆلی 8",
  grade9: "پۆلی 9",
  grade10: "پۆلی 10",
  grade11: "پۆلی 11",
  grade12: "پۆلی 12",
};

// ---------------------------- Helpers ----------------------------
const variants = {
  chip: {
    rest: { y: 0, opacity: 1 },
    hover: { y: -2, transition: { type: "spring", stiffness: 400, damping: 20 } },
    press: { scale: 0.98 },
    active: { y: -1, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" },
  },
  card: { rest: { y: 0, opacity: 1 }, hover: { y: -3 } },
};

const typeBadge = {
  book: "bg-sky-600/15 text-sky-300 ring-sky-500/20",
  booklet: "bg-violet-600/15 text-violet-300 ring-violet-500/20",
  video: "bg-rose-600/15 text-rose-300 ring-rose-500/20",
  exam: "bg-amber-600/15 text-amber-300 ring-amber-500/20",
};

function useTypeCounts(list) {
  return useMemo(() => {
    const counts = { book: 0, booklet: 0, video: 0, exam: 0 };
    for (const item of list) counts[item.type]++;
    return counts;
  }, [list]);
}

// ---------------------------- ContentDisplay ----------------------------
function ContentDisplay({ filter, track, search }) {
  const [subject, setSubject] = useState("");
  const [teacher, setTeacher] = useState("");

  const filteredProducts = useMemo(() => {
    return sampleProducts.filter((item) => {
      if (item.type !== filter) return false;
      if (track && item.track !== track) return false;
      if (filter === "exam") {
        if (subject && item.subject !== subject) return false;
      } else {
        if (subject && item.subject !== subject) return false;
        if (teacher && item.teacher !== teacher) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const hit =
          item.title.toLowerCase().includes(q) ||
          item.subject.toLowerCase().includes(q) ||
          (item.teacher || "").toLowerCase().includes(q) ||
          (item.track || "").toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [filter, track, subject, teacher, search]);

  const resetFilters = () => {
    setSubject("");
    setTeacher("");
  };

  return (
    <div className="space-y-6">
      {/* Subject/Teacher Selects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-md border border-slate-100/70 dark:border-white/10">
        <div className="w-full space-y-2">
          <label className="text-sm font-bold text-zinc-700 dark:text-zinc-200">📚 بابەت هەڵبژێرە</label>
          <select
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setTeacher("");
            }}
            className="w-full p-3 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">-- هەڵبژاردن --</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {filter !== "exam" && (
          <div className={`w-full space-y-2 transition-all duration-300 ${subject ? "opacity-100" : "opacity-60 pointer-events-none"}`}>
            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-200">👨‍🏫 مامۆستا هەڵبژێرە</label>
            <select
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              disabled={!subject}
            >
              <option value="">-- هەڵبژاردن --</option>
              {(teachersBySubject[subject] || []).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="sm:col-span-2 flex items-center justify-end gap-2">
          {(subject || teacher) && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200/70 dark:hover:bg-zinc-700"
            >
              <X size={14} /> ریست
            </button>
          )}
        </div>
      </div>

      {/* Cards */}
      <AnimatePresence initial={false}>
        {filteredProducts.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {filteredProducts.map((p, i) => (
              <motion.a
                key={p.url + i}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                variants={variants.card}
                initial="rest"
                whileHover="hover"
                className="group relative overflow-hidden rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="relative">
                  <img src={p.image} alt={p.title} className="w-full h-36 object-cover" />
                  {/* subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                  {/* top-left type badge */}
                  <div className={`absolute top-3 left-3 text-[11px] px-2 py-1 rounded-full ring-1 ${typeBadge[p.type]}`}>
                    {p.type === "video" ? "ڤیدیۆ" : p.type === "book" ? "کتێب" : p.type === "booklet" ? "مەڵزەمە" : "ئه‌سیله‌"}
                  </div>
                  {/* play icon on videos */}
                  {p.type === "video" && (
                    <PlayCircle className="absolute inset-0 m-auto w-14 h-14 text-white/90 drop-shadow-[0_6px_20px_rgba(0,0,0,0.35)] opacity-90 group-hover:scale-105 transition" />
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="line-clamp-2 text-[15px] font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">
                    {p.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-[12px] text-zinc-600 dark:text-zinc-300">
                    <span className="inline-flex items-center gap-1">
                      <span className="font-semibold">{p.subject}</span>
                      {p.teacher && <span className="text-zinc-400">– {p.teacher}</span>}
                    </span>
                    {p.track && (
                      <span className="ml-auto px-2 py-0.5 rounded-full text-[11px] bg-emerald-600/15 text-emerald-400 ring-1 ring-emerald-500/20">
                        {p.track}
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-4 pb-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[12px] text-zinc-500">
                    <ExternalLink size={14} /> کراوه‌یه‌کی دراوسێ
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      navigator.clipboard?.writeText(p.url);
                    }}
                    className="inline-flex items-center gap-1 text-[12px] px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200/70 dark:hover:bg-zinc-700"
                  >
                    <LinkIcon size={14} /> لینک
                  </button>
                </div>
              </motion.a>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-zinc-400 text-sm py-14"
          >
            هیچ ناوەرۆک نەدۆزرایەوە 😔
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------- Main Students ----------------------------
export default function StudentsBeautiful() {
  const { grade } = useParams();
  const gradeNum = parseInt(grade?.replace("grade", "")) || 0;

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("book");
  const [trackFilter, setTrackFilter] = useState("");

  const typeCounts = useTypeCounts(sampleProducts);

  const buttonBase =
    "px-3 py-1.5 rounded-full text-[12px] sm:text-[13px] font-medium transition-all whitespace-nowrap flex items-center gap-1.5 justify-center ring-1";

  return (
    <div dir="rtl" className="space-y-6">
      {/* Title + mini stats */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-sky-50 to-white dark:from-indigo-950/40 dark:to-zinc-950/50 border border-slate-100 dark:border-white/10 p-5">
        <div className="absolute -left-16 -top-16 w-48 h-48 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute -right-10 -bottom-16 w-40 h-40 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative">
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Bookmark className="text-sky-500" size={20} /> بابه‌ته‌كان – {gradeNames[grade]}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
            کتێب، مەڵزەمە، ڤیدیۆ و ئەسیلە — هەمووی لێرە فلتەر بکە.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 size={14} className="text-emerald-500" /> {sampleProducts.length} ناوەرۆک
            </span>
            <span className="inline-flex items-center gap-1">•</span>
            <span className="inline-flex items-center gap-1">کتێب: {typeCounts.book}</span>
            <span className="inline-flex items-center gap-1">مه‌لزه‌مه‌: {typeCounts.booklet}</span>
            <span className="inline-flex items-center gap-1">ڤیدیۆ: {typeCounts.video}</span>
            <span className="inline-flex items-center gap-1">ئه‌سیله‌: {typeCounts.exam}</span>
          </div>
        </div>
      </div>

      {/* Sticky, COMPACT filter bar */}
      <div className="sticky -top-3 z-30">
        <div className="backdrop-blur bg-white/80 dark:bg-zinc-900/80 border border-slate-100 dark:border-white/10 rounded-xl p-2 shadow-sm">
          {/* Search (compact) */}
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="گەڕان..."
              className="w-full pr-8 pl-2 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[12px] text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <Search size={16} className="absolute right-2 top-1.5 text-zinc-400" />
          </div>

          {/* Main filter chips — compact horizontal scroll */}
          <div className="mt-2 -mx-1 overflow-x-auto no-scrollbar">
            <div className="px- flex gap-1.5">
              {filterItems.map((item) => {
                const Icon = item.icon;
                const active = activeFilter === item.type;
                return (
                  <motion.button
                    key={item.type}
                    variants={variants.chip}
                    initial="rest"
                    whileHover="hover"
                    whileTap="press"
                    animate={active ? "active" : "rest"}
                    onClick={() => setActiveFilter(item.type)}
                    className={`${buttonBase} ${
                      active
                        ? "bg-sky-600 text-white ring-sky-500/50 shadow-md"
                        : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-sky-50/60 dark:hover:bg-zinc-700/60 ring-white/10"
                    }`}
                  >
                    <span className={`grid place-items-center rounded-md p-1 bg-gradient-to-tr ${item.hue}`}>
                      <Icon size={14} className="text-sky-300" />
                    </span>
                    {item.name}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Track filter (grade >= 10) — compact pills */}
          {gradeNum >= 10 && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[11px] text-zinc-500 inline-flex items-center gap-1">
                <Filter size={13} /> لق:
              </span>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {scienceFilter.map((t) => {
                  const active = trackFilter === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setTrackFilter(active ? "" : t)}
                      className={`${buttonBase} ${
                        active
                          ? "bg-emerald-600 text-white ring-emerald-500/50 shadow-md"
                          : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-emerald-50/60 dark:hover:bg-zinc-700/60 ring-white/10"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
                {trackFilter && (
                  <button
                    onClick={() => setTrackFilter("")}
                    className="px-2 py-1 rounded-full text-[11px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200/70 dark:hover:bg-zinc-700"
                  >
                    <X size={12} className="inline" /> ریست
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <ContentDisplay filter={activeFilter} track={trackFilter} search={search} />

      {/* Back to dashboard (optional) */}
      <div className="flex justify-center">
        <NavLink
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/70 dark:hover:bg-zinc-700 border border-slate-200/70 dark:border-white/10"
        >
          گەڕانەوە <ChevronLeft size={16} />
        </NavLink>
      </div>
    </div>
  );
}
