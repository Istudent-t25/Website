// // ============================== Schedule.jsx — Best Responsive Version (RTL, Glass, Compact Mode) ==============================
// // Features:
// // - Compact mode for dashboard widgets: <Schedule compact />
// // - Full page mode: week grid + day timeline + homework + events
// // - RTL-friendly, mobile-first, sticky day tabs, overflow handling
// // - LocalStorage persistence (v3 keys to avoid collisions)
// // - Beautiful glassmorphism, subtle glows, microinteractions
// // - Accessibility: labels, button titles, keyboard focus
// // - Clean todayIndex mapping (Saturday-first week)

// import React, { useEffect, useMemo, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   CalendarDays,
//   ChevronLeft,
//   ChevronRight,
//   Clock3,
//   GraduationCap,
//   CheckCircle2,
//   Plus,
//   Trash2,
//   AlarmClock,
//   MapPin,
//   Filter,
//   PartyPopper,
//   LayoutGrid,
//   List,
//   BookOpen,
// } from "lucide-react";
// import useFirebaseSchedule from "@/hooks/useFirebaseSchedule";

// /* ========================= Constants ========================= */
// const DAYS = ["شەممە", "یەکشەممە", "دووشەممە", "سێشەممە", "چوارشەممە", "پێنجشەممە", "هەینی"];
// const TIMES = ["08:00", "09:30", "11:00", "12:30", "14:00"];

// const SUBJECT_COLORS = [
//   "from-sky-600/30 to-sky-500/20",
//   "from-emerald-600/30 to-emerald-500/20",
//   "from-indigo-600/30 to-indigo-500/20",
//   "from-fuchsia-600/30 to-fuchsia-500/20",
//   "from-rose-600/30 to-rose-500/20",
//   "from-amber-600/30 to-amber-500/20",
// ];

// /* ========================= Utils ========================= */
// function startOfWeekSaturday(date = new Date(), weekOffset = 0) {
//   const d = new Date(date);
//   const day = d.getDay(); // 0=Sun..6=Sat
//   const diffToSat = day === 6 ? 0 : day + 1; // Sat->0, Sun->1, ... Fri->6
//   d.setDate(d.getDate() - diffToSat + weekOffset * 7);
//   d.setHours(0, 0, 0, 0);
//   return d;
// }
// function addDays(date, n) {
//   const d = new Date(date);
//   d.setDate(d.getDate() + n);
//   return d;
// }
// function fmtDate(d) {
//   const dd = String(d.getDate()).padStart(2, "0");
//   const mm = String(d.getMonth() + 1).padStart(2, "0");
//   return `${dd}/${mm}`;
// }
// function fmtLong(d) {
//   const dd = String(d.getDate()).padStart(2, "0");
//   const mm = String(d.getMonth() + 1).padStart(2, "0");
//   const yyyy = d.getFullYear();
//   return `${dd}/${mm}/${yyyy}`;
// }
// function nowTimeHHMM() {
//   const n = new Date();
//   const hh = String(n.getHours()).padStart(2, "0");
//   const mm = String(n.getMinutes()).padStart(2, "0");
//   return `${hh}:${mm}`;
// }
// function isTimeBefore(a, b) {
//   return a.localeCompare(b) < 0;
// }
// function uuid() {
//   return window.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
// }
// function isSameDateStr(isoStr, d) {
//   const src = new Date(`${isoStr}T00:00:00`);
//   return (
//     src.getFullYear() === d.getFullYear() &&
//     src.getMonth() === d.getMonth() &&
//     src.getDate() === d.getDate()
//   );
// }
// function isInWeek(d, start) {
//   const end = addDays(start, 7);
//   return d >= start && d < end;
// }

// /* ========================= Shared UI ========================= */
// export function GlassPanel({ className = "", children }) {
//   return (
//     <div
//       className={
//         "rounded-3xl bg-white/5 backdrop-blur-3xl ring-1 ring-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.35)] " +
//         "relative overflow-hidden transition-transform duration-300 hover:scale-[1.005] " +
//         className
//       }
//     >
//       {children}
//     </div>
//   );
// }

// function KPI({ icon: Icon, label, value, tint = "text-sky-300" }) {
//   return (
//     <div
//       className="flex items-center gap-2 rounded-2xl bg-white/5 ring-1 ring-white/10 px-3 py-2"
//       title={`${label}: ${value}`}
//       aria-label={`${label}: ${value}`}
//     >
//       <Icon size={18} className={tint} />
//       <span className="text-xs text-zinc-300">
//         {label}: <span className="font-semibold text-zinc-100">{value}</span>
//       </span>
//     </div>
//   );
// }

