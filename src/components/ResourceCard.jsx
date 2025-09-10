import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ExternalLink, BookOpen, NotebookTabs, FileText, Tag } from "lucide-react";

function labelize(v, fallback = "") {
  if (!v) return fallback;
  if (typeof v === "string") return v;
  if (typeof v === "object") return v.name || v.title || v.label || v.code || fallback;
  return String(v ?? fallback);
}

function TypeBadge({ type }) {
  const label = type === "booklet" ? "مەڵزەمە" : type === "book" ? "کتێب" : "پەڕگە";
  return (
    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 text-white ring-1 ring-white/10 backdrop-blur">
      {label}
    </span>
  );
}

function Chip({ children }) {
  return (
    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/5 text-zinc-200 ring-1 ring-white/10">
      {children}
    </span>
  );
}

function Placeholder({ type }) {
  const Icon = type === "booklet" ? NotebookTabs : type === "book" ? BookOpen : FileText;
  const grad =
    type === "booklet"
      ? "from-violet-500/25 via-fuchsia-500/15 to-indigo-500/25"
      : type === "book"
      ? "from-emerald-500/25 via-teal-500/15 to-cyan-500/25"
      : "from-zinc-400/25 via-zinc-300/15 to-zinc-500/25";
  return (
    <div className={`h-full w-full rounded-lg overflow-hidden bg-gradient-to-br ${grad} flex items-center justify-center`}>
      <div className="p-2 rounded-lg bg-black/40 ring-1 ring-white/10">
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );
}

export default function ResourceCard({ item, onOpen }) {
  const [imgErr, setImgErr] = useState(false);
  const type = item?.type || "file";
  const hasThumb = !!item?.thumb_url && !imgErr;

  const subjectLabel = labelize(item?.subject, "بابەت");
  const teacherLabel = labelize(item?.teacher, "");
  const title = item?.title || "ناونیشان";

  const Icon = useMemo(() => (type === "booklet" ? NotebookTabs : type === "book" ? BookOpen : FileText), [type]);

  return (
    <motion.div
      layout
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl bg-zinc-900/60 ring-1 ring-white/10 hover:ring-white/20 p-2.5 text-right group cursor-pointer"
      onClick={() => onOpen?.(item)}
      dir="rtl"
    >
      {/* Media */}
      <div className="relative">
        {/* Narrower aspect to make cards slimmer */}
        <div className="aspect-[7/9] w-full rounded-lg overflow-hidden ring-1 ring-white/10 bg-black/20">
          {hasThumb ? (
            <img
              src={item.thumb_url}
              alt={title}
              className="h-full w-full object-cover"
              onError={() => setImgErr(true)}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <Placeholder type={type} />
          )}
        </div>

        {/* Overlays */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <TypeBadge type={type} />
          <div className="px-1.5 py-0.5 rounded-md bg-black/50 text-white/80 text-[10px] ring-1 ring-white/10 backdrop-blur">
            {item?.size_mb ? `~${item.size_mb}MB` : ""}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mt-2">
        <div className="text-white font-semibold text-[13px] leading-5 line-clamp-2">
          {title}
        </div>
        <div className="mt-1 text-[11px] text-zinc-400 flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-zinc-300" />
          <span className="truncate">{subjectLabel}</span>
          {teacherLabel && <span className="text-zinc-500">• {teacherLabel}</span>}
        </div>

        {/* Tags */}
        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          {item.tags?.slice(0, 3).map((t) => (
            <Chip key={t}><Tag className="inline w-3 h-3 mr-1 opacity-70" />{t}</Chip>
          ))}
          {item.badges?.map((b, i) => (
            <Chip key={`b-${i}`}>{b}</Chip>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-2 flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpen?.(item); }}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800/70 ring-1 ring-zinc-700/60 text-zinc-100 text-[11px] inline-flex items-center gap-1 group-hover:bg-zinc-800"
          >
            <ExternalLink size={13} /> بینین
          </button>
        </div>
      </div>
    </motion.div>
  );
}
