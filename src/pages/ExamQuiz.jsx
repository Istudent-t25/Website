// src/pages/ExamQuiz.jsx — StudentKRD (RTL)
// v2 — Fresh card designs + ultra-mobile UX
// - Two modes: Practice (preview with reveal) & Real Exam (no reveal until end)
// - Start Options: Mode + Timer (Off/20/45/60/Custom)
// - Sticky Info Bar: timer, progress ring, play/pause/reset, submit
// - New Cards:
//   * Subject cards: soft neon border + subtle glow
//   * Exam cards: split meta layout + pill tags
//   * Question card: letter chips (A/B/C/D), pressed states, better spacing
//   * Palette: compact rounded pills
// - Autosave per exam id; Resume/Clear
// - Keyboard: 1–4 answer, ←/→ navigate

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpenCheck,
  BookOpen,
  GraduationCap,
  Filter,
  Home,
  Search,
  Timer as TimerIcon,
  Pause,
  Play,
  RotateCw,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Award,
  ListChecks,
  Grid,
  Sparkles,
  Layers,
  Eye,
  EyeOff,
} from "lucide-react";

/* =========================
   API ENDPOINTS (adjust if needed)
   ========================= */
const API_SETS = "https://api.studentkrd.com/api/v1/exam-sets";
const API_QUESTIONS = "https://api.studentkrd.com/api/v1/exam-questions";

/* =========================
   HELPERS / UX
   ========================= */
const SPRING = { type: "spring", stiffness: 260, damping: 24, mass: 0.6 };
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const letterToIndex = (ch) => ({ A: 1, B: 2, C: 3, D: 4 }[(ch || "").toUpperCase()] || 1);
const termLabel = (t) => (t === "term2" ? "خولی ٢" : t === "term1" ? "خولی ١" : t || "");
const kindLabel = (k) => (k === "national" ? "نیشتمانی" : k || "");
const streamLabel = (s) => ({ scientific: "زانستی", literary: "ئەدەبی", both: "هاوبەش" }[(s || "").toLowerCase()] || s || "");

// Fetch all pages (Laravel-style pagination)
async function fetchAllPages(baseUrl, params = {}) {
  const sp = new URLSearchParams({ per_page: "50", ...params });
  let url = `${baseUrl}?${sp.toString()}`;
  let out = [];
  for (;;) {
    const r = await fetch(url);
    if (!r.ok) throw new Error("Network error");
    const j = await r.json();
    const pageData = Array.isArray(j?.data) ? j.data : (Array.isArray(j) ? j : []);
    out = out.concat(pageData);
    if (!j?.next_page_url) break;
    url = j.next_page_url;
  }
  return out;
}
function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

/* =========================
   PAGE
   ========================= */
