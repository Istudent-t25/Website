import React, { useState, Fragment, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BookOpen, Globe, MessageCircle, Youtube, Search, Info, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';

// Sample data for grammar lessons in English, Kurdish, and Arabic.
const grammarData = {
  english: [
    {
      id: 1,
      title: 'Passive Voice',
      explanation: 'The passive voice is a grammatical construction where the subject of the sentence receives the action rather than performing it. This is often used when the actor is unknown or unimportant.',
      extraInfo: 'Imagine you want to talk about something that happened, but you don\'t know who did it, or it\'s not important. The passive voice lets you focus on the thing that the action happened to. For example, instead of saying "A student broke the window," you can say "The window was broken." The window is the star of the sentence!',
      rules: [
        '**Rule 1: Form the passive with a form of the verb "to be" + the past participle of the main verb.**',
        '**Rule 2: The object of the active sentence becomes the subject of the passive sentence.**',
        '**Rule 3: You can mention the original subject using "by + agent," but this is often omitted.**'
      ],
      types: [
        {
          subTitle: 'Passive with a Modal Verb',
          subExplanation: 'This is formed using a modal verb (can, could, must, should, etc.) + be + past participle.',
          subExamples: [
            'Active: You **must clean** the kitchen.',
            'Passive: The kitchen **must be cleaned**.'
          ]
        },
        {
          subTitle: 'Passive in Different Tenses (Mapping)',
          subExplanation: 'The passive voice can be used in almost all tenses. The verb "to be" is conjugated to match the tense, and the main verb is always in the past participle form. See the table below for a clear mapping.',
          subTable: {
            headers: ['Tense', 'Active Voice Structure', 'Passive Voice Structure'],
            rows: [
              ['Present Simple', 'Subject + Verb', 'Subject + **am/is/are** + Past Participle'],
              ['Past Simple', 'Subject + Verb-ed', 'Subject + **was/were** + Past Participle'],
              ['Present Perfect', 'Subject + has/have + Verb-ed', 'Subject + **has/have been** + Past Participle'],
              ['Future Simple', 'Subject + will + Verb', 'Subject + **will be** + Past Participle']
            ]
          }
        },
        {
          subTitle: 'Passive with "get"',
          subExplanation: 'In informal contexts, "get" is sometimes used instead of "be" to form the passive voice, especially to describe something that happens to someone or something unexpectedly.',
          subExamples: [
            'He **got hit** by a car.',
            'They **got married** in Las Vegas.'
          ]
        },
        {
          subTitle: 'Passive of a Reporting Verb',
          subExplanation: 'This is used to report what people think or say. The common structure is "It is said that..." or "He is thought to be..."',
          subExamples: [
            'Active: People **say** that he is a good teacher.',
            'Passive: **It is said** that he is a good teacher.',
            'Passive: He **is said** to be a good teacher.'
          ]
        }
      ],
      youtubeResources: [
        { name: 'TED-Ed', url: 'https://www.youtube.com/@TEDEd', description: 'Fun, animated lessons on a wide range of topics, including grammar.' },
        { name: 'BBC Learning English', url: 'https://www.youtube.com/@bbclearningenglish', description: 'Daily videos to help you improve your English pronunciation, grammar, and more.' },
        { name: 'Grammarly', url: 'https://www.youtube.com/@grammarly', description: 'Quick tips and easy-to-understand explanations for common grammar issues.' }
      ]
    },
    {
      id: 2,
      title: 'Conditional Sentences',
      explanation: 'Conditional sentences are statements that discuss known factors or hypothetical situations and their consequences. There are four main types.',
      extraInfo: 'Think of conditional sentences as a "what if" game! You\'re saying, "If this happens, then that will happen." The different types let you talk about real possibilities ("If I study, I will pass") or imaginary ones ("If I were a bird, I would fly").',
      rules: [
        '**Rule 1: A conditional sentence has two clauses: an "if" clause (the condition) and a main clause (the result).**',
        '**Rule 2: The order of the clauses can be changed, but a comma is used when the "if" clause comes first.**'
      ],
      types: [
        {
          subTitle: 'Zero Conditional',
          subExplanation: 'Used for facts and general truths. Structure: If + Present Simple, ... Present Simple.',
          subExamples: [
            'If you **heat** water to 100°C, it **boils**.'
          ]
        },
        {
          subTitle: 'First Conditional',
          subExplanation: 'Used for a likely or possible future outcome. Structure: If + Present Simple, ... will + base verb.',
          subExamples: [
            'If it **rains**, we **will stay** inside.'
          ]
        },
        {
          subTitle: 'Second Conditional',
          subExplanation: 'Used for hypothetical or unlikely situations. Structure: If + Past Simple, ... would + base verb.',
          subExamples: [
            'If I **were** a millionaire, I **would travel** the world.'
          ]
        },
        {
          subTitle: 'Third Conditional',
          subExplanation: 'Used for imaginary situations in the past. Structure: If + Past Perfect, ... would have + Past Participle.',
          subExamples: [
            'If you **had studied**, you **would have passed** the exam.'
          ]
        }
      ],
      youtubeResources: [
        { name: 'TED-Ed', url: 'https://www.youtube.com/@TEDEd', description: 'Animated lessons that make complex topics easy to understand.' },
        { name: 'Oxford English Dictionary', url: 'https://www.youtube.com/@OxfordEnglishDictionary', description: 'Explore the history and usage of the English language.' }
      ]
    },
  ],
  kurdish: [
    {
      id: 1,
      title: 'ناوی لێکدراو و سادە',
      explanation: 'ناوی لێکدراو لە دوو وشە یان زیاتر پێکدێت. ناوی سادە تەنها لە یەک وشە پێکدێت و لێک نادرێتەوە.',
      extraInfo: 'لە زمانی کوردیدا هەندێک وشە تەنها یەک پارچەن وەک "باخ" (باغ). بەڵام هەندێک وشەی تر لە دوو یان زیاتر وشە دروستکراون وەک "باخچەوان" (باغ+چەوان). ئەمەی دووەمیان پێی دەوترێت ناوی لێکدراو، وەک یارییەکی پێکەوەنانی وشە وایە!',
      rules: [
        '**یاسا: ناوی لێکدراو لە دوو وشەی سەربەخۆ دروست دەبێت.**',
        '**یاسا: دەتوانرێت ناوی لێکدراو لە ناو + کردار، یان ناو + ناو دروست بکرێت.**'
      ],
      examples: [
        'ناوی سادە: **باخ**',
        'ناوی لێکدراو: **باخچەوان**',
        'ناوی لێکدراو: **خۆشەویستی**',
      ],
      youtubeResources: [
        { name: 'مامۆستا نەوزاد', url: 'https://www.youtube.com/results?search_query=مامۆستا+نەوزاد', description: 'مامۆستایەکی بەناوبانگ بۆ ڕێزمانی کوردی.' },
        { name: 'فێرکاری زمانی کوردی', url: 'https://www.youtube.com/results?search_query=فێرکاری+زمانی+کوردی', description: 'کەناڵێکی تایبەت بە وانەکانی زمانی کوردی.' }
      ],
      dir: 'rtl'
    },
    {
      id: 2,
      title: 'جێناوی کەسی',
      explanation: 'جێناوی کەسی لەجیاتی ناوی کەسێک دادەنرێت. وەک (من, تۆ, ئەو, ئێمە, ئێوە, ئەوان).',
      extraInfo: 'کاتێک دەمانەوێت قسە لەسەر کەسێک بکەین و ناوی نەهێنینەوە، جێناو بەکاردێنین. وەک ئەوەی بڵێی "ئەو" لەجیاتی "ئەحمەد." جێناوەکان ڕستەکانمان کورتتر و جوانتر دەکەن.',
      rules: [
        '**یاسا: جێناو لە سەرەتای ڕستەدا دێت و بە پێی ژمارە دەگۆڕدرێت.**',
        '**یاسا: جێناوەکان ڕۆڵی بکەر دەبینن لە ڕستەدا.**'
      ],
      examples: [
        'من **قوتابی**م.',
        'ئەوان **وەرزشکار**ن.',
      ],
      youtubeResources: [
        { name: 'مامۆستا نەوزاد', url: 'https://www.youtube.com/results?search_query=مامۆستا+نەوزاد', description: 'مامۆستایەکی بەناوبانگ بۆ ڕێزمانی کوردی.' },
        { name: 'فێرکاری زمانی کوردی', url: 'https://www.youtube.com/results?search_query=فێرکاری+زمانی+کوردی', description: 'کەناڵێکی تایبەت بە وانەکانی زمانی کوردی.' }
      ],
      dir: 'rtl'
    },
  ],
  arabic: [
    {
      id: 1,
      title: 'أقسام الكلام',
      explanation: 'تتكون اللغة العربية من ثلاثة أقسام رئيسية: الاسم، والفعل، والحرف. لكل منها قواعدها الخاصة التي تحدد موقعها في الجملة.',
      extraInfo: 'اللغة العربية مثل صندوق ألعاب، فيها ثلاثة أنواع رئيسية من القطع: أسماء (مثل اسمك)، وأفعال (مثل "يجري" أو "يأكل")، وحروف (مثل "في" أو "إلى"). عندما نجمع هذه القطع معًا، نصنع جملة جميلة!',
      rules: [
        '**القاعدة 1: الاسم هو ما دل على معنى غير مقترن بزمن.**',
        '**القاعدة 2: الفعل هو ما دل على حدث مقترن بزمن.**',
        '**القاعدة 3: الحرف هو ما لا يظهر معناه إلا مع غيره.**'
      ],
      examples: [
        'الاسم: **محمد**',
        'الفعل: **كتب**',
        'الحرف: **في**',
      ],
      youtubeResources: [
        { name: 'د. أيمن السويد', url: 'https://www.youtube.com/results?search_query=د.+أيمن+السويد', description: 'دروس مفصلة في قواعد اللغة العربية.' },
        { name: 'قناة العربية', url: 'https://www.youtube.com/results?search_query=قناة+العربية', description: 'دروس لغوية مبسطة وممتعة.' }
      ],
      dir: 'rtl'
    },
    {
      id: 2,
      title: 'الجملة الاسمية والفعلية',
      explanation: 'الجملة الاسمية تبدأ باسم وتتكون من مبتدأ وخبر. الجملة الفعلية تبدأ بفعل وتتكون من فعل وفاعل.',
      extraInfo: 'تخيل أن الجملة لها عائلة. العائلة الاسمية تبدأ باسم (مثل "الشمس"), والعائلة الفعلية تبدأ بفعل (مثل "يقرأ"). كل عائلة لها قواعدها الخاصة، لكنها جميعًا تصنع جملًا رائعة!',
      rules: [
        '**القاعدة 1: الجملة الاسمية تتكون من مبتدأ وخبر، وكلاهما مرفوع.**',
        '**القاعدة 2: الجملة الفعلية تتكون من فعل وفاعل، وقد تحتوي على مفعول به.**'
      ],
      examples: [
        'جملة اسمية: **الشمس مشرقة.**',
        'جملة فعلية: **يقرأ الطالب الدرس.**',
      ],
      youtubeResources: [
        { name: 'د. أيمن السويد', url: 'https://www.youtube.com/results?search_query=د.+أيمن+السويد', description: 'دروس في النحو والصرف.' },
        { name: 'قناة العربية', url: 'https://www.youtube.com/results?search_query=قناة+العربية', description: 'شروحات مبسطة للقواعد العربية.' }
      ],
      dir: 'rtl'
    },
  ],
};

const publicTips = {
  english: [
    {
      sectionTitle: 'Building Blocks of Words',
      tips: [
        { rule: 'Verb + **tion** = Noun', example: '`educate` → `education`' },
        { rule: 'Adjective + **ly** = Adverb', example: '`quick` → `quickly`' },
        { rule: 'Prefix **un** or **in** = "not"', example: '`happy` → `unhappy`' },
      ],
    },
    {
      sectionTitle: 'Sentence Structure & Agreement',
      tips: [
        { rule: 'Adjective comes **before** the noun', example: '`a big house`' },
        { rule: 'Use **who** for people', example: '`a student who studies hard`' },
        { rule: 'Use **which** for things', example: '`a book which is interesting`' },
        { rule: 'Past participle is like past tense for regular verbs', example: '`work` → `worked`' },
      ],
    },
  ],
  kurdish: [
    {
      sectionTitle: 'پێکەوەنانی وشە (Building Words)',
      tips: [
        { rule: 'ناوی سادە + پاشگر = ناوی لێکدراو', example: '`کتێب` + `خانە` → `کتێبخانە`' },
        { rule: 'کردار + پاشگر = ناو', example: '`خوێندن` + `ەوە` → `خوێندنەوە`' },
      ],
    },
    {
      sectionTitle: 'پێکهاتەی ڕستە (Sentence Structure)',
      tips: [
        { rule: 'ڕستەی کوردی: بکەر + بەرکار + کردار', example: '`من` + `کتێب` + `دەخوێنمەوە`' },
        { rule: 'وشەی `ئەو` بۆ نێر و مێ بەکاردێت', example: '`ئەو کوڕە`، `ئەو کچە`' },
        { rule: 'جێناو لە سەرەتای ڕستەدا دێت', example: '`من قوتابیم`' },
      ],
    },
  ],
  arabic: [
    {
      sectionTitle: 'قواعد بناء الكلمات (Word-building rules)',
      tips: [
        { rule: 'الاسم + الألف واللام = اسم معرفة', example: '`كتاب` → `الكتاب`' },
        { rule: 'الاسم المذكر ينتهي غالباً بـ تاء مربوطة', example: '`طالبة`' },
      ],
    },
    {
      sectionTitle: 'أزمنة الأفعال (Verb Tenses)',
      tips: [
        { rule: 'الفعل الماضي: حدث وقع وانتهى', example: '`كتبَ`' },
        { rule: 'الفعل المضارع: حدث يقع الآن أو في المستقبل', example: '`يكتبُ`' },
      ],
    },
    {
      sectionTitle: 'تكوين الجملة (Sentence Formation)',
      tips: [
        { rule: 'الاسم المرفوع هو الفاعل والمبتدأ والخبر', example: '`الشمس مشرقة`' },
        { rule: 'الحرف لا يأتي إلا في وسط الجملة أو في آخرها', example: '`أذهب إلى المدرسة`' },
        { rule: 'الأسماء الموصولة تستخدم للربط بين الجمل', example: '`الرجل الذي رأيته`' },
      ],
    },
  ],
};

// Helper function to get the display name of the current language
const getLanguageName = (lang) => {
  switch (lang) {
    case 'english':
      return 'English';
    case 'kurdish':
      return 'Kurdish';
    case 'arabic':
      return 'Arabic';
    default:
      return 'Select Language';
  }
};

// Helper function to get the icon for the current language
const getLanguageIcon = (lang) => {
  switch (lang) {
    case 'english':
      return <Globe size={24} />;
    case 'kurdish':
      return <MessageCircle size={24} />;
    case 'arabic':
      return <BookOpen size={24} />;
    default:
      return <Globe size={24} />;
  }
};

const GrammarPage = () => {
  const { lang } = useParams();
  const supportedLanguages = ['english', 'kurdish', 'arabic'];
  const initialLang = supportedLanguages.includes(lang) ? lang : 'english';
  
  const [activeLanguage, setActiveLanguage] = useState(initialLang);
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPublicTips, setShowPublicTips] = useState(false);

  // Update the active language if the URL parameter changes
  useEffect(() => {
    if (supportedLanguages.includes(lang)) {
      setActiveLanguage(lang);
    }
  }, [lang]);

  // Filter content based on search query
  const filteredContent = grammarData[activeLanguage].filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (topic.explanation && topic.explanation.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleTopicToggle = (id) => {
    setActiveTopicId(activeTopicId === id ? null : id);
  };
  
  const TopicCard = ({ id, title, explanation, extraInfo, rules, types, examples, youtubeResources, dir }) => {
    const isTopicVisible = activeTopicId === id;
    const isRtl = dir === 'rtl';

    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300">
        <button 
          onClick={() => handleTopicToggle(id)}
          className="flex justify-between items-center w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 hover:bg-gray-50"
        >
          <div>
            <h3 className={`text-2xl font-bold text-gray-900 ${isRtl ? 'text-right' : 'text-left'}`}>{title}</h3>
            <p className={`text-sm text-gray-500 mt-1 ${isRtl ? 'text-right' : 'text-left'}`}>{explanation}</p>
          </div>
          {isTopicVisible ? <ChevronUp size={24} className="text-blue-500" /> : <ChevronDown size={24} className="text-gray-500" />}
        </button>
        
        {isTopicVisible && (
          <div className="p-6 border-t border-gray-200 animate-fade-in space-y-6">
            
            {/* Mom-to-Child Lesson */}
            {extraInfo && (
              <div>
                <h4 className={`text-xl font-bold text-gray-800 mb-2 flex items-center gap-2 ${isRtl ? 'flex-row-reverse justify-end' : ''}`}>
                  <Info size={20} className="text-purple-500" /> Mom-to-child Lesson
                </h4>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <p className={`text-purple-800 font-medium ${isRtl ? 'text-right' : 'text-left'}`}>{extraInfo}</p>
                </div>
              </div>
            )}
            
            {/* Rules & Structure */}
            {rules && rules.length > 0 && (
              <div>
                <h4 className={`text-xl font-bold text-gray-800 mb-2 ${isRtl ? 'text-right' : 'text-left'}`}>Rules & Structure:</h4>
                <ul className={`list-inside space-y-2 text-gray-700 ${isRtl ? 'text-right list-none' : 'text-left list-disc'}`}>
                  {rules.map((rule, index) => (
                    <li key={index} className={isRtl ? 'before:content-["•_"]' : ''} dangerouslySetInnerHTML={{ __html: rule.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  ))}
                </ul>
              </div>
            )}

            {/* In-depth types and examples */}
            {types && types.length > 0 && (
              <div className="space-y-4">
                {types.map((type, index) => (
                  <div key={index}>
                    <h4 className={`text-lg font-semibold text-gray-800 mb-1 ${isRtl ? 'text-right' : 'text-left'}`}>{type.subTitle}</h4>
                    <p className={`text-sm text-gray-600 mb-2 ${isRtl ? 'text-right' : 'text-left'}`}>{type.subExplanation}</p>
                    
                    {/* Render table if it exists */}
                    {type.subTable ? (
                      <div className="overflow-x-auto rounded-lg shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {type.subTable.headers.map((header, i) => (
                                <th key={i} scope="col" className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {type.subTable.rows.map((row, i) => (
                              <tr key={i}>
                                {row.map((cell, j) => (
                                  <td key={j} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-600 ${isRtl ? 'text-right' : 'text-left'}`}>
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <ul className={`list-inside mt-2 space-y-1 text-gray-700 ${isRtl ? 'text-right list-none' : 'text-left list-disc'}`}>
                        {type.subExamples.map((example, exIndex) => (
                          <li key={exIndex} className={isRtl ? 'before:content-["•_"]' : ''} dangerouslySetInnerHTML={{ __html: example.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Simple list of examples if no types */}
            {examples && examples.length > 0 && (
              <div>
                <h4 className={`text-lg font-semibold text-gray-700 ${isRtl ? 'text-right' : 'text-left'}`}>Examples:</h4>
                <ul className={`list-inside mt-2 space-y-1 text-gray-600 ${isRtl ? 'text-right list-none' : 'text-left list-disc'}`}>
                  {examples.map((example, index) => (
                    <li key={index} className={isRtl ? 'before:content-["•_"]' : ''} dangerouslySetInnerHTML={{ __html: example.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  ))}
                </ul>
              </div>
            )}

            {/* YouTube Resources */}
            {youtubeResources && youtubeResources.length > 0 && (
              <div className="border-t pt-4 border-gray-100">
                <h4 className={`text-xl font-bold text-gray-800 mb-2 flex items-center gap-2 ${isRtl ? 'flex-row-reverse justify-end' : ''}`}>
                  <Youtube size={20} className="text-blue-500" /> Get More Information
                </h4>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h5 className={`text-md font-semibold text-blue-800 mb-2 ${isRtl ? 'text-right' : 'text-left'}`}>Recommended Teachers & Channels:</h5>
                  <ul className={`space-y-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                    {youtubeResources.map((resource, index) => (
                      <li key={index}>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline transition-colors duration-200"
                        >
                          {resource.name}
                        </a>
                        <p className="text-xs text-blue-700 opacity-80">{resource.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const currentTips = publicTips[activeLanguage];
  const isRtl = activeLanguage === 'kurdish' || activeLanguage === 'arabic';

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen text-gray-800 font-sans">
      {/* Start of the new header section */}
      <header className="bg-white rounded-3xl shadow-xl p-4 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-4 z-40">
        {/* Title */}
        <div className="flex-shrink-0 text-center sm:text-left">
          <h1 className="text-2xl font-extrabold text-gray-900">Grammar Guide</h1>
          <p className="text-sm text-gray-500">Master English, Kurdish & Arabic</p>
        </div>

        {/* Search Bar, Language Dropdown and Tips Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors duration-200"
            />
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Language Dropdown */}
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button className="inline-flex justify-center w-full rounded-full border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500 transition-colors duration-200">
                {getLanguageIcon(activeLanguage)}
                <span className="ml-2">{getLanguageName(activeLanguage)}</span>
                <ChevronDown size={20} className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
              </Menu.Button>
            </div>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        onClick={() => setActiveLanguage('english')}
                        className={`flex items-center px-4 py-2 text-sm ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                      >
                        <Globe size={20} className="mr-3" />
                        English
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        onClick={() => setActiveLanguage('kurdish')}
                        className={`flex items-center px-4 py-2 text-sm ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                      >
                        <MessageCircle size={20} className="mr-3" />
                        Kurdish
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        onClick={() => setActiveLanguage('arabic')}
                        className={`flex items-center px-4 py-2 text-sm ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                      >
                        <BookOpen size={20} className="mr-3" />
                        Arabic
                      </a>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* Grammar Tips Button */}
          <button
            onClick={() => setShowPublicTips(!showPublicTips)}
            className="flex items-center gap-2 p-3 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 bg-yellow-500 text-white shadow-xl hover:bg-yellow-600"
          >
            <Lightbulb size={24} />
            Tips
          </button>
        </div>
      </header>
      {/* End of the new header section */}

      <div className="mx-auto max-w-7xl">
        {/* Grammar Tips Pop-up */}
        {showPublicTips && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div dir={isRtl ? 'rtl' : 'ltr'} className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl w-full h-full md:max-w-4xl md:max-h-[80vh] relative overflow-y-auto">
              <button
                onClick={() => setShowPublicTips(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
              <h3 className="text-3xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb size={32} className="text-yellow-500" /> General Grammar Tips
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Quick and useful rules to help you with your writing and speaking.
              </p>
              
              <div className="space-y-8">
                {currentTips.map((section, index) => (
                  <div key={index}>
                    <h4 className="text-2xl font-bold text-gray-800 mb-4">{section.sectionTitle}</h4>
                    <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>Rule</th>
                            <th scope="col" className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>Example</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {section.tips.map((tip, tipIndex) => (
                            <tr key={tipIndex}>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-600 ${isRtl ? 'text-right' : 'text-left'}`} dangerouslySetInnerHTML={{ __html: tip.rule.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                              <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-600 ${isRtl ? 'text-right' : 'text-left'}`} dangerouslySetInnerHTML={{ __html: tip.example.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* Grammar Content Section */}
        <div className="space-y-6">
          {filteredContent.length > 0 ? (
            filteredContent.map((topic) => (
              <TopicCard key={topic.id} {...topic} />
            ))
          ) : (
            <p className="text-center text-gray-500 text-lg">No topics found matching your search.</p>
          )}
        </div>
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
  );
};

export default GrammarPage;
