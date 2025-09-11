// src/pages/resources/books/BooksAndBooklets.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, NotepadText, ArrowRight } from "lucide-react";
import ResourceCard from "@/components/ResourceCard";
import Toolbar from "@/components/Toolbar";
import useLocalGrade from "@/hooks/useLocalGrade";
import { fetchJSON } from "@/utils/fetchJSON";

/** Build API urls (use Vite proxy in dev). */
const API = {
  list: (params) => `/api/v1/documents?${params.toString()}`,
};

// Count docs for a combination (subject, grade, stream, type, q)
async function fetchCount({ subject, grade, stream, type, q }) {
  const sp = new URLSearchParams();
  if (type) sp.set("type", type); // "book" | "booklet"
  if (grade) sp.set("grade", String(grade));
  if (subject) sp.set("subject", subject);
  // Make text search inclusive of subject too (in case backend doesn't use subject=)
  const qEffective = [subject, q].filter(Boolean).join(" ").trim();
  if (qEffective) sp.set("q", qEffective);
  if (stream) sp.set("stream", stream);
  sp.set("per_page", "1"); // we only need the paginator total
  try {
    const json = await fetchJSON(API.list(sp));
    return typeof json?.total === "number" ? json.total : (Array.isArray(json) ? json.length : 0);
  } catch {
    return 0;
  }
}
const normalize = (s = "") =>
  s.normalize("NFKC")
    .replace(/\u200c/g, "")  // remove ZWNJ
    .replace(/[ىي]/g, "ی")   // unif. Ye
    .replace(/ك/g, "ک")      // unif. Kaf
    .replace(/\s+/g, " ")
    .trim();