// /* ========================= Main Component ========================= */
// export default function Schedule({ compact = false }) {
//   // Seed demo data (replace with API if you have one)
//   const WEEKLY_DEFAULT = useMemo(
//     () => ({
//       شەممە: [
//         { id: uuid(), time: "08:00", subject: "بیركاری", teacher: "مامۆستا ئارام", room: "A-301", color: SUBJECT_COLORS[0] },
//         { id: uuid(), time: "09:30", subject: "کوردی", teacher: "مامۆستا هێمن", room: "B-210", color: SUBJECT_COLORS[1] },
//       ],
//       یەکشەممە: [
//         { id: uuid(), time: "08:00", subject: "فیزیا", teacher: "مامۆستا هوراز", room: "C-105", color: SUBJECT_COLORS[2] },
//         { id: uuid(), time: "11:00", subject: "ئینگلیزی", teacher: "مامۆستا سارا", room: "A-204", color: SUBJECT_COLORS[3] },
//       ],
//       دووشەممە: [{ id: uuid(), time: "09:30", subject: "کیمیا", teacher: "مامۆستا ناز", room: "Lab-2", color: SUBJECT_COLORS[4] }],
//       سێشەممە: [
//         { id: uuid(), time: "08:00", subject: "ئەندازیارى", teacher: "مامۆستا رێبوار", room: "D-410", color: SUBJECT_COLORS[5] },
//         { id: uuid(), time: "12:30", subject: "بیركاری", teacher: "مامۆستا ڕێژین", room: "A-305", color: SUBJECT_COLORS[0] },
//       ],
//       چوارشەممە: [{ id: uuid(), time: "11:00", subject: "کوردی", teacher: "مامۆستا دڵشاد", room: "B-110", color: SUBJECT_COLORS[1] }],
//       پێنجشەممە: [{ id: uuid(), time: "14:00", subject: "فیزیا", teacher: "مامۆستا بەرزان", room: "C-106", color: SUBJECT_COLORS[2] }],
//       هەینی: [],
//     }),
//     []
//   );
  
//   const { user, loading, weekly, homeworks, events, addHomework, toggleHomework, deleteHomework, addEvent, deleteEvent, setWeekly } = useFirebaseSchedule(); 

//   // Use this state as a fallback until Firebase loads data, but prefer Firebase data
//   const [localWeekly, setLocalWeekly] = useState(WEEKLY_DEFAULT);

//   // Sync Firebase weekly to state and handle seeding if a user logs in for the first time
//   useEffect(() => {
//     if (user && !loading && weekly === null) {
//       setWeekly(WEEKLY_DEFAULT);
//     }
//   }, [user, loading, weekly, setWeekly]);
  
//   // Choose data source
//   const weeklySchedule = weekly || localWeekly;

//   const jsDay = new Date().getDay(); // 0 Sun .. 6 Sat
//   const todayIndex = jsDay === 6 ? 0 : jsDay + 1; // Sat->0, Sun->1, ... Fri->6

//   const [weekOffset, setWeekOffset] = useState(0);
//   const [view, setView] = useState(compact ? "day" : "week");
//   const [selectedDayIndex, setSelectedDayIndex] = useState(todayIndex);
//   const [hwFilter, setHwFilter] = useState("all");
//   const [newHw, setNewHw] = useState({ subject: "", title: "", due: "", priority: "normal" });
//   const [newEvent, setNewEvent] = useState({ title: "", date: "", time: "", place: "" });
  
//   // Persist local weekly data for unauthenticated users
//   useEffect(() => {
//     if (!user) {
//       try {
//         const storedWeekly = localStorage.getItem("schedule_weekly_v3");
//         if (storedWeekly) {
//           setLocalWeekly(JSON.parse(storedWeekly));
//         }
//       } catch (e) {
//         console.error("Failed to load local schedule", e);
//       }
//     }
//   }, [user]);

//   useEffect(() => {
//     if (!user) {
//       try {
//         localStorage.setItem("schedule_weekly_v3", JSON.stringify(localWeekly));
//       } catch (e) {
//         console.error("Failed to save local schedule", e);
//       }
//     }
//   }, [localWeekly, user]);

//   // Ranges & computed
//   const weekStart = useMemo(() => startOfWeekSaturday(new Date(), weekOffset), [weekOffset]);
//   const weekDates = useMemo(() => DAYS.map((_, i) => addDays(weekStart, i)), [weekStart]);
//   const todayName = DAYS[todayIndex] || DAYS[0];
//   const todayClasses = weeklySchedule[todayName] || [];
//   const currentHHMM = nowTimeHHMM();
//   const nextClass = todayClasses.find((c) => isTimeBefore(currentHHMM, c.time));

//   const hwDueTodayCount = useMemo(
//     () => homeworks.filter((h) => !h.done && h.due && isSameDateStr(h.due, new Date())).length,
//     [homeworks]
//   );
//   const eventsThisWeekCount = useMemo(
//     () => events.filter((e) => e.date && isInWeek(new Date(e.date), weekStart)).length,
//     [events, weekStart]
//   );

