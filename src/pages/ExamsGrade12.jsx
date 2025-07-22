import questionsData from '../data/grade12Questions'
import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";

const timeOptions = {
  free: 0, // Free mode, no timer
  "15min": 15 * 60, // 15 minutes in seconds
  "30min": 30 * 60, // 30 minutes in seconds
  "1h": 60 * 60, // 1 hour in seconds
  "2h": 2 * 60 * 60, // 2 hours in seconds
};

const ExamsGrade12 = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [timerType, setTimerType] = useState("free");
  const [timeLeft, setTimeLeft] = useState(0);
  const [started, setStarted] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("هەموو بابەتەکان"); // Default to "All Subjects"
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [mode, setMode] = useState("initial"); // 'initial', 'exam', 'review'
  const totalTime = timeOptions[timerType];
  const current = filteredQuestions[step];
  const uniqueSubjects = [
    "هەموو بابەتەکان", // Option to select all subjects
    ...new Set(questionsData.map((q) => q.subject)),
  ];

  useEffect(() => {
    if (mode === "exam" && started && totalTime > 0 && timeLeft > 0) {
      const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(interval); // Clear interval on component unmount or dependency change
    }
    if (mode === "exam" && timeLeft === 0 && started && totalTime > 0)
      setShowResult(true);
  }, [timeLeft, started, totalTime, mode]);

  const handleSelect = (option) => {
    if (mode !== "exam") return; // Only allow selection in exam mode

    const newAnswers = [...answers];
    newAnswers[step] = {
      selected: option,
      correct: option === current.answer,
    };
    setAnswers(newAnswers);
    const audio = new Audio(
      option === current.answer ? "/sounds/correct.mp3" : "/sounds/wrong.mp3"
    );
    audio.play();
  };

  const next = () => {
    if (step + 1 < filteredQuestions.length) setStep(step + 1);
    else setShowResult(true);
  };

  const restart = () => {
    setStep(0);
    setAnswers([]);
    setShowResult(false);
    setStarted(false);
    setTimeLeft(0);
    setSelectedSubject("هەموو بابەتەکان"); // Reset selected subject
    setFilteredQuestions([]); // Clear filtered questions
    setMode("initial"); // Go back to initial mode selection
  };

  const startExam = () => {
    const questionsToUse =
      selectedSubject === "هەموو بابەتەکان"
        ? questionsData
        : questionsData.filter((q) => q.subject === selectedSubject);

    setFilteredQuestions(questionsToUse);
    setStarted(true);
    setMode("exam");
    if (totalTime > 0) setTimeLeft(totalTime);
  };

  const startReview = () => {
    const questionsToUse =
      selectedSubject === "هەموو بابەتەکان"
        ? questionsData
        : questionsData.filter((q) => q.subject === selectedSubject);

    setFilteredQuestions(questionsToUse);
    setStarted(true); // Indicate that a session has started
    setMode("review");
    setShowResult(false); // Ensure result screen is not shown initially
    setStep(0); // Start from the first question
  };

  // Render logic based on the current mode
  return (
    <div className="flex items-center justify-center p-4 bg-gray-100">
      <div className="max-w-3xl w-full bg-white shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in border border-gray-100">
        {mode === "initial" ? (
          <div className="space-y-8 text-center">
            <h1 className="text-4xl font-extrabold text-blue-800 mb-6 drop-shadow-sm">
              بەخێربێن بۆ تاقیکردنەوەی پۆلی 12
            </h1>

            <h2 className="text-2xl font-bold text-gray-700">بابەت هەڵبژێرە</h2>
            <div className="relative inline-block w-full sm:w-auto">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-lg shadow-sm cursor-pointer"
              >
                {uniqueSubjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>

            <div className="space-y-4 mt-10">
              <button
                onClick={() => setMode("exam_setup")} // Go to exam setup (timer selection)
                className="block w-full p-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-xl font-semibold rounded-xl shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-4 focus:ring-green-300"
              >
                دەست پێ بکە بە تاقیکردنەوە
              </button>
              <button
                onClick={startReview} // Directly start review mode
                className="block w-full p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xl font-semibold rounded-xl shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-4 focus:ring-purple-300"
              >
                پرسیارەکان ببینە (بێ تاقیکردنەوە)
              </button>
            </div>
          </div>
        ) : mode === "exam_setup" ? (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800">کاتی تاقیکردنەوە هەڵبژێرە</h2>
            <div className="relative inline-block w-full sm:w-auto">
              <select
                value={timerType}
                onChange={(e) => setTimerType(e.target.value)}
                className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-lg shadow-sm cursor-pointer"
              >
                <option value="free">بێ سنوور</option>
                <option value="15min">15 خولەک</option>
                <option value="30min">30 خولەک</option>
                <option value="1h">1 کاتژمێر</option>
                <option value="2h">2 کاتژمێر</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            <button
              onClick={startExam}
              className="block w-full mt-8 p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              دەست پێ بکە
            </button>
            <button
              onClick={() => setMode("initial")}
              className="block w-full mt-4 p-4 bg-gray-300 text-gray-800 text-xl font-semibold rounded-xl shadow-md hover:bg-gray-400 transition-all duration-300 transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-4 focus:ring-gray-200"
            >
              گەڕانەوە
            </button>
          </div>
        ) : !showResult ? (
          // Exam or Review in progress screen
          <>
            <div className="flex justify-between items-center flex-wrap gap-2 mb-4 pb-2 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                سەبارەت بە: {current?.subject}
              </h2>
              <span className="text-md text-gray-500 font-medium">
                پرسیار {step + 1} / {filteredQuestions.length}
              </span>
            </div>

            {mode === "exam" && totalTime > 0 && (
              <div className="text-right text-lg text-red-600 font-bold mb-4">
                ⏳ ماوە: {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, "0")}
              </div>
            )}

            <div className="flex flex-wrap gap-2 justify-center py-4 bg-gray-50 rounded-lg p-3 shadow-inner">
              {filteredQuestions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setStep(idx)}
                  className={`w-10 h-10 text-md rounded-full font-bold transition-all duration-200 shadow-md
                    ${
                      idx === step
                        ? "bg-blue-600 text-white transform scale-110 ring-2 ring-blue-300"
                        : answers[idx] && mode === "exam"
                        ? "bg-green-200 text-green-800 hover:bg-green-300" // Exam mode: answered questions are green
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <div className="text-xl font-semibold text-gray-800 mt-6 p-5 bg-blue-50 rounded-xl shadow-md border border-blue-100">
              {current?.question}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {current?.options.map((opt) => {
                const selectedAnswer = answers[step]?.selected;
                const correctAnswer = current.answer;
                const isSelected = selectedAnswer === opt;

                return (
                  <button
                    key={opt}
                    // Disable selection in review mode or if already selected in exam mode
                    disabled={mode === "review" || !!selectedAnswer}
                    onClick={() => handleSelect(opt)}
                    className={`p-4 rounded-xl border flex items-center gap-3 transition-all duration-300 shadow-sm text-left
                      ${
                        mode === "review"
                          ? opt === correctAnswer
                            ? "bg-green-100 border-green-500 text-green-800 font-medium" // Review mode: correct answer highlighted
                            : "bg-gray-100 border-gray-200 text-gray-600 opacity-70" // Review mode: other options
                          : // Exam mode logic below
                          !selectedAnswer
                          ? "bg-white hover:bg-blue-50 border-gray-300" // Default state in exam mode
                          : isSelected && opt === correctAnswer
                          ? "bg-green-100 border-green-500 text-green-800 font-medium" // Exam mode: correct and selected
                          : isSelected && opt !== correctAnswer
                          ? "bg-red-100 border-red-500 text-red-800 font-medium" // Exam mode: incorrect and selected
                          : opt === correctAnswer
                          ? "bg-green-50 text-green-600 border-green-300" // Exam mode: correct answer (even if not selected)
                          : "bg-gray-100 border-gray-200 text-gray-500 opacity-70" // Exam mode: other unselected options
                      }`}
                  >
                    {opt}
                    {/* Show check/x icons only in exam mode after selection */}
                    {mode === "exam" && selectedAnswer && opt === correctAnswer && (
                      <CheckCircle size={20} className="text-green-600 ml-auto" />
                    )}
                    {mode === "exam" &&
                      selectedAnswer &&
                      isSelected &&
                      opt !== correctAnswer && (
                        <XCircle size={20} className="text-red-600 ml-auto" />
                      )}
                    {/* Always show check for correct answer in review mode */}
                    {mode === "review" && opt === correctAnswer && (
                      <CheckCircle size={20} className="text-green-600 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Show "Next" button only in exam mode after selection */}
            {mode === "exam" && answers[step]?.selected && (
              <button
                onClick={next}
                className="mt-8 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                دوایــی
              </button>
            )}

            {/* Show "Finish Review" button in review mode */}
            {mode === "review" && (
              <button
                onClick={() => setShowResult(true)}
                className="mt-8 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                کۆتایی بە بینین بێنە
              </button>
            )}
          </>
        ) : (
          // Result screen (different messages for exam vs. review)
          <div className="text-center space-y-6 py-8">
            <h2 className="text-3xl font-bold text-blue-700 drop-shadow-sm">ئەنجامەکان</h2>
            {mode === "exam" ? (
              <p className="text-gray-700 text-xl leading-relaxed">
                تۆ{" "}
                <span className="font-extrabold text-green-600 text-2xl">
                  {answers.filter((a) => a.correct).length}
                </span>{" "}
                لە{" "}
                <span className="font-extrabold text-blue-600 text-2xl">
                  {filteredQuestions.length}
                </span>{" "}
                وەڵامی دروستت داوە ✅
              </p>
            ) : (
              <p className="text-gray-700 text-xl leading-relaxed">
                تۆ کۆتاییت بە بینین و پێداچوونەوەی پرسیارەکان هێنا.
              </p>
            )}

            <button
              onClick={restart}
              className="px-8 py-3 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 text-lg font-semibold rounded-full shadow-lg hover:from-gray-400 hover:to-gray-500 transition-all duration-300 transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-4 focus:ring-gray-200"
            >
              دەستپێکەوە بکە
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamsGrade12;
