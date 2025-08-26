import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  BookOpen,
  MessageCircle,
  HelpCircle,
  Lightbulb,
  Star,
  StarOff,
  Search,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  RefreshCw,
  Trophy, 
  CheckCircle2,
  XCircle,
  X,
  ClipboardList, 
} from "lucide-react";

/* ======================= DATA ======================= */
const wordsData = [
  { 
    id: 1, word: 'anxious', ipa: '/ˈæŋkʃəs/', kurdishMeaning: 'نیگەران، دڵەڕاوکێ', kurdishReading: 'ئەنگیۆس',
    silentLetters: [], exampleSentence: 'She felt anxious about her exam results.',
    examQuestions: [
      { question: 'واتای کوردی وشەی "anxious" چییە؟', answer: 'نیگەران، دڵەڕاوکێ' },
      { question: 'وشەیەکی هاومانای "anxious" بنووسە.', answer: 'Nervous یان Worried.' },
      { question: 'وشەی "anxious" لە ڕستەیەکدا بەکاربهێنە.', answer: 'خوێندکارەکە نیگەران بوو لە ئەنجامی تاقیکردنەوەی کۆتایی.' },
    ],
  },
  { 
    id: 2, word: 'knife', ipa: '/naɪf/', kurdishMeaning: 'چەقۆ', kurdishReading: 'نایف',
    silentLetters: ['k'], exampleSentence: 'He used a sharp knife to cut the apple.',
    examQuestions: [
      { question: 'کام پیت بێدەنگە لە وشەی "knife"؟', answer: 'پیتی "k" بێدەنگە.' },
      { question: 'IPA وشەی "knife" چییە؟', answer: '/naɪf/' },
      { question: 'وشەی "چەقۆ" بکە بە ئینگلیزی.', answer: 'Knife' },
    ],
  },
  { 
    id: 3, word: 'psalm', ipa: '/sɑːm/', kurdishMeaning: 'سەروود، سرووت', kurdishReading: 'سام',
    silentLetters: ['p'], exampleSentence: 'We sang a psalm during the church service.',
    examQuestions: [
      { question: 'کام پیت بێدەنگە لە وشەی "psalm"؟', answer: 'پیتی "p" بێدەنگە.' },
      { question: 'واتای کوردی وشەی "psalm" چییە؟', answer: 'سەروود، سرووت' },
      { question: 'نموونەیەکی ڕستە بۆ وشەی "psalm" بنووسە.', answer: 'کۆڕی مۆسیقا سروودێکی جوانیان وت.' },
    ],
  },
  { 
    id: 4, word: 'debt', ipa: '/dɛt/', kurdishMeaning: 'قەرز', kurdishReading: 'دێت',
    silentLetters: ['b'], exampleSentence: 'He has to pay off a small debt.',
    examQuestions: [
      { question: 'کام پیت بێدەنگە لە وشەی "debt"؟', answer: 'پیتی "b" بێدەنگە.' },
      { question: 'وشەی "debt" بە مانای چی دێت؟', answer: 'بڕێک پارە کە قەرزاری کەسێکیت.' },
    ],
  },
  { 
    id: 5, word: 'island', ipa: '/ˈaɪlənd/', kurdishMeaning: 'دوورگە', kurdishReading: 'ئایلاند',
    silentLetters: ['s'], exampleSentence: 'We went on vacation to a tropical island.',
    examQuestions: [
      { question: 'کام پیت بێدەنگە لە وشەی "island"؟', answer: 'پیتی "s" بێدەنگە.' },
      { question: 'چۆن وشەی "island" دەخوێنرێتەوە؟', answer: 'بە /ˈaɪlənd/ دەخوێنرێتەوە، لەگەڵ "s"ی بێدەنگ.' },
    ],
  },
  { 
    id: 6, word: 'knight', ipa: '/naɪt/', kurdishMeaning: 'ئەسپ سوار، سوارچاک', kurdishReading: 'نایت',
    silentLetters: ['k', 'g', 'h'], exampleSentence: 'A brave knight defended the kingdom.',
    examQuestions: [
      { question: 'کام پیتەکان بێدەنگن لە وشەی "knight"؟', answer: 'پیتەکانی "k"، "g"، و "h" هەموویان بێدەنگن.' },
      { question: '"knight" چی دەکات؟', answer: 'سوارچاک جەنگاوەرێکی ئازایە کە خزمەتی پادشا یان شاژنێک دەکات.' },
    ],
  },
  { 
    id: 7, word: 'listen', ipa: '/ˈlɪsən/', kurdishMeaning: 'گوێ گرتن', kurdishReading: 'لِسِن',
    silentLetters: ['t'], exampleSentence: 'Please listen to my instructions carefully.',
    examQuestions: [
      { question: 'کام پیت بێدەنگە لە وشەی "listen"؟', answer: 'پیتی "t" بێدەنگە.' },
      { question: 'چۆن وشەی "listen" دەخوێنرێتەوە؟', answer: 'وشەکە بە /ˈlɪsən/ دەخوێنرێتەوە، نەک /ˈlɪstən/.' },
    ],
  },
  { 
    id: 8, word: 'honest', ipa: '/ˈɒnɪst/', kurdishMeaning: 'ڕاستگۆ', kurdishReading: 'ئۆنێست',
    silentLetters: ['h'], exampleSentence: 'He is a very honest and trustworthy person.',
    examQuestions: [
      { question: 'کام پیت بێدەنگە لە وشەی "honest"؟', answer: 'پیتی "h" بێدەنگە.' },
      { question: 'واتای کوردی وشەی "honest" چییە؟', answer: 'ڕاستگۆ' },
    ],
  },
  { 
    id: 9, word: 'column', ipa: '/ˈkɒləm/', kurdishMeaning: 'ستوون', kurdishReading: 'کۆلەم',
    silentLetters: ['n'], exampleSentence: 'The temple was supported by large columns.',
    examQuestions: [
      { question: 'کام پیت بێدەنگە لە وشەی "column"؟', answer: 'پیتی "n" بێدەنگە.' },
      { question: 'چۆن وشەی "column" دەخوێنرێتەوە؟', answer: 'بە /ˈkɒləm/ دەخوێنرێتەوە، نەک /ˈkɒləmn/.' },
    ],
  },
  { 
    id: 10, word: 'doubt', ipa: '/daʊt/', kurdishMeaning: 'گومان', kurdishReading: 'داوت',
    silentLetters: ['b'], exampleSentence: 'I have no doubt that he will succeed.',
    examQuestions: [
      { question: 'کام پیت بێدەنگە لە وشەی "doubt"؟', answer: 'پیتی "b" بێدەنگە.' },
      { question: 'وشەی "doubt" بە مانای چی دێت؟', answer: 'هەستێکی نادڵنیایی یان نەبوونی متمانە.' },
    ],
  },
  { 
    id: 11, word: 'castle', ipa: '/ˈkɑːsəl/', kurdishMeaning: 'قەڵا', kurdishReading: 'کاسڵ',
    silentLetters: ['t'], exampleSentence: 'We visited an old castle on our trip.',
    examQuestions: [
      { question: 'کام پیت بێدەنگە لە وشەی "castle"؟', answer: 'پیتی "t" بێدەنگە.' },
      { question: 'واتای کوردی وشەی "castle" چییە؟', answer: 'قەڵا' },
    ],
  },
  { 
    id: 12, word: 'aisle', ipa: '/aɪl/', kurdishMeaning: 'ڕێڕەو', kurdishReading: 'ئایل',
    silentLetters: ['s'], exampleSentence: 'She walked down the wedding aisle.',
    examQuestions: [
      { question: 'کام پیت بێدەنگە لە وشەی "aisle"؟', answer: 'پیتی "s" بێدەنگە.' },
      { question: 'چۆن وشەی "aisle" دەخوێنرێتەوە؟', answer: 'بە /aɪl/ دەخوێنرێتەوە، لەگەڵ "s"ی بێدەنگ.' },
      { question: 'نموونەیەکی ڕستە بۆ وشەی "aisle" بنووسە.', answer: 'کارمەندی فڕۆکەکە داوای لێکردم لە ڕێڕەوەکە دووربکەومەوە.' },
    ],
  },
];

