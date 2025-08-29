// Students.jsx - Refactored for a simpler, one-column desktop layout and a single, horizontally-scrolling content row.
// Blue highlight rings have been removed.

import React, { useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Video, FileText, Book, Search,
  X, Users, ChevronDown, Hash, Mic2, LayoutGrid,Calendar 
} from "lucide-react";

/* --------- data --------- */
const GRADES = [7, 8, 9, 10, 11, 12];
const GRADE_NAME = (g) => `پۆلی ${g}`;
const TYPES = [
  { key: "book", name: "کتێب", icon: BookOpen },
  { key: "booklet", name: "مەڵزەمە", icon: Book },
  { key: "video", name: "ڤیدیۆ", icon: Video },
  { key: "exam", name: "ئه‌سیله‌", icon: FileText },
];
const SUBJECTS = ["کوردی", "بیرکاری", "فیزیا", "كیمیا", "بایۆلۆجی", "ئینگلیزی", "عەرەبی", "پۆڵا"];
const TEACHERS = ["م. جاسم", "م. سه‌لاح", "م. سیروان", "م. ڕێژین", "م. ئاری"];
const EASE = [0.22, 0.61, 0.36, 1];

const MOCK_DATA = Array.from({ length: 50 }, (_, i) => {
  const grade = GRADES[i % GRADES.length];
  const typeObj = TYPES[i % TYPES.length];
  const subject = SUBJECTS[i % SUBJECTS.length];
  const teacher = TEACHERS[i % TEACHERS.length];
  const track = (grade >= 10 && i % 2 === 0) ? "زانستی" : (grade >= 10 && i % 2 !== 0) ? "ئەدەبی" : null;

  return {
    id: i + 1,
    title: `وانه‌ی ${subject} - ${GRADE_NAME(grade)}`,
    desc: `بەرهەمی مامۆستا ${teacher} - ${typeObj.name}`,
    grade,
    type: typeObj.key,
    track,
    subject,
    teacher,
    date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleDateString("ku-IQ", { year: "numeric", month: "long", day: "numeric" }),
    duration: `${Math.floor(Math.random() * 60) + 1} خولەک`,
    isNew: i < 5,
    isSolved: Math.random() > 0.7,
  };
});

/* --------- Reusable Components --------- */

const SectionCard = ({
  icon,
  title,
  subtitle,
  children,
  isOpen,
  setOpen,
  className = ""
}) => {
  const contentRef = useRef(null);
  
  const handleToggle = () => {
    setOpen();
  };

  return (
    <motion.div
      className={`relative group ${className}`}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 10, ...EASE }}
    >
      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300"></div>
      <div className="relative z-10 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-white/10 shadow-sm overflow-hidden">
        <motion.button
          className="w-full flex items-center justify-between gap-3 p-4 text-right"
          onClick={handleToggle}
        >
          <div className="flex items-center gap-3">
            {icon && <motion.div className="flex-shrink-0 text-sky-500">{icon}</motion.div>}
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
              <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-300">{subtitle}</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown size={24} className="flex-shrink-0 text-zinc-400" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: {
                  height: "auto",
                  opacity: 1,
                },
                collapsed: {
                  height: 0,
                  opacity: 0,
                },
              }}
              transition={{ duration: 0.8, ease: EASE }}
              className="overflow-hidden"
            >
              <div
                ref={contentRef}
                className="p-3 bg-white dark:bg-zinc-900"
              >
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const Content = ({ grade, selectedSubject, teacher, search, selectedType }) => {
  const filteredData = useMemo(() => {
    return MOCK_DATA.filter(item => {
      const matchesType = !selectedType || item.type === selectedType;
      const matchesGrade = grade === 0 || item.grade === grade;
      const matchesSubject = !selectedSubject || item.subject === selectedSubject;
      const matchesTeacher = !teacher || item.teacher === teacher;
      const matchesSearch = !search || item.title.includes(search) || item.desc.includes(search);
      return matchesType && matchesGrade && matchesSubject && matchesTeacher && matchesSearch;
    });
  }, [grade, selectedSubject, teacher, search, selectedType]);

  if (filteredData.length === 0) {
    return (
      <div className="p-10 text-center text-zinc-400">
        <p>هیچ وانه‌یه‌ک نەدۆزرایه‌وه‌.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex flex-nowrap overflow-x-auto space-x-4 p-3 snap-x snap-mandatory"
    >
      <AnimatePresence>
        {filteredData.map((item, index) => (
          <motion.a
            key={item.id}
            href="#"
            className="block flex-shrink-0 w-72 snap-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: EASE, delay: index * 0.05 }}
          >
            <div className="relative rounded-3xl border border-teal-200/30 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-md hover:shadow-xl hover:scale-[1.02] transition-transform duration-300">
              <div className="aspect-video w-full overflow-hidden rounded-t-3xl bg-gradient-to-br from-sky-500/20 to-transparent flex items-center justify-center">
                 <div className="p-4 rounded-full bg-sky-500/10 text-sky-500 ring-1 ring-sky-500/20">
                     <BookOpen size={24} />
                 </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-full ring-1 ring-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    {item.type === "video" ? <Video size={20} /> : <BookOpen size={20} />}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{item.title}</p>
                    <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">{item.desc}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 ring-1 ring-teal-500/20 flex items-center gap-1">
                    <Hash size={12} /> {item.grade}
                  </span>
                  {item.track && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 ring-1 ring-indigo-500/20">
                      {item.track}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 ring-1 ring-orange-500/20 flex items-center gap-1">
                    <Calendar size={12} /> {item.date}
                  </span>
                </div>
              </div>
            </div>
          </motion.a>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};


const StudentsPage = () => {
  const [grade, setGrade] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [teacher, setTeacher] = useState("");
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  
  // State for accordion behavior
  const [openSection, setOpenSection] = useState("search");

  return (
    <div dir="rtl" className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans p-2 sm:p-4 space-y-4">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-900 ring-1 ring-white/10 p-8 sm:p-12">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:gap-6 justify-between">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-sky-500/20 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
            <Users size={64} className="text-sky-300" />
          </div>
          <div className="text-center sm:text-right mt-4 sm:mt-0">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">ناوچەی قوتابیان</h1>
            <p className="mt-2 text-zinc-400 text-base">
              هەموو وانە و مەڵزەمە و ڤیدیۆ و تاقیکردنەوەکان لەیەک شوێندا.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Search Card */}
        <SectionCard
          title="گه‌ڕان"
          subtitle="بەدوای وانەیەکدا بگەڕێ بە ناونیشان یان ناو."
          icon={<Search size={24} />}
          isOpen={openSection === "search"}
          setOpen={() => setOpenSection(openSection === "search" ? "" : "search")}
        >
          <div className="relative w-full">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="گه‌ڕان..."
              className="w-full bg-zinc-800 text-sm rounded-xl pr-3 pl-8 py-2.5 text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-all"
            />
            {search && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                type="button"
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-3 flex items-center"
              >
                <X size={16} className="text-zinc-400 hover:text-white" />
              </motion.button>
            )}
            {!search && (
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <Search size={16} className="text-zinc-500" />
              </div>
            )}
          </div>
        </SectionCard>

        {/* Filter Card (Grades, Subjects, Teachers) */}
        <SectionCard
          title="فلتەرەکان"
          subtitle="وانەکان بە پۆل، بابەت، یان مامۆستا فلتەر بکە."
          icon={<LayoutGrid size={24} />}
          isOpen={openSection === "filters"}
          setOpen={() => setOpenSection(openSection === "filters" ? "" : "filters")}
        >
          <div className="space-y-4">
            {/* Grades Filter */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">پۆل:</h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {GRADES.map((g) => (
                  <motion.button
                    key={g}
                    onClick={() => setGrade(grade === g ? 0 : g)}
                    className={`p-2 rounded-xl text-center text-sm font-semibold transition-colors
                      ${grade === g
                        ? 'bg-sky-500/10 text-sky-500'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700/50 hover:ring-sky-500/20'
                      }`}
                  >
                    {GRADE_NAME(g)}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Subjects Filter */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">بابەت:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SUBJECTS.map((s) => (
                  <motion.button
                    key={s}
                    onClick={() => setSelectedSubject(selectedSubject === s ? "" : s)}
                    className={`p-2 rounded-xl text-center text-sm font-semibold transition-colors
                      ${selectedSubject === s
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700/50 hover:ring-emerald-500/20'
                      }`}
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Teachers Filter */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">مامۆستا:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {TEACHERS.map((t) => (
                  <motion.button
                    key={t}
                    onClick={() => setTeacher(teacher === t ? "" : t)}
                    className={`p-3 rounded-xl text-center text-sm font-semibold transition-colors
                      ${teacher === t
                        ? 'bg-indigo-500/10 text-indigo-500'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700/50 hover:ring-indigo-500/20'
                      }`}
                  >
                    {t}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Type-specific Section Cards (functioning as primary type filters) */}
      <div className="space-y-4">
        {TYPES.map((typeObj) => (
          <SectionCard
            key={typeObj.key}
            title={`${typeObj.name}ەکان`}
            subtitle={`هەموو ${typeObj.name}ە بەردەستەکان ببینە.`}
            icon={<typeObj.icon size={24} />}
            isOpen={selectedType === typeObj.key}
            setOpen={() => setSelectedType(selectedType === typeObj.key ? "" : typeObj.key)}
            className="cursor-pointer"
          >
            {/* Content for this specific type, filtered by general filters */}
            <Content
              grade={grade}
              selectedSubject={selectedSubject}
              teacher={teacher}
              search={search}
              selectedType={typeObj.key}
            />
          </SectionCard>
        ))}
      </div>
    </div>
  );
};

export default StudentsPage;