//   // Filtering
//   const filteredHomeworks = useMemo(() => {
//     const today = new Date();
//     return homeworks
//       .slice()
//       .sort((a, b) => (a.due || "").localeCompare(b.due || ""))
//       .filter((h) => {
//         if (hwFilter === "open") return !h.done;
//         if (hwFilter === "done") return !!h.done;
//         if (hwFilter === "today") return h.due && isSameDateStr(h.due, today);
//         if (hwFilter === "overdue") return !h.done && h.due && new Date(h.due) < new Date(today.toDateString());
//         return true;
//       });
//   }, [homeworks, hwFilter]);

//   // Actions
//   function handleAddHomework(e) {
//     e?.preventDefault?.();
//     if (!newHw.title) return;
//     addHomework({
//       subject: newHw.subject?.trim() || "",
//       title: newHw.title?.trim(),
//       due: newHw.due || "",
//       priority: newHw.priority || "normal",
//       done: false,
//     });
//     setNewHw({ subject: "", title: "", due: "", priority: "normal" });
//   }

//   function handleAddEvent(e) {
//     e?.preventDefault?.();
//     if (!newEvent.title || !newEvent.date) return;
//     addEvent({ ...newEvent });
//     setNewEvent({ title: "", date: "", time: "", place: "" });
//   }

//   /* ========================= Compact Mode (Dashboard Widget) ========================= */
//   if (compact) {
//     const list = weeklySchedule[DAYS[selectedDayIndex]] || [];
//     return (
//       <div dir="rtl" className="w-full">
//         {/* Header */}
//         <div className="flex items-center justify-between gap-2">
//           <div>
//             <h3 className="text-lg font-bold text-white flex items-center gap-2">
//               <CalendarDays size={18} className="text-sky-300" />
//               وانەکانی ئەمڕۆ
//             </h3>
//             <p className="text-xs text-zinc-400">
//               {DAYS[selectedDayIndex]} • {fmtLong(weekDates[selectedDayIndex])}
//             </p>
//           </div>
//           <div className="flex items-center gap-2">
//             <KPI icon={Clock3} label="وانە" value={list.length} />
//             <KPI icon={CheckCircle2} label="ئەرک" value={hwDueTodayCount} tint="text-amber-300" />
//           </div>
//         </div>

//         {/* Timeline (today) */}
//         <ul className="mt-3 relative pl-0">
//           <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-white/10" />
//           {list.length ? (
//             list.map((cls) => (
//               <li key={cls.id} className="relative flex items-start gap-3 py-2">
//                 <div className="mt-1 w-8 h-8 rounded-full bg-white/10 ring-1 ring-white/10 grid place-items-center shrink-0">
//                   <span className="text-[10px] text-zinc-300">{cls.time}</span>
//                 </div>
//                 <div className={`flex-1 rounded-2xl ring-1 ring-white/10 bg-gradient-to-tr ${cls.color} px-3 py-2`}>
//                   <div className="flex items-center justify-between">
//                     <span className="text-sm font-bold text-white truncate">{cls.subject}</span>
//                     <span className="text-[11px] text-zinc-200/90 flex items-center gap-1">
//                       <MapPin size={12} className="text-emerald-300" /> {cls.room}
//                     </span>
//                   </div>
//                   <div className="mt-0.5 text-[11px] text-zinc-100/90 flex items-center gap-2 truncate">
//                     <BookOpen size={12} className="text-sky-300" /> {cls.teacher}
//                   </div>
//                 </div>
//               </li>
//             ))
//           ) : (
//             <p className="text-zinc-500 text-sm py-4 text-center">وانە نییە.</p>
//           )}
//         </ul>

//         {/* Quick add rows */}
//         <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
//           <form onSubmit={handleAddHomework} className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-2 grid grid-cols-6 gap-2">
//             <input
//               value={newHw.subject}
//               onChange={(e) => setNewHw((v) => ({ ...v, subject: e.target.value }))}
//               placeholder="بابەت"
//               className="col-span-2 bg-white/5 text-[12px] text-zinc-100 rounded-xl px-2 py-2 ring-1 ring-white/10 placeholder:text-zinc-400"
//               aria-label="بابەت"
//             />
//             <input
//               value={newHw.title}
//               onChange={(e) => setNewHw((v) => ({ ...v, title: e.target.value }))}
//               placeholder="کار"
//               required
//               className="col-span-3 bg-white/5 text-[12px] text-zinc-100 rounded-xl px-2 py-2 ring-1 ring-white/10 placeholder:text-zinc-400"
//               aria-label="کار"
//             />
//             <button
//               type="submit"
//               className="col-span-1 inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-[12px] px-2"
//               title="زیادکردنی ئەرک"
//             >
//               <Plus size={14} /> ئەرک
//             </button>
//           </form>

