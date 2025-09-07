// components/UnderConstruction.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EASE = [0.22, 0.61, 0.36, 1];

export default function UnderConstruction() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* This div creates the blur and dark overlay */}
        <div className="absolute inset-0 backdrop-blur-md bg-zinc-950/70" />
        
        {/* This is the message box */}
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
          <h2 className="text-2xl font-bold">بۆشایی لەکارکردنە.</h2>
          <p className="text-zinc-300">
            ئەم بەشە لە ماڵپەڕەکەمان لە ئێستادا گەشەپێدەدرێت و بەمزووانە بەردەست دەبێت. سوپاس بۆ ئارامگریت!
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}