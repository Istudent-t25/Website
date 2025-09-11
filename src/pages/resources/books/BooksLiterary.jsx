import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { NotepadText, BookOpen, ArrowRight } from "lucide-react";
import { fetchJSON } from "@/utils/fetchJSON";
import ResourceCard from "@/components/ResourceCard";
import Toolbar from "@/components/Toolbar";
import useLocalGrade from "@/hooks/useLocalGrade";

const API = {
  any: (grade, subject, q, type) => {
    const sp = new URLSearchParams();
    if (grade) sp.set("grade", String(grade));
    if (subject) sp.set("subject", subject);
    if (q) sp.set("q", q);
    sp.set("type", type);
    sp.set("stream", "literary"); // ✅ only literary here
    return `https://api.studentkrd.com/api/v1/documents?${sp.toString()}`;
  },
};

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

export default function BooksLiterary() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [grade, setGrade] = useLocalGrade(12);

  const [q, setQ] = useState(params.get("q") || "");
  const [activeSubject, setActiveSubject] = useState(params.get("subject") || "");
  const [tab, setTab] = useState(params.get("t") || "book");

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const buildUrl = useCallback(() => {
    return API.any(grade, activeSubject, q, tab);
  }, [grade, activeSubject, q, tab]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchJSON(buildUrl())
      .then((json) => {
        if (!alive) return;
        const list = (Array.isArray(json?.data) ? json.data : json) || [];
        const mapped = list.map(mapApiToResource);
        setRows(mapped);
        const subs = Array.from(new Set(mapped.map((i) => i.subject).filter(Boolean)));
        setSubjects(subs);
      })
      .catch(() => setRows([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [buildUrl]);

  const onOpen = (item) => {
    const u = encodeURIComponent(item?.pdf_url || "");
    const t = encodeURIComponent(item?.title || "");
    nav(`/viewer?u=${u}&t=${t}&type=pdf`);
  };

  return (
    <div className="p-3 sm:p-5 space-y-3" dir="rtl">
      <div className="flex items-center justify-between">
        <button
          onClick={() => nav(-1)}
          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10 text-zinc-200 hover:bg-white/10"
        >
          <ArrowRight className="w-4 h-4" />
          گەڕانەوە
        </button>
        <Tabs tab={tab} setTab={setTab} />
      </div>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-rose-500/10 to-amber-500/5 p-3">
        <div className="flex items-center justify-between">
          <div className="text-white font-extrabold text-lg">کتێب & مەڵزەمە (ئەدەبی)</div>
          <div className="text-[11px] text-zinc-300">تەماشیی تەنیا ئەدەبی</div>
        </div>
      </div>

      <Toolbar
        q={q}
        setQ={setQ}
        grade={grade}
        setGrade={setGrade}
        subjects={subjects}
        activeSubject={activeSubject}
        setActiveSubject={setActiveSubject}
      />

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

  const stream = raw.stream || (raw.subject && raw.subject.stream) || "literary";

  const tags = [];
  if (subjectName) tags.push(subjectName);
  if (raw.grade) tags.push(`پۆل ${raw.grade}`);
  tags.push("ئەدەبی");

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