//           <form onSubmit={handleAddEvent} className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-2 grid grid-cols-6 gap-2">
//             <input
//               value={newEvent.title}
//               onChange={(e) => setNewEvent((v) => ({ ...v, title: e.target.value }))}
//               placeholder="ڕووداو"
//               required
//               className="col-span-3 bg-white/5 text-[12px] text-zinc-100 rounded-xl px-2 py-2 ring-1 ring-white/10 placeholder:text-zinc-400"
//               aria-label="سەردێری ڕووداو"
//             />
//             <input
//               type="date"
//               value={newEvent.date}
//               onChange={(e) => setNewEvent((v) => ({ ...v, date: e.target.value }))}
//               className="col-span-2 bg-white/5 text-[12px] text-zinc-100 rounded-xl px-2 py-2 ring-1 ring-white/10"
//               aria-label="ڕێکەوت"
//             />
//             <button
//               type="submit"
//               className="col-span-1 inline-flex items-center justify-center gap-1 rounded-xl bg-sky-600/80 hover:bg-sky-600 text-white text-[12px] px-2"
//               title="زیادکردنی ڕووداو"
//             >
//               <Plus size={14} /> ڕووداو
//             </button>
//           </form>
//         </div>
//       </div>
//     );
//   }

//   /* ========================= Full Page Mode ========================= */
//   const variants = {
//     fade: { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } },
//   };
//   const hwPill = (p) =>
//     p === "high"
//       ? "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30"
//       : p === "low"
//       ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30"
//       : "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30";

//   return (
//     <div
//       dir="rtl"
//       className="min-h-screen w-full bg-gradient-to-br from-zinc-950 via-zinc-950 to-black text-zinc-100 flex flex-col"
//     >
//       {/* Ambient glows */}
//       <div aria-hidden className="absolute inset-0 z-0 pointer-events-none">
//         <div className="absolute -top-16 -left-10 w-72 h-72 rounded-full bg-sky-500/10 blur-3xl animate-[pulse_10s_ease-in-out_infinite]" />
//         <div className="absolute bottom-0 -right-10 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl animate-[pulse_12s_ease-in-out_infinite_2s]" />
//       </div>

//       {/* Hero + Controls */}
//       <motion.div variants={variants.fade} initial="hidden" animate="show" className="relative p-3 md:p-6 mb-5 z-10">
//         <GlassPanel>
//           <div className="relative grid gap-4 lg:grid-cols-3 lg:items-center p-4 sm:p-6">
//             <div className="lg:col-span-2">
//               <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-50 tracking-tight flex items-center gap-2">
//                 <CalendarDays size={22} className="text-sky-300" />
//                 خشتەی هەفتانە، ئەرک و ڕووداو
//               </h1>
//               <p className="mt-2 text-zinc-400 text-sm">بەپێی شاشە خۆکارانە نیشاندراو: ڕستەی ڕۆژ یان خشتەی تەواو.</p>
//               <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
//                 <KPI icon={Clock3} label="وانەی ئەمڕۆ" value={(weeklySchedule[DAYS[todayIndex]] || []).length} />
//                 <KPI
//                   icon={GraduationCap}
//                   label="داهاتووی ئەمڕۆ"
//                   value={nextClass ? `${nextClass.subject} – ${nextClass.time}` : "هیچ"}
//                   tint="text-emerald-300"
//                 />
//                 <KPI icon={CheckCircle2} label="ئەرکی ئەمڕۆ" value={hwDueTodayCount} tint="text-amber-300" />
//                 <KPI icon={PartyPopper} label="ڕووداوەکانی ئەم هەفتە" value={eventsThisWeekCount} tint="text-pink-300" />
//               </div>
//             </div>

//             {/* Controls */}
//             <div className="lg:justify-self-end flex flex-wrap items-center gap-2 mt-4 lg:mt-0">
//               <button
//                 onClick={() => setWeekOffset((v) => v - 1)}
//                 className="rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 px-2 py-2"
//                 aria-label="previous week"
//                 title="هەفتەی پێشوو"
//               >
//                 <ChevronRight />
//               </button>
//               <div className="rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-sm text-zinc-300 whitespace-nowrap">
//                 {fmtLong(weekStart)} — {fmtLong(addDays(weekStart, 6))}
//               </div>
//               <button
//                 onClick={() => setWeekOffset(0)}
//                 className="rounded-xl bg-sky-600/20 ring-1 ring-sky-500/30 hover:bg-sky-600/30 px-3 py-2 text-sm text-sky-200 whitespace-nowrap"
//                 title="هەفتەی ئێستا"
//               >
//                 ئەم هەفتە
//               </button>
//               <button
//                 onClick={() => setWeekOffset((v) => v + 1)}
//                 className="rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 px-2 py-2"
//                 aria-label="next week"
//                 title="هەفتەی داهاتوو"
//               >
//                 <ChevronLeft />
//               </button>

