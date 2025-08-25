import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, Lightbulb, ChevronRight, ChevronLeft, Dot, CircleDot, CircleCheck, CircleX, LogOut } from 'lucide-react'; // Added LogOut icon

// --- Mock Data for Exams (Expand this with more real data!) ---
const subjects = ["بیركاری", "فیزیا", "کیمیا", "ئینگلیزی", "کوردی"];
const tracks = ["زانستی", "ئەدەبی"]; // Assuming Grade 12 has these tracks

const examsData = [
  {
    id: 'math-exam-1',
    subject: 'بیركاری',
    track: 'زانستی',
    title: 'تاقیکردنەوەی بیركاری - بەشی یەکەم',
    questions: [
      {
        id: 'm1q1',
        questionText: 'ئەم هاوکێشەیە شیکار بکە: $2x + 5 = 15$',
        options: ['x = 5', 'x = 10', 'x = 2.5', 'x = 7.5'],
        correctAnswer: 'x = 5',
        explanation: 'بۆ شیکارکردنی هاوکێشەکە، سەرەتا 5 لە هەردوو لای هاوکێشەکە کەمدەکەینەوە، دەبێتە $2x = 10$. پاشان هەردوو لای دابەش بە 2 دەکەین، کە دەبێتە $x = 5$.',
        explanationImage: null, // You can add image URLs here for complex explanations
        image: 'https://placehold.co/400x200/50b2ed/ffffff?text=Q1+Math'
      },
      {
        id: 'm1q2',
        questionText: 'چوارگۆشەی ژمارە 9 چەندە؟',
        options: ['18', '36', '81', '90'],
        correctAnswer: '81',
        explanation: 'چوارگۆشەی ژمارەیەک واتە ژمارەکە جارانی خۆی. $9 \\times 9 = 81$.',
        explanationImage: null,
        image: 'https://placehold.co/400x200/50b2ed/ffffff?text=Q2+Math'
      },
      {
        id: 'm1q3',
        questionText: 'کاتێک دوو ژمارە کۆدەکرێنەوە 10 دەدات، یەکێکیان 4 بێت ئەوی تر چەندە؟',
        options: ['4', '6', '14', '7'],
        correctAnswer: '6',
        explanation: 'بۆ دۆزینەوەی ژمارەی تر: $10 - 4 = 6$.',
        explanationImage: null,
        image: 'https://placehold.co/400x200/50b2ed/ffffff?text=Q3+Math'
      },
      {
        id: 'm1q4',
        questionText: 'ڕووبەری بازنەیەک کە نیوەتیرەکەی 7 بێت (پای = $22/7$)؟',
        options: ['154', '49', '22', '14'],
        correctAnswer: '154',
        explanation: 'ڕووبەری بازنە: $\\text{Area} = \\pi r^2$. لێرەدا $r=7$, $\\pi=22/7$. کەواتە $\\text{Area} = (22/7) \\times 7^2 = (22/7) \\times 49 = 22 \\times 7 = 154$.',
        explanationImage: null,
        image: 'https://placehold.co/400x200/50b2ed/ffffff?text=Q4+Math'
      },
      {
        id: 'm1q5',
        questionText: 'گۆشەکانی سێگۆشە چەند پلەیە؟',
        options: ['90', '180', '270', '360'],
        correctAnswer: '180',
        explanation: 'کۆ گۆشەکانی ناوەوەی سێگۆشە هەمیشە $180$ پلەیە.',
        explanationImage: null,
        image: 'https://placehold.co/400x200/50b2ed/ffffff?text=Q5+Math'
      },
    ]
  },
  {
    id: 'physics-exam-1',
    subject: 'فیزیا',
    track: 'زانستی',
    title: 'تاقیکردنەوەی فیزیا - بەشی یەکەم',
    questions: [
      {
        id: 'p1q1',
        questionText: 'کام یەکێک لەمانە یەکەی هێزە؟',
        options: ['جول', 'وات', 'نیوتن', 'پاسکال'],
        correctAnswer: 'نیوتن',
        explanation: 'نیوتن (Newton) یەکەی SI هێزە.',
        explanationImage: null,
        image: 'https://placehold.co/400x200/ef4444/ffffff?text=Q1+Physics'
      },
      {
        id: 'p1q2',
        questionText: 'یاسای دووەمی نیوتن چییە؟',
        options: ['E=mc²', 'F=ma', 'V=IR', 'P=IV'],
        correctAnswer: 'F=ma',
        explanation: 'یاسای دووەمی نیوتن باس لە پەیوەندی نێوان هێز (F)، بارستایی (m) و خێرایی (a) دەکات.',
        explanationImage: 'https://placehold.co/300x150/f0f9ff/0f172a?text=F=ma'
      },
      {
        id: 'p1q3',
        questionText: 'کاتێک تەنێک بە خێرایی جێگیر دەجوڵێت، هێزی گشتی لێی چەندە؟',
        options: ['زیاتر لە سفر', 'کەمتر لە سفر', 'سفر', 'نازانرێت'],
        correctAnswer: 'سفر',
        explanation: 'بەپێی یاسای یەکەمی نیوتن، ئەگەر هێزی گشتی سفر بێت، تەنەکە بە خێرایی جێگیر دەجوڵێت یان لە وەستاندا دەمێنێتەوە.',
        explanationImage: null,
        image: 'https://placehold.co/400x200/ef4444/ffffff?text=Q3+Physics'
      },
      {
        id: 'p1q4',
        questionText: 'کامیان سەرچاوەی وزەی نوێبووەوەیە؟',
        options: ['نەوت', 'خەڵوز', 'ڕۆژ', 'گاز'],
        correctAnswer: 'ڕۆژ',
        explanation: 'ڕۆژ سەرچاوەیەکی سروشتی و هەمیشەیی وزەیە کە بەرهەمی نوێبووەوەیە.',
        explanationImage: null,
        image: 'https://placehold.co/400x200/ef4444/ffffff?text=Q4+Physics'
      },
    ]
  },
  {
    id: 'kurdish-exam-1',
    subject: 'کوردی',
    track: 'ئەدەبی',
    title: 'تاقیکردنەوەی کوردی - گرامەر',
    questions: [
      {
        id: 'k1q1',
        questionText: 'کام وشە ناوە؟',
        options: ['ڕۆیشت', 'خۆش', 'پیاو', 'بە'],
        correctAnswer: 'پیاو',
        explanation: '"پیاو" ناوە و ناوی کەسێکە.',
        explanationImage: null,
        image: 'https://placehold.co/400x200/f97316/ffffff?text=Q1+Kurdish'
      },
      {
        id: 'k1q2',
        questionText: 'کام ڕستەیە هاوڵاتی تێدایە؟',
        options: ['من دەڕۆم', 'ئەو خوێندکارە', 'ئێمە یاری دەکەین', 'تۆ جوان بووی'],
        correctAnswer: 'ئەو خوێندکارە',
        explanation: 'لە زمانی کوردیدا "ئەو خوێندکارە" ڕستەیەکی تەواوە و "خوێندکارە" هاوڵاتییە.',
        explanationImage: null,
        image: 'https://placehold.co/400x200/f97316/ffffff?text=Q2+Kurdish'
      },
      {
        id: 'k1q3',
        questionText: 'ژمارەی پیتی بزوێن لە وشەی "کتێب" چەندە؟',
        options: ['یەک', 'دوو', 'سێ', 'چوار'],
        correctAnswer: 'دوو',
        explanation: 'پیتی بزوێن لە وشەی "کتێب" بریتین لە "ی" و "ێ".',
        explanationImage: null,
        image: 'https://placehold.co/400x200/f97316/ffffff?text=Q3+Kurdish'
      },
    ]
  },
  {
    id: 'english-exam-1',
    subject: 'ئینگلیزی',
    track: 'زانستی',
    title: 'English Exam - Grammar Basics',
    questions: [
      {
        id: 'e1q1',
        questionText: 'Which one is a verb?',
        options: ['Table', 'Run', 'Happy', 'Blue'],
        correctAnswer: 'Run',
        explanation: '"Run" is an action word.',
        explanationImage: null,
        image: 'https://placehold.co/400x200/3b82f6/ffffff?text=Q1+English'
      },
      {
        id: 'e1q2',
        questionText: 'Complete the sentence: "She ___ to the store." (Past tense)',
        options: ['go', 'goes', 'went', 'going'],
        correctAnswer: 'went',
        explanation: '"Went" is the past tense of "go", suitable for a completed action.',
        explanationImage: null,
        image: 'https://placehold.co/400x200/3b82f6/ffffff?text=Q2+English'
      },
    ]
  },
];

