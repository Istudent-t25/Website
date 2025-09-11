import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, FileText, NotebookPen, HelpCircle } from "lucide-react";
import Toolbar from "@/components/Toolbar";
import ResourceCard from "@/components/ResourceCard";
import ExamYearGroup from "@/components/ExamYearGroup";
import useLocalGrade from "@/hooks/useLocalGrade";
import { fetchJSON } from "@/utils/fetchJSON";

const API = {
  list: (params) => `https://api.studentkrd.com/api/v1/papers?${params.toString()}`, // via Vite proxy
};

// Normalize for comparison
const normalize = (s = "") =>
  s
    .normalize("NFKC")
    .replace(/\u200c/g, "")
    .replace(/[ىي]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\s+/g, " ")
    .trim();

function mapPaperItem(paper, item) {
  const subjectName = paper?.subject?.name || paper?.subject_name || paper?.subject || "";
  const teacherName = paper?.teacher?.full_name || paper?.teacher?.name || paper?.teacher_name || "";

  const yearStart = item?.year_start ?? null;
  const yearEnd = item?.year_end ?? null;
  const term = item?.term ?? null;

  const yearStr = yearStart ? `${yearStart}${yearEnd ? `–${yearEnd}` : ""}` : "";
  const displayTitle =
    paper?.type === "national_exam"
      ? `${[subjectName, yearStr].filter(Boolean).join(" ")}${term ? ` xul ${term}` : ""}`.trim()
      : item?.label || paper?.title || "بی‌ناو";

  const tags = [];
  if (subjectName) tags.push(subjectName);
  if (paper?.grade) tags.push(`پۆل ${paper.grade}`);
  if (paper?.stream)
    tags.push(paper.stream === "scientific" ? "زانستی" : paper.stream === "literary" ? "ئەدەبی" : "هاوبەش");
  if (term) tags.push(`خباط ${term}`);
  if (yearStart) tags.push(yearStr);

  const badges = [];
  switch (paper?.type) {
    case "national_exam":
      badges.push("تاقیكردنه‌وه‌ی نیشتیمانی");
      break;
    case "important_questions":
      badges.push("ئەسیلە گرنگ");
      break;
    case "important_note":
      badges.push("تێبینی گرنگ");
      break;
    default:
      badges.push("پەڕەکان");
  }

  return {
    id: `${paper.id}:${item.id}`,
    title: displayTitle,
    subject: subjectName,
    teacher: teacherName,
    type: paper?.type || "paper",
    pdf_url: item?.url || paper?.pdf_url || null,
    thumb_url: item?.thumb_url || paper?.thumb_url || null,
    tags,
    badges,
    stream: paper?.stream || null,
    yearStart,
    yearEnd,
    term,
  };
}

