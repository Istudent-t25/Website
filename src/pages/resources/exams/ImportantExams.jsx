import React, { useEffect, useMemo, useState } from "react";
import useLocalGrade from "@/hooks/useLocalGrade";
import { fetchJSON } from "@/utils/fetchJSON";
import Toolbar from "@/components/Toolbar";
import CardGrid from "@/components/CardGrid";
import ResourceCard from "@/components/ResourceCard";

// ---------- API CONFIG (edit to your backend) ----------
const API = {
  importantExams: (grade, subject, q) => {
    const sp = new URLSearchParams();
    if (grade) sp.set("grade", String(grade));
    if (subject) sp.set("subject", subject);
    if (q) sp.set("q", q);
    sp.set("important", "1");
    return `https://api.studentkrd.com/api/v1/papers?${sp.toString()}`; // your known papers endpoint
  },
};

export default function ImportantExams() {
  const [grade, setGrade] = useLocalGrade(12);
  const [q, setQ] = useState("");
  const [activeSubject, setActiveSubject] = useState("");

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    let live = true;
    setLoading(true);
    fetchJSON(API.importantExams(grade, activeSubject, q))
      .then((json) => {
        if (!live) return;
        const list = (Array.isArray(json?.data) ? json.data : json) || [];
        const mapped = list.map(mapApiToPaper);
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
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-rose-500/10 to-pink-500/5 p-3 sm:p-4">
        <div className="text-white font-extrabold text-lg sm:text-xl">ئەسیلە گرنگەکان</div>
        <div className="text-[12px] text-zinc-300 mt-1">پرسیار و تاقیکردنەوەی گرنگ</div>
      </div>

      {/* Toolbar */}
      <Toolbar
        q={q}
        setQ={setQ}
        grade={grade}
        setGrade={setGrade}
        subjects={subjects}
        activeSubject={activeSubject}
        setActiveSubject={setActiveSubject}
      />

      {/* Grid */}
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

function mapApiToPaper(raw) {
  return {
    id: raw.id || raw._id || raw.uuid,
    title: raw.title || raw.name || raw.paper_title || "ئەسیلە",
    subject: raw.subject || raw.subject_name,
    teacher: raw.teacher || raw.teacher_name,
    type: "paper",
    pdf_url: raw.pdf_url || raw.url || raw.file_url,
    size_mb: raw.size_mb || null,
    tags: raw.tags || ["exam", "important"],
  };
}
