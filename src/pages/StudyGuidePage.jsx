import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Rocket,
  BookmarkCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Printer,
  ListTree,
  ArrowUp,
  ArrowRight,
  Quote,
  Maximize2,
  Minimize2,
  Layout,
} from "lucide-react";

/* ======================================================
   Ultra-modern, RTL-first, text-only showcase page
   - Glass + gradient hero
   - Chip TOC with scroll spy
   - Section ribbons (Tips vs. Mistakes) with different themes
   - Per-section progress dots
   - Callouts / quotes / key-lines
   - Sticky quick-actions + back-to-top
   - Focus mode + Wide reading toggle
   - Keyboard shortcuts: B (back) • T (top) • P (print) • F (focus)
   - Print-perfect
====================================================== */

/* Normalizer (EN + KU/AR) */
function normalizeText(input) {
  if (input == null) return "";
  let s = String(input);
  s = s.replace(/[\u200B-\u200F\u2060\uFEFF]/g, "");
  s = s.replace(/[\u00A0\u202F\u2000-\u200A]/g, " ");
  s = s.split("\n").map((l) => l.trim()).join("\n");
  s = s.replace(/[ \t]{2,}/g, " ");
  s = s.replace(/^\s*[\*\-]\s+/gm, "• ");
  s = s.replace(/([\(\[\{])\s+/g, "$1").replace(/\s+([\)\]\}])/g, "$1");
  s = s.replace(/\s+([,.;:!?…،؛؟])/g, "$1");
  s = s.replace(/([,.;:!?…،؛؟])([^\s\)\]\}.,;:!?…])/g, "$1 $2");
  s = s.replace(/\s*:\s*/g, ": ");
  s = s.replace(/\s*[-–—]\s*/g, " — ");
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
}

