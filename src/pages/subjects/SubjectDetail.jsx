// src/pages/SubjectDetail.jsx
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
} from "lucide-react";

/* =========================
   CONFIG / META
   ========================= */
const API_DOCS = "https://api.studentkrd.com/api/v1/documents";
const API_PAPERS = "https://api.studentkrd.com/api/v1/papers";
const API_SOUNDS = "https://api.studentkrd.com/api/v1/sounds";
// optional: resolve slug -> subject data
const API_SUBJECT_LOOKUP = "https://api.studentkrd.com/api/v1/subjects/find";

const STREAM_MAP = { scientific: "زانستی", literary: "ئەدەبی", both: "هاوبەش" };

/* ✅ Only these subjects can show "Sounds" */
const SOUND_SUBJECT_IDS = [1];               // add more IDs if needed
const SOUND_SUBJECT_SLUGS = ["english"];     // add more slugs if needed

/* =========================
   UTILITIES
   ========================= */
const SPRING = { type: "spring", stiffness: 220, damping: 22, mass: 0.9 };

async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("Network error");
  return r.json();
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
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full ring-1 ring-white/10 text-[10px] text-zinc-200 bg-white/5">
    {children}
  </span>
);

const Count = ({ n }) =>
  n > 0 ? (
    <span className="ml-2 inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] text-[10px] px-1 rounded-full bg-white/10 ring-1 ring-white/15 text-zinc-100">
      {n}
    </span>
  ) : null;

const CardButton = ({ icon, title, desc, onClick, count, disabled, isActive = false }) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    whileHover={!disabled ? { y: -2, scale: 1.005 } : undefined}
    transition={SPRING}
    className={[
      "group flex items-start gap-3 rounded-2xl p-4 text-right",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40",
      disabled
        ? "bg-zinc-900/40 border border-white/5 text-zinc-500 cursor-not-allowed"
        : "bg-zinc-900/60 border border-white/10 hover:bg-zinc-900/80",
      isActive ? "ring-2 ring-sky-500/50" : "",
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
        className: `${icon.props.className || ""} ${disabled ? "text-zinc-600" : ""}`,
      })}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 text-sm font-bold text-white mb-0.5">
        <span className="truncate">{title}</span>
        <Count n={count || 0} />
      </div>
      {desc && <div className="text-[12px] text-zinc-400 line-clamp-1">{desc}</div>}
    </div>
  </motion.button>
);

const SkeletonRow = () => (
  <div className="rounded-2xl h-[72px] bg-zinc-900/60 border border-white/10 overflow-hidden relative">
    <div className="absolute inset-0 animate-pulse bg-white/5" />
  </div>
);

/* =========================
   MAIN COMPONENT
   ========================= */
