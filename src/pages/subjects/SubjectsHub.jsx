// src/pages/SubjectsHub.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LibraryBig,
  Search,
  CheckCircle2,
  Info,
  ChevronDown,
  BookOpen,
  FlaskConical,
  Feather,
  CircleDashed,
  Star,
} from "lucide-react";

/** APIs */
const API_SUBJECTS = "https://api.studentkrd.com/api/v1/subjects";
const API_DOCS = "https://api.studentkrd.com/api/v1/documents";
const API_PAPERS = "https://api.studentkrd.com/api/v1/papers";

/** utils */
async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("Network error");
  return r.json();
}

/** fetch all pages helper (follows next_page_url) */
async function fetchAllPages(baseUrl, initialParams = "") {
  const out = [];
  let url = `${baseUrl}${initialParams ? `?${initialParams}` : ""}`;
  let guard = 0;
  while (url && guard < 20) {
    const j = await fetchJSON(url);
    if (Array.isArray(j?.data)) out.push(...j.data);
    url = j?.next_page_url || null;
    guard += 1;
  }
  return out;
}

/** safe params (omit null/undefined/"null") */
function buildParams(obj) {
  const sp = new URLSearchParams();
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== "null" && v !== "") {
      sp.set(k, String(v));
    }
  });
  return sp.toString();
}

/** localStorage -> stream key */
function normalizeTrack(v) {
  const t = (v || "").toLowerCase();
  if (t.includes("scientific") || t.includes("sci") || t === "زانستی") return "scientific";
  if (t.includes("literary") || t.includes("lit") || t === "ئەدەبی") return "literary";
  if (t.includes("both") || t === "هاوبەش") return "both";
  return null;
}
function streamKurdish(s) {
  if (s === "scientific") return "زانستی";
  if (s === "literary") return "ئەدەبی";
  if (s === "both") return "هاوبەش";
  return "—";
}

/* ---------- visual helpers ---------- */
const SubjectIcon = ({ code, className = "w-5 h-5" }) => {
  if (code === "scientific") return <FlaskConical className={className} />;
  if (code === "literary") return <Feather className={className} />;
  return <BookOpen className={className} />;
};
const toneMap = {
  scientific: {
    strip: "from-emerald-400 to-teal-400",
    chip: "bg-emerald-500/10 text-emerald-200 border-emerald-400/30",
    icon: "text-emerald-300",
    ring: "ring-emerald-400/30",
    title: "زانستی",
  },
  literary: {
    strip: "from-fuchsia-400 to-pink-400",
    chip: "bg-fuchsia-500/10 text-fuchsia-200 border-fuchsia-400/30",
    icon: "text-fuchsia-300",
    ring: "ring-fuchsia-400/30",
    title: "ئەدەبی",
  },
  both: {
    strip: "from-amber-400 to-orange-400",
    chip: "bg-amber-500/10 text-amber-200 border-amber-400/30",
    icon: "text-amber-300",
    ring: "ring-amber-400/30",
    title: "هاوبەش",
  },
};

/* ---------- section wrapper ---------- */
const Section = ({ title, count, children, icon, iconTone }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 text-white">
      {icon && React.createElement(icon, { className: `w-6 h-6 ${iconTone}` })}
      <div className="font-extrabold text-xl">{title}</div>
      <span className="text-[12px] px-2 py-0.5 rounded-full bg-white/5 text-white/90 border border-white/10">
        {count} بابەت
      </span>
    </div>
    {children}
  </div>
);

