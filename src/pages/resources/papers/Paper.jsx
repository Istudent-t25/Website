// src/pages/Paper.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FileText,
  FileCheck2,
  Image as ImageIcon,
  GraduationCap,
  BookOpenCheck,
  Loader2,
  Search,
  ArrowRight,
  Download,
  User2,
  Filter,
  Layers,
  ArrowRightCircle,
} from "lucide-react";

const API_PAPERS = "https://api.studentkrd.com/api/v1/papers";

/* ----------------- utils ----------------- */
async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("Network error");
  return r.json();
}

function streamKurdish(s) {
  if (!s) return null;
  const v = String(s).toLowerCase();
  if (v === "scientific") return "زانستی";
  if (v === "literary") return "ئەدەبی";
  if (v === "both") return "هاوبەش";
  return s;
}

function typeInfo(t) {
  const v = (t || "").toLowerCase();
  if (v === "national_exam") return { label: "ئازمونی نیشتمانی", icon: FileCheck2, tone: "text-cyan-300" };
  if (v === "important_note") return { label: "تێبینی گرنگ", icon: FileText, tone: "text-purple-300" };
  if (v === "important_questions") return { label: "ئەسیلەی گرنگ", icon: BookOpenCheck, tone: "text-amber-300" };
  if (v === "worksheet") return { label: "ڕاهێنان/کارەکان", icon: Layers, tone: "text-emerald-300" };
  if (v === "images_of_sessions") return { label: "وێنەکانی زینده‌زانی", icon: ImageIcon, tone: "text-sky-300" };
  return { label: "کۆکردەوە", icon: FileText, tone: "text-zinc-300" };
}

function buildQuery({ subjectId, subject, grade, stream, type, page = 1, perPage = 12 }) {
  const sp = new URLSearchParams();
  if (type) sp.set("type", type);
  if (subjectId) sp.set("subject_id", subjectId);
  else if (subject) sp.set("subject", subject);
  if (grade) sp.set("grade", grade);
  if (stream) sp.set("stream", stream);
  sp.set("page", String(page));
  sp.set("per_page", String(perPage));
  return `${API_PAPERS}?${sp.toString()}`;
}

