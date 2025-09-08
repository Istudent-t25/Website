import React, { useMemo, useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home, ChevronLeft, BookOpen, BookText, BookMarked, Volume2, FileText,
  Languages, Atom, Beaker, Microscope, Shapes, ListChecks, Sparkles, Filter
} from "lucide-react";

const EASE = [0.22, 0.61, 0.36, 1];

// ڕێکخستن
const SUBJECTS = {
  english: {
    title: "ئینگلیزی",
    gradient: "from-indigo-600 via-sky-600 to-cyan-500",
    icon: BookOpen,
    categories: {
      grammar: { label: "ڕێزمان", icon: BookText },
      episode: { label: "ئەپیسۆد", icon: BookMarked },
      sounds: { label: "دەنگەکان", icon: Volume2 },
      reading: { label: "خوێندن", icon: BookOpen },
    },
  },
  kurdish: {
    title: "کوردی",
    gradient: "from-emerald-600 via-teal-600 to-cyan-500",
    icon: Languages,
    categories: { grammar: { label: "ڕێزمان", icon: BookText } },
  },
  arabic: {
    title: "عەرەبی",
    gradient: "from-rose-600 via-pink-600 to-fuchsia-500",
    icon: Languages,
    categories: {
      grammar: { label: "ڕێزمان (نحو)", icon: BookText },
      imlaa: { label: "ئیملا (إملاء)", icon: FileText },
    },
  },
  physics: {
    title: "فیزیا",
    gradient: "from-violet-600 via-purple-600 to-indigo-500",
    icon: Atom,
    categories: { laws: { label: "یاساکان", icon: ListChecks } },
  },
  chemistry: {
    title: "کیمیا",
    gradient: "from-amber-600 via-orange-600 to-red-500",
    icon: Beaker,
    categories: {
      laws: { label: "یاساکان", icon: ListChecks },
      shapes: { label: "تووخمەکان", icon: Shapes },
    },
  },
  biology: {
    title: "زیندەزانی",
    gradient: "from-lime-600 via-green-600 to-emerald-500",
    icon: Microscope,
    categories: {
      "flash-cards": { label: "فلاش کارد", icon: Sparkles },
      definitions: { label: "پێناسه‌کان", icon: BookMarked },
    },
  },
};

function Badge({ children, className = "" }) {
  return (
    <span className={"inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-white/10 bg-white/5 " + className}>
      {children}
    </span>
  );
}

