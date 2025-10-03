// src/pages/ExamQuiz.jsx — StudentKRD (RTL)
// First-design UI + API data (exam-sets & exam-questions) + no artwork bg
// Enhancements: change answers any time, final review of correct answers,
// autosave/resume via localStorage, cached sets, simple level stats.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpenCheck, BookOpen, GraduationCap, Filter, Search,
  Timer as TimerIcon, Pause, Play, RotateCw, ChevronRight, ChevronLeft,
  CheckCircle2, XCircle, Award, ListChecks, Sparkles, Layers,
  Eye, EyeOff, Download, Info, Clock, Target, TrendingUp, Brain,
  Zap, Trophy, ArrowRight, ArrowLeft, RefreshCw, Calendar, Lightbulb
} from "lucide-react";

/* =========================
   CONSTANTS & HELPERS
   ========================= */
const SPRING = { type: "spring", stiffness: 300, damping: 30 };
const API_SETS = "https://api.studentkrd.com/api/v1/exam-sets";
const API_QUESTIONS = "https://api.studentkrd.com/api/v1/exam-questions";

// LocalStorage keys
const LS_CACHE_SETS = "examquiz:cache:sets";       // { ts, data: [] }
const LS_STATE = "examquiz:state";                 // last in-progress attempt
const LS_STATS = "examquiz:stats";                 // exam-id → {best, attempts, lastPct, lastAt}

const streamLabel = (s) => ({ scientific: "زانستی", literary: "ئەدەبی", both: "هاوبەش" }[(s || "").toLowerCase()] || s || "");
const termLabel   = (t) => (t === "term2" ? "خولی ٢" : t === "term1" ? "خولی ١" : t || "");
const kindLabel   = (k) => (k === "national" ? "نیشتمانی" : k || "");
const letterToIndex = (ch) => ({ A: 1, B: 2, C: 3, D: 4 }[(ch || "").toUpperCase()] || 1);

function useLocalAppearance() {
  const [accent] = useState("#06b6d4");
  const [fontScale] = useState(1);
  const [reduced] = useState("off");

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
    document.documentElement.style.setProperty("--font-scale", String(fontScale));
  }, [accent, fontScale]);

  return { accent, fontScale, reduced };
}

function saveJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
function loadJSON(key, fallback=null) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}

/** Fetch all pages (Laravel pagination friendly) with caching */
async function fetchAllPagesWithCache(baseUrl, params = {}, cacheKey = null, cacheSeconds = 60) {
  // try cache
  if (cacheKey) {
    const cached = loadJSON(cacheKey, null);
    if (cached && (Date.now() - cached.ts) / 1000 < cacheSeconds) {
      return cached.data || [];
    }
  }
  // network
  const sp = new URLSearchParams({ per_page: "50", ...params });
  let url = `${baseUrl}?${sp.toString()}`;
  let out = [];
  for (;;) {
    const r = await fetch(url, { credentials: "include" }).catch(() => null);
    if (!r || !r.ok) throw new Error("Network error");
    const j = await r.json();
    const pageData = Array.isArray(j?.data) ? j.data : (Array.isArray(j) ? j : []);
    out = out.concat(pageData);
    if (!j?.next_page_url) break;
    url = j.next_page_url;
  }
  if (cacheKey) saveJSON(cacheKey, { ts: Date.now(), data: out });
  return out;
}

/** Normalize a question row to the first-design shape */
function normalizeQuestion(row, i) {
  const safe = (v) => (v == null ? "" : String(v));
  const hasABCD = row.option_a || row.option_b || row.option_c || row.option_d;

  let option_a = safe(row.option_a), option_b = safe(row.option_b),
      option_c = safe(row.option_c), option_d = safe(row.option_d);
  let correct_option = row.correct_option;

  if (!hasABCD && Array.isArray(row.options)) {
    option_a = safe(row.options[0]);
    option_b = safe(row.options[1]);
    option_c = safe(row.options[2]);
    option_d = safe(row.options[3]);
    if (!correct_option && Number.isFinite(row.correct_index)) {
      correct_option = ["A","B","C","D"][Math.max(1, Math.min(4, row.correct_index)) - 1];
    }
  }

  return {
    id: row.id ?? `q${i + 1}`,
    question: safe(row.question),
    option_a, option_b, option_c, option_d,
    correct_option: (correct_option || "A").toUpperCase(),
    analysis: safe(row.analysis),
    image_url: row.image_url || null,
    position: row.position ?? i + 1,
  };
}

