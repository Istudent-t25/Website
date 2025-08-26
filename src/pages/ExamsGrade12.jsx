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
  Trash2,
  ChevronDown,
  BookA,
  FlaskConical,
  GraduationCap,
  Scale,
  Sun,
  Moon,
} from "lucide-react";

// HistoricalResultsPage component is now defined inline to resolve import issues.
const HistoricalResultsPage = ({ results, onViewResult, onGoBack, onDeleteResult }) => {
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('ku-IQ', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">
          ئەنجامەکانم
        </h2>
        <button
          onClick={onGoBack}
          className="px-3 py-1.5 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center gap-1 transition"
        >
          <ChevronLeft size={14} /> گەڕانەوە
        </button>
      </div>

      {results.length === 0 ? (
        <p className="text-center text-zinc-500 py-8">
          هیچ ئەنجامێک نەدۆزرایەوە.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {results.map((result) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-white dark:bg-zinc-900 p-4 shadow space-y-2 relative"
            >
              <button
                onClick={() => onDeleteResult(result.id)}
                className="absolute top-3 left-3 p-1.5 rounded-full bg-rose-100 dark:bg-rose-900/20 text-rose-600 hover:bg-rose-200 dark:hover:bg-rose-800/20 transition"
                aria-label="سڕینەوەی ئەنجام"
              >
                <Trash2 size={16} />
              </button>
              <div className="text-sm text-zinc-500 text-right">
                {result.examSubject} • {result.examTrack}
              </div>
              <div className="font-bold text-zinc-900 dark:text-zinc-100 text-right">
                {result.examTitle}
              </div>
              <div className="flex items-center justify-end gap-2 text-xs text-zinc-500">
                <Clock size={12} /> {formatTimestamp(result.timestamp)}
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => onViewResult(result)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-sky-600 text-white hover:bg-sky-700 flex items-center gap-1 transition"
                >
                  بینین <ChevronLeft size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ShareScoreModal placeholder component
const ShareScoreModal = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => {}}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="rounded-2xl border border-white/10 bg-white dark:bg-zinc-900 p-6 shadow-xl w-full max-w-sm"
      >
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          هاوبەشی‌کردنی ئەنجام
        </h3>
        <p className="text-sm text-zinc-500 mt-2">
          ئەم تایبەتمەندییە هێشتا بەردەست نییە.
        </p>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {}}
            className="px-4 py-2 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            داخستن
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};


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

// Subject icon map
const subjectIcons = {
  "بیركاری": Scale,
  "فیزیا": FlaskConical,
  "کیمیا": BookA,
  "ئینگلیزی": GraduationCap,
  "کوردی": NotebookPen,
};

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case "ئاسان":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300";
    case "مامناوەند":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300";
    case "سخت":
      return "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300";
    default:
      return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200";
  }
};


// Question Card Component - Now memoized and accepts specific props
const QuestionCard = React.memo(
  ({
    q,
    index,
    showResults,
    mode,
    chosenAnswer, // Specific answer for this question
    noteForThisQ, // Specific note for this question
    hintUsedForThisQ, // Specific hint used for this question
    perQSecondForThisQ, // Specific time for this question
    onChoose, // Callback for choosing an option
    onToggleHint, // Callback for toggling hint
    onChangeNote, // Callback for changing note
    onSetActiveQ, // Callback to set active question
    speak, // TTS function
    showWrongOnly,
    showAllExplanations,
  }) => {
    // console.log(`Rendering QuestionCard: ${q.id}`); // For debugging re-renders
    const showFeedback = showResults || (mode === "practice" && chosenAnswer);

    if (showWrongOnly && chosenAnswer === q.correctAnswer) return null;

    return (
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 8 },
          show: { opacity: 1, y: 0, transition: { duration: 0.18 } },
        }}
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
              <span className={`px-2 py-0.5 rounded-full ${getDifficultyColor(q.difficulty)}`}>
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
                  onClick={() => onToggleHint(q.id)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100/70 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 hover:bg-amber-200/70 dark:hover:bg-amber-800/20 transition"
                >
                  <Lightbulb size={14} /> ئاماژە
                </button>
              )}
              {showResults && (
                <span className="text-xs text-zinc-500 mr-auto">
                  کات: {perQSecondForThisQ ? `${perQSecondForThisQ}s` : "0s"}
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
              {hintUsedForThisQ && q.hint && (
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
            const selected = chosenAnswer === opt;
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
                  onChoose(q.id, opt);
                  onSetActiveQ(q.id);
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
          {((mode === "practice" && chosenAnswer) ||
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
            value={noteForThisQ || ""}
            onChange={(e) => onChangeNote(q.id, e.target.value)}
            placeholder="لێرە تێبینی بنووسە…"
            className="mt-1 w-full rounded-xl border bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-sm p-2 resize-y min-h-[60px]"
            disabled={showResults && mode === "exam"}
          ></textarea>
        </div>
      </motion.div>
    );
  }
);


export default function ExamsGrade12Pro() {
  // navigation
  const [currentView, setCurrentView] = useState("examPicker"); // examPicker | activeExam | resultsView | historyList
  const [lastViewWasHistory, setLastViewWasHistory] = useState(false);

  // filters
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [mode, setMode] = useState("practice"); // practice | exam
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
  const speak = useCallback((text) => { // Memoized speak function
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ku-IQ";
      synth.cancel();
      synth.speak(u);
    } catch {}
  }, []); // No dependencies, so it's stable

  // Refs to hold the latest state values for stable useCallback dependencies
  const answersRef = useRef(answers);
  const perQSecondsRef = useRef(perQSeconds);
  const notesRef = useRef(notes);
  const hintsUsedRef = useRef(hintsUsed);
  const questionsRef = useRef(questions);
  const currentViewRef = useRef(currentView); // Added ref for currentView
  const lastViewWasHistoryRef = useRef(lastViewWasHistory); // Added ref for lastViewWasHistory
  const examRef = useRef(exam); // Added ref for exam

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { perQSecondsRef.current = perQSeconds; }, [perQSeconds]);
  useEffect(() => { notesRef.current = notes; }, [notes]);
  useEffect(() => { hintsUsedRef.current = hintsUsed; }, [hintsUsed]);
  useEffect(() => { questionsRef.current = questions; }, [questions]);
  useEffect(() => { currentViewRef.current = currentView; }, [currentView]);
  useEffect(() => { lastViewWasHistoryRef.current = lastViewWasHistory; }, [lastViewWasHistory]);
  useEffect(() => { examRef.current = exam; }, [exam]);


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

  // detailed score - this memoized value will be used for display.
  // For submission, it's calculated fresh inside submitAll using refs.
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

    // Calculate detailedScore at the point of submission using refs for latest state
    let currentCorrect = 0;
    let currentIncorrect = 0;
    let currentAnsweredCount = 0;
    let currentTotalTimeSpent = 0;

    const latestQuestions = questionsRef.current; // Get latest questions from ref
    const latestAnswers = answersRef.current;
    const latestPerQSeconds = perQSecondsRef.current;

    for (const q of latestQuestions) {
      currentTotalTimeSpent += latestPerQSeconds[q.id] || 0;
      if (latestAnswers[q.id] !== undefined && latestAnswers[q.id] !== null) {
        currentAnsweredCount++;
        if (latestAnswers[q.id] === q.correctAnswer) currentCorrect++;
        else currentIncorrect++;
      }
    }
    const currentPercentage =
      latestQuestions.length > 0 ? ((currentCorrect / latestQuestions.length) * 100).toFixed(0) : 0;

    const currentDetailedScore = {
      correct: currentCorrect,
      incorrect: currentIncorrect,
      unanswered: latestQuestions.length - currentAnsweredCount,
      total: latestQuestions.length,
      timeSpent: currentTotalTimeSpent,
      percentage: currentPercentage,
    };
    // End of detailedScore calculation


    if (
      currentViewRef.current === "activeExam" || // Use ref
      (currentViewRef.current === "resultsView" && !lastViewWasHistoryRef.current) // Use ref
    ) {
      const resultEntry = {
        id: examRef.current.id + "-" + Date.now(), // Use ref
        examId: examRef.current.id, // Use ref
        examTitle: examRef.current.title, // Use ref
        examSubject: examRef.current.subject, // Use ref
        examTrack: examRef.current.track, // Use ref
        answers: { ...latestAnswers },
        perQSeconds: { ...latestPerQSeconds },
        notes: { ...notesRef.current },
        hintsUsed: { ...hintsUsedRef.current },
        detailedScore: { ...currentDetailedScore }, // Use the newly calculated score
        timestamp: Date.now(),
      };
      setHistoricalResults((prev) => [resultEntry, ...prev]);
    }

    setShowResults(true);
    setShowAllExplanations(false);
    setCurrentView("resultsView");
  }, [
    setHistoricalResults, // State setters are stable
    setShowResults,
    setShowAllExplanations,
    setCurrentView,
    setRunning,
  ]);

  // global timer
  useEffect(() => {
    // Only proceed if the timer is running and seconds are greater than 0
    if (!running || seconds <= 0) {
      // If seconds hit 0 and timer was running, submit the exam
      if (seconds === 0 && running) {
        submitAll();
      }
      return; // Stop here if not running or timer is done
    }

    // Set up the interval to decrement seconds every second
    tickRef.current = setInterval(() => {
      setSeconds((s) => s - 1); // Use functional update for correct state
    }, 1000);

    // Cleanup function: clear the interval when the component unmounts or dependencies change
    return () => clearInterval(tickRef.current);
    // Dependencies: only 'running' and 'submitAll' are needed. 'seconds' is handled by functional update.
  }, [running, submitAll]); // 'seconds' removed from dependencies

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
  const choose = useCallback((qid, option) => {
    setAnswers((a) => ({ ...a, [qid]: option }));
    setActiveQ(qid);
  }, []); // Stable callback

  const toggleHint = useCallback((qid) => {
    setHintsUsed((h) => ({ ...h, [qid]: !h[qid] }));
  }, []); // Stable callback

  const changeNote = useCallback((qid, text) => {
    setNotes((n) => ({ ...n, [qid]: text }));
  }, []); // Stable callback

  // history logic
  const deleteHistoricalResult = useCallback((idToDelete) => {
    setHistoricalResults((prev) => prev.filter(result => result.id !== idToDelete));
  }, []);

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

  // motion variant (moved inside component for consistent access to showWrongOnly if needed)
  const cardVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.18 } },
  };

  const getSubjectIcon = (subject) => {
    const IconComponent = subjectIcons[subject];
    return IconComponent ? <IconComponent size={24} className="text-sky-600 dark:text-sky-400" /> : null;
  };


  // ---------------- RENDER ----------------
  return (
    <div dir="rtl" className={`${kuFont} space-y-4`}>
      {/* Filters as a unified header */}
      {currentView === "examPicker" && (
        <div className="rounded-2xl border border-white/10 bg-white dark:bg-zinc-900 p-4 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
              تاقیکردنەوەکان
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={goToHistoryList}
                className="px-3 py-1.5 rounded-lg text-xs bg-sky-600 text-white hover:bg-sky-700 flex items-center gap-1 transition"
              >
                <History size={14} /> ئەنجامەکانم
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {/* Subject */}
            <div>
              <label className="text-xs text-zinc-500">بابەت</label>
              <select
                className="w-full text-sm rounded-lg px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-white/10 text-zinc-800 dark:text-zinc-200 mt-1"
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
              <label className="text-xs text-zinc-500">شاخە</label>
              <select
                className="w-full text-sm rounded-lg px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-white/10 text-zinc-800 dark:text-zinc-200 mt-1"
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
              <label className="text-xs text-zinc-500">ئاست</label>
              <select
                className="w-full text-sm rounded-lg px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-white/10 text-zinc-800 dark:text-zinc-200 mt-1"
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
              <label className="text-xs text-zinc-500">دۆخ</label>
              <select
                className="w-full text-sm rounded-lg px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-white/10 text-zinc-800 dark:text-zinc-200 mt-1"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="practice">توێژینەوە</option>
                <option value="exam">تاقیکردنەوە</option>
              </select>
            </div>
            {/* Minutes */}
            <div>
              <label className="text-xs text-zinc-500">خوله‌ک</label>
              <input
                type="number"
                min="1"
                placeholder="خوله‌ک"
                className="w-full text-sm rounded-lg px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-white/10 text-right text-zinc-800 dark:text-zinc-200 mt-1"
                value={manualMinutes}
                onChange={(e) => setManualMinutes(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}


      <div className="mx-auto max-w-5xl px-3">
        {/* Exam Picker with Filters */}
        {currentView === "examPicker" && (
          <div className="space-y-4">
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredExams.length > 0 ? (
                  filteredExams.map((e) => (
                    <motion.button
                      key={e.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => startExam(e)}
                      className="group flex flex-col items-center text-center rounded-2xl border border-white/10 bg-white dark:bg-zinc-900 p-6 shadow-md hover:shadow-lg transition-all"
                    >
                      <div className="p-3 rounded-full bg-sky-100 dark:bg-sky-900/20 group-hover:bg-sky-200 dark:group-hover:bg-sky-800/30 transition-colors mb-4">
                        {getSubjectIcon(e.subject)}
                      </div>
                      <div className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mt-1">
                        {e.title}
                      </div>
                      <div className="text-sm text-zinc-500 mt-1">
                        {e.subject} • {e.track}
                      </div>
                      <div className="text-xs text-zinc-400 mt-2">
                        ژمارەی پرسیار: {e.questions.length}
                      </div>
                    </motion.button>
                  ))
                ) : (
                  <p className="text-center text-zinc-500 py-8 col-span-full">
                    هیچ تاقیکردنەوەیەک نەدۆزرایەوە.
                  </p>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        {/* History List */}
        {currentView === "historyList" && (
          <HistoricalResultsPage
            results={historicalResults}
            onViewResult={viewHistoricalResult}
            onGoBack={() => setCurrentView("examPicker")}
            onDeleteResult={deleteHistoricalResult} // Pass the delete function
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
                <QuestionCard
                  key={q.id}
                  q={q}
                  index={idx}
                  showResults={showResults}
                  mode={mode}
                  chosenAnswer={answers[q.id]}
                  noteForThisQ={notes[q.id]}
                  hintUsedForThisQ={hintsUsed[q.id]}
                  perQSecondForThisQ={perQSeconds[q.id]}
                  onChoose={choose}
                  onToggleHint={toggleHint}
                  onChangeNote={changeNote}
                  onSetActiveQ={setActiveQ}
                  speak={speak}
                  showWrongOnly={showWrongOnly}
                  showAllExplanations={showAllExplanations} // FIX: Pass the prop here
                />
              ))}
            </div>

            {/* Bottom bar */}
            {/* Bottom bar (mobile-friendly) */}
<div className="sticky -bottom-5 z-30">
  <div className="mx-auto max-w-md sm:max-w-5xl">
    <div className="rounded-2xl bg-white/95 dark:bg-zinc-900/95 shadow-lg border border-white/10 p-2 flex items-center justify-around gap-1">
      {!showResults ? (
        <>
          <button
            onClick={submitAll}
            className="flex flex-col items-center justify-center flex-1 px-2 py-1 text-[11px] font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <ListChecks size={18} />
            <span>ناردن</span>
          </button>
          <button
            onClick={exitExam}
            className="flex flex-col items-center justify-center flex-1 px-2 py-1 text-[11px] font-semibold rounded-lg bg-rose-500 text-white hover:bg-rose-600"
          >
            <ChevronRight size={18} />
            <span>دەرچوون</span>
          </button>
        </>
      ) : (
        <>
          <div className="flex flex-col items-center px-2 py-1 text-xs font-semibold text-zinc-800 dark:text-zinc-50">
            <span>{detailedScore.correct}/{detailedScore.total}</span>
          </div>
          <button
            onClick={() => setShowAllExplanations(v => !v)}
            className="flex flex-col items-center justify-center flex-1 px-2 py-1 text-[11px] font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600"
          >
            <Lightbulb size={18} />
            <span>{showAllExplanations ? "شاردنەوە" : "شیكار"}</span>
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            className="flex flex-col items-center justify-center flex-1 px-2 py-1 text-[11px] font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700"
          >
            <Share2 size={18} />
            <span>هاوبەشی</span>
          </button>
          <button
            onClick={handleBackFromResults}
            className="flex flex-col items-center justify-center flex-1 px-2 py-1 text-[11px] font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            <ChevronLeft size={18} />
            <span>گەڕانەوە</span>
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