/* Content (your text) */
const RAW = {
  tips: {
    title: "١٠ ڕێگای گرنگ بۆ خوێندنێکی سەرکەوتوو",
    blocks: [
      {
        h: "1) ئامانجێکی ورد و ڕوون دابنێ",
        p: `پێش هەموو شتێك، وەڵامی ئەم پرسیارە بدەوە: "دەمەوێ بەم خوێندنە، بگەمە چ؟"
ئامانجێك دابنێ كە دیار، پێوانه‌یی، گونجاو، بەدەستهێنراو و كاتی دیاریكراوی هەبێت.
نموونە: "هەفتەی داھاتوو، ٢ بەندی سەرەكی کتێبی فیزیا بەتەواوی لێی تێدەگەم و زەبتی دەکەم"`,
      },
      {
        h: "2) پلانێکی کاتی ڕێک بکێشە",
        p: `کاتێکی دیاریکراو بۆ خوێندن تەرخان بکە. پلانێکی ڕۆژانە یان هەفتانە دروست بکە و پەیڕەوی بکە.
نموونە: "هەموو ڕۆژێك لە کاتژمێر ٧ بۆ ٩، تەنیا خوێندنە"`,
      },
      {
        h: "3) پەرە بە تەکنیکی «پۆمۆدۆرۆ» بدە",
        p: `٢٥ خولەك خوێندن + ٥ خولەك پشوو. دوای ٤ جار دووبارەکردنەوە، پشوویەکی درێژتر ١٥–٣٠ خولەک؛ یان ٤٥/١٥ ئەگەر پێویستە.
سوود: مێشکت ڕێکدەخات و لە ماندووبوون ڕزگارت دەکات.`,
      },
      { h: "4) سەیرکردنی ناوەڕۆک پێش خوێندنی ورد", p: `سەرەتایەك: ناونیشان، بابەتە سەرەكییەکان، کۆتایی.` },
      { h: "5) خۆتفێری کورت بکە", p: `دوای خوێندن بە زمانی خۆت ڕوون بکەوە؛ ئەگەر نەیکەیت، شوێنی کێشەیە.` },
      { h: "6) پەیوەندی نێوان نوێ و کۆنە", p: `زانیاری نوێ ببەستە بە ئەزموون و زانیاری کۆنە؛ نموونە: بیرکاری بە ژیانی ڕۆژانەوە.` },
      { h: "7) وێنە و شێوە", p: `دیاگرام/خشتە/مایندمەپ — بینین یارمەتی لە لەبەرکردنەوە دەدات.` },
      { h: "8) پرسیار لە خۆت بکە", p: `کتێبەکە دابخە و بەبێ سەیرکردنەوە وەڵام بدە.` },
      { h: "9) دەنگی خۆت بەکاربهێنە", p: `نکات تۆمار بکە و دواتر گوێی بگرە — فێربوونی بیستنەوە.` },
      { h: "10) پشوو و خەوی تەندروست", p: `ڕۆژانە ٧–٨ کاتژمێر بخەوە؛ مێشک بێ پشوو زانیاری ناکەوێتە ناو.` },
      { h: "کۆتایی", p: `هەر ڕۆژێك پێش دەستپێكردن سەیری بابەتەکە بکە و ئامانجێکی بچوووك دانێ.` },
    ],
  },
  mistakes: {
    title: "١٠ هەڵەی زۆر باو لە کاتی خوێندندا (و چۆن ڕێگری بکەین)",
    blocks: [
      { h: "1) دواخستن (Procrastination)", p: `هەڵە: "باشە، سبەی دەستپێدەکەم!"\nچۆن: ئامانجەکان دابەش بکە بەسەر ئامانجی بچووك: "ئەمڕۆ تەنیا ١ بەش".` },
      { h: "2) خوێندنەوەی بێ مەبەست", p: `هەڵە: خوێندن بەبێ تێگەیشتن.\nچۆن: پرسیار دروست بکە و هەوڵ بدە وەڵام بدۆزیتەوە.` },
      { h: "3) تەنیا سەیرکردن", p: `هەڵە: تەنیا چوونی چاو.\nچۆن: خوێندنی چالاک بکە (نووسین، قسەکردن، دیاگرام).` },
      { h: "4) پشوونەدان", p: `هەڵە: بەردەوام خوێندن بەبێ پشوو.\nچۆن: پۆمۆدۆرۆ یان ٥٠/١٠ (٥٠ خوێندن، ١٠ پشوو).` },
      { h: "5) ژینگەی قەرەباڵغ", p: `هەڵە: تەلەفزیۆن/موبایل لە پاشەوە.\nچۆن: شوێنێکی بێدەنگ و پاک هەڵبژێرە.` },
      { h: "6) نەخوێندنەوەی پێش-پۆل", p: `هەڵە: چوونە ناو پۆل بەبێ پێشێل.\nچۆن: ٥ خولەک پێش پۆل سەیرکردنەوە.` },
      { h: "7) لەبەرکردن بێ تێگەیشتن", p: `هەڵە: تەنیا هافکردن.\nچۆن: بە زمانی خۆت ڕوون بکەوە.` },
      { h: "8) نەبوونی جووڵە/وەرزش", p: `هەڵە: پشتگوێخستن.\nچۆن: ڕۆژانە ٣٠ خولەک جووڵە بکە؛ خەو کەمتر نەبێت لە ٧ کاتژمێر.` },
      { h: "9) نەکردنی تاقیکردنەوە بە خۆت", p: `هەڵە: تەنیا خوێندن.\nچۆن: پرسیار دروست بکە و خۆت تاقی بکە.` },
      { h: "10) خوێندنی درێژخایەن لە شەودا", p: `هەڵە: خوێندن تەنیا لە کاتی نزیکبوونەوەی تاقیکردنەوە.\nچۆن: پلانێکی ڕۆژانە دروست بکە و بەردەوام بخوێنە.` },
      { h: "هەڵەکانی تر", p: `· خوێندن لە کاتی ماندووبوون\n· تێبینی نەکردن\n· نەکردنی هایلات\n· قەلەق بوون\n· نەناسینی شێوازی فێربوونی تایبەت` },
      { h: "یەکەم هەنگاو", p: `یەکەم هەنگاو: هەڵەکان بناسە و شێوازێکی گونجاو بۆ خۆت دابین بکە.` },
    ],
  },
};

const SPRING = { type: "spring", stiffness: 240, damping: 26, mass: 0.6 };

