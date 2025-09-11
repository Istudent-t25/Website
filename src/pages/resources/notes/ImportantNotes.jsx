import React, { useEffect, useMemo, useState } from "react";
import useLocalGrade from "@/hooks/useLocalGrade";
import { fetchJSON } from "@/utils/fetchJSON";
import Toolbar from "@/components/Toolbar";
import CardGrid from "@/components/CardGrid";
import ResourceCard from "@/components/ResourceCard";

const API = {
  importantNotes: (grade, subject, q) => {
    const sp = new URLSearchParams();
    if (grade) sp.set("grade", String(grade));
    if (subject) sp.set("subject", subject);
    if (q) sp.set("q", q);
    sp.set("important", "1");
    sp.set("type", "note");
    return `https://api.studentkrd.com/api/v1/notes?${sp.toString()}`;
  },
};

export default function ImportantNotes() {
  const [grade, setGrade] = useLocalGrade(12);
  const [q, setQ] = useState("");
  const [activeSubject, setActiveSubject] = useState("");

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    let live = true;
    setLoading(true);
    fetchJSON(API.importantNotes(grade, activeSubject, q))
      .then((json) => {
        if (!live) return;
        const list = (Array.isArray(json?.data) ? json.data : json) || [];
        const mapped = list.map(mapApiToNote);
        setRows(mapped);
        setSubjects(Array.from(new Set(mapped.map((i) => i.subject).filter(Boolean))));
      })
      .catch(() => setRows([]))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [grade, activeSubject, q]);

  const filtered = useMemo(() => rows, [rows]);

  return (
    <div className="p-3 sm:p-5 space-y-4" dir="rtl">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 p-3 sm:p-4">
        <div className="text-white font-extrabold text-lg sm:text-xl">تێبینییە گرنگەکان</div>
        <div className="text-[12px] text-zinc-300 mt-1">کورتەکان و نوتە گرنگەکان بۆ خوێندن</div>
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
      ) : filtered.length === 0 ? (
        <div className="text-center text-zinc-400 py-10">هیچ داتایەک نەدۆزرایەوە</div>
      ) : (
        <CardGrid>
          {filtered.map((it) => (
            <ResourceCard key={it.id} item={it} onOpen={(i) => i?.pdf_url && window.open(i.pdf_url, "_blank")} />
          ))}
        </CardGrid>
      )}
    </div>
  );
}

function mapApiToNote(raw) {
  return {
    id: raw.id || raw._id || raw.uuid,
    title: raw.title || raw.name || "نوتی گرنگ",
    subject: raw.subject || raw.subject_name,
    teacher: raw.teacher || raw.teacher_name,
    type: "note",
    pdf_url: raw.pdf_url || raw.url || raw.file_url,
    size_mb: raw.size_mb || null,
    tags: raw.tags || ["note", "important"],
  };
}