// --- Utility function to shuffle an array ---
const shuffleArray = (array) => {
  const newArray = [...array]; // Create a shallow copy to avoid mutating original
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// --- Main ExamsGrade12 Component ---
const ExamsGrade12 = () => {
  // --- State Management ---
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('');
  const [availableExams, setAvailableExams] = useState([]);
  const [currentExam, setCurrentExam] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // Stores {questionId: selectedOption}
  const [showResults, setShowResults] = useState(false);
  const [showOverallExplanation, setShowOverallExplanation] = useState(false); // For showing *all* explanations in results view
  const [showLiveExplanation, setShowLiveExplanation] = useState(false); // For showing *current question's* explanation live
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false); // To manage quiz flow
  const [timerDurationInput, setTimerDurationInput] = useState(''); // New state for manual timer input
  const [examMode, setExamMode] = useState('practice'); // 'practice' or 'exam'

  // --- Handlers (Moved to top for proper hoisting with useCallback) ---

  const calculateScore = useCallback(() => {
    if (!currentExam) return { correct: 0, total: 0 };
    let correctCount = 0;
    currentExam.questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    return { correct: correctCount, total: currentExam.questions.length };
  }, [currentExam, userAnswers]);

  const handleSubmitQuiz = useCallback(() => {
    setIsTimerRunning(false);
    setShowResults(true);
    setShowLiveExplanation(false); // Hide live explanation when submitting
  }, []);

  const handleNextQuestion = useCallback(() => {
    setShowLiveExplanation(false); // Hide live explanation when moving to next question
    if (currentExam && currentQuestionIndex < currentExam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // If it's the last question or no more questions, submit the quiz
      setIsTimerRunning(false);
      setShowResults(true);
    }
  }, [currentExam, currentQuestionIndex]);

  const handlePreviousQuestion = useCallback(() => {
    setShowLiveExplanation(false); // Hide live explanation when moving to previous question
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  const handleResetQuiz = useCallback(() => {
    setSelectedSubject('');
    setSelectedTrack('');
    setCurrentExam(null);
    setQuizStarted(false);
    setShowResults(false);
    setTimerSeconds(0);
    setIsTimerRunning(false);
    setUserAnswers({});
    setShowOverallExplanation(false);
    setShowLiveExplanation(false);
    setTimerDurationInput(''); // Reset timer input
    setExamMode('practice'); // Reset exam mode
  }, []);

  // New handler to exit the quiz gracefully
  const handleExitQuiz = useCallback(() => {
    // Implement confirmation if needed:
    // if (!window.confirm("دڵنیایت کە دەتەوێت لە تاقیکردنەوەکە بێیتە دەرەوە؟")) {
    //   return;
    // }
    handleResetQuiz(); // Reuse the reset function to go back to initial state
  }, [handleResetQuiz]);

  // --- Filtering available exams based on subject and track ---
  useEffect(() => {
    const filtered = examsData.filter(exam =>
      (selectedSubject ? exam.subject === selectedSubject : true) &&
      (selectedTrack ? exam.track === selectedTrack : true)
    );
    setAvailableExams(filtered);
    setCurrentExam(null); // Reset current exam if filters change
    setQuizStarted(false);
    setShowResults(false);
    setTimerSeconds(0);
    setIsTimerRunning(false);
    setUserAnswers({});
    setShowOverallExplanation(false); // Reset explanation view
    setShowLiveExplanation(false); // Reset live explanation
  }, [selectedSubject, selectedTrack]);

  // --- Timer logic ---
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prevSeconds => prevSeconds - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      handleSubmitQuiz(); // Automatically submit when timer runs out
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, handleSubmitQuiz]);

  // --- Handlers (remaining, now after the core useCallback definitions) ---
  const handleStartQuiz = (exam) => {
    // Shuffle options ONCE when the quiz starts for each question
    const newExam = {
      ...exam,
      questions: exam.questions.map(q => ({
        ...q,
        // Ensure options are shuffled and stored once per question
        shuffledOptions: shuffleArray(q.options)
      }))
    };
    setCurrentExam(newExam);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setShowOverallExplanation(false);
    setShowLiveExplanation(false);
    setQuizStarted(true);
    // Use manual timer input, or default to 1 min per question if not set
    const initialTimer = timerDurationInput ? parseInt(timerDurationInput) * 60 : newExam.questions.length * 60;
    setTimerSeconds(initialTimer);
    setIsTimerRunning(true);
  };

  const handleAnswerChange = (questionId, option) => {
    // Allow answering only if results are not being shown
    if (!showResults) {
      setUserAnswers(prev => ({ ...prev, [questionId]: option }));
      // ONLY set showLiveExplanation to true if in 'practice' mode
      // and a selection has been made (will be triggered by button, not here)
    }
  };

  const formatTime = (totalSeconds) => {
    if (totalSeconds < 0) return "00:00"; // Prevent negative time display
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentQuestion = currentExam?.questions[currentQuestionIndex];
  const score = showResults ? calculateScore() : { correct: 0, total: currentExam?.questions.length || 0 };

  // Framer Motion variants for section transitions
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } },
  };

  // Determine button styles for subject/track selection
  const getButtonClass = (isActive) =>
    `px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out whitespace-nowrap flex items-center gap-2 justify-center
     ${isActive ? "bg-indigo-600 text-white shadow-md ring-2 ring-indigo-500/50" : "bg-gray-200 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700"}`;

  // Option styling logic
  const getOptionClass = (option) => {
    const isSelected = userAnswers[currentQuestion.id] === option;
    const isCorrect = currentQuestion.correctAnswer === option;
    const isUserIncorrect = isSelected && !isCorrect; // User selected this, and it's wrong

    // When showing full results or live explanation, apply full feedback colors
    if (showResults || (examMode === 'practice' && showLiveExplanation)) {
      if (isCorrect) {
        return 'bg-green-100 border-green-500 shadow-md ring-1 ring-green-400'; // Correct answer
      } else if (isUserIncorrect) {
        return 'bg-red-100 border-red-500 shadow-md ring-1 ring-red-400'; // User chose this and it was wrong
      } else { // Unselected, incorrect options (or unselected correct if user chose wrong)
        return 'bg-gray-50 border-gray-200';
      }
    } else {
      // In active quiz mode (no results, no live explanation), only highlight selected
      return isSelected
        ? 'bg-blue-100 border-blue-500 shadow-sm'
        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-blue-300';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 border border-slate-100">
      <h2 className="text-3xl font-extrabold text-indigo-700 mb-6 text-center">
        تاقیکردنەوەکانی پۆلی ١٢ - مەشقکردن
      </h2>

      <AnimatePresence mode="wait">
        {!quizStarted && (
          <motion.div
            key="quiz-setup"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            {/* Exam Mode Selection */}
            <div className="bg-slate-50 p-4 rounded-xl shadow-inner border border-slate-100">
              <label className="block text-sm font-semibold text-gray-700 mb-3">شێوازی تاقیکردنەوە:</label>
              <div className="flex flex-wrap gap-3">
                <motion.button
                  onClick={() => setExamMode('practice')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={getButtonClass(examMode === 'practice')}
                >
                  <Lightbulb size={18} /> شێوازی مەشق (نیشاندانی وەڵام)
                </motion.button>
                <motion.button
                  onClick={() => setExamMode('exam')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={getButtonClass(examMode === 'exam')}
                >
                  <Clock size={18} /> شێوازی تاقیکردنەوە (وەڵام لە کۆتاییدا)
                </motion.button>
              </div>
            </div>

            {/* Subject Selection */}
            <div className="bg-slate-50 p-4 rounded-xl shadow-inner border border-slate-100">
              <label className="block text-sm font-semibold text-gray-700 mb-3">📚 بابەتی تاقیکردنەوە هەڵبژێرە:</label>
              <div className="flex flex-wrap gap-3">
                {subjects.map(subj => (
                  <motion.button
                    key={subj}
                    onClick={() => setSelectedSubject(subj)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={getButtonClass(selectedSubject === subj)}
                  >
                    {subj}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Track Selection (if applicable and subject selected) */}
            {selectedSubject && (
              <motion.div
                key="track-selection"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-slate-50 p-4 rounded-xl shadow-inner border border-slate-100 overflow-hidden" // overflow-hidden for height animation
              >
                <label className="block text-sm font-semibold text-gray-700 mb-3">لقی خوێندن:</label>
                <div className="flex flex-wrap gap-3">
                  {tracks.map(track => (
                    <motion.button
                      key={track}
                      onClick={() => setSelectedTrack(track)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={getButtonClass(selectedTrack === track)}
                    >
                      {track}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Timer Duration Input (Only visible if Exam Mode is selected) */}
            {examMode === 'exam' && (
              <motion.div
                key="timer-input-section"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-slate-50 p-4 rounded-xl shadow-inner border border-slate-100 overflow-hidden"
              >
                <label htmlFor="timer-duration" className="block text-sm font-semibold text-gray-700 mb-3">⏰ ماوەی تاقیکردنەوە (خولەک):</label>
                <input
                  id="timer-duration"
                  type="number"
                  min="1"
                  placeholder="بۆ نموونە: 30"
                  value={timerDurationInput}
                  onChange={(e) => setTimerDurationInput(e.target.value)}
                  className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400 text-right"
                />
                <p className="text-xs text-gray-500 mt-1">ئەگەر بەتاڵ بێت، 1 خولەک بۆ هەر پرسیارێک دادەنرێت.</p>
              </motion.div>
            )}

            {/* Available Exams List */}
            {availableExams.length > 0 && selectedSubject ? (
              <motion.div
                key="available-exams"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-slate-50 p-4 rounded-xl shadow-inner border border-slate-100"
              >
                <label className="block text-sm font-semibold text-gray-700 mb-3">تاقیکردنەوە بەردەستەکان:</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableExams.map(exam => (
                    <motion.button
                      key={exam.id}
                      onClick={() => handleStartQuiz(exam)}
                      whileHover={{ scale: 1.02, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
                      whileTap={{ scale: 0.98 }}
                      className="flex flex-col items-start p-4 rounded-lg bg-white border border-blue-200 text-right shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <span className="text-lg font-semibold text-blue-700">{exam.title}</span>
                      <span className="text-sm text-gray-600">ژمارەی پرسیارەکان: {exam.questions.length}</span>
                      <span className="text-xs text-gray-500">{exam.subject} - {exam.track}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              selectedSubject && (
                <motion.div
                  key="no-exams"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-gray-500 text-base py-4"
                >
                  هیچ تاقیکردنەوەیەک نەدۆزرایەوە بۆ ئەم بابەت/لقە.
                </motion.div>
              )
            )}
          </motion.div>
        )}

        {/* Quiz Interface */}
        {quizStarted && currentExam && (
          <motion.div
            key="quiz-active"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            {/* Quiz Header (Title + Timer + Exit Button) */}
            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl shadow-inner border border-blue-100">
              <h3 className="text-xl font-bold text-blue-800">{currentExam.title}</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-blue-700 font-semibold">
                  <Clock size={20} />
                  <span>{formatTime(timerSeconds)}</span>
                </div>
                <motion.button
                  onClick={handleExitQuiz}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition flex items-center gap-1"
                >
                  <LogOut size={18} /> لابردن
                </motion.button>
              </div>
            </div>

            {/* Question Navigation Dots */}
            <div className="flex flex-wrap justify-center gap-2 py-3 bg-gray-50 rounded-xl shadow-inner border border-gray-100">
              {currentExam.questions.map((q, idx) => (
                <motion.button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold
                    ${idx === currentQuestionIndex
                      ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/50' // Current question
                      : (showResults && userAnswers[q.id] === q.correctAnswer)
                        ? 'bg-green-500 text-white' // Correctly answered
                        : (showResults && userAnswers[q.id] && userAnswers[q.id] !== q.correctAnswer)
                          ? 'bg-red-500 text-white' // Incorrectly answered
                          : userAnswers[q.id]
                            ? 'bg-blue-200 text-blue-800' // Answered but not yet checked
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300' // Unanswered
                    }`}
                >
                  {/* Using index for numbers */}
                  {idx + 1}
                </motion.button>
              ))}
            </div>


            {/* Question Display */}
            {currentQuestion && (
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-4">
                <p className="text-lg font-semibold text-gray-800">
                  پرسیار {currentQuestionIndex + 1} لە {currentExam.questions.length}:
                </p>
                {currentQuestion.image && (
                  <img src={currentQuestion.image} alt="Question visual" className="w-full max-h-60 object-contain rounded-lg mb-4" />
                )}
                <div className="text-xl font-medium text-gray-900 leading-relaxed q-text" dangerouslySetInnerHTML={{ __html: currentQuestion.questionText.replace(/\$\$(.*?)\$\$/g, '<span class="latex-math">$$$1$$</span>').replace(/\$(.*?)\$/g, '<span class="latex-math">$1</span>') }} />

                <div className="space-y-3 mt-5">
                  {/* Use shuffledOptions for consistent order */}
                  {currentQuestion.shuffledOptions.map((option, idx) => {
                    const isSelected = userAnswers[currentQuestion.id] === option;
                    const isCorrect = currentQuestion.correctAnswer === option;
                    const isUserIncorrect = isSelected && !isCorrect;

                    return (
                      <motion.label
                        key={idx}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200
                          ${getOptionClass(option)}
                          ${(showLiveExplanation || showResults) && (isCorrect || isUserIncorrect) ? 'transform scale-[1.01] transition-transform' : ''}
                        `}
                        whileHover={!(showLiveExplanation || showResults) ? { scale: 1.01, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" } : {}}
                        whileTap={!(showLiveExplanation || showResults) ? { scale: 0.99 } : {}}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={option}
                          checked={isSelected}
                          onChange={() => handleAnswerChange(currentQuestion.id, option)}
                          className="ml-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                          disabled={showResults} // Disable input if results are shown (prevents changing answers after submit)
                        />
                        <span className="text-gray-800 font-medium flex-grow">{option}</span>
                        {/* Show icons if live feedback or full results OR in practice mode if an answer is selected for current question */}
                        {((examMode === 'practice' && showLiveExplanation && userAnswers[currentQuestion.id]) || showResults) && ( // show icon if live explanation and user has selected an answer
                          <AnimatePresence>
                            {isCorrect && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <CheckCircle2 size={20} className="text-green-600 mr-2" />
                              </motion.div>
                            )}
                            {isUserIncorrect && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <XCircle size={20} className="text-red-600 mr-2" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}
                      </motion.label>
                    );
                  })}
                </div>

                {/* Show Live Explanation Button (Only in Practice Mode if an answer is selected) */}
                {examMode === 'practice' && userAnswers[currentQuestion.id] && !showResults && (
                    <motion.button
                        onClick={() => setShowLiveExplanation(prev => !prev)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-full font-semibold hover:bg-yellow-700 transition mx-auto mt-4"
                    >
                        <Lightbulb size={20} />
                        {showLiveExplanation ? 'شاردنەوەی وەڵام' : 'بینینی وەڵامی دروست و شیکار'}
                    </motion.button>
                )}


                {/* Navigation and Actions */}
                <div className="flex flex-wrap justify-between gap-3 mt-6 pt-4 border-t border-gray-100">
                  <motion.button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0 || showResults}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                  >
                    <ChevronRight size={18} /> پرسیاری پێشوو
                  </motion.button>
                  
                  {currentQuestionIndex === currentExam.questions.length - 1 ? (
                    <motion.button
                      onClick={handleSubmitQuiz}
                      disabled={showResults}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                    >
                      ناردن <CheckCircle2 size={18} />
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={handleNextQuestion}
                      disabled={showResults}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                    >
                      پرسیاری داهاتوو <ChevronLeft size={18} />
                    </motion.button>
                  )}
                </div>
              </div>
            )}

            {/* Live Solution and Explanation Section (for current question) */}
            <AnimatePresence>
              {showLiveExplanation && currentQuestion && (
                <motion.div
                  key="live-explanation"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="bg-green-50 p-6 rounded-xl shadow-md border border-green-200 mt-4 space-y-4"
                >
                  <h4 className="text-xl font-bold text-green-700 flex items-center gap-2">
                    <CheckCircle2 size={24} /> وەڵامی دروست:
                  </h4>
                  <p className="text-lg font-semibold text-green-800">{currentQuestion.correctAnswer}</p>

                  <h4 className="text-xl font-bold text-purple-700 flex items-center gap-2">
                    <Lightbulb size={24} /> شیکار:
                  </h4>
                  {currentQuestion.explanationImage && (
                    <img src={currentQuestion.explanationImage} alt="Explanation Visual" className="w-full max-h-80 object-contain rounded-lg mb-4" />
                  )}
                  <div className="text-base text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: currentQuestion.explanation.replace(/\$\$(.*?)\$\$/g, '<span class="latex-math">$$$1$$</span>').replace(/\$(.*?)\$/g, '<span class="latex-math">$1</span>') }} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results Summary (if showResults is true) */}
            <AnimatePresence>
              {showResults && (
                <motion.div
                  key="results-summary"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="bg-blue-100 p-6 rounded-xl shadow-md border border-blue-200 mt-6 text-center space-y-3"
                >
                  <h3 className="text-2xl font-bold text-blue-800">ئەنجامی تاقیکردنەوە</h3>
                  <p className="text-xl font-semibold text-gray-700">
                    {score.correct} لە {score.total} پرسیار دروست بوون!
                  </p>

                  {/* Toggle to show/hide all correct answers */}
                  <motion.button
                    onClick={() => setShowOverallExplanation(prev => !prev)} // Controls display of all answers
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-full font-semibold hover:bg-yellow-700 transition mx-auto mt-4"
                  >
                    <Lightbulb size={20} />
                    {showOverallExplanation ? 'شاردنەوەی وەڵامەکان' : 'بینینی وەڵامی دروست بۆ هەموو پرسیارەکان'}
                  </motion.button>

                  {/* Display all correct answers and user's answers */}
                  <AnimatePresence>
                    {showOverallExplanation && (
                      <motion.div
                        key="all-answers-detailed"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="text-right mt-6 p-4 bg-white rounded-xl border border-gray-200 space-y-4 overflow-hidden"
                      >
                        <h4 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">هەموو وەڵامەکان:</h4>
                        {currentExam.questions.map((q, idx) => (
                          <div key={q.id} className="border-b border-gray-100 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
                            <p className="font-semibold text-gray-900">پرسیار {idx + 1}: <span dangerouslySetInnerHTML={{ __html: q.questionText.replace(/\$\$(.*?)\$\$/g, '<span class="latex-math">$$$1$$</span>').replace(/\$(.*?)\$/g, '<span class="latex-math">$1</span>') }} /></p>
                            <p className="text-sm text-gray-600 flex items-center">
                              وەڵامی تۆ: <span className={`mr-2 font-medium ${userAnswers[q.id] === q.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                                {userAnswers[q.id] || 'وەڵام نەدراوەتەوە'}
                              </span>
                              {userAnswers[q.id] === q.correctAnswer ? (
                                <CheckCircle2 size={16} className="text-green-600" />
                              ) : (
                                <XCircle size={16} className="text-red-600" />
                              )}
                            </p>
                            <p className="text-sm text-green-700 flex items-center">
                              وەڵامی دروست: <span className="mr-2 font-medium">{q.correctAnswer}</span>
                            </p>
                            <motion.button
                              onClick={() => {
                                setCurrentQuestionIndex(idx);
                                setShowResults(false); // Exit results view
                                setShowLiveExplanation(true); // Show explanation for this question
                                // Optional: scroll to top of quiz interface
                                const quizInterface = document.getElementById('quiz-active-section');
                                if (quizInterface) quizInterface.scrollIntoView({ behavior: 'smooth' });
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="text-blue-500 text-xs mt-1 hover:underline flex items-center gap-1 mx-auto"
                            >
                              <Lightbulb size={14} /> بینینی شیکار
                            </motion.button>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-center gap-4 pt-4 border-t border-blue-200 mt-6">
                    <motion.button
                      onClick={handleResetQuiz}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                      دووبارە دەستپێکردنەوە
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamsGrade12;
