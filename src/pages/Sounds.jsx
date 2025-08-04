import React, { useState, useEffect } from 'react';
import { Volume2, BookOpen, MessageCircle, HelpCircle, Lightbulb } from 'lucide-react';

// Updated mock data for English words with multiple exam questions and answers.
const wordsData = [
  { 
    id: 1, 
    word: 'anxious', 
    ipa: '/ˈæŋkʃəs/', 
    kurdishMeaning: 'نیگەران، دڵەڕاوکێ', 
    kurdishReading: 'ئەنگیۆس', 
    silentLetters: [], 
    exampleSentence: 'She felt anxious about her exam results.',
    examQuestions: [
      { question: 'What is the Kurdish meaning of "anxious"?', answer: 'نیگەران، دڵەڕاوکێ' },
      { question: 'What is a synonym for "anxious"?', answer: 'Nervous or Worried.' },
      { question: 'Use "anxious" in a sentence.', answer: 'The student was anxious about the final exam.' },
    ],
  },
  { 
    id: 2, 
    word: 'knife', 
    ipa: '/naɪf/', 
    kurdishMeaning: 'چەقۆ', 
    kurdishReading: 'نایف', 
    silentLetters: ['k'], 
    exampleSentence: 'He used a sharp knife to cut the apple.',
    examQuestions: [
      { question: 'What letter is silent in the word "knife"?', answer: 'The letter "k" is silent.' },
      { question: 'What is the IPA pronunciation of "knife"?', answer: '/naɪf/' },
      { question: 'Translate "چەقۆ" to English.', answer: 'Knife' },
    ],
  },
  { 
    id: 3, 
    word: 'psalm', 
    ipa: '/sɑːm/', 
    kurdishMeaning: 'سەروود، سرووت', 
    kurdishReading: 'سام', 
    silentLetters: ['p'], 
    exampleSentence: 'We sang a psalm during the church service.',
    examQuestions: [
      { question: 'What letter is silent in the word "psalm"?', answer: 'The letter "p" is silent.' },
      { question: 'What is the Kurdish meaning of "psalm"?', answer: 'سەروود، سرووت' },
      { question: 'Provide an example of how to use "psalm" in a sentence.', answer: 'The choir sang a beautiful psalm.' },
    ],
  },
  { 
    id: 4, 
    word: 'debt', 
    ipa: '/dɛt/', 
    kurdishMeaning: 'قەرز', 
    kurdishReading: 'دێت', 
    silentLetters: ['b'], 
    exampleSentence: 'He has to pay off a small debt.',
    examQuestions: [
      { question: 'What is the silent letter in "debt"?', answer: 'The letter "b" is silent.' },
      { question: 'What does "debt" mean?', answer: 'An amount of money that you owe to someone.' },
    ],
  },
  { 
    id: 5, 
    word: 'island', 
    ipa: '/ˈaɪlənd/', 
    kurdishMeaning: 'دوورگە', 
    kurdishReading: 'ئایلاند', 
    silentLetters: ['s'], 
    exampleSentence: 'We went on vacation to a tropical island.',
    examQuestions: [
      { question: 'What letter is silent in "island"?', answer: 'The letter "s" is silent.' },
      { question: 'How do you pronounce "island"?', answer: 'It is pronounced as /ˈaɪlənd/, with a silent "s".' },
    ],
  },
  { 
    id: 6, 
    word: 'knight', 
    ipa: '/naɪt/', 
    kurdishMeaning: 'ئەسپ سوار، سوارچاک', 
    kurdishReading: 'نایت', 
    silentLetters: ['k', 'g', 'h'], 
    exampleSentence: 'A brave knight defended the kingdom.',
    examQuestions: [
      { question: 'Which letters are silent in "knight"?', answer: 'The "k", "g", and "h" are all silent.' },
      { question: 'What does a "knight" do?', answer: 'A knight is a brave warrior who serves a king or queen.' },
    ],
  },
  { 
    id: 7, 
    word: 'listen', 
    ipa: '/ˈlɪsən/', 
    kurdishMeaning: 'گوێ گرتن', 
    kurdishReading: 'لِسِن', 
    silentLetters: ['t'], 
    exampleSentence: 'Please listen to my instructions carefully.',
    examQuestions: [
      { question: 'What is the silent letter in "listen"?', answer: 'The "t" is silent.' },
      { question: 'How is "listen" pronounced?', answer: 'The word is pronounced /ˈlɪsən/, not /ˈlɪstən/.' },
    ],
  },
  { 
    id: 8, 
    word: 'honest', 
    ipa: '/ˈɒnɪst/', 
    kurdishMeaning: 'ڕاستگۆ', 
    kurdishReading: 'ئۆنێست', 
    silentLetters: ['h'], 
    exampleSentence: 'He is a very honest and trustworthy person.',
    examQuestions: [
      { question: 'What is the silent letter in "honest"?', answer: 'The letter "h" is silent.' },
      { question: 'What is the Kurdish meaning of "honest"?', answer: 'ڕاستگۆ' },
    ],
  },
  { 
    id: 9, 
    word: 'column', 
    ipa: '/ˈkɒləm/', 
    kurdishMeaning: 'ستوون', 
    kurdishReading: 'کۆلەم', 
    silentLetters: ['n'], 
    exampleSentence: 'The temple was supported by large columns.',
    examQuestions: [
      { question: 'What is the silent letter in "column"?', answer: 'The letter "n" is silent.' },
      { question: 'How is "column" pronounced?', answer: 'It is pronounced /ˈkɒləm/, not /ˈkɒləmn/.' },
    ],
  },
  { 
    id: 10, 
    word: 'doubt', 
    ipa: '/daʊt/', 
    kurdishMeaning: 'گومان', 
    kurdishReading: 'داوت', 
    silentLetters: ['b'], 
    exampleSentence: 'I have no doubt that he will succeed.',
    examQuestions: [
      { question: 'What is the silent letter in "doubt"?', answer: 'The "b" is silent.' },
      { question: 'What does "doubt" mean?', answer: 'A feeling of uncertainty or lack of conviction.' },
    ],
  },
  { 
    id: 11, 
    word: 'castle', 
    ipa: '/ˈkɑːsəl/', 
    kurdishMeaning: 'قەڵا', 
    kurdishReading: 'کاسڵ', 
    silentLetters: ['t'], 
    exampleSentence: 'We visited an old castle on our trip.',
    examQuestions: [
      { question: 'What letter is silent in "castle"?', answer: 'The letter "t" is silent.' },
      { question: 'What does "castle" mean in Kurdish?', answer: 'قەڵا' },
    ],
  },
  { 
    id: 12, 
    word: 'aisle', 
    ipa: '/aɪl/', 
    kurdishMeaning: 'ڕێڕەو', 
    kurdishReading: 'ئایل', 
    silentLetters: ['s'], 
    exampleSentence: 'She walked down the wedding aisle.',
    examQuestions: [
      { question: 'What letter is silent in "aisle"?', answer: 'The letter "s" is silent.' },
      { question: 'How is "aisle" pronounced?', answer: 'It is pronounced /aɪl/, with a silent "s".' },
      { question: 'Provide an example sentence for "aisle".', answer: 'The flight attendant asked me to move from the aisle.' },
    ],
  },
];

