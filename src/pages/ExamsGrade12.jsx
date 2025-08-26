// ExamsGrade12Pro.jsx — Kurdish-first, RTL, stylish exam flow with history
// - Full Kurdish UI labels
// - RTL, better Arabic-script font
// - Hero header, analysis, share modal, history integration
// - LocalStorage for progress + historical results

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Filter,
  LogOut,
  ListChecks,
  Download,
  Upload,
  Volume2,
  BookOpen,
  BarChart3,
  Share2,
  NotebookPen,
  Clipboard,
  Info,
  History,
} from "lucide-react";

import HistoricalResultsPage from "./../components/HistoricalResultsPage";

// ---------------- Demo Data ----------------
const subjects = ["بیركاری", "فیزیا", "کیمیا", "ئینگلیزی", "کوردی"];
const tracks = ["زانستی", "ئەدەبی"];
const difficulties = ["ئاسان", "مامناوەند", "سخت"];

const examsData = [
  {
    id: "math-exam-1",
    subject: "بیركاری",
    track: "زانستی",
    title: "تاقیکردنەوەی بیركاری - بەشی یەکەم",
    questions: [
      {
        id: "m1q1",
        questionText: 'ئەم هاوکێشەیە شیکار بکە: $2x + 5 = 15$',
        options: ["x = 5", "x = 10", "x = 2.5", "x = 7.5"],
        correctAnswer: "x = 5",
        explanation:
          "بۆ شیکارکردن: 5 لە هەردوو لای دەکەمەوە → 2x=10 → بەشکردن بە 2 → x=5.",
        image: "https://placehold.co/640x320/50b2ed/ffffff?text=Q1+Math",
        hint: "سەرهەڵدان: کەمکردنەوەی ٥ له‌ هه‌ردوو لای",
        difficulty: "ئاسان",
      },
      {
        id: "m1q2",
        questionText: "چوارگۆشەی ژمارە 9 چەندە؟",
        options: ["18", "36", "81", "90"],
        correctAnswer: "81",
        explanation: "٩ × ٩ = ٨١.",
        image: "https://placehold.co/640x320/50b2ed/ffffff?text=Q2+Math",
        hint: "x^2 واتە x جارەکەی خۆی.",
        difficulty: "ئاسان",
      },
      {
        id: "m1q3",
        questionText:
          "کاتێک دوو ژمارە کۆ دەبن 10، یەکێکیان 4 بێت ئەوی تر چەندە؟",
        options: ["4", "6", "14", "7"],
        correctAnswer: "6",
        explanation: "١٠ - ٤ = ٦.",
        image: "https://placehold.co/640x320/50b2ed/ffffff?text=Q3+Math",
        hint: "ناوەندەکە کم بکە لە ١٠.",
        difficulty: "ئاسان",
      },
      {
        id: "m1q4",
        questionText:
          "ڕووبەری بازنەیەک کە نیوەتیرەکەی 7 (π = 22/7) چەندە؟",
        options: ["154", "49", "22", "14"],
        correctAnswer: "154",
        explanation: "A = πr² → (22/7)×49 = 154.",
        image: "https://placehold.co/640x320/50b2ed/ffffff?text=Q4+Math",
        hint: "r²=49.",
        difficulty: "مامناوەند",
      },
      {
        id: "m1q5",
        questionText: "کۆی گۆشەکانی سێگۆشە چەند پلەیە؟",
        options: ["90", "180", "270", "360"],
        correctAnswer: "180",
        explanation: "هەمیشە ١٨٠ پلە.",
        image: "https://placehold.co/640x320/50b2ed/ffffff?text=Q5+Math",
        hint: "یاسای ناوەوەی سێگۆشە.",
        difficulty: "ئاسان",
      },
    ],
  },
  {
    id: "physics-exam-1",
    subject: "فیزیا",
    track: "زانستی",
    title: "تاقیکردنەوەی فیزیا - بەشی یەکەم",
    questions: [
      {
        id: "p1q1",
        questionText: "کام یەکەی هێزە؟",
        options: ["جول", "وات", "نیوتن", "پاسکال"],
        correctAnswer: "نیوتن",
        explanation: "یەکەی SI بۆ هێز نیوتنە.",
        image: "https://placehold.co/640x320/ef4444/ffffff?text=Q1+Physics",
        hint: "N=kg·m/s².",
        difficulty: "مامناوەند",
      },
      {
        id: "p1q2",
        questionText: "یاسای دووەمی نیوتن؟",
        options: ["E=mc²", "F=ma", "V=IR", "P=IV"],
        correctAnswer: "F=ma",
        explanation: "پەیوەندی هێز، بارستایی، خێرایی.",
        image: "https://placehold.co/640x320/ef4444/ffffff?text=Q2+Physics",
        hint: "F=ma هەموو جاران.",
        difficulty: "ئاسان",
      },
    ],
  },
];

