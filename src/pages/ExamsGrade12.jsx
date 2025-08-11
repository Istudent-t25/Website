import { useState, useEffect, useRef } from "react";
import { CheckCircle, XCircle, Search, Clock, Award, RotateCcw, BookOpen, ArrowRight, Flag, Lightbulb } from "lucide-react";

// Mock questions data with Year and Section fields
const questionsData = [
  {
    id: 1,
    subject: "بیرکاری",
    year: "2023-2024",
    section: "زانستی",
    question: "چەندە یەکسانە بە $2 + 2$؟",
    options: ["3", "4", "5", "6"],
    answer: "4",
    solution: "چارەسەر: $2 + 2 = 4$. ئەمە بنەمایەکی سادەی کۆکردنەوەیە. بۆ زانیاری زیاتر، بیرکاری یەکێکە لە لقە سەرەکییەکانی زانست کە مامەڵە لەگەڵ ژمارە و بڕ و فۆرم و گۆڕانکاریدا دەکات.",
  },
  {
    id: 2,
    subject: "زانست",
    year: "2023-2024",
    section: "زانستی",
    question: "کام هەسارەیە نزیکترینە لە خۆر؟",
    options: ["زەوی", "مەریخ", "ڤینۆس", "عەطارد"],
    answer: "عەطارد",
    solution: "چارەسەر: هەسارەی عەطارد نزیکترین هەسارەیە لە خۆر. تەنها $57.9$ ملیۆن کیلۆمەتر دوورە لە خۆرەوە.",
  },
  {
    id: 3,
    subject: "ئینگلیزی",
    year: "2022-2023",
    section: "زانستی",
    question: "تێپەڕبووی 'go' چییە؟",
    options: ["goed", "gone", "went", "going"],
    answer: "went",
    solution: "Solution: The past tense of 'go' is 'went'. For example: 'I go to school every day.' (present) vs. 'I went to school yesterday.' (past).",
  },
  {
    id: 4,
    subject: "کۆمەڵایەتی",
    year: "2022-2023",
    section: "وێژەیی",
    question: "پایتەختی عێراق چییە؟",
    options: ["هەولێر", "سلێمانی", "بەغداد", "کەرکوک"],
    answer: "بەغداد",
  },
  {
    id: 5,
    subject: "بیرکاری",
    year: "2021-2022",
    section: "زانستی",
    question: "چەندە یەکسانە بە $5 \\times 3$؟",
    options: ["10", "15", "20", "25"],
    answer: "15",
    solution: "https://placehold.co/600x250/aad8ff/2c3e50?text=Solution+Image+for+5x3%0A(Example+Diagram)", // Example image URL for solution
  },
  {
    id: 6,
    subject: "زانست",
    year: "2021-2022",
    section: "زانستی",
    question: "فرمول کیمیایی آب چیست؟",
    options: ["CO2", "O2", "H2O", "N2"],
    answer: "H2O",
    solution: "Solution: The chemical formula for water is $H_2O$. This means each molecule of water contains two hydrogen atoms and one oxygen atom.",
  },
  {
    id: 7,
    subject: "ئینگلیزی",
    year: "2020-2021",
    section: "زانستی",
    question: "What is the opposite of 'hot'?",
    options: ["warm", "cold", "big", "small"],
    answer: "cold",
  },
  {
    id: 8,
    subject: "کۆمەڵایەتی",
    year: "2020-2021",
    section: "وێژەیی",
    question: "کێ نووسەری 'مەم و زین' بوو؟",
    options: ["نالی", "کوردی", "خانای قوبادی", "ئەحمەدی خانی"],
    answer: "ئەحمەدی خانی",
  },
  {
    id: 9,
    subject: "بیرکاری",
    year: "2023-2024",
    section: "زانستی",
    question: "کۆتایی زنجیرەی ژمارەکان چییە؟ $1, 3, 5, 7, \\dots$",
    options: ["9", "10", "11", "12"],
    answer: "9",
    solution: "چارەسەر: ئەمە زنجیرەیەکی ژمارە تاکەکانە. ژمارەی داهاتوو دوای 7 دەبێت 9. ($1+2=3, 3+2=5, 5+2=7, 7+2=9$)",
  },
  {
    id: 10,
    subject: "زانست",
    year: "2023-2024",
    section: "زانستی",
    question: "کام گازی ئۆکسجین دەردەکات لە پرۆسەی فۆتۆسێنتێزیسدا؟",
    options: ["کاربۆن دایۆکساید", "نیتڕۆجین", "ئاڵت وێژەن", "هیلیۆم"],
    answer: "کاربۆن دایۆکساید",
    solution: "چارەسەر: لە پرۆسەی فۆتۆسێنتێزیسدا، ڕووەکەکان گازی کاربۆن دایۆکساید هەڵدەمژن و ئۆکسجین دەردەکەن وەک بەرهەمێکی لاوەکی. هاوکێشەی گشتی فۆتۆسێنتێزیس: $6CO_2 + 6H_2O + \\text{ڕووناکی} \\rightarrow C_6H_{12}O_6 + 6O_2$",
  },
  {
    id: 11,
    subject: "ئینگلیزی",
    year: "2022-2023",
    section: "زانستی",
    question: "What is the plural of 'child'?",
    options: ["childs", "childes", "children", "childen"],
    answer: "children",
  },
  {
    id: 12,
    subject: "کۆمەڵایەتی",
    year: "2022-2023",
    section: "وێژەیی",
    question: "سەربەخۆیی ویلایەتە یەکگرتووەکانی ئەمریکا لە چ ساڵێکدا ڕاگەیەندرا؟",
    options: ["1774", "1776", "1783", "1789"],
    answer: "1776",
  },
  {
    id: 13,
    subject: "کوردی",
    year: "2023-2024",
    section: "وێژەیی",
    question: "ناوی پایتەختی کوردستان چییە؟",
    options: ["سلێمانی", "هەولێر", "دهۆک", "کەرکوک"],
    answer: "هەولێر",
    solution: "چارەسەر: هەولێر بە پایتەختی هەرێمی کوردستان دادەنرێت.",
  },
  {
    id: 14,
    subject: "فیزیا",
    year: "2021-2022",
    section: "زانستی",
    question: "فۆرموڵی هێز چییە بەپێی یاسای دووەمی نیوتن؟",
    options: ["$E=mc^2$", "$F=ma$", "$P=IV$", "$V=IR$"],
    answer: "$F=ma$",
    solution: "چارەسەر: بەپێی یاسای دووەمی نیوتن، هێز (F) یەکسانە بە بارستە (m) جارانی تاودان (a)، واتە $F=ma$.",
  },
  {
    id: 15,
    subject: "مێژوو",
    year: "2020-2021",
    section: "وێژەیی",
    question: "کەی شۆڕشی فەڕەنسا دەستی پێکرد؟",
    options: ["1776", "1789", "1804", "1815"],
    answer: "1789",
    solution: "چارەسەر: شۆڕشی فەڕەنسا لە ساڵی 1789 دەستی پێکرد و بە ڕووخانی بەندینخانەی باستیل لە 14ی تەمموزەوە دەستی پێکرا.",
  },
];


