// NewsPreview.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Newspaper,
  CalendarDays,
  Clock3,
  Share2,
  Printer,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";

const SPRING = { type: "spring", stiffness: 230, damping: 26, mass: 0.6 };

// ---- Mock article + related (swap with API later) ----
const ARTICLE = {
  id: 101,
  slug: "study-techniques-2025",
  title: "نوێترین ڕاهێنانی خوێندن بۆ تاقیکردنەوەکان",
  cover:
    "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=1600&auto=format&fit=crop",
  date: "2025-09-12",
  readMins: 7,
  tag: "خوێندن",
  author: { name: "ڕێبەوار ع.", avatar: "" },
  content: `سەرەتای بابەت
ئەم بابەتە دەربارەی شێوازە نوێکانە بۆ خوێندنی ئاسانتر و بەردەوامتر قسە دەکات...

- پۆمۆدۆرۆ: ٢٥/٥ × ٤؛ دواتر ١٥–٣٠ پشوو
- خوێندنی چالاک: نووسین، پرس و وەڵام، ڕوونکردنەوەی بابەت
- بەستەرکردنی زانیاری نوێ بە ئەزموونەکانت

کۆتایی
هەر رۆژێک پلانێکی بچووک و هەوڵدان بەردەوام، چاوەڕوانی ئەنجامە باش بکە.`,
};

const RELATED = [
  {
    id: 201,
    slug: "ai-for-students",
    title: "چۆن AI دەتوانێت یارمەتی خوێندنت بدات",
    date: "2025-09-10",
    thumb:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: 202,
    slug: "weekly-science-roundup",
    title: "هەفتانە: کورتەی هەواڵی زانستی",
    date: "2025-09-08",
    thumb:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: 203,
    slug: "health-sleep-study",
    title: "خەوی تەندروست و کاریگەری لەسەر خوێندن",
    date: "2025-09-05",
    thumb:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1400&auto=format&fit=crop",
  },
];
// ------------------------------------------------------

const fmt = (d) => {
  try {
    const intl = new Intl.DateTimeFormat("ku-IQ", { dateStyle: "medium" });
    return intl.format(new Date(d));
  } catch {
    return d;
  }
};

export default function NewsPreview() {
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

  const a = ARTICLE; // later: pull by slug via useParams() + API

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-zinc-950 text-white print:bg-white print:text-black"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-black/40 border-b border-white/10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 border border-white/10 flex items-center justify-center shadow">
                <Newspaper className="w-5 h-5" />
              </div>
              <div className="text-sm">
                <div className="font-semibold">پێشابەری هەواڵ</div>
                <div className="opacity-70">هاوڵاتی</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.history.back()}
                className="px-3 py-1.5 rounded-lg text-sm border border-white/10 bg-white/5 hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 inline-block ms-1" />
                گەرانەوە
              </button>
              <button
                onClick={() => setSaved((s) => ({ ...s, [a.id]: !s[a.id] }))}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  saved[a.id]
                    ? "bg-emerald-500/15 border-emerald-500/30"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                {saved[a.id] ? (
                  <BookmarkCheck className="w-4 h-4 inline-block ms-1" />
                ) : (
                  <Bookmark className="w-4 h-4 inline-block ms-1" />
                )}
                دڵخواز
              </button>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg text-sm border border-white/10 bg-white/5 hover:bg-white/10"
              >
                <Printer className="w-4 h-4 inline-block ms-1" />
                پرینت
              </button>
              <button
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard?.writeText(url);
                  alert("لینک کۆپی کرا!");
                }}
                className="px-3 py-1.5 rounded-lg text-sm border border-white/10 bg-white/5 hover:bg-white/10"
              >
                <Share2 className="w-4 h-4 inline-block ms-1" />
                هاوبەشی
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Body: two-column responsive layout */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SIDEBAR (Others) — left on desktop */}
          <aside className="lg:col-span-4 order-2 lg:order-1">
            <div className="sticky top-[92px] space-y-4">
              <h2 className="text-base font-semibold px-1">هەواڵەکانی تر</h2>
              <div className="space-y-3">
                {RELATED.map((r) => (
                  <a
                    key={r.id}
                    href={`/news/${r.slug}`}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 transition-colors overflow-hidden"
                    title={r.title}
                  >
                    <div className="w-28 shrink-0 aspect-[16/10] overflow-hidden">
                      {r.thumb ? (
                        <img
                          src={r.thumb}
                          alt={r.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/10" />
                      )}
                    </div>
                    <div className="py-3 pr-3">
                      <div className="text-[12px] opacity-70">
                        <CalendarDays className="w-3.5 h-3.5 inline-block ms-1" />
                        {fmt(r.date)}
                      </div>
                      <div className="font-medium leading-snug line-clamp-2">
                        {r.title}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </aside>

          {/* MAIN ARTICLE — right on desktop */}
          <article className="lg:col-span-8 order-1 lg:order-2 rounded-3xl overflow-hidden border border-white/10 bg-white/5">
            {/* Cover */}
            <div className="aspect-[16/8] w-full overflow-hidden">
              {a.cover ? (
                <img src={a.cover} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-white/5" />
              )}
            </div>

            {/* Meta + Title */}
            <div className="p-5 md:p-7 space-y-3">
              <div className="flex items-center gap-2 text-[12px] opacity-80">
                <CalendarDays className="w-4 h-4" /> {fmt(a.date)}
                <span className="opacity-40">•</span>
                <Clock3 className="w-4 h-4" /> {a.readMins} خولەک خوێندن
                <span className="opacity-40">•</span>
                <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
                  {a.tag}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-semibold leading-tight">
                {a.title}
              </h1>

              {a.author?.name && (
                <div className="flex items-center gap-3 text-sm opacity-85">
                  <div className="w-8 h-8 rounded-full bg-white/10" />
                  <div>
                    <div className="font-medium">{a.author.name}</div>
                    <div className="text-xs opacity-70">نووسەر</div>
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="px-5 md:px-7 pb-7">
              <div className="prose prose-invert max-w-none leading-8 text-[17px] rtl">
                <pre className="whitespace-pre-wrap font-sans text-white/90">
                  {a.content}
                </pre>
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
