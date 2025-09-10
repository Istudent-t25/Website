// ExamBank.jsx — searchable, filterable bank (books / videos / exams)
// - RTL-first, dark-ready, sticky filter bar, fast search
// - Replace `DATA` with API later

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, Filter, BookOpen, Video, FileText, Star,
  Tags, ChevronLeft, ExternalLink, Link as LinkIcon
} from "lucide-react";

const TYPES = [
  { key: "exam", name: "هەڵسەنگاندن", icon: FileText, badge: "bg-amber-500/15 text-amber-300 ring-amber-500/25" },
  { key: "book", name: "کتێب", icon: BookOpen, badge: "bg-sky-500/15 text-sky-300 ring-sky-500/25" },
  { key: "video", name: "ڤیدیۆ", icon: Video, badge: "bg-rose-500/15 text-rose-300 ring-rose-500/25" },
];

const SUBJECTS = ["کوردی","ئینگلیزی","بیركاری","فیزیا","کیمیا","ئەندازیارى"];
const GRADES = ["7","8","9","10","11","12"];
const TRACKS = ["زانستی","ئەدەبی"];
const DIFFS = ["ئاسان","ناوەند","قورست"];

const tagPool = ["PDF","MCQ","دووبارەکاری","نوێ","کاتی‌کەم","وزە","ئۆرگانی","گرامەر"];

