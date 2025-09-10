import React from "react";
import { Search, Filter } from "lucide-react";

export default function Toolbar({ q, setQ, grade, setGrade, subjects, activeSubject, setActiveSubject }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-sky-500/5 p-3 sm:p-4" dir="rtl">
      <div className="flex flex-col gap-3">
        {/* Search + grade */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative flex-1">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="گەڕان… (ناونیشان/مامۆستا/بابەت)"
              className="w-full bg-zinc-900/70 border border-white/10 rounded-2xl pr-3 pl-10 py-3 text-sm text-zinc-100 outline-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-zinc-300">پۆل</span>
            <select
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
              className="bg-zinc-900/70 border border-white/10 rounded-xl px-3 py-2 text-sm text-zinc-100 outline-none"
            >
              {[7,8,9,10,11,12].map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        {/* Subject chips */}
        {subjects?.length ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12px] text-zinc-300 inline-flex items-center gap-1"><Filter size={14}/> بابەتەکان:</span>
            <button
              onClick={() => setActiveSubject("")}
              className={`px-3 py-1 rounded-xl text-[12px] ring-1 ${!activeSubject ? "bg-white/10 text-white ring-white/20" : "bg-white/5 text-zinc-300 ring-white/10 hover:bg-white/10"}`}
            >
              هەموو
            </button>
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => setActiveSubject(s)}
                className={`px-3 py-1 rounded-xl text-[12px] ring-1 ${activeSubject === s ? "bg-white/10 text-white ring-white/20" : "bg-white/5 text-zinc-300 ring-white/10 hover:bg-white/10"}`}
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
