/* ----------------------------- DATA (unchanged) ---------------------------- */
const grammarData = {
  english: [
    {
      id: 1,
      title: 'Passive Voice',
      explanation:
        'The passive voice is a grammatical construction where the subject of the sentence receives the action rather than performing it. This is often used when the actor is unknown or unimportant.',
      extraInfo:
        "Imagine you want to talk about something that happened, but you don't know who did it, or it's not important. The passive voice lets you focus on the thing that the action happened to. For example, instead of saying \"A student broke the window,\" you can say \"The window was broken.\" The window is the star of the sentence!",
      rules: [
        '**Rule 1: Form the passive with a form of the verb "to be" + the past participle of the main verb.**',
        '**Rule 2: The object of the active sentence becomes the subject of the passive sentence.**',
        '**Rule 3: You can mention the original subject using "by + agent," but this is often omitted.**',
      ],
      types: [
        {
          subTitle: 'Passive with a Modal Verb',
          subExplanation:
            'This is formed using a modal verb (can, could, must, should, etc.) + be + past participle.',
          subExamples: ['Active: You **must clean** the kitchen.', 'Passive: The kitchen **must be cleaned**.'],
        },
        {
          subTitle: 'Passive in Different Tenses (Mapping)',
          subExplanation:
            'The passive voice can be used in almost all tenses. The verb "to be" is conjugated to match the tense, and the main verb is always in the past participle form. See the table below for a clear mapping.',
          subTable: {
            headers: ['Tense', 'Active Voice Structure', 'Passive Voice Structure'],
            rows: [
              ['Present Simple', 'Subject + Verb', 'Subject + **am/is/are** + Past Participle'],
              ['Past Simple', 'Subject + Verb-ed', 'Subject + **was/were** + Past Participle'],
              ['Present Perfect', 'Subject + has/have + Verb-ed', 'Subject + **has/have been** + Past Participle'],
              ['Future Simple', 'Subject + will + Verb', 'Subject + **will be** + Past Participle'],
            ],
          },
        },
        {
          subTitle: 'Passive with "get"',
          subExplanation:
            'In informal contexts, "get" is sometimes used instead of "be" to form the passive voice, especially to describe something that happens to someone or something unexpectedly.',
          subExamples: ['He **got hit** by a car.', 'They **got married** in Las Vegas.'],
        },
        {
          subTitle: 'Passive of a Reporting Verb',
          subExplanation:
            'This is used to report what people think or say. The common structure is "It is said that..." or "He is thought to be..."',
          subExamples: [
            'Active: People **say** that he is a good teacher.',
            'Passive: **It is said** that he is a good teacher.',
            'Passive: He **is said** to be a good teacher.',
          ],
        },
      ],
      youtubeResources: [
        { name: 'TED-Ed', url: 'https://www.youtube.com/@TEDEd', description: 'Fun, animated lessons on a wide range of topics, including grammar.' },
        { name: 'BBC Learning English', url: 'https://www.youtube.com/@bbclearningenglish', description: 'Daily videos to help you improve your English pronunciation, grammar, and more.' },
        { name: 'Grammarly', url: 'https://www.youtube.com/@grammarly', description: 'Quick tips and easy-to-understand explanations for common grammar issues.' },
      ],
    },
    {
      id: 2,
      title: 'Conditional Sentences',
      explanation:
        'Conditional sentences are statements that discuss known factors or hypothetical situations and their consequences. There are four main types.',
      extraInfo:
        "Think of conditional sentences as a \"what if\" game! You're saying, \"If this happens, then that will happen.\" The different types let you talk about real possibilities (\"If I study, I will pass\") or imaginary ones (\"If I were a bird, I would fly\").",
      rules: [
        '**Rule 1: A conditional sentence has two clauses: an "if" clause (the condition) and a main clause (the result).**',
        '**Rule 2: The order of the clauses can be changed, but a comma is used when the "if" clause comes first.**',
      ],
      types: [
        {
          subTitle: 'Zero Conditional',
          subExplanation: 'Used for facts and general truths. Structure: If + Present Simple, ... Present Simple.',
          subExamples: ['If you **heat** water to 100°C, it **boils**.'],
        },
        {
          subTitle: 'First Conditional',
          subExplanation: 'Used for a likely or possible future outcome. Structure: If + Present Simple, ... will + base verb.',
          subExamples: ['If it **rains**, we **will stay** inside.'],
        },
        {
          subTitle: 'Second Conditional',
          subExplanation:
            'Used for hypothetical or unlikely situations. Structure: If + Past Simple, ... would + base verb.',
          subExamples: ['If I **were** a millionaire, I **would travel** the world.'],
        },
        {
          subTitle: 'Third Conditional',
          subExplanation:
            'Used for imaginary situations in the past. Structure: If + Past Perfect, ... would have + Past Participle.',
          subExamples: ['If you **had studied**, you **would have passed** the exam.'],
        },
      ],
      youtubeResources: [
        { name: 'TED-Ed', url: 'https://www.youtube.com/@TEDEd', description: 'Animated lessons that make complex topics easy to understand.' },
        { name: 'Oxford English Dictionary', url: 'https://www.youtube.com/@OxfordEnglishDictionary', description: 'Explore the history and usage of the English language.' },
      ],
    },
  ],
  kurdish: [
    {
      id: 1,
      title: 'ناوی لێکدراو و سادە',
      explanation: 'ناوی لێکدراو لە دوو وشە یان زیاتر پێکدێت. ناوی سادە تەنها لە یەک وشە پێکدێت و لێک نادرێتەوە.',
      extraInfo:
        'لە زمانی کوردیدا هەندێک وشە تەنها یەک پارچەن وەک "باخ" (باغ). بەڵام هەندێک وشەی تر لە دوو یان زیاتر وشە دروستکراون وەک "باخچەوان" (باغ+چەوان). ئەمەی دووەمیان پێی دەوترێت ناوی لێکدراو، وەک یارییەکی پێکەوەنانی وشە وایە!',
      rules: [
        '**یاسا: ناوی لێکدراو لە دوو وشەی سەربەخۆ دروست دەبێت.**',
        '**یاسا: دەتوانرێت ناوی لێکدراو لە ناو + کردار، یان ناو + ناو دروست بکرێت.**',
      ],
      examples: ['ناوی سادە: **باخ**', 'ناوی لێکدراو: **باخچەوان**', 'ناوی لێکدراو: **خۆشەویستی**'],
      youtubeResources: [
        { name: 'مامۆستا نەوزاد', url: 'https://www.youtube.com/results?search_query=مامۆستا+نەوزاد', description: 'مامۆستایەکی بەناوبانگ بۆ ڕێزمانی کوردی.' },
        { name: 'فێرکاری زمانی کوردی', url: 'https://www.youtube.com/results?search_query=فێرکاری+زمانی+کوردی', description: 'کەناڵێکی تایبەت بە وانەکانی زمانی کوردی.' },
      ],
      dir: 'rtl',
    },
    {
      id: 2,
      title: 'جێناوی کەسی',
      explanation: 'جێناوی کەسی لەجیاتی ناوی کەسێک دادەنرێت. وەک (من, تۆ, ئەو, ئێمە, ئێوە, ئەوان).',
      extraInfo:
        'کاتێک دەمانەوێت قسە لەسەر کەسێک بکەین و ناوی نەهێنینەوە، جێناو بەکاردێنین. وەک ئەوەی بڵێی "ئەو" لەجیاتی "ئەحمەد." جێناوەکان ڕستەکانمان کورتتر و جوانتر دەکەن.',
      rules: ['**یاسا: جێناو لە سەرەتای ڕستەدا دێت و بە پێی ژمارە دەگۆڕدرێت.**', '**یاسا: جێناوەکان ڕۆڵی بکەر دەبینن لە ڕستەدا.**'],
      examples: ['من **قوتابی**م.', 'ئەوان **وەرزشکار**ن.'],
      youtubeResources: [
        { name: 'مامۆستا نەوزاد', url: 'https://www.youtube.com/results?search_query=مامۆستا+نەوزاد', description: 'مامۆستایەکی بەناوبانگ بۆ ڕێزمانی کوردی.' },
        { name: 'فێرکاری زمانی کوردی', url: 'https://www.youtube.com/results?search_query=فێرکاری+زمانی+کوردی', description: 'کەناڵێکی تایبەت بە وانەکانی زمانی کوردی.' },
      ],
      dir: 'rtl',
    },
  ],
  arabic: [
    {
      id: 1,
      title: 'أقسام الكلام',
      explanation:
        'تتكون اللغة العربية من ثلاثة أقسام رئيسية: الاسم، والفعل، والحرف. لكل منها قواعدها الخاصة التي تحدد موقعها في الجملة.',
      extraInfo:
        'اللغة العربية مثل صندوق ألعاب، فيها ثلاثة أنواع رئيسية من القطع: أسماء (مثل اسمك)، وأفعال (مثل "يجري" أو "يأكل")، وحروف (مثل "في" أو "إلى"). عندما نجمع هذه القطع معًا، نصنع جملة جميلة!',
      rules: [
        '**القاعدة 1: الاسم هو ما دل على معنى غير مقترن بزمن.**',
        '**القاعدة 2: الفعل هو ما دل على حدث مقترن بزمن.**',
        '**القاعدة 3: الحرف هو ما لا يظهر معناه إلا مع غيره.**',
      ],
      examples: ['الاسم: **محمد**', 'الفعل: **كتب**', 'الحرف: **في**'],
      youtubeResources: [
        { name: 'د. أيمن السويد', url: 'https://www.youtube.com/results?search_query=د.+أيمن+السويد', description: 'دروس مفصلة في قواعد اللغة العربية.' },
        { name: 'قناة العربية', url: 'https://www.youtube.com/results?search_query=قناة+العربية', description: 'دروس لغوية مبسطة وممتعة.' },
      ],
      dir: 'rtl',
    },
    {
      id: 2,
      title: 'الجملة الاسمية والفعلية',
      explanation:
        'الجملة الاسمية تبدأ باسم وتتكون من مبتدأ وخبر. الجملة الفعلية تبدأ بفعل وتتكون من فعل وفاعل.',
      extraInfo:
        'تخيل أن الجملة لها عائلة. العائلة الاسمية تبدأ باسم (مثل "الشمس"), والعائلة الفعلية تبدأ بفعل (مثل "يقرأ"). كل عائلة لها قواعدها الخاصة، لكنها جميعًا تصنع جملًا رائعة!',
      rules: [
        '**القاعدة 1: الجملة الاسمية تتكون من مبتدأ وخبر، وكلاهما مرفوع.**',
        '**القاعدة 2: الجملة الفعلية تتكون من فعل وفاعل، وقد تحتوي على مفعول به.**',
      ],
      examples: ['جملة اسمية: **الشمس مشرقة.**', 'جملة فعلية: **يقرأ الطالب الدرس.**'],
      youtubeResources: [
        { name: 'د. أيمن السويد', url: 'https://www.youtube.com/results?search_query=د.+أيمن+السويد', description: 'دروس في النحو والصرف.' },
        { name: 'قناة العربية', url: 'https://www.youtube.com/results?search_query=قناة+العربية', description: 'شروحات مبسطة للقواعد العربية.' },
      ],
      dir: 'rtl',
    },
  ],
};

