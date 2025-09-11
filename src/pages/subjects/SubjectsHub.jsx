import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LibraryBig, Search, Loader2 } from "lucide-react";

const API_SUBJECTS = "https://api.studentkrd.com/api/v1/subjects";

async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("Network error");
  return r.json();
}

export default function SubjectsHub() {
  const nav = useNavigate();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    let ok = true;
    (async () => {
      setLoading(true);
      try {
        const j = await fetchJSON(`${API_SUBJECTS}?page=1&per_page=100`);
        const arr = Array.isArray(j?.data) ? j.data : [];
        if (!ok) return;
        setList(
          arr.map(s => ({
            id: s.id,
            name: s.name,
            code: (s.code || "").toLowerCase(), // "scientific" | "literary" | "both" | null
          }))
        );
      } finally {
        setLoading(false);
      }
    })();
    return () => { ok = false; };
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return list;
    const needle = q.trim().toLowerCase();
    return list.filter(s => (s.name || "").toLowerCase().includes(needle));
  }, [q, list]);

  const openSubject = (id) => nav(`/subjects/${id}`);

  return (
    <div dir="rtl" className="p-3 sm:p-5 space-y-4">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-emerald-400/5 p-3 sm:p-4">
        <div className="flex items-center gap-2 text-white">
          <LibraryBig className="w-5 h-5 text-emerald-300" />
          <div className="font-extrabold text-lg sm:text-xl">بابەتەکان</div>
          {!loading && list.length > 0 && (
            <span className="text-[11px] text-zinc-300">({list.length})</span>
          )}
        </div>
        <div className="mt-3 relative">
          <input
            dir="rtl"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="گەڕان بۆ ناوی بابەت..."
            className="w-full rounded-2xl bg-zinc-900/60 border border-white/10 text-white text-sm px-10 py-2.5 outline-none focus:ring-2 focus:ring-emerald-400/30"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-zinc-300">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> داتاکان بار دەبن…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-zinc-400">هیچ بابەتێک نەدۆزرایەوە.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {filtered.map((s) => (
            <button
              key={s.id}
              onClick={() => openSubject(s.id)}
              className="group text-right rounded-2xl px-3 py-3 bg-zinc-900/60 border border-white/10 hover:bg-zinc-900/80 transition"
              title={s.name}
            >
              <div className="text-[13px] font-bold text-white line-clamp-2">{s.name}</div>
              <div className="mt-1 text-[11px] text-zinc-400">
                {s.code ? (s.code === "both" ? "هاوبەش" : s.code === "scientific" ? "زانستی" : "ئەدەبی") : "—"}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
