// ShockStudyShowcase_RTLPro.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Rocket, CheckCircle2, Zap, ArrowUp, ArrowRight,
  Flame, Target, Brain, Eye, Clock, Shield, TrendingUp, Award, Lightbulb, AlertTriangle,
  Menu, X,
} from "lucide-react";

/* ===================== Utilities ===================== */
function normalizeText(input) {
  if (input == null) return "";
  let s = String(input);
  s = s.replace(/[\u200B-\u200F\u2060\uFEFF]/g, "");
  s = s.replace(/[\u00A0\u202F\u2000-\u200A]/g, " ");
  s = s.split("\n").map((l) => l.trim()).join("\n");
  s = s.replace(/[ \t]{2,}/g, " ");
  s = s.replace(/^\s*[\*\-]\s+/gm, "• ");
  s = s.replace(/([\(\[\{])\s+/g, "$1").replace(/\s+([\)\]\}])/g, "$1");
  s = s.replace(/\س+([,.;:!?…،؛؟])/g, "$1");
  s = s.replace(/([,.;:!?…،؛؟])([^\س\)\]\}.,;:!?…])/g, "$1 $2");
  s = s.replace(/\s*:\s*/g, ": ");
  s = s.replace(/\s*[-–—]\s*/g, " — ");
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
}

const COLOR_CLASSES = {
  emerald: { text: "text-emerald-400", ring: "ring-emerald-400" },
  rose: { text: "text-rose-400", ring: "ring-rose-400" },
};