//               <div className="hidden sm:flex items-center gap-2 ml-auto">
//                 <div className="rounded-xl bg-white/5 ring-1 ring-white/10 overflow-hidden flex">
//                   <button
//                     onClick={() => setView("day")}
//                     className={`px-3 py-2 text-sm flex items-center gap-1 ${
//                       view === "day" ? "bg-white/10 text-white" : "text-zinc-300"
//                     }`}
//                     title="ڕستەی ڕۆژ"
//                   >
//                     <List size={16} /> ڕۆژ
//                   </button>
//                   <button
//                     onClick={() => setView("week")}
//                     className={`px-3 py-2 text-sm flex items-center gap-1 ${
//                       view === "week" ? "bg-white/10 text-white" : "text-zinc-300"
//                     }`}
//                     title="خشتەی هەفتە"
//                   >
//                     <LayoutGrid size={16} /> هەفتە
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </GlassPanel>
//       </motion.div>

//       {/* Day tabs (sticky) */}
//       <div className="sticky top-0 z-10 px-3 md:px-6 mb-5">
//         <div className="backdrop-blur bg-zinc-950/80 ring-1 ring-white/10 rounded-2xl px-2 py-2 overflow-x-auto flex gap-2 snap-x snap-mandatory w-full">
//           {DAYS.map((d, i) => {
//             const isToday = weekOffset === 0 && i === todayIndex;
//             return (
//               <button
//                 key={d}
//                 onClick={() => setSelectedDayIndex(i)}
//                 className={`snap-start whitespace-nowrap text-sm px-3 py-2 rounded-xl ring-1 transition ${
//                   selectedDayIndex === i ? "bg-sky-600/30 text-sky-100 ring-sky-500/30" : "bg-white/5 text-zinc-300 ring-white/10"
//                 }`}
//                 aria-pressed={selectedDayIndex === i}
//                 title={d}
//               >
//                 {d} <span className="text-zinc-500 text-xs">· {fmtDate(weekDates[i])}</span>
//                 {isToday && (
//                   <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-300 ring-1 ring-emerald-500/20">
//                     ئەمڕۆ
//                   </span>
//                 )}
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* Main layout */}
//       <div className="flex-1 px-3 md:px-6 pb-6">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
//           {/* Schedule column */}
//           <motion.div variants={variants.fade} initial="hidden" animate="show" className="lg:col-span-7">
//             {view === "week" ? (
//               // Week grid
//               <GlassPanel>
//                 <div className="px-5 pt-5 pb-3">
//                   <h3 className="text-zinc-100 font-semibold flex items-center gap-2">
//                     <CalendarDays size={18} className="text-sky-300" /> خشتەی هەفتانە
//                   </h3>
//                   <p className="text-sm text-zinc-400">شێوەی ستوونی؛ بخەرە سەرەوە بۆ بینینی هەموو ڕیزەکان.</p>
//                 </div>
//                 <div className="px-2 pb-5 overflow-x-auto">
//                   <div className="min-w-[680px] grid grid-cols-8 gap-2 pr-3">
//                     {/* Time column */}
//                     <div className="text-right">
//                       <div className="h-10" />
//                       {TIMES.map((t) => (
//                         <div key={t} className="h-20 text-xs text-zinc-500 flex items-start justify-end pr-2 pt-2">
//                           {t}
//                         </div>
//                       ))}
//                     </div>
//                     {/* Day columns */}
//                     {DAYS.map((day, i) => {
//                       const date = weekDates[i];
//                       const isToday = weekOffset === 0 && i === todayIndex;
//                       const sessions = weeklySchedule[day] || [];
//                       return (
//                         <div key={day} className="rounded-xl bg-white/3 ring-1 ring-white/10 overflow-hidden">
//                           <div
//                             className={`h-10 flex items-center justify-between px-3 text-xs ${
//                               isToday ? "bg-sky-600/20 ring-1 ring-sky-500/30" : ""
//                             }`}
//                           >
//                             <span className="text-zinc-300 font-medium">{day}</span>
//                             <span className="text-zinc-500">{fmtDate(date)}</span>
//                           </div>
//                           <div>
//                             {TIMES.map((slot) => {
//                               const cls = sessions.find((s) => s.time === slot);
//                               return (
//                                 <div key={slot} className="h-20 border-t border-white/5 relative">
//                                   {cls && (
//                                     <motion.div
//                                       initial={{ opacity: 0, y: 6 }}
//                                       animate={{ opacity: 1, y: 0 }}
//                                       className={`absolute inset-1 rounded-xl p-2 text-xs text-zinc-200 ring-1 ring-white/10 bg-gradient-to-tr ${cls.color}`}
//                                     >
//                                       <div className="flex items-center justify-between">
//                                         <span className="font-bold text-[13px]">{cls.subject}</span>
//                                         <span className="text-[10px] text-zinc-200/80">{slot}</span>
//                                       </div>
//                                       <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-200/90">
//                                         <span className="flex items-center gap-1">
//                                           <BookOpen size={12} className="text-sky-300" /> {cls.teacher}
//                                         </span>
//                                         <span className="flex items-center gap-1">
//                                           <MapPin size={12} className="text-emerald-300" /> {cls.room}
//                                         </span>
//                                       </div>
//                                     </motion.div>
//                                   )}
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </GlassPanel>
//             ) : (
//               // Day timeline
//               <GlassPanel>
//                 <div className="px-5 pt-5 pb-3 flex items-center justify-between">
//                   <div>
//                     <h3 className="text-zinc-100 font-semibold flex items-center gap-2">
//                       <Clock3 size={18} className="text-sky-300" /> وانەکانی {DAYS[selectedDayIndex]}
//                     </h3>
//                     <p className="text-sm text-zinc-400">{fmtLong(weekDates[selectedDayIndex])}</p>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <button
//                       onClick={() => setSelectedDayIndex((i) => Math.max(0, i - 1))}
//                       className="rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 px-2 py-2"
//                       title="ڕۆژی پێشوو"
//                     >
//                       <ChevronRight />
//                     </button>
//                     <button
//                       onClick={() => setSelectedDayIndex((i) => Math.min(6, i + 1))}
//                       className="rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 px-2 py-2"
//                       title="ڕۆژی داهاتوو"
//                     >
//                       <ChevronLeft />
//                     </button>
//                   </div>
//                 </div>

