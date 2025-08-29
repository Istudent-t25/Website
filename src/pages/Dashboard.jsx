// ============================== DashboardNeo.jsx - Next-Gen Design ==============================
// This version focuses on a more dramatic, dynamic layout with a glassmorphism feel.
// Key elements are emphasized with bold, asymmetrical arrangements.
//
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Book, Video, NotebookText, CalendarDays, Lightbulb, Bell,
  GraduationCap, Languages, Volume2, ChevronRight, Clock3, CheckCircle2,
  Trophy, Flame, Sparkles, Maximize, Minimize,
} from "lucide-react";

// ---------------- Small UI Building Blocks ----------------
// We'll keep these as they are solid foundational components.
function Glow({ className = "", size = 340, color = "#22d3ee" }) {
  return (
    <div
      aria-hidden
      className={"pointer-events-none absolute blur-3xl opacity-30 " + className}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(50% 50% at 50% 50%, ${color}33 0%, transparent 70%)`,
      }}
    />
  );
}

// Updated Panel component for a stronger glassmorphism effect
function Panel({ className = "", children }) {
  return (
    <div
      className={
        "rounded-3xl bg-white/5 backdrop-blur-3xl ring-1 ring-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.35)] " +
        "relative overflow-hidden transition-transform duration-300 hover:scale-[1.01] " +
        className
      }
    >
      <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(circle_at_top_right,black,transparent_70%)]" />
      {children}
    </div>
  );
}
function PanelHeader({ children, className = "" }) {
  return <div className={"px-5 pt-5 pb-3 " + className}>{children}</div>;
}
function PanelTitle({ children, className = "" }) {
  return <h3 className={"text-zinc-100 font-semibold flex items-center gap-2 " + className}>{children}</h3>;
}
function PanelDesc({ children, className = "" }) {
  return <p className={"text-sm text-zinc-400 " + className}>{children}</p>;
}
function PanelBody({ children, className = "" }) {
  return <div className={"px-5 pb-5 " + className}>{children}</div>;
}

// New component for dramatic visual effect
function Spotlight({ className = "" }) {
  return (
    <div
      className={"absolute w-40 h-40 rounded-full bg-sky-400/20 blur-2xl opacity-0 transition-opacity duration-300 " + className}
    />
  );
}

// ---------------- Fancy Widgets (no changes needed, they fit the new theme well) ----------------
function ProgressRing({ value = 72, size = 96, fg = "#22d3ee", bg = "#1a1a1a" }) {
  const deg = Math.max(0, Math.min(100, value)) * 3.6;
  return (
    <div className="grid place-items-center" style={{ width: size, height: size }}>
      <div
        className="rounded-full p-[6px]"
        style={{ background: `conic-gradient(${fg} ${deg}deg, ${bg} ${deg}deg 360deg)` }}
      >
        <div className="rounded-full grid place-items-center bg-zinc-950 ring-1 ring-white/10" style={{ width: size - 12, height: size - 12 }}>
          <span className="text-zinc-200 text-lg font-bold">{value}%</span>
        </div>
      </div>
    </div>
  );
}

function StatPill({ icon: Icon, label, value, accent = "text-sky-300" }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
      <Icon className={accent} width={18} height={18} />
      <span className="text-xs text-zinc-300 whitespace-nowrap">{label}: {value}</span>
    </div>
  );
}

// Focus Timer
function FocusTimer({ seconds, setSeconds, onMaximize, running, setRunning }) {
  useEffect(() => {
    let id;
    if (running) {
      id = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => id && clearInterval(id);
  }, [running, setSeconds]);

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');

  const handleToggle = () => setRunning((r) => !r);
  const handleReset = () => {
    setRunning(false);
    setSeconds(0);
  };

  return (
    <div className="p-5 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <h3 className="text-lg font-bold text-zinc-100">⏱️ تێمەرێکی خوێندن</h3>
        <button onClick={onMaximize} className="text-zinc-400 hover:text-white transition">
          <Maximize width={16} height={16} />
        </button>
      </div>
      <p className="text-sm text-zinc-400">کات بۆ سێشەنی ئێمە</p>
      <motion.div
        key={seconds}
        initial={{ scale: 0.95, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="mt-3 text-3xl font-extrabold tracking-wide tabular-nums text-zinc-50"
      >
        {mins}:{secs}
      </motion.div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <button onClick={handleToggle} className={`px-3 py-1.5 rounded-xl text-sm font-semibold ring-1 ring-white/10 ${running ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
          {running ? 'وەستاندن' : 'دەستپێكردن'}
        </button>
        <button onClick={handleReset} className="px-3 py-1.5 rounded-xl text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 ring-1 ring-white/10">
          ڕیستكردن
        </button>
      </div>
    </div>
  );
}

// Full-screen timer component (no changes needed, it's perfect)
function FullScreenTimer({ seconds, running, setRunning, onMinimize }) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');

  const handleToggle = () => setRunning((r) => !r);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-zinc-950/95 backdrop-blur-2xl z-50 flex flex-col items-center justify-center text-center p-4"
      dir="rtl"
    >
      <motion.div
        key={seconds}
        initial={{ scale: 0.95, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="text-[10rem] sm:text-[14rem] md:text-[16rem] font-extrabold tabular-nums tracking-wide text-zinc-50"
        style={{ textShadow: "0 0 40px rgba(255,255,255,0.1)" }}
      >
        {mins}:{secs}
      </motion.div>
      <div className="flex items-center gap-4 mt-8">
        <button onClick={handleToggle} className={`px-6 py-3 rounded-2xl text-lg font-semibold ring-1 ring-white/20 transition-colors ${running ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
          {running ? 'وەستاندن' : 'دەستپێكردن'}
        </button>
        <button onClick={onMinimize} className="p-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 ring-1 ring-white/10 transition-colors">
          <Minimize width={24} height={24} />
        </button>
      </div>
    </motion.div>
  );
}

// Updated Quick Action with more visual flair
function QuickAction({ icon: Icon, text, sub, to = "#" }) {
  return (
    <motion.a
      href={to}
      whileHover={{ y: -6, boxShadow: "0 10px 40px rgba(0,0,0,0.4)" }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center justify-between rounded-3xl p-4 bg-white/5 transition-all duration-300 backdrop-blur-sm ring-1 ring-white/10 shadow-[0_4px_10px_rgba(0,0,0,0.2)]"
    >
      <div className="flex items-center gap-4">
        <div className="grid place-items-center rounded-2xl p-3 bg-gradient-to-tr from-sky-600/30 to-indigo-600/30 ring-1 ring-sky-500/30">
          <Icon width={24} height={24} className="text-sky-300" />
        </div>
        <div className="text-right">
          <div className="text-zinc-100 text-base font-semibold">{text}</div>
          <div className="text-sm text-zinc-400">{sub}</div>
        </div>
      </div>
      <ChevronRight width={20} height={20} className="text-zinc-500" />
    </motion.a>
  );
}

// Marquee (no changes needed)
function Marquee({ items = [] }) {
  return (
    <div className="relative overflow-hidden rounded-2xl ring-1 ring-white/10 bg-zinc-900/60">
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "12px 12px" }} />
      <div className="flex gap-6 animate-[scroll_22s_linear_infinite] whitespace-nowrap p-3 text-sm [--tw:translateX(0)] will-change-transform">
        {items.concat(items).map((t, i) => (
          <div key={i} className="px-3 py-1 rounded-xl bg-white/5 ring-1 ring-white/10 text-zinc-300">{t}</div>
        ))}
      </div>
      <style>{`@keyframes scroll { from{ transform: translateX(0)} to{ transform: translateX(-50%) } }`}</style>
    </div>
  );
}

// ---------------- Demo Data (no changes needed) ----------------
const todaySubjects = [
  { time: "08:00", subject: "بیركاری" },
  { time: "09:30", subject: "کوردی" },
  { time: "11:00", subject: "فیزیا" },
];
const exams = [
  { title: "بیركاری", date: "٢٧ی ٥", days: 3 },
  { title: "زیندەزانی", date: "٢٧ی ٥", days: 3 },
  { title: "كیمیا", date: "٢٧ی ٥", days: 3 },
  { title: "كوردی", date: "٢٩ی ٥", days: 5 },
];
const notifications = ["کتێبی ماتماتیک زیادکرا", "ڤیدیۆی تازەی فیزیا زیادکرا"];
const suggestions = [
  { icon: Languages, color: "text-sky-300", text: "گرامەری ئینگلیزی", type: "گرامەر" },
  { icon: Volume2, color: "text-emerald-300", text: "دەنگەکان", type: "دەنگەکان" },
  { icon: Lightbulb, color: "text-violet-300", text: "چۆن باشتر بخوێنین", type: "پەندەکان" },
];
const motivationalQuote = "هەرچەندە ڕێگا درێژ بێت، بەهێز بەرەوپێش دەچیت 🔥";

// ---------------- Page ----------------
export default function DashboardNeo() {
  const kpis = { minutes: 64, tasks: 5, done: 3, streak: 6, progress: 72 };
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Persistence logic for the timer
  const today = new Date();
  const key = `istudent_timer_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  useEffect(() => {
    const saved = Number(localStorage.getItem(key) || 0);
    if (!Number.isNaN(saved)) setSeconds(saved);
  }, [key]);
  useEffect(() => {
    localStorage.setItem(key, String(seconds));
  }, [seconds, key]);


  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative p-0 sm:p-4 min-h-screen grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-hidden"
        dir="rtl"
      >
        {/* Ambient glows */}
        <Glow className="-z-10 -top-16 -left-10" color="#22d3ee" />
        <Glow className="-z-10 bottom-0 -right-10" color="#6366f1" size={420} />

        {/* HERO SECTION */}
        <div className="col-span-full lg:col-span-2 xl:col-span-3 relative z-10">
          <Panel className="!bg-white/5 p-6 sm:p-8">
            <div className="relative grid gap-4 lg:grid-cols-3 lg:items-center">
              <div className="lg:col-span-2">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-50 tracking-tight flex items-center gap-2">
                  <Sparkles width={28} height={28} className="text-sky-300" /> بەخێربێیت، پلانت لێرەیە
                </h1>
                <p className="mt-2 text-zinc-400 text-base">کتێب، مەلزمە، ڤیدیۆ و خشته‌ ـ هەمووی لە یەک شوێن.</p>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatPill icon={Clock3} label="خولەک خوێندن" value={kpis.minutes} />
                  <StatPill icon={CheckCircle2} label="ئەرك تەواو" value={`${kpis.done}/${kpis.tasks}`} accent="text-emerald-300" />
                  <StatPill icon={Flame} label="ستریک" value={kpis.streak} accent="text-orange-300" />
                  <StatPill icon={Trophy} label="پێشکەوتن" value={`${kpis.progress}%`} accent="text-yellow-300" />
                </div>
              </div>

              <div className="hidden lg:flex items-center justify-center">
                <ProgressRing value={kpis.progress} size={120} />
              </div>
            </div>
          </Panel>
        </div>

        {/* FOCUS TIMER (large card) */}
        <Panel className="col-span-full sm:col-span-1 lg:col-span-1 xl:col-span-1 z-10 bg-gradient-to-br from-indigo-950/70 to-zinc-950/70">
          <FocusTimer
            seconds={seconds}
            setSeconds={setSeconds}
            running={running}
            setRunning={setRunning}
            onMaximize={() => setIsFullScreen(true)}
          />
        </Panel>

        {/* QUOTE (large card) */}
        <Panel className="col-span-full sm:col-span-1 lg:col-span-2 xl:col-span-2 relative z-10 bg-gradient-to-b from-zinc-900/70 to-zinc-950/70">
          <PanelHeader>
            <PanelTitle className="text-amber-300">
              <Lightbulb width={18} height={18} /> وتەی ئەمڕۆ
            </PanelTitle>
            <PanelDesc>هۆسەرۆکی لەخۆگر</PanelDesc>
          </PanelHeader>
          <PanelBody>
            <p className="text-lg text-zinc-200 leading-7 font-medium">{motivationalQuote}</p>
          </PanelBody>
          <Spotlight className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />
        </Panel>

        {/* QUICK ACTIONS */}
        <div className="col-span-full lg:col-span-1 xl:col-span-2 grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 z-10">
          <QuickAction icon={Book} text="کتێبەکان" sub="هەموو وانەکان" to="/books" />
          <QuickAction icon={NotebookText} text="مەلزمەکان" sub="خلاصە و تمرین" to="/booklets" />
          <QuickAction icon={Video} text="ڤیدیۆکان" sub="فیرکاری بەدەنگ" to="/videos" />
          <QuickAction icon={CalendarDays} text="خشتە" sub="کاتژمێری ئێمە" to="/schedule" />
        </div>

        {/* TODAY + NOTIFICATIONS (as a single, long panel) */}
        <Panel className="col-span-full sm:col-span-1 lg:col-span-1 xl:col-span-2 relative z-10">
          <div className="flex flex-col h-full">
            <PanelHeader className="flex-shrink-0">
              <PanelTitle>
                <CalendarDays width={18} height={18} className="text-sky-300" /> خشتەی ئەمڕۆ
              </PanelTitle>
              <PanelDesc>کاتەکان و وانەکان</PanelDesc>
            </PanelHeader>
            <PanelBody className="flex-1">
              <ul className="space-y-4 text-sm">
                {todaySubjects.map((s, i) => (
                  <motion.li 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between border-b border-white/10 pb-3"
                  >
                    <span className="text-zinc-200 font-medium text-base">{s.subject}</span>
                    <span className="text-zinc-400 font-mono">{s.time}</span>
                  </motion.li>
                ))}
              </ul>
            </PanelBody>
            <PanelHeader className="flex-shrink-0 pt-0">
              <PanelTitle className="text-sky-300">
                <Bell width={18} height={18} /> ئاگادارییەکان
              </PanelTitle>
              <PanelDesc>نوێکارییەکان لەم هەفتەیە</PanelDesc>
            </PanelHeader>
            <PanelBody className="flex-1">
              {notifications?.length ? (
                <ul className="space-y-2 text-sm">
                  {notifications.map((n, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="flex items-center justify-between rounded-xl px-3 py-2 bg-zinc-900/60 ring-1 ring-white/10"
                    >
                      <span className="text-zinc-200">{n}</span>
                      <span className="text-[10px] text-zinc-500">نوێ</span>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-zinc-500 text-sm">هیچ ئاگادارییەک نییە.</p>
              )}
            </PanelBody>
          </div>
        </Panel>

        {/* EXAMS + SUGGESTIONS (side-by-side on large screens) */}
        <div className="col-span-full lg:col-span-2 xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 z-10">
          <Panel>
            <PanelHeader>
              <PanelTitle className="text-rose-300">
                <GraduationCap width={18} height={18} /> تاقیکردنەوەی داهاتوو
              </PanelTitle>
              <PanelDesc>بەردەوام بخوێنە بۆ ئامادەکاری</PanelDesc>
            </PanelHeader>
            <PanelBody className="space-y-3">
              {exams.map((e, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3 bg-zinc-900/60 ring-1 ring-white/10">
                  <div className="text-sm text-zinc-100 font-medium flex items-center gap-2">
                    <GraduationCap width={18} height={18} className="text-rose-300" /> {e.title}
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-zinc-400">{e.date}</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/20">{e.days ?? "?"} ڕۆژ ماوە</span>
                  </div>
                </div>
              ))}
            </PanelBody>
          </Panel>
          <Panel className="bg-gradient-to-r from-indigo-950/70 via-zinc-950/70 to-zinc-950/70">
            <PanelHeader>
              <PanelTitle>🧠 پێشنیارەکانی فێرکاری</PanelTitle>
              <PanelDesc>بابەتە گرنگەکان بۆ فێربوونی باشتر</PanelDesc>
            </PanelHeader>
            <PanelBody>
              <div className="space-y-3">
                {suggestions.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.div key={i} whileHover={{ scale: 1.02 }} className="rounded-2xl p-4 bg-zinc-900/70 ring-1 ring-white/10">
                      <div className="flex items-center gap-3">
                        <Icon width={26} height={26} className={s.color} />
                        <div>
                          <div className="text-zinc-100 font-semibold">{s.text}</div>
                          <div className="text-xs text-zinc-400 mt-0.5">{s.type}</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </PanelBody>
          </Panel>
        </div>
        
        {/* MARQUEE at the bottom */}
        <div className="col-span-full z-10">
          <Marquee items={["لیستەی کتێبە نوێکان", "وانەی فیزیا لەدوای نیوەڕ", "هاوکاری لە گرووپی خوێندن"]} />
        </div>

      </motion.div>

      <AnimatePresence>
        {isFullScreen && (
          <FullScreenTimer
            seconds={seconds}
            running={running}
            setRunning={setRunning}
            onMinimize={() => setIsFullScreen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}