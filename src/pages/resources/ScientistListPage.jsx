// src/pages/ScientistListPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Loader2,
  ChevronRight,
  BookOpenCheck,
  GraduationCap,
  Sparkles,
  Home,
  Star,
} from "lucide-react";

/* =========================
   CONFIG / API
   ========================= */
const API_PAPERS = "https://api.studentkrd.com/api/v1/papers";

/* =========================
   HELPERS / UTILS
   ========================= */
const useQuery = () => new URLSearchParams(useLocation().search);

const fetchPapers = async (params) => {
  const url = `${API_PAPERS}?${params.toString()}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("Network error");
  const j = await r.json();
  return Array.isArray(j?.data) ? j.data : [];
};

/* =========================
   UI HELPERS
   ========================= */
const Badge = ({ children, className = "" }) => (
  <span
    className={`px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-white/10 text-zinc-200 bg-white/5 ${className}`}
  >
    {children}
  </span>
);

/* =========================
   MAIN COMPONENT
   ========================= */
export default function ScientistListPage() {
  const navigate = useNavigate();
  const query = useQuery();
  const subjectId = query.get("subject_id");
  const grade = query.get("grade");
  const stream = query.get("stream");

  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (subjectId) params.set("subject_id", subjectId);
    if (grade) params.set("grade", grade);
    if (stream) params.set("stream", stream);
    params.set("type", "scientist");

    const loadPapers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPapers(params);
        setPapers(data);
      } catch (err) {
        setError("Failed to load scientist articles.");
      } finally {
        setLoading(false);
      }
    };
    loadPapers();
  }, [subjectId, grade, stream]);

  const goToDetails = (paper) => {
    const sp = new URLSearchParams();
    sp.set("id", paper.id);
    navigate(`/resources/scientist-page?${sp.toString()}`);
  };

  const getSubjectName = useMemo(() => {
    const subjectName = papers?.[0]?.subjects?.[0]?.name;
    return subjectName || "وتاری زانستی";
  }, [papers]);

  return (
    <div dir="rtl" className="p-3 sm:p-5 space-y-4">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-3 sm:p-4 sticky top-2 z-10 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/40">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-white min-w-0">
            <Star className="w-5 h-5 text-emerald-300 shrink-0" />
            <div className="font-extrabold text-lg sm:text-xl truncate">
              {getSubjectName}
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white"
          >
            <Home className="w-4 h-4" /> گەڕانەوە
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 flex flex-col items-center justify-center text-zinc-300">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <div className="text-sm">داتاکان بار دەبن…</div>
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-rose-300">
          {error}
        </div>
      )}

      {!loading && papers.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          هیچ وتارێکی زانستی نەدۆزرایەوە.
        </div>
      )}

      {!loading && papers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {papers.map((paper) => (
            <button
              key={paper.id}
              onClick={() => goToDetails(paper)}
              className="rounded-3xl border border-white/10 bg-zinc-900/60 p-4 space-y-3 hover:bg-zinc-900/80 transition-colors duration-200 text-right"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="text-white font-extrabold text-sm sm:text-lg mb-0.5 line-clamp-2">{paper.title}</div>
                  {paper.subjects?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {paper.subjects.map((s) => (
                        <Badge key={s.id}>{s.name}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {paper.description && (
                <p className="text-zinc-400 text-sm line-clamp-3">{paper.description}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}