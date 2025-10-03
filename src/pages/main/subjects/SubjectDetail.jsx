// src/pages/SubjectDetail.jsx — Dashboard‑style Subject Detail (RTL, Dark, Motion)
// Matches the new Dashboard / SubjectsHub vibe: hero bar, stat tiles, glass cards, tighter mobile.

import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpenCheck,
  FileText,
  ListChecks,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
  GraduationCap,
  Sparkles,
  AudioLines,
  AlertTriangle,
  Info,
  BookMarked,
} from "lucide-react";
import HeaderGradientBar from "@/components/HeaderGradientBar";
import useLocalAppearance from "@/lib/useLocalAppearance";

/* =========================
   CONFIG / META
   ========================= */
const API_BASE = "https://api.studentkrd.com/api/v1";
const API_DOCS = `${API_BASE}/documents`;
const API_PAPERS = `${API_BASE}/papers`;
const API_SOUNDS = `${API_BASE}/sounds`;
const API_SUBJECT_FIND = `${API_BASE}/subjects/find`;
const API_SUBJECTS = `${API_BASE}/subjects`;

const STREAM_MAP = { scientific: "زانستی", literary: "ئەدەبی", both: "هاوبەش" };

/* ✅ Only these subjects can show "Sounds" */
const SOUND_SUBJECT_IDS = [1];
const SOUND_SUBJECT_SLUGS = ["english"];

/* =========================
   UTILITIES
   ========================= */
const EASE = [0.22, 1, 0.36, 1];
const SPRING = { type: "spring", stiffness: 220, damping: 22, mass: 0.9 };

async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("Network error");
  return r.json();
}

/** Try multiple endpoints/shapes to resolve subject by id/slug */
async function resolveSubject({ id, slug }) {
  const tryList = [];

  if (slug) {
    const u = new URL(API_SUBJECT_FIND);
    u.searchParams.set("slug", slug);
    tryList.push(u.toString());
  }
  if (id != null) {
    // /subjects/find?id=ID
    let u = new URL(API_SUBJECT_FIND);
    u.searchParams.set("id", String(id));
    tryList.push(u.toString());

    // /subjects/find?subject_id=ID
    u = new URL(API_SUBJECT_FIND);
    u.searchParams.set("subject_id", String(id));
    tryList.push(u.toString());

    // /subjects/:id
    tryList.push(`${API_SUBJECTS}/${id}`);

    // /subjects?subject_id=ID
    u = new URL(API_SUBJECTS);
    u.searchParams.set("subject_id", String(id));
    tryList.push(u.toString());
  }

  for (const url of tryList) {
    try {
      const j = await fetchJSON(url);
      const obj = j?.data ?? j;
      if (!obj) continue;

      // support list or single
      const one = Array.isArray(obj) ? obj[0] : obj;
      if (!one) continue;

      const name = one.name || one.title || null;
      const rid = one.id ?? one.subject_id ?? id ?? null;

      if (name || rid != null) return { id: rid, name };
    } catch {
      // keep trying next pattern
    }
  }
  return { id: id ?? null, name: null };
}

function mapTrackToStream(track) {
  const t = (track || "").toLowerCase();
  if (t.includes("scientific") || t.includes("sci") || t === "زانستی") return "scientific";
  if (t.includes("literary") || t.includes("lit") || t === "ئەدەبی") return "literary";
  if (t.includes("both") || t === "هاوبەش") return "both";
  return null;
}
function streamKurdish(s) {
  return STREAM_MAP[s] || s;
}

/* =========================
   UI PRIMITIVES
   ========================= */
const Badge = ({ children }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full ring-1 ring-white/10 text-[10px] text-zinc-200 bg-white/5 text-shadow-sm">
    {children}
  </span>
);

const Count = ({ n }) =>
  n > 0 ? (
    <span className="ml-2 inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] text-[10px] px-1 rounded-full bg-white/10 ring-1 ring-white/15 text-zinc-100 text-shadow-sm">
      {n}
    </span>
  ) : null;

