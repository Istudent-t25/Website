// pages/ExamsPortalPro.jsx
// Exams Portal — EVERYTHING edition (RTL, Tailwind, Framer Motion)
// - Card 1: National Exam → Subject → Years (collapse) → Terms (or open URL)
// - Card 2: Important Notes (grid)
// - Card 3: Practice/Exams list (filters, sort, tags)
// - Extra panels: Answer Keys, Analyses, Summaries
// - Sticky mini-filter bar, skeleton loading, Favorites, Solved/Unsolved, Recently Viewed
// - Share/Copy links, Batch download stub
//
// Uses your gradient cover (aspect-video). Colors kept (indigo → sky, zinc, emerald).
// NOTE: Replace '#' links with real URLs. No server required; state persists via localStorage.

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import {
  BookOpenCheck, GraduationCap, ChevronDown, ChevronUp, ExternalLink,
  Users, FileText, StickyNote, Link as LinkIcon, Filter, Search,
  Star, StarOff, CheckCircle2, Circle, Clock, Share2, Download, Trash2, Layers, Heart
} from "lucide-react";

const EASE = [0.22, 0.61, 0.36, 1];

const SUBJECTS = [
  { key: "math", name: "بیركاری" },
  { key: "biology", name: "بايۆلۆجی" },
  { key: "kurdish", name: "زمانی کوردی" },
  { key: "arabic", name: "زمانی عەڕەبی" },
  { key: "english", name: "زمانی ئینگلیزی" },
  { key: "physics", name: "فیزیا" },
  { key: "chemistry", name: "کیمیا" },
];

const GRADE_NAME = (g) => (g ? `پۆلی ${g}` : "پۆل");

const typeLabel = (t) =>
  t === "video" ? "ڤیدیۆ"
: t === "book" ? "کتێب"
: t === "booklet" ? "مەڵزەمە"
: t === "answer" ? "وەڵامنامە"
: t === "notes" ? "تێبینی"
: t === "summary" ? "کورتکراوە"
: t === "analysis" ? "ئانالیز"
: t === "exam" ? "ئه‌سیله‌"
: "ناوەرۆک";

/* ---------------- Demo DATA (replace '#' with real links) ---------------- */
const NATIONAL = {
  math: {
    years: [
      { label: "2021–2022", terms: ["Term 1", "Term 2"] },
      { label: "2022–2023", href: "#" }, // no terms → go directly
      { label: "2023–2024", terms: ["Term 1", "Term 2"] },
    ],
    termLinks: {
      "2021–2022": { "Term 1": "#", "Term 2": "#" },
      "2023–2024": { "Term 1": "#", "Term 2": "#" },
    },
  },
  biology: {
    years: [
      { label: "2021–2022", terms: ["Term 1", "Term 2"] },
      { label: "2022–2023", href: "#" },
      { label: "2023–2024", terms: ["Term 1", "Term 2"] },
    ],
    termLinks: {
      "2021–2022": { "Term 1": "#", "Term 2": "#" },
      "2023–2024": { "Term 1": "#", "Term 2": "#" },
    },
  },
  kurdish: { years: [{ label: "2023–2024", href: "#" }], termLinks: {} },
  arabic:  { years: [{ label: "2023–2024", href: "#" }], termLinks: {} },
  english: { years: [{ label: "2023–2024", terms: ["Term 1"] }], termLinks: { "2023–2024": { "Term 1": "#" } } },
  physics: { years: [{ label: "2022–2023", href: "#" }], termLinks: {} },
  chemistry:{ years: [{ label: "2022–2023", terms: ["Term 2"] }], termLinks: { "2022–2023": { "Term 2": "#" } } },
};

// Important notes (grid)
const NOTES = [
  { id: "n-bio-hoshyar", subject: "بايۆلۆجی", teacher: "مامۆستا هۆشیار", title: "تێبینی گرنگ — فصل ٣", href: "#", grade: 12, type: "notes" },
  { id: "n-math-omed",   subject: "بیركاری",  teacher: "مامۆستا ئۆمەد",   title: "پوینتە گرنگ — دیفرانسیال", href: "#", grade: 12, type: "notes" },
  { id: "n-phys-rawand", subject: "فیزیا",    teacher: "مامۆستا ڕەواند",  title: "کورتکراوە — موجەکان",     href: "#", grade: 12, type: "summary" },
];

