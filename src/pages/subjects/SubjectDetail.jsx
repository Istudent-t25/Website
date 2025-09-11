import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BookOpenCheck, FileText, ListChecks, ChevronRight, Image as ImageIcon } from "lucide-react";

const API_DOCS = "https://api.studentkrd.com/api/v1/documents";
const API_PAPERS = "https://api.studentkrd.com/api/v1/papers";

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
  if (s === "scientific") return "زانستی";
  if (s === "literary") return "ئەدەبی";
  if (s === "both") return "هاوبەش";
  return null;
}

const Badge = ({ children }) => (
  <span className="px-2 py-1 rounded-lg text-[10px] bg-white/5 border border-white/10 text-zinc-100">
    {children}
  </span>
);

const Count = ({ n }) =>
  n > 0 ? (
    <span className="ml-2 inline-flex items-center justify-center min-w-[1.5rem] h-[1.2rem] text-[10px] px-1.5 rounded-full bg-white/10 ring-1 ring-white/15 text-zinc-100">
      {n}
    </span>
  ) : null;

const CardButton = ({ icon, title, desc, onClick, count }) => (
  <button
    onClick={onClick}
    className="text-right rounded-2xl px-4 py-3 bg-zinc-900/60 border border-white/10 hover:bg-zinc-900/80 min-w-[220px] transition"
  >
    <div className="text-sm font-bold text-white flex items-center gap-2">
      {icon}
      <span className="flex items-center">{title}<Count n={count || 0} /></span>
    </div>
    {desc && <div className="text-[12px] text-zinc-400 mt-1">{desc}</div>}
  </button>
);

export default function SubjectDetail() {
  const params = useParams();
  const rawParam = params?.id ? decodeURIComponent(params.id) : "";
  const subjectId = /^\d+$/.test(rawParam) ? Number(rawParam) : null;
  const subjectNameFromRoute = subjectId ? null : rawParam || null;

  const [grade, setGrade] = useState(null);
  const [stream, setStream] = useState(null);
  const [subjectDisplay, setSubjectDisplay] = useState(subjectNameFromRoute || "بابەت");

  const [docsCount, setDocsCount] = useState(0);
  const [notesCount, setNotesCount] = useState(0);
  const [iqCount, setIqCount] = useState(0);
  const [neCount, setNeCount] = useState(0);
  const [galleryCount, setGalleryCount] = useState(0);

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
    if (hasStreams && stream) sp.set("stream", stream);
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
      try {
        const [d, n, iq, ne, g] = await Promise.all([
          fetchTotal(API_DOCS).catch(() => 0),
          fetchTotal(API_PAPERS, { type: "important_note" }).catch(() => 0),
          fetchTotal(API_PAPERS, { type: "important_questions" }).catch(() => 0),
          fetchTotal(API_PAPERS, { type: "national_exam" }).catch(() => 0),
          fetchTotal(API_PAPERS, { type: "images_of_sessions" }).catch(() => 0),
        ]);
        if (!ok) return;
        setDocsCount(d);
        setNotesCount(n);
        setIqCount(iq);
        setNeCount(ne);
        setGalleryCount(g);

        if (subjectNameFromRoute) setSubjectDisplay(subjectNameFromRoute);
        else if (subjectId) setSubjectDisplay(`بابەت #${subjectId}`);
      } catch {
        if (!ok) return;
        setDocsCount(0); setNotesCount(0); setIqCount(0); setNeCount(0); setGalleryCount(0);
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
    // Gallery page reads subject/grade/stream and always uses type=images_of_sessions
    window.location.assign(`/resources/gallery?${sp.toString()}`);
  };

  const showBooks = docsCount > 0;
  const showNotes = notesCount > 0;
  const showIQ = iqCount > 0;
  const showNE = neCount > 0;
  const showGallery = galleryCount > 0;

  return (
    <div dir="rtl" className="p-3 sm:p-5 space-y-4">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-sky-500/5 p-3 sm:p-4 sticky top-2 z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-white">
            <Link to="/subjects" className="text-zinc-300 hover:text-white">بابەتەکان</Link>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
            <span className="font-extrabold text-lg sm:text-xl">{subjectDisplay}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-zinc-300">
            {typeof grade === "number" && <Badge>پۆل: <b className="text-white">{grade}</b></Badge>}
            {stream && <Badge>تڕاک: <b className="text-white">{streamKurdish(stream)}</b></Badge>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {showBooks && (
          <CardButton
            icon={<BookOpenCheck className="w-4 h-4 text-emerald-300" />}
            title="کتێب و مه‌لزه‌مه‌"
            desc="کتێب / مەلزمە"
            onClick={goBooks}
            count={docsCount}
          />
        )}
        {showNotes && (
          <CardButton
            icon={<FileText className="w-4 h-4 text-purple-300" />}
            title="تێبینی گرنگ"
            desc="PDF ـە گرنگەکان"
            onClick={goNotes}
            count={notesCount}
          />
        )}
        {showIQ && (
          <CardButton
            icon={<ListChecks className="w-4 h-4 text-amber-300" />}
            title="ئەسیلەی گرنگ"
            desc="پرسیارە گرنگەکان"
            onClick={goIQ}
            count={iqCount}
          />
        )}
        {showNE && (
          <CardButton
            icon={<ListChecks className="w-4 h-4 text-cyan-300" />}
            title="ئازمونی نیشتمانی"
            desc="ساڵانە • کۆتایی ساڵ"
            onClick={goNE}
            count={neCount}
          />
        )}
        {showGallery && (
          <CardButton
            icon={<ImageIcon className="w-4 h-4 text-sky-300" />}
            title="گەلەری وانەکان"
            desc="وێنەکانی وانە (PDF-style viewer)"
            onClick={goGallery}
            count={galleryCount}
          />
        )}

        {!showBooks && !showNotes && !showIQ && !showNE && !showGallery && (
          <div className="text-zinc-400 text-sm">هیچ سەرچاوەیەک بۆ ئەم بابەتە نەدۆزرایەوە.</div>
        )}
      </div>
    </div>
  );
}