const CardButton = ({ icon, title, desc, onClick, count, disabled, isActive = false }) => (
  <motion.button
    type="button"
    onClick={onClick}
    disabled={disabled}
    whileHover={!disabled ? { y: -2, scale: 1.005 } : undefined}
    transition={SPRING}
    className={[
      "group flex items-start gap-3 rounded-2xl p-4 text-right w-full",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50",
      "bg-white/5 border border-white/10 backdrop-blur-md",
      disabled
        ? "text-zinc-500 cursor-not-allowed"
        : "hover:bg-white/10 hover:border-cyan-400/30",
      isActive ? "ring-2 ring-cyan-400/50" : "",
    ].join(" ")}
  >
    <div
      className={[
        "shrink-0 w-12 h-12 rounded-xl grid place-items-center ring-1",
        disabled ? "bg-zinc-800/50 ring-white/5" : "bg-white/5 ring-white/10",
      ].join(" ")}
    >
      {React.cloneElement(icon, {
        size: 18,
        className: `${icon.props.className || ""} ${disabled ? "text-zinc-600" : "text-cyan-400"}`,
      })}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 text-sm font-bold text-white mb-0.5 text-shadow-md">
        <span className="truncate">{title}</span>
        <Count n={count || 0} />
      </div>
      {desc && <div className="text-[12px] text-zinc-400 line-clamp-1 text-shadow-sm">{desc}</div>}
    </div>
  </motion.button>
);

const SkeletonRow = () => (
  <div className="rounded-2xl h-[72px] bg-white/5 border border-white/10 backdrop-blur-md overflow-hidden relative shimmer" />
);

const StatTile = ({ label, value, sub, icon: Icon }) => (
  <div className="rounded-2xl ring-1 ring-white/10 bg-white/5 p-3 sm:p-4 flex items-center gap-3 min-w-0">
    <div className="grid place-items-center w-10 h-10 rounded-xl bg-white/10 ring-1 ring-white/15 shrink-0">
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="min-w-0">
      <div className="text-zinc-300 text-[11.5px] truncate">{label}</div>
      <div className="text-zinc-50 font-bold text-base sm:text-lg leading-5">{value}</div>
      {sub && <div className="text-[11px] text-zinc-500">{sub}</div>}
    </div>
  </div>
);

/* =========================
   MAIN COMPONENT
   ========================= */
