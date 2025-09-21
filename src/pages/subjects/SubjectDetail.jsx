// src/pages/SubjectDetail.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  BookOpenCheck,
  FileText,
  ListChecks,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
  GraduationCap,
  Sparkles,
} from "lucide-react";

/* =========================
   CONFIG / META
   ========================= */
const API_DOCS = "https://api.studentkrd.com/api/v1/documents";
const API_PAPERS = "https://api.studentkrd.com/api/v1/papers";

const STREAM_MAP = { scientific: "زانستی", literary: "ئەدەبی", both: "هاوبەش" };

/* =========================
   UTILITIES
   ========================= */
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
    <span className="ml-2 inline-flex items-center justify-center min-w-[1.2rem] h-[1.2rem] text-[10px] px-1 rounded-full bg-white/10 ring-1 ring-white/15 text-zinc-100">
      {n}
    </span>
  ) : null;

const CardButton = ({ icon, title, desc, onClick, count, disabled, isActive = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      flex items-start gap-3 rounded-2xl p-4 transition-all duration-200
      ${disabled ? "bg-zinc-900/40 border border-white/5 text-zinc-500 cursor-not-allowed" : "bg-zinc-900/60 border border-white/10 hover:bg-zinc-900/80"}
      ${isActive ? "ring-2 ring-sky-500/50" : ""}
    `}
  >
    <div className={`shrink-0 w-12 h-12 rounded-full grid place-items-center ${disabled ? "bg-zinc-800/50" : "bg-white/5"}`}>
      {React.cloneElement(icon, { size: 18, className: `${icon.props.className} ${disabled ? "text-zinc-600" : ""}` })}
    </div>
    <div className="text-right flex-1 min-w-0">
      <div className="flex items-center gap-2 text-sm font-bold text-white mb-0.5">
        <span>{title}</span>
        <Count n={count || 0} />
      </div>
      {desc && <div className="text-[12px] text-zinc-400">{desc}</div>}
    </div>
  </button>
);

const SkeletonRow = () => (
  <div className="rounded-2xl h-[72px] bg-zinc-900/60 border border-white/10 overflow-hidden relative">
    <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/5 to-transparent" />
  </div>
);

/* =========================
   MAIN COMPONENT
   ========================= */
export default function SubjectDetail() {
  const params = useParams();
  const rawParam = params?.id ? decodeURIComponent(params.id) : "";
  const subjectId = /^\d+$/.test(rawParam) ? Number(rawParam) : null;
  const subjectNameFromRoute = subjectId ? null : rawParam || null;

  const [grade, setGrade] = useState(null);
  const [stream, setStream] = useState(null);
  const [subjectDisplay, setSubjectDisplay] = useState(subjectNameFromRoute || "بابەت");
  
  const [counts, setCounts] = useState({
    docs: 0,
    notes: 0,
    iq: 0,
    ne: 0,
    gallery: 0,
    episode: 0,
    scientist: 0,
  });
  
  const [loading, setLoading] = useState(true);
  
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
  
  const hasStreams = typeof grade === "number" ? grade >= 10 : true;
  
  const buildParams = (base = {}) => {
    const sp = new URLSearchParams();
    if (subjectId) sp.set("subject_id", String(subjectId));
    else if (subjectNameFromRoute) sp.set("subject", subjectNameFromRoute);
    if (typeof grade === "number" && !Number.isNaN(grade)) sp.set("grade", String(grade));
    // Check if `stream` exists and is not an empty string before adding to params
    if (hasStreams && stream && stream !== "") sp.set("stream", stream);
    if (base.type) sp.set("type", base.type);
    sp.set("page", "1");
    return sp.toString();
  };
  
  async function fetchTotal(root, extra = {}) {
    const url = `${root}?${buildParams({ ...extra, page: 1 })}`;
    const j = await fetchJSON(url);
    return typeof j?.total === "number" ? j.total : (Array.isArray(j?.data) ? j.data.length : 0);
  }
  
  useEffect(() => {
    let ok = true;
    (async () => {
      setLoading(true);
      try {
        const [d, n, iq, ne, g, ep, sc] = await Promise.all([
          fetchTotal(API_DOCS).catch(() => 0),
          fetchTotal(API_PAPERS, { type: "important_note" }).catch(() => 0),
          fetchTotal(API_PAPERS, { type: "important_questions" }).catch(() => 0),
          fetchTotal(API_PAPERS, { type: "national_exam" }).catch(() => 0),
          fetchTotal(API_PAPERS, { type: "images_of_sessions" }).catch(() => 0),
          fetchTotal(API_PAPERS, { type: "episode" }).catch(() => 0),
          fetchTotal(API_PAPERS, { type: "scientist" }).catch(() => 0),
        ]);
        if (!ok) return;
        setCounts({ docs: d, notes: n, iq: iq, ne: ne, gallery: g, episode: ep, scientist: sc });
        
        if (subjectNameFromRoute) setSubjectDisplay(subjectNameFromRoute);
        else if (subjectId) setSubjectDisplay(`بابەت #${subjectId}`);
      } finally {
        if (ok) setLoading(false);
      }
    })();
    return () => { ok = false; };
  }, [subjectId, subjectNameFromRoute, grade, stream]);
  
  const addCommon = (sp = new URLSearchParams()) => {
    if (subjectId) sp.set("subject_id", String(subjectId));
    else if (subjectNameFromRoute) sp.set("subject", subjectNameFromRoute);
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
  const goepisode = () => {
    const sp = addCommon(new URLSearchParams());
    sp.set("type", "episode");
    window.location.assign(`/resources/texts?${sp.toString()}`);
  };
  const goScientist = () => {
    const sp = addCommon(new URLSearchParams());
    window.location.assign(`/resources/scientist?${sp.toString()}`);
  };
  
  const showAnything = Object.values(counts).some(count => count > 0);
  
  return (
    <div dir="rtl" className="p-3 sm:p-5">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/20 to-zinc-900/50 p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-white">
            <Link to="/subjects" className="text-zinc-300 hover:text-white text-sm">بابەتەکان</Link>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
            <span className="font-extrabold text-lg sm:text-xl">{subjectDisplay}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {typeof grade === "number" && (
              <Badge>
                <GraduationCap className="w-3 h-3 text-sky-400" />
                پۆل {grade}
              </Badge>
            )}
            {stream && <Badge>جۆر: {streamKurdish(stream)}</Badge>}
          </div>
        </div>

        {/* Content */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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
                desc="وێنەکان به‌ باسكردنه‌وه‌ "
                onClick={goGallery}
                count={counts.gallery}
              />
            )}
            {counts.episode > 0 && (
              <CardButton
                icon={<Sparkles className="text-sky-300" />}
                title="ئیپسۆد"
                desc="سه‌رجه‌م ئیپسۆد"
                onClick={goepisode}
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
            {!showAnything && (
              <div className="text-zinc-400 text-sm py-4">
                هیچ سەرچاوەیەک بۆ ئەم بابەتە نەدۆزرایەوە.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}