// ------------- helpers & constants -------------
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const lsKey = "exams_g12_state_v1";
const lsKeyResults = "exams_g12_historical_results_v1";

// better Arabic-script font stack for Kurdish
const kuFont = "font-['Noto_Naskh_Arabic','Inter',system-ui,sans-serif]";

// clipboard helper
const copyToClipboard = (text) => {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(
      () => alert("کۆپی کرا بۆ کلیپبۆرد!"),
      () => fallback()
    );
  } else fallback();

  function fallback() {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      alert("کۆپی کرا (یاریەک)!");
    } catch {
      alert("نەتوانرا کۆپی بکرێت.");
    }
    document.body.removeChild(ta);
  }
};

export default function ExamsGrade12Pro() {
  // navigation
  const [currentView, setCurrentView] = useState("examPicker"); // examPicker | activeExam | resultsView | historyList
  const [lastViewWasHistory, setLastViewWasHistory] = useState(false);

  // filters
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [mode, setMode] = useState("practice"); // practice | exam

  // exam state
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState({});
  const [hintsUsed, setHintsUsed] = useState({});
  const [perQSeconds, setPerQSeconds] = useState({});
  const [activeQ, setActiveQ] = useState(null);

  // results/review
  const [showResults, setShowResults] = useState(false);
  const [showAllExplanations, setShowAllExplanations] = useState(false);
  const [showWrongOnly, setShowWrongOnly] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // timers
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [manualMinutes, setManualMinutes] = useState("");
  const tickRef = useRef(null);

  // history
  const [historicalResults, setHistoricalResults] = useState([]);

  // TTS
  const speak = (text) => {
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ku-IQ";
      synth.cancel();
      synth.speak(u);
    } catch {}
  };

  // derived lists
  const filteredExams = useMemo(() => {
    let list = examsData.filter(
      (e) =>
        (!selectedSubject || e.subject === selectedSubject) &&
        (!selectedTrack || e.track === selectedTrack)
    );
    if (difficultyFilter) {
      list = list
        .map((ex) => ({
          ...ex,
          questions: ex.questions.filter((q) => q.difficulty === difficultyFilter),
        }))
        .filter((ex) => ex.questions.length > 0);
    }
    return list;
  }, [selectedSubject, selectedTrack, difficultyFilter]);

  // detailed score
  const detailedScore = useMemo(() => {
    if (!exam || !questions.length)
      return {
        correct: 0,
        incorrect: 0,
        unanswered: 0,
        total: 0,
        timeSpent: 0,
        percentage: 0,
      };

    let correct = 0;
    let incorrect = 0;
    let answeredCount = 0;
    let totalTimeSpent = 0;

    for (const q of questions) {
      totalTimeSpent += perQSeconds[q.id] || 0;
      if (answers[q.id] !== undefined && answers[q.id] !== null) {
        answeredCount++;
        if (answers[q.id] === q.correctAnswer) correct++;
        else incorrect++;
      }
    }
    const percentage =
      questions.length > 0 ? ((correct / questions.length) * 100).toFixed(0) : 0;

    return {
      correct,
      incorrect,
      unanswered: questions.length - answeredCount,
      total: questions.length,
      timeSpent: totalTimeSpent,
      percentage,
    };
  }, [exam, questions, answers, perQSeconds]);

  // --- Local Storage Management ---
  useEffect(() => {
    const rawProgress = localStorage.getItem(lsKey);
    if (rawProgress) {
      try {
        const s = JSON.parse(rawProgress);
        if (s && s.exam) {
          setExam(s.exam);
          setQuestions(s.questions || []);
          setAnswers(s.answers || {});
          setNotes(s.notes || {});
          setHintsUsed(s.hintsUsed || {});
          setPerQSeconds(s.perQSeconds || {});
          setActiveQ(s.activeQ || null);
          setMode(s.mode || "practice");
          setShowResults(s.showResults || false);
          setShowAllExplanations(s.showAllExplanations || false);
          setSeconds(s.seconds || 0);
          setRunning(s.running || false);
          setShowWrongOnly(s.showWrongOnly || false);
          setCurrentView(s.currentView || "examPicker");
          setLastViewWasHistory(s.lastViewWasHistory || false);
        }
      } catch (e) {
        console.error("Failed to load exam progress:", e);
      }
    }

    const rawResults = localStorage.getItem(lsKeyResults);
    if (rawResults) {
      try {
        setHistoricalResults(JSON.parse(rawResults));
      } catch (e) {
        console.error("Failed to parse historical results:", e);
      }
    }
  }, []);

  useEffect(() => {
    const s = {
      exam,
      questions,
      answers,
      notes,
      hintsUsed,
      perQSeconds,
      activeQ,
      mode,
      showResults,
      showAllExplanations,
      seconds,
      running,
      showWrongOnly,
      currentView,
      lastViewWasHistory,
    };
    localStorage.setItem(lsKey, JSON.stringify(s));
  }, [
    exam,
    questions,
    answers,
    notes,
    hintsUsed,
    perQSeconds,
    activeQ,
    mode,
    showResults,
    showAllExplanations,
    seconds,
    running,
    showWrongOnly,
    currentView,
    lastViewWasHistory,
  ]);

  useEffect(() => {
    localStorage.setItem(lsKeyResults, JSON.stringify(historicalResults));
  }, [historicalResults]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  };

  const submitAll = useCallback(() => {
    setRunning(false);
    if (
      currentView === "activeExam" ||
      (currentView === "resultsView" && !lastViewWasHistory)
    ) {
      const resultEntry = {
        id: exam.id + "-" + Date.now(),
        examId: exam.id,
        examTitle: exam.title,
        examSubject: exam.subject,
        examTrack: exam.track,
        answers: { ...answers },
        perQSeconds: { ...perQSeconds },
        notes: { ...notes },
        hintsUsed: { ...hintsUsed },
        detailedScore: { ...detailedScore },
        timestamp: Date.now(),
      };
      setHistoricalResults((prev) => [resultEntry, ...prev]);
    }

    setShowResults(true);
    setShowAllExplanations(false);
    setCurrentView("resultsView");
  }, [
    exam,
    answers,
    perQSeconds,
    notes,
    hintsUsed,
    detailedScore,
    currentView,
    lastViewWasHistory,
  ]);

  // global timer
  useEffect(() => {
    if (!running || seconds <= 0) {
      if (seconds === 0 && running) submitAll();
      return;
    }
    tickRef.current = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(tickRef.current);
  }, [running, seconds, submitAll]);

  // per-question timer
  useEffect(() => {
    if (!running || !activeQ) return;
    const t = setInterval(() => {
      setPerQSeconds((prev) => ({
        ...prev,
        [activeQ]: (prev[activeQ] || 0) + 1,
      }));
    }, 1000);
    return () => clearInterval(t);
  }, [running, activeQ]);

  // start exam
  const startExam = useCallback(
    (ex) => {
      let qs = ex.questions;
      if (difficultyFilter)
        qs = qs.filter((q) => q.difficulty === difficultyFilter);
      qs = qs.map((q) => ({ ...q, shuffledOptions: shuffle(q.options) }));
      setExam(ex);
      setQuestions(qs);
      setAnswers({});
      setNotes({});
      setHintsUsed({});
      setPerQSeconds({});
      setActiveQ(qs[0]?.id || null);
      setShowResults(false);
      setShowAllExplanations(false);
      setShowWrongOnly(false);

      const secs = manualMinutes.trim()
        ? Math.max(1, parseInt(manualMinutes, 10)) * 60
        : qs.length * 60;
      setSeconds(secs);
      setRunning(true);
      setCurrentView("activeExam");
      setLastViewWasHistory(false);
    },
    [manualMinutes, difficultyFilter]
  );

  // exit exam
  const exitExam = useCallback(() => {
    setExam(null);
    setQuestions([]);
    setAnswers({});
    setNotes({});
    setHintsUsed({});
    setPerQSeconds({});
    setActiveQ(null);
    setShowResults(false);
    setShowAllExplanations(false);
    setRunning(false);
    setSeconds(0);
    setShowWrongOnly(false);
    setCurrentView("examPicker");
    setLastViewWasHistory(false);
  }, []);

  // events
  const choose = (qid, option) => {
    setAnswers((a) => ({ ...a, [qid]: option }));
    setActiveQ(qid);
  };
  const toggleHint = (qid) => setHintsUsed((h) => ({ ...h, [qid]: !h[qid] }));
  const changeNote = (qid, text) => setNotes((n) => ({ ...n, [qid]: text }));

  // history logic
  const goToHistoryList = useCallback(() => {
    setExam(null);
    setQuestions([]);
    setAnswers({});
    setPerQSeconds({});
    setNotes({});
    setHintsUsed({});
    setActiveQ(null);
    setShowResults(false);
    setShowAllExplanations(false);
    setShowWrongOnly(false);
    setRunning(false);
    setSeconds(0);
    setCurrentView("historyList");
    setLastViewWasHistory(true);
  }, []);

  const viewHistoricalResult = useCallback((result) => {
    const originalExam = examsData.find((e) => e.id === result.examId);
    if (!originalExam) {
      alert("تاقیکردنەوەکە نەدۆزرایەوە (سڕاوە).");
      return;
    }
    const qs = originalExam.questions.map((q) => ({
      ...q,
      shuffledOptions: shuffle(q.options),
    }));
    setExam(originalExam);
    setQuestions(qs);
    setAnswers(result.answers);
    setPerQSeconds(result.perQSeconds || {});
    setNotes(result.notes || {});
    setHintsUsed(result.hintsUsed || {});
    setMode("exam");
    setShowResults(true);
    setShowAllExplanations(false);
    setShowWrongOnly(false);
    setRunning(false);
    setSeconds(0);
    setCurrentView("resultsView");
    setLastViewWasHistory(true);
  }, []);

  const handleBackFromResults = useCallback(() => {
    if (lastViewWasHistory) goToHistoryList();
    else exitExam();
  }, [lastViewWasHistory, goToHistoryList, exitExam]);

  // analytics
  const totals = useMemo(() => {
    const byDiff = {
      "ئاسان": { c: 0, t: 0 },
      "مامناوەند": { c: 0, t: 0 },
      "سخت": { c: 0, t: 0 },
    };

    for (const q of questions) {
      const correct = answers[q.id] === q.correctAnswer;
      const d = q.difficulty || "مامناوەند";
      if (!byDiff[d]) byDiff[d] = { c: 0, t: 0 };
      byDiff[d].t++;
      if (correct) byDiff[d].c++;
    }

    const totalTime = Object.values(perQSeconds).reduce((a, b) => a + b, 0);
    const avgTimePerQuestion =
      questions.length > 0 ? Math.round(totalTime / questions.length) : 0;

    let timeOnIncorrect = 0;
    for (const q of questions) {
      if (answers[q.id] && answers[q.id] !== q.correctAnswer) {
        timeOnIncorrect += perQSeconds[q.id] || 0;
      }
    }

    return {
      byDiff,
      avgTimePerQuestion,
      totalExamTime: totalTime,
      timeOnIncorrect,
    };
  }, [questions, answers, perQSeconds]);

  // motion variant
  const card = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.18 } },
  };

  // Question Card
  const QuestionCard = ({ q, index }) => {
    const chosen = answers[q.id];
    const showFeedback = showResults || (mode === "practice" && chosen);

    if (showWrongOnly && answers[q.id] === q.correctAnswer) return null;

    return (
      <motion.div
        variants={card}
        initial="hidden"
        animate="show"
        className="rounded-2xl border border-white/10 bg-white dark:bg-zinc-900 p-4 shadow"
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5 text-xs px-2 py-1 rounded-full bg-sky-600/15 text-sky-600">
            {index + 1}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
                {q.difficulty || "مامناوەند"}
              </span>
              <button
                onClick={() => speak(q.questionText.replace(/\$.*?\$/g, ""))}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              >
                <Volume2 size={14} /> خوێندنەوە
              </button>
              {q.hint && (
                <button
                  onClick={() => toggleHint(q.id)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100/70 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 hover:bg-amber-200/70 dark:hover:bg-amber-800/20 transition"
                >
                  <Lightbulb size={14} /> ئاماژە
                </button>
              )}
              {showResults && (
                <span className="text-xs text-zinc-500 mr-auto">
                  کات: {perQSeconds[q.id] ? `${perQSeconds[q.id]}s` : "0s"}
                </span>
              )}
            </div>

            {q.image && (
              <img
                src={q.image}
                alt=""
                className="w-full max-h-56 object-cover rounded-xl mb-3"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://placehold.co/640x320/cccccc/333333?text=Image+Not+Found";
                }}
              />
            )}
            <div
              className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: q.questionText
                  .replace(/\$\$(.*?)\$\$/g, '<span class="latex-math">$$$1$$</span>')
                  .replace(/\$(.*?)\$/g, '<span class="latex-math">$1</span>'),
              }}
            />

            <AnimatePresence>
              {hintsUsed[q.id] && q.hint && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-2 text-sm rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-2"
                >
                  {q.hint}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {q.shuffledOptions.map((opt) => {
            const selected = chosen === opt;
            const correct = opt === q.correctAnswer;
            let base =
              "w-full text-right rounded-xl border px-3 py-2 text-sm transition flex items-center gap-2 ";
            if (showFeedback) {
              if (correct)
                base +=
                  "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300";
              else if (selected && !correct)
                base +=
                  "bg-rose-50 dark:bg-rose-900/20 border-rose-300 dark:border-rose-600 text-rose-700 dark:text-rose-300";
              else
                base +=
                  "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200";
            } else
              base += selected
                ? "bg-sky-50 dark:bg-sky-900/20 border-sky-300 dark:border-sky-600 text-sky-700 dark:text-sky-300"
                : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-sky-300";

            return (
              <button
                key={opt}
                onClick={() => {
                  choose(q.id, opt);
                  setActiveQ(q.id);
                }}
                disabled={showResults}
                className={base}
              >
                <input
                  type="radio"
                  checked={selected}
                  onChange={() => {}}
                  className="ml-2 h-4 w-4 accent-sky-600"
                  disabled={showResults}
                />
                <span className="flex-1 text-right">{opt}</span>
                <AnimatePresence>
                  {showFeedback && correct && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                    >
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    </motion.span>
                  )}
                  {showFeedback && selected && !correct && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                    >
                      <XCircle size={18} className="text-rose-600" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>

        {/* explanation */}
        <AnimatePresence>
          {((mode === "practice" && answers[q.id]) ||
            (showResults && showAllExplanations)) && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-3 rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50/70 dark:bg-amber-900/20 p-3 text-sm"
            >
              <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <Lightbulb size={16} /> وەڵامی ڕاست: {q.correctAnswer}
              </div>
              <div
                className="mt-2 text-amber-900 dark:text-amber-200 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: q.explanation
                    .replace(/\$\$(.*?)\$\$/g, '<span class="latex-math">$$$1$$</span>')
                    .replace(/\$(.*?)\$/g, '<span class="latex-math">$1</span>'),
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* notes */}
        <div className="mt-3">
          <label className="text-xs text-zinc-500 flex items-center gap-1">
            <NotebookPen size={14} /> تێبینی بۆ ئەم پرسیارە
          </label>
          <textarea
            value={notes[q.id] || ""}
            onChange={(e) => changeNote(q.id, e.target.value)}
            placeholder="لێرە تێبینی بنووسە…"
            className="mt-1 w-full rounded-xl border bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-sm p-2 resize-y min-h-[60px]"
            disabled={showResults && mode === "exam"}
          ></textarea>
        </div>
      </motion.div>
    );
  };

  // Share modal
  const ShareScoreModal = () => {
    const scoreText =
      `ئەنجامی تاقیکردنەوەی "${exam?.title}":\n\n` +
      `ڕاست: ${detailedScore.correct} / ${detailedScore.total}\n` +
      `هەڵە: ${detailedScore.incorrect}\n` +
      `بەجێماوە: ${detailedScore.unanswered}\n` +
      `کاتی تەواو: ${formatTime(detailedScore.timeSpent)}\n` +
      `لەسەدا: %${detailedScore.percentage}`;

    const handleDownloadImage = () => {
      alert("بۆ وێنە، سکرینشۆت بگرە لەسەر ئەم کارتە. (ئامرازی دابەزاندنی وێنە لە ناو ئەم ئامادەکارییەدا نییە)");
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowShareModal(false)}
        className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50 cursor-pointer"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-xl text-center cursor-default"
        >
          <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-4">
            هاوبەشی‌کردنی ئەنجام
          </h3>

          <div className="bg-gradient-to-br from-emerald-100 to-white dark:from-emerald-950/30 dark:to-zinc-950/40 border border-emerald-200 dark:border-emerald-700 rounded-xl p-5 mb-5 space-y-3">
            <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
              {exam?.title}
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="flex flex-col items-center">
                <span className="text-5xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {detailedScore.correct}
                </span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  ڕاست
                </span>
              </div>
              <div className="text-4xl font-extrabold text-zinc-400">/</div>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-extrabold text-zinc-800 dark:text-zinc-200">
                  {detailedScore.total}
                </span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  پرسیار
                </span>
              </div>
            </div>
            <p className="text-3xl font-bold text-sky-600 dark:text-sky-400 mt-2">
              %{detailedScore.percentage}
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <span>
                هەڵە:{" "}
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  {detailedScore.incorrect}
                </span>
              </span>
              <span>
                بەجێماوە:{" "}
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {detailedScore.unanswered}
                </span>
              </span>
              <span className="col-span-2">
                کاتی تەواو:{" "}
                <span className="font-semibold text-sky-600 dark:text-sky-400">
                  {formatTime(detailedScore.timeSpent)}
                </span>
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => copyToClipboard(scoreText)}
              className="w-full px-5 py-3 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-700 flex items-center justify-center gap-2 transition"
            >
              <Clipboard size={18} /> کۆپی‌کردنی ئەنجام (دەق)
            </button>
            <button
              onClick={handleDownloadImage}
              className="w-full px-5 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center gap-2 transition"
            >
              <Download size={18} /> دابەزاندنی وێنەی ئەنجام
            </button>
            <p className="text-xs text-zinc-500 mt-2 flex items-center justify-center gap-1">
              <Info size={14} className="shrink-0" />
              بۆ وێنە سکرینشۆت بگرە.
            </p>
          </div>

          <button
            onClick={() => setShowShareModal(false)}
            className="absolute top-3 right-3 p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
          >
            <XCircle size={20} />
          </button>
        </motion.div>
      </motion.div>
    );
  };

  // ---------------- RENDER ----------------
  return (
    <div dir="rtl" className={`${kuFont} space-y-4`}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-40">
        <div className="backdrop-blur bg-white/85 dark:bg-zinc-900/85 border-b border-white/10">
          <div className="mx-auto max-w-5xl px-3 py-2">
            {currentView === "examPicker" || currentView === "historyList" ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {/* Subject */}
                <div>
                  <label className="text-[11px] text-zinc-500">بابەت</label>
                  <select
                    className="w-full text-sm rounded-lg px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-white/10 text-zinc-800 dark:text-zinc-200"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    <option value="">— هەموو —</option>
                    {subjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Track */}
                <div>
                  <label className="text-[11px] text-zinc-500">شاخە</label>
                  <select
                    className="w-full text-sm rounded-lg px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-white/10 text-zinc-800 dark:text-zinc-200"
                    value={selectedTrack}
                    onChange={(e) => setSelectedTrack(e.target.value)}
                  >
                    <option value="">— هەموو —</option>
                    {tracks.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Difficulty */}
                <div>
                  <label className="text-[11px] text-zinc-500">ئاست</label>
                  <select
                    className="w-full text-sm rounded-lg px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-white/10 text-zinc-800 dark:text-zinc-200"
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                  >
                    <option value="">— هەموو —</option>
                    {difficulties.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Mode */}
                <div>
                  <label className="text-[11px] text-zinc-500">دۆخ</label>
                  <select
                    className="w-full text-sm rounded-lg px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-white/10 text-zinc-800 dark:text-zinc-200"
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                  >
                    <option value="practice">توێژینەوە</option>
                    <option value="exam">تاقیکردنەوە</option>
                  </select>
                </div>
                {/* Minutes */}
                <div>
                  <label className="text-[11px] text-zinc-500">خوله‌ک</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="خوله‌ک"
                    className="w-full text-sm rounded-lg px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-white/10 text-right text-zinc-800 dark:text-zinc-200"
                    value={manualMinutes}
                    onChange={(e) => setManualMinutes(e.target.value)}
                  />
                </div>
              </div>
            ) : (currentView === "activeExam" || currentView === "resultsView") && (
              <div className="flex items-center justify-between gap-3 py-1">
                <div className="text-sm font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-2">
                  <Clock size={18} /> {formatTime(seconds)}
                </div>
                <div className="flex-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full ${showResults ? "bg-emerald-500" : "bg-sky-500"}`}
                    style={{
                      width: `${(Object.keys(answers).length / (questions.length || 1)) * 100}%`,
                      transition: "width .3s ease",
                    }}
                  />
                </div>
                <button
                  onClick={exitExam}
                  className="px-3 py-1.5 rounded-lg text-xs bg-red-500 text-white hover:bg-red-600 flex items-center gap-1"
                >
                  <LogOut size={14} /> دەرچوون
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Kurdish Hero */}
      {currentView === "examPicker" && (
        <div className="px-3">
          <div className="mx-auto max-w-5xl rounded-2xl bg-gradient-to-l from-sky-900/40 via-zinc-900/50 to-zinc-900/70 border border-white/10 p-4 md:p-5 mb-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold text-zinc-50">بەشی تاقیکردنەوە</h1>
                <p className="text-sm text-zinc-400 mt-1">
                  هەڵبژاردن، تاقیکردنەوە و هەڵسەنگاندن — بە پشتیوانی زمانی کوردی و دەستگەیشتنی ئاسان.
                </p>
              </div>
              <div className="text-xs md:text-sm text-sky-200 bg-sky-600/15 ring-1 ring-sky-500/30 rounded-xl px-3 py-2">
              به‌شێوه‌یه‌كی خوودكارانه‌ هه‌ڵده‌گیرێت.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl px-3">
        {/* Exam Picker */}
        {currentView === "examPicker" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">
                تاقیکردنەوەکان
              </h2>
              <button
                onClick={goToHistoryList}
                className="px-3 py-1.5 rounded-lg text-xs bg-sky-600 text-white hover:bg-sky-700 flex items-center gap-1 transition"
              >
                <History size={14} /> ئەنجامەکانم
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredExams.map((e) => (
                <motion.button
                  key={e.id}
                  variants={card}
                  initial="hidden"
                  animate="show"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startExam(e)}
                  className="text-right rounded-2xl border border-white/10 bg-white dark:bg-zinc-900 p-4 shadow hover:shadow-md transition"
                >
                  <div className="text-sm text-zinc-500">
                    {e.subject} • {e.track}
                  </div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                    {e.title}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    ژمارەی پرسیار: {e.questions.length}
                  </div>
                </motion.button>
              ))}
            </div>

            {filteredExams.length === 0 && (
              <p className="text-center text-zinc-500 py-8">
                هیچ تاقیکردنەوەیەک نەدۆزرایەوە.
              </p>
            )}
          </div>
        )}

        {/* History List */}
        {currentView === "historyList" && (
          <HistoricalResultsPage
            results={historicalResults}
            onViewResult={viewHistoricalResult}
            onGoBack={() => setCurrentView("examPicker")}
          />
        )}

        {/* Active / Results */}
        {(currentView === "activeExam" || currentView === "resultsView") && exam && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                {exam.title}
              </h3>
              {!showResults && (
                <span className="text-xs text-zinc-500">
                  {Object.keys(answers).length}/{questions.length} تەواو
                </span>
              )}
            </div>

            <AnimatePresence>
              {showResults && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-2xl border border-white/10 bg-white dark:bg-zinc-900 p-4 shadow space-y-4"
                >
                  <div className="flex items-center gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-100">
                    <BarChart3 size={18} /> لێکۆڵینەوە
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-white/10 bg-zinc-50 dark:bg-zinc-800 p-3 text-center">
                      <div className="text-xs text-zinc-500">کۆتا ئەنجام</div>
                      <div className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                        {detailedScore.correct}/{detailedScore.total}
                      </div>
                      <div className="text-emerald-600 dark:text-emerald-400 font-bold text-xl mt-1">
                        %{detailedScore.percentage}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-zinc-50 dark:bg-zinc-800 p-3 text-center">
                      <div className="text-xs text-zinc-500">ڕاست</div>
                      <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                        {detailedScore.correct}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-zinc-50 dark:bg-zinc-800 p-3 text-center">
                      <div className="text-xs text-zinc-500">هەڵە</div>
                      <div className="text-lg font-extrabold text-rose-600 dark:text-rose-400">
                        {detailedScore.incorrect}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-zinc-50 dark:bg-zinc-800 p-3 text-center">
                      <div className="text-xs text-zinc-500">بەجێماوە</div>
                      <div className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                        {detailedScore.unanswered}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-zinc-50 dark:bg-zinc-800 p-3 text-center col-span-2 sm:col-span-1">
                      <div className="text-xs text-zinc-500">کاتی تەواو</div>
                      <div className="text-lg font-extrabold text-sky-600 dark:text-sky-400">
                        {formatTime(detailedScore.timeSpent)}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-zinc-50 dark:bg-zinc-800 p-3 text-center col-span-2 sm:col-span-1">
                      <div className="text-xs text-zinc-500">تەواوی/پرسیار</div>
                      <div className="text-lg font-extrabold text-sky-600 dark:text-sky-400">
                        {totals.avgTimePerQuestion}s
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <div className="flex items-center gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-2">
                      <BookOpen size={18} /> ئەنجام بەپێی ئاست
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {Object.entries(totals.byDiff).map(([k, v]) =>
                        v.t > 0 ? (
                          <div
                            key={k}
                            className="rounded-xl border border-white/10 bg-zinc-50 dark:bg-zinc-800 p-3 text-center"
                          >
                            <div className="text-xs text-zinc-500">{k}</div>
                            <div className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                              {v.c}/{v.t}
                            </div>
                            <div
                              className={`font-bold text-xl mt-1 ${
                                v.c / v.t > 0.7
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : v.c / v.t > 0.4
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              %{((v.c / v.t) * 100).toFixed(0)}
                            </div>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <label
                      htmlFor="showWrongOnly"
                      className="flex items-center gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-100 cursor-pointer"
                    >
                      <ListChecks size={18} /> تەنیا هەڵەکان پیشانبدە
                    </label>
                    <input
                      type="checkbox"
                      id="showWrongOnly"
                      checked={showWrongOnly}
                      onChange={() => setShowWrongOnly(!showWrongOnly)}
                      className="h-5 w-5 rounded accent-sky-600"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              {questions.map((q, idx) => (
                <QuestionCard key={q.id} q={q} index={idx} />
              ))}
            </div>

            {/* Bottom bar */}
            <div className="sticky bottom-2 z-30">
              <div className="mx-auto max-w-5xl">
                <div className="rounded-2xl bg-white/95 dark:bg-zinc-900/95 shadow-lg border border-white/10 p-2 flex items-center justify-between">
                  {!showResults ? (
                    <>
                      <button
                        onClick={submitAll}
                        className="flex-1 mx-1 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 flex items-center justify-center gap-2 transition"
                      >
                        ناردن <ListChecks size={18} />
                      </button>
                      <button
                        onClick={exitExam}
                        className="mx-1 px-3 py-2 rounded-xl bg-rose-500 text-white font-semibold hover:bg-rose-600 flex items-center gap-2 transition"
                      >
                        دەرچوون <ChevronRight size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {detailedScore.correct} / {detailedScore.total}
                      </div>
                      <button
                        onClick={() => setShowAllExplanations((v) => !v)}
                        className="flex-1 mx-1 px-4 py-2 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 flex items-center justify-center gap-2 transition"
                      >
                        {showAllExplanations
                          ? "شاردنەوەی ڕوونکردنەوە"
                          : "پیشاندانی هەموو ڕوونکردنەوەکان"}{" "}
                        <Lightbulb size={18} />
                      </button>
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="mx-1 px-3 py-2 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-700 flex items-center justify-center gap-2 transition"
                      >
                        هاوبەشی‌کردن <Share2 size={16} />
                      </button>
                      <button
                        onClick={handleBackFromResults}
                        className="mx-1 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center gap-2 transition"
                      >
                        گەڕانەوە <ChevronLeft size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <AnimatePresence>{showShareModal && <ShareScoreModal />}</AnimatePresence>
    </div>
  );
}