export default function SubjectDetail() {
  useLocalAppearance(); // read & apply theme/accent/fontScale from localStorage

  const params = useParams();
  const rawParam = params?.id ? decodeURIComponent(params.id) : "";
  const isNumeric = /^\d+$/.test(rawParam);
  const subjectIdFromRoute = isNumeric ? Number(rawParam) : null;
  const subjectSlug = !isNumeric ? rawParam : null;

  // prefs
  const [grade, setGrade] = useState(null);
  const [stream, setStream] = useState(null);

  // resolved subject
  const [resolvedId, setResolvedId] = useState(subjectIdFromRoute);
  const [subjectName, setSubjectName] = useState(null);
  const [resolvedDisplay, setResolvedDisplay] = useState(
    subjectSlug || (subjectIdFromRoute ? `بابەت #${subjectIdFromRoute}` : "بابەت")
  );

  // allow "sounds"?
  const isSoundsSubject = useMemo(() => {
    if (resolvedId && SOUND_SUBJECT_IDS.includes(Number(resolvedId))) return true;
    if (subjectSlug && SOUND_SUBJECT_SLUGS.includes(String(subjectSlug).toLowerCase())) return true;
    return false;
  }, [resolvedId, subjectSlug]);

  const [counts, setCounts] = useState({
    docs: 0,
    notes: 0,
    iq: 0,
    ne: 0,
    gallery: 0,
    episode: 0,
    scientist: 0,
    sounds: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasStreams = typeof grade === "number" ? grade >= 10 : true;

  // load prefs
  useEffect(() => {
    try {
      const g = localStorage.getItem("grade");
      const t = localStorage.getItem("track");
      setGrade(g ? Number(g) : null);
      setStream(mapTrackToStream(t));
    } catch {
      setGrade(null);
      setStream(null);
    }
  }, []);

  // Resolve subject on first load (ID or slug)
  useEffect(() => {
    let ok = true;
    (async () => {
      // if route gave id, resolve name
      if (subjectIdFromRoute != null) {
        const { id, name } = await resolveSubject({ id: subjectIdFromRoute });
        if (!ok) return;
        setResolvedId(id ?? subjectIdFromRoute);
        if (name) {
          setSubjectName(name);
          setResolvedDisplay(name);
        } else {
          setSubjectName(null);
          setResolvedDisplay(`بابەت #${subjectIdFromRoute}`);
        }
        return;
      }

      // if route gave slug, resolve id + name
      if (subjectSlug) {
        const { id, name } = await resolveSubject({ slug: subjectSlug });
        if (!ok) return;
        setResolvedId(id ?? null);
        if (name) {
          setSubjectName(name);
          setResolvedDisplay(name);
        } else {
          setSubjectName(null);
          setResolvedDisplay(subjectSlug);
        }
      }
    })();
    return () => { ok = false; };
  }, [subjectIdFromRoute, subjectSlug]);

  // Safety: whenever we have an ID but no name yet, try again (covers API variants)
  useEffect(() => {
    let ok = true;
    (async () => {
      if (resolvedId != null && !subjectName) {
        const { name } = await resolveSubject({ id: resolvedId });
        if (!ok) return;
        if (name) {
          setSubjectName(name);
          setResolvedDisplay(name);
        }
      }
    })();
    return () => { ok = false; };
  }, [resolvedId, subjectName]);

  // params builder
  const buildParams = (base = {}) => {
    const sp = new URLSearchParams();
    if (resolvedId) {
      sp.set("subject_id", String(resolvedId));
      sp.set("subjectId", String(resolvedId));
    } else if (subjectSlug) {
      sp.set("subject", subjectSlug);
    }
    if (typeof grade === "number" && !Number.isNaN(grade)) sp.set("grade", String(grade));
    if (hasStreams && stream && stream !== "") sp.set("stream", stream);
    if (base.type) sp.set("type", base.type);
    if (base.page) sp.set("page", String(base.page));
    return sp.toString();
  };

  async function fetchTotal(root, extra = {}) {
    const url = `${root}?${buildParams({ ...extra, page: 1 })}`;
    const j = await fetchJSON(url);
    if (typeof j?.total === "number") return j.total;
    if (Array.isArray(j?.data)) return j.data.length;
    if (Array.isArray(j)) return j.length;
    return 0;
  }

  // fetch counts
  useEffect(() => {
    let ok = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [d, n, iq, ne, g, ep, sc, sRaw] = await Promise.all([
          fetchTotal(API_DOCS).catch(() => 0),
          fetchTotal(API_PAPERS, { type: "important_note" }).catch(() => 0),
          fetchTotal(API_PAPERS, { type: "important_questions" }).catch(() => 0),
          fetchTotal(API_PAPERS, { type: "national_exam" }).catch(() => 0),
          fetchTotal(API_PAPERS, { type: "images_of_sessions" }).catch(() => 0),
          fetchTotal(API_PAPERS, { type: "episode" }).catch(() => 0),
          fetchTotal(API_PAPERS, { type: "scientist" }).catch(() => 0),
          fetchTotal(API_SOUNDS).catch(() => 0),
        ]);

        if (!ok) return;

        // Only allow sounds for allowed subjects
        const s = isSoundsSubject ? sRaw : 0;

        setCounts({ docs: d, notes: n, iq, ne, gallery: g, episode: ep, scientist: sc, sounds: s });
      } catch (e) {
        if (ok) setError("هەڵە لە هێنانەوەی داتا.");
      } finally {
        if (ok) setLoading(false);
      }
    })();
    return () => { ok = false; };
  }, [resolvedId, subjectSlug, grade, stream, isSoundsSubject]);

  // navigation helpers
  const addCommon = (sp = new URLSearchParams()) => {
    if (resolvedId) {
      sp.set("subject_id", String(resolvedId));
      sp.set("subjectId", String(resolvedId));
    } else if (subjectSlug) {
      sp.set("subject", subjectSlug);
    }
    if (typeof grade === "number") sp.set("grade", String(grade));
    if (hasStreams && stream) sp.set("stream", stream);
    return sp;
  };
  const goBooks = () => {
    const sp = addCommon(new URLSearchParams());
    window.location.assign(`/resources/books?${sp.toString()}`);
  };
  const goNotes = () => {
    const sp = addCommon(new URLSearchParams());
    sp.set("type", "important_note");
    window.location.assign(`/resources/papers?${sp.toString()}`);
  };
  const goIQ = () => {
    const sp = addCommon(new URLSearchParams());
    sp.set("type", "important_questions");
    window.location.assign(`/resources/papers?${sp.toString()}`);
  };
  const goNE = () => {
    const sp = addCommon(new URLSearchParams());
    sp.set("type", "national_exam");
    window.location.assign(`/resources/papers?${sp.toString()}`);
  };
  const goGallery = () => {
    const sp = addCommon(new URLSearchParams());
    sp.set("type", "images_of_sessions");
    window.location.assign(`/resources/papers?${sp.toString()}`);
  };
  const goEpisode = () => {
    const sp = addCommon(new URLSearchParams());
    sp.set("type", "episode");
    window.location.assign(`/resources/texts?${sp.toString()}`);
  };
  const goScientist = () => {
    const sp = addCommon(new URLSearchParams());
    window.location.assign(`/resources/scientist?${sp.toString()}`);
  };
  const goSounds = () => {
    const sp = addCommon(new URLSearchParams());
    window.location.assign(`/resources/sounds?${sp.toString()}`);
  };

  const subjectHeader = useMemo(() => {
    if (subjectName) return subjectName;
    if (resolvedDisplay) return resolvedDisplay;
    if (resolvedId) return `بابەت #${resolvedId}`;
    return "بابەت";
  }, [subjectName, resolvedDisplay, resolvedId]);

  const routeChip = subjectSlug
    ? `/subjects/${subjectSlug}`
    : resolvedId
    ? `/subjects/${resolvedId}`
    : "/subjects";

  const showAnything = Object.values(counts).some((c) => c > 0);

  // derived totals for tiles
  const totalResources = counts.docs + counts.notes + counts.iq + counts.ne + counts.gallery + counts.episode + counts.scientist + (isSoundsSubject ? counts.sounds : 0);

  return (
    <section
      dir="rtl"
      className="relative w-full overflow-hidden pb-6 min-h-screen"
      style={{ fontSize: "calc(1rem * var(--font-scale, 1))" }}
    >
      <style>{`
        .text-shadow-md { text-shadow: 0px 1px 3px rgba(0, 0, 0, 0.6); }
        .text-shadow-sm { text-shadow: 0px 0.5px 2px rgba(0, 0, 0, 0.5); }
        .shimmer{position:relative;overflow:hidden}
        .shimmer::after{content:"";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);animation:shimmer 1.6s infinite}
        @keyframes shimmer{to{transform:translateX(100%)}}
      `}</style>

      {/* dotted background like dashboard */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-black bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Hero */}
      <div className="px-3 md:px-6 pt-2">
        <HeaderGradientBar title={subjectHeader} subtitle={routeChip} showQuickControls={false} />
      </div>

      {/* Crumbs + badges */}
      <div className="mt-2 px-3 md:px-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-3 sm:px-4 py-2.5">
          <div className="flex items-center gap-2 text-white min-w-0 text-xs sm:text-sm">
            <Link to="/subjects" className="text-zinc-300 hover:text-white shrink-0 text-shadow-sm">بابەتەکان</Link>
            <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-extrabold truncate text-shadow-md">{subjectHeader}</span>

            <div className="ml-auto flex items-center gap-2 text-[11px] sm:text-xs">
              {typeof grade === "number" && (
                <Badge>
                  <GraduationCap className="w-3 h-3 text-cyan-400" /> پۆل {grade}
                </Badge>
              )}
              {stream && <Badge>جۆر: {streamKurdish(stream)}</Badge>}
              {resolvedId && <Badge>ID: {resolvedId}</Badge>}
            </div>
          </div>
        </div>
      </div>

      {/* Stat tiles row (dashboard style) */}
      <div className="mt-3 px-3 md:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <StatTile label="کۆی سەرچاوە" value={totalResources} sub="هەموو جۆرەکان" icon={BookMarked} />
          <StatTile label="کتێب/مه‌لزه‌مه‌" value={counts.docs} sub="Documents" icon={BookOpenCheck} />
          <StatTile label="تێبینی + ئەسیلە" value={counts.notes + counts.iq} sub="Notes & IQ" icon={ListChecks} />
          <StatTile label="وێنە/ئێپسۆد/زانا" value={counts.gallery + counts.episode + counts.scientist} sub="Misc" icon={Sparkles} />
        </div>
        <div className="mt-2 text-[11px] text-zinc-400 flex items-center gap-1">
          <Info className="w-3.5 h-3.5" />
          <span>ئامارەکان بەپێی پۆل/تڕاک فلتەرکراون. داتاکان داینامیکیە.</span>
        </div>
      </div>

      {/* Content panel */}
      <div className="mt-3 px-3 md:px-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 sm:p-6">
          {error && (
            <div className="mb-3 flex items-center gap-2 text-rose-200 text-sm bg-rose-500/10 border border-rose-400/20 rounded-xl p-3 text-shadow-sm" aria-live="polite">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="break-words">{error}</span>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-zinc-300 text-sm text-shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>داتاکان بار دەبن…</span>
              </div>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div
                key="grid"
                layout
                className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
              >
                {counts.docs > 0 && (
                  <CardButton icon={<BookOpenCheck />} title="کتێب و مه‌لزه‌مه‌" desc="کتێب / مەلزمە" onClick={goBooks} count={counts.docs} />
                )}
                {counts.notes > 0 && (
                  <CardButton icon={<FileText />} title="تێبینی گرنگ" desc="PDF ـە گرنگەکان" onClick={goNotes} count={counts.notes} />
                )}
                {counts.iq > 0 && (
                  <CardButton icon={<ListChecks />} title="ئەسیلەی گرنگ" desc="پرسیارە گرنگەکان" onClick={goIQ} count={counts.iq} />
                )}
                {counts.ne > 0 && (
                  <CardButton icon={<ListChecks />} title="ئه‌سیله‌ی نیشتیمانی(وزاری)" desc="ساڵه‌ گرنگه‌كان" onClick={goNE} count={counts.ne} />
                )}
                {counts.gallery > 0 && (
                  <CardButton icon={<ImageIcon />} title="وێنه‌كان" desc="وێنەکان به‌ باسكردنه‌وه‌" onClick={goGallery} count={counts.gallery} />
                )}
                {counts.episode > 0 && (
                  <CardButton icon={<Sparkles />} title="ئیپسۆد" desc="سه‌رجه‌م ئیپسۆد" onClick={goEpisode} count={counts.episode} />
                )}
                {counts.scientist > 0 && (
                  <CardButton icon={<GraduationCap />} title="زاناكان" desc="زاناكان و لێکۆڵینەوە" onClick={goScientist} count={counts.scientist} />
                )}
                {isSoundsSubject && counts.sounds > 0 && (
                  <CardButton icon={<AudioLines />} title="دەنگەکان" desc="وشەکان و خوێندنەوە" onClick={goSounds} count={counts.sounds} />
                )}

                {!showAnything && (
                  <div className="col-span-full text-zinc-400 text-sm py-4 text-shadow-sm">هیچ سەرچاوەیەک بۆ ئەم بابەتە نەدۆزرایەوە.</div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="mt-4 px-3 md:px-6">
        <div className="h-px bg-white/10 rounded" />
      </div>
    </section>
  );
}