// Practice/Exams (list)
const PRACTICE = [
  { id: "p-math-250", subject: "بیركاری", title: "٢٥٠ پرسیاری قورس", teacher: "مامۆستا ئارام", href: "#", tags: ["تمرین"], createdAt: "2024-11-12" },
  { id: "p-bio-pack", subject: "بايۆلۆجی", title: "کۆمپڵێکشن پرسیار + وەڵام", teacher: "مامۆستا ناز", href: "#", tags: ["بانک"], createdAt: "2025-02-03" },
  { id: "p-eng-read", subject: "زمانی ئینگلیزی", title: "Reading Practice Set A", teacher: "مامۆستا سارا", href: "#", tags: ["Reading"], createdAt: "2024-06-10" },
];

// Answer keys / Analyses / Summaries (extra panels)
const ANSWER_KEYS = [
  { id: "ak-math-2324-t1", subject: "بیركاری", title: "وەڵامنامە 2023–2024 تێرم ١", href: "#", grade: 12, type: "answer" },
];
const ANALYSES = [
  { id: "an-bio-2122", subject: "بايۆلۆجی", title: "ئانالیزی پرسیارەکانی 2021–2022", href: "#", grade: 12, type: "analysis" },
];
const SUMMARIES = [
  { id: "sm-phys-wave", subject: "فیزیا", title: "کورتکراوە — موجەکان (تێرم ٢)", href: "#", grade: 12, type: "summary" },
];
function GradientCover({ title, subtitle, tag }) {
  return (
    <div className="relative aspect-video bg-gradient-to-br from-indigo-700 to-sky-600 text-white rounded-2xl overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center p-5 text-center">
        <div className="space-y-1.5">
          <h3 className="text-lg md:text-xl font-extrabold leading-snug line-clamp-2">{title}</h3>
          {subtitle && (
            <p className="text-xs md:text-sm/5 opacity-90 line-clamp-1">{subtitle}</p>
          )}
          {tag && (
            <span className="inline-block text-[11px] px-2 py-0.5 rounded-full ring-1 ring-white/30/60">
              {tag}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Helpers: persistence ---------------- */
const readLS = (k, fb) => {
  try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v ?? fb; } catch { return fb; }
};
const writeLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

/* ---------------- Sticky mini-filter bar ---------------- */
function StickyBar({ subject, setSubject, q, setQ, pinned, togglePin, quickYear, setQuickYear }) {
  return (
    <div className="sticky top-0 z-20">
      <div className="backdrop-blur bg-white/75 dark:bg-zinc-900/75 border border-slate-100 dark:border-white/10 rounded-xl p-2 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {/* Pinned star */}
          <button
            onClick={() => togglePin(subject)}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/70 dark:hover:bg-zinc-700"
            title="بابەتی دڵخواز"
          >
            {pinned[subject] ? <Star className="text-amber-400" size={16} /> : <StarOff className="text-zinc-500" size={16} />}
          </button>

          {/* Quick Subject */}
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {SUBJECTS.map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}
          </select>

          {/* Quick Year (for national search/jump) */}
          <select
            value={quickYear}
            onChange={(e) => setQuickYear(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">ساڵ</option>
            {(NATIONAL[subject]?.years || []).map((y) => (
              <option key={y.label} value={y.label}>{y.label}</option>
            ))}
          </select>

          {/* Search */}
          <div className="relative ml-auto min-w-[10rem]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="گەڕان بە ناونیشان/مامۆستا/ساڵ…"
              className="w-full bg-zinc-100 dark:bg-zinc-800 text-[13px] text-zinc-800 dark:text-zinc-100 rounded-xl pr-3 pl-8 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <Search size={16} className="absolute left-2.5 top-2.5 text-zinc-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Section Card (full-card toggle) ---------------- */
function SectionCard({ title, subtitle, open, onToggle, icon: Icon }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.16, ease: EASE }}
      onClick={onToggle}
      role="button"
      aria-expanded={open}
      className="cursor-pointer rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-white/10 shadow-sm overflow-hidden"
    >
      <div className="flex items-center gap-3 p-4">
        {Icon && <Icon size={24} className="text-sky-500 flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] md:text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
          <p className="text-[12px] md:text-[13px] text-zinc-500 line-clamp-1">{subtitle}</p>
        </div>
        <span className="text-zinc-400 transition-transform duration-200">{open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
      </div>
    </motion.div>
  );
}

/* ---------------- Skeleton ---------------- */
function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-zinc-900">
      <div className="animate-pulse">
        <div className="aspect-video bg-zinc-200/70 dark:bg-zinc-800" />
        <div className="p-4 space-y-2">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

/* ---------------- National Exam Card Component ---------------- */
// Moved outside NationalDrill to be a direct child of ExamsPortalPro or other top-level components
// to ensure it is within a Router context.
function NationalExamCard({ item }) {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleClick = (e) => {
    e.preventDefault();
    // addRecent({ id: `${item.subject}-${item.year}-${item.term}`, title: `${item.subject} - ${item.year} (${item.term})`, href: item.href });
    // Navigate to ExamsGrade12 with filters, using the correct path from App.jsx
    navigate(`/exams/grade12?subject=${item.subjectKey}&year=${item.year}&term=${item.term}`);
  };

  return (
    <a
      href={item.href} // Keep href for accessibility/fallback
      target="_blank"
      rel="noopener noreferrer"
      className="group relative overflow-hidden rounded-3xl bg-zinc-950 ring-1 ring-white/10 hover:ring-sky-500 transition-all duration-300 shadow-lg hover:shadow-sky-500/20"
      onClick={handleClick} // Use handleClick for navigation
    >
      <div className="relative p-6 sm:p-8 space-y-4">
        <div className="absolute inset-0 bg-grid-white/[0.03]"/>
        <div className="relative z-10">
          <h3 className="text-2xl font-extrabold text-white">{item.year}</h3>
          <p className="mt-1 text-sm text-zinc-400">{item.subject} • {item.term}</p>
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <span className="inline-block text-[11px] px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/25 font-semibold">
            تاقیکردنەوەی نیشتیمانی
          </span>
          <ExternalLink size={20} className="text-zinc-500 group-hover:text-sky-400 transition" />
        </div>
      </div>
    </a>
  );
}


/* ---------------- National Drill (Main component for National Exams section) ---------------- */
function NationalDrillWrapper() { // Renamed to avoid using useNavigate directly in a sub-component rendered conditionally
  const navigate = useNavigate(); // Initialize useNavigate once here
  const [subject, setSubject] = useState("math");
  const [q, setQ] = useState("");
  const [quickYear, setQuickYear] = useState("");
  const [open, setOpen] = useState(true);
  const [yearOpen, setYearOpen] = useState(null);
  const [loading, setLoading] = useState(false);

  // filter years by search or quickYear
  const years = useMemo(() => {
    const base = (NATIONAL[subject]?.years || []);
    if (!q && !quickYear) return base;
    return base.filter((y) => {
      const s = (q || "").toLowerCase();
      const passQ = s ? y.label.toLowerCase().includes(s) : true;
      const passQuick = quickYear ? y.label === quickYear : true;
      return passQ && passQuick;
    });
  }, [subject, q, quickYear]);

  useEffect(() => { setYearOpen(null); }, [subject]);

  const onToggleOpen = () => {
    setOpen((v) => !v);
    if (!open) {
      setLoading(true);
      setTimeout(() => setLoading(false), 350); // fake load
    }
  };

  const handleYearClick = (y, hasTerms) => {
    if (!hasTerms && y.href) {
      // If there are no terms but a direct link, navigate directly
      navigate(`/exams/grade12?subject=${subject}&year=${y.label}`); // Navigate internally
      return;
    }
    setYearOpen(yearOpen === y.label ? null : y.label);
  };

  return (
    <section className="space-y-3">
      <SectionCard
        title="تاقیکردنەوەی نیشتیمانی"
        subtitle="کرتە بکە → بابەت → ساڵ → تێرم (ئەگەر هەبوو)."
        icon={GraduationCap}
        open={open}
        onToggle={onToggleOpen}
      />
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="rounded-2xl border border-slate-200/70 dark:border-white/10 p-3 bg-white dark:bg-zinc-900 space-y-3"
          >
            {/* Subject chips */}
            <div className="flex flex-wrap gap-1.5">
              {SUBJECTS.map((s) => {
                const active = subject === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => { setSubject(s.key); setYearOpen(null); }}
                    className={`px-3 py-1.5 rounded-full text-[12.5px] md:text-[13px] font-medium ring-1 transition
                      ${active
                        ? "bg-sky-600 text-white ring-sky-500/50"
                        : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-sky-50/60 dark:hover:bg-zinc-700/60 ring-white/10"}`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>

            {/* Years → Terms */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                <SkeletonCard /><SkeletonCard /><SkeletonCard />
              </div>
            ) : (
              <div className="space-y-2">
                {years.map((y) => {
                  const openRow = yearOpen === y.label;
                  const hasTerms = Array.isArray(y.terms) && y.terms.length > 0;
                  return (
                    <div key={y.label} className="rounded-2xl border border-zinc-200/70 dark:border-white/10 overflow-hidden">
                      <button
                        onClick={() => handleYearClick(y, hasTerms)}
                        className="w-full px-3 py-2.5 md:py-3 flex items-center justify-between text-right text-[13.5px] md:text-[14px] font-semibold hover:bg-zinc-50/70 dark:hover:bg-zinc-800/60 transition"
                        title={hasTerms ? "کردنەوەی تێرمەکان" : "کردنەوەی بەستەر"}
                      >
                        <span className="flex items-center gap-2">
                          <GraduationCap size={18} className="text-sky-500" />
                          {y.label}
                        </span>
                        {hasTerms ? (openRow ? <ChevronUp size={20} /> : <ChevronDown size={20} />) : <ExternalLink size={18} className="text-zinc-400" />}
                      </button>

                      <AnimatePresence initial={false}>
                        {hasTerms && openRow && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18, ease: EASE }}
                            className="px-3 pb-3"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                              {y.terms.map((t) => {
                                const href = (NATIONAL[subject].termLinks?.[y.label] || {})[t] || "#";
                                return (
                                  <NationalExamCard
                                    key={t}
                                    item={{
                                      subject: SUBJECTS.find(s=>s.key===subject)?.name,
                                      subjectKey: subject, // Pass the key for filtering
                                      year: y.label,
                                      term: t,
                                      href
                                    }}
                                  />
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ---------------- Notes (grid) ---------------- */
function NotesCard({ item }) {
  // addRecent is not defined here. Ensure it's passed as a prop or defined globally if needed.
  // For now, removing the call or assuming it's passed down.
  const handleCardClick = (e) => {
    e.preventDefault();
    // if (addRecent) addRecent({ id: item.id, title: item.title, href: item.href });
    window.open(item.href, "_blank", "noopener,noreferrer");
  };

  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative overflow-hidden rounded-3xl border border-teal-200/30 bg-white/50 backdrop-blur-sm shadow-md hover:shadow-xl hover:shadow-teal-400/20 transition-all duration-300"
      onClick={handleCardClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent z-0" />
      <div className="relative p-6 space-y-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex-shrink-0 rounded-full bg-teal-500/15 flex items-center justify-center">
            <StickyNote size={24} className="text-teal-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 line-clamp-2">{item.title}</h3>
            <p className="mt-0.5 text-sm text-zinc-600 line-clamp-1">{item.teacher}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 ring-1 ring-teal-500/20">{item.subject}</span>
          <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 ring-1 ring-teal-500/20">{GRADE_NAME(item.grade)}</span>
        </div>
      </div>
    </a>
  );
}
function NotesPanel() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (open) { setLoading(true); const t = setTimeout(()=>setLoading(false), 300); return ()=>clearTimeout(t); }
  }, [open]);

  return (
    <section className="space-y-3">
      <SectionCard
        title="تێبینی گرنگ"
        subtitle="کرتە بکە → کارتەکانی مامۆستانە ببینە (بابەت بە بابەت)."
        icon={StickyNote}
        open={open}
        onToggle={() => setOpen(v=>!v)}
      />

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="rounded-2xl border border-slate-200/70 dark:border-white/10 p-3 bg-white dark:bg-zinc-900"
          >
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                <SkeletonCard /><SkeletonCard /><SkeletonCard />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {NOTES.map((n) => (
                  <NotesCard key={n.id} item={n} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ---------------- Practice/Exams (list with filters/tags/sort) ---------------- */
function PracticePanel() {
  const [open, setOpen] = useState(false);

  const solved = readLS("solved", {});
  const toggleSolved = (id) => { const next = { ...solved, [id]: !solved[id] }; writeLS("solved", next); force(); };

  const favored = readLS("favored", {});
  const toggleFav = (id) => { const next = { ...favored, [id]: !favored[id] }; writeLS("favored", next); force(); };

  // quick force update
  const [, setTick] = useState(0);
  const force = () => setTick((t) => t + 1);

  const list = useMemo(() => {
    return PRACTICE;
  }, []);

  return (
    <section className="space-y-3">
      <SectionCard
        title="تاقی ئەنجام / تمرین (PDF)"
        subtitle="فلتەری تاگەکان، ڕیزکردن، دڵخواز و 'کراوە' بۆ خۆت."
        icon={BookOpenCheck}
        open={open}
        onToggle={() => setOpen(v=>!v)}
      />

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: EASE }}
            className="rounded-2xl border border-slate-200/70 dark:border-white/10 p-3 bg-white dark:bg-zinc-900 space-y-2"
          >
            {/* List */}
            {list.map((p) => (
              <PracticeRow
                key={p.id}
                item={p}
                solved={!!solved[p.id]}
                favored={!!favored[p.id]}
                onToggleSolved={() => toggleSolved(p.id)}
                onToggleFav={() => toggleFav(p.id)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function PracticeRow({ item, solved, favored, onToggleSolved, onToggleFav }) {
  // addRecent is not defined here.
  const handleLinkClick = (e) => {
    // if (addRecent) addRecent({ id: item.id, title: item.title, href: item.href });
  };
  return (
    <div className="p-4 rounded-2xl bg-zinc-900 ring-1 ring-white/10 space-y-3 transition-all duration-300 hover:ring-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-zinc-100 hover:text-sky-400 transition"
            onClick={handleLinkClick}>
            {item.title}
          </a>
          <p className="mt-1 text-xs text-zinc-400 flex flex-wrap items-center gap-2">
            <span>{item.subject}</span>
            <span className="text-zinc-600">•</span>
            <span className="inline-flex items-center gap-1"><Users size={12} /> {item.teacher}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onToggleFav} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 transition" title="دڵخواز">
            {favored ? <Star className="text-amber-400" size={16} /> : <StarOff size={16} className="text-zinc-500" />}
          </button>
          <button onClick={onToggleSolved} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 transition" title="کراوە">
            {solved ? <CheckCircle2 className="text-emerald-500" size={16} /> : <Circle size={16} className="text-zinc-500" />}
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-800">
        {item.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((t, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 ring-1 ring-zinc-700">{t}</span>
            ))}
          </div>
        )}
        <a
          href={item.href} target="_blank" rel="noopener noreferrer"
          className="ml-auto text-[12px] px-3 py-1.5 rounded-full bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/25 transition-all duration-300 hover:bg-sky-500/25 inline-flex items-center gap-1"
          onClick={handleLinkClick}
        >
          <ExternalLink size={14} /> کردنەوە
        </a>
      </div>
    </div>
  );
}

/* ---------------- Extra Panels: Answer Keys / Analyses / Summaries ---------------- */
function SimpleCard({ item, icon: Icon, color, colorDark }) {
  // addRecent is not defined here.
  const handleCardClick = (e) => {
    e.preventDefault();
    // if (addRecent) addRecent({ id: item.id, title: item.title, href: item.href });
    window.open(item.href, "_blank", "noopener,noreferrer");
  };

  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative overflow-hidden rounded-3xl border border-${colorDark}/30 bg-white/50 backdrop-blur-sm shadow-md hover:shadow-xl hover:shadow-${color}/20 transition-all duration-300`}
      onClick={handleCardClick}
    >
      <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/10 to-transparent z-0`} />
      <div className="relative p-6 space-y-4 z-10">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 flex-shrink-0 rounded-full bg-${color}-500/15 flex items-center justify-center`}>
            <Icon size={24} className={`text-${color}-400`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 line-clamp-2">{item.title}</h3>
            <p className="mt-0.5 text-sm text-zinc-600 line-clamp-1">{item.subject}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className={`px-3 py-1 rounded-full bg-${color}-500/10 text-${color}-600 ring-1 ring-${color}-500/20`}>{item.type}</span>
          <span className={`px-3 py-1 rounded-full bg-${color}-500/10 text-${color}-600 ring-1 ring-${color}-500/20`}>{GRADE_NAME(item.grade)}</span>
        </div>
      </div>
    </a>
  );
}

function SimpleCardsPanel({ title, items, icon: Icon, type }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (open) { setLoading(true); const t = setTimeout(()=>setLoading(false), 300); return ()=>clearTimeout(t); }
  }, [open]);
  const colors = {
    answer: { name: "emerald", icon: FileText },
    analysis: { name: "amber", icon: FileText },
    summary: { name: "rose", icon: StickyNote },
  };

  return (
    <section className="space-y-3">
      <SectionCard
        title={title}
        subtitle="کارتی قەشەنگ، کلیک بکە بۆ کردنەوەی پەیوەندیدار."
        icon={Icon}
        open={open}
        onToggle={() => setOpen(v=>!v)}
      />
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="rounded-2xl border border-slate-200/70 dark:border-white/10 p-3 bg-white dark:bg-zinc-900"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {loading ? (
                <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
              ) : (
                items.map((n) => (
                  <SimpleCard
                    key={n.id}
                    item={{ ...n, type: typeLabel(n.type || type) }}
                    icon={colors[type].icon}
                    color={colors[type].name}
                    colorDark={colors[type].name}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ---------------- Favorites Panel ---------------- */
function FavoritesPanel({ allItems, favored }) {
  const [open, setOpen] = useState(false);
  const favoriteItems = useMemo(() => {
    return allItems.filter(item => favored[item.id]);
  }, [allItems, favored]);

  return (
    <section className="space-y-3">
      <SectionCard
        title="دڵخوازەکان"
        subtitle="کرتە بکە بۆ بینینی هەموو ئەو بابەتانەی کردووتن بە دڵخواز."
        icon={Heart}
        open={open}
        onToggle={() => setOpen(v => !v)}
      />
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="rounded-2xl border border-slate-200/70 dark:border-white/10 p-3 bg-white dark:bg-zinc-900"
          >
            {favoriteItems.length === 0 ? (
              <p className="text-center text-zinc-500 py-4">
                هیچ بابەتێک وەک دڵخواز زیاد نەکراوە. لەسەر کارتی بابەتەکە کرتە لە ئەستێرەکە بکە.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {favoriteItems.map((item) => (
                  <SimpleCard key={item.id} item={item} icon={Star} color="amber" colorDark="amber" />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}


/* ---------------- Recents & Favorites (summary bar) ---------------- */
// Re-added addRecent to the top-level scope or ensure it's passed as a prop if used in sub-components
function addRecent(r) {
  const prev = readLS("recents", []);
  const next = [r, ...prev.filter(x=>x.id!==r.id)].slice(0, 15);
  writeLS("recents", next);
}

function MetaBar() {
  const recents = readLS("recents", []);
  const favored = readLS("favored", {});

  const favCount = Object.values(favored).filter(Boolean).length;

  if (recents.length === 0 && favCount === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 p-3 bg-white dark:bg-zinc-900 text-[12.5px] flex flex-wrap items-center gap-2">
      <Layers size={14} className="text-sky-500" />
      {favCount > 0 && <span>دڵخواز: <strong>{favCount}</strong></span>}
      {recents.length > 0 && (
        <span className="flex items-center gap-1">
          <Clock size={14} />
          دوایین:
          <span className="flex items-center gap-1">
            {recents.slice(0,5).map((r,i)=>(
              <a key={r.id} href={r.href} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted">
                {i>0 && "، "}{r.title}
              </a>
            ))}
          </span>
        </span>
      )}
    </div>
  );
}

/* ---------------- Share & Download helpers ---------------- */
function shareLink(item) {
  const url = item.href || window.location.href;
  const text = item.title || "Exams";
  if (navigator.share) {
    navigator.share({ title: text, url }).catch(()=>{});
  } else {
    navigator.clipboard?.writeText(url);
    alert("بەستەر کۆپی کرا.");
  }
}
function stubBatchDownload() {
  alert("Batch download: ئەمکردارە دێتە کارا کردنەوە لە داهاتوو (ZIP/pack). لە ئێستادا تکایە تاقیکردنەوەکان یەک بە یەک داگرە.");
}

function clearRecents() {
  writeLS("recents", []);
  alert("لیستی دوایین پاک کرا.");
}
export default function ExamsPortalPro() {
  const [subject, setSubject] = useState("math");
  const [q, setQ] = useState("");
  const [quickYear, setQuickYear] = useState("");
  // --- New state for the overlay ---
  const [isUnderConstruction, setIsUnderConstruction] = useState(true); // Set to 'true' to show the overlay
  // --- End of new state ---

  const allData = useMemo(() => {
    const nationalItems = Object.values(NATIONAL).flatMap(subj =>
      subj.years.flatMap(year =>
        year.terms ? year.terms.map(term => {
          // Find subject name and key based on the current `subj` object in NATIONAL
          const subjectEntry = SUBJECTS.find(s => {
            for (const key in NATIONAL) {
              if (NATIONAL[key] === subj) {
                return s.key === key;
              }
            }
            return false;
          });
          const subjectName = subjectEntry?.name || 'Unknown Subject';
          const subjectKey = subjectEntry?.key || 'unknown';

          return {
            id: `${subjectName}-${year.label}-${term}`,
            title: `${subjectName} — ${year.label} (${term})`,
            subject: "نیشتیمانی",
            subjectKey: subjectKey, // Add subjectKey here
            teacher: "ناونیشانی نیشتیمانی",
            href: subj.termLinks[year.label][term],
            type: "exam",
            grade: 12
          };
        }) : []
      )
    );

    return [...nationalItems, ...NOTES, ...PRACTICE, ...ANSWER_KEYS, ...ANALYSES, ...SUMMARIES];
  }, []);

  return (
    <>
      <div dir="rtl" className="space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-zinc-900 ring-1 ring-white/10 p-8 sm:p-12">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-6">
            <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-sky-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 sm:w-20 sm:h-20 text-sky-300">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20V6.5A2.5 2.5 0 0017.5 4H4v15.5zM12 21v-8a2.5 2.5 0 012.5-2.5h1" />
                <path d="M18 19.5A2.5 2.5 0 0020.5 17H4v2.5a2.5 2.5 0 002.5 2.5h11a2.5 2.5 0 002.5-2.5z" />
              </svg>
            </div>
            <div className="text-center sm:text-right">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">ناوچەی زانیاری</h1>
              <p className="mt-2 text-zinc-400 text-base">
                بەدوای تاقیکردنەوە نیشتیمانییەکان، کورتکراوەکان، و تاقییەکانی ئەنجامداندا بگەڕێ.
              </p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <NationalDrillWrapper /> {/* Use the wrapper component here */}
        <NotesPanel />
        <PracticePanel />
        <FavoritesPanel allItems={allData} favored={readLS("favored", {})} />

        {/* Extra panels */}
        <SimpleCardsPanel title="وەڵامنامەکان" items={ANSWER_KEYS} icon={FileText} type="answer" />
        <SimpleCardsPanel title="ئانالیزەکان" items={ANALYSES} icon={FileText} type="analysis" />
        <SimpleCardsPanel title="کورتکراوەکان" items={SUMMARIES} icon={StickyNote} type="summary" />

        {/* Recents/Favorites summary */}
        <MetaBar />
      </div>

      {/* --- The full-screen overlay component code is added here directly --- */}
      <AnimatePresence>
        {isUnderConstruction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 backdrop-blur-md bg-zinc-950/70" />
            
            <div className="relative z-10 p-8 rounded-3xl border border-white/10 shadow-2xl bg-zinc-900/50 text-white text-center max-w-lg space-y-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto text-sky-400"
              >
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
                <path d="M16 21V7" />
                <path d="M8 21V7" />
                <path d="M12 21V7" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M6 21v-3" />
                <path d="M18 21v-3" />
                <path d="M4 21v-3" />
                <path d="M20 21v-3" />
                <path d="M9 21v-3" />
                <path d="M15 21v-3" />
                <path d="M12 21v-3" />
                <path d="M17 21v-3" />
                <path d="M7 21v-3" />
                <path d="M19 21v-3" />
              </svg>
              <h2 className="text-2xl font-bold">ئه‌م به‌شه‌ لەکارکردندایه‌.</h2>
              <p className="text-zinc-300">
                ئەم بەشە لە ماڵپەڕەکەمان لە ئێستادا گەشەپێدەدرێت و بەمزووانە بەردەست دەبێت. سوپاس بۆ ئارامگریت!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* --- End of overlay code --- */}
    </>
  );
}