export default function ShockStudyShowcase() {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [focusMode, setFocusMode] = useState(false);     // NEW: hide sidebar
  const [wide, setWide] = useState(false);               // NEW: wider reading column

  useEffect(() => {
    const el = containerRef.current;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      const pct = max > 0 ? Math.round((el.scrollTop / max) * 100) : 0;
      setProgress(Math.max(0, Math.min(100, pct)));
    };
    el?.addEventListener("scroll", onScroll, { passive: true });
    return () => el?.removeEventListener("scroll", onScroll);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.target && ["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      const k = e.key.toLowerCase();
      if (k === "p") window.print();
      if (k === "b") window.history.length ? window.history.back() : window.location.assign("/");
      if (k === "t") containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      if (k === "f") setFocusMode((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // normalize once
  const data = useMemo(() => {
    const tips = {
      title: normalizeText(RAW.tips.title),
      blocks: RAW.tips.blocks.map((b) => ({ h: normalizeText(b.h), p: normalizeText(b.p) })),
      theme: "emerald",
      key: "tips",
    };
    const mistakes = {
      title: normalizeText(RAW.mistakes.title),
      blocks: RAW.mistakes.blocks.map((b) => ({ h: normalizeText(b.h), p: normalizeText(b.p) })),
      theme: "rose",
      key: "mistakes",
    };
    return [tips, mistakes];
  }, []);

  // TOC entries
  const toc = useMemo(() => {
    const entries = [];
    data.forEach((sec) => {
      entries.push({ id: sec.key, title: sec.title, theme: sec.theme });
      sec.blocks.forEach((b, i) => entries.push({ id: `${sec.key}__${i}`, title: b.h, theme: sec.theme }));
    });
    return entries;
  }, [data]);

  // Scroll spy
  const [activeId, setActiveId] = useState(toc[0]?.id);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const headings = toc.map((t) => el.querySelector(`#${CSS.escape(t.id)}`)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveId(visible.target.id);
      },
      { root: el, threshold: [0.12, 0.5, 0.75] }
    );
    headings.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [toc]);

  return (
    <div id="top" dir="rtl" className="min-h-screen bg-zinc-950 text-white print:bg-white print:text-black relative">
      {/* BG Orbs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-[38rem] h-[38rem] rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-[34rem] h-[34rem] rounded-full bg-rose-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-black/40 border-b border-white/10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => (window.history.length ? window.history.back() : window.location.assign("/"))}
                className="px-3 py-2 rounded-xl text-sm border border-white/10 bg-white/5 hover:bg-white/10"
                title="گەڕانەوە (B)"
              >
                <ArrowRight className="w-4 h-4 inline-block -scale-x-100 ms-1" /> گەڕانەوە
              </button>

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 border border-white/10 flex items-center justify-center shadow">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold">شووک: ڕێنمایی خوێندنە سەرکەوتوو</h1>
                <p className="text-xs opacity-70">دوو بەشێکی جیاواز: ڕێنمایی + هەڵە باوەکان</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setWide((v) => !v)}
                className="px-3 py-1.5 rounded-lg text-sm border border-white/10 bg-white/5 hover:bg-white/10"
                title={wide ? "پانی وردتر" : "پانی فراوانتر"}
              >
                {wide ? <Minimize2 className="w-4 h-4 inline-block ms-1" /> : <Maximize2 className="w-4 h-4 inline-block ms-1" />} پانە
              </button>

              <button
                onClick={() => setFocusMode((v) => !v)}
                className="px-3 py-1.5 rounded-lg text-sm border border-white/10 bg-white/5 hover:bg-white/10"
                title="فۆکس‌مۆد (F)"
              >
                <Layout className="w-4 h-4 inline-block ms-1" /> فۆکس
              </button>

              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg text-sm border border-white/10 bg-white/5 hover:bg-white/10"
                title="پرینت (P)"
              >
                <Printer className="w-4 h-4 inline-block ms-1" /> پرینت
              </button>
            </div>
          </div>

          {/* Global progress */}
          <div className="mt-3 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-rose-400"
              style={{ width: `${progress}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={SPRING}
            />
          </div>
        </div>
      </header>

      {/* Body grid */}
      <div className={`max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 grid grid-cols-1 ${focusMode ? "lg:grid-cols-1" : "lg:grid-cols-[300px,1fr]"} gap-6 print:block`}>
        {/* Sidebar TOC chips */}
        {!focusMode && (
          <aside className="lg:sticky lg:top-[98px] lg:h-[calc(100vh-110px)] lg:overflow-auto print:hidden">
            <div className="p-4 rounded-3xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-2 mb-3">
                <ListTree className="w-4 h-4 opacity-80" />
                <span className="text-sm opacity-80">ناوەرۆکی خێرا</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {toc.map((t) => (
                  <a
                    key={t.id}
                    href={`#${t.id}`}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                      activeId === t.id
                        ? t.theme === "emerald"
                          ? "bg-emerald-500/20 border-emerald-500/40"
                          : "bg-rose-500/20 border-rose-500/40"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {t.title}
                  </a>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Scroll container */}
        <main
          ref={containerRef}
          className={`min-h-[70vh] lg:max-h-[calc(100vh-110px)] lg:overflow-auto print:overflow-visible ${wide ? "max-w-none" : "max-w-4xl"} mx-auto w-full`}
        >
          <div className="space-y-10 text-[17px] leading-8 print:text-[14px] print:leading-7">
            {data.map((sec) => (
              <Section key={sec.key} section={sec} />
            ))}

            {/* Back to top */}
            <div className="flex justify-end">
              <a
                href="#top"
                onClick={(e) => {
                  e.preventDefault();
                  containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm"
                title="سەرووەوە (T)"
              >
                <ArrowUp className="w-4 h-4" /> سەرووەوە
              </a>
            </div>
          </div>
        </main>
      </div>

      {/* Floating accent badge */}
      <div className="fixed bottom-5 left-5 print:hidden">
        <div className="px-3 py-2 rounded-full text-xs bg-gradient-to-r from-emerald-500/25 to-cyan-500/25 border border-white/15 backdrop-blur">
          <Rocket className="w-4 h-4 inline-block ms-1" /> هاندانی شاراوە: تەنیا نووسین — هیچ داتای تر نییە
        </div>
      </div>
    </div>
  );
}

/* Section with theme ribbon and per-block cards */
function Section({ section }) {
  const [open, setOpen] = useState(true);
  const theme =
    section.theme === "emerald"
      ? {
          ring: "ring-emerald-400/30",
          head: "from-emerald-500/25 to-cyan-500/25",
          chip: "bg-emerald-500/18 border-emerald-500/35",
          dot: "bg-emerald-400",
          accentBox: "bg-emerald-500/10 border-emerald-500/25",
        }
      : {
          ring: "ring-rose-400/30",
          head: "from-rose-500/25 to-pink-500/25",
          chip: "bg-rose-500/18 border-rose-500/35",
          dot: "bg-rose-400",
          accentBox: "bg-rose-500/10 border-rose-500/25",
        };

  return (
    <section id={section.key} className={`rounded-3xl border border-white/10 bg-white/5 ring-1 ${theme.ring}`}>
      {/* Header ribbon */}
      <button onClick={() => setOpen((v) => !v)} className="w-full text-right">
        <div className={`px-5 py-5 rounded-t-3xl bg-gradient-to-r ${theme.head} border-b border-white/10 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full ${theme.chip} border flex items-center justify-center`}>
              <BookmarkCheck className="w-4 h-4" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold">{section.title}</h2>
          </div>
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="px-5 pb-5"
          >
            {/* progress dots */}
            <div className="flex flex-wrap items-center gap-2 py-4">
              {section.blocks.map((_, i) => (
                <span key={i} className={`w-2.5 h-2.5 rounded-full ${theme.dot} opacity-80`} />
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.blocks.map((b, i) => (
                <div key={`${section.key}__${i}`} id={`${section.key}__${i}`} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                  {/* Block head */}
                  <div className="px-4 py-3 flex items-center gap-2 border-b border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <h3 className="font-semibold">{b.h}</h3>
                  </div>

                  {/* Text */}
                  <div className="px-4 py-4">
                    <p className="whitespace-pre-wrap opacity-90">{b.p}</p>

                    {/* Accents */}
                    {i === 0 && (
                      <div className={`mt-3 text-sm px-3 py-2 rounded-xl bg-white/5 border border-white/10 inline-flex items-center gap-2`}>
                        <Quote className="w-4 h-4" />
                        <span>ئامانجێکی باش = ڕێنمایی گشتی هەموو هەنگاوەکانە.</span>
                      </div>
                    )}

                    {i === 2 && (
                      <div className={`mt-4 p-3 rounded-xl ${theme.accentBox} text-sm`}>
                        <b>پۆمۆدۆرۆ:</b> ٢٥/٥ × ٤؛ دواتر ١٥–٣٠ پشوو. بە دڵخۆشی بگۆڕە بۆ ٤٥/١٥.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