/* ======================= HELPERS ======================= */
const LS_KEY = "sounds_page_state_v2";
const usePersisted = (initial) => {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return initial;
      return { ...initial, ...JSON.parse(raw) };
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);
  return [state, setState];
};

// ttsSpeak now uses a fixed rate of 1
function ttsSpeak(text, lang = "en-US", rate = 1) { // Removed rate parameter from persist, fixed to 1
  try {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate; // Always use 1
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {}
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ======================= MAIN COMPONENT ======================= */
export default function SoundsPage() {
  const [persist, setPersist] = usePersisted({
    activeId: wordsData[0]?.id || 1,
    favorites: [],
    search: "",
    onlyFavs: false,
    // rate: 1, // Removed 'rate' from persisted state
  });

  const filtered = useMemo(() => {
    let list = wordsData;
    if (persist.search.trim()) {
      const q = persist.search.toLowerCase();
      list = list.filter(
        (w) =>
          w.word.toLowerCase().includes(q) ||
          w.ipa.toLowerCase().includes(q) ||
          w.kurdishMeaning.includes(persist.search)
      );
    }
    if (persist.onlyFavs) {
      list = list.filter((w) => persist.favorites.includes(w.id));
    }
    return list;
  }, [persist.search, persist.onlyFavs, persist.favorites]);

  const currentIndex = useMemo(() => { // Memoize currentIndex
    return Math.max(0, filtered.findIndex((w) => w.id === persist.activeId));
  }, [filtered, persist.activeId]);
  
  const currentWord = filtered[currentIndex] || filtered[0] || wordsData[0];

  const [mode, setMode] = useState("idle"); // 'idle'|'en'|'ku'|'speak'|'quiz'
  const [readingText, setReadingText] = useState("");
  const [autoPlay, setAutoPlay] = useState(false);

  const totalQ = currentWord?.examQuestions?.length || 0;
  const [qIndex, setQIndex] = useState(0);
  const [reveal, setReveal] = useState(false);

  // Exam Center states - Timer-related states removed
  const [examOpen, setExamOpen] = useState(false);
  const [examList, setExamList] = useState([]);
  const [examAnswers, setExamAnswers] = useState({});
  const [examDone, setExamDone] = useState(false); // Only exam done state remains

  const autoIntRef = useRef(null);
  // timerRef and its useEffect removed as per request

  useEffect(() => {
    setMode("idle");
    setReadingText("");
    setQIndex(0);
    setReveal(false);
  }, [currentWord?.id]);

  useEffect(() => {
    if (!autoPlay) {
      if (autoIntRef.current) clearInterval(autoIntRef.current);
      return;
    }
    autoIntRef.current = setInterval(() => {
      if (currentWord?.exampleSentence) {
        ttsSpeak(currentWord.exampleSentence, "en-US", 1); // Fixed rate to 1
      }
    }, 5000);
    return () => clearInterval(autoIntRef.current);
  }, [autoPlay, currentWord]); // Removed persist.rate from dependency array

  // Timer useEffect removed as per request (examOpen, examDone, examStart, examSeconds)

  // --- Scroll Lock for Modal ---
  useEffect(() => {
    if (examOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = ''; // Clean up on unmount
    };
  }, [examOpen]);
  // --- End Scroll Lock ---

  const setActiveId = useCallback((id) => setPersist((s) => ({ ...s, activeId: id })), [setPersist]);
  const toggleFavorite = useCallback((id) =>
    setPersist((s) => {
      const favs = new Set(s.favorites);
      favs.has(id) ? favs.delete(id) : favs.add(id);
      return { ...s, favorites: [...favs] };
    }), [setPersist]);

  const nextWord = useCallback(() => {
    if (!filtered.length) return;
    const i = currentIndex >= filtered.length - 1 ? 0 : currentIndex + 1;
    setActiveId(filtered[i].id);
  }, [filtered, currentIndex, setActiveId]);

  const prevWord = useCallback(() => {
    if (!filtered.length) return;
    const i = currentIndex <= 0 ? filtered.length - 1 : currentIndex - 1;
    setActiveId(filtered[i].id);
  }, [filtered, currentIndex, setActiveId]);

  const handleReadEnglish = useCallback(() => {
    setMode("en");
    setReadingText(currentWord.exampleSentence);
    ttsSpeak(currentWord.exampleSentence, "en-US", 1); // Fixed rate to 1
  }, [currentWord]); // Removed persist.rate from dependency array


  const handleSpeakWord = useCallback(() => {
    setMode("speak");
    setReadingText("");
    ttsSpeak(currentWord.word, "en-US", 1); // Fixed rate to 1
  }, [currentWord]); // Removed persist.rate from dependency array

  const startQuiz = useCallback(() => {
    setMode("quiz");
    setReadingText("");
    setQIndex(0);
    setReveal(false);
  }, []);

  const showAnswer = useCallback(() => setReveal(true), []);

  const nextQuestion = useCallback(() => {
    if (!totalQ) return;
    const next = (qIndex + 1) % totalQ;
    setQIndex(next);
    setReveal(false);
  }, [qIndex, totalQ]);

  // Exam Center
  const shufflePool = useCallback((count = 14) => {
    const pool = [];
    for (const w of wordsData) {
      for (const q of w.examQuestions || []) {
        pool.push({ id: `${w.id}-${q.question}`, word: w.word, question: q.question, answer: q.answer });
      }
    }
    return shuffle(pool).slice(0, Math.min(count, pool.length));
  }, []);

  const openExam = useCallback(() => {
    const list = shufflePool(14);
    setExamList(list);
    setExamAnswers({});
    setExamDone(false);
    setExamOpen(true);
  }, [shufflePool]);

  const closeExam = useCallback(() => {
    setExamOpen(false);
    setExamDone(false);
    setExamList([]);
    setExamAnswers({});
  }, []);

  const submitExam = useCallback(() => setExamDone(true), []);

  const examScore = useMemo(() => {
    if (!examDone) return { correct: 0, total: examList.length };
    let correct = 0;
    for (const it of examList) {
      const u = (examAnswers[it.id] || "").trim().toLowerCase();
      const a = (it.answer || "").trim().toLowerCase();
      if (u && a && (u === a || a.includes(u) || u.includes(a))) correct++;
    }
    return { correct, total: examList.length };
  }, [examDone, examList, examAnswers]);

  const overallProgress = Math.round(((persist.favorites.length || 0) / wordsData.length) * 100);
  const wordProgress = totalQ ? Math.min(100, Math.round(((qIndex + (reveal ? 1 : 0)) / totalQ) * 100)) : 0;

  return (
    <div dir="rtl" className="min-h-[100dvh] bg-gradient-to-b from-emerald-50 to-white dark:from-zinc-950 dark:to-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-zinc-900/70 bg-white/90 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                value={persist.search}
                onChange={(e) => setPersist((s) => ({ ...s, search: e.target.value }))}
                placeholder="گەڕان بە وشە، IPA یان واتاکەی…"
                className="w-full pr-10 pl-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search size={18} className="absolute right-3 top-2.5 text-zinc-400" />
            </div>

            <button
              onClick={() => setPersist((s) => ({ ...s, onlyFavs: !s.onlyFavs }))}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition ${ // Smaller for mobile
                persist.onlyFavs
                  ? "bg-amber-500 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200"
              }`}
            >
              تەنها دڵخوازەکان
            </button>

            {/* Removed "خێرایی خوێندنەوە" (Speed Reading) control */}
            {/*
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="text-zinc-500">خێرایی خوێندنەوە:</span>
              <input
                type="range"
                min="0.7"
                max="1.3"
                step="0.1"
                value={persist.rate}
                onChange={(e) => setPersist((s) => ({ ...s, rate: parseFloat(e.target.value) }))}
                className="accent-emerald-600"
              />
            </div>
            */}

            <button
              onClick={openExam}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Trophy size={16} /> ناوەندی تاقیکردنەوە
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow overflow-y-auto"> {/* This div will scroll */}
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* HERO */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 ring-1 ring-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
            <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -right-10 -bottom-20 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />
            <div className="relative p-6 sm:p-8">
              <div className="flex items-start justify-between">
                <button
                  onClick={() => toggleFavorite(currentWord.id)}
                  className="rounded-xl bg-white/10 hover:bg-white/20 transition p-2 ring-1 ring-white/10"
                  aria-label="favorite"
                  title="دڵخواز"
                >
                  {persist.favorites.includes(currentWord.id) ? (
                    <Star size={20} className="text-amber-300" />
                  ) : (
                    <StarOff size={20} className="text-white/80" />
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={openExam}
                    className="sm:hidden inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white/15 text-white hover:bg-white/25" // Smaller for mobile
                  >
                    <Trophy size={16} /> ناوەندی تاقیکردنەوە
                  </button>
                  <div className="text-[11px] px-3 py-1 rounded-full bg-white/15 text-white ring-1 ring-white/20">
                    پێشکەوتنی گشتی: {overallProgress}%
                  </div>
                </div>
              </div>

              <div className="mt-2 text-center">
                <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white leading-none">
                  {currentWord.word.split("").map((ch, i) => (
                    <span key={i} className={currentWord.silentLetters.includes(ch.toLowerCase()) ? "opacity-45" : ""}>
                      {ch}
                    </span>
                  ))}
                </h1>

                <p className="mt-2 text-2xl font-bold text-white/95">{currentWord.ipa}</p>
                <p className="mt-2 text-white/90 text-lg" dir="rtl">{currentWord.kurdishMeaning}</p>

                {totalQ > 0 && mode === "quiz" && (
                  <div className="mt-4">
                    <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
                      <div className="h-full bg-emerald-300" style={{ width: `${wordProgress}%` }} />
                    </div>
                  </div>
                )}

                {readingText && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    dir={mode === "ku" ? "rtl" : "ltr"}
                    className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white font-medium backdrop-blur"
                  >
                    {readingText}
                  </motion.div>
                )}

                {mode === "quiz" && currentWord.examQuestions?.length > 0 && (
                  <div className="mt-5 text-left max-w-2xl mx-auto">
                    <div className="rounded-2xl bg-white/95 text-zinc-800 p-4 ring-1 ring-white/10">
                      <p className="text-lg font-semibold">
                        {currentWord.examQuestions[qIndex].question}
                      </p>

                      {reveal ? (
                        <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-800 text-sm">
                          {currentWord.examQuestions[qIndex].answer}
                        </div>
                      ) : (
                        <button
                          onClick={showAnswer}
                          className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition"
                        >
                          <Lightbulb size={18} /> نیشاندانی وەڵام
                        </button>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <button
                          onClick={nextQuestion}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition"
                        >
                          دووبارەکردنەوە <RefreshCw size={16} />
                        </button>
                        <div className="hidden sm:block text-xs text-white/80">
                          {/* hint only; no inline status line */}
                          &nbsp;
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={handleReadEnglish}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition ${ // Smaller for mobile
                      mode === "en" ? "bg-emerald-500 text-white" : "bg-white/15 text-white hover:bg-white/25"
                    }`}
                  >
                    <BookOpen size={18} /> ڕستەی ئینگلیزی
                  </button>

          
                  <button
                    onClick={handleSpeakWord}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition ${ // Smaller for mobile
                      mode === "speak" ? "bg-emerald-500 text-white" : "bg-white/15 text-white hover:bg-white/25"
                    }`}
                  >
                    <Volume2 size={18} /> دەنگی وشە
                  </button>

                  <button
                    onClick={startQuiz}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition ${ // Smaller for mobile
                      mode === "quiz" ? "bg-emerald-500 text-white" : "bg-white/15 text-white hover:bg-white/25"
                    }`}
                  >
                    <HelpCircle size={18} /> پرسیاری وشە
                  </button>

                  <button
                    onClick={() => setAutoPlay((v) => !v)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition ${ // Smaller for mobile
                      autoPlay ? "bg-white/90 text-emerald-700" : "bg-white/15 text-white hover:bg-white/25"
                    }`}
                  >
                    {autoPlay ? <Pause size={18} /> : <Play size={18} />}
                    خوێندنەوەی خۆکار
                  </button>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2">
                  <button onClick={nextWord} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/15 text-white hover:bg-white/25">
                    داهاتوو <ChevronLeft size={18} />
                  </button>
                  <button onClick={prevWord} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/15 text-white hover:bg-white/25">
                    <ChevronRight size={18} /> پێشوو
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* WORDS GRID */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filtered.map((w) => {
              const active = w.id === currentWord.id;
              const fav = persist.favorites.includes(w.id);
              return (
                <motion.button // Added motion for animations
                  key={w.id}
                  onClick={() => setActiveId(w.id)}
                  whileHover={{ y: -2, boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }} // Lift and add more shadow on hover
                  whileTap={{ scale: 0.98 }} // Slightly shrink on tap
                  className={`group relative rounded-2xl border overflow-hidden p-3 text-right transition ring-1 ${
                    active
                      ? "bg-emerald-600 text-white border-emerald-700 ring-white/10 shadow-lg" // More shadow for active
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md" // Enhanced hover border and shadow
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-base sm:text-lg font-extrabold tracking-tight ${active ? "text-white" : "text-zinc-900 dark:text-zinc-100"}`}>
                      {w.word}
                    </h3>
                    <span
                      className={`grid place-items-center h-6 w-6 rounded-md ${active ? "bg-white/15" : "bg-zinc-100 dark:bg-zinc-800"}`}
                      title={fav ? "دڵخواز" : "زیادکردن بۆ دڵخواز"}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(w.id);
                      }}
                    >
                      {fav ? (
                        <Star size={14} className={active ? "text-amber-300" : "text-amber-400"} />
                      ) : (
                        <StarOff size={14} className={active ? "text-white/80" : "text-zinc-400"} />
                      )}
                    </span>
                  </div>
                  <div className={`text-xs mt-1 ${active ? "text-white/80" : "text-zinc-500"}`}>{w.ipa}</div>
                  <div className={`text-[10px] sm:text-[11px] mt-1 line-clamp-1 ${active ? "text-white/80" : "text-zinc-500"}`} dir="rtl">
                    {w.kurdishMeaning}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky footer for per-word QUIZ */}
      {mode === "quiz" && totalQ > 0 && (
        <div className="sticky bottom-0 z-30 border-t border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-zinc-900/90 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <ClipboardList size={16} />
              <span>پرسیار: {qIndex + 1} / {totalQ}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={prevWord} className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                گۆڕینی وشە
              </button>
              <button onClick={nextQuestion} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white">
                پرسیاری داهاتوو
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Center */}
      <ExamCenter
        open={examOpen}
        onClose={closeExam}
        list={examList}
        answers={examAnswers}
        setAnswers={setExamAnswers}
        onSubmit={submitExam}
        done={examDone}
        score={examScore}
      />

      <style>
        {`
          @keyframes fade-in { from { opacity:.0; transform: translateY(-6px);} to {opacity:1; transform: translateY(0);} }
          .animate-[fade-in_.25s_ease-out_both] { animation: fade-in .25s ease-out both; }
        `}
      </style>
    </div>
  );
}

/* ======================= Exam Center Component ======================= */
function ExamCenter({
  open,
  onClose,
  list,
  answers,
  setAnswers,
  onSubmit,
  done,
  score,
}) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"> {/* Removed p-4 for full-page */}
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel (full-page, light theme polished) */}
      <div className="relative w-full h-full bg-white dark:bg-zinc-900 rounded-none sm:rounded-2xl shadow-2xl ring-1 ring-zinc-200 dark:ring-white/10 flex flex-col"> {/* Removed max-w-2xl and sm:h-[90dvh] for full-page */}
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-zinc-900/90 sticky top-0">
          <div className="flex items-center gap-2">
            <Trophy className="text-emerald-600" size={18} />
            <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100">ناوەندی تاقیکردنەوە</h3>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <button onClick={onClose} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-200 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-white/10">
              داخستن <X size={16} />
            </button>
          </div>
        </div>

        {/* Body - now flex-grow and scrollable */}
        <div className="flex-grow overflow-y-auto px-4 py-4 bg-white dark:bg-zinc-900">
          {/* Summary */}
          {done && (
            <div className="mb-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 p-4">
              <div className="font-bold">ئەنجام:</div>
              <div className="text-sm mt-1">
                <span className="font-semibold">{score.correct}</span> لە <span className="font-semibold">{score.total}</span> ڕاست — ڕێژە:{" "}
                <span className="font-semibold">{Math.round((score.correct / Math.max(1, score.total)) * 100)}%</span>
              </div>
            </div>
          )}

          {/* Questions list (light theme tidy cards) */}
          <div className="grid grid-cols-1 gap-3">
            {list.map((it, idx) => {
              const id = it.id;
              const value = answers[id] || "";
              const correct = (it.answer || "").trim().toLowerCase();
              const user = value.trim().toLowerCase();
              const right = user && (user === correct || correct.includes(user) || user.includes(correct));
              const show = done;

              return (
                <div
                  key={id}
                  className={`rounded-xl p-4 border ${
                    show
                      ? right
                        ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                        : "bg-rose-50 border-rose-300 text-rose-900"
                      : "bg-white border-zinc-200 text-zinc-800 dark:bg-zinc-900 dark:border-white/10 dark:text-zinc-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">پرسیار {idx + 1}</div>
                    {show && (
                      <div className="text-xs font-semibold flex items-center gap-1">
                        {right ? (
                          <>
                            <CheckCircle2 className="text-emerald-700" size={16} /> ڕاست
                          </>
                        ) : (
                          <>
                            <XCircle className="text-rose-700" size={16} /> هەڵە
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-2 font-semibold">{it.question}</div>
                  <div className="mt-1 text-[12px] text-zinc-500 dark:text-zinc-400">وشە: <span className="font-mono">{it.word}</span></div>

                  {!show ? (
                    <input
                      value={value}
                      onChange={(e) => setAnswers((s) => ({ ...s, [id]: e.target.value }))}
                      placeholder="وەڵام بنووسە…"
                      className="mt-3 w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-800 dark:bg-zinc-800 dark:border-white/10 dark:text-zinc-100"
                    />
                  ) : (
                    <div className="mt-3 text-sm">
                      <div>
                        وەڵامی تۆ:{" "}
                        <span className={`font-semibold ${right ? "text-emerald-700" : "text-rose-700"}`}>
                          {value || "—"}
                        </span>
                      </div>
                      {!right && (
                        <div>
                          وەڵامی دروست: <span className="font-semibold">{it.answer}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions (light theme consistent) */}
        <div className="border-t border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-zinc-900/90 backdrop-blur sticky bottom-0">
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              گشتی: {list.length} پرسیار
            </div>
            <div className="flex items-center gap-2">
              {!done ? (
                <>
                  <button
                    onClick={onSubmit}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                  >
                    ناردنی وەڵامەکان
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-200 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-white/10"
                  >
                    داخستن
                  </button>
                </>
              ) : (
                <button
                  onClick={onClose}
                  id="open-exam-again"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                >
                  تاقیکردنەوەی نوێ
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