const SoundsPage = () => {
  const [currentWord, setCurrentWord] = useState(wordsData[0]);
  const [activeButton, setActiveButton] = useState(null);
  const [activeWordId, setActiveWordId] = useState(wordsData[0].id);
  const [readingText, setReadingText] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  useEffect(() => {
    setReadingText('');
    setCurrentQuestion(null);
    setShowAnswer(false);
    setCurrentQuestionIndex(0);
    setActiveButton(null);
  }, [currentWord]);
  const handleReadEnglish = () => {
    setReadingText(currentWord.exampleSentence);
    setCurrentQuestion(null);
    setShowAnswer(false);
    setActiveButton('english');
  };
  const handleReadKurdish = () => {
    setReadingText(currentWord.kurdishReading);
    setCurrentQuestion(null); // Clear any existing exam question
    setShowAnswer(false);
    setActiveButton('kurdish');
  };
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.lang = 'en-US'; // Set the language for better pronunciation
      window.speechSynthesis.speak(utterance);
      setActiveButton('speak');
    } else {
      console.log('Browser does not support Text-to-Speech.');
    }
  };
  const handleGetExamQuestion = () => {
    setReadingText(''); // Clear any existing reading text
    setActiveButton('exam');
    setShowAnswer(false); // Hide the answer for the new question

    const questions = currentWord.examQuestions;
    const nextIndex = (currentQuestionIndex + 1) % questions.length;
    setCurrentQuestionIndex(nextIndex);
    setCurrentQuestion(questions[currentQuestionIndex]);
  };
  
  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleWordClick = (word) => {
    setCurrentWord(word);
    setActiveWordId(word.id);
  };

  return (
    <div dir="ltr" className="p-4 md:p-8 bg-gray-50 text-gray-800 ">
      {/* Main content container with max width and centered */}
      <div className="mx-auto max-w-7xl">
        {/* Main Word Display and Reading/Question Text */}
        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-3xl shadow-xl p-8 text-center mb-8 transform hover:scale-105 transition-all duration-300 ease-in-out">
          <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl">
            {/* Display the word, highlighting silent letters */}
            <h1 className="text-4xl sm:text-6xl md:text-[6rem] font-black text-white font-serif -mt-4 leading-none">
              {currentWord.word.split('').map((char, index) => (
                <span 
                  key={index} 
                  className={currentWord.silentLetters.includes(char) ? 'text-gray-300 opacity-70' : ''}
                >
                  {char}
                </span>
              ))}
            </h1>
            {/* Display the phonetic transcription (IPA) */}
            <p className="text-xl sm:text-3xl font-bold text-white mt-2 drop-shadow-md">
              {currentWord.ipa}
            </p>
            {/* Display the Kurdish meaning */}
            <p dir="rtl" className="text-lg sm:text-xl font-medium text-white mt-4 drop-shadow-sm">
              {currentWord.kurdishMeaning}
            </p>
          </div>
          
          {/* Conditional rendering for reading text or exam question */}
          {readingText && (
            <div 
              dir={activeButton === 'kurdish' ? 'rtl' : 'ltr'} 
              className="mt-6 text-base sm:text-xl text-white font-medium bg-white/30 rounded-full px-4 sm:px-6 py-2 animate-fade-in"
            >
              {readingText}
            </div>
          )}
          
          {currentQuestion && (
            <div className="mt-6 p-4 rounded-xl bg-white/90 text-gray-800 text-left animate-fade-in">
              <p className="text-base sm:text-lg font-semibold mb-2">{currentQuestion.question}</p>
              {showAnswer ? (
                <p className="text-sm sm:text-md font-medium text-green-700">{currentQuestion.answer}</p>
              ) : (
                <button
                  onClick={handleShowAnswer}
                  className="mt-2 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  بینینی وه‌ڵام
                </button>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons Section - now always horizontal and wraps */}
        <div className="flex flex-row flex-wrap justify-center items-center gap-4 mb-8">
          {/* Button: Reading (English) */}
          <button
            onClick={handleReadEnglish}
            className={`flex items-center gap-2 p-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${activeButton === 'english' ? 'bg-green-600 text-white shadow-xl' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
          >
            <BookOpen size={24} />
            ڕسته‌
          </button>

          {/* Button: Reading by Kurdish */}
          <button
            onClick={handleReadKurdish}
            className={`flex items-center gap-2 p-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${activeButton === 'kurdish' ? 'bg-green-600 text-white shadow-xl' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
          >
            <MessageCircle size={24} />
            خوێندنه‌وه‌ به‌ كوردی
          </button>
          
          {/* Button: Speak Word */}
          <button
            onClick={handleSpeak}
            className={`flex items-center gap-2 p-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${activeButton === 'speak' ? 'bg-green-600 text-white shadow-xl' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
          >
            <Volume2 size={24} />
            ده‌نگی وشه‌
          </button>
          
          {/* Button: Exam Questions */}
          <button
            onClick={handleGetExamQuestion}
            className={`flex items-center gap-2 p-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${activeButton === 'exam' ? 'bg-green-600 text-white shadow-xl' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
          >
            <HelpCircle size={24} />
            پرساری وزاری
          </button>
        </div>

        {/* Other Words Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {wordsData.map((word) => (
            <button
              key={word.id}
              onClick={() => handleWordClick(word)}
              className={`p-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${activeWordId === word.id ? 'bg-blue-500 text-white shadow-blue-300/50' : 'bg-white hover:bg-gray-50'}`}
            >
              <h2 className="text-2xl sm:text-3xl font-extrabold">{word.word}</h2>
              <p className="text-sm text-gray-500 mt-1">{word.ipa}</p>
            </button>
          ))}
        </div>
        {/* CSS for custom animations */}
        <style>
          {`
            @keyframes fade-in {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
              animation: fade-in 0.3s ease-out forwards;
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default SoundsPage;
