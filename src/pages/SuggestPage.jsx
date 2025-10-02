// src/pages/Exams.jsx — Work In Progress (Dark • RTL • Single Accent)
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles, Hammer, Wrench, Hourglass, CalendarRange, ListChecks
} from "lucide-react";

const EASE = [0.22, 0.61, 0.36, 1];

function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 right-10 h-[36rem] w-[36rem] rounded-full blur-3xl opacity-35 bg-gradient-to-br from-sky-400 via-cyan-400 to-sky-500" />
      <div className="absolute -bottom-40 left-10 h-[34rem] w-[34rem] rounded-full blur-3xl opacity-25 bg-gradient-to-br from-sky-400 via-cyan-400 to-sky-500" />
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:14px_14px]" />
    </div>
  );
  
}

export default function SuggestPage() {
  const nav = useNavigate();

  return (
    <div dir="rtl" className="min-h-screen relative bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-50">
      {/* <Aurora /> */}

      <section className="relative pt-10 sm:pt-14">
        <div className="max-w-5xl mx-auto px-2 sm:px-4">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur overflow-hidden">

            {/* Header */}
            <div className="p-5 sm:p-8">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-sky-500/20 ring-1 ring-sky-400/40 grid place-items-center">
                  <Sparkles className="w-6 h-6 text-cyan-300" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                    تاقیکردنەوەکان
                  </h1>
                  <p className="text-sm text-zinc-400 mt-1">
                    ئەم په‌ڕه‌یه‌لەسەر کاردایە — بە زووترین کات درووست ئه‌كرێت.
                  </p>
                </div>
              </div>

              {/* WIP Banner */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: EASE, delay: 0.05 }}
                className="mt-6 rounded-2xl border border-sky-400/20 bg-sky-500/10"
              >
                <div className="p-4 sm:p-5 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white/10 border border-white/10">
                    <Hourglass className="w-5 h-5 text-sky-200" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/20 text-sky-100 border border-sky-400/30">
                        لەسەر کاردایە
                      </span>
                      <span className="text-sm text-sky-100">پەڕەی تاقیکردنەوەکان</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-6">
                      ئێستا کاری دانانی ڕیزبەندی تاقیکردنەوەکان، خشتەی کات، سەیری پرسیارەکان،
                      و هەژمارکردنی نمرەکان ئەنجام دەدەین.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Planned features list (static preview) */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <CalendarRange className="w-4 h-4 text-cyan-200" /> خشتەی تاقیکردنەوە
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">ڕێکخستنی کات و ڕۆژەکان.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <ListChecks className="w-4 h-4 text-cyan-200" /> بانکەی پرسیار
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">پرسەکان، وەڵامەکان، هەندێک هەڵبژاردن.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Wrench className="w-4 h-4 text-cyan-200" /> تاقیکردنەوەی خێرا
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">نمرەکردن و هەڵسەنگاندنی خۆکار.</p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10" />

            {/* Footer actions */}
            <div className="px-5 sm:px-8 py-5 flex flex-wrap gap-2">
              <button
                onClick={() => nav(-1)}
                className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10"
              >
                گەڕانەوە
              </button>
              <Link
                to="/"
                className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-sky-500/12 border border-sky-400/25 text-sky-200 hover:bg-sky-500/20"
              >
                سەرەکی
              </Link>
              <span className="ms-auto inline-flex items-center gap-2 text-[12px] text-zinc-400">
                <Hammer className="w-4 h-4 opacity-80" />
                {/* ڕەشنوسی: وەشانێکی آزمایشی */}
              </span>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
