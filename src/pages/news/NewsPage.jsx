// NewsShowcase.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper,
  CalendarDays,
  Clock3,
  Bookmark,
  BookmarkCheck,
  ArrowUpRight,
  Search,
  ListFilter,
  ArrowUp,
  Image as ImageIcon,
} from "lucide-react";

const SPRING = { type: "spring", stiffness: 240, damping: 26, mass: 0.6 };

// ---- Replace MOCK with your API later ----
const MOCK = {
  categories: [
    { id: "all", label: "هەموو" },
    { id: "education", label: "خوێندن" },
    { id: "tech", label: "تەکنەلۆجی" },
    { id: "science", label: "زانست" },
    { id: "health", label: "تەندروستی" },
    { id: "culture", label: "کەلتور" },
  ],
  articles: Array.from({ length: 18 }).map((_, i) => ({
    id: i + 1,
    slug: `post-${i + 1}`,
    title:
      i % 3 === 0
        ? "نوێترین ڕاهێنانی خوێندن بۆ تاقیکردنەوەکان"
        : i % 3 === 1
        ? "چۆن AI دەتوانێت یارمەتی خوێندنت بدات"
        : "هەفتانە: سەرچاوەکانی فێربوون و هەواڵی زانستی",
    excerpt:
      "کورتەیەک لە ناوەرۆک: ئەم بابەتە پشت بە ڕێنمایی و چالاکیە چالاکەکان دەپەوێنێت بۆ بەهێزکردنی ئامادەکاری...",
    image:
      i % 2 === 0
        ? `https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=1600&auto=format&fit=crop`
        : `https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1600&auto=format&fit=crop`,
    date: "2025-09-12",
    readMins: 5 + (i % 4) * 2,
    tag: ["education", "tech", "science"][i % 3],
    featured: i < 3,
  })),
};
// -----------------------------------------

const fmt = (d) => {
  try {
    const intl = new Intl.DateTimeFormat("ku-IQ", { dateStyle: "medium" });
    return intl.format(new Date(d));
  } catch {
    return d;
  }
};

