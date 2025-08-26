// HistoricalResultsPage.jsx — Kurdish-first results archive (RTL)

import React from "react";
import { motion } from "framer-motion";
import { History, ChevronRight } from "lucide-react";

const card = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.18 } },
};

const HistoricalResultsPage = ({ results = [], onViewResult, onGoBack }) => {
  return (
    <div dir="rtl" className="space-y-3 font-['Noto_Naskh_Arabic','Inter',system-ui,sans-serif]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <History size={20} /> ئەنجامەکانم
        </h2>
        <button
          onClick={onGoBack}
          className="px-3 py-1.5 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center gap-1 transition"
        >
          <ChevronRight size={14} /> گەڕانەوە
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {results.length === 0 ? (
          <p className="col-span-full text-center text-zinc-500 py-8">
            هیچ ئەنجامێک نەهەڵگیراوە.
          </p>
        ) : (
          [...results]
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((result) => (
              <motion.button
                key={result.id}
                variants={card}
                initial="hidden"
                animate="show"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onViewResult(result)}
                className="text-right rounded-2xl border border-white/10 bg-white dark:bg-zinc-900 p-4 shadow hover:shadow-md transition"
              >
                <div className="text-sm text-zinc-500">
                  {result.examSubject} • {result.examTrack}
                </div>
                <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                  {result.examTitle}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {new Date(result.timestamp).toLocaleDateString("ku-IQ", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  • نمرە: {result.detailedScore.correct}/
                  {result.detailedScore.total} ({result.detailedScore.percentage}
                  %)
                </div>
              </motion.button>
            ))
        )}
      </div>
    </div>
  );
};

export default HistoricalResultsPage;