/* ---------- clean playful card ---------- */
const Card = ({ subject, onClick, badge, badgeColor, isReady }) => {
  const code = subject.code === "scientific" || subject.code === "literary" ? subject.code : "both";
  const t = toneMap[code];

  // show top-right badge only if it’s different from the stream chip
  const showBadge = !!badge && badge.trim() !== t.title;

  return (
    <button
      onClick={isReady ? () => onClick(subject.id) : undefined}
      title={subject.name}
      className={`group relative text-right rounded-2xl border border-white/10 bg-zinc-900/70 hover:bg-zinc-900 transition-all duration-200 focus:outline-none focus:ring-2 ${t.ring}`}
    >
      {/* thin gradient strip */}
      <div className={`h-1 w-full rounded-t-2xl bg-gradient-to-r ${t.strip}`} />

      <div className="p-4 sm:p-5">
        {/* title row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center rounded-xl p-2 bg-white/5 border border-white/10">
              <SubjectIcon code={code} className={`w-5 h-5 ${t.icon}`} />
            </span>
            <div className="text-[15px] font-extrabold text-white leading-5 line-clamp-2">
              {subject.name}
            </div>
          </div>

          {showBadge && (
            <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] border ${badgeColor} text-white bg-white/5`}>
              {badge}
            </span>
          )}
        </div>

        {/* meta row */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[12px]">
            {isReady ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span className="text-emerald-200">ئامادەیە</span>
              </>
            ) : (
              <>
                <CircleDashed className="w-4 h-4 text-rose-300" />
                <span className="text-rose-200">به‌م زوانه‌</span>
              </>
            )}
          </div>
          <span className={`text-[11px] px-2 py-0.5 rounded-full border ${t.chip}`}>
            {t.title}
          </span>
        </div>
      </div>
    </button>
  );
};

const SkeletonGrid = ({ rows = 12 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="rounded-2xl border border-white/10 bg-zinc-900/70">
        <div className="h-1 w-full rounded-t-2xl bg-white/10" />
        <div className="p-4">
          <div className="h-5 w-3/4 bg-white/10 rounded mb-3" />
          <div className="h-3 w-1/2 bg-white/10 rounded" />
        </div>
      </div>
    ))}
  </div>
);

/* =========================
   PAGE
   ========================= */