export default function NewsShowcase() {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);

  const [tab, setTab] = useState("latest"); // latest | trending | categories
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("news_saves_v1")) || {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("news_saves_v1", JSON.stringify(saved));
  }, [saved]);

  useEffect(() => {
    const el = containerRef.current;
    const onScroll = () => {
      if (!el) return;
      const max = el.scrollHeight - el.clientHeight;
      const pct = max > 0 ? Math.round((el.scrollTop / max) * 100) : 0;
      setProgress(Math.max(0, Math.min(100, pct)));
    };
    el?.addEventListener("scroll", onScroll, { passive: true });
    return () => el?.removeEventListener("scroll", onScroll);
  }, []);

  const featured = useMemo(
    () => MOCK.articles.filter((a) => a.featured).slice(0, 3),
    []
  );

  const list = useMemo(() => {
    let arr = MOCK.articles.slice();
    if (tab === "trending") arr = arr.sort((a, b) => (a.id % 2) - (b.id % 2));
    if (tab === "categories" && cat !== "all")
      arr = arr.filter((a) => a.tag === cat);
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      arr = arr.filter(
        (a) =>
          a.title.toLowerCase().includes(t) ||
          a.excerpt.toLowerCase().includes(t)
      );
    }
    return arr;
  }, [tab, cat, q]);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-zinc-950 text-white print:bg-white print:text-black relative"
    >
      {/* BG orbs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-[42rem] h-[42rem] rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-[36rem] h-[36rem] rounded-full bg-rose-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-black/40 border-b border-white/10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 border border-white/10 flex items-center justify-center shadow">
                <Newspaper className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold">
                  هه‌واڵه‌كان — نوێ
                </h1>
                <p className="text-xs opacity-70">
                  نوێترین وتووێژ، فێربوون و هەواڵە گرنگەکان
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="گەڕان لە ناو هەواڵەکان..."
                  className="w-64 pl-3 pr-9 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-white/20 text-sm"
                />
              </div>
              <button
                className="px-3 py-2 rounded-xl text-sm border border-white/10 bg-white/5 hover:bg-white/10"
                title="فلتەرەکان"
              >
                <ListFilter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* progress */}
          <div className="mt-3 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-rose-400"
              style={{ width: `${progress}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={SPRING}
            />
          </div>

          {/* tabs */}
          <div className="mt-3 flex items-center gap-2">
            {[
              { id: "latest", label: "دواترین" },
              { id: "trending", label: "باوترین" },
              { id: "categories", label: "هاوپۆلەکان" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-xl text-sm border transition-colors ${
                  tab === t.id
                    ? "bg-white/10 border-white/20"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                {t.label}
              </button>
            ))}

            {/* category chips */}
            <AnimatePresence initial={false}>
              {tab === "categories" && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2 ps-1"
                >
                  {MOCK.categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCat(c.id)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                        cat === c.id
                          ? "bg-emerald-500/20 border-emerald-500/40"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 grid grid-cols-1 gap-6 print:block">
        {/* Hero Featured Trio */}
        <section className="grid md:grid-cols-3 gap-4">
          {featured.map((a, idx) => (
            <motion.article
              key={a.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ ...SPRING, delay: idx * 0.05 }}
              className="group relative rounded-3xl overflow-hidden border border-white/10 bg-white/5"
              onClick={() => (window.location.href = `/news/${a.slug}`)}
            >
              <div className="aspect-[16/10] w-full overflow-hidden">
                {a.image ? (
                  <img
                    src={a.image}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5">
                    <ImageIcon className="w-6 h-6 opacity-70" />
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-[11px] opacity-80">
                  <CalendarDays className="w-3.5 h-3.5" /> {fmt(a.date)}
                  <span className="opacity-40">•</span>
                  <Clock3 className="w-3.5 h-3.5" /> {a.readMins} خولەک خوێندن
                </div>
                <h3 className="text-lg font-semibold leading-tight group-hover:underline underline-offset-4 decoration-white/50">
                  {a.title}
                </h3>
                <p className="text-sm opacity-85 line-clamp-2">{a.excerpt}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="px-2 py-1 rounded-full text-[11px] bg-emerald-500/15 border border-emerald-500/30">
                    سەرنجراو
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm opacity-90 group-hover:opacity-100">
                    خوێندن <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </section>

        {/* Articles grid */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((a) => (
            <motion.article
              key={a.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={SPRING}
              className="group relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 hover:border-white/20"
            >
              <a href={`/news/${a.slug}`} className="block">
                <div className="aspect-[16/10] w-full overflow-hidden">
                  {a.image ? (
                    <img
                      src={a.image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <ImageIcon className="w-6 h-6 opacity-70" />
                    </div>
                  )}
                </div>
              </a>
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-[11px] opacity-80">
                  <CalendarDays className="w-3.5 h-3.5" /> {fmt(a.date)}
                  <span className="opacity-40">•</span>
                  <Clock3 className="w-3.5 h-3.5" /> {a.readMins} خولەک
                </div>
                <a href={`/news/${a.slug}`}>
                  <h3 className="text-base font-semibold leading-tight hover:text-white/95">
                    {a.title}
                  </h3>
                </a>
                <p className="text-sm opacity-85 line-clamp-2">{a.excerpt}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="px-2 py-1 rounded-full text-[11px] bg-white/5 border border-white/10">
                    {MOCK.categories.find((c) => c.id === a.tag)?.label}
                  </span>

                  <button
                    onClick={() =>
                      setSaved((s) => ({ ...s, [a.id]: !s[a.id] }))
                    }
                    className={`inline-flex items-center gap-1 text-sm px-2 py-1 rounded-lg border transition-colors ${
                      saved[a.id]
                        ? "bg-emerald-500/15 border-emerald-500/30"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {saved[a.id] ? (
                      <BookmarkCheck className="w-4 h-4" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                    دڵخواز
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </section>

        {/* Back to top */}
        <div className="flex justify-end">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm"
          >
            <ArrowUp className="w-4 h-4" /> سەرەوە
          </a>
        </div>
      </div>

      {/* Invisible scroll container to measure page progress */}
      <div
        ref={containerRef}
        className="fixed pointer-events-none opacity-0 w-0 h-0 overflow-auto"
      />
    </div>
  );
}