export default function SubjectDetail() {
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

  // slug -> id (optional)
  useEffect(() => {
    let ok = true;
    (async () => {
      if (subjectIdFromRoute) {
        setResolvedId(subjectIdFromRoute);
        setResolvedDisplay(`بابەت #${subjectIdFromRoute}`);
        return;
      }
      if (!subjectSlug) return;
      try {
        const url = new URL(API_SUBJECT_LOOKUP);
        url.searchParams.set("slug", subjectSlug);
        const j = await fetchJSON(url.toString());
        const sub = j?.data || j;
        if (ok && sub) {
          const id = sub.id ?? null;
          setResolvedId(id);
          setResolvedDisplay(sub.name || subjectSlug);
        } else if (ok) {
          setResolvedId(null);
          setResolvedDisplay(subjectSlug);
        }
      } catch {
        if (ok) {
          setResolvedId(null);
          setResolvedDisplay(subjectSlug);
        }
      }
    })();
    return () => {
      ok = false;
    };
  }, [subjectIdFromRoute, subjectSlug]);

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
    return () => {
      ok = false;
    };
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
    if (resolvedDisplay) return resolvedDisplay;
    if (resolvedId) return `بابەت #${resolvedId}`;
    return "بابەت";
  }, [resolvedDisplay, resolvedId]);

  const showAnything = Object.values(counts).some((c) => c > 0);

  return (
    <section
      dir="rtl"
      className={[
        "relative w-full overflow-hidden",
        // break out of AppShell padding to become FULL WIDTH:
        "mx-[-12px] md:mx-[-24px]",
        "pb-6",
      ].join(" ")}
    >
      {/* Edge-to-edge sticky header (no gradients) */}
      <div className="sticky top-2 z-10 px-3 md:px-6">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur px-3 sm:px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 text-white min-w-0">
              <Link
                to="/subjects"
                className="text-zinc-300 hover:text-white text-xs sm:text-sm shrink-0"
              >
                بابەتەکان
              </Link>
              <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
              <span className="font-extrabold text-base sm:text-lg truncate">
                {subjectHeader}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs">
              {typeof grade === "number" && (
                <Badge>
                  <GraduationCap className="w-3 h-3 text-sky-400" />
                  پۆل {grade}
                </Badge>
              )}
              {stream && <Badge>جۆر: {streamKurdish(stream)}</Badge>}
              {resolvedId && <Badge>ID: {resolvedId}</Badge>}
            </div>
          </div>
        </div>
      </div>

      {/* Edge-to-edge content card (solid bg) */}
      <div className="mt-3 px-3 md:px-6">
        <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-4 sm:p-6">
          {/* States */}
          {error && (
            <div className="mb-3 flex items-center gap-2 text-rose-200 text-sm bg-rose-500/10 border border-rose-400/20 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="break-words">{error}</span>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-zinc-300 text-sm">
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
                className={[
                  "grid gap-3",
                  "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
                ].join(" ")}
              >
                {counts.docs > 0 && (
                  <CardButton
                    icon={<BookOpenCheck className="text-emerald-300" />}
                    title="کتێب و مه‌لزه‌مه‌"
                    desc="کتێب / مەلزمە"
                    onClick={goBooks}
                    count={counts.docs}
                  />
                )}
                {counts.notes > 0 && (
                  <CardButton
                    icon={<FileText className="text-purple-300" />}
                    title="تێبینی گرنگ"
                    desc="PDF ـە گرنگەکان"
                    onClick={goNotes}
                    count={counts.notes}
                  />
                )}
                {counts.iq > 0 && (
                  <CardButton
                    icon={<ListChecks className="text-amber-300" />}
                    title="ئەسیلەی گرنگ"
                    desc="پرسیارە گرنگەکان"
                    onClick={goIQ}
                    count={counts.iq}
                  />
                )}
                {counts.ne > 0 && (
                  <CardButton
                    icon={<ListChecks className="text-cyan-300" />}
                    title="ئه‌سیله‌ی نیشتیمانی(وزاری)"
                    desc="ساڵه‌ گرنگه‌كان"
                    onClick={goNE}
                    count={counts.ne}
                  />
                )}
                {counts.gallery > 0 && (
                  <CardButton
                    icon={<ImageIcon className="text-sky-300" />}
                    title="وێنه‌كان"
                    desc="وێنەکان به‌ باسكردنه‌وه‌"
                    onClick={goGallery}
                    count={counts.gallery}
                  />
                )}
                {counts.episode > 0 && (
                  <CardButton
                    icon={<Sparkles className="text-sky-300" />}
                    title="ئیپسۆد"
                    desc="سه‌رجه‌م ئیپسۆد"
                    onClick={goEpisode}
                    count={counts.episode}
                  />
                )}
                {counts.scientist > 0 && (
                  <CardButton
                    icon={<GraduationCap className="text-rose-300" />}
                    title="زاناكان"
                    desc="زاناكان و لێکۆڵینەوە"
                    onClick={goScientist}
                    count={counts.scientist}
                  />
                )}

                {/* ✅ Sounds only when allowed */}
                {isSoundsSubject && counts.sounds > 0 && (
                  <CardButton
                    icon={<AudioLines className="text-emerald-300" />}
                    title="دەنگەکان"
                    desc="وشەکان و خوێندنەوە"
                    onClick={goSounds}
                    count={counts.sounds}
                  />
                )}

                {!showAnything && (
                  <div className="col-span-full text-zinc-400 text-sm py-4">
                    هیچ سەرچاوەیەک بۆ ئەم بابەتە نەدۆزرایەوە.
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Simple divider (no gradient) */}
      <div className="mt-4 px-3 md:px-6">
        <div className="h-px bg-white/10 rounded" />
      </div>
    </section>
  );
}