const makeThumb = (title) => {
  // Kurdish-safe SVG thumbnail (no external CDN font issues)
  const esc = (s)=>s.replace(/[&<>"']/g,c=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b1220"/>
      <stop offset="1" stop-color="#0a0a0b"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <foreignObject x="24" y="24" width="592" height="312">
    <div xmlns="http://www.w3.org/1999/xhtml"
      style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;
             direction:rtl;text-align:center;color:#e5e7eb;font-size:26px;line-height:1.4;
             font-family:'Noto Naskh Arabic','Noto Sans Arabic',system-ui,sans-serif;">
      ${esc(title)}
    </div>
  </foreignObject>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

// demo data
const DATA = Array.from({length: 36}).map((_,i)=>{
  const type = TYPES[i % TYPES.length].key;
  const subject = SUBJECTS[i % SUBJECTS.length];
  const grade = GRADES[i % GRADES.length];
  const track = TRACKS[i % TRACKS.length];
  const difficulty = DIFFS[i % DIFFS.length];
  const title =
    type === "exam" ? `هەڵسەنگاندن ${subject} پۆلی ${grade} – سێتی ${i+1}` :
    type === "book" ? `کتێبی ${subject} پۆلی ${grade} – بەشی ${1+(i%3)}` :
                      `ڤیدیۆی ${subject} پۆلی ${grade} – وانە ${1+(i%20)}`;
  const tags = [tagPool[i % tagPool.length], tagPool[(i + 3) % tagPool.length]];
  const rating = 3 + (i % 3) + (i % 2 ? 0.5 : 0);
  const questions = 10 + (i % 25);
  return {
    id: `item-${i}`,
    type, title, subject, grade, track, difficulty, questions, rating,
    url: "#",
    thumb: makeThumb(title),
  };
});

const chipCls = (active, tone="sky") =>
  `px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ring-1 transition
   ${active
    ? `bg-${tone}-600 text-white ring-${tone}-500/40`
    : `bg-white/5 text-zinc-300 ring-white/10 hover:bg-white/10`
   }`;

export default function ExamBank() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("exam");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [track, setTrack] = useState("");
  const [diff, setDiff] = useState("");
  const [tags, setTags] = useState([]);

  const results = useMemo(()=>{
    const query = q.trim().toLowerCase();
    return DATA.filter(item=>{
      if (type && item.type !== type) return false;
      if (grade && item.grade !== grade) return false;
      if (subject && item.subject !== subject) return false;
      if (track && item.track !== track) return false;
      if (diff && item.difficulty !== diff) return false;
      if (tags.length && !tags.every(t=> (item.title+t+item.subject).includes(t))) return false;
      if (query) {
        const hay = `${item.title} ${item.subject} ${item.track} ${item.difficulty}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  },[q,type,grade,subject,track,diff,tags]);

  const reset = ()=>{ setQ(""); setGrade(""); setSubject(""); setTrack(""); setDiff(""); setTags([]); };

  return (
    <div dir="rtl" className="space-y-5">
      {/* Hero / header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-indigo-950/40 via-zinc-950/60 to-zinc-950/60 ring-1 ring-white/10 p-5">
        <div className="absolute -left-16 -top-16 w-48 h-48 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute -right-10 -bottom-16 w-40 h-40 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative">
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-50 flex items-center gap-2">
            <SlidersHorizontal className="text-sky-300" size={20}/> بەنگەهێنی تاقیکردنەوە
          </h2>
          <p className="text-zinc-400 text-sm mt-1">گەڕان و فلتەر بۆ کتێب/ڤیدیۆ/تاقیکردنەوەکان.</p>
        </div>
      </div>

      {/* Sticky filters */}
      <div className="sticky -top-3 z-10">
        <div className="backdrop-blur bg-zinc-900/80 ring-1 ring-white/10 rounded-2xl p-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* search */}
            <div className="relative">
              <input
                value={q}
                onChange={e=>setQ(e.target.value)}
                placeholder="گەڕان..."
                className="w-full pr-9 pl-3 py-2.5 rounded-xl bg-zinc-800 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <Search size={18} className="absolute right-2.5 top-2.5 text-zinc-400"/>
            </div>
            {/* type chips */}
            <div className="flex flex-wrap items-center gap-2">
              {TYPES.map(t=>{
                const Icon = t.icon;
                return (
                  <button key={t.key} onClick={()=>setType(t.key)}
                    className={chipCls(type===t.key,"sky")}>
                    <span className="inline-flex items-center gap-1.5">
                      <Icon size={16}/> {t.name}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* quick reset */}
            <div className="flex items-center gap-2 justify-start sm:justify-end">
              <button onClick={reset} className="text-xs px-3 py-2 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700">
                ریست کردن
              </button>
            </div>
          </div>

          {/* secondary filters */}
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            <select value={grade} onChange={e=>setGrade(e.target.value)}
              className="w-full p-2 rounded-lg bg-zinc-800 text-zinc-100 text-sm focus:ring-2 focus:ring-sky-500">
              <option value="">هەموو پۆلەکان</option>
              {GRADES.map(g=><option key={g} value={g}>پۆلی {g}</option>)}
            </select>
            <select value={subject} onChange={e=>setSubject(e.target.value)}
              className="w-full p-2 rounded-lg bg-zinc-800 text-zinc-100 text-sm focus:ring-2 focus:ring-sky-500">
              <option value="">هەموو بابەتەکان</option>
              {SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            <select value={track} onChange={e=>setTrack(e.target.value)}
              className="w-full p-2 rounded-lg bg-zinc-800 text-zinc-100 text-sm focus:ring-2 focus:ring-sky-500">
              <option value="">هەموو لقه‌كان</option>
              {TRACKS.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
            <select value={diff} onChange={e=>setDiff(e.target.value)}
              className="w-full p-2 rounded-lg bg-zinc-800 text-zinc-100 text-sm focus:ring-2 focus:ring-sky-500">
              <option value="">هه‌موو ئاسته‌كان</option>
              {DIFFS.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* results */}
      <AnimatePresence initial={false}>
        {results.length ? (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          >
            {results.map(item=>{
              const meta = TYPES.find(t=>t.key===item.type);
              return (
                <motion.a
                  key={item.id}
                  href={item.url}
                  target="_blank" rel="noopener noreferrer"
                  whileHover={{y:-3}}
                  className="group relative overflow-hidden rounded-3xl ring-1 ring-white/10 bg-zinc-900 hover:bg-zinc-900/90 transition"
                >
                  <div className="relative">
                    <img src={item.thumb} alt={item.title} className="w-full h-44 object-cover"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"/>
                    <div className={`absolute top-3 left-3 text-[11px] px-2 py-1 rounded-full ring-1 ${meta.badge}`}>
                      {meta.name}
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="line-clamp-2 text-[15px] font-bold text-zinc-100 group-hover:text-sky-300 transition">{item.title}</h3>
                    <div className="flex items-center gap-2 text-[12px] text-zinc-300">
                      <span>{item.subject}</span>
                      <span className="text-zinc-500">•</span>
                      <span>پۆلی {item.grade}</span>
                      <span className="text-zinc-500">•</span>
                      <span>{item.track}</span>
                      <span className="ml-auto inline-flex items-center gap-1 text-amber-300">
                        <Star size={14}/> {item.rating}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                      <Tags size={14}/> {item.difficulty}
                      {item.type==="exam" && (
                        <span className="ms-auto px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20">
                          {item.questions} پرسیار
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="px-4 pb-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[12px] text-zinc-400">
                      <ExternalLink size={14}/> کراوه‌یه‌کی دراوسێ
                    </span>
                    <button type="button"
                      onClick={(e)=>{e.preventDefault(); navigator.clipboard?.writeText(item.url);}}
                      className="inline-flex items-center gap-1 text-[12px] px-2 py-1 rounded-md bg-zinc-800 text-zinc-200 hover:bg-zinc-700">
                      <LinkIcon size={14}/> لینک
                    </button>
                  </div>
                </motion.a>
              );
            })}
          </motion.div>
        ) : (
          <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="text-center text-zinc-400 text-sm py-12">
            هیچ داتایەک نەدۆزرایەوە 😔
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
