// src/pages/ScientistPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Loader2,
  Home,
  Star,
} from "lucide-react";

/* =========================
   CONFIG / API
   ========================= */
const API_PAPERS = "https://api.studentkrd.com/api/v1/papers";

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
export default function ScientistPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
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

    const fetchPapers = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_PAPERS}?${params.toString()}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network error");
        const data = await response.json();
        setPapers(data?.data || []);
      } catch (err) {
        setError("Failed to load scientist articles.");
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, [subjectId, grade, stream]);
  
  // Extract items from the first paper
  const scientistItems = papers.length > 0 ? papers[0].items : [];

  return (
    <div dir="rtl" className="p-3 sm:p-5 space-y-4">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-3 sm:p-4 sticky top-2 z-10 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/40">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-white min-w-0">
            <Star className="w-5 h-5 text-emerald-300 shrink-0" />
            <div className="font-extrabold text-lg sm:text-xl truncate">
               زاناكان
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

      {/* Content */}
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

      {!loading && scientistItems.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          هیچ وتارێکی زانستی نەدۆزرایەوە.
        </div>
      )}

      {!loading && scientistItems.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {scientistItems.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-white/10 bg-zinc-900/60 p-4 space-y-4"
            >
              {item.url && (
                <img
                  src={item.url}
                  alt={item.label}
                  className="w-full h-auto max-h-[400px] object-contain rounded-2xl ring-1 ring-white/10 bg-black/20"
                />
              )}
              <div className="space-y-2">
                <h1 className="text-white text-lg sm:text-xl font-extrabold leading-tight">
                  {item.label}
                </h1>
              </div>
              {item.description && (
                <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}