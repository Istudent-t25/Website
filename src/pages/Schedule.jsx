// ============================== Schedule.jsx - Next-Gen Design ==============================
// This version focuses on a more immersive, dynamic layout with a layered, glassmorphism feel.
// The design uses overlapping panels and subtle glows to create a sense of depth.
//
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GraduationCap,
  CheckCircle2,
  Plus,
  Trash2,
  AlarmClock,
  MapPin,
  Filter,
  PartyPopper,
  LayoutGrid,
  List,
  BookOpen,
  X,
} from "lucide-react";

// ---------------- Constants ----------------
const DAYS = ["شەممە", "یەکشەممە", "دووشەممە", "سێشەممە", "چوارشەممە", "پێنجشەممە", "هەینی"];
const TIMES = ["08:00", "09:30", "11:00", "12:30", "14:00"];

const WEEKLY_SCHEDULE_INITIAL = {
  "شەممە": [
    { time: "08:00", subject: "بیركاری", teacher: "مامۆستا ئارام", room: "A-301", color: "from-sky-600/30 to-sky-500/20" },
    { time: "09:30", subject: "کوردی", teacher: "مامۆستا هێمن", room: "B-210", color: "from-emerald-600/30 to-emerald-500/20" },
  ],
  "یەکشەممە": [
    { time: "08:00", subject: "فیزیا", teacher: "مامۆستا هوراز", room: "C-105", color: "from-indigo-600/30 to-indigo-500/20" },
    { time: "11:00", subject: "ئینگلیزی", teacher: "مامۆستا سارا", room: "A-204", color: "from-fuchsia-600/30 to-fuchsia-500/20" },
  ],
  "دووشەممە": [{ time: "09:30", subject: "کیمیا", teacher: "مامۆستا ناز", room: "Lab-2", color: "from-rose-600/30 to-rose-500/20" }],
  "سێشەممە": [
    { time: "08:00", subject: "ئەندازیارى", teacher: "مامۆستا رێبوار", room: "D-410", color: "from-amber-600/30 to-amber-500/20" },
    { time: "12:30", subject: "بیركاری", teacher: "مامۆستا ڕێژین", room: "A-305", color: "from-sky-600/30 to-sky-500/20" },
  ],
  "چوارشەممە": [{ time: "11:00", subject: "کوردی", teacher: "مامۆستا دڵشاد", room: "B-110", color: "from-emerald-600/30 to-emerald-500/20" }],
  "پێنجشەممە": [{ time: "14:00", subject: "فیزیا", teacher: "مامۆستا بەرزان", room: "C-106", color: "from-indigo-600/30 to-indigo-500/20" }],
  "هەینی": [],
};

const SUBJECT_COLORS = [
  "from-sky-600/30 to-sky-500/20",
  "from-emerald-600/30 to-emerald-500/20",
  "from-indigo-600/30 to-indigo-500/20",
  "from-fuchsia-600/30 to-fuchsia-500/20",
  "from-rose-600/30 to-rose-500/20",
  "from-amber-600/30 to-amber-500/20",
];

const STORAGE_HOMEWORK = "schedule_homework_v1";
const STORAGE_EVENTS = "schedule_events_v1";
const STORAGE_WEEKLY_SCHEDULE = "schedule_weekly_schedule_v1";

const variants = {
  fade: { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } },
};

