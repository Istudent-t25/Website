// src/pages/NotFound.jsx — playful, responsive 404 with particles + springs
import React, { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
  Ghost, Home, Search as SearchIcon, ArrowRight, RefreshCw, Sparkles, Mail
} from "lucide-react";

/** Tiny particle field (perf friendly) */
function Particles({ count = 36 }) {
  const dots = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 2.5,
        delay: Math.random() * 4,
        dur: 5 + Math.random() * 6,
        opacity: 0.25 + Math.random() * 0.5,
      });
    }
    return arr;
  }, [count]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map(d => (
        <motion.span
          key={d.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            opacity: d.opacity,
            filter: "blur(0.5px)"
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [-12, 0, -12], opacity: [0, d.opacity, 0] }}
          transition={{ repeat: Infinity, duration: d.dur, delay: d.delay, ease: "easeInOut" }}
        />
      ))}
      {/* soft vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
    </div>
  );
}

function BigDigit({ children, hue = "from-sky-400 to-fuchsia-400", drag = true }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [ -40, 40 ], [ -6, 6 ]);

  return (
    <motion.div
      drag={drag}
      dragElastic={0.15}
      dragConstraints={{ left: -30, right: 30, top: -20, bottom: 20 }}
      style={{ x, y, rotate }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      className={`select-none leading-none rounded-[2rem] px-7 sm:px-10 py-6 sm:py-8 bg-white/5 border border-white/10 shadow-2xl backdrop-blur
                  text-7xl sm:text-8xl md:text-9xl font-black text-white tracking-tighter`}
    >
      <span className={`bg-clip-text text-transparent bg-gradient-to-br ${hue}`}>{children}</span>
    </motion.div>
  );
}

export default function NotFound() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const mailto = useMemo(() => {
    const here = typeof window !== "undefined" ? window.location.href : "";
    const subject = encodeURIComponent("Broken link report");
    const body = encodeURIComponent(`Hi,\n\nI found a broken link:\n${here}\n\nSteps:\n1. ...\n2. ...\n\nThanks!`);
    return `mailto:support@studentkrd.com?subject=${subject}&body=${body}`;
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return nav("/");
    // if you have a search route, update it here:
    nav(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div dir="rtl" className="relative min-h-screen overflow-hidden">
      {/* gradient background */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_80%_-10%,rgba(56,189,248,.20),transparent),radial-gradient(800px_500px_at_10%_-10%,rgba(232,121,249,.16),transparent)] bg-zinc-950"
      />
      <Particles />

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-[max(24px,env(safe-area-inset-top))]">
        {/* Header/crumb */}
        <div className="mb-6 inline-flex items-center gap-2 text-[12px] text-zinc-400">
          <Sparkles size={14} className="text-sky-300" />
          پەڕەکە نەدۆزرایەوە
        </div>

        {/* The big “404” */}
        <div className="flex items-end gap-2 sm:gap-3 mb-7 sm:mb-8">
          <BigDigit hue="from-sky-400 to-cyan-300">4</BigDigit>
          <motion.div
            whileHover={{ y: -2 }}
            className="grid place-items-center"
          >
            <div className="relative">
              <BigDigit hue="from-fuchsia-400 to-rose-300">0</BigDigit>
              <Ghost
                size={46}
                className="absolute -top-4 left-1/2 -translate-x-1/2 text-white/80 drop-shadow-[0_6px_14px_rgba(0,0,0,0.35)]"
                aria-hidden
              />
            </div>
          </motion.div>
          <BigDigit hue="from-cyan-300 to-emerald-300">4</BigDigit>
        </div>

        {/* Title + subtitle */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
            ئه‌م پەڕەیە نەدۆزرایەوە (404)
          </h1>
          <p className="mt-2 text-sm sm:text-base text-zinc-300">
            لەوانەیە ناونیشانی بەستەرەکە هەڵە بێت، یان پەڕەکە گواسترابێت. دەتوانیت بگەڕێیت یان بگەڕێیتە ماڵەوە.
          </p>
        </div>

        {/* Search + actions */}
        <form onSubmit={submitSearch} className="mt-6 w-full max-w-xl">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="گەڕان…"
              className="w-full h-12 sm:h-12 rounded-2xl pr-4 pl-11 bg-white/5 border border-white/10 text-zinc-100 placeholder:text-zinc-500
                         outline-none ring-0 focus:border-white/20"
            />
            <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <button
              type="submit"
              className="absolute inset-y-1.5 left-1.5 hidden sm:inline-flex items-center gap-1 px-3 rounded-xl text-[12px] bg-white/5 border border-white/10 hover:bg-white/10"
            >
              <SearchIcon size={14} /> گەڕان
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => window.history.length > 1 ? nav(-1) : nav("/")}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-zinc-100"
          >
            <ArrowRight size={16} /> گەڕانەوە
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/20 border border-sky-400/30 text-sm text-sky-200"
          >
            <Home size={16} /> ماڵەوە
          </Link>
          <a
            href={mailto}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-zinc-100"
          >
            <Mail size={16} />  ڕاپۆرت
          </a>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-zinc-100"
          >
            <RefreshCw size={16} /> نوێکردنەوە
          </button>
        </div>

        {/* Suggested quick links (edit to match your routes) */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full max-w-3xl">
          <Link
            to="/"
            className="group rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-3 text-right"
          >
            <div className="text-[11px] text-zinc-400">ئاماژە</div>
            <div className="text-sm font-semibold text-white">سەرەتا</div>
            <div className="mt-1 text-[12px] text-zinc-400">پەڕەی سەرەکیی ماڵپەڕ</div>
          </Link>
          <Link
            to="/viewer"
            className="group rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-3 text-right"
          >
            <div className="text-[11px] text-zinc-400">بینین</div>
            <div className="text-sm font-semibold text-white">بینینی فایل</div>
            <div className="mt-1 text-[12px] text-zinc-400">PDF و فایله‌كان</div>
          </Link>
          <Link
            to="/exams"
            className="group rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-3 text-right"
          >
            <div className="text-[11px] text-zinc-400">خوێندنگە</div>
            <div className="text-sm font-semibold text-white">پرسیار و تێبینی</div>
            <div className="mt-1 text-[12px] text-zinc-400">ئەسیلەکان، تێبینییە گرنگەکان</div>
          </Link>
        </div>

        {/* Fine print */}
        <p className="mt-6 text-[12px] text-zinc-500 text-center">
          کێشە هەیە؟ — تکایە بەستەری سەرەوە بنێرن یان كلیك لە راپۆرت بکەن.
        </p>
      </main>

      {/* subtle grid on top for depth */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:22px_22px]" />
    </div>
  );
}