export default function SubjectsHub() {
  const nav = useNavigate();

  const [grade, setGrade] = useState(() => {
    try {
      const gRaw = localStorage.getItem("grade");
      const g = gRaw ? Number(gRaw) : null;
      return Number.isFinite(g) ? g : null;
    } catch {
      return null;
    }
  });
  const [track, setTrack] = useState(() => {
    try {
      const tRaw = localStorage.getItem("track");
      return normalizeTrack(tRaw);
    } catch {
      return null;
    }
  });

  const [allSubjects, setAllSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [onlyReady, setOnlyReady] = useState(false);

  const [avail, setAvail] = useState({
    any: new Set(),
    scientific: new Set(),
    literary: new Set(),
    both: new Set(),
    basic: new Set(),
  });

  /* data load */
  useEffect(() => {
    let ok = true;

    (async () => {
      setLoading(true);
      try {
        const [subjectsJSON, docs, papers] = await Promise.all([
          fetchJSON(`${API_SUBJECTS}?page=1&per_page=100`),
          fetchAllPages(API_DOCS, buildParams({ grade, stream: track, per_page: "100" })),
          fetchAllPages(API_PAPERS, buildParams({ grade, stream: track, per_page: "100" })),
        ]);

        if (!ok) return;

        const subjects = (subjectsJSON?.data || []).map((s) => ({
          id: s.id,
          name: s.name,
          code: (s.code || "").toLowerCase() || null,
        }));
        setAllSubjects(subjects);

        const sets = {
          any: new Set(),
          scientific: new Set(),
          literary: new Set(),
          both: new Set(),
          basic: new Set(),
        };

        for (const d of docs) {
          const sid = d?.subject_id;
          if (!sid) continue;
          sets.any.add(sid);
          const st = (d?.stream || null) ? String(d.stream).toLowerCase() : null;
          if (st === "scientific") sets.scientific.add(sid);
          else if (st === "literary") sets.literary.add(sid);
          else if (st === "both") sets.both.add(sid);
          else sets.basic.add(sid);
        }

        for (const p of papers) {
          const sid = p?.subject_id;
          if (!sid) continue;
          sets.any.add(sid);
          const st = (p?.stream || null) ? String(p.stream).toLowerCase() : null;
          if (st === "scientific") sets.scientific.add(sid);
          else if (st === "literary") sets.literary.add(sid);
          else if (st === "both") sets.both.add(sid);
          else sets.basic.add(sid);
        }

        if (!ok) return;
        setAvail(sets);
      } catch {
        if (!ok) return;
        setAvail({
          any: new Set(),
          scientific: new Set(),
          literary: new Set(),
          both: new Set(),
          basic: new Set(),
        });
      } finally {
        if (ok) setLoading(false);
      }
    })();

    return () => {
      ok = false;
    };
  }, [grade, track]);

  /* search & grouping */
  const queryFiltered = useMemo(() => {
    if (!q.trim()) return allSubjects;
    const needle = q.trim().toLowerCase();
    return allSubjects.filter((s) => (s.name || "").toLowerCase().includes(needle));
  }, [q, allSubjects]);

  const grouped = useMemo(() => {
    const wantsStream = typeof grade === "number" && grade >= 10;
    const filteredSubjects = queryFiltered;

    if (!wantsStream) {
      const basic = filteredSubjects;
      return { mode: "basic", basic };
    }

    const sci = filteredSubjects.filter((s) => s.code === "scientific" || s.code === "both");
    const lit = filteredSubjects.filter((s) => s.code === "literary" || s.code === "both");

    if (track === "scientific") return { mode: "scientific", sci };
    if (track === "literary") return { mode: "literary", lit };
    return { mode: "both", sci, lit };
  }, [queryFiltered, grade, track]);

  const openSubject = (id) => nav(`/subjects/${id}`);

  const handleGradeChange = (e) => {
    const newGrade = e.target.value === "null" ? null : Number(e.target.value);
    setGrade(newGrade);
    localStorage.setItem("grade", newGrade == null ? "" : String(newGrade));
    if (newGrade < 10) {
      setTrack(null);
      localStorage.removeItem("track");
    }
  };
  const handleTrackChange = (e) => {
    const newTrack = e.target.value === "null" ? null : e.target.value;
    setTrack(newTrack);
    if (newTrack == null) localStorage.removeItem("track");
    else localStorage.setItem("track", newTrack);
  };

  /* ready filter */
  const filterReady = (arr) => (onlyReady ? arr.filter((s) => avail.any.has(s.id)) : arr);

  /* header pills */
  const headerPills = useMemo(() => {
    const pills = [];
    if (grade != null)
      pills.push({ label: `پۆل ${grade}`, tone: "text-amber-200 bg-amber-500/10 border-amber-400/30" });
    if (grade >= 10 && track)
      pills.push({ label: streamKurdish(track), tone: "text-sky-200 bg-sky-500/10 border-sky-400/30" });
    if (onlyReady)
      pills.push({ label: "تەنیا ئامادە", tone: "text-emerald-200 bg-emerald-500/10 border-emerald-400/30" });
    return pills;
  }, [grade, track, onlyReady]);

  return (
    <div dir="rtl" className="p-4 sm:p-6 space-y-6 min-h-screen font-kurdish bg-zinc-950 text-white">
      {/* header (clean, no background art) */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 sm:p-6 sticky top-2 z-10 backdrop-blur">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center rounded-2xl p-3 bg-white/5 border border-white/10">
                <LibraryBig className="w-6 h-6 text-amber-300" />
              </span>
              <div className="flex flex-col">
                <div className="font-extrabold text-2xl leading-6">بابەتەکان</div>
                <div className="text-[12px] text-zinc-300">وانە، کتێب و وێنەکان — هەمووی لەم شوێنە.</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[13px] font-medium">
              <div className="relative">
                <select
                  value={grade ?? "null"}
                  onChange={handleGradeChange}
                  className="rounded-full bg-zinc-900 border border-white/10 text-white px-4 py-2 text-center appearance-none cursor-pointer pr-10 hover:bg-zinc-800"
                >
                  <option value="null">هەڵبژاردنی پۆل</option>
                  {[...Array(12).keys()].map((i) => i + 1).map((g) => (
                    <option key={g} value={g}>پۆل {g}</option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
              </div>

              {grade >= 10 && (
                <div className="relative">
                  <select
                    value={track ?? "null"}
                    onChange={handleTrackChange}
                    className="rounded-full bg-zinc-900 border border-white/10 text-white px-4 py-2 text-center appearance-none cursor-pointer pr-10 hover:bg-zinc-800"
                  >
                    <option value="null">هەڵبژاردنی تڕاک</option>
                    <option value="scientific">زانستی</option>
                    <option value="literary">ئەدەبی</option>
                    <option value="both">هاوبەش</option>
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
                </div>
              )}

              {/* Ready-only toggle */}
              <button
                onClick={() => setOnlyReady((v) => !v)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border transition-colors
                  ${onlyReady
                    ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-200"
                    : "bg-zinc-900 border-white/10 text-zinc-200 hover:bg-zinc-800"}
                `}
                title="تەنیا ئەو بابەتانەی ئامادەن"
              >
                <Star className="w-4 h-4" />
                تەنیا ئامادە
              </button>
            </div>
          </div>

          <div className="relative">
            <input
              dir="rtl"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="گەڕان بۆ ناوی بابەت..."
              className="w-full rounded-2xl bg-zinc-900 border border-white/10 text-white text-sm px-10 py-3 outline-none focus:ring-2 focus:ring-amber-400/30 placeholder:text-zinc-400"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {headerPills.map((p, i) => (
                <span key={i} className={`text-[11px] px-2 py-0.5 rounded-full border ${p.tone}`}>
                  {p.label}
                </span>
              ))}
            </div>

            <div className="mt-2 text-[11px] text-zinc-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              <span>تەنها ئەو بابەتانە پیشان دەدرێن کە بۆ پۆلی هەڵبژێردراوت خواردنی ناوەوە هەبن.</span>
            </div>
          </div>
        </div>
      </div>

      {/* body */}
      {loading ? (
        <SkeletonGrid rows={12} />
      ) : grouped.mode === "basic" ? (
        <Section title="بابەتە بنەڕهتییەکان" count={filterReady(grouped.basic).length} icon={BookOpen} iconTone="text-sky-300">
          {filterReady(grouped.basic).length === 0 ? (
            <div className="text-zinc-400 text-sm">هیچ بابەتێک نەدۆزرایەوە.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {filterReady(grouped.basic).map((s) => (
                <Card
                  key={s.id}
                  subject={s}
                  onClick={openSubject}
                  badge="بەناوەند"
                  badgeColor="border-sky-400/30"
                  isReady={avail.any.has(s.id)}
                />
              ))}
            </div>
          )}
        </Section>
      ) : grouped.mode === "scientific" ? (
        <Section title="زانستی" count={filterReady(grouped.sci).length} icon={FlaskConical} iconTone="text-emerald-300">
          {filterReady(grouped.sci).length === 0 ? (
            <div className="text-zinc-400 text-sm">نییە.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {filterReady(grouped.sci).map((s) => (
                <Card
                  key={s.id}
                  subject={s}
                  onClick={openSubject}
                  isReady={avail.any.has(s.id)}
                />
              ))}
            </div>
          )}
        </Section>
      ) : grouped.mode === "literary" ? (
        <Section title="ئەدەبی و هاوبەش" count={filterReady(grouped.lit).length} icon={Feather} iconTone="text-fuchsia-300">
          {filterReady(grouped.lit).length === 0 ? (
            <div className="text-zinc-400 text-sm">نییە.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {filterReady(grouped.lit).map((s) => (
                <Card
                  key={s.id}
                  subject={s}
                  onClick={openSubject}
                  isReady={avail.any.has(s.id)}
                />
              ))}
            </div>
          )}
        </Section>
      ) : (
        <div className="space-y-8">
          <Section title="زانستی و هاوبەش" count={filterReady(grouped.sci).length} icon={FlaskConical} iconTone="text-emerald-300">
            {filterReady(grouped.sci).length === 0 ? (
              <div className="text-zinc-400 text-sm">نییە.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {filterReady(grouped.sci).map((s) => (
                  <Card
                    key={s.id}
                    subject={s}
                    onClick={openSubject}
                    isReady={avail.any.has(s.id)}
                  />
                ))}
              </div>
            )}
          </Section>

          <Section title="ئەدەبی" count={filterReady(grouped.lit).length} icon={Feather} iconTone="text-fuchsia-300">
            {filterReady(grouped.lit).length === 0 ? (
              <div className="text-zinc-400 text-sm">نییە.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {filterReady(grouped.lit).map((s) => (
                  <Card
                    key={s.id}
                    subject={s}
                    onClick={openSubject}
                    isReady={avail.any.has(s.id)}
                  />
                ))}
              </div>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}

/* (Optional) Tailwind keyframes if you want a shimmer later:
@keyframes shimmer { 0% { transform: translateX(-100%);} 100% { transform: translateX(100%);} }
*/