/* =========================
   MAIN PAGE
   ========================= */
export default function ExamQuiz() {
  const { fontScale, accent, reduced } = useLocalAppearance();

  // Views: dashboard | subjects | exams | quiz | result
  const [view, setView] = useState("dashboard");

  // Data lists
  const [allSets, setAllSets] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [examsForSubject, setExamsForSubject] = useState([]);

  // Selections
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);

  // Options
  const [mode, setMode] = useState("exam"); // exam | practice
  const [duration, setDuration] = useState(45); // minutes

  // Quiz state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Stats (level-like data): best score & attempts per exam
  const [stats, setStats] = useState(() => loadJSON(LS_STATS, {})); // examId -> {best, attempts, lastPct, lastAt}

  // Load sets (with cache; fallback to cached if network fails)
  useEffect(() => {
    let alive = true;
    setLoading(true); setErr("");
    (async () => {
      try {
        const rows = await fetchAllPagesWithCache(API_SETS, {}, LS_CACHE_SETS, 90);
        if (!alive) return;

        setAllSets(rows);

        // Build subjects list from sets
        const bySub = new Map();
        rows.forEach((r) => {
          const sid = r.subject_id;
          const sname = r.subject?.name || "";
          if (!bySub.has(sid)) {
            bySub.set(sid, {
              id: sid, name: sname, count: 0,
              streams: new Set(), years: new Set(),
              minGrade: r.grade ?? null, maxGrade: r.grade ?? null
            });
          }
          const ent = bySub.get(sid);
          ent.count++;
          if (r.stream) ent.streams.add(r.stream);
          if (Number.isFinite(r.year)) ent.years.add(r.year);
          if (Number.isFinite(r.grade)) {
            ent.minGrade = ent.minGrade == null ? r.grade : Math.min(ent.minGrade, r.grade);
            ent.maxGrade = ent.maxGrade == null ? r.grade : Math.max(ent.maxGrade, r.grade);
          }
        });
        const subjectsArr = [...bySub.values()]
          .map(s => ({
            ...s,
            streams: [...s.streams],
            years: [...s.years].sort((a,b) => b - a)
          }))
          .sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name));
        setSubjects(subjectsArr);

        // Auto-resume if saved state exists
        const saved = loadJSON(LS_STATE, null);
        if (saved?.exam && Array.isArray(saved.questions)) {
          setSelectedSubject(subjectsArr.find(s => String(s.id) === String(saved.exam.subject_id)) || null);
          setSelectedExam(saved.exam);
          setQuestions(saved.questions);
          setAnswers(saved.answers || {});
          setCurrentIndex(saved.currentIndex || 0);
          setTimeLeft(saved.timeLeft ?? 45 * 60);
          setIsRunning(false); // paused when restoring
          setShowAnswers(false);
          setView("quiz");
        }
      } catch (e) {
        if (!alive) return;
        // try cached if fetch failed
        const cached = loadJSON(LS_CACHE_SETS, null);
        if (cached?.data?.length) {
          setAllSets(cached.data);
          // subjects from cache
          const bySub = new Map();
          cached.data.forEach((r) => {
            const sid = r.subject_id;
            const sname = r.subject?.name || "";
            if (!bySub.has(sid)) {
              bySub.set(sid, { id: sid, name: sname, count: 0, streams: new Set(), years: new Set(), minGrade: r.grade ?? null, maxGrade: r.grade ?? null });
            }
            const ent = bySub.get(sid);
            ent.count++;
            if (r.stream) ent.streams.add(r.stream);
            if (Number.isFinite(r.year)) ent.years.add(r.year);
            if (Number.isFinite(r.grade)) {
              ent.minGrade = ent.minGrade == null ? r.grade : Math.min(ent.minGrade, r.grade);
              ent.maxGrade = ent.maxGrade == null ? r.grade : Math.max(ent.maxGrade, r.grade);
            }
          });
          const subjectsArr = [...bySub.values()].map(s => ({ ...s, streams: [...s.streams], years: [...s.years].sort((a,b)=>b-a) }));
          setSubjects(subjectsArr);
        } else {
          setErr("نەتوانرا زانیاریەکان هێنابخرێت.");
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Build exams for selected subject
  useEffect(() => {
    if (!selectedSubject) { setExamsForSubject([]); return; }
    const list = allSets.filter(r => String(r.subject_id) === String(selectedSubject.id));
    const sorted = list.slice().sort((a, b) => {
      const y = (b.year || 0) - (a.year || 0); if (y !== 0) return y;
      const tOrder = { term2: 2, term1: 1, "": 0 };
      const t = (tOrder[b.term] || 0) - (tOrder[a.term] || 0); if (t !== 0) return t;
      const k = (b.kind === "national") - (a.kind === "national"); if (k !== 0) return k;
      return (b.id || 0) - (a.id || 0);
    });
    setExamsForSubject(sorted);
  }, [selectedSubject, allSets]);

  // Timer
  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setView("result");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Autosave quiz state
  useEffect(() => {
    if (view !== "quiz") return;
    const payload = {
      exam: selectedExam,
      questions,
      answers,
      currentIndex,
      timeLeft,
      mode,
      ts: Date.now(),
    };
    saveJSON(LS_STATE, payload);
  }, [view, selectedExam, questions, answers, currentIndex, timeLeft, mode]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${String(m).padStart(2,"0")}:${String(ss).padStart(2,"0")}`;
  };

  const currentQuestion = questions[currentIndex];

  // Start quiz with API questions
  const startQuiz = async (examRow, selectedMode, minutes) => {
    try {
      setLoading(true); setErr("");
      setSelectedExam(examRow);
      setMode(selectedMode);
      setTimeLeft(Math.max(1, Number(minutes || 45)) * 60);
      setAnswers({}); setCurrentIndex(0); setShowAnswers(false);

      const rows = await fetchAllPagesWithCache(API_QUESTIONS, { exam_set_id: String(examRow.id) }, null, 0);
      const list = rows.map(normalizeQuestion);
      if (!list.length) throw new Error("No questions returned.");

      setQuestions(list);
      setIsRunning(true);
      setView("quiz");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setErr("نەتوانرا پرسیارەکان دابەزێندرێت.");
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = () => {
    setIsRunning(false);
    setView("result");

    // update level stats
    if (selectedExam && questions.length) {
      const correct = questions.reduce((s, q) => s + (answers[q.id] === letterToIndex(q.correct_option) ? 1 : 0), 0);
      const pct = Math.round((correct / questions.length) * 100);
      const prev = loadJSON(LS_STATS, {});
      const cur = prev[String(selectedExam.id)] || { best: 0, attempts: 0, lastPct: 0, lastAt: 0 };
      const updated = {
        best: Math.max(cur.best || 0, pct),
        attempts: (cur.attempts || 0) + 1,
        lastPct: pct,
        lastAt: Date.now(),
        subject_id: selectedExam.subject_id,
        title: selectedExam.title,
      };
      const next = { ...prev, [String(selectedExam.id)]: updated };
      saveJSON(LS_STATS, next);
      setStats(next);
      // clear autosave so "resume" doesn't bring finished one
      saveJSON(LS_STATE, null);
    }
  };

  const score = useMemo(() => {
    const total = questions.length || 0;
    if (view !== "result" || total === 0) return { correct: 0, total: 0, percentage: 0 };
    const correct = questions.reduce((s, q) => s + (answers[q.id] === letterToIndex(q.correct_option) ? 1 : 0), 0);
    return { correct, total, percentage: Math.round((correct / total) * 100) };
  }, [view, questions, answers]);

  const resumeAvailable = !!loadJSON(LS_STATE, null)?.exam;

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#0b0b0c] text-white font-sans" // ✅ clean solid background, no artwork
      style={{ fontSize: `calc(1rem * ${fontScale})` }}
    >
      <div className="relative z-10">
        {err && (
          <div className="mx-auto max-w-7xl px-6 pt-4">
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 px-4 py-3 text-sm">{err}</div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {view === "dashboard" && (
            <Dashboard
              key="dashboard"
              subjects={subjects}
              stats={stats}
              onSelectSubject={(subject) => { setSelectedSubject(subject); setView("subjects"); }}
              onStartQuickQuiz={() => setView("subjects")}
              loading={loading}
            />
          )}

          {view === "subjects" && (
            <SubjectSelection
              key="subjects"
              subjects={subjects}
              selectedSubject={selectedSubject}
              onSelect={(subject) => { setSelectedSubject(subject); setView("exams"); }}
              onBack={() => setView("dashboard")}
            />
          )}

          {view === "exams" && (
            <ExamSelection
              key="exams"
              subject={selectedSubject}
              exams={examsForSubject.map(e => ({
                ...e,
                duration: Number.isFinite(e.duration) ? e.duration : Number.isFinite(e.time_minutes) ? e.time_minutes : 45,
                title: e.title || [e.subject?.name, e.year ? `${e.year}-${(e.year || 0) + 1}` : "", termLabel(e.term), kindLabel(e.kind)].filter(Boolean).join(" · "),
              }))}
              onBack={() => setView("subjects")}
              onStartQuiz={startQuiz}
              resumeAvailable={resumeAvailable}
              onResume={() => {
                const saved = loadJSON(LS_STATE, null);
                if (saved?.exam && Array.isArray(saved.questions)) {
                  setSelectedExam(saved.exam);
                  setQuestions(saved.questions);
                  setAnswers(saved.answers || {});
                  setCurrentIndex(saved.currentIndex || 0);
                  setTimeLeft(saved.timeLeft ?? 45 * 60);
                  setMode(saved.mode || "exam");
                  setIsRunning(false);
                  setShowAnswers(false);
                  setView("quiz");
                }
              }}
              onClearSaved={() => saveJSON(LS_STATE, null)}
              stats={stats}
            />
          )}

          {view === "quiz" && (
            <QuizInterface
              key="quiz"
              exam={selectedExam}
              question={currentQuestion}
              questionIndex={currentIndex}
              totalQuestions={questions.length}
              answers={answers}
              timeLeft={timeLeft}
              isRunning={isRunning}
              mode={mode}
              showAnswers={showAnswers}
              onAnswer={(questionId, answer) => setAnswers(prev => ({ ...prev, [questionId]: answer }))}
              onNext={() => setCurrentIndex(prev => Math.min(prev + 1, questions.length - 1))}
              onPrev={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
              onJumpTo={setCurrentIndex}
              onToggleTimer={() => setIsRunning(!isRunning)}
              onToggleAnswers={() => setShowAnswers(!showAnswers)}
              onSubmit={submitQuiz}
              questions={questions}
            />
          )}

          {view === "result" && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ResultView
                exam={selectedExam}
                score={score}
                onRetry={() => {
                  setView("dashboard");
                  setAnswers({});
                  setCurrentIndex(0);
                  setTimeLeft(45 * 60);
                  setIsRunning(false);
                  setShowAnswers(false);
                  setSelectedExam(null);
                  setQuestions([]);
                }}
              />
              {/* ✅ Full review with correct answers */}
              <ReviewList
                questions={questions}
                answers={answers}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        :root { --accent: ${accent}; }
        ${reduced === "on" ? `
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        ` : ''}
      `}</style>
    </div>
  );
}

/* =========================
   DASHBOARD
   ========================= */
function Dashboard({ subjects, stats, onSelectSubject, onStartQuickQuiz, loading }) {
  const totalExams = subjects.reduce((sum, s) => sum + s.count, 0);
  // Build recent activity from stats
  const recent = Object.entries(stats || {})
    .sort((a,b) => (b[1].lastAt || 0) - (a[1].lastAt || 0))
    .slice(0, 3)
    .map(([id, s]) => ({
      subject: s.title || "ئازمون",
      score: s.lastPct ?? 0,
      date: "تازە"
    }));

  const recentActivity = recent.length ? recent : [
    { subject: "ماتماتیک", score: 85, date: "نموونە" },
    { subject: "فیزیا",   score: 92, date: "نموونە" },
    { subject: "کیمیا",    score: 78, date: "نموونە" }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-600 mb-4">
            <Brain size={40} className="text-white" />
          </motion.div>

          <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            تاقیکردنەوەی زیرەک
          </motion.h1>

          <motion.p initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto">
            ئامادەکاری بۆ تاقیکردنەوەکانت بە شێوەیەکی زیرەک و کاریگەر
          </motion.p>
        </div>

        {/* Quick Stats */}
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 mb-4">
              <BookOpen size={24} className="text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">{loading ? "…" : subjects.length}</div>
            <div className="text-gray-300">بابەت</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 mb-4">
              <Target size={24} className="text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">{loading ? "…" : totalExams}</div>
            <div className="text-gray-300">تاقیکردنەوە</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 mb-4">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {Object.values(stats || {}).length ? Math.max(...Object.values(stats).map(s => s.best || 0)) + "%" : "—"}
            </div>
            <div className="text-gray-300">باشترین نرێژ</div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={onStartQuickQuiz}
            className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-8 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mb-4">
                <Zap size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">دەستپێکردنی خێرا</h3>
              <p className="text-blue-100">تاقیکردنەوەیەک هەڵبژێرە و دەست بکە</p>
              <div className="flex items-center mt-4 text-blue-100">
                <span className="text-sm">بڕۆ</span>
                <ArrowLeft size={16} className="mr-2" />
              </div>
            </div>
          </button>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 mb-4">
              <ListChecks size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">چالاکی دواییەکان</h3>
            <div className="space-y-3">
              {recentActivity.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">{item.subject}</div>
                    <div className="text-sm text-gray-400">{item.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{item.score}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Popular Subjects */}
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">بابەتە بەناوبانگەکان</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(subjects || []).slice(0, 6).map((subject, index) => (
              <motion.button
                key={subject.id}
                onClick={() => onSelectSubject(subject)}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-right hover:bg-white/15 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen size={20} className="text-white" />
                  </div>
                  <div className="text-sm text-gray-300">{subject.count} تاقیکردنەوە</div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{subject.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {subject.streams.map(stream => (
                    <span key={stream} className="px-2 py-1 rounded-lg bg-white/10 text-xs text-gray-300">
                      {streamLabel(stream)}
                    </span>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* =========================
   SUBJECTS
   ========================= */
function SubjectSelection({ subjects, onSelect, onBack }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSubjects = (subjects || []).filter(subject =>
    String(subject.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">هەڵبژاردنی بابەت</h1>
            <p className="text-gray-300">بابەتێک هەڵبژێرە بۆ دەستپێکردنی تاقیکردنەوە</p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-colors"
          >
            <ArrowRight size={16} />
            گەڕانەوە
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="گەڕان لە بابەتەکان..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-12 pl-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subject, index) => (
            <motion.button
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(subject)}
              className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-right hover:from-white/20 hover:to-white/10 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen size={28} className="text-white" />
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-300 mb-1">تاقیکردنەوە</div>
                  <div className="text-2xl font-bold text-white">{subject.count}</div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-4">{subject.name}</h3>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {subject.streams.map(stream => (
                    <span key={stream} className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-sm">
                      {streamLabel(stream)}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-300">
                  {subject.minGrade != null && subject.maxGrade != null ? (
                    <span>پۆل {subject.minGrade}-{subject.maxGrade}</span>
                  ) : <span />}
                  {subject.years?.length ? (
                    <span>{subject.years[0]}-{subject.years[0] + 1}</span>
                  ) : <span />}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* =========================
   EXAMS
   ========================= */
function ExamSelection({ subject, exams, onBack, onStartQuiz, resumeAvailable, onResume, onClearSaved, stats }) {
  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id);
  const [mode, setMode] = useState("exam");
  const [minutes, setMinutes] = useState(exams[0]?.duration || 45);

  useEffect(() => {
    setSelectedExamId(exams[0]?.id);
    setMinutes(exams[0]?.duration || 45);
  }, [exams]);

  const selectedExam = exams.find(e => e.id === selectedExamId);
  const myStat = selectedExam ? stats?.[String(selectedExam.id)] : null;

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{subject?.name}</h1>
            <p className="text-gray-300">تاقیکردنەوەیەک هەڵبژێرە بۆ دەستپێکردن</p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-colors"
          >
            <ArrowRight size={16} />
            گەڕانەوە
          </button>
        </div>

        {/* Resume banner */}
        {resumeAvailable && (
          <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-100 p-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <div className="flex-1 text-sm">هەوڵێکی پێشوو هەیە. دەتەوێت بەردەوام بیت؟</div>
            <button onClick={onResume} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm">بەردەوام‌بە</button>
            <button onClick={onClearSaved} className="px-3 py-1.5 rounded-lg bg-white/10 text-emerald-100 text-sm">سڕینەوە</button>
          </div>
        )}

        {/* Start Options */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">ڕێکخستنەکانی تاقیکردنەوە</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">جۆری تاقیکردنەوە</label>
              <div className="space-y-2">
                <label className={`flex items-center p-3 rounded-xl bg-white/5 border ${mode === 'exam' ? 'border-cyan-500' : 'border-white/10'} cursor-pointer hover:bg-white/10 transition-colors`}>
                  <input
                    type="radio"
                    name="mode"
                    value="exam"
                    checked={mode === "exam"}
                    onChange={() => setMode("exam")}
                    className="text-cyan-500 mr-3"
                  />
                  <div>
                    <div className="text-white font-medium">ئازمونی فەرمی</div>
                    <div className="text-sm text-gray-300">وەڵامەکان تا کۆتایی نیشان نادرێن</div>
                  </div>
                </label>

                <label className={`flex items-center p-3 rounded-xl bg-white/5 border ${mode === 'practice' ? 'border-cyan-500' : 'border-white/10'} cursor-pointer hover:bg-white/10 transition-colors`}>
                  <input
                    type="radio"
                    name="mode"
                    value="practice"
                    checked={mode === "practice"}
                    onChange={() => setMode("practice")}
                    className="text-cyan-500 mr-3"
                  />
                  <div>
                    <div className="text-white font-medium">ڕاهێنانی زیرەک</div>
                    <div className="text-sm text-gray-300">دەتوانیت وەڵامت بگۆڕیت و شی کردنەوە ببینیت</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Duration selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">کاتی تاقیکردنەوە (خولەک)</label>
              <input
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(Math.max(1, Number(e.target.value || 45)))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                min="1"
              />
              {myStat && (
                <div className="mt-2 text-xs text-gray-300">
                  هەوڵەکان: {myStat.attempts || 0} — باشترین: {myStat.best || 0}%
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              disabled={!selectedExam}
              onClick={() => onStartQuiz(selectedExam, mode, minutes)}
              className="px-6 py-3 rounded-xl bg-cyan-500 text-white font-bold text-lg hover:bg-cyan-600 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              دەستپێکردن <ArrowLeft size={20} />
            </button>
          </div>
        </div>

        {/* Exams List */}
        <h2 className="text-2xl font-bold text-white mb-6">لیستی تاقیکردنەوەکان</h2>
        <div className="space-y-4">
          {exams.map(exam => {
            const st = stats?.[String(exam.id)];
            return (
              <motion.div
                key={exam.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                onClick={() => { setSelectedExamId(exam.id); setMinutes(exam.duration || 45); }}
                className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300
                  ${selectedExamId === exam.id ? 'bg-cyan-500/20 border border-cyan-500/50' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
              >
                <div>
                  <h3 className="text-lg font-semibold text-white">{exam.title}</h3>
                  <div className="text-sm text-gray-300 flex items-center gap-4 mt-1">
                    {Number.isFinite(exam.year) && (
                      <span className="flex items-center gap-1">
                        <Calendar size={14} className="text-cyan-400" />
                        {exam.year}
                      </span>
                    )}
                    {exam.kind && (
                      <span className="flex items-center gap-1">
                        <ListChecks size={14} className="text-cyan-400" />
                        {kindLabel(exam.kind)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock size={14} className="text-cyan-400" />
                      {(exam.duration || 45)} خولەک
                    </span>
                    {st && (
                      <span className="flex items-center gap-1">
                        <Award size={14} className="text-emerald-400" />
                        {st.best}% باشترین
                      </span>
                    )}
                  </div>
                </div>
                <ChevronLeft size={24} className="text-white" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* =========================
   QUIZ
   ========================= */
function QuizInterface({
  exam, question, questionIndex, totalQuestions, answers, timeLeft, isRunning,
  mode, showAnswers, onAnswer, onNext, onPrev, onJumpTo,
  onToggleTimer, onToggleAnswers, onSubmit, questions
}) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getOptionClass = (idx, q) => {
    if (!q) return "bg-white/5 border-white/10 text-white hover:bg-white/10";
    const picked = answers[q.id];
    const isSelected = picked === idx;
    const isCorrectOption = idx === letterToIndex(q.correct_option);

    if ((mode === 'practice' && showAnswers)) {
      if (isCorrectOption) return 'bg-green-500/20 border-green-500/50 text-green-200';
      if (isSelected && !isCorrectOption) return 'bg-red-500/20 border-red-500/50 text-red-200';
    }
    if (isSelected) return 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200';
    return 'bg-white/5 border-white/10 text-white hover:bg-white/10';
  };

  const opts = useMemo(() => {
    if (!question) return [];
    return [
      { key: "A", text: question.option_a },
      { key: "B", text: question.option_b },
      { key: "C", text: question.option_c },
      { key: "D", text: question.option_d },
    ].filter(o => o.text != null && o.text !== "");
  }, [question]);

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">{exam?.title}</h1>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-sm">
              {mode === 'exam' ? 'ئازمونی فەرمی' : 'ڕاهێنانی زیرەک'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white/70">
              <Clock size={20} />
              <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
            </div>
            <button onClick={onToggleTimer} className="p-2 rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-colors">
              {isRunning ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button onClick={onSubmit} className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors">
              کۆتایی
            </button>
          </div>
        </div>

        {/* Quiz Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Question Area */}
          <div className="lg:col-span-2">
            <motion.div
              key={question?.id || "noq"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SPRING}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6 space-y-6"
            >
              <div className="flex items-center justify-between text-gray-300 text-lg">
                <span className="font-bold text-white">پرسیار {questionIndex + 1} لە {totalQuestions}</span>
                {question && <span className="text-sm">پرسیاری: {question.id}</span>}
              </div>

              {question?.image_url && (
                <a href={question.image_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs text-emerald-300 hover:underline">
                  <Download className="w-4 h-4" /> داگرتنی وێنە
                </a>
              )}

              <p className="text-xl md:text-2xl text-white font-medium leading-relaxed">{question?.question}</p>

              <div className="space-y-3">
                {opts.map((opt, i) => {
                  const idx = i + 1;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => question && onAnswer(question.id, idx)}
                      className={`flex items-center w-full text-right p-4 rounded-xl transition-colors duration-200 ${getOptionClass(idx, question)}`}
                    >
                      <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 ml-4 font-bold">
                        {opt.key}
                      </span>
                      <span className="text-right flex-grow">{opt.text}</span>
                      {mode === 'practice' && showAnswers && question && (
                        <div className="mr-auto">
                          {idx === letterToIndex(question.correct_option) && <CheckCircle2 size={24} className="text-green-400" />}
                          {answers[question.id] === idx && idx !== letterToIndex(question.correct_option) && <XCircle size={24} className="text-red-400" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Analysis Section (practice mode) */}
            {mode === 'practice' && showAnswers && question?.analysis && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white/10 backdrop-blur-sm border border-green-500/50 rounded-2xl p-6 mt-4 space-y-4">
                <div className="flex items-center gap-3 text-green-400">
                  <Lightbulb size={24} />
                  <h3 className="text-xl font-bold">شیکار</h3>
                </div>
                <p className="text-white leading-relaxed">{question.analysis}</p>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={onPrev}
                disabled={questionIndex === 0}
                className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ArrowRight size={20} />
                پێشوو
              </button>
              <div className="flex items-center gap-4">
                {mode === 'practice' && (
                  <button
                    onClick={onToggleAnswers}
                    className="px-4 py-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-colors flex items-center gap-2"
                  >
                    {showAnswers ? <EyeOff size={18} /> : <Eye size={18} />}
                    {showAnswers ? 'شیکار بشارەوە' : 'شیکار ببینە'}
                  </button>
                )}
                <button
                  onClick={onNext}
                  disabled={questionIndex === totalQuestions - 1}
                  className="px-6 py-3 rounded-xl bg-cyan-500 text-white font-bold hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  دواتر
                  <ArrowLeft size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">پوختەی پرسیارەکان</h3>
              <div className="flex flex-wrap gap-2">
                {questions.map((q, index) => {
                  const isAnswered = Object.prototype.hasOwnProperty.call(answers, q.id);
                  const isCurrent = index === questionIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => onJumpTo(index)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200
                        ${isCurrent ? 'bg-cyan-500/80 text-white ring-2 ring-cyan-400 ring-offset-2 ring-offset-neutral-900' :
                          isAnswered ? 'bg-green-500/40 text-green-100 hover:bg-green-500/50' :
                            'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================
   RESULT
   ========================= */
function ResultView({ exam, score, onRetry }) {
  const { correct, total, percentage } = score;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
      className="min-h-[50vh] p-6 flex flex-col items-center justify-center text-center">
      <div className="max-w-xl mx-auto space-y-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 md:p-12">
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-600">
          <Trophy size={48} className="text-white" />
        </motion.div>
        <div className="text-4xl md:text-5xl font-bold text-white">ئەنجامەکانت</div>
        <div className="text-xl text-gray-300">{exam?.title}</div>
        <div className="text-7xl md:text-8xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          {percentage}%
        </div>
        <div className="flex items-center justify-center gap-8 text-gray-300 font-medium text-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={24} className="text-green-400" />
            <span>{correct} وەڵامی دروست</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle size={24} className="text-red-400" />
            <span>{total - correct} وەڵامی هەڵە</span>
          </div>
        </div>
        <button
          onClick={onRetry}
          className="px-8 py-4 rounded-full bg-cyan-500 text-white font-bold text-lg hover:bg-cyan-600 transition-colors mt-2 flex items-center justify-center gap-2 mx-auto"
        >
          تاقیکردنەوەیەکی تر بکە
          <RefreshCw size={20} />
        </button>
      </div>
    </motion.div>
  );
}

/* =========================
   REVIEW (correct answers visible)
   ========================= */
function ReviewList({ questions, answers }) {
  return (
    <div className="max-w-5xl mx-auto px-6 pb-12">
      <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-6 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-xl">
          <ListChecks className="text-emerald-300" /> پێداچوونەوەی وەڵامەکان
        </div>
        <div className="space-y-4">
          {questions.map((q, i) => {
            const picked = answers[q.id];
            const correctIndex = letterToIndex(q.correct_option);
            const ok = picked === correctIndex;
            const opts = [q.option_a, q.option_b, q.option_c, q.option_d];
            return (
              <div key={q.id} className="rounded-xl border border-white/10 overflow-hidden">
                <div className="p-4 bg-white/5 flex items-start gap-3">
                  <div className={`mt-0.5 rounded-full w-6 h-6 grid place-items-center shrink-0 ${ok ? "bg-emerald-600/80" : "bg-rose-600/80"}`}>
                    {ok ? <CheckCircle2 size={16} className="text-white" /> : <XCircle size={16} className="text-white" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="text-white font-semibold">{i + 1}. {q.question}</div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-600/20 text-emerald-100 border border-emerald-500/30">وەڵامی راست: {["A","B","C","D"][correctIndex-1]}</span>
                      <span className={`px-2 py-0.5 rounded-lg border ${ok ? "bg-emerald-500/15 text-emerald-100 border-emerald-400/30" : "bg-rose-500/15 text-rose-100 border-rose-400/30"}`}>
                        وەڵامی تۆ: {picked ? ["A","B","C","D"][picked-1] : "هیچ"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-3 grid gap-1.5 bg-black/30">
                  {opts.map((txt, k) => {
                    const num = k + 1;
                    const isCorrect = num === correctIndex;
                    const isPicked = num === picked;
                    const cls = isCorrect ? "bg-emerald-600/15 border-emerald-500/30 text-emerald-100" : isPicked ? "bg-rose-600/15 border-rose-500/30 text-rose-100" : "bg-white/5 border-white/10 text-zinc-200";
                    const letter = ['A','B','C','D'][k];
                    return (
                      <div key={k} className={`rounded-lg border px-3 py-1.5 ${cls}`}>
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-white/10 border border-white/10 font-bold text-xs">{letter}</span>
                        <span className="mr-2">{txt}</span>
                      </div>
                    );
                  })}
                  {q.analysis && (
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-zinc-200">
                      <div className="flex items-center gap-2 font-bold text-white"><Info className="w-4 h-4 text-emerald-300" /> شی کردنەوە</div>
                      <div className="mt-1">{q.analysis}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