const timeOptions = {
  free: 0, // Free mode, no timer
  "15min": 15 * 60, // 15 minutes in seconds
  "30min": 30 * 60, // 30 minutes in seconds
  "1h": 60 * 60, // 1 hour in seconds
  "2h": 2 * 60 * 60, // 2 hours in seconds
};

const ExamsGrade12 = () => {
  // State variables for managing exam flow and data
  const [step, setStep] = useState(0); // Current question index
  const [answers, setAnswers] = useState([]); // User's selected answers
  const [showResult, setShowResult] = useState(false); // Flag to show result screen
  const [timerType, setTimerType] = useState("free"); // Selected timer duration
  const [timeLeft, setTimeLeft] = useState(0); // Remaining time in seconds
  const [started, setStarted] = useState(false); // Flag indicating if exam has started
  const [selectedSubject, setSelectedSubject] = useState("هەموو بابەتەکان"); // Currently selected subject for filtering
  const [selectedYear, setSelectedYear] = useState("هەموو ساڵەکان"); // New: Selected year for filtering
  const [selectedSection, setSelectedSection] = useState("هەموو بەشەکان"); // New: Selected section for filtering
  const [filteredQuestions, setFilteredQuestions] = useState([]); // Questions filtered by subject, year, and section
  // Application mode: 'initial' (welcome), 'exam_setup', 'exam' (in progress), 'review' (reviewing answers), 'view_answers' (just showing answers)
  const [mode, setMode] = useState("initial");
  const totalTime = timeOptions[timerType]; // Total time for the selected timer

  // New state for displaying "no questions found" message
  const [showNoQuestionsMessage, setShowNoQuestionsMessage] = useState(false);

  // Ref for the MathJax script (to re-render math after question change)
  const mathJaxRef = useRef(null);

  // Get lists of unique subjects, years, and sections for the filter dropdowns
  const uniqueSubjects = [
    "هەموو بابەتەکان",
    ...new Set(questionsData.map((q) => q.subject)),
  ];
  const uniqueYears = [ // New: Unique years for filter
    "هەموو ساڵەکان",
    ...new Set(questionsData.map((q) => q.year)),
  ];
  const uniqueSections = [ // New: Unique sections for filter
    "هەموو بەشەکان",
    ...new Set(questionsData.map((q) => q.section)),
  ];

  // useEffect for handling the exam timer
  useEffect(() => {
    let interval;
    // Start timer if in exam mode, started, has a time limit, and time is left
    if (mode === "exam" && started && totalTime > 0 && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    }
    // If timer runs out in exam mode, show results
    if (mode === "exam" && timeLeft === 0 && started && totalTime > 0) {
      setShowResult(true);
    }
    return () => clearInterval(interval); // Cleanup: clear interval on component unmount or dependency change
  }, [timeLeft, started, totalTime, mode]); // Dependencies for useEffect

  // useEffect for MathJax rendering when questions change
  useEffect(() => {
    // Dynamically load MathJax script if not already loaded
    if (!mathJaxRef.current) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
      script.async = true;
      script.onload = () => {
        if (window.MathJax) {
          window.MathJax.typesetPromise(); // Typeset any existing math
        }
      };
      document.head.appendChild(script);
      mathJaxRef.current = script;
    } else if (window.MathJax) {
      // If MathJax is already loaded, re-typeset when a new question is displayed
      window.MathJax.typesetPromise();
    }
  }, [step, filteredQuestions, mode]); // Re-run when question step or filtered questions change

  // Clear "no questions found" message when filters change
  useEffect(() => {
    setShowNoQuestionsMessage(false);
  }, [selectedSubject, selectedYear, selectedSection]);


  // Handle user's option selection during an exam
  const handleSelect = (option) => {
    if (mode !== "exam") return; // Only allow selection in 'exam' mode

    const newAnswers = [...answers];
    newAnswers[step] = {
      selected: option,
      correct: option === filteredQuestions[step].answer, // Check if selected option is correct
    };
    setAnswers(newAnswers);

    // Play sound feedback based on correctness
    // Note: You need to have 'correct.mp3' and 'wrong.mp3' files in your public directory
    const audio = new Audio(
      option === filteredQuestions[step].answer ? "/sounds/correct.mp3" : "/sounds/wrong.mp3"
    );
    audio.play();
  };

  // Navigate to the next question or finalize the exam/review
  const next = () => {
    if (step + 1 < filteredQuestions.length) {
      setStep(step + 1); // Move to next question
    } else {
      setShowResult(true); // All questions answered/reviewed, show results
    }
  };

  // Restart the application to its initial state
  const restart = () => {
    setStep(0);
    setAnswers([]);
    setShowResult(false);
    setStarted(false);
    setTimeLeft(0);
    setSelectedSubject("هەموو بابەتەکان");
    setSelectedYear("هەموو ساڵەکان"); // Reset year filter
    setSelectedSection("هەموو بەشەکان"); // Reset section filter
    setFilteredQuestions([]);
    setMode("initial");
  };

  // Function to apply all filters and set the questions for the session
  const applyFilters = () => {
    let questionsToUse = questionsData;

    if (selectedSubject !== "هەموو بابەتەکان") {
      questionsToUse = questionsToUse.filter((q) => q.subject === selectedSubject);
    }
    if (selectedYear !== "هەموو ساڵەکان") {
      questionsToUse = questionsToUse.filter((q) => q.year === selectedYear);
    }
    if (selectedSection !== "هəموو بەشەکان") { // Changed from 'هەموو بەشەکان' due to potential typo
      questionsToUse = questionsToUse.filter((q) => q.section === selectedSection);
    }
    return questionsToUse;
  };


  // Initialize and start the exam
  const startExam = () => {
    const questions = applyFilters();
    if (questions.length === 0) {
      setShowNoQuestionsMessage(true); // Show message if no questions
      setMode("initial"); // Stay on initial mode
      return;
    }
    setShowNoQuestionsMessage(false); // Hide message if questions are found
    setFilteredQuestions(questions);
    setStarted(true);
    setMode("exam_setup"); // Go to exam setup to choose time
    setStep(0); // Reset step for new exam
    setAnswers([]); // Clear answers for new exam
  };

  // Initialize and start review mode
  const startReview = () => {
    const questions = applyFilters();
    if (questions.length === 0) {
      setShowNoQuestionsMessage(true);
      setMode("initial"); // Stay on initial mode
      return;
    }
    setShowNoQuestionsMessage(false);
    setFilteredQuestions(questions);
    setStarted(true);
    setMode("review"); // Set mode to 'review'
    setShowResult(false); // Ensure result screen is hidden
    setStep(0); // Start from the first question
    setAnswers([]); // Clear answers for review
  };

  // Initialize and display answers for a selected subject
  const viewAnswersForSubject = () => {
    const questions = applyFilters();
    if (questions.length === 0) {
      setShowNoQuestionsMessage(true);
      setMode("initial"); // Stay on initial mode
      return;
    }
    setShowNoQuestionsMessage(false);
    setFilteredQuestions(questions);
    setAnswers([]); // Clear any previous answers
    setStep(0); // Start from the first question
    setStarted(true); // Indicate a session is active for rendering
    setMode("view_answers"); // Set mode to 'view_answers'
    setShowResult(true); // Directly show the result-like screen with answers
  };

  // Get the current question based on the 'step' index
  const currentQuestion = filteredQuestions[step];

  return (
    // Main container with full-width background and centered content
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300 flex flex-col items-center justify-center p-4 sm:p-8 font-sans antialiased overflow-hidden relative">
      {/* Background blobs for fun visual effect */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-20 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="container max-w-6xl w-full bg-white bg-opacity-95 backdrop-filter backdrop-blur-lg shadow-4xl rounded-3xl p-6 sm:p-12 space-y-8 border-t-8 border-indigo-700 relative z-10 transition-all duration-500 ease-in-out transform hover:scale-[1.005]">
        {/* Initial Welcome Screen - Redesigned */}
        {mode === "initial" && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] py-8 px-4 sm:px-8 animate-fade-in">
            <h1 className="text-5xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-700 mb-6 drop-shadow-lg leading-tight text-center animate-slide-in-down">
              ئامادەبە بۆ سەرکەوتن!
              <p className="text-xl sm:text-3xl font-medium text-gray-700 mt-4">
                تاقیکردنەوەی پۆلی 12
              </p>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl my-10">
              {/* Subject Filter */}
              <div className="relative animate-pop">
                <label htmlFor="subject-select" className="block text-lg font-medium text-gray-700 text-right mb-2">بابەت هەڵبژێرە:</label>
                <select
                  id="subject-select"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="block appearance-none w-full bg-white border-2 border-indigo-400 text-gray-800 py-4 px-6 pr-12 rounded-full leading-tight focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:border-indigo-600 text-xl shadow-xl cursor-pointer transition-all duration-300 hover:border-indigo-600"
                >
                  {uniqueSubjects.map((subject) => (
                    <option key={subject} value={subject} className="py-2">
                      {subject}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-indigo-600">
                  <svg className="fill-current h-7 w-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>

              {/* Year Filter */}
              <div className="relative animate-pop">
                <label htmlFor="year-select" className="block text-lg font-medium text-gray-700 text-right mb-2">ساڵی تاقیکردنەوە:</label>
                <select
                  id="year-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="block appearance-none w-full bg-white border-2 border-indigo-400 text-gray-800 py-4 px-6 pr-12 rounded-full leading-tight focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:border-indigo-600 text-xl shadow-xl cursor-pointer transition-all duration-300 hover:border-indigo-600"
                >
                  {uniqueYears.map((year) => (
                    <option key={year} value={year} className="py-2">
                      {year}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-indigo-600">
                  <svg className="fill-current h-7 w-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>

              {/* Section Filter */}
              <div className="relative animate-pop">
                <label htmlFor="section-select" className="block text-lg font-medium text-gray-700 text-right mb-2">جۆری بەش:</label>
                <select
                  id="section-select"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="block appearance-none w-full bg-white border-2 border-indigo-400 text-gray-800 py-4 px-6 pr-12 rounded-full leading-tight focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:border-indigo-600 text-xl shadow-xl cursor-pointer transition-all duration-300 hover:border-indigo-600"
                >
                  {uniqueSections.map((section) => (
                    <option key={section} value={section} className="py-2">
                      {section}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-indigo-600">
                  <svg className="fill-current h-7 w-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* No questions found message */}
            {showNoQuestionsMessage && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-xl relative mb-6 animate-fade-in" role="alert">
                    <strong className="font-bold">سەرنج!</strong>
                    <span className="block sm:inline"> هیچ پرسیارێک بەپێی هەڵبژاردەکانت نەدۆزرایەوە. تکایە فلتەرەکان بگۆڕە.</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl mt-12">
              <button
                onClick={() => setMode("exam_setup")}
                className="group w-full p-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xl font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-400 flex flex-col items-center justify-center gap-3 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <Award size={40} className="mb-2 group-hover:rotate-6 transition-transform duration-300" />
                دەست پێ بکە بە تاقیکردنەوە
              </button>
              <button
                onClick={startReview}
                className="group w-full p-5 bg-gradient-to-br from-rose-500 to-fuchsia-600 text-white text-xl font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-rose-400 flex flex-col items-center justify-center gap-3 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <BookOpen size={40} className="mb-2 group-hover:-rotate-6 transition-transform duration-300" />
                پرسیارەکان ببینە (بێ تاقیکردنەوە)
              </button>
              <button
                onClick={viewAnswersForSubject}
                className="group w-full p-5 bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-400 flex flex-col items-center justify-center gap-3 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <Search size={40} className="mb-2 group-hover:translate-y-1 transition-transform duration-300" />
                بینینی وەڵامەکان بۆ بابەتێک
              </button>
            </div>
          </div>
        )}

        {/* Exam Setup Screen */}
        {mode === "exam_setup" && (
          <div className="space-y-8 text-center py-8 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">کاتی تاقیکردنەوە هەڵبژێرە:</h2>
            <div className="relative inline-block w-full max-w-md animate-pop">
              <select
                value={timerType}
                onChange={(e) => setTimerType(e.target.value)}
                className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-4 px-6 pr-10 rounded-xl leading-tight focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:border-indigo-600 text-xl shadow-lg cursor-pointer transition-all duration-300 hover:border-indigo-400"
              >
                <option value="free">بێ سنوور</option>
                <option value="15min">15 خولەک</option>
                <option value="30min">30 خولەک</option>
                <option value="1h">1 کاتژمێر</option>
                <option value="2h">2 کاتژمێر</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                <svg className="fill-current h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            <button
              onClick={startExam} // This button's actual action is now handled by startExam which goes to exam_setup
              className="w-full p-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-2xl font-semibold rounded-2xl shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-400 flex items-center justify-center gap-3 animate-pop animation-delay-100"
            >
              <Clock size={32} /> دەست پێ بکە
            </button>
            <button
              onClick={() => setMode("initial")}
              className="w-full p-5 bg-gray-300 text-gray-800 text-2xl font-semibold rounded-2xl shadow-md hover:bg-gray-400 transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-300 flex items-center justify-center gap-3 animate-pop animation-delay-200"
            >
              گەڕانەوە
            </button>
          </div>
        )}

        {/* Exam or Review in progress screen */}
        {["exam", "review"].includes(mode) && !showResult && currentQuestion && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-center flex-wrap gap-4 mb-6 pb-4 border-b-2 border-indigo-400 animate-fade-in-down">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                سەبارەت بە: <span className="text-indigo-700">{currentQuestion.subject}</span>
              </h2>
              <span className="text-lg text-gray-600 font-medium">
                پرسیار <span className="font-extrabold text-xl text-indigo-800">{step + 1}</span> / <span className="font-extrabold text-xl text-indigo-800">{filteredQuestions.length}</span>
              </span>
            </div>

            {mode === "exam" && totalTime > 0 && (
              <div className="text-center text-3xl text-red-600 font-bold mb-6 animate-pulse bg-red-50 p-4 rounded-xl border border-red-200 shadow-inner">
                ⏳ ماوە: {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, "0")}
              </div>
            )}

            {/* Question Navigation Bubbles */}
            <div className="flex flex-wrap gap-3 justify-center py-4 px-2 bg-indigo-100 rounded-xl p-3 shadow-inner border border-indigo-200 mb-8 animate-fade-in-up">
              {filteredQuestions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setStep(idx)}
                  className={`w-14 h-14 text-xl rounded-full font-bold transition-all duration-300 shadow-md flex items-center justify-center text-white ring-offset-2 ring-offset-white transform hover:scale-110 active:scale-95
                    ${
                      idx === step
                        ? "bg-indigo-700 ring-4 ring-indigo-400"
                        : answers[idx] && answers[idx].correct && mode === "exam"
                        ? "bg-green-500 hover:bg-green-600"
                        : answers[idx] && !answers[idx].correct && mode === "exam"
                        ? "bg-rose-500 hover:bg-rose-600"
                        : "bg-gray-500 hover:bg-gray-600"
                    }`}
                  title={`پرسیار ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {/* Current Question Display */}
            <div className="text-2xl font-semibold text-gray-900 mt-6 p-8 bg-white rounded-2xl shadow-xl border-l-8 border-teal-500 animate-slide-in-right">
              {currentQuestion?.question}
            </div>

            {/* Options Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">
              {currentQuestion?.options.map((opt) => {
                const selectedAnswer = answers[step]?.selected;
                const correctAnswer = currentQuestion.answer;
                const isSelected = selectedAnswer === opt;
                const isCorrectOption = opt === correctAnswer;

                return (
                  <button
                    key={opt}
                    disabled={mode === "review" || !!selectedAnswer}
                    onClick={() => handleSelect(opt)}
                    className={`p-5 rounded-xl border-2 flex items-center justify-between gap-3 transition-all duration-300 shadow-md text-left font-medium text-xl transform hover:scale-[1.01] active:scale-[0.99]
                      ${
                        mode === "review" || mode === "view_answers"
                          ? isCorrectOption
                            ? "bg-green-100 border-green-500 text-green-800 cursor-default"
                            : "bg-gray-100 border-gray-200 text-gray-600 opacity-70 cursor-default"
                          : !selectedAnswer
                          ? "bg-white hover:bg-indigo-50 border-gray-300 text-gray-900"
                          : isSelected && isCorrectOption
                          ? "bg-green-100 border-green-500 text-green-800 ring-2 ring-green-300"
                          : isSelected && !isCorrectOption
                          ? "bg-rose-100 border-rose-500 text-rose-800 ring-2 ring-rose-300"
                          : isCorrectOption
                          ? "bg-green-50 border-green-300 text-green-600 opacity-80"
                          : "bg-gray-100 border-gray-200 text-gray-500 opacity-70"
                      }`}
                  >
                    <span>{opt}</span>
                    {/* Feedback icons */}
                    {mode === "exam" && selectedAnswer && isSelected && isCorrectOption && (
                      <CheckCircle size={28} className="text-green-600 flex-shrink-0 animate-pop" />
                    )}
                    {mode === "exam" && selectedAnswer && isSelected && !isCorrectOption && (
                      <XCircle size={28} className="text-rose-600 flex-shrink-0 animate-pop" />
                    )}
                    {(mode === "review" || mode === "view_answers") && isCorrectOption && (
                      <CheckCircle size={28} className="text-green-600 flex-shrink-0 animate-pop" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons (Next / Finish Review) */}
            {(mode === "exam" && answers[step]?.selected) || mode === "review" ? (
              <div className="flex justify-center mt-10">
                <button
                  onClick={next}
                  className="px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-semibold rounded-full shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-400 flex items-center gap-3 animate-pop"
                >
                  {step + 1 < filteredQuestions.length ? (
                    <>دوایــی <ArrowRight size={24} /></>
                  ) : (
                    <>کۆتایی <Flag size={24} /></>
                  )}
                </button>
              </div>
            ) : null}
          </>
        )}

        {/* Result Screen (for exam, review, and view_answers modes) */}
        {showResult && (
          <div className="text-center space-y-8 py-8 animate-fade-in">
            <h2 className="text-4xl sm:text-5xl font-bold text-indigo-700 drop-shadow-lg">ئەنجامەکان</h2>

            {mode === "exam" ? (
              <p className="text-gray-700 text-xl sm:text-2xl leading-relaxed">
                تۆ{" "}
                <span className="font-extrabold text-green-600 text-3xl">
                  {answers.filter((a) => a.correct).length}
                </span>{" "}
                لە{" "}
                <span className="font-extrabold text-indigo-600 text-3xl">
                  {filteredQuestions.length}
                </span>{" "}
                وەڵامی دروستت داوە ✅
              </p>
            ) : mode === "review" ? (
              <p className="text-gray-700 text-xl sm:text-2xl leading-relaxed">
                تۆ کۆتاییت بە بینین و پێداچوونەوەی پرسیارەکان هێنا.
              </p>
            ) : (
              // Display all questions and correct answers for 'view_answers' mode
              <div className="space-y-6 text-left max-h-[60vh] overflow-y-auto pr-3 custom-scrollbar p-6 bg-gray-50 rounded-xl shadow-inner border border-gray-200 animate-fade-in-up">
                <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-indigo-300 pb-3 mb-4">
                  وەڵامەکان بۆ بابەتی: <span className="text-indigo-700">{selectedSubject} - ساڵی: {selectedYear} - بەشی: {selectedSection}</span>
                </h3>
                {filteredQuestions.length === 0 ? (
                  <p className="text-gray-600 text-lg">هیچ پرسیارێک نییە بۆ ئەم بابەتە بەپێی هەڵبژاردەکانت.</p>
                ) : (
                  filteredQuestions.map((q, index) => (
                    <div key={q.id} className="bg-white p-5 rounded-xl shadow-md border border-gray-200 animate-fade-in-up mb-4">
                      <p className="text-lg font-semibold text-gray-900 mb-2">
                        <span className="text-indigo-600 font-extrabold">{index + 1}.</span> {q.question}
                      </p>
                      <p className="text-md text-green-700 font-medium flex items-center gap-2">
                        <CheckCircle size={22} className="flex-shrink-0" /> وەڵامی دروست: <span className="font-bold">{q.answer}</span>
                      </p>
                      {/* Solution display */}
                      {q.solution && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h4 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <Lightbulb size={20} className="text-yellow-500" /> چارەسەر/ڕوونکردنەوە:
                          </h4>
                          {q.solution.startsWith('http') ? (
                            <img
                              src={q.solution}
                              alt="Solution"
                              className="max-w-full h-auto rounded-lg shadow-sm"
                              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x200/CCCCCC/666666?text=Image+Not+Found"; }}
                            />
                          ) : (
                            <p className="text-gray-700 text-base leading-relaxed">{q.solution}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            <button
              onClick={restart}
              className="px-12 py-4 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 text-xl font-semibold rounded-full shadow-lg hover:from-gray-400 hover:to-gray-500 transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-300 mt-10 flex items-center justify-center gap-3 animate-pop"
            >
              <RotateCcw size={28} /> دەستپێکەوە بکە
            </button>
          </div>
        )}
      </div>
      {/* Custom CSS for scrollbar and animations */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #a78bfa; /* indigo-400 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #8b5cf6; /* indigo-500 */
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-down {
          animation: fadeInDown 0.8s ease-out forwards;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-in-right {
          animation: slideInRight 0.6s ease-out forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.7s ease-out forwards;
        }

        @keyframes pop {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-pop {
          animation: pop 0.4s ease-out forwards;
        }

        @keyframes blob {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          33% {
            transform: translateY(-20px) scale(1.1);
          }
          66% {
            transform: translateY(20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite cubic-bezier(0.62, 0.0, 0.38, 1);
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default ExamsGrade12;
