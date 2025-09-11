// src/pages/subjects/SubjectDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronRight,
  BookOpenCheck,
  FileText,
  ListChecks,
} from "lucide-react";
import SubjectIcon from "@/components/SubjectIcon";
import useLocalGrade from "@/hooks/useLocalGrade";
import { fetchJSON } from "@/utils/fetchJSON";
import { apiUrl } from "@/utils/api";

const EASE = [0.22, 1, 0.36, 1];

// --- Text normalization to avoid ZWNJ / Kaf / Ye mismatches ---
const normalize = (s = "") =>
  s
    .normalize("NFKC")
    .replace(/\u200c/g, "") // remove ZWNJ
    .replace(/[ىي]/g, "ی")  // unify Ye
    .replace(/ك/g, "ک")     // unify Kaf
    .replace(/\s+/g, " ")
    .trim();

const QuickAction = ({ icon, title, desc, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.18, ease: EASE }}
    className="text-right rounded-2xl px-4 py-3 bg-zinc-900/60 border border-white/10 hover:bg-zinc-900/80 min-w-[220px]"
  >
    <div className="text-sm font-bold text-white flex items-center gap-2">
      {icon}
      <span>{title}</span>
    </div>
    {desc && <div className="text-[12px] text-zinc-400 mt-1">{desc}</div>}
  </motion.button>
);

// Ask backend: how many docs exist for a subject/grade/stream?
// Tries subject= first; if empty, retries with q=subject (handles ZWNJ/name variants)
async function fetchCount({ subject, grade, stream }) {
  const sp1 = new URLSearchParams();
  if (grade) sp1.set("grade", String(grade));
  if (subject) sp1.set("subject", subject);
  if (stream) sp1.set("stream", stream);
  sp1.set("per_page", "1");

  try {
    const url1 = apiUrl("/api/v1/documents", sp1);
    const json1 = await fetchJSON(url1);
    const total1 =
      typeof json1?.total === "number"
        ? json1.total
        : Array.isArray(json1)
        ? json1.length
        : 0;
    if (total1 > 0) return total1;
  } catch {
    /* ignore and try fallback */
  }

  // Fallback: q=subject
  if (subject) {
    const sp2 = new URLSearchParams();
    if (grade) sp2.set("grade", String(grade));
    if (stream) sp2.set("stream", stream);
    sp2.set("q", subject);
    sp2.set("per_page", "1");
    try {
      const url2 = apiUrl("/api/v1/documents", sp2);
      const json2 = await fetchJSON(url2);
      const total2 =
        typeof json2?.total === "number"
          ? json2.total
          : Array.isArray(json2)
          ? json2.length
          : 0;
      return total2 || 0;
    } catch {
      return 0;
    }
  }

  return 0;
}

