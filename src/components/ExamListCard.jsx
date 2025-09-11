// src/components/ExamListCard.jsx
import React from "react";
import {
  Calendar,
  Tag,
  GraduationCap,
  FileText,
  Download,
  User2,
} from "lucide-react";

/**
 * Props:
 *  - item: {
 *      id, title, subject, teacher, pdf_url, thumb_url,
 *      yearStart, yearEnd, term, stream
 *    }
 *  - onOpen: (item) => void
 */
export default function ExamListCard({ item, onOpen }) {
  const {
    title,
    subject,
    teacher,
    pdf_url,
    thumb_url,
    yearStart,
    yearEnd,
    term,
    stream,
  } = item || {};

  const streamBadge = (() => {
    if (stream === "scientific")
      return { text: "زانستی", cls: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/20" };
    if (stream === "literary")
      return { text: "ئەدەبی", cls: "bg-rose-500/15 text-rose-300 ring-rose-500/20" };
    if (stream === "both")
      return { text: "هاوبەش", cls: "bg-violet-500/15 text-violet-300 ring-violet-500/20" };
    return null;
  })();

  const yearText =
    yearStart ? `${yearStart}${yearEnd ? `–${yearEnd}` : ""}` : null;

  return (
    <div
      dir="rtl"
      className="group w-full rounded-2xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-900/80 transition-colors"
    >
      <div className="p-3 sm:p-4 flex items-center gap-3">
        {/* Thumb */}
        {thumb_url ? (
          <img
            src={thumb_url}
            alt=""
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover ring-1 ring-white/10"
          />
        ) : (
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl grid place-items-center ring-1 ring-white/10 bg-gradient-to-br from-sky-500/15 to-fuchsia-500/10">
            <FileText className="w-6 h-6 text-sky-300" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm sm:text-base font-extrabold text-white truncate">
              {title || "بی‌ناو"}
            </h3>

            {/* Open/View */}
            {pdf_url && (
              <button
                onClick={() => onOpen?.(item)}
                className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                           bg-white/10 hover:bg-white/15 text-white text-[11px] ring-1 ring-white/15"
              >
                <Download className="w-3.5 h-3.5" />
                بینین
              </button>
            )}
          </div>

          {/* Meta badges */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
            {subject && (
              <Badge icon={GraduationCap} text={subject} className="bg-cyan-500/15 text-cyan-300 ring-cyan-500/20" />
            )}
            {yearText && (
              <Badge icon={Calendar} text={yearText} className="bg-indigo-500/15 text-indigo-300 ring-indigo-500/20" />
            )}
            {term && (
              <Badge icon={Tag} text={`خباط ${term}`} className="bg-amber-500/15 text-amber-300 ring-amber-500/20" />
            )}
            {streamBadge && (
              <Badge text={streamBadge.text} className={streamBadge.cls} />
            )}
            {teacher && (
              <Badge icon={User2} text={teacher} className="bg-teal-500/15 text-teal-300 ring-teal-500/20" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ icon: Icon, text, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ring-1 ${className}`}
      title={text}
    >
      {Icon ? <Icon className="w-3.5 h-3.5" /> : null}
      <span className="leading-none">{text}</span>
    </span>
  );
}