/* ===================== Content ===================== */
const RAW = {
  tips: {
    title: "١٠ ڕێگای گرنگ بۆ خوێندنێکی سەرکەوتوو",
    blocks: [
      { h: "1) ئامانجێکی ورد و ڕوون دابنێ", p: `پێش هەموو شتێك، وەڵامی ئەم پرسیارە بدەوە: "دەمەوێ بەم خوێندنە، بگەمە چ؟" ئامانجێك دابنێ كە دیار، پێوانه‌یی، گونجاو، بەدەستهێنراو و كاتی دیاریكراوی هەبێت. نموونە: "هەفتەی داھاتوو، ٢ بەندی سەرەكی کتێبی فیزیا بەتەواوی لێی تێدەگەم و زەبتی دەکەم"`, icon: Target },
      { h: "2) پلانێکی کاتی ڕێک بکێشە", p: `کاتێکی دیاریکراو بۆ خوێندن تەرخان بکە. پلانێکی ڕۆژانە یان هەفتانە دروست بکە و پەیڕەوی بکە. نموونە: "هەموو ڕۆژێك لە کاتژمێر ٧ بۆ ٩، تەنیا خوێندنە"`, icon: Clock },
      { h: "3) پەرە بە تەکنیکی «پۆمۆدۆرۆ» بدە", p: `٢٥ خولەک خوێندن + ٥ خولەک پشوو (٤ جار → پشویی ١٥–٣٠). یان ٤٥/١٥ ئەگەر پێویستە. سوود: مێشکت ڕێکدەخات و لە ماندووبوون ڕزگار دەکات.`, icon: Zap },
      { h: "4) سەیرکردنی ناوەڕۆک پێش خوێندنی ورد", p: `سەرەتایەك: ناونیشان، بابەتە سەرەكییەکان، کۆتایی.`, icon: Eye },
      { h: "5) خۆتفێری کورت بکە", p: `دوای خوێندن بە زمانی خۆت ڕوون بکەوە؛ ئەگەر نەیکەیت، شوێنی کێشەیە.`, icon: Brain },
      { h: "6) پەیوەندی نێوان نوێ و کۆنە", p: `زانیاری نوێ ببەستە بە ئەزموون و زانیاری کۆنە؛ نموونە: بیرکاری بە ژیانی ڕۆژانەوە.`, icon: TrendingUp },
      { h: "7) وێنە و شێوە", p: `دیاگرام/خشتە/مایندمەپ — بینین یارمەتی لە لەبەرکردنەوە دەدات.`, icon: Lightbulb },
      { h: "8) پرسیار لە خۆت بکە", p: `کتێبەکە دابخە و بەبێ سەیرکردنەوە وەڵام بدە.`, icon: Shield },
      { h: "9) دەنگی خۆت بەکاربهێنە", p: `نکات تۆمار بکە و دواتر گوێی بگرە — فێربوونی بیستنەوە.`, icon: Flame },
      { h: "10) پشوو و خەوی تەندروست", p: `ڕۆژانە ٧–٨ کاتژمێر بخەوە؛ مێشک بێ پشوو زانیاری ناکەوێتە ناو.`, icon: Award },
    ],
  },
  mistakes: {
    title: "١٠ هەڵەی زۆر باو لە کاتی خوێندندا (و چۆن ڕێگری بکەین)",
    blocks: [
      { h: "1) دواخستن (Procrastination)", p: `هەڵە: "باشە، سبەی دەستپێدەکەم!"\nچۆن: ئامانجەکان دابەش بکە بەسەر ئامانجی بچووك: "ئەمڕۆ تەنیا ١ بەش".`, icon: Clock },
      { h: "2) خوێندنەوەی بێ مەبەست", p: `هەڵە: خوێندن بەبێ تێگەیشتن.\nچۆن: پرسیار دروست بکە و هەوڵ بدە وەڵام بدۆزیتەوە.`, icon: Target },
      { h: "3) تەنیا سەیرکردن", p: `هەڵە: تەنیا چوونی چاو.\nچۆن: خوێندنی چالاک بکە (نووسین، قسەکردن، دیاگرام).`, icon: Eye },
      { h: "4) پشوونەدان", p: `هەڵە: بەردەوام خوێندن بەبێ پشوو.\nچۆن: پۆمۆدۆرۆ یان ٥٠/١٠.`, icon: AlertTriangle },
      { h: "5) ژینگەی قەرەباڵغ", p: `هەڵە: تەلەفزیۆن/موبایل لە پاشەوە.\nچۆن: شوێنێکی بێدەنگ و پاک هەڵبژێرە.`, icon: Shield },
      { h: "6) نەخوێندنەوەی پێش-پۆل", p: `هەڵە: چوونە ناو پۆل بەبێ پێشێل.\nچۆن: ٥ خولەک پێش پۆل سەیرکردنەوە.`, icon: Brain },
      { h: "7) لەبەرکردن بێ تێگەیشتن", p: `هەڵە: تەنیا هافکردن.\nچۆن: بە زمانی خۆت ڕوون بکەوە.`, icon: Lightbulb },
      { h: "8) نەبوونی جووڵە/وەرزش", p: `هەڵە: پشتگوێخستن.\nچۆن: ڕۆژانە ٣٠ خولەک جووڵە بکە؛ خەو کەمتر نەبێت لە ٧ کاتژمێر.`, icon: TrendingUp },
      { h: "9) نەکردنی تاقیکردنەوە بە خۆت", p: `هەڵە: تەنیا خوێندن.\nچۆن: پرسیار دروست بکە و خۆت تاقی بکە.`, icon: Award },
      { h: "10) خوێندنی درێژخایەن لە شەودا", p: `هەڵە: خوێندن تەنیا لە کاتی نزیکبوونەوەی تاقیکردنەوە.\nچۆن: پلانێکی ڕۆژانە دروست بکە و بەردەوام بخوێنە.`, icon: Flame },
    ],
  },
};