//                 <div className="px-5 pb-5">
//                   <ul className="relative pl-0">
//                     <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-white/10" />
//                     {(weeklySchedule[DAYS[selectedDayIndex]] || []).length ? (
//                       (weeklySchedule[DAYS[selectedDayIndex]] || []).map((cls) => (
//                         <li key={cls.id} className="relative flex items-start gap-3 py-3">
//                           <div className="mt-1 w-8 h-8 rounded-full bg-white/10 ring-1 ring-white/10 grid place-items-center shrink-0">
//                             <span className="text-[10px] text-zinc-300">{cls.time}</span>
//                           </div>
//                           <div className={`flex-1 rounded-2xl ring-1 ring-white/10 bg-gradient-to-tr ${cls.color} px-3 py-3 relative`}>
//                             <div className="absolute inset-0 bg-white/5 rounded-2xl -z-10" />
//                             <div className="flex items-center justify-between">
//                               <span className="text-sm font-bold text-white">{cls.subject}</span>
//                               <span className="text-[11px] text-zinc-200/90 flex items-center gap-1">
//                                 <MapPin size={12} className="text-emerald-300" /> {cls.room}
//                               </span>
//                             </div>
//                             <div className="mt-1 text-[12px] text-zinc-100/90 flex items-center gap-2">
//                               <BookOpen size={12} className="text-sky-300" /> {cls.teacher}
//                             </div>
//                           </div>
//                         </li>
//                       ))
//                     ) : (
//                       <p className="text-zinc-500 text-sm py-6 text-center">وانە نییە.</p>
//                     )}
//                   </ul>
//                 </div>
//               </GlassPanel>
//             )}
//           </motion.div>

//           {/* Homework + Events */}
//           <motion.div variants={variants.fade} initial="hidden" animate="show" className="lg:col-span-5 space-y-5">
//             {/* HOMEWORK */}
//             <GlassPanel>
//               <div className="px-5 pt-5 pb-3 flex items-center justify-between">
//                 <div>
//                   <h3 className="text-zinc-100 font-semibold flex items-center gap-2">
//                     <CheckCircle2 size={18} className="text-amber-300" /> ئەرکەکان (Homework)
//                   </h3>
//                   <p className="text-sm text-zinc-400">زیادکردن/دەستکاریکردن/فلتەرکردن</p>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <select
//                     value={hwFilter}
//                     onChange={(e) => setHwFilter(e.target.value)}
//                     className="bg-white/5 text-zinc-200 text-xs rounded-xl px-2 py-1 ring-1 ring-white/10"
//                     aria-label="فلترکردن"
//                   >
//                     <option value="all">هەموو</option>
//                     <option value="open">کردارنەکراو</option>
//                     <option value="today">ئەمڕۆ</option>
//                     <option value="overdue">ڕابردوو</option>
//                     <option value="done">تەواو</option>
//                   </select>
//                   <Filter size={16} className="text-zinc-500" />
//                 </div>
//               </div>

//               {/* Add homework */}
//               <form onSubmit={handleAddHomework} className="px-5 grid grid-cols-1 sm:grid-cols-5 gap-2 pb-3">
//                 <input
//                   value={newHw.subject}
//                   onChange={(e) => setNewHw((v) => ({ ...v, subject: e.target.value }))}
//                   placeholder="بابەت"
//                   className="col-span-2 bg-white/5 text-xs text-zinc-100 rounded-xl px-2 py-2 ring-1 ring-white/10 placeholder:text-zinc-400"
//                   aria-label="بابەت"
//                 />
//                 <input
//                   value={newHw.title}
//                   onChange={(e) => setNewHw((v) => ({ ...v, title: e.target.value }))}
//                   placeholder="کار"
//                   required
//                   className="col-span-3 bg-white/5 text-xs text-zinc-100 rounded-xl px-2 py-2 ring-1 ring-white/10 placeholder:text-zinc-400"
//                   aria-label="کار"
//                 />
//                 <input
//                   type="date"
//                   value={newHw.due}
//                   onChange={(e) => setNewHw((v) => ({ ...v, due: e.target.value }))}
//                   className="col-span-2 bg-white/5 text-xs text-zinc-100 rounded-xl px-2 py-2 ring-1 ring-white/10"
//                   aria-label="ڕێکەوتی تەواوکردن"
//                 />
//                 <select
//                   value={newHw.priority}
//                   onChange={(e) => setNewHw((v) => ({ ...v, priority: e.target.value }))}
//                   className="col-span-2 bg-white/5 text-xs text-zinc-100 rounded-xl px-2 py-2 ring-1 ring-white/10"
//                   aria-label="گرنگی"
//                 >
//                   <option value="low">کەم</option>
//                   <option value="normal">ئاسایی</option>
//                   <option value="high">زۆر</option>
//                 </select>
//                 <button
//                   type="submit"
//                   className="col-span-1 inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs px-2"
//                   title="زیادکردنی ئەرک"
//                 >
//                   <Plus size={14} /> زیادکردن
//                 </button>
//               </form>

//               {/* List of homework */}
//               <div className="px-5 pb-5 pt-2">
//                 <AnimatePresence>
//                   {filteredHomeworks.length ? (
//                     filteredHomeworks.map((h) => (
//                       <motion.div
//                         key={h.id}
//                         initial={{ opacity: 0, y: 10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, scale: 0.9, x: -50 }}
//                         transition={{ duration: 0.2 }}
//                         className={`flex items-start gap-3 py-3 border-b border-white/5 last:border-b-0 ${h.done ? "line-through opacity-50" : ""}`}
//                       >
//                         <button
//                           onClick={() => toggleHomework(h.id, h.done)}
//                           className="mt-1 w-6 h-6 rounded-full bg-white/10 ring-1 ring-white/10 grid place-items-center shrink-0 hover:bg-sky-600/20"
//                           title={h.done ? "نەکراو" : "تەواو"}
//                           aria-label={h.done ? "نەکراو" : "تەواو"}
//                         >
//                           <AnimatePresence mode="wait">
//                             <motion.div
//                               key={h.done ? "check" : "circle"}
//                               initial={{ opacity: 0, scale: 0.5 }}
//                               animate={{ opacity: 1, scale: 1 }}
//                               exit={{ opacity: 0, scale: 0.5 }}
//                             >
//                               {h.done ? <CheckCircle2 size={14} className="text-emerald-300" /> : <CheckCircle2 size={14} className="text-zinc-500" />}
//                             </motion.div>
//                           </AnimatePresence>
//                         </button>
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-center gap-2">
//                             {h.subject && (
//                               <span className="text-zinc-400 text-[10px] rounded-full px-2 py-0.5 bg-white/5 ring-1 ring-white/10">
//                                 {h.subject}
//                               </span>
//                             )}
//                             <span className={`text-[10px] px-2 py-0.5 rounded-full ${hwPill(h.priority)}`}>
//                               {h.priority === "high" ? "زۆر" : h.priority === "low" ? "کەم" : "ئاسایی"}
//                             </span>
//                           </div>
//                           <div className="text-sm text-zinc-100 font-semibold mt-1">{h.title}</div>
//                           {h.due && (
//                             <div className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
//                               <AlarmClock size={12} />
//                               کاتی تەواوکردن: {h.due}
//                             </div>
//                           )}
//                         </div>
//                         <button
//                           onClick={() => deleteHomework(h.id)}
//                           className="text-zinc-500 hover:text-rose-400 shrink-0"
//                           title="سڕینەوە"
//                           aria-label="سڕینەوە"
//                         >
//                           <Trash2 size={18} />
//                         </button>
//                       </motion.div>
//                     ))
//                   ) : (
//                     <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-zinc-500 text-sm py-6 text-center">
//                       هیچ ئەرکێک نییە.
//                     </motion.p>
//                   )}
//                 </AnimatePresence>
//               </div>
//             </GlassPanel>

//             {/* EVENTS */}
//             <GlassPanel>
//               <div className="px-5 pt-5 pb-3">
//                 <h3 className="text-zinc-100 font-semibold flex items-center gap-2">
//                   <PartyPopper size={18} className="text-pink-300" /> ڕووداوەکان (Events)
//                 </h3>
//                 <p className="text-sm text-zinc-400">زیادکردن/سڕینەوەی ڕووداوەکان</p>
//               </div>

//               {/* Add Event */}
//               <form onSubmit={handleAddEvent} className="px-5 grid grid-cols-1 sm:grid-cols-5 gap-2 pb-3">
//                 <input
//                   value={newEvent.title}
//                   onChange={(e) => setNewEvent((v) => ({ ...v, title: e.target.value }))}
//                   placeholder="ناونیشانی ڕووداو"
//                   required
//                   className="col-span-3 bg-white/5 text-xs text-zinc-100 rounded-xl px-2 py-2 ring-1 ring-white/10 placeholder:text-zinc-400"
//                   aria-label="ناونیشانی ڕووداو"
//                 />
//                 <input
//                   type="date"
//                   value={newEvent.date}
//                   onChange={(e) => setNewEvent((v) => ({ ...v, date: e.target.value }))}
//                   required
//                   className="col-span-2 bg-white/5 text-xs text-zinc-100 rounded-xl px-2 py-2 ring-1 ring-white/10"
//                   aria-label="ڕێکەوت"
//                 />
//                 <input
//                   value={newEvent.time}
//                   onChange={(e) => setNewEvent((v) => ({ ...v, time: e.target.value }))}
//                   placeholder="کات (10:30)"
//                   className="col-span-3 bg-white/5 text-xs text-zinc-100 rounded-xl px-2 py-2 ring-1 ring-white/10 placeholder:text-zinc-400"
//                   aria-label="کات"
//                 />
//                 <input
//                   value={newEvent.place}
//                   onChange={(e) => setNewEvent((v) => ({ ...v, place: e.target.value }))}
//                   placeholder="شوێن"
//                   className="col-span-2 bg-white/5 text-xs text-zinc-100 rounded-xl px-2 py-2 ring-1 ring-white/10 placeholder:text-zinc-400"
//                   aria-label="شوێن"
//                 />
//                 <button
//                   type="submit"
//                   className="col-span-1 inline-flex items-center justify-center gap-1 rounded-xl bg-sky-600/80 hover:bg-sky-600 text-white text-xs px-2"
//                   title="زیادکردنی ڕووداو"
//                 >
//                   <Plus size={14} /> زیادکردن
//                 </button>
//               </form>

//               {/* List of events */}
//               <div className="px-5 pb-5 pt-2">
//                 <AnimatePresence>
//                   {events.length ? (
//                     events
//                       .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
//                       .map((ev) => (
//                         <motion.div
//                           key={ev.id}
//                           initial={{ opacity: 0, y: 10 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           exit={{ opacity: 0, scale: 0.9, x: -50 }}
//                           transition={{ duration: 0.2 }}
//                           className="flex items-start gap-3 py-3 border-b border-white/5 last:border-b-0"
//                         >
//                           <div className="mt-1 w-8 h-8 rounded-full bg-white/10 ring-1 ring-white/10 grid place-items-center shrink-0">
//                             <span className="text-[10px] text-zinc-300">
//                               {ev.date ? fmtDate(new Date(ev.date)) : "-"}
//                             </span>
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <div className="text-sm text-zinc-100 font-semibold">{ev.title}</div>
//                             <div className="text-xs text-zinc-400 flex items-center gap-3 mt-1">
//                               {ev.time && (
//                                 <span className="inline-flex items-center gap-1">
//                                   <AlarmClock size={12} /> {ev.time}
//                                 </span>
//                               )}
//                               {ev.place && (
//                                 <span className="inline-flex items-center gap-1">
//                                   <MapPin size={12} /> {ev.place}
//                                 </span>
//                               )}
//                               {isInWeek(new Date(ev.date), weekStart) && <span className="text-emerald-300">ئەم هەفتە</span>}
//                             </div>
//                           </div>
//                           <button
//                             onClick={() => deleteEvent(ev.id)}
//                             className="text-zinc-500 hover:text-rose-400"
//                             title="سڕینەوە"
//                             aria-label="سڕینەوە"
//                           >
//                             <Trash2 size={18} />
//                           </button>
//                         </motion.div>
//                       ))
//                   ) : (
//                     <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-zinc-500 text-sm py-6 text-center">
//                       هیچ ڕووداوێک نییە.
//                     </motion.p>
//                   )}
//                 </AnimatePresence>
//               </div>
//             </GlassPanel>
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   );
// }
// components/UnderConstruction.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EASE = [0.22, 0.61, 0.36, 1];

export default function UnderConstruction() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* This div creates the blur and dark overlay */}
        <div className="absolute inset-0 backdrop-blur-md bg-zinc-950/70" />
        
        {/* This is the message box */}
        <div className="relative z-10 p-8 rounded-3xl border border-white/10 shadow-2xl bg-zinc-900/50 text-white text-center max-w-lg space-y-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto text-sky-400"
          >
            <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
            <path d="M16 21V7" />
            <path d="M8 21V7" />
            <path d="M12 21V7" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M6 21v-3" />
            <path d="M18 21v-3" />
            <path d="M4 21v-3" />
            <path d="M20 21v-3" />
            <path d="M9 21v-3" />
            <path d="M15 21v-3" />
            <path d="M12 21v-3" />
            <path d="M17 21v-3" />
            <path d="M7 21v-3" />
            <path d="M19 21v-3" />
          </svg>
          <h2 className="text-2xl font-bold">لەکارکردنە.</h2>
          <p className="text-zinc-300">
            ئەم بەشە لە ماڵپەڕەکەمان لە ئێستادا گەشەپێدەدرێت و بەمزووانە بەردەست دەبێت. سوپاس بۆ ئارامگریت!
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}