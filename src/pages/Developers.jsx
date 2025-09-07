// ================================================
// src/pages/Developers.jsx
// A dedicated page for developers to showcase the project's tech stack and invite collaboration.
// Features:
// - Modern, clean UI with a dark theme.
// - Information on the project's technology stack.
// - An invitation to contribute to the project.
// - Navigation back to the main app.
// ================================================

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Code, Atom, GitPullRequest, ArrowLeft, Heart, Layers, Database
} from "lucide-react";

const EASE = [0.22, 0.61, 0.36, 1];

export default function Developers() {
  const navigate = useNavigate();

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-50 p-3 sm:p-6">
      
      {/* =================== Hero Section =================== */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(1200px_600px_at_120%_-20%,rgba(56,189,248,.15),transparent),radial-gradient(800px_400px_at_-10%_10%,rgba(16,185,129,.12),transparent)] p-6 sm:p-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-sky-500/15 ring-1 ring-sky-400/20 flex items-center justify-center">
              <Code size={36} className="text-sky-300" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">بۆ گەشەپێدەران</h1>
              <p className="text-zinc-400 text-sm sm:text-base mt-1">
                لێرەدا زانیاری لەسەر تەکنەلۆژیای پڕۆژەکەمان دەدۆزیتەوە.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* =================== Main Content =================== */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Tech Stack Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
          className="rounded-3xl border border-white/10 bg-zinc-900/60 backdrop-blur-sm p-6 space-y-4"
        >
          <div className="flex items-center gap-3 text-sky-400">
            <Layers size={24} />
            <h3 className="text-xl font-bold">تەکنەلۆژیای پڕۆژە</h3>
          </div>
          <p className="text-zinc-300 leading-relaxed">
            ئەم پرۆژەیە لەسەر بنەمای تەکنەلۆژیای پێشکەوتوو بنیات نراوە بۆ دابینکردنی ئەزموونێکی خێرا و کارا.
          </p>
          <ul className="list-none space-y-2 text-zinc-400 text-sm">
            <li className="flex items-center gap-2"><Atom size={16} className="text-sky-300"/>React.js (بە React Router) بۆ UI</li>
            <li className="flex items-center gap-2"><Database size={16} className="text-sky-300"/>Firebase (Auth, Firestore, Storage) بۆ داتا و پشتگیری.</li>
            <li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-cyan-400/30 ring-1 ring-cyan-400 flex items-center justify-center"><span className="text-xs font-bold text-cyan-200">TW</span></div>Tailwind CSS بۆ دیزاینی UI</li>
            <li className="flex items-center gap-2"><GitPullRequest size={16} className="text-sky-300"/>Vite بۆ گەشەپێدانی خێرا</li>
            <li className="flex items-center gap-2"><Heart size={16} className="text-sky-300"/>Lucide React بۆ ئایکۆنەکان</li>
          </ul>
        </motion.div>

        {/* Contribution Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.2 }}
          className="rounded-3xl border border-white/10 bg-zinc-900/60 backdrop-blur-sm p-6 space-y-4"
        >
          <div className="flex items-center gap-3 text-emerald-400">
            <GitPullRequest size={24} />
            <h3 className="text-xl font-bold">بەشداری بکە!</h3>
          </div>
          <p className="text-zinc-300 leading-relaxed">
            ئەم پڕۆژەیە کراوەیە بۆ هاوکاری. ئەگەر حەز دەکەیت بەشێک بیت لە گەشەپێدانی ئەم پلاتفۆرمە،
            تکایە پەیوەندیمان پێوە بکە.
          </p>
          <p className="text-zinc-400 text-sm">
            ئەگەر پرۆفایلەکەت یان شتێکی دیکەی ماڵپەڕەکە ناتوانێت کۆدەکەت نیشان بدات، ئەوا دەتوانیت
            بەشداری بکەیت لە ڕێگەی ناردنی نامە لەڕێگەی ئەلیکترۆنی یان تۆڕە کۆمەڵایەتییەکانەوە.
          </p>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.3 }}
          className="lg:col-span-full"
        >
          <button
            onClick={() => navigate(-1)}
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-white/10"
          >
            گەڕانەوە
            <ArrowLeft size={18} />
          </button>
        </motion.div>

      </div>
    </div>
  );
}