/* ===================== Card ===================== */
const ContentCard = React.memo(({ block, section, idx, setHoveredCard, isHovered }) => {
  const Icon = block.icon;
  const color = COLOR_CLASSES[section.color]?.text || "text-emerald-400";
  const cardId = `${section.key}-${idx}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.08 }}
      onHoverStart={() => setHoveredCard(cardId)}
      onHoverEnd={() => setHoveredCard(null)}
      className="group relative h-full"
    >
      <div className={`absolute -inset-1 bg-gradient-to-r ${section.gradient} rounded-3xl blur-lg opacity-0 group-hover:opacity-25 transition-opacity duration-500`} />
      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 h-full flex flex-col hover:border-white/30 transition-all duration-500 hover:shadow-2xl hover:scale-[1.01]">
        <motion.div
          animate={{ rotate: isHovered ? [0, -10, 10, 0] : 0 }}
          transition={{ duration: 0.5 }}
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${section.gradient} flex items-center justify-center mb-4 shadow-lg`}
        >
          <Icon className="w-7 h-7 text-white" />
        </motion.div>

        <h3 className={`text-xl font-bold mb-3 flex items-start gap-2 leading-snug ${color}`}>
          <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0 opacity-90" />
          <span className="flex-1 text-white">{block.h}</span>
        </h3>

        <p className="text-white/80 leading-relaxed whitespace-pre-wrap tracking-[0.1px]">
          {block.p}
        </p>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${section.gradient} rounded-b-3xl origin-left`}
        />
      </div>
    </motion.div>
  );
});

/* ===================== Main ===================== */
export default function ShockStudyShowcase_RTLPro() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ container: containerRef });
  const [activeSection, setActiveSection] = useState("tips");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(false);

  // programmatic-scroll guard (don’t auto-close mobile during smooth scroll)
  const clickedScrollRef = useRef(false);
  const clickedTimerRef = useRef(null);

  // header height used by scroll calculations (matches scroll-mt-28 ≈ 112px)
  const HEADER_OFFSET = 112;
  const tickingRef = useRef(false);

  const data = useMemo(() => {
    const tips = {
      title: normalizeText(RAW.tips.title),
      blocks: RAW.tips.blocks.map((b) => ({ h: normalizeText(b.h), p: normalizeText(b.p), icon: b.icon })),
      key: "tips",
      color: "emerald",
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      bgGradient: "from-emerald-500/20 via-teal-500/10 to-cyan-500/20",
      label: "ڕێنماییەکان"
    };
    const mistakes = {
      title: normalizeText(RAW.mistakes.title),
      blocks: RAW.mistakes.blocks.map((b) => ({ h: normalizeText(b.h), p: normalizeText(b.p), icon: b.icon })),
      key: "mistakes",
      color: "rose",
      gradient: "from-rose-500 via-pink-500 to-purple-500",
      bgGradient: "from-rose-500/20 via-pink-500/10 to-purple-500/20",
      label: "هەڵەکان"
    };
    return [tips, mistakes];
  }, []);

  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  /* Scroll-driven active section (replaces IntersectionObserver) */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sections = data.map((sec) => container.querySelector(`#${sec.key}`)).filter(Boolean);

    const calcActive = () => {
      const scrollY = container.scrollTop + HEADER_OFFSET + 1; // +1 avoids boundary flicker
      let currentKey = data[0]?.key;

      for (let i = 0; i < sections.length; i++) {
        const el = sections[i];
        if (el.offsetTop <= scrollY) currentKey = el.id;
        else break;
      }

      setActiveSection((prev) => (prev === currentKey ? prev : currentKey));

      // Update hash (nice UX for deep links)
      try {
        const currentHash = location.hash.replace(/^#/, "");
        if (currentHash !== currentKey) history.replaceState(null, "", `#${currentKey}`);
      } catch {}
    };

    const onScroll = () => {
      // auto-close mobile sheet if user is manually scrolling
      if (isNavOpen && !clickedScrollRef.current) setIsNavOpen(false);

      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(() => {
          tickingRef.current = false;
          calcActive();
        });
      }
    };

    // Initial compute + handle initial hash position
    const init = () => {
      const targetId = location.hash.replace(/^#/, "") || data[0]?.key;
      const target = targetId ? container.querySelector(`#${targetId}`) : null;
      if (target) {
        container.scrollTo({ top: target.offsetTop, behavior: "auto" });
      }
      calcActive();
    };

    init();
    container.addEventListener("scroll", onScroll, { passive: true });

    // Recompute on resize (optional but helpful if heights change)
    const ro = new ResizeObserver(() => calcActive());
    ro.observe(container);

    return () => {
      container.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [data, isNavOpen]);

  // Click = instant highlight + smooth scroll inside container
  const scrollToSection = (key) => {
    const container = containerRef.current;
    const target = container?.querySelector?.(`#${key}`);
    if (!container || !target) return;

    setActiveSection(key); // instant highlight

    // Guard: don't auto-close mobile while smooth scroll runs
    clickedScrollRef.current = true;
    clearTimeout(clickedTimerRef.current);
    clickedTimerRef.current = setTimeout(() => {
      clickedScrollRef.current = false;
    }, 650);

    container.scrollTo({ top: target.offsetTop, behavior: "smooth" });
    setIsNavOpen(false);

    try { history.replaceState(null, "", `#${key}`); } catch {}
  };

  const handleBackClick = () => {
    if (window.history.length > 1) window.history.back();
    else window.location.assign("/");
  };

  return (
    <div dir="rtl" className="min-h-screen text-white overflow-hidden">
      {/* Soft animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div animate={{ x: [0, 100, 0], y: [0, -100, 0], scale: [1, 1.2, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-1/4 -left-1/4 w-[60vw] h-[60vw] rounded-full bg-emerald-500/10 blur-3xl" />
        <motion.div animate={{ x: [0, -100, 0], y: [0, 100, 0], scale: [1, 1.3, 1] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 -right-1/4 w-[50vw] h-[50vw] rounded-full bg-rose-500/10 blur-3xl" />
      </div>

      {/* Progress bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-rose-500 origin-left z-50" style={{ scaleX: scrollYProgress }} />

      {/* Top bar */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-5xl">
        <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-full px-4 py-3 shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            <button onClick={handleBackClick} className="hover:scale-110 transition-transform p-1" aria-label="گەڕانەوە">
              <ArrowRight className="w-5 h-5 -scale-x-100" />
            </button>
            <div className="hidden md:flex gap-2">
              {data.map((sec) => (
                <button
                  key={sec.key}
                  onClick={() => scrollToSection(sec.key)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeSection === sec.key
                      ? `bg-gradient-to-r ${sec.gradient} text-white shadow-lg scale-105`
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                  aria-current={activeSection === sec.key ? "page" : undefined}
                >
                  {sec.label}
                </button>
              ))}
            </div>
            {/* Mobile: open right slide-over */}
            <button className="md:hidden p-1" onClick={() => setIsNavOpen(true)} aria-label="کردنەوەی لیست">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </nav>

      {/* RIGHT slide-over (mobile) */}
      <AnimatePresence>
        {isNavOpen && (
          <motion.aside
            className="fixed inset-y-0 right-0 z-50 w-80 max-w-[85%] bg-black/70 backdrop-blur-xl border-l border-white/10 p-5"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 font-bold">
                <Rocket className="w-5 h-5" />
                شووک
              </div>
              <button onClick={() => setIsNavOpen(false)} aria-label="داخستن">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-2">
              {data.map((sec) => (
                <button
                  key={sec.key}
                  onClick={() => scrollToSection(sec.key)}
                  className={`w-full text-right px-4 py-3 rounded-xl transition ${
                    activeSection === sec.key ? "bg-white/15 text-white font-bold" : "text-white/75 hover:bg-white/10"
                  }`}
                  aria-current={activeSection === sec.key ? "page" : undefined}
                >
                  {sec.label}
                </button>
              ))}
            </div>
            <div className="mt-8 p-4 rounded-xl border border-white/10 text-sm text-white/70">
              <p>کورتە: دوو بەش — ڕێنمایی + هەڵەکان. کلیک بکە بۆ گەیشتن بە بەشەکان.</p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Scroll area */}
      <div ref={containerRef} className="h-screen overflow-y-auto scroll-smooth">
        {/* Hero */}
        <motion.section style={{ opacity: heroOpacity, scale: heroScale }} className="min-h-screen flex items-center justify-center px-4 relative pt-32 pb-16">
          <div className="text-center max-w-4xl">
            <motion.h1 initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }} className="text-6xl md:text-8xl font-black mb-4 bg-gradient-to-r from-emerald-400 via-cyan-400 to-rose-400 bg-clip-text text-transparent leading-tight">
              شووک
            </motion.h1>
            <motion.p initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="text-3xl md:text-5xl font-extrabold mb-6 text-white">
              ڕێنمایی خوێندنە سەرکەوتوو 📚
            </motion.p>
            <motion.p initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.55 }} className="text-lg text-white/70 mb-12">
              دوو بەش: ١٠ ڕێنمایی + ١٠ هەڵەی باو
            </motion.p>

            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="flex flex-wrap gap-4 justify-center">
              {data.map((sec, i) => (
                <motion.button
                  key={sec.key}
                  onClick={() => scrollToSection(sec.key)}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.96 }}
                  className={`group px-8 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r ${sec.gradient} shadow-2xl hover:shadow-3xl transition-shadow relative overflow-hidden`}
                >
                  <span className="relative flex items-center gap-2">
                    {i === 0 ? <Rocket className="w-5 h-5" /> : <Flame className="w-5 h-5" />}
                    {sec.title}
                  </span>
                </motion.button>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 2, repeat: Infinity, repeatType: "reverse" }} className="mt-16">
              <ArrowUp className="w-8 h-8 mx-auto rotate-180 text-white/40" />
            </motion.div>
          </div>
        </motion.section>

        {/* Main grid: content + RIGHT sidebar */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Content (left area) */}
            <div className="md:col-span-9 space-y-32">
              {data.map((section, sectionIdx) => (
                <motion.section
                  key={section.key}
                  id={section.key}
                  initial={{ opacity: 0, y: 100 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: 0.15 }}
                  className="relative scroll-mt-28"
                >
                  {/* Header */}
                  <div className="mb-12 text-center">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 220, damping: 18 }} className="inline-block mb-4">
                      <div className={`px-6 py-3 rounded-full bg-gradient-to-r ${section.bgGradient} border border-white/20 backdrop-blur`}>
                        <span className="text-sm font-bold opacity-85">بەشی {sectionIdx + 1}</span>
                      </div>
                    </motion.div>
                    <h2 className={`text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r ${section.gradient} bg-clip-text text-transparent`}>
                      {section.title}
                    </h2>
                    <p className="text-white/60 text-sm">تکایە بە ئاستەنگی بخوێنە و نوتس بنووسە</p>
                  </div>

                  {/* Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    {section.blocks.map((block, idx) => (
                      <ContentCard
                        key={idx}
                        block={block}
                        section={section}
                        idx={idx}
                        setHoveredCard={setHoveredCard}
                        isHovered={hoveredCard === `${section.key}-${idx}`}
                      />
                    ))}
                  </div>
                </motion.section>
              ))}
            </div>

            {/* RIGHT Sidebar (sticky) */}
            <aside className="hidden md:block md:col-span-3">
              <div className="sticky top-28 space-y-6">
                {/* TOC */}
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4">
                  <div className="flex items-center gap-2 font-bold mb-3">
                    <ListDot /> لیستی بەشەکان
                  </div>
                  <div className="space-y-2">
                    {data.map((sec) => (
                      <button
                        key={sec.key}
                        onClick={() => scrollToSection(sec.key)}
                        className={`w-full text-right px-3 py-2 rounded-lg transition text-sm ${
                          activeSection === sec.key ? `bg-gradient-to-r ${sec.bgGradient} text-white font-bold` : "text-white/75 hover:bg-white/10"
                        }`}
                        aria-current={activeSection === sec.key ? "page" : undefined}
                      >
                        {sec.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick tip card */}
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4">
                  <div className="flex items-center gap-2 font-bold mb-2">
                    <Lightbulb className="w-5 h-5" /> کورتە ڕاهێنان
                  </div>
                  <p className="text-white/75 text-sm leading-relaxed">
                    پۆمۆدۆرۆ ٢٥/٥ بەکاربهێنە، و هەموو کات خۆتفێری کورت بنووسە. لە کۆتایی کاتژمێرەکان، خۆت تاقی بکە.
                  </p>
                </div>

                {/* Back to top */}
                <button
                  onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
                  className="w-full rounded-xl px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 font-bold hover:scale-[1.02] transition"
                >
                  گەڕانەوە بۆ سەرەوە
                </button>
              </div>
            </aside>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-16 text-center border-t border-white/10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
            <p className="text-white/50 text-sm">
              <Rocket className="w-4 h-4 inline-block ml-1" />
              تەنیا ناوەڕۆکی نووسراو — هیچ داتای تری بەهێز نەکراوە
            </p>
          </motion.div>
        </footer>
      </div>
    </div>
  );
}

/* Tiny icon for the sidebar header */
function ListDot() {
  return (
    <svg className="w-5 h-5 opacity-90" viewBox="0 0 24 24" fill="none">
      <path d="M4 7h8M4 12h8M4 17h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="18" cy="7" r="1.5" fill="currentColor"/><circle cx="18" cy="12" r="1.5" fill="currentColor"/><circle cx="18" cy="17" r="1.5" fill="currentColor"/>
    </svg>
  );
}