function StreamFilter({ grade, available, value, onChange }) {
  // Hide streams completely for grades < 10
  if (!grade || Number(grade) < 10) return null;

  const opts = [
    { key: "scientific", label: "زانستی" },
    { key: "both", label: "هاوبەش" },
    { key: "literary", label: "ئەدەبی" },
  ].filter((o) => available[o.key]); // only show streams that have docs

  if (opts.length === 0) return null;

  return (
    <div className="flex items-center flex-wrap gap-1.5" dir="rtl">
      {opts.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`px-2 py-1.5 rounded-lg text-[11px] ring-1 ${
            value === o.key
              ? "bg-white/10 text-white ring-white/20"
              : "bg-white/5 text-zinc-300 ring-white/10 hover:bg-white/10"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function SubjectDetail() {
  const nav = useNavigate();
  const params = useParams();
  const loc = useLocation();
  const [grade] = useLocalGrade(12);

  // Subject name (from navigation state or slug)
  // decodeURIComponent in case router slug includes encoded chars
  const slugName = params?.id ? decodeURIComponent(params.id).replace(/-/g, " ") : "";
  const stateName = loc.state?.name;
  // Keep a display name (original if provided), but build a canonical subject for API/URLs
  const displayName = stateName || slugName || "بابەت";
  const subjectCanonical = useMemo(() => normalize(displayName), [displayName]);

  // Stream passed from SubjectsHub (optional)
  const incomingStream = loc.state?.stream || null;

  // Availability (based on real documents)
  const [avail, setAvail] = useState({
    scientific: false,
    both: false,
    literary: false,
  });
  const streamsHaveAny = avail.scientific || avail.both || avail.literary;

  // Selected stream (if any). For <10, we'll ignore it and hide the UI.
  const [selectedStream, setSelectedStream] = useState(null);

  // Load stream availability when subject or grade changes
  useEffect(() => {
    let alive = true;

    async function load() {
      // Grades <10 → streams don’t apply; bail early
      if (!grade || Number(grade) < 10) {
        if (alive) {
          setAvail({ scientific: false, both: false, literary: false });
          setSelectedStream(null);
        }
        return;
      }

      const [sc, bo, li] = await Promise.all([
        fetchCount({ subject: subjectCanonical, grade, stream: "scientific" }),
        fetchCount({ subject: subjectCanonical, grade, stream: "both" }),
        fetchCount({ subject: subjectCanonical, grade, stream: "literary" }),
      ]);

      if (!alive) return;
      const a = {
        scientific: sc > 0,
        both: bo > 0,
        literary: li > 0,
      };
      setAvail(a);

      // Pick initial stream:
      // 1) use incoming stream if it's available
      // 2) else pick the first available by priority sc → both → literary
      const initial =
        (incomingStream && a[incomingStream] && incomingStream) ||
        (a.scientific && "scientific") ||
        (a.both && "both") ||
        (a.literary && "literary") ||
        null;
      setSelectedStream(initial);
    }

    load();
    return () => {
      alive = false;
    };
  }, [subjectCanonical, grade, incomingStream]);

  // Helper to add subject/stream to URLs
  const addCommonParams = (sp) => {
    if (subjectCanonical) sp.set("subject", subjectCanonical);
    // Only include stream if we’re showing streams (grade >= 10) and one is selected
    if (Number(grade) >= 10 && selectedStream) sp.set("stream", selectedStream);
    return sp;
  };

  // Quick actions (navigate with canonical, normalized subject)
  const goBooks = () => {
    const sp = addCommonParams(new URLSearchParams());
    sp.set("t", "book"); // default tab
    nav(`/resources/books?${sp.toString()}`);
  };
  const goNotes = () => {
    const sp = addCommonParams(new URLSearchParams());
    sp.set("type", "important_note");
    nav(`/resources/papers?${sp.toString()}`);
  };
  const goImportantExams = () => {
    const sp = addCommonParams(new URLSearchParams());
    sp.set("type", "important_questions");
    nav(`/resources/papers?${sp.toString()}`);
  };
  const goPaperExams = () => {
    const sp = addCommonParams(new URLSearchParams());
    sp.set("type", "national_exam");
    nav(`/resources/papers?${sp.toString()}`);
  };

  return (
    <div dir="rtl" className="p-3 sm:p-5 space-y-4">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-sky-500/5 p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-white">
              <Link to="/subjects" className="text-zinc-300 hover:text-white">
                بابەتەکان
              </Link>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
              <span className="font-extrabold text-lg sm:text-xl flex items-center gap-2">
                <SubjectIcon name={displayName} className="w-5 h-5" />
                {displayName}
              </span>
            </div>
            <div className="hidden sm:block text-[12px] text-zinc-300">
              هەموو سەرچاوەکان بۆ {displayName}
            </div>
          </div>

          {/* Stream filter only if grade >= 10 and there’s availability */}
          {Number(grade) >= 10 && streamsHaveAny && (
            <div className="flex items-center justify-between">
              <div className="text-[12px] text-zinc-400">
                دەرچووی پۆلی:{" "}
                <span className="text-zinc-200 font-semibold">پۆل {grade}</span>
              </div>
              <StreamFilter
                grade={grade}
                available={avail}
                value={selectedStream}
                onChange={(v) => setSelectedStream(v)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <QuickAction
          icon={<BookOpenCheck className="w-4 h-4 text-emerald-300" />}
          title="کتێب و مه‌لزه‌مه‌"
          desc="هەموو کتێب و مه‌لزه‌مه‌كان"
          onClick={goBooks}
        />
        <QuickAction
          icon={<FileText className="w-4 h-4 text-purple-300" />}
          title="تێبینی گرنگ"
          desc="تێبینی و دیاریكردنی شته‌ گرنگه‌كان"
          onClick={goNotes}
        />
        <QuickAction
          icon={<ListChecks className="w-4 h-4 text-amber-300" />}
          title="ئەسیلەی گرنگ"
          desc="پرسیار و تاقیکردنەوە"
          onClick={goImportantExams}
        />
        <QuickAction
          icon={<ListChecks className="w-4 h-4 text-amber-300" />}
          title="ئازمونی نیشتمانی"
          desc="پرسیار و تاقیکردنەوە"
          onClick={goPaperExams}
        />
      </div>
    </div>
  );
}