/* ----------------- skeletons ----------------- */
function SkeletonBar({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-white/10 ${className}`} />;
}

function PaperCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-start gap-3">
          <SkeletonBar className="w-9 h-9 rounded-xl" />
          <div className="flex-1">
            <SkeletonBar className="h-4 w-2/3 mb-2" />
            <div className="flex gap-2">
              <SkeletonBar className="h-3 w-20" />
              <SkeletonBar className="h-3 w-24" />
              <SkeletonBar className="h-3 w-16" />
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 flex gap-2 overflow-x-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBar key={i} className="h-8 w-36 rounded-xl shrink-0" />
        ))}
      </div>
    </div>
  );
}

/* ----------------- components ----------------- */
function PaperItemChip({ it, paperTitle, backParam }) {
  const navigate = useNavigate();
  const year =
    it?.year_start && it?.year_end ? `${it.year_start}–${String(it.year_end).toString().slice(-2)}` : null;
  const term = it?.term ? `خولی ${it.term}` : null;
  const sess = typeof it?.session_no === "number" ? `وانە ${it.session_no}` : null;
  const parts = [year, term, sess].filter(Boolean);

  const view = () => {
    if (!it?.url) return;
    const qs = new URLSearchParams({
      url: it.url,
      title: it?.label || paperTitle || "پەڕە",
      label: parts.join(" • "),
      back: backParam, // full return URL
    });
    navigate(`/viewer?${qs.toString()}`);
  };

  return (
    <button
      onClick={view}
      className="group shrink-0 flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-right px-3 py-2 transition"
      title={it?.label || "بینین"}
    >
      <span className="text-[11px] text-zinc-300 line-clamp-1">
        {it?.label || "بەڵگە"}
      </span>
      {parts.length > 0 && (
        <span className="text-[10px] text-zinc-400">• {parts.join(" • ")}</span>
      )}
      <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-white" />
    </button>
  );
}

/* ----------------- page ----------------- */
export default function Papers() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const subjectId = params.get("subject_id");
  const subject = params.get("subject");
  const grade = params.get("grade");
  const stream = params.get("stream");
  const type = params.get("type");

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [err, setErr] = useState("");
  const [meta, setMeta] = useState({ page: 1, last: 1, total: 0 });
  const [papers, setPapers] = useState([]);
  const [q, setQ] = useState("");

  const tInfo = typeInfo(type);
  const streamLabel = streamKurdish(stream);

  // full back param (same filtered URL)
  const backParam = `${location.pathname}${location.search}`;

  useEffect(() => {
    let ok = true;
    (async () => {
      setErr("");
      setInitialLoading(true);
      setPapers([]);
      setMeta({ page: 1, last: 1, total: 0 });
      try {
        const url = buildQuery({ subjectId, subject, grade, stream, type, page: 1, perPage: 12 });
        const j = await fetchJSON(url);
        if (!ok) return;
        setPapers(j?.data || []);
        setMeta({
          page: j?.current_page || 1,
          last: j?.last_page || 1,
          total: j?.total || (j?.data?.length || 0),
        });
      } catch {
        if (!ok) return;
        setErr("نەتوانرا پەڕەکان باربکرێن.");
      } finally {
        setInitialLoading(false);
      }
    })();
    return () => { ok = false; };
  }, [subjectId, subject, grade, stream, type]);

  const loadMore = async () => {
    if (meta.page >= meta.last) return;
    const next = meta.page + 1;
    setLoading(true);
    try {
      const url = buildQuery({ subjectId, subject, grade, stream, type, page: next, perPage: 12 });
      const j = await fetchJSON(url);
      setPapers(prev => prev.concat(j?.data || []));
      setMeta({ page: j?.current_page || next, last: j?.last_page || next, total: j?.total || 0 });
    } catch {
      setErr("نەتوانرا پەڕەی داهاتوو بکرێت.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return papers;
    const match = (s) => (s || "").toString().toLowerCase().includes(n);
    return (papers || []).map(p => ({
      ...p,
      items: (p.items || []).filter(it =>
        match(it?.label) ||
        match(p?.title) ||
        match(p?.subject?.name) ||
        match(it?.term) ||
        match(String(it?.year_start || "")) ||
        match(String(it?.year_end || "")) ||
        match(String(it?.session_no ?? ""))
      )
    })).filter(p => (p.items || []).length > 0);
  }, [papers, q]);

  return (
    <div dir="rtl" className="p-3 sm:p-5 space-y-4">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-sky-500/5 p-3 sm:p-4 sticky top-2 z-10">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              {React.createElement(tInfo.icon, { className: `w-5 h-5 ${tInfo.tone}` })}
              <div className="font-extrabold text-lg sm:text-xl">{tInfo.label}</div>
              {meta.total ? <span className="text-[11px] text-zinc-300">({meta.total})</span> : null}
            </div>

            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white"
              title="گەڕانەوە"
            >
              <ArrowRightCircle className="w-4 h-4" />
              گەڕانەوە
            </button>
          </div>

          {/* context badges */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-300">
            {/* {subjectId && <span className="px-2 py-1 rounded-xl bg-white/5 border border-white/10">#ID بابەت: {subjectId}</span>} */}
            {/* {subject && <span className="px-2 py-1 rounded-xl bg-white/5 border border-white/10">بابەت: {subject}</span>} */}
            {grade && <span className="px-2 py-1 rounded-xl bg-white/5 border border-white/10"><GraduationCap className="inline w-3 h-3 mr-1" />پۆل: {grade}</span>}
            {stream && <span className="px-2 py-1 rounded-xl bg-white/5 border border-white/10">جۆر: {streamLabel}</span>}
          </div>

          {/* search */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-[360px]">
              <input
                dir="rtl"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="گەڕان لە ناونیشان، ساڵ، خولی، وانە..."
                className="w-full rounded-2xl bg-zinc-900/60 border border-white/10 text-white text-sm px-10 py-2.5 outline-none focus:ring-2 focus:ring-sky-400/30"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-[12px] text-zinc-400">
              <Filter className="w-4 h-4" /> فلتەری ناوەڕۆک
            </span>
          </div>
        </div>
      </div>

      {/* Error */}
      {err && <div className="text-red-300 text-sm">{err}</div>}

      {/* Initial Skeletons */}
      {initialLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <PaperCardSkeleton key={i} />)}
        </div>
      )}

      {/* Empty */}
      {!initialLoading && filtered.length === 0 && (
        <div className="text-zinc-400">هیچ پەڕەیەک نەدۆزرایەوە بەم فلتەرە.</div>
      )}

      {/* Papers grid */}
      {!initialLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p) => {
            const teacher = p?.teacher?.full_name;
            const subj = p?.subject?.name;
            const count = Array.isArray(p?.items) ? p.items.length : 0;
            const t = typeInfo(p?.type);
            const ThumbIcon = t.icon;
            const toneClass = t.tone;

            return (
              <div
                key={`paper-${p.id}`}
                className="rounded-2xl border border-white/10 bg-zinc-900/60 overflow-hidden"
              >
                {/* header */}
                <div className="p-3 sm:p-4 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 rounded-xl bg-black/30 border border-white/10 p-2">
                      <ThumbIcon className={`w-5 h-5 ${toneClass}`} />
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-white font-bold leading-6">
                        {p?.title || tInfo.label}
                      </div>
                      <div className="text-[12px] text-zinc-400 flex flex-wrap gap-2 mt-1">
                        {subj && (
                          <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">
                            {subj}
                          </span>
                        )}
                        {teacher && (
                          <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 inline-flex items-center gap-1">
                            <User2 className="w-3 h-3" />
                            {teacher}
                          </span>
                        )}
                        {count > 0 && (
                          <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">
                            ژمارەی پەڕەکان: {count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* items */}
                <div className="p-3 sm:p-4">
                  {(!p?.items || p.items.length === 0) ? (
                    <div className="text-zinc-400 text-sm">هیچ پەڕەیەک لەم کۆمەڵەیەدا نییە.</div>
                  ) : (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                      {p.items.map((it) => (
                        <PaperItemChip
                          key={`it-${p.id}-${it.id}`}
                          it={it}
                          paperTitle={p?.title}
                          backParam={backParam}
                        />
                      ))}
                    </div>
                  )}

                  {/* optional bundle */}
                  {p?.pdf_url && (
                    <div className="mt-3 flex justify-end">
                      <a
                        href={p.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white"
                      >
                        <Download className="w-4 h-4" /> کۆپی دەرهێنراو
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load more */}
      {!initialLoading && meta.page < meta.last && (
        <div className="flex justify-center py-4">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm border border-white/10"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> زیاتر باربکە
              </span>
            ) : "زیاتر باربکە"}
          </button>
        </div>
      )}
    </div>
  );
}
