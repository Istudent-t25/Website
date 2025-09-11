import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, ChevronRight, Sparkles } from "lucide-react";
import SubjectIcon from "@/components/SubjectIcon";
import { slug } from "@/utils/slug";

// Groups (unchanged text)
const GROUPS = [
  { key: "scientific", title: "بابەتە زانستییەکان", items: ["بیرکاری", "کیمیا", "فیزیا", "زیندەزانی"] },
  { key: "languages",  title: "زمانەکان",           items: ["ئینگلیزی", "کوردی", "عەرەبی", "ئیسلام"] },
  { key: "literary",   title: "بابەتە ئەدەبییەکان", items: ["مێژوو", "ئابووری", "جووگرافیا", "بیرکاری وێژەیی"] },
];

const streamFromGroupKey = (k) =>
  k === "scientific" ? "scientific" : k === "literary" ? "literary" : "both";

// ——— Optional tiny iOS repaint nudge (safe everywhere) ———
function useIosPaintFix() {
  const ref = useRef(null);
  useEffect(() => {
    const nudge = () => {
      const el = ref.current;
      if (!el) return;
      el.style.opacity = "1"; // ensures visible if anything set it to 0
      el.style.webkitTransform = "translateZ(0)"; // GPU promote
      requestAnimationFrame(() => {
        el.style.webkitTransform = "";
      });
    };
    nudge();
    window.addEventListener("pageshow", nudge);
    return () => window.removeEventListener("pageshow", nudge);
  }, []);
  return ref;
}

function PageHeader({ q, setQ, suggestions, onPick }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    document.addEventListener("touchstart", h);
    return () => {
      document.removeEventListener("mousedown", h);
      document.removeEventListener("touchstart", h);
    };
  }, []);

  const hasQuery = q.trim().length > 0;

  return (
    <div dir="rtl" className="relative">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-sky-500/5 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-cyan-300" />
            <div className="font-extrabold text-lg sm:text-xl">بابەتەکان</div>
          </div>
          <div className="hidden sm:block text-[12px] text-zinc-300">
            بەخێربێیت — دەرچووی کۆتایی بۆ داهاتووەکەت
          </div>
        </div>

        <div className="mt-3" ref={boxRef}>
          <div className="relative">
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="گەڕان بۆ بابەت… (وەکو: بیرکاری، کیمیا، جووگرافیا)"
              className="w-full bg-zinc-900/70 border border-white/10 rounded-2xl pr-3 pl-10 py-3 text-sm text-zinc-100 outline-none"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          </div>

          {/* Suggest box (no animations) */}
          {open && hasQuery && suggestions.length > 0 && (
            <div className="absolute z-50 mt-2 right-0 w-full transform-gpu will-change-transform">
              <div className="rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur p-2 shadow-2xl">
                {suggestions.slice(0, 8).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      onPick(s);
                      setOpen(false);
                    }}
                    className="w-full text-right px-3 py-2 text-sm hover:bg-white/5 rounded-xl flex items-center justify-between text-zinc-200"
                  >
                    <span className="inline-flex items-center gap-2">
                      <SubjectIcon name={s} className="w-4 h-4 text-sky-300" />
                      {s}
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SubjectCard({ name, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        group relative rounded-3xl bg-zinc-900/60 overflow-hidden
        ring-1 ring-white/15 hover:ring-2 hover:ring-sky-400/40
        transition-[transform,box-shadow,ring] duration-200 ease-out
        shadow-[0_8px_30px_rgba(0,0,0,0.25)] text-right
        transform-gpu will-change-transform hover:-translate-y-0.5
      "
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br from-sky-400/10 to-cyan-400/10" />
      <div className="relative p-4 min-h-[120px] flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/10 border border-white/10 text-white/90">
            <SubjectIcon name={name} />
          </div>
          <div className="text-base font-extrabold text-white leading-tight">{name}</div>
        </div>
        <div className="mt-3 text-[12px] text-zinc-400">کلیک بکە بۆ هەموو سەرچاوەکان</div>
      </div>
    </button>
  );
}

export default function SubjectsHub() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const rootRef = useIosPaintFix();

  const allSubjects = useMemo(() => GROUPS.flatMap((g) => g.items), []);
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return GROUPS;
    const filt = (arr) => arr.filter((n) => n.toLowerCase().includes(s));
    return GROUPS.map((g) => ({ ...g, items: filt(g.items) })).filter((g) => g.items.length);
  }, [q]);

  const suggestions = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return allSubjects.filter((n) => n.toLowerCase().includes(s));
  }, [q, allSubjects]);

  const openSubject = (name, stream) =>
    nav(`/subjects/${slug(name)}`, { state: { name, stream } });

  return (
    <div
      ref={rootRef}
      dir="rtl"
      className="p-3 sm:p-5 space-y-4"
      style={{ opacity: 1, transform: "none" }}
    >
      <PageHeader
        q={q}
        setQ={setQ}
        suggestions={suggestions}
        onPick={(n) => openSubject(n, null)}
      />

      {shown.map((group) => (
        <section key={group.key} className="scroll-mt-24">
          <div className="mt-4 mb-2 flex items-baseline justify-between">
            <h2 className="text-lg font-extrabold text-white">{group.title}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {group.items.map((name) => (
              <SubjectCard
                key={name}
                name={name}
                onClick={() => openSubject(name, streamFromGroupKey(group.key))}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
