import React, { useMemo, useState, useEffect, useRef } from "react";
import { Search, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Normalize Kurdish/Arabic strings for comparison
const normalize = (s = "") =>
  s
    .normalize("NFKC")
    .replace(/\u200c/g, "")
    .replace(/[ىي]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\s+/g, " ")
    .trim();

export default function Toolbar({
  q,
  setQ,
  subjects = [],
  activeSubject = "",
  setActiveSubject,
}) {
  const [openSuggest, setOpenSuggest] = useState(false);
  const inputRef = useRef(null);

  const subjectOptions = useMemo(
    () => subjects.map((s) => ({ raw: s, norm: normalize(s) })),
    [subjects]
  );

  const activeNorm = normalize(activeSubject);

  const suggestions = useMemo(() => {
    const nq = normalize(q);
    if (!nq) return [];
    const startHits = subjectOptions.filter((o) => o.norm.startsWith(nq));
    const containHits = subjectOptions.filter(
      (o) => !o.norm.startsWith(nq) && o.norm.includes(nq)
    );
    return [...startHits, ...containHits].slice(0, 8);
  }, [q, subjectOptions]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!inputRef.current?.closest) return;
      if (!inputRef.current.closest(".toolbar-root")) setOpenSuggest(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const selectSubject = (s) => {
    setActiveSubject(s);
    setOpenSuggest(false);
  };

  return (
    <div dir="rtl" className="toolbar-root flex flex-col gap-2">
      {/* Search */}
      <div className="relative">
        <div className="flex items-center gap-2 rounded-2xl bg-white/5 ring-1 ring-white/10 px-3 py-2">
          <Search className="w-4 h-4 text-zinc-300" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpenSuggest(true);
            }}
            onFocus={() => q && setOpenSuggest(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && suggestions.length > 0) {
                selectSubject(suggestions[0].raw);
              } else if (e.key === "Escape") {
                setOpenSuggest(false);
              }
            }}
            placeholder="گەڕان…"
            className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-zinc-400"
          />
          {q ? (
            <button
              onClick={() => {
                setQ("");
                setOpenSuggest(false);
                inputRef.current?.focus();
              }}
              className="text-zinc-300 hover:text-white"
              title="سڕینەوە"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <Sparkles className="w-4 h-4 text-zinc-300" />
          )}
        </div>

        {/* Suggestions */}
        <AnimatePresence>
          {openSuggest && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="absolute z-20 mt-1 w-full rounded-xl bg-zinc-950/90 ring-1 ring-white/10 shadow-xl backdrop-blur"
            >
              <ul className="max-h-72 overflow-auto py-1">
                {suggestions.map((s) => (
                  <li key={s.raw}>
                    <button
                      onClick={() => selectSubject(s.raw)}
                      className="w-full text-right px-3 py-2 text-sm text-zinc-100 hover:bg-white/5"
                    >
                      {s.raw}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subjects chip row */}
      {subjects.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 py-1">
          {subjectOptions.map((o) => {
            const isActive = activeNorm && o.norm === activeNorm;
            return (
              <button
                key={o.raw}
                onClick={() => selectSubject(o.raw)}
                className={`px-3 py-1.5 rounded-2xl ring-1 text-[12px] transition whitespace-nowrap
                  ${
                    isActive
                      ? "bg-white/15 text-white ring-white/25"
                      : "bg-white/5 text-zinc-300 ring-white/10 hover:bg-white/10"
                  }`}
              >
                {o.raw}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
