// src/components/ExamYearGroup.jsx
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Layers, Calendar, GraduationCap } from "lucide-react";
import ExamListCard from "@/components/ExamListCard";

/**
 * Props:
 *  - title, subject, yearStart, yearEnd, stream, items[], onOpenItem
 */
function ExamYearGroup({
  title,
  subject,
  yearStart,
  yearEnd,
  stream,
  items = [],
  onOpenItem,
}) {
  // Collapsed on initial load
  const [open, setOpen] = useState(false);

  const streamBadge = useMemo(() => {
    if (stream === "scientific")
      return { text: "زانستی", cls: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/20" };
    if (stream === "literary")
      return { text: "ئەدەبی", cls: "bg-rose-500/15 text-rose-300 ring-rose-500/20" };
    if (stream === "both")
      return { text: "هاوبەش", cls: "bg-violet-500/15 text-violet-300 ring-violet-500/20" };
    return null;
  }, [stream]);

  const years = yearStart ? `${yearStart}${yearEnd ? `–${yearEnd}` : ""}` : null;

  return (
    <motion.div
      dir="rtl"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/10 overflow-hidden bg-zinc-950/60 shadow-lg shadow-black/30"
    >
      {/* Header / Toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-3 sm:px-4 py-3 flex items-center justify-between
                   bg-gradient-to-br from-white/5 to-white/0 hover:from-white/10 transition cursor-pointer"
      >
        <div className="min-w-0 flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 rounded-2xl grid place-items-center bg-white/5 ring-1 ring-white/10">
            <Layers className="w-5 h-5 text-sky-300" />
          </div>
          <div className="min-w-0">
            <div className="text-white font-extrabold text-sm sm:text-base truncate">{title}</div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-300">
              {subject && (
                <Badge icon={GraduationCap} text={subject} className="bg-cyan-500/15 text-cyan-300 ring-cyan-500/20" />
              )}
              {years && <Badge icon={Calendar} text={years} className="bg-indigo-500/15 text-indigo-300 ring-indigo-500/20" />}
              {streamBadge && <Badge text={streamBadge.text} className={streamBadge.cls} />}
              <Badge text={`${items.length} پەڕە`} className="bg-amber-500/15 text-amber-300 ring-amber-500/20" />
            </div>
          </div>
        </div>

        <motion.div
          className="shrink-0 text-zinc-300"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      {/* Body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <motion.div
              className="p-2 sm:p-3 space-y-2.5 sm:space-y-3"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
                show: { transition: { staggerChildren: 0.05 } },
              }}
            >
              {items.map((it) => (
                <motion.div
                  key={it.id}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <ExamListCard item={it} onOpen={onOpenItem} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Badge({ icon: Icon, text, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ring-1 ${className}`} title={text}>
      {Icon ? <Icon className="w-3.5 h-3.5" /> : null}
      <span className="leading-none">{text}</span>
    </span>
  );
}

// Export BOTH default and named, so either import style works
export { ExamYearGroup };
export default ExamYearGroup;