// Removed publicTips as the Pro Tips modal is being removed
// const publicTips = { ... }; 

/* -------------------------------- COMPONENTS ------------------------------- */
import React, { useState, useEffect, useMemo, Fragment } from 'react';
// import { useParams } from 'react-router-dom'; // Removed as it was not used consistently or passed
import {
  Globe, MessageCircle, BookOpen, Youtube,
  ChevronDown, ChevronUp, Sparkles, Search // Removed Lightbulb as Pro Tips button is gone
} from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion'; // For smoother animations

// Helper to get language name
const getLanguageName = (lang) =>
  lang === 'english' ? 'English' : lang === 'kurdish' ? 'کوردی' : 'عربي';
// Helper to get language icon
const getLanguageIcon = (lang) =>
  lang === 'english' ? <Globe size={16}/> : lang === 'kurdish' ? <MessageCircle size={16}/> : <BookOpen size={16}/>;

// Main Grammar Page Component
const GrammarPage = () => {
  // const { lang } = useParams(); // useParams assumes a router setup, simplifying for direct component usage
  const supported = ['english','kurdish','arabic'];
  // Default to 'english' or a valid language from local storage, or 'kurdish'
  const [activeLanguage, setActiveLanguage] = useState(() => {
    const savedLang = localStorage.getItem('activeGrammarLanguage');
    return supported.includes(savedLang) ? savedLang : 'english';
  });

  const [activeTopic, setActiveTopic] = useState(null);
  const [search, setSearch] = useState('');
  // Removed showTips state as the Pro Tips modal is being removed
  // const [showTips, setShowTips] = useState(false);

  // Persist active language selection
  useEffect(() => {
    localStorage.setItem('activeGrammarLanguage', activeLanguage);
  }, [activeLanguage]);

  // Set initial language from URL params (if router were active)
  // useEffect(()=>{ if(supported.includes(lang)) setActiveLanguage(lang); },[lang]); // Commented out for now

  // Determine RTL direction for active language
  const isRtl = activeLanguage === 'kurdish' || activeLanguage === 'arabic';

  // Filter topics based on search query
  const topics = grammarData[activeLanguage] || [];
  const filtered = useMemo(()=>{
    if(!search) return topics;
    const q = search.toLowerCase();
    return topics.filter(t=>t.title.toLowerCase().includes(q)||(t.explanation||'').toLowerCase().includes(q) || (t.extraInfo||'').toLowerCase().includes(q));
  },[search,topics]);

  // Topic Card Component - improved styling and RTL support
  const TopicCard = ({id,title,explanation,extraInfo,rules,examples,types,youtubeResources,dir})=>{
    const open = activeTopic===id;
    const rtl = dir==='rtl'||isRtl; // Prioritize topic-specific dir, then global activeLanguage dir

    return(
      <motion.div
        layout // Animates layout changes smoothly
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        dir={rtl?'rtl':'ltr'}
        className="bg-zinc-900/60 backdrop-blur rounded-2xl border border-zinc-700 shadow-lg overflow-hidden group hover:border-purple-600 transition-all duration-300"
      >
        <button onClick={()=>setActiveTopic(open?null:id)}
          className="w-full flex justify-between items-center p-4 text-left hover:bg-zinc-800/70 transition">
          <div className={`${rtl ? 'text-right' : 'text-left'}`}>
            <h3 className="font-bold text-purple-300 text-lg group-hover:text-purple-200">{title}</h3>
            <p className="text-xs text-zinc-400 mt-1">{explanation}</p>
          </div>
          {open
            ? <ChevronUp size={20} className="text-purple-400 group-hover:text-purple-300 transition-transform duration-200 transform rotate-180" />
            : <ChevronDown size={20} className="text-zinc-500 group-hover:text-purple-400 transition-transform duration-200" />
          }
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 space-y-4 text-sm text-zinc-200 overflow-hidden" // Added overflow-hidden for smooth height transition
            >
              {extraInfo && (
                <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/30 p-3 rounded-xl border border-purple-700/40">
                  <Sparkles className={`inline text-pink-400 ${rtl ? 'ml-1' : 'mr-1'}`} /> {extraInfo}
                </div>
              )}
              {rules?.length > 0 && (
                <div className={`space-y-1 ${rtl ? 'text-right' : 'text-left'}`}>
                    <p className="font-bold text-purple-300 mb-2">القواعد / یاساكان / Rules:</p>
                    <ul className={`${rtl ? 'pr-5' : 'pl-5'} list-disc space-y-1`}>
                        {rules.map((r, i) => (
                            <li key={i} dangerouslySetInnerHTML={{ __html: r.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        ))}
                    </ul>
                </div>
              )}
              {examples?.length > 0 && (
                <div className={`space-y-1 ${rtl ? 'text-right' : 'text-left'}`}>
                    <p className="font-bold text-purple-300 mb-2">الأمثلة / نموونەکان / Examples:</p>
                    <ul className={`${rtl ? 'pr-5' : 'pl-5'} list-disc space-y-1`}>
                        {examples.map((e, i) => (
                            <li key={i} dangerouslySetInnerHTML={{ __html: e.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        ))}
                    </ul>
                </div>
              )}
              {types?.length > 0 && types.map((t, i) => (
                <div key={i} className="bg-zinc-800/60 p-3 rounded-md border border-zinc-700">
                  <p className="font-semibold text-purple-300">{t.subTitle}</p>
                  <p className="text-xs text-zinc-400 mt-1">{t.subExplanation}</p>
                  {t.subExamples && (
                    <ul className={`${rtl ? 'pr-5' : 'pl-5'} list-disc mt-2 text-xs space-y-1 text-zinc-300`}>
                      {t.subExamples.map((ex, j) => <li key={j} dangerouslySetInnerHTML={{ __html: ex }} />)}
                    </ul>
                  )}
                  {t.subTable && (
                    <div className="mt-3 overflow-x-auto">
                      <table className="min-w-full divide-y divide-zinc-700 border border-zinc-700 rounded-lg">
                        <thead className="bg-zinc-800">
                          <tr>{t.subTable.headers.map((header, hIdx) => (<th key={hIdx} className={`px-4 py-2 text-xs font-medium text-zinc-300 uppercase tracking-wider ${rtl ? 'text-right' : 'text-left'}`}>{header}</th>))}</tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                          {t.subTable.rows.map((row, rIdx) => (<tr key={rIdx} className="hover:bg-zinc-800/50">{row.map((cell, cIdx) => (<td key={cIdx} className={`px-4 py-2 whitespace-nowrap text-sm text-zinc-200 ${rtl ? 'text-right' : 'text-left'}`} dangerouslySetInnerHTML={{ __html: cell.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} ></td>))}</tr>))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
              {youtubeResources?.length > 0 && (
                <div className="bg-red-900/40 p-3 rounded-lg border border-red-700/40">
                  <p className="font-bold text-red-300 mb-2 flex items-center">
                    <Youtube size={16} className={`${rtl ? 'ml-1' : 'mr-1'}`} /> ڤیدیۆکان
                  </p>
                  {youtubeResources.map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noreferrer"
                      className="block text-sm text-red-400 hover:underline">{r.name}</a>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return(
    <div dir={isRtl?'rtl':'ltr'} className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-black min-h-screen text-zinc-100 font-['Inter']">
      {/* Header - now truly stable and responsive */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur border-b border-zinc-800 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between p-3 gap-2 sm:gap-0">
          <h1 className="font-extrabold text-lg flex items-center gap-1 text-purple-300">
            <Sparkles className="text-purple-400"/> ڕێزمان
          </h1>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search input - desktop view */}
            <div className="relative hidden sm:block flex-grow sm:flex-grow-0">
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="گەڕان…"
                className="pl-8 pr-2 py-1 rounded-lg bg-zinc-800 text-sm text-zinc-200 border border-zinc-700 focus:ring-2 focus:ring-purple-500 w-full"/>
              <Search size={16} className="absolute left-2 top-1.5 text-zinc-500"/>
            </div>
            {/* Language Selector */}
            <Menu as="div" className="relative shrink-0">
              <Menu.Button className="flex items-center gap-1 px-2 py-1 bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg text-sm hover:bg-zinc-700 transition">
                {getLanguageIcon(activeLanguage)} {getLanguageName(activeLanguage)}
                <ChevronDown size={14}/>
              </Menu.Button>
              <Transition as={Fragment}
                enter="transition ease-out duration-100" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Menu.Items className="absolute right-0 mt-1 w-32 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg text-sm z-50 origin-top-right">
                  {['english','kurdish','arabic'].map(l=>(
                    <Menu.Item key={l}>
                      {({active})=>(
                        <button onClick={()=>setActiveLanguage(l)}
                          className={`flex items-center gap-1 w-full px-2 py-1 ${active?'bg-zinc-800':''} ${isRtl?'text-right justify-end':'text-left justify-start'}`}>
                          {getLanguageName(l)} {getLanguageIcon(l)}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </header>

      {/* Mobile search input */}
      <div className="sm:hidden p-3">
        <div className="relative">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="گەڕان…"
            className="w-full pl-8 pr-2 py-2 rounded-lg bg-zinc-800 text-sm text-zinc-200 border border-zinc-700 focus:ring-2 focus:ring-purple-500"/>
          <Search size={16} className="absolute left-2 top-2.5 text-zinc-500"/>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-3 space-y-3">
        <AnimatePresence mode="wait"> {/* Animate presence of topic cards */}
          {filtered.length > 0 ? (
            filtered.map(t=><TopicCard key={t.id} {...t}/>)
          ) : (
            <motion.p
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-zinc-400 py-8"
            >
              هیچ ئەنجامێک نەدۆزرایەوە.
            </motion.p>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default GrammarPage;