function TypeTabs({ value, onChange }) {
  const types = [
    { key: "national_exam", label: "تاقیكردنه‌وه‌ی نیشتیمانی", icon: FileText },
    { key: "important_questions", label: "ئەسیلە گرنگ", icon: HelpCircle },
    { key: "important_note", label: "تێبینی گرنگ", icon: NotebookPen },
  ];
  return (
    <div className="flex items-center flex-wrap gap-1.5" dir="rtl">
      {types.map((t) => {
        const Icon = t.icon;
        const active = value === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`px-3 py-1.5 rounded-2xl text-[12px] ring-1 inline-flex items-center gap-1.5 transition
              ${active ? "bg-white/15 text-white ring-white/25" : "bg-white/5 text-zinc-300 ring-white/10 hover:bg-white/10"}`}
          >
            <Icon size={14} />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function StreamTabs({ stream, setStream, show }) {
  if (!show) return null;
  const opts = [
    { key: "scientific", label: "زانستی" },
    { key: "both", label: "هاوبەش" },
    { key: "literary", label: "ئەدەبی" },
  ];
  const showAll = true;
  return (
    <div className="flex items-center flex-wrap gap-1.5" dir="rtl">
      {showAll && (
        <button
          onClick={() => setStream("all")}
          className={`px-2.5 py-1.5 rounded-2xl text-[11px] ring-1 transition
            ${stream === "all" ? "bg-white/15 text-white ring-white/25" : "bg-white/5 text-zinc-300 ring-white/10 hover:bg-white/10"}`}
        >
          هەموان
        </button>
      )}
      {opts.map((o) => (
        <button
          key={o.key}
          onClick={() => setStream(o.key)}
          className={`px-2.5 py-1.5 rounded-2xl text-[11px] ring-1 transition
            ${stream === o.key ? "bg-white/15 text-white ring-white/25" : "bg-white/5 text-zinc-300 ring-white/10 hover:bg-white/10"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function Papers() {
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();

  // use localStorage grade silently (no UI)
  const [grade] = useLocalGrade(12);

  const [q, setQ] = useState(params.get("q") || "");
  const [subject, setSubject] = useState(params.get("subject") || "");
  const [stream, setStream] = useState(params.get("stream") || "all");
  const [type, setType] = useState(params.get("type") || "national_exam");

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // sync URL
  useEffect(() => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (subject) sp.set("subject", subject);
    if (type) sp.set("type", type);
    if (stream && stream !== "all") sp.set("stream", stream);
    setParams(sp, { replace: true });
  }, [q, subject, type, stream, setParams]);

  // build URL for API
  const buildParams = useCallback(() => {
    const sp = new URLSearchParams();
    if (grade) sp.set("grade", String(grade)); // still filter by grade from localStorage
    if (subject) sp.set("subject", subject);
    if (type) sp.set("type", type);
    if (q) sp.set("q", q);
    if (stream && stream !== "all") sp.set("stream", stream);
    return sp;
  }, [grade, subject, type, q, stream]);

  const url = useMemo(() => API.list(buildParams()), [buildParams]);

  // fetch & map (only subject filtered client-side to avoid cross-subject bleed)
  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchJSON(url)
      .then((json) => {
        if (!alive) return;
        const papers = (Array.isArray(json?.data) ? json.data : json) || [];

        // subjects list (from all returned)
        const subs = Array.from(new Set(papers.map((p) => p?.subject?.name).filter(Boolean)));
        setSubjects(subs);

        const subjNorm = normalize(subject);
        const filtered = subject
          ? papers.filter((p) => normalize(p?.subject?.name || "") === subjNorm)
          : papers;

        const flattened = [];
        filtered.forEach((p) => {
          if (Array.isArray(p.items) && p.items.length > 0) {
            p.items.forEach((it) => flattened.push(mapPaperItem(p, it)));
          } else if (p.pdf_url) {
            flattened.push(
              mapPaperItem(p, {
                id: `p${p.id}`,
                label: p.title,
                url: p.pdf_url,
                thumb_url: p.thumb_url,
                year_start: null,
                year_end: null,
                term: null,
              })
            );
          }
        });

        setRows(flattened);

        // snap subject text to canonical to light up chips
        if (subject) {
          const hit = subs.find((s) => normalize(s) === subjNorm);
          if (hit && hit !== subject) setSubject(hit);
        }
      })
      .catch(() => setRows([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [url]); // eslint-disable-line react-hooks/exhaustive-deps

  // open viewer
  const onOpen = (item) => {
    const u = encodeURIComponent(item?.pdf_url || "");
    const t = encodeURIComponent(item?.title || "");
    if (!u) return;
    nav(`/viewer?u=${u}&t=${t}&type=pdf`);
  };

  // labels
  const typeLabel =
    type === "national_exam"
      ? "تاقیكردنه‌وه‌ی نیشتیمانی"
      : type === "important_questions"
      ? "ئەسیلە گرنگ"
      : type === "important_note"
      ? "تێبینی گرنگ"
      : "پەڕەکان";

  // group by (subject + year range + stream) for national_exam
  const examGroups = useMemo(() => {
    if (type !== "national_exam") return [];
    const byKey = new Map();
    rows.forEach((r) => {
      const ys = r.yearStart ?? "";
      const ye = r.yearEnd ?? "";
      const subj = r.subject ?? "";
      const str = r.stream ?? "";
      const key = `${subj}||${ys}||${ye}||${str}`;
      if (!byKey.has(key))
        byKey.set(key, { key, subject: subj, yearStart: r.yearStart, yearEnd: r.yearEnd, stream: r.stream, items: [] });
      byKey.get(key).items.push(r);
    });
    for (const g of byKey.values()) {
      g.items.sort((a, b) => {
        const ta = parseInt(a.term || 0, 10);
        const tb = parseInt(b.term || 0, 10);
        if (!Number.isNaN(ta) && !Number.isNaN(tb) && ta !== tb) return ta - tb;
        return String(a.title).localeCompare(String(b.title));
      });
    }
    const arr = Array.from(byKey.values());
    arr.sort((a, b) => {
      const ya = parseInt(a.yearStart || 0, 10);
      const yb = parseInt(b.yearStart || 0, 10);
      if (ya !== yb) return yb - ya;
      return String(a.subject).localeCompare(String(b.subject));
    });
    return arr;
  }, [rows, type]);

  return (
    <div className="p-3 sm:p-5 space-y-3" dir="rtl">
      {/* Back */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => nav(-1)}
          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/5 ring-1 ring-white/10 text-zinc-200 hover:bg-white/10"
        >
          <ArrowRight className="w-4 h-4" />
          گەڕانەوە
        </button>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/10 bg-gradient-to-br from-fuchsia-500/10 to-sky-500/5 p-3"
      >
        <div className="flex items-center justify-between">
          <div className="text-white font-extrabold text-lg">{typeLabel}</div>
          <div className="text-[11px] text-zinc-300">{subject || "بەبێ بابەت"} </div>
        </div>
      </motion.div>

      {/* Menus under header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/5 p-2.5 flex items-center justify-between flex-wrap gap-2"
      >
        <TypeTabs value={type} onChange={setType} />
        <StreamTabs stream={stream} setStream={setStream} show={true} />
      </motion.div>

      {/* Search / Subjects (no grade picker) */}
      <Toolbar
        q={q}
        setQ={setQ}
        subjects={subjects}
        activeSubject={subject}
        setActiveSubject={setSubject}
      />

      {/* Content */}
      {loading ? (
        <div className="text-center text-zinc-400 py-10">بارکردن…</div>
      ) : rows.length === 0 ? (
        <div className="text-center text-zinc-400 py-10">هیچ داتایەک نەدۆزرایەوە</div>
      ) : type === "national_exam" ? (
        <div className="space-y-2.5 sm:space-y-3">
          {examGroups.map((g) => {
            const headTitle = [
              g.subject || "بی‌بابەت",
              g.yearStart ? `${g.yearStart}${g.yearEnd ? `–${g.yearEnd}` : ""}` : "",
            ]
              .filter(Boolean)
              .join(" • ");
            return (
              <ExamYearGroup
                key={g.key}
                title={headTitle}
                subject={g.subject}
                yearStart={g.yearStart}
                yearEnd={g.yearEnd}
                stream={g.stream}
                items={g.items}
                onOpenItem={onOpen}
              />
            );
          })}
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-2.5 sm:gap-3"
        >
          {rows.map((it) => (
            <motion.div key={it.id} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
              <ResourceCard item={it} onOpen={onOpen} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