export default function SubjectContent() {
  const navigate = useNavigate();
  const { subject = "", category = "" } = useParams();

  const meta = SUBJECTS[subject];
  const catMeta = meta?.categories?.[category];

  const [view, setView] = useState("grid"); // grid | list
  const [filter, setFilter] = useState("all"); // all | new | popular

  // sync url when category missing → first category
  useEffect(()=>{
    if (meta && !catMeta) {
      const firstKey = Object.keys(meta.categories)[0];
      if (firstKey) navigate(`/subjects/${subject}/${firstKey}`, { replace: true });
    }
  }, [meta, catMeta, navigate, subject]);

  const CategoryTabs = useMemo(() => {
    if (!meta) return null;
    const Icon = meta.icon || BookOpen;
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur p-2 sm:p-3 sticky top-2 z-30">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-white/10 text-white ring-1 ring-white/10">
            <Icon size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{meta.title}</h3>
            <p className="text-xs text-zinc-400">هاوبەشیارەکان</p>
          </div>
          <div className="ms-auto flex items-center gap-1">
            <button onClick={()=>setView(v=>v==="grid"?"list":"grid")} className="px-2 py-1 rounded-lg text-[11px] bg-white/5 border border-white/10 hover:bg-white/10">{view==="grid"?"لیست":"گرید"}</button>
            <button onClick={()=>setFilter(f=>f==="all"?"new":f==="new"?"popular":"all")} className="px-2 py-1 rounded-lg text-[11px] bg-white/5 border border-white/10 hover:bg-white/10 inline-flex items-center gap-1"><Filter className="w-3.5 h-3.5"/> {filter==="all"?"هەموو":"نوێ"}</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(meta.categories).map(([key, info]) => {
            const KIcon = info.icon || BookText;
            const active = key === category;
            return (
              <button
                key={key}
                type="button"
                onClick={() => navigate(`/subjects/${subject}/${key}`)}
                className={`px-3 py-2 rounded-xl text-sm font-semibold border transition ${
                  active ? "bg-sky-500/10 text-sky-200 border-sky-400/30" : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                } inline-flex items-center gap-2`}
              >
                <KIcon size={16} /> {info.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }, [meta, subject, category, navigate, view, filter]);

  const items = useMemo(() => {
    if (!meta || !catMeta) return [];
    const prefix = `${meta.title} • ${catMeta.label}`;
    return Array.from({ length: 12 }).map((_, i) => ({
      id: `${subject}-${category}-${i}`,
      title: `${prefix} #${i + 1}`,
      desc: "ناوەڕۆکی نموونە — لێرە دەتوانی بابەتەکانی ڕاستی زیاد بکەیت.",
      tag: i % 3 === 0 ? "نوێ" : i % 4 === 0 ? "باوەڕپێکراو" : "",
    }));
  }, [meta, catMeta, subject, category]);

  const filteredItems = useMemo(()=>{
    if (filter === "all") return items;
    if (filter === "new") return items.filter(x=>x.tag === "نوێ");
    if (filter === "popular") return items.filter(x=>x.tag === "باوەڕپێکراو");
    return items;
  }, [items, filter]);

  const gradient = meta?.gradient || "from-zinc-700 to-zinc-900";
  const Icon = meta?.icon || BookOpen;

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-50 p-3 sm:p-6">
      {/* سەردێر */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(1200px_600px_at_120%_-20%,rgba(56,189,248,.10),transparent),radial-gradient(800px_400px_at_-10%_10%,rgba(16,185,129,.08),transparent)] p-6 sm:p-10 mb-4">
        <div className="relative z-10 flex items-center justify-between gap-4">
          {/* شوێنخستن */}
          <nav className="text-xs sm:text-sm flex items-center gap-1 text-zinc-400">
            <Link to="/subjects" className="hover:text-white inline-flex items-center gap-1">
              <Home size={14} /> بابەتەکان
            </Link>
            <ChevronLeft size={14} className="opacity-60" />
            <span className="text-white/90">{meta?.title || "نادیار"}</span>
            {catMeta && (<><ChevronLeft size={14} className="opacity-60" /><span className="text-white/90">{catMeta.label}</span></>)}
          </nav>
          <button onClick={() => navigate(-1)} className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10">
            گەڕانەوە
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative z-10 mt-4 flex items-center gap-4"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-sky-500/15 ring-1 ring-sky-400/20 flex items-center justify-center">
            <Icon size={36} className="text-sky-300" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              {meta?.title || "نادیار"} {catMeta ? `• ${catMeta.label}` : ""}
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base mt-1">
              ئەمە پەڕەی مۆدێلە؛ دەتوانیت ناوەڕۆکی ڕاستی لێرە داخڵ بکەیت.
            </p>
          </div>
        </motion.div>
      </div>

      {!meta || !catMeta ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-rose-300">ڕێڕەوی داواکراو هەڵەیە. تکایە بابەت و هاوبەشیاری دروست هەڵبژێرە.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(SUBJECTS).map(([sKey, s]) => (
              <div key={sKey} className="rounded-xl border border-white/10 p-2">
                <div className="text-xs text-zinc-300 mb-1">{s.title}</div>
                <div className="flex flex-wrap gap-1">
                  {Object.keys(s.categories).map((cKey) => (
                    <Link
                      key={cKey}
                      to={`/subjects/${sKey}/${cKey}`}
                      className="px-2 py-1 rounded-lg text-xs bg-white/5 border border-white/10 hover:bg-white/10"
                    >
                      {s.categories[cKey].label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* تابەکان */}
          <div className="mb-3">{CategoryTabs}</div>

          {/* گریدی ناوەڕۆک */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            {view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredItems.map((it, idx) => (
                  <motion.div
                    key={it.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: EASE, delay: 0.03 * idx }}
                    className="rounded-2xl overflow-hidden border border-white/10 bg-zinc-900/70"
                  >
                    <div className={`h-32 sm:h-36 bg-gradient-to-br ${gradient} opacity-80`} />
                    <div className="p-3">
                      <h3 className="text-sm font-bold text-white line-clamp-2">{it.title}</h3>
                      <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{it.desc}</p>
                      <div className="mt-3 flex items-center gap-2">
                        {it.tag && <Badge className="text-emerald-200 border-emerald-400/20">{it.tag}</Badge>}
                        <Badge className="text-sky-200 border-sky-400/20">نموونە</Badge>
                        <button className="ms-auto px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10">
                          بینین
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {filteredItems.map((it, idx)=> (
                  <motion.div key={it.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.2, ease:EASE, delay: .02*idx}} className="py-3 flex items-start gap-3">
                    <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${gradient} opacity-80 flex-shrink-0`}/>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold">{it.title}</h3>
                        {it.tag && <Badge className="text-emerald-200 border-emerald-400/20">{it.tag}</Badge>}
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">{it.desc}</p>
                    </div>
                    <div className="ms-auto">
                      <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10">بینین</button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}