// ---------------- Utils ----------------
function startOfWeekSaturday(date = new Date(), weekOffset = 0) {
  const d = new Date(date);
  const day = d.getDay();
  const diffToSat = day === 6 ? 0 : day + 1;
  d.setDate(d.getDate() - diffToSat + weekOffset * 7);
  return d;
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function fmtDate(d) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}
function fmtLong(d) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
function nowTimeHHMM() {
  const n = new Date();
  const hh = String(n.getHours()).padStart(2, "0");
  const mm = String(n.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
function isTimeBefore(a, b) {
  return a.localeCompare(b) < 0;
}
function uuid() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

// ---------------- UI Components ----------------
// Updated Panel for a more pronounced glassmorphism effect
function GlassPanel({ className = "", children }) {
  return (
    <div
      className={
        "rounded-3xl bg-white/5 backdrop-blur-3xl ring-1 ring-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.35)] " +
        "relative overflow-hidden transition-transform duration-300 hover:scale-[1.01] " +
        className
      }
    >
      {children}
    </div>
  );
}

function KPI({ icon: Icon, label, value, tint = "text-sky-300" }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white/5 ring-1 ring-white/10 px-3 py-2">
      <Icon size={18} className={tint} />
      <span className="text-xs text-zinc-300">
        {label}: <span className="font-semibold text-zinc-100">{value}</span>
      </span>
    </div>
  );
}

// ---------------- Component ----------------
export default function Schedule() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [view, setView] = useState("day");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const [weeklySchedule, setWeeklySchedule] = useState(WEEKLY_SCHEDULE_INITIAL);
  const [homeworks, setHomeworks] = useState([]);
  const [events, setEvents] = useState([]);
  const [hwFilter, setHwFilter] = useState("all");
  const [newHw, setNewHw] = useState({ subject: "", title: "", due: "", priority: "normal" });
  const [newEvent, setNewEvent] = useState({ title: "", date: "", time: "", place: "" });

  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubject, setNewSubject] = useState({
    day: DAYS[0],
    time: TIMES[0],
    subject: "",
    teacher: "",
    room: "",
    color: SUBJECT_COLORS[0],
  });

  // Set default selected day to today, default view to day on narrow screens
  useEffect(() => {
    const jsDay = new Date().getDay();
    const index = jsDay === 6 ? 0 : jsDay + 1;
    setSelectedDayIndex(index);
    if (window.matchMedia("(max-width: 1023px)").matches) setView("day");
  }, []);

  // Load/persist
  useEffect(() => {
    const hw = localStorage.getItem(STORAGE_HOMEWORK);
    const ev = localStorage.getItem(STORAGE_EVENTS);
    const ws = localStorage.getItem(STORAGE_WEEKLY_SCHEDULE);
    if (hw) setHomeworks(JSON.parse(hw));
    if (ev) setEvents(JSON.parse(ev));
    if (ws) setWeeklySchedule(JSON.parse(ws));
  }, []);
  useEffect(() => localStorage.setItem(STORAGE_HOMEWORK, JSON.stringify(homeworks)), [homeworks]);
  useEffect(() => localStorage.setItem(STORAGE_EVENTS, JSON.stringify(events)), [events]);
  useEffect(() => localStorage.setItem(STORAGE_WEEKLY_SCHEDULE, JSON.stringify(weeklySchedule)), [weeklySchedule]);

  // Week dates
  const weekStart = useMemo(() => startOfWeekSaturday(new Date(), weekOffset), [weekOffset]);
  const weekDates = useMemo(() => DAYS.map((_, i) => addDays(weekStart, i)), [weekStart]);

  // KPIs
  const todayJsIndex = new Date().getDay();
  const todayIndex = todayJsIndex === 6 ? 0 : todayJsIndex + 1;
  const todayName = DAYS[todayIndex] || DAYS[0];
  const todayClasses = weeklySchedule[todayName] || [];
  const currentHHMM = nowTimeHHMM();
  const nextClass = todayClasses.find((c) => isTimeBefore(currentHHMM, c.time));
  const hwDueTodayCount = homeworks.filter((h) => !h.done && h.due && isSameDateStr(h.due, new Date())).length;
  const eventsThisWeekCount = events.filter((e) => isInWeek(new Date(e.date), weekStart)).length;

  function isSameDateStr(isoStr, d) {
    const src = new Date(isoStr + "T00:00:00");
    return src.getFullYear() === d.getFullYear() && src.getMonth() === d.getMonth() && src.getDate() === d.getDate();
  }
  function isInWeek(d, start) {
    const end = addDays(start, 7);
    return d >= start && d < end;
  }

  // Homework filtered
  const filteredHomeworks = useMemo(() => {
    const today = new Date();
    return homeworks
      .slice()
      .sort((a, b) => (a.due || "").localeCompare(b.due || ""))
      .filter((h) => {
        if (hwFilter === "open") return !h.done;
        if (hwFilter === "done") return !!h.done;
        if (hwFilter === "today") return h.due && isSameDateStr(h.due, today);
        if (hwFilter === "overdue") return !h.done && h.due && new Date(h.due) < new Date(today.toDateString());
        return true;
      });
  }, [homeworks, hwFilter]);

  // Actions
  function addHomework(e) {
    e.preventDefault();
    if (!newHw.title) return;
    setHomeworks((prev) => [
      { id: uuid(), ...newHw, subject: newHw.subject.trim(), title: newHw.title.trim(), done: false, createdAt: new Date().toISOString() },
      ...prev,
    ]);
    setNewHw({ subject: "", title: "", due: "", priority: "normal" });
  }
  function toggleHwDone(id) {
    setHomeworks((prev) => prev.map((h) => (h.id === id ? { ...h, done: !h.done } : h)));
  }
  function deleteHw(id) {
    setHomeworks((prev) => prev.filter((h) => h.id !== id));
  }
  function addEvent(e) {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    setEvents((prev) => [{ id: uuid(), ...newEvent, createdAt: new Date().toISOString() }, ...prev]);
    setNewEvent({ title: "", date: "", time: "", place: "" });
  }
  function deleteEvent(id) {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  }
  function addScheduleSubject(e) {
    e.preventDefault();
    if (!newSubject.subject || !newSubject.teacher || !newSubject.room) return;

    setWeeklySchedule((prevSchedule) => {
      const updatedDaySchedule = [...(prevSchedule[newSubject.day] || []), { ...newSubject, id: uuid() }];
      updatedDaySchedule.sort((a, b) => a.time.localeCompare(b.time));
      return {
        ...prevSchedule,
        [newSubject.day]: updatedDaySchedule,
      };
    });
    setNewSubject({
      day: DAYS[0],
      time: TIMES[0],
      subject: "",
      teacher: "",
      room: "",
      color: SUBJECT_COLORS[0],
    });
    setShowAddSubjectModal(false);
  }

  const hwPill = (p) =>
    p === "high"
      ? "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30"
      : p === "low"
      ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30"
      : "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30";

  // ---------------- Render ----------------
  return (
    <div dir="rtl" className="min-h-screen w-full bg-gradient-to-br from-zinc-950 via-zinc-950 to-black text-zinc-100 flex flex-col">
      {/* Ambient glows */}
      <div aria-hidden className="absolute inset-0 z-0">
        <div className="absolute -top-16 -left-10 w-72 h-72 rounded-full bg-sky-500/10 blur-3xl animate-[pulse_10s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 -right-10 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl animate-[pulse_12s_ease-in-out_infinite_2s]" />
      </div>

      {/* Hero and Controls Container */}
      <motion.div variants={variants.fade} initial="hidden" animate="show" className="relative p-3 md:p-6 mb-5 z-10">
        <GlassPanel>
          <div className="relative grid gap-4 lg:grid-cols-3 lg:items-center p-4 sm:p-6">
            <div className="lg:col-span-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-50 tracking-tight flex items-center gap-2">
                <CalendarDays size={22} className="text-sky-300" />
                خشتەی هەفتانە، ئەرک و ڕووداو
              </h1>
              <p className="mt-2 text-zinc-400 text-sm">بەپێی شاشە خۆکارانە نیشاندراو: ڕستەی ڕۆژ یان خشتەی تەواو.</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <KPI icon={Clock3} label="وانەی ئەمڕۆ" value={todayClasses.length} />
                <KPI icon={GraduationCap} label="داهاتووی ئەمڕۆ" value={nextClass ? `${nextClass.subject} – ${nextClass.time}` : "هیچ"} tint="text-emerald-300" />
                <KPI icon={CheckCircle2} label="ئەرکی ئەمڕۆ" value={hwDueTodayCount} tint="text-amber-300" />
                <KPI icon={PartyPopper} label="ڕووداوەکانی ئەم هەفتە" value={eventsThisWeekCount} tint="text-pink-300" />
              </div>
            </div>

            {/* Controls */}
            <div className="lg:justify-self-end flex flex-wrap items-center gap-2 mt-4 lg:mt-0">
              <button onClick={() => setWeekOffset(weekOffset - 1)} className="rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 px-2 py-2" aria-label="previous week">
                <ChevronRight />
              </button>
              <div className="rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm text-zinc-300 whitespace-nowrap">{fmtLong(weekStart)} — {fmtLong(addDays(weekStart, 6))}</div>
              <button onClick={() => setWeekOffset(0)} className="rounded-xl bg-sky-600/20 ring-1 ring-sky-500/30 hover:bg-sky-600/30 px-3 py-2 text-sm text-sky-200 whitespace-nowrap">
                ئەم هەفتە
              </button>
              <button onClick={() => setWeekOffset(weekOffset + 1)} className="rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 px-2 py-2" aria-label="next week">
                <ChevronLeft />
              </button>

              <div className="hidden sm:flex items-center gap-2 ml-auto">
                <div className="rounded-xl bg-white/5 ring-1 ring-white/10 overflow-hidden flex">
                  <button
                    onClick={() => setView("day")}
                    className={`px-3 py-2 text-sm flex items-center gap-1 ${view === "day" ? "bg-white/10 text-white" : "text-zinc-300"}`}
                    title="ڕستەی ڕۆژ"
                  >
                    <List size={16} /> ڕۆژ
                  </button>
                  <button
                    onClick={() => setView("week")}
                    className={`px-3 py-2 text-sm flex items-center gap-1 ${view === "week" ? "bg-white/10 text-white" : "text-zinc-300"}`}
                    title="خشتەی هەفتە"
                  >
                    <LayoutGrid size={16} /> هەفتە
                  </button>
                </div>
                <button onClick={() => setShowAddSubjectModal(true)} className="rounded-xl bg-purple-600/20 ring-1 ring-purple-500/30 hover:bg-purple-600/30 px-3 py-2 text-sm text-purple-200 flex items-center gap-1 whitespace-nowrap">
                  <Plus size={16} /> بابەت
                </button>
              </div>
            </div>
          </div>
        </GlassPanel>
      </motion.div>

      {/* DAY TABS (always shown; useful in both views) */}
      <div className="sticky top-0 z-10 px-3 md:px-6 mb-5">
        <div className="backdrop-blur bg-zinc-950/80 ring-1 ring-white/10 rounded-2xl px-2 py-2 overflow-x-auto flex gap-2 snap-x snap-mandatory w-full">
          {DAYS.map((d, i) => {
            const isToday = weekOffset === 0 && i === todayIndex;
            return (
              <button
                key={d}
                onClick={() => setSelectedDayIndex(i)}
                className={`snap-start whitespace-nowrap text-sm px-3 py-2 rounded-xl ring-1 transition ${
                  selectedDayIndex === i ? "bg-sky-600/30 text-sky-100 ring-sky-500/30" : "bg-white/5 text-zinc-300 ring-white/10"
                }`}
              >
                {d} <span className="text-zinc-500 text-xs">· {fmtDate(weekDates[i])}</span>
                {isToday && <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-300 ring-1 ring-emerald-500/20">ئه‌مڕۆ</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex-1 px-3 md:px-6 pb-6 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">

          {/* Schedule column */}
          <motion.div variants={variants.fade} initial="hidden" animate="show" className="lg:col-span-7 relative">
            {view === "week" ? (
              // WEEK GRID
              <GlassPanel>
                <div className="px-5 pt-5 pb-3">
                  <h3 className="text-zinc-100 font-semibold flex items-center gap-2">
                    <CalendarDays size={18} className="text-sky-300" /> خشتەی هەفتانە
                  </h3>
                  <p className="text-sm text-zinc-400">شێوەی ستوونی؛ بخەرە سەرەوە بۆ بینینی هەموو ڕیزەکان.</p>
                </div>
                <div className="px-2 pb-5 overflow-x-auto">
                  <div className="min-w-[680px] grid grid-cols-8 gap-2 pr-3">
                    <div className="text-right">
                      <div className="h-10" />
                      {TIMES.map((t) => (
                        <div key={t} className="h-20 text-xs text-zinc-500 flex items-start justify-end pr-2 pt-2">
                          {t}
                        </div>
                      ))}
                    </div>
                    {DAYS.map((day, i) => {
                      const date = weekDates[i];
                      const isToday = weekOffset === 0 && i === todayIndex;
                      const sessions = weeklySchedule[day] || [];
                      return (
                        <div key={day} className="rounded-xl bg-white/3 ring-1 ring-white/10 overflow-hidden">
                          <div className={`h-10 flex items-center justify-between px-3 text-xs ${isToday ? "bg-sky-600/20 ring-1 ring-sky-500/30" : ""}`}>
                            <span className="text-zinc-300 font-medium">{day}</span>
                            <span className="text-zinc-500">{fmtDate(date)}</span>
                          </div>
                          <div>
                            {TIMES.map((slot) => {
                              const cls = sessions.find((s) => s.time === slot);
                              return (
                                <div key={slot} className="h-20 border-t border-white/5 relative">
                                  {cls && (
                                    <motion.div
                                      initial={{ opacity: 0, y: 6 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className={`absolute inset-1 rounded-xl p-2 text-xs text-zinc-200 ring-1 ring-white/10 bg-gradient-to-tr ${cls.color}`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-[13px]">{cls.subject}</span>
                                        <span className="text-[10px] text-zinc-200/80">{slot}</span>
                                      </div>
                                      <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-200/90">
                                        <span className="flex items-center gap-1">
                                          <BookOpen size={12} className="text-sky-300" /> {cls.teacher}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <MapPin size={12} className="text-emerald-300" /> {cls.room}
                                        </span>
                                      </div>
                                    </motion.div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </GlassPanel>
            ) : (
              // DAY TIMELINE
              <GlassPanel>
                <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-zinc-100 font-semibold flex items-center gap-2">
                      <Clock3 size={18} className="text-sky-300" /> وانەکانی {DAYS[selectedDayIndex]}
                    </h3>
                    <p className="text-sm text-zinc-400">{fmtLong(weekDates[selectedDayIndex])}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedDayIndex((i) => Math.max(0, i - 1))} className="rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 px-2 py-2">
                      <ChevronRight />
                    </button>
                    <button onClick={() => setSelectedDayIndex((i) => Math.min(6, i + 1))} className="rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 px-2 py-2">
                      <ChevronLeft />
                    </button>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <ul className="relative pl-0">
                    <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-white/10" />
                    {(weeklySchedule[DAYS[selectedDayIndex]] || []).length ? (
                      weeklySchedule[DAYS[selectedDayIndex]].map((cls, idx) => (
                        <li key={idx} className="relative flex items-start gap-3 py-3">
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className={`mt-1 w-8 h-8 rounded-full bg-white/10 ring-1 ring-white/10 grid place-items-center shrink-0 shadow-lg`}
                          >
                            <span className="text-[10px] text-zinc-300">{cls.time}</span>
                          </motion.div>
                          <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`flex-1 rounded-2xl ring-1 ring-white/10 bg-gradient-to-tr ${cls.color} px-3 py-3 relative`}
                          >
                            <div className="absolute inset-0 bg-white/5 rounded-2xl -z-10" />
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-white">{cls.subject}</span>
                              <span className="text-[11px] text-zinc-200/90 flex items-center gap-1">
                                <MapPin size={12} className="text-emerald-300" /> {cls.room}
                              </span>
                            </div>
                            <div className="mt-1 text-[12px] text-zinc-100/90 flex items-center gap-2">
                              <BookOpen size={12} className="text-sky-300" /> {cls.teacher}
                            </div>
                          </motion.div>
                        </li>
                      ))
                    ) : (
                      <p className="text-zinc-500 text-sm py-6 text-center">وانە نییە.</p>
                    )}
                  </ul>
                </div>
              </GlassPanel>
            )}
          </motion.div>

          {/* Homework + Events */}
          <motion.div variants={variants.fade} initial="hidden" animate="show" className="lg:col-span-5 space-y-5">
            {/* HOMEWORK */}
            <GlassPanel>
              <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-zinc-100 font-semibold flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-amber-300" /> ئەرکەکان (Homework)
                  </h3>
                  <p className="text-sm text-zinc-400">زیادکردن/دەستکاریکردن/فلتەرکردن</p>
                </div>
                <div className="flex items-center gap-2">
                  <select value={hwFilter} onChange={(e) => setHwFilter(e.target.value)} className="bg-white/5 text-zinc-200 text-xs rounded-xl px-2 py-1 ring-1 ring-white/10">
                    <option value="all">هەموو</option>
                    <option value="open">کردارنەکراو</option>
                    <option value="today">ئەمڕۆ</option>
                    <option value="overdue">ڕابردوو</option>
                    <option value="done">تەواو</option>
                  </select>
                  <Filter size={16} className="text-zinc-500" />
                </div>
              </div>

              {/* Add homework */}
              <form onSubmit={addHomework} className="px-5 grid grid-cols-1 sm:grid-cols-5 gap-2 pb-3">
                <input
                  value={newHw.subject}
                  onChange={(e) => setNewHw((v) => ({ ...v, subject: e.target.value }))}
                  placeholder="بابەت"
                  className="sm:col-span-1 bg-white/5 text-zinc-100 text-sm rounded-xl px-3 py-2 ring-1 ring-white/10 placeholder:text-zinc-400"
                />
                <input
                  value={newHw.title}
                  onChange={(e) => setNewHw((v) => ({ ...v, title: e.target.value }))}
                  placeholder="سەردێر / کار"
                  className="sm:col-span-2 bg-white/5 text-zinc-100 text-sm rounded-xl px-3 py-2 ring-1 ring-white/10 placeholder:text-zinc-400"
                  required
                />
                <input
                  type="date"
                  value={newHw.due}
                  onChange={(e) => setNewHw((v) => ({ ...v, due: e.target.value }))}
                  className="bg-white/5 text-zinc-100 text-sm rounded-xl px-3 py-2 ring-1 ring-white/10"
                />
                <select
                  value={newHw.priority}
                  onChange={(e) => setNewHw((v) => ({ ...v, priority: e.target.value }))}
                  className="bg-white/5 text-zinc-100 text-sm rounded-xl px-2 py-2 ring-1 ring-white/10"
                >
                  <option value="low">کەم</option>
                  <option value="normal">ئاسایی</option>
                  <option value="high">بەرز</option>
                </select>
                <div className="sm:col-span-5 flex justify-center sm:justify-end mt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center gap-1 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 px-4 py-2 text-white text-sm"
                  >
                    <Plus size={16} /> زیادکردن
                  </button>
                </div>
              </form>

              {/* List */}
              <div className="px-5 pb-5">
                <AnimatePresence initial={false}>
                  {filteredHomeworks.length ? (
                    filteredHomeworks.map((h) => {
                      const overdue = !h.done && h.due && new Date(h.due) < new Date(new Date().toDateString());
                      return (
                        <motion.div key={h.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mb-2 last:mb-0 rounded-xl bg-white/5 ring-1 ring-white/10 p-3 flex items-center gap-3 transition-colors hover:bg-white/10">
                          <button
                            onClick={() => toggleHwDone(h.id)}
                            className={`w-6 h-6 rounded-md grid place-items-center ring-1 ${h.done ? "bg-emerald-600/80 ring-emerald-500/40" : "bg-white/5 ring-white/10"}`}
                            title={h.done ? "گەڕاندنەوە" : "کردنەوە"}
                          >
                            {h.done ? <CheckCircle2 size={16} /> : <span className="block w-3 h-3 rounded-sm bg-white/20" />}
                          </button>

                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {h.subject && <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 ring-1 ring-white/10 text-zinc-300">{h.subject}</span>}
                              <span className={`text-[11px] px-2 py-0.5 rounded-full ${hwPill(h.priority)}`}>{h.priority === "high" ? "بەرز" : h.priority === "low" ? "کەم" : "ئاسایی"}</span>
                              {h.due && (
                                <span className={`text-[11px] px-2 py-0.5 rounded-full ring-1 ${overdue ? "bg-rose-500/15 text-rose-300 ring-rose-400/30" : "bg-white/5 text-zinc-300 ring-1 ring-white/10"}`}>
                                  <AlarmClock size={12} className="inline ml-1" /> {h.due}
                                </span>
                              )}
                            </div>
                            <div className={`text-sm mt-1 ${h.done ? "line-through text-zinc-500" : "text-zinc-100"}`}>{h.title}</div>
                          </div>

                          <button onClick={() => deleteHw(h.id)} className="text-zinc-500 hover:text-rose-400">
                            <Trash2 size={18} />
                          </button>
                        </motion.div>
                      );
                    })
                  ) : (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-zinc-500 text-sm py-6 text-center">
                      هیچ ئەرکێک نییە بەم فلتەریەدا.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </GlassPanel>

            {/* EVENTS */}
            <GlassPanel>
              <div className="px-5 pt-5 pb-3">
                <h3 className="text-zinc-100 font-semibold flex items-center gap-2">
                  <PartyPopper size={18} className="text-pink-300" /> ڕووداوەکان (Events)
                </h3>
                <p className="text-sm text-zinc-400">خوێندنگە، یارییەکان، کوبوونەوە و هتد.</p>
              </div>

              {/* Add event */}
              <form onSubmit={addEvent} className="px-5 grid grid-cols-1 sm:grid-cols-6 gap-2 pb-3">
                <input value={newEvent.title} onChange={(e) => setNewEvent((v) => ({ ...v, title: e.target.value }))} placeholder="سەردێری ڕووداو" className="sm:col-span-2 bg-white/5 text-zinc-100 text-sm rounded-xl px-3 py-2 ring-1 ring-white/10 placeholder:text-zinc-400" required />
                <input type="date" value={newEvent.date} onChange={(e) => setNewEvent((v) => ({ ...v, date: e.target.value }))} className="bg-white/5 text-zinc-100 text-sm rounded-xl px-3 py-2 ring-1 ring-white/10" required />
                <input type="time" value={newEvent.time} onChange={(e) => setNewEvent((v) => ({ ...v, time: e.target.value }))} className="bg-white/5 text-zinc-100 text-sm rounded-xl px-3 py-2 ring-1 ring-white/10" />
                <input value={newEvent.place} onChange={(e) => setNewEvent((v) => ({ ...v, place: e.target.value }))} placeholder="شوێن (ئارەزوومەندانە)" className="bg-white/5 text-zinc-100 text-sm rounded-xl px-3 py-2 ring-1 ring-white/10 placeholder:text-zinc-400" />
                <div className="flex items-center col-span-1 sm:col-span-full">
                  <button type="submit" className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-sky-600/80 hover:bg-sky-600 px-3 py-2 text-white text-sm">
                    <Plus size={16} /> زیادکردن
                  </button>
                </div>
              </form>

              {/* Events list */}
              <div className="px-5 pb-5">
                <AnimatePresence initial={false}>
                  {events.length ? (
                    events
                      .slice()
                      .sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")))
                      .map((ev) => (
                        <motion.div key={ev.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mb-2 last:mb-0 rounded-xl bg-white/5 ring-1 ring-white/10 p-3 flex items-center gap-3 transition-colors hover:bg-white/10">
                          <div className="w-12 h-12 rounded-xl bg-pink-500/15 ring-1 ring-pink-400/30 grid place-items-center text-pink-300 text-xs shrink-0">
                            <div className="leading-tight text-center">
                              <div>{ev.date?.slice(5, 10)?.replace("-", "/") || "--/--"}</div>
                              <div className="text-[10px]">{ev.time || "--:--"}</div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-zinc-100 font-semibold">{ev.title}</div>
                            <div className="text-xs text-zinc-400 flex items-center gap-3 mt-1">
                              {ev.place && (
                                <span className="inline-flex items-center gap-1">
                                  <MapPin size={12} /> {ev.place}
                                </span>
                              )}
                              {isInWeek(new Date(ev.date), weekStart) && <span className="text-emerald-300">ئەم هەفتە</span>}
                            </div>
                          </div>
                          <button onClick={() => deleteEvent(ev.id)} className="text-zinc-500 hover:text-rose-400">
                            <Trash2 size={18} />
                          </button>
                        </motion.div>
                      ))
                  ) : (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-zinc-500 text-sm py-6 text-center">
                      هیچ ڕووداوێک نییە.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </GlassPanel>
          </motion.div>
        </div>
      </div>

      {/* Mobile quick-add bar */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-20">
        <div className="rounded-2xl bg-zinc-900/80 ring-1 ring-white/10 backdrop-blur px-3 py-2 flex items-center justify-between gap-2">
          <button
            onClick={() => document.querySelector('input[placeholder="سەردێر / کار"]')?.focus()}
            className="flex-1 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white font-semibold text-sm px-3 py-2 flex items-center justify-center gap-1 transition-colors"
          >
            <Plus size={16} /> ئەرک
          </button>
          <button
            onClick={() => document.querySelector('input[placeholder="سەردێری ڕووداو"]')?.focus()}
            className="flex-1 rounded-xl bg-sky-600/80 hover:bg-sky-600 text-white font-semibold text-sm px-3 py-2 flex items-center justify-center gap-1 transition-colors"
          >
            <Plus size={16} /> ڕووداو
          </button>
          <button
            onClick={() => setShowAddSubjectModal(true)}
            className="flex-1 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white font-semibold text-sm px-3 py-2 flex items-center justify-center gap-1 transition-colors"
          >
            <Plus size={16} /> بابەت
          </button>
        </div>
      </div>

      {/* Add Subject Modal */}
      <AnimatePresence>
        {showAddSubjectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddSubjectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700 shadow-xl p-6 text-right space-y-4"
            >
              <h3 className="text-xl font-extrabold text-zinc-50 mb-4">زیادکردنی وانەی نوێ</h3>
              
              <form onSubmit={addScheduleSubject} className="space-y-4">
                <div>
                  <label htmlFor="subjectDay" className="block text-sm font-medium text-zinc-300 mb-1">ڕۆژ</label>
                  <select
                    id="subjectDay"
                    value={newSubject.day}
                    onChange={(e) => setNewSubject((v) => ({ ...v, day: e.target.value }))}
                    className="w-full rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm px-3 py-2 focus:ring-2 focus:ring-purple-500"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="subjectTime" className="block text-sm font-medium text-zinc-300 mb-1">کات</label>
                  <select
                    id="subjectTime"
                    value={newSubject.time}
                    onChange={(e) => setNewSubject((v) => ({ ...v, time: e.target.value }))}
                    className="w-full rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm px-3 py-2 focus:ring-2 focus:ring-purple-500"
                  >
                    {TIMES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="subjectName" className="block text-sm font-medium text-zinc-300 mb-1">بابەت</label>
                  <input
                    id="subjectName"
                    type="text"
                    value={newSubject.subject}
                    onChange={(e) => setNewSubject((v) => ({ ...v, subject: e.target.value }))}
                    placeholder="ناوی بابەت"
                    className="w-full rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm px-3 py-2 placeholder:text-zinc-500 focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="teacherName" className="block text-sm font-medium text-zinc-300 mb-1">مامۆستا</label>
                  <input
                    id="teacherName"
                    type="text"
                    value={newSubject.teacher}
                    onChange={(e) => setNewSubject((v) => ({ ...v, teacher: e.target.value }))}
                    placeholder="ناوی مامۆستا"
                    className="w-full rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm px-3 py-2 placeholder:text-zinc-500 focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="roomName" className="block text-sm font-medium text-zinc-300 mb-1">ژوور</label>
                  <input
                    id="roomName"
                    type="text"
                    value={newSubject.room}
                    onChange={(e) => setNewSubject((v) => ({ ...v, room: e.target.value }))}
                    placeholder="ژووری وانە"
                    className="w-full rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm px-3 py-2 placeholder:text-zinc-500 focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="subjectColor" className="block text-sm font-medium text-zinc-300 mb-1">ڕەنگ</label>
                  <div className="grid grid-cols-6 gap-2">
                    {SUBJECT_COLORS.map((colorClass, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNewSubject((v) => ({ ...v, color: colorClass }))}
                        className={`h-8 w-full rounded-md bg-gradient-to-tr ${colorClass} ${
                          newSubject.color === colorClass ? "ring-2 ring-purple-400 ring-offset-2 ring-offset-zinc-900" : ""
                        }`}
                        title={`ڕەنگ ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddSubjectModal(false)}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-zinc-700 text-zinc-200 font-semibold hover:bg-zinc-600 transition"
                  >
                    داخستن
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
                  >
                    زیادکردن
                  </button>
                </div>
              </form>
              <button
                onClick={() => setShowAddSubjectModal(false)}
                className="absolute top-3 left-3 p-2 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition"
                aria-label="داخستن"
              >
                <X size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}