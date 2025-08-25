// ============================== Dashboard.jsx ==============================
import { motion } from "framer-motion";
import {
  Book,
  Video,
  NotebookText,
  CalendarDays,
  Lightbulb,
  Bell,
  GraduationCap,
  Languages,
  Volume2,
  ChevronLeft,
  Clock3,
  CheckCircle2,
  Trophy,
  Flame,
  Sparkles,
} from "lucide-react";

// Lightweight, dependency-free panels (replacing shadcn Card)
function Panel({ className = "", children }) {
  return (
    <div className={`rounded-3xl bg-zinc-950/70 ring-1 ring-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.35)] ${className}`}> 
      {children}
    </div>
  );
}
function PanelHeader({ children, className = "" }) {
  return <div className={`px-5 pt-5 pb-3 ${className}`}>{children}</div>;
}
function PanelTitle({ children, className = "" }) {
  return <h3 className={`text-zinc-100 font-semibold flex items-center gap-2 ${className}`}>{children}</h3>;
}
function PanelDesc({ children, className = "" }) {
  return <p className={`text-sm text-zinc-400 ${className}`}>{children}</p>;
}
function PanelBody({ children, className = "" }) {
  return <div className={`px-5 pb-5 ${className}`}>{children}</div>;
}

// Demo data
const todaySubjects = [
  { time: "08:00", subject: "بیركاری" },
  { time: "09:30", subject: "کوردی" },
  { time: "11:00", subject: "فیزیا" },
];
const exams = [
  { title: "بیركاری", date: "٢٧ی ٥", days: 3 },
  { title: "زیدنه‌زانی", date: "٢٧ی ٥", days: 3 },
  { title: "كیمیا", date: "٢٧ی ٥", days: 3 },
  { title: "كوردی", date: "٢٩ی ٥", days: 5 },
];
const notifications = [
  "کتێبی ماتماتیک زیادکرا",
  "ڤیدیۆی تازەی فیزیا زیادکرا",
];
const suggestions = [
  { icon: Languages, color: "text-sky-300", text: "گرامەری ئینگلیزی", type: "گرامەر" },
  { icon: Volume2, color: "text-emerald-300", text: "دەنگەکان", type: "دەنگەکان" },
  { icon: Lightbulb, color: "text-violet-300", text: "چۆن باشتر بخوێنین", type: "پەندەکان" },
];
const motivationalQuote = "هەرچەندە ڕێگا درێژ بێت، بەهێز بەرەوپێش دەچیت 🔥";

// Motion variants
const variants = {
  fade: { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.28 } } },
  hover: { y: -2 },
  tap: { scale: 0.98 },
};

function ProgressRing({ value = 72, size = 88, fg = "#34d399", bg = "#1c1c1f" }) {
  const deg = Math.min(100, Math.max(0, value)) * 3.6;
  return (
    <div
      className="rounded-full p-2"
      style={{ width: size, height: size, background: `conic-gradient(${fg} ${deg}deg, ${bg} ${deg}deg 360deg)` }}
      aria-label={`${value}%`}
    >
      <div className="w-full h-full rounded-full grid place-items-center bg-zinc-950 ring-1 ring-white/10">
        <span className="text-sm font-bold text-zinc-200">{value}%</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const kpis = { minutes: 64, tasks: 5, done: 3, streak: 6, progress: 72 };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.04 } } }}
      className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 lg:grid-cols-12"
      dir="rtl"
    >
      {/* HERO */}
      <motion.div variants={variants.fade} className="col-span-full">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-indigo-950 via-zinc-950 to-zinc-950 ring-1 ring-white/10">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute -right-10 -bottom-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="relative grid gap-4 p-5 sm:p-6 lg:grid-cols-3 lg:items-center">
            <div className="lg:col-span-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-50 tracking-tight flex items-center gap-2">
                <Sparkles size={22} className="text-sky-300" /> سڵاو، بەخێربێیت ـ پلانت لێرەیە
              </h1>
              <p className="mt-2 text-zinc-400 text-sm">کتێب، مەلزمە، ڤیدیۆ و خشته‌ ـ هەمووی لە یەک شوێن.</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 ring-1 ring-white/10"><Clock3 size={18} className="text-sky-300" /><span className="text-xs text-zinc-300">{kpis.minutes} خولەک خوێندن</span></div>
                <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 ring-1 ring-white/10"><CheckCircle2 size={18} className="text-emerald-300" /><span className="text-xs text-zinc-300">{kpis.done}/{kpis.tasks} ئەرك تەواو</span></div>
                <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 ring-1 ring-white/10"><Flame size={18} className="text-orange-300" /><span className="text-xs text-zinc-300">{kpis.streak} ڕۆژ ستریک</span></div>
                <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 ring-1 ring-white/10"><Trophy size={18} className="text-yellow-300" /><span className="text-xs text-zinc-300">{kpis.progress}% پێشکەوتن</span></div>
              </div>
            </div>
            <div className="lg:justify-self-end"><ProgressRing value={kpis.progress} /></div>
          </div>
        </div>
      </motion.div>

      {/* QUICK ACTIONS */}
      <motion.div variants={variants.fade} className="col-span-full lg:col-span-5 grid grid-cols-2 gap-3">
        {[{icon:Book,text:"کتێبەکان",sub:"هەموو وانەکان",to:"/books"},{icon:NotebookText,text:"مەلزمەکان",sub:"خلاصە و تمرین",to:"/booklets"},{icon:Video,text:"ڤیدیۆکان",sub:"فیرکاری بەدەنگ",to:"/videos"},{icon:CalendarDays,text:"خشتە",sub:"کاتژمێری ئێمە",to:"/schedule"}].map((a,i)=>{
          const Icon = a.icon; return (
            <motion.a key={i} href={a.to} whileHover={{y:-2}} whileTap={{scale:0.98}} className="flex items-center justify-between rounded-2xl px-4 py-3 bg-zinc-900/70 hover:bg-zinc-900 transition ring-1 ring-white/10">
              <div className="flex items-center gap-3">
                <div className="grid place-items-center rounded-xl p-2 bg-gradient-to-tr from-sky-600/20 to-indigo-600/20"><Icon size={22} className="text-sky-300"/></div>
                <div className="text-right"><div className="text-zinc-100 text-sm font-semibold">{a.text}</div><div className="text-xs text-zinc-400">{a.sub}</div></div>
              </div>
              <ChevronLeft size={18} className="text-zinc-500" />
            </motion.a>
          )})}
      </motion.div>

      {/* TODAY */}
      <motion.div variants={variants.fade} className="col-span-full lg:col-span-4">
        <Panel>
          <PanelHeader>
            <PanelTitle><CalendarDays size={18} className="text-sky-300"/> خشتەی ئەمڕۆ</PanelTitle>
            <PanelDesc>کاتەکان و وانەکان</PanelDesc>
          </PanelHeader>
          <PanelBody>
            <ul className="space-y-3 text-sm">
              {todaySubjects.map((s,i)=> (
                <li key={i} className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-zinc-200 font-medium">{s.subject}</span>
                  <span className="text-zinc-400">{s.time}</span>
                </li>
              ))}
            </ul>
          </PanelBody>
        </Panel>
      </motion.div>

      {/* QUOTE */}
      <motion.div variants={variants.fade} className="col-span-full lg:col-span-3">
        <Panel className="bg-gradient-to-b from-zinc-900/70 to-zinc-950/70">
          <PanelHeader>
            <PanelTitle className="text-amber-300"><Lightbulb size={18}/> وتەی ئەمڕۆ</PanelTitle>
            <PanelDesc>هۆسەرۆکی لەخۆگر</PanelDesc>
          </PanelHeader>
          <PanelBody>
            <p className="text-sm text-zinc-200 leading-7">{motivationalQuote}</p>
          </PanelBody>
        </Panel>
      </motion.div>

      {/* EXAMS */}
      <motion.div variants={variants.fade} className="col-span-full lg:col-span-6">
        <Panel>
          <PanelHeader>
            <PanelTitle className="text-rose-300"><GraduationCap size={18}/> تاقیکردنەوەی داهاتوو</PanelTitle>
            <PanelDesc>بەردەوام بخوێنە بۆ ئامادەکاری</PanelDesc>
          </PanelHeader>
          <PanelBody className="space-y-3">
            {exams.map((e,i)=> (
              <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3 bg-zinc-900/60 ring-1 ring-white/10">
                <div className="text-sm text-zinc-100 font-medium flex items-center gap-2"><GraduationCap size={18} className="text-rose-300"/> {e.title}</div>
                <div className="flex items-center gap-3 text-xs"><span className="text-zinc-400">{e.date}</span><span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/20">{e.days ?? "?"} ڕۆژ ماوە</span></div>
              </div>
            ))}
          </PanelBody>
        </Panel>
      </motion.div>

      {/* NOTIFICATIONS */}
      <motion.div variants={variants.fade} className="col-span-full lg:col-span-6">
        <Panel>
          <PanelHeader>
            <PanelTitle className="text-sky-300"><Bell size={18}/> ئاگادارییەکان</PanelTitle>
            <PanelDesc>نوێکارییەکان لەم هەفتەیە</PanelDesc>
          </PanelHeader>
          <PanelBody>
            {notifications?.length ? (
              <ul className="space-y-2 text-sm">
                {notifications.map((n,i)=> (
                  <li key={i} className="flex items-center justify-between rounded-xl px-3 py-2 bg-zinc-900/60 ring-1 ring-white/10">
                    <span className="text-zinc-200">{n}</span>
                    <span className="text-[10px] text-zinc-500">نوێ</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-zinc-500 text-sm">هیچ ئاگادارییەک نییە.</p>
            )}
          </PanelBody>
        </Panel>
      </motion.div>

      {/* SUGGESTED */}
      <motion.div variants={variants.fade} className="col-span-full">
        <Panel className="bg-gradient-to-r from-indigo-950/70 via-zinc-950/70 to-zinc-950/70">
          <PanelHeader>
            <PanelTitle>🧠 پێشنیارەکانی فێرکاری</PanelTitle>
            <PanelDesc>بابەتە گرنگەکان بۆ فێربوونی باشتر</PanelDesc>
          </PanelHeader>
          <PanelBody>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {suggestions.map((s,i)=>{
                const Icon = s.icon; return (
                <motion.div key={i} whileHover={{scale:1.02}} className="rounded-2xl p-4 bg-zinc-900/70 ring-1 ring-white/10">
                  <div className="flex items-center gap-3">
                    <Icon size={26} className={s.color} />
                    <div>
                      <div className="text-zinc-100 font-semibold">{s.text}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">{s.type}</div>
                    </div>
                  </div>
                </motion.div>)})}
            </div>
          </PanelBody>
        </Panel>
      </motion.div>
    </motion.div>
  );
}