export default function ExamQuiz() {
  const nav = useNavigate();
  const q = useQuery();

  const qSubjectId = q.get("subject_id") || "";
  const qGrade = q.get("grade") || "";
  const qStream = q.get("stream") || "";

  const [view, setView] = useState("subjects"); // subjects | exams | options | quiz | result
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [sets, setSets] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [subject, setSubject] = useState(null);
  const [examSets, setExamSets] = useState([]);
  const [examSearch, setExamSearch] = useState("");
  const [examYear, setExamYear] = useState("all");
  const [examTerm, setExamTerm] = useState("all");
  const [examKind, setExamKind] = useState("all");

  const [exam, setExam] = useState(null);
  const [mode, setMode] = useState("exam"); // exam | practice
  const [customMin, setCustomMin] = useState("45");

  const [questions, setQuestions] = useState([]);
  const [order, setOrder] = useState([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(45 * 60); // 0 = no timer
  const [running, setRunning] = useState(false);
  const [revealAll, setRevealAll] = useState(false);
  const tickRef = useRef(null);

  const storeKey = useMemo(() => (exam?.id ? `examquiz:${exam.id}` : "examquiz:pending"), [exam?.id]);

  /* Load Sets + Subjects */
  useEffect(() => {
    let ok = true;
    setLoading(true); setErr("");
    (async () => {
      try {
        const params = {};
        if (qGrade) params.grade = String(qGrade);
        if (qStream) params.stream = String(qStream);
        const rows = await fetchAllPages(API_SETS, params);
        if (!ok) return;

        // Build subjects list
        const bySub = new Map();
        rows.forEach((r) => {
          const sid = r.subject_id; const sname = r.subject?.name || "";
          if (!bySub.has(sid)) bySub.set(sid, { id: sid, name: sname, count: 0, streams: new Set(), years: new Set(), minGrade: r.grade ?? null, maxGrade: r.grade ?? null });
          const ent = bySub.get(sid);
          ent.count++; if (r.stream) ent.streams.add(r.stream);
          if (typeof r.year === "number") ent.years.add(r.year);
          if (typeof r.grade === "number") {
            ent.minGrade = ent.minGrade == null ? r.grade : Math.min(ent.minGrade, r.grade);
            ent.maxGrade = ent.maxGrade == null ? r.grade : Math.max(ent.maxGrade, r.grade);
          }
        });
        const subjectsArr = [...bySub.values()].map((s) => ({ ...s, streams: [...s.streams], years: [...s.years].sort((a, b) => b - a) })).sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name));
        setSets(rows); setSubjects(subjectsArr);
        if (qSubjectId) {
          const found = subjectsArr.find((s) => String(s.id) === String(qSubjectId));
          if (found) { setSubject(found); setView("exams"); }
        }
      } catch (e) {
        if (!ok) return; setErr("نەتوانرا لیستی تاقیکردنەوەکان هێنابخرێت.");
      } finally { if (ok) setLoading(false); }
    })();
    return () => { ok = false; };
  }, [qSubjectId, qGrade, qStream]);

  /* Subject → its exam sets */
  useEffect(() => {
    if (!subject) return;
    const list = sets.filter((r) => String(r.subject_id) === String(subject.id));
    const sorted = list.slice().sort((a, b) => {
      const y = (b.year || 0) - (a.year || 0); if (y !== 0) return y;
      const tOrder = { term2: 2, term1: 1, "": 0 };
      const t = (tOrder[b.term] || 0) - (tOrder[a.term] || 0); if (t !== 0) return t;
      const k = (b.kind === "national") - (a.kind === "national"); if (k !== 0) return k;
      return (b.id || 0) - (a.id || 0);
    });
    setExamSets(sorted);
    setExamSearch(""); setExamYear("all"); setExamTerm("all"); setExamKind("all");
  }, [subject, sets]);

  /* Timer */
  useEffect(() => {
    if (!running || duration === 0) { if (tickRef.current) clearInterval(tickRef.current); tickRef.current = null; return; }
    tickRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); tickRef.current = null; };
  }, [running, duration]);

  /* Keyboard */
  useEffect(() => {
    if (view !== "quiz") return;
    const onKey = (e) => {
      if (e.key >= "1" && e.key <= "4") {
        const choice = Number(e.key);
        const q = questions[order[idx]]; if (!q) return;
        setAnswers((prev) => ({ ...prev, [q.id]: choice }));
      }
      if (e.key === "ArrowRight") setIdx((v) => clamp(v + 1, 0, order.length - 1));
      if (e.key === "ArrowLeft") setIdx((v) => clamp(v - 1, 0, order.length - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, idx, order, questions]);

  /* Autosave */
  useEffect(() => {
    if (view !== "quiz") return;
    const payload = { exam, questions, order, idx, answers, elapsed, duration, mode, ts: Date.now() };
    localStorage.setItem(storeKey, JSON.stringify(payload));
  }, [view, exam, questions, order, idx, answers, elapsed, duration, mode, storeKey]);

  const resumeSaved = () => {
    const raw = localStorage.getItem(storeKey); if (!raw) return;
    try {
      const s = JSON.parse(raw); if (!s || !Array.isArray(s.questions)) return;
      setExam(s.exam || null); setQuestions(s.questions); setOrder(s.order || [...s.questions.keys()]);
      setIdx(s.idx || 0); setAnswers(s.answers || {}); setElapsed(s.elapsed || 0);
      setDuration(s.duration ?? 45 * 60); setMode(s.mode || "exam");
      setView("quiz"); setRunning(true);
    } catch {}
  };
  const clearSaved = () => localStorage.removeItem(storeKey);

  /* Normalize question */
  function normalizeQuestion(row, i) {
    const options = [row.option_a, row.option_b, row.option_c, row.option_d].filter(Boolean);
    return {
      id: row.id ?? `q${i + 1}`,
      question: row.question,
      options: options.length === 4 ? options : options.concat(["", "", "", ""]).slice(0, 4),
      correct_index: letterToIndex(row.correct_option), // 1..4
      image_url: row.image_url || null,
      hint_title: row.hint_title || null,
      analysis: row.analysis || null,
      position: row.position ?? i + 1,
    };
  }

  /* Load questions for a set */
  async function loadQuestionsForSet(setRow) {
    const rows = await fetchAllPages(API_QUESTIONS, { exam_set_id: String(setRow.id) });
    let list = rows.map(normalizeQuestion);
    if (!list.length) {
      const all = await fetchAllPages(API_QUESTIONS);
      list = all.filter((r) => r.exam_set_id === setRow.id).map(normalizeQuestion);
    }
    const take = list.slice(0, 50);
    return { list: take, order: shuffle([...take.keys()]) };
  }

  /* Start */
  const startExam = async (setRow, pickedMode, pickedMinutes) => {
    try {
      setLoading(true); setErr("");
      setExam(setRow); setAnswers({}); setIdx(0); setElapsed(0); setRevealAll(false);
      const mins = Number(pickedMinutes || 0);
      setDuration(isFinite(mins) && mins > 0 ? mins * 60 : 0);
      setMode(pickedMode);

      const { list, order } = await loadQuestionsForSet(setRow);
      setQuestions(list); setOrder(order); setView("quiz"); setRunning(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setErr("نەتوانرا پرسیارەکان دابەزێندرێت."); setView("exams");
    } finally { setLoading(false); }
  };

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const total = useMemo(() => order.length, [order]);
  const currentQ = useMemo(() => questions[order[idx]] || null, [questions, order, idx]);

  const remaining = duration === 0 ? Infinity : Math.max(0, duration - elapsed);
  const timeIsUp = duration > 0 && remaining === 0;
  const done = timeIsUp || (total > 0 && answeredCount === total);

  const score = useMemo(() => {
    if (!done) return null;
    let s = 0; for (const qi of order) { const q = questions[qi]; const picked = answers[q.id]; if (picked === q.correct_index) s++; }
    return s;
  }, [done, order, questions, answers]);

  const submitNow = () => { setRunning(false); setView("result"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const retry = () => {
    clearSaved(); setView("subjects"); setSubject(null); setExam(null);
    setQuestions([]); setOrder([]); setAnswers({}); setIdx(0); setElapsed(0);
    setRunning(false); setRevealAll(false); setMode("exam"); setDuration(45 * 60);
  };

  const years = useMemo(() => {
    const ys = new Set(); examSets.forEach((e) => Number.isFinite(e.year) && ys.add(e.year));
    return ["all", ...[...ys].sort((a, b) => b - a)];
  }, [examSets]);
  const filteredExams = useMemo(() => {
    const n = examSearch.trim().toLowerCase();
    return examSets.filter((e) => {
      const match = (s) => (s || "").toString().toLowerCase().includes(n);
      const byYear = examYear === "all" || String(e.year) === String(examYear);
      const byTerm = examTerm === "all" || (e.term || "") === examTerm;
      const byKind = examKind === "all" || (e.kind || "") === examKind;
      return byYear && byTerm && byKind && (!n || match(e.title) || match(e.subject?.name) || match(termLabel(e.term)) || match(kindLabel(e.kind)) || match(String(e.grade || "")) || match(String(e.year || "")));
    });
  }, [examSets, examSearch, examYear, examTerm, examKind]);

  return (
    <div dir="rtl" className="p-3 sm:p-5 space-y-4">
      {/* Page Header */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-3 sm:p-4 sticky top-2 z-20 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/40">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-white min-w-0">
            <BookOpenCheck className="w-5 h-5 text-emerald-300 shrink-0" />
            <div className="font-extrabold text-lg sm:text-xl truncate">
              {view === "subjects" && "هەڵبژاردنى بابەت"}
              {view === "exams" && <>هەڵبژاردنى تاقیکردنەوە — {subject?.name || ""}</>}
              {view === "options" && <>هەڵبژاردنەکان — {exam?.title || subject?.name || ""}</>}
              {view === "quiz" && <>تاقیکردنەوە — {exam?.title || subject?.name || ""}</>}
              {view === "result" && "ئەنجامەکان"}
            </div>
          </div>
          {/* <button onClick={() => nav(-1)} className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white">
            <Home className="w-4 h-4" /> گەڕانەوە
          </button> */}
        </div>
      </div>

      {err && <div className="text-red-300 text-sm">{err}</div>}

      <AnimatePresence mode="popLayout">
        {view === "subjects" && (
          <motion.div key="subjects" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={SPRING} className="space-y-3">
            <SubjectPicker loading={loading} subjects={subjects} preFilters={{ grade: qGrade, stream: qStream }} onSelect={(s) => { setSubject(s); setView("exams"); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
          </motion.div>
        )}

        {view === "exams" && (
          <motion.div key="exams" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={SPRING} className="space-y-3">
            <ExamPicker loading={loading} subject={subject} years={years} list={filteredExams} examYear={examYear} examTerm={examTerm} examKind={examKind} onYear={setExamYear} onTerm={setExamTerm} onKind={setExamKind} search={examSearch} onSearch={setExamSearch} onBack={() => setView("subjects")} onSelect={(meta) => { setExam(meta); setView("options"); }} onResume={resumeSaved} hasSaved={!!localStorage.getItem(storeKey)} onClearSaved={clearSaved} />
          </motion.div>
        )}

        {view === "options" && (
          <motion.div key="options" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={SPRING} className="space-y-3">
            <StartOptions exam={exam} mode={mode} onMode={setMode} customMin={customMin} onCustomMin={setCustomMin} onCancel={() => setView("exams")} onStart={() => startExam(exam, mode, customMin)} />
          </motion.div>
        )}

        {view === "quiz" && (
          <motion.div key="quiz" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={SPRING} className="space-y-3">
            <QuizHeaderSticky meta={exam} remaining={duration === 0 ? null : Math.max(0, remaining)} answered={answeredCount} total={total} running={running} onPause={() => setRunning(false)} onPlay={() => setRunning(true)} onReset={() => { setElapsed(0); setRunning(false); }} onSubmit={submitNow} mode={mode} revealAll={revealAll} onToggleReveal={() => setRevealAll((v) => !v)} />

            <QuestionCard q={currentQ} index={idx} total={total} answer={currentQ ? answers[currentQ.id] : undefined} onPick={(n) => { if (!currentQ) return; setAnswers((prev) => ({ ...prev, [currentQ.id]: n })); }} onPrev={() => setIdx((v) => clamp(v - 1, 0, total - 1))} onNext={() => setIdx((v) => clamp(v + 1, 0, total - 1))} mode={mode} revealAll={revealAll} />

            <Palette questions={questions} order={order} idx={idx} answers={answers} onJump={(i) => setIdx(clamp(i, 0, total - 1))} />
          </motion.div>
        )}

        {view === "result" && (
          <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={SPRING} className="space-y-4">
            <ResultCard meta={exam} score={score ?? 0} total={total} elapsed={elapsed} onRetry={retry} />
            <ReviewList questions={questions} order={order} answers={answers} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================
   SUBJECT PICKER — New card style
   ========================= */
function SubjectPicker({ loading, subjects, preFilters, onSelect }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase(); if (!n) return subjects;
    const match = (s) => (s || "").toString().toLowerCase().includes(n);
    return subjects.filter((s) => match(s.name));
  }, [subjects, q]);

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-3 sm:p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-between">
        <div className="relative w-full sm:max-w-sm">
          <input dir="rtl" value={q} onChange={(e) => setQ(e.target.value)} placeholder="گەڕان لە ناوی بابەت..." className="w-full rounded-2xl bg-zinc-900/60 border border-white/10 text-white text-[13px] sm:text-sm px-9 py-2.5 outline-none focus:ring-2 focus:ring-emerald-400/30" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        </div>
        {(preFilters?.grade || preFilters?.stream) && (
          <div className="inline-flex flex-wrap gap-2 text-[11px] text-zinc-300">
            {preFilters.grade && (<span className="px-2 py-0.5 rounded-xl bg-white/5 border border-white/10 inline-flex items-center gap-1"><GraduationCap className="w-3 h-3" /> پۆل: {preFilters.grade}</span>)}
            {preFilters.stream && (<span className="px-2 py-0.5 rounded-xl bg-white/5 border border-white/10 inline-flex items-center gap-1"><Filter className="w-3 h-3" /> {streamLabel(preFilters.stream)}</span>)}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {Array.from({ length: 8 }).map((_, i) => (<div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-zinc-300 text-center py-6">هیچ بابەتێک نەدۆزرایەوە.</div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {filtered.map((s) => (
            <button key={s.id} onClick={() => onSelect(s)} className="group text-right rounded-2xl border border-emerald-400/10 bg-zinc-950/60 p-[1px] transition focus:outline-none focus:ring-2 focus:ring-emerald-400/30">
              <div className="rounded-2xl h-full w-full bg-gradient-to-br from-white/5 to-transparent p-4 ring-1 ring-inset ring-white/5 group-hover:ring-emerald-300/20">
                <div className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-emerald-300" /><div className="text-white font-bold line-clamp-1">{s.name}</div></div>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-zinc-300">
                  {s.minGrade != null && s.maxGrade != null && (<Badge>پۆل {s.minGrade === s.maxGrade ? s.minGrade : `${s.minGrade}–${s.maxGrade}`}</Badge>)}
                  {s.streams.length > 0 && <Badge>{s.streams.map(streamLabel).join(" / ")}</Badge>}
                  {s.years.length > 0 && <Badge>{s.years[0]}–{s.years[0] + 1}</Badge>}
                  <Badge className="inline-flex items-center gap-1"><Sparkles className="w-3 h-3" /> {s.count} تاقیکردنەوە</Badge>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================
   EXAM PICKER — Split meta card
   ========================= */
function ExamPicker({ loading, subject, years, list, examYear, examTerm, examKind, onYear, onTerm, onKind, search, onSearch, onBack, onSelect, hasSaved, onResume, onClearSaved }) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-3 sm:p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 justify-between">
          <div className="flex items-center gap-2"><Layers className="w-5 h-5 text-emerald-300" /><div className="text-white font-bold">{subject?.name || "بابەت"}</div></div>
          <div className="flex items-center gap-2">
            {hasSaved && (<>
              <button onClick={onResume} className="text-xs px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white">بەردەوامبە</button>
              <button onClick={onClearSaved} className="text-xs px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300">سڕینەوەى هەڵگرتن</button>
            </>)}
            <button onClick={onBack} className="text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white">گەڕانەوە بۆ بابەتەکان</button>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-2">
          <div className="relative">
            <input dir="rtl" value={search} onChange={(e) => onSearch(e.target.value)} placeholder="گەڕان لە ناونیشان، ساڵ، خولی، جۆر..." className="w-full rounded-2xl bg-zinc-900/60 border border-white/10 text-white text-[13px] sm:text-sm px-9 py-2.5 outline-none focus:ring-2 focus:ring-emerald-400/30" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SelectPill label="ساڵ" value={examYear} onChange={onYear} options={years} />
            <SelectPill label="خولی" value={examTerm} onChange={onTerm} options={["all", "term1", "term2"]} render={(v) => (v === "all" ? "هەموو" : termLabel(v))} />
            <SelectPill label="جۆر" value={examKind} onChange={onKind} options={["all", "national"]} render={(v) => (v === "all" ? "هەموو" : kindLabel(v))} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-3 sm:p-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />))}</div>
        ) : list.length === 0 ? (
          <div className="text-zinc-300 text-center py-6">هیچ تاقیکردنەوەیەک بەم فلتەرە نییە.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {list.map((e) => (
              <motion.button key={e.id} layout transition={SPRING} onClick={() => onSelect({ id: e.id, title: e.title || [e.subject?.name, e.year ? `${e.year}-${e.year + 1}` : "", termLabel(e.term), kindLabel(e.kind)].filter(Boolean).join(" · "), year: e.year, term: e.term, kind: e.kind, grade: e.grade, stream: e.stream, subject_name: e.subject?.name || "" })} className="group text-right rounded-2xl overflow-hidden border border-white/10 bg-zinc-950/60 transition focus:outline-none focus:ring-2 focus:ring-emerald-400/30">
                <div className="p-4 bg-gradient-to-br from-white/5 to-transparent">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-white font-extrabold leading-tight line-clamp-2">{e.title || e.subject?.name}</div>
                    <div className="px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-[11px] inline-flex items-center gap-1"><Sparkles className="w-3 h-3" /> ٥٠ پرس</div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-zinc-300">
                    {Number.isFinite(e.year) && <Badge>{e.year}-{e.year + 1}</Badge>}
                    {e.term && <Badge>{termLabel(e.term)}</Badge>}
                    {e.kind && <Badge>{kindLabel(e.kind)}</Badge>}
                    {e.grade && <Badge>پۆل {e.grade}</Badge>}
                    {e.stream && <Badge>{streamLabel(e.stream)}</Badge>}
                  </div>
                </div>
                <div className="h-1.5 bg-gradient-to-r from-emerald-400/50 via-cyan-300/50 to-transparent group-hover:from-emerald-400 group-hover:via-cyan-300" />
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================
   START OPTIONS
   ========================= */
function StartOptions({ exam, mode, onMode, customMin, onCustomMin, onCancel, onStart }) {
  const [timerChoice, setTimerChoice] = useState("45");
  useEffect(() => { if (timerChoice !== "custom") onCustomMin(timerChoice === "Off" ? "0" : timerChoice); }, [timerChoice]);

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 space-y-4">
      <div className="text-white font-extrabold text-lg">{exam?.title || "ئازمون"}</div>

      <div className="space-y-2">
        <div className="text-zinc-300 text-sm">دۆخی کار</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button onClick={() => onMode("practice")} className={`text-right rounded-xl border px-3 py-2 ${mode === "practice" ? "bg-emerald-600/20 border-emerald-500/30 text-white" : "bg-white/5 border-white/10 text-zinc-200 hover:bg-white/10"}`}>
            <div className="font-semibold">ئامادەکاری (Preview)</div>
            <div className="text-[12px] opacity-80">وەڵامە راستەکان دەرکەون، دەتوانی نیشانبەیت</div>
          </button>
          <button onClick={() => onMode("exam")} className={`text-right rounded-xl border px-3 py-2 ${mode === "exam" ? "bg-emerald-600/20 border-emerald-500/30 text-white" : "bg-white/5 border-white/10 text-zinc-200 hover:bg-white/10"}`}>
            <div className="font-semibold">ئازمونی ڕەسمی</div>
            <div className="text-[12px] opacity-80">وەڵامەکان تا کۆتایی دەرناکەون</div>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-zinc-300 text-sm">کاتژمێر</div>
        <div className="flex flex-wrap gap-2">
          {['Off','20','45','60','custom'].map((t) => (
            <button key={t} onClick={() => setTimerChoice(t)} className={`px-3 py-1.5 rounded-lg border text-sm ${timerChoice === t ? "bg-emerald-600/20 border-emerald-500/30 text-emerald-100" : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"}`}>{t === 'Off' ? 'بێ کات' : t === 'custom' ? 'Custom' : `${t} خولەک`}</button>
          ))}
          {timerChoice === "custom" && (
            <input inputMode="numeric" dir="ltr" value={customMin} onChange={(e) => onCustomMin(e.target.value.replace(/[^0-9]/g, ''))} placeholder="45" className="w-24 rounded-lg bg-zinc-900/60 border border-white/10 text-white text-sm px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-400/30" />
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button onClick={onStart} className="flex-1 h-10 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white">دەستپێبکە</button>
        <button onClick={onCancel} className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white">پاشگەزبونەوە</button>
      </div>
    </div>
  );
}

/* =========================
   WIDGETS
   ========================= */
function Badge({ children, className = "" }) { return <span className={`px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 ${className}`}>{children}</span>; }
function SelectPill({ label, value, onChange, options, render }) {
  return (
    <div className="inline-flex items-center gap-1">
      <span className="text-[11px] text-zinc-300">{label}:</span>
      <div className="flex gap-1">
        {options.map((op) => {
          const val = op; const text = render ? render(op) : String(op);
          const active = String(value) === String(val);
          return (
            <button key={val} onClick={() => onChange(val)} className={`px-2 py-0.5 rounded-lg border text-[11px] ${active ? "bg-emerald-600/20 border-emerald-500/30 text-emerald-100" : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"}`}>{text}</button>
          );
        })}
      </div>
    </div>
  );
}

/* Sticky quiz header */
function QuizHeaderSticky({ meta, remaining, answered, total, running, onPause, onPlay, onReset, onSubmit, mode, revealAll, onToggleReveal }) {
  const pct = total ? Math.round((answered / total) * 100) : 0;
  const mm = remaining == null ? null : String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = remaining == null ? null : String(remaining % 60).padStart(2, "0");

  return (
    <div className="sticky top-16 sm:top-20 z-20 rounded-2xl border border-white/10 bg-zinc-900/75 backdrop-blur p-2.5 sm:p-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <path d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32" fill="none" stroke="currentColor" strokeWidth="4" className="text-zinc-800" />
              <path d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${pct}, 100`} className="text-emerald-400" />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-[10px] sm:text-[11px] text-zinc-200">{pct}%</div>
          </div>
          <div className="min-w-0">
            <div className="text-white font-semibold truncate">{meta?.title || "ئازمون"}</div>
            <div className="text-[11px] sm:text-[12px] text-zinc-400">وەڵامدراوە: {answered} / {total} · {mode === 'practice' ? 'ئامادەکاری' : 'ئازمونی ڕەسمی'}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          <div className="px-2 py-1.5 sm:px-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-[12px] sm:text-sm inline-flex items-center gap-1.5">
            <TimerIcon className="w-4 h-4" />
            <span className="tabular-nums">{remaining == null ? '∞' : `${mm}:${ss}`}</span>
          </div>

          {running ? (
            <button onClick={onPause} aria-label="وەستاندن" className="h-9 px-2 sm:px-2.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white"><Pause className="w-4 h-4" /></button>
          ) : (
            <button onClick={onPlay} aria-label="دەستپێک یان بەردەوامی" className="h-9 px-2 sm:px-2.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white"><Play className="w-4 h-4" /></button>
          )}

          <button onClick={onReset} aria-label="سڕینی کات" className="h-9 px-2 sm:px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white"><RotateCw className="w-4 h-4" /></button>

          {mode === 'practice' && (
            <button onClick={onToggleReveal} className="h-9 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white inline-flex items-center gap-1.5">
              {revealAll ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} {revealAll ? 'شاردنەوە' : 'نیشاندانی وەڵام'}
            </button>
          )}

          <button onClick={onSubmit} className="flex-1 sm:flex-none h-9 px-3 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white">کۆتایی بدە</button>
        </div>
      </div>
    </div>
  );
}

/* Question Card — letter chips */
function QuestionCard({ q, index, total, answer, onPick, onPrev, onNext, mode, revealAll }) {
  if (!q) return null; const n = index + 1; const opts = q.options || [];
  const reveal = mode === 'practice' && (revealAll || typeof answer === 'number');

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-zinc-300 text-sm">پرسیار <span className="text-white font-semibold">{n}</span> / {total}</div>
        <div className="flex items-center gap-2">
          <button onClick={onPrev} className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white"><ChevronRight className="w-4 h-4" /></button>
          <button onClick={onNext} className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white"><ChevronLeft className="w-4 h-4" /></button>
        </div>
      </div>

      <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
        <div className="text-white font-semibold leading-relaxed text-[15px] sm:text-base mb-3">{q.question}</div>
        {q.image_url && (
          <div className="mb-3"><img src={q.image_url} alt="question" className="max-h-72 w-full object-contain rounded-xl ring-1 ring-white/10 bg-black/20" loading="lazy" /></div>
        )}

        <div className="grid gap-2">
          {opts.map((opt, i) => {
            const num = i + 1; const isPicked = answer === num; const isCorrect = num === q.correct_index;
            const letter = ['A','B','C','D'][i];

            let cls = "bg-white/5 border-white/10 text-zinc-200 hover:bg-white/10";
            if (mode === 'exam') {
              // Real exam: do NOT imply correctness; only show a neutral picked state
              if (isPicked) cls = "bg-white/10 border-white/20 text-white";
            } else {
              if (reveal) {
                if (isCorrect) cls = "bg-emerald-600/20 border-emerald-500/30 text-white";
                else if (isPicked) cls = "bg-rose-600/20 border-rose-500/30 text-white";
              } else if (isPicked) {
                cls = "bg-emerald-600/20 border-emerald-500/30 text-white";
              }
            }

            return (
              <button key={i} onClick={() => onPick(num)} className={`text-right rounded-xl border px-3 py-2 transition ${cls}`}>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-white/10 border border-white/10 text-[12px] mr-2">{letter}</span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {mode === 'practice' && reveal && (
          <div className="mt-3 text-[12px] text-emerald-200">وەڵامی ڕاست: {q.correct_index}</div>
        )}
      </motion.div>
    </div>
  );
}

/* Palette */
function Palette({ questions, order, idx, answers, onJump }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-white font-semibold inline-flex items-center gap-2"><Grid className="w-4 h-4" /> پەلتەى پرسیارەکان</div>
        <div className="text-[12px] text-zinc-400">کرتە بکە بۆ بازدانی هەر پرسیارێک</div>
      </div>
      <div className="grid grid-cols-10 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-20 gap-1.5">
        {order.map((ordIdx, i) => {
          const q = questions[ordIdx]; const picked = answers[q.id]; const active = i === idx;
          const stateClass = picked ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-200" : "bg-white/5 border-white/10 text-zinc-200";
          return (
            <button key={q.id} onClick={() => onJump(i)} className={`rounded-full border text-[11px] px-2 py-1 ${stateClass} ${active ? "ring-2 ring-emerald-400/40" : ""}`} title={q.question}>{i + 1}</button>
          );
        })}
      </div>
    </div>
  );
}

/* Result */
function ResultCard({ meta, score, total, elapsed, onRetry }) {
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const pct = total ? Math.round((score / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {pct >= 60 ? (<CheckCircle2 className="w-6 h-6 text-emerald-400" />) : (<XCircle className="w-6 h-6 text-rose-400" />)}
          <div>
            <div className="text-white font-semibold">{meta?.title || "ئازمون"}</div>
            <div className="text-[12px] text-zinc-400">نمرە: <span className="text-white">{score}</span> / {total} — {pct}%</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-zinc-300"><TimerIcon className="w-4 h-4" /> کاتی بەکارھێنان: {mm}:{ss}</div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button onClick={onRetry} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white inline-flex items-center gap-2"><RotateCw className="w-4 h-4" /> دەست پێکردنەوە</button>
        <div className="px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 inline-flex items-center gap-2"><Award className="w-4 h-4" /> ئەفەرین! پێشکەوتن دەکەیت</div>
      </div>
    </div>
  );
}

/* Review after finish */
function ReviewList({ questions, order, answers }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-3 sm:p-4">
      <div className="text-white font-semibold mb-2 inline-flex items-center gap-2"><ListChecks className="w-4 h-4" /> چاوپێکەوتن</div>
      <div className="space-y-2">
        {order.map((ordIdx, i) => {
          const q = questions[ordIdx]; const picked = answers[q.id]; const ok = picked === q.correct_index;
          return (
            <div key={q.id} className="rounded-2xl overflow-hidden border border-white/10">
              <div className="p-3 bg-gradient-to-r from-white/5 to-transparent">
                <div className="flex items-start justify-between">
                  <div className="text-white font-semibold">{i + 1}. {q.question}</div>
                  <div className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${ok ? "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30" : "bg-rose-500/15 text-rose-200 border border-rose-400/30"}`}>{ok ? "✅ راستە" : "❌ هەڵە"}</div>
                </div>
              </div>
              <div className="p-3 grid gap-1.5 bg-zinc-950/40">
                {q.options.map((o, k) => {
                  const num = k + 1; const isCorrect = num === q.correct_index; const isPicked = num === picked;
                  const cls = isCorrect ? "bg-emerald-600/15 border-emerald-500/30 text-emerald-100" : isPicked ? "bg-rose-600/15 border-rose-500/30 text-rose-100" : "bg-white/5 border-white/10 text-zinc-200";
                  const letter = ['A','B','C','D'][k];
                  return (
                    <div key={k} className={`rounded-lg border px-3 py-1.5 ${cls}`}>
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-white/10 border border-white/10 text-[12px] mr-2">{letter}</span>
                      <span>{o}</span>
                    </div>
                  );
                })}
              </div>
              {q.analysis && (<div className="p-3 text-[12px] text-zinc-300"><strong className="text-zinc-200">پەسنیار:</strong> {q.analysis}</div>)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