function Tabs({ tab, setTab }) {
  const TABS = [
    { key: "book", label: "کتێب", icon: BookOpen },
    { key: "booklet", label: "مەڵزەمە", icon: NotepadText },
  ];
  return (
    <div className="flex items-center gap-1.5" dir="rtl">
      {TABS.map((t) => {
        const Icon = t.icon;
        const active = tab === t.key;
        return (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-2.5 py-1.5 rounded-lg text-[12px] ring-1 inline-flex items-center gap-1.5 ${
              active ? "bg-white/10 text-white ring-white/20" : "bg-white/5 text-zinc-300 ring-white/10 hover:bg-white/10"
            }`}
          >
            <Icon size={14} />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function StreamTabs({ grade, stream, setStream, available }) {
  // Hide entire control for grades < 10
  if (!grade || Number(grade) < 10) return null;

  const options = [
    { key: "scientific", label: "زانستی" },
    { key: "both", label: "هاوبەش" },
    { key: "literary", label: "ئەدەبی" },
  ].filter((o) => available[o.key]); // only streams that actually have data

  if (options.length === 0) return null;

  // Include "هەموان" only if at least 2 streams exist for this subject/grade
  const showAll = options.length >= 2;

  return (
    <div className="flex items-center gap-1.5" dir="rtl">
      {showAll && (
        <button
          onClick={() => setStream("all")}
          className={`px-2 py-1.5 rounded-lg text-[11px] ring-1 ${
            stream === "all" ? "bg-white/10 text-white ring-white/20" : "bg-white/5 text-zinc-300 ring-white/10 hover:bg-white/10"
          }`}
        >
          هەموان
        </button>
      )}
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => setStream(o.key)}
          className={`px-2 py-1.5 rounded-lg text-[11px] ring-1 ${
            stream === o.key ? "bg-white/10 text-white ring-white/20" : "bg-white/5 text-zinc-300 ring-white/10 hover:bg-white/10"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function BooksAndBooklets() {
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();

  // grade persisted in localStorage
  const [grade, setGrade] = useLocalGrade(12);

  // URL-driven state
  const [tab, setTab] = useState(params.get("t") || "book");       // "book" | "booklet"
  const [q, setQ] = useState(params.get("q") || "");
  const [subject, setSubject] = useState(params.get("subject") || "");
  const [stream, setStream] = useState(params.get("stream") || "all"); // "all" | scientific | both | literary

  // availability for streams for current combo (subject, grade, tab, q)
  const [available, setAvailable] = useState({ scientific: false, both: false, literary: false });

  // data
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // keep URL synced
  useEffect(() => {
    const sp = new URLSearchParams();
    sp.set("t", tab);
    if (q) sp.set("q", q);
    if (subject) sp.set("subject", subject);
    // only persist stream if grade >= 10 (otherwise concept hidden)
    if (Number(grade) >= 10 && stream && stream !== "all") sp.set("stream", stream);
    setParams(sp, { replace: true });
  }, [tab, q, subject, stream, grade, setParams]);

  // compute stream availability when subject/grade/tab/q changes
  useEffect(() => {
    let alive = true;
    async function load() {
      // Grades < 10 → streams are not shown/used
      if (!grade || Number(grade) < 10) {
        setAvailable({ scientific: false, both: false, literary: false });
        setStream("all");
        return;
      }
      const type = tab === "book" ? "book" : "booklet";
      const [sc, bo, li] = await Promise.all([
        fetchCount({ subject, grade, stream: "scientific", type, q }),
        fetchCount({ subject, grade, stream: "both", type, q }),
        fetchCount({ subject, grade, stream: "literary", type, q }),
      ]);
      if (!alive) return;
      const avail = {
        scientific: sc > 0,
        both: bo > 0,
        literary: li > 0,
      };
      setAvailable(avail);

      // If currently selected stream has no data, switch to a valid one
      if (Number(grade) >= 10) {
        if (stream !== "all" && !avail[stream]) {
          const next =
            (avail.scientific && "scientific") ||
            (avail.both && "both") ||
            (avail.literary && "literary") ||
            "all";
          setStream(next);
        }
        // If only one stream exists, force that stream (hide "all" anyway)
        const count = [avail.scientific, avail.both, avail.literary].filter(Boolean).length;
        if (count === 1) {
          const only = avail.scientific ? "scientific" : avail.both ? "both" : "literary";
          setStream(only);
        }
      }
    }
    load();
    return () => { alive = false; };
  }, [subject, grade, tab, q]); // intentionally not watching "stream" to avoid loops

  // build API params for the main list call
  const buildParams = useCallback(() => {
    const sp = new URLSearchParams();
    sp.set("type", tab === "book" ? "book" : "booklet");
    if (grade) sp.set("grade", String(grade));
    if (subject) sp.set("subject", subject);
    // text query should also include subject
    const qEffective = [subject, q].filter(Boolean).join(" ").trim();
    if (qEffective) sp.set("q", qEffective);
    if (Number(grade) >= 10 && stream && stream !== "all") sp.set("stream", stream);
    return sp;
  }, [tab, grade, subject, q, stream]);

  const url = useMemo(() => API.list(buildParams()), [buildParams]);

  // fetch list data
  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchJSON(url)
      .then((json) => {
        if (!alive) return;
        const list = (Array.isArray(json?.data) ? json.data : json) || [];
        const mapped = list.map(mapApiToResource);
        setRows(mapped);
        // subjects list derived from results (for subject chips)
        const subs = Array.from(new Set(mapped.map((i) => i.subject).filter(Boolean)));
        setSubjects(subs);
      })
      .catch(() => setRows([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [url]);

  const onOpen = (item) => {
    const u = encodeURIComponent(item?.pdf_url || "");
    const t = encodeURIComponent(item?.title || "");
    nav(`/viewer?u=${u}&t=${t}&type=pdf`);
  };

  const streamLabel =
    stream === "all" ? "هەموو" : stream === "scientific" ? "زانستی" : stream === "both" ? "هاوبەش" : "ئەدەبی";

  const anyStreamExists = available.scientific || available.both || available.literary;

  return (
    <div className="p-3 sm:p-5 space-y-3" dir="rtl">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => nav(-1)}
          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10 text-zinc-200 hover:bg-white/10"
        >
          <ArrowRight className="w-4 h-4" />
          گەڕانەوە
        </button>
        <div className="flex items-center gap-2">
          {/* Only show streams if grade >= 10 and some stream has data */}
          {Number(grade) >= 10 && anyStreamExists && (
            <StreamTabs grade={grade} stream={stream} setStream={setStream} available={available} />
          )}
          <Tabs tab={tab} setTab={setTab} />
        </div>
      </div>

      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-sky-500/5 p-3">
        <div className="flex items-center justify-between">
          <div className="text-white font-extrabold text-lg">کتێب & مەڵزەمە</div>
          <div className="text-[11px] text-zinc-300">
            {Number(grade) >= 10 && anyStreamExists ? streamLabel : "بەبێ هاوشێوە"}
            {subject && <span className="ml-2">• {subject}</span>}
          </div>
        </div>
      </div>

      {/* Search / Filters (subject chips always visible) */}
      <Toolbar
        q={q}
        setQ={setQ}
        grade={grade}
        setGrade={setGrade}
        subjects={subjects}
        activeSubject={subject}
        setActiveSubject={setSubject}
      />

      {/* Grid */}
      {loading ? (
        <div className="text-center text-zinc-400 py-10">بارکردن…</div>
      ) : rows.length === 0 ? (
        <div className="text-center text-zinc-400 py-10">هیچ داتایەک نەدۆزرایەوە</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-2.5 sm:gap-3">
          {rows.map((it) => (
            <ResourceCard key={it.id} item={it} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  );
}

function mapApiToResource(raw) {
  const subjectName =
    raw.subject_name ||
    (raw.subject && (raw.subject.name || raw.subject.title || raw.subject.label || raw.subject.code)) ||
    raw.subject ||
    raw.subj;

  const teacherName =
    raw.teacher_name ||
    (raw.teacher && (raw.teacher.name || raw.teacher.full_name || raw.teacher.title)) ||
    raw.teacher;

  const stream = raw.stream || (raw.subject && raw.subject.stream) || null;

  const tags = [];
  if (subjectName) tags.push(subjectName);
  if (raw.grade) tags.push(`پۆل ${raw.grade}`);
  if (stream) tags.push(stream === "scientific" ? "زانستی" : stream === "literary" ? "ئەدەبی" : "هاوبەش");

  const badges = [];
  if (raw.type === "book") badges.push("کتێب");
  else if (raw.type === "booklet") badges.push("مەڵزەمە");

  return {
    id: raw.id || raw._id || raw.uuid,
    title: raw.title || raw.name || "بی‌ناو",
    subject: subjectName || "",
    teacher: teacherName || "",
    type: raw.type || (raw.category === "booklet" ? "booklet" : "book"),
    pdf_url: raw.pdf_url || raw.url || raw.file_url,
    thumb_url: raw.thumb_url || raw.thumbnail || raw.cover_url || null,
    size_mb: raw.size_mb || (raw.size ? Math.round((raw.size / (1024 * 1024)) * 10) / 10 : null),
    tags,
    badges,
    stream,
  };
}
