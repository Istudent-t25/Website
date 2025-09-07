import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Book, Video, NotebookText, CalendarDays, Lightbulb, Bell,
  GraduationCap, Languages, Volume2, ChevronRight, Clock3, CheckCircle2,
  Trophy, Flame, Sparkles, Instagram, Send
} from "lucide-react";

// ---------------- Small UI Building Blocks ----------------
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

function Panel({ className = "", children }) {
  return (
    <div
      className={
        "rounded-3xl bg-zinc-900/70 backdrop-blur-3xl ring-1 ring-zinc-800/70 shadow-[0_10px_30px_rgba(0,0,0,0.45)] " +
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

function Spotlight({ className = "" }) {
  return <div className={"absolute w-40 h-40 rounded-full bg-sky-400/20 blur-2xl opacity-0 transition-opacity duration-300 " + className} />;
}

// ---------------- Fancy Widgets ----------------
function ProgressRing({ value = 72, size = 96, fg = "#22d3ee", bg = "#0b0b0b" }) {
  const deg = Math.max(0, Math.min(100, value)) * 3.6;
  return (
    <div className="grid place-items-center" style={{ width: size, height: size }}>
      <div className="rounded-full p-[6px]" style={{ background: `conic-gradient(${fg} ${deg}deg, ${bg} ${deg}deg 360deg)` }}>
        <div className="rounded-full grid place-items-center bg-zinc-950 ring-1 ring-zinc-800/70" style={{ width: size - 12, height: size - 12 }}>
          <span className="text-zinc-200 text-lg font-bold">{value}%</span>
        </div>
      </div>
    </div>
  );
}

function StatPill({ icon: Icon, label, value, accent = "text-sky-300" }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-zinc-900/70 px-3 py-2 ring-1 ring-zinc-800/70">
      <Icon className={accent} width={18} height={18} />
      <span className="text-xs text-zinc-300 whitespace-nowrap">{label}: {value}</span>
    </div>
  );
}

// ---------------- Quick Actions & Marquee ----------------
function QuickAction({ icon: Icon, text, sub, to = "/students/grade12" }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const background = useMotionTemplate`
    radial-gradient(160px at ${mouseX}px ${mouseY}px, rgba(0,0,0,0.15) 0%, transparent 80%)
  `;

  return (
    <motion.a
      href={to}
      whileHover={{ y: -6, boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}
      whileTap={{ scale: 0.95 }}
      onMouseMove={(e) => {
        const { left, top } = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - left);
        mouseY.set(e.clientY - top);
      }}
      className="flex items-center justify-between rounded-3xl p-4 bg-zinc-900/60 transition-all duration-300 backdrop-blur-sm ring-1 ring-zinc-800/70 shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
      style={{ background }}
    >
      <div className="flex items-center gap-4">
        <div className="grid place-items-center rounded-2xl p-3 bg-gradient-to-tr from-sky-600/25 to-indigo-600/25 ring-1 ring-sky-500/25">
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

function Marquee({ items = [] }) {
  return (
    <div className="relative overflow-hidden rounded-2xl ring-1 ring-zinc-800/70 bg-zinc-900/60">
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "12px 12px" }}
      />
      <div className="flex gap-6 animate-[scroll_22s_linear_infinite] whitespace-nowrap p-3 text-sm [--tw:translateX(0)] will-change-transform">
        {items.concat(items).map((t, i) => (
          <div key={i} className="px-3 py-1 rounded-xl bg-zinc-900/70 ring-1 ring-zinc-800/70 text-zinc-300">{t}</div>
        ))}
      </div>
      <style>{`@keyframes scroll { from{ transform: translateX(0)} to{ transform: translateX(-50%) } }`}</style>
    </div>
  );
}

// ---------------- Compact Text-Only Reklam Slider (Auto, No Arrows) ----------------
function CompactPromoSlider({ ads = [] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((p) => (p + 1) % ads.length), 5000);
    return () => clearInterval(id);
  }, [ads.length]);

  const ad = ads[idx];
  if (!ad) return null;

  const Icon = ad.icon === "instagram" ? Instagram : Send;

  return (
    <div className="col-span-full z-10" dir="rtl">
      <div className="relative h-24 sm:h-28 rounded-3xl overflow-hidden bg-zinc-900/70 backdrop-blur-3xl ring-1 ring-zinc-800/70 shadow-[inset_0_2px_10px_rgba(0,0,0,0.35)]">
        {/* background pattern */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "12px 12px",
          }}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <div className={`absolute inset-0 ${ad.bg}`} />

            <div className="relative h-full px-5 sm:px-8 flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="grid place-items-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-zinc-900/70 ring-1 ring-zinc-800/70">
                  <Icon className="text-zinc-100" size={22} />
                </span>
                <div className="text-right">
                  <h3 className="text-zinc-100 font-extrabold text-base sm:text-lg leading-tight">{ad.title}</h3>
                  <p className="text-zinc-300 text-xs sm:text-sm">{ad.description}</p>
                </div>
              </div>

              <a
                href={ad.link}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-[12px] sm:text-sm font-bold bg-zinc-800/60 ring-1 ring-zinc-700/60 text-zinc-100 hover:bg-zinc-800/80 transition"
              >
                {ad.cta || "بینینی زیاتر"}
              </a>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* dots only */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {ads.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? "w-4 bg-zinc-200" : "w-2 bg-zinc-400/50"
              }`}
              aria-label={`سلاید ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------- Demo Data ----------------
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
  { icon: Volume2, color: "text-emerald-300", text: "دەنگەکان", type: "دەنگەکان" ,url:"/sounds" },
  { icon: Lightbulb, color: "text-violet-300", text: "چۆن باشتر بخوێنین", type: "پەندەکان" },
];
const motivationalQuote = "هەرچەندە ڕێگا درێژ بێت، بەهێز بەرەوپێش دەچیت 🔥";

// Replace with your real links
const adsData = [
  {
    icon: "telegram",
    title: "بیە بۆ گرووپی Telegram ـەوە",
    description: "کتێب، مەلزمە و پرسیارەکان — هەمووی بەخۆڕایی.",
    link: "https://t.me/your_channel",
    bg: "bg-gradient-to-r from-sky-900/40 via-sky-800/25 to-cyan-900/40"
  },
  {
    icon: "instagram",
    title: "Follow لە Instagram بکە",
    description: "Motivation + Study Hacks هەموو ڕۆژ.",
    link: "https://instagram.com/your_page",
    bg: "bg-gradient-to-r from-pink-900/40 via-fuchsia-900/25 to-violet-900/40"
  },
  {
    icon: "telegram",
    title: "هەموو کتێبە نوێکان لێرە",
    description: "دانلدۆدی خێرا و ڕێکخستن بۆ خوێندنی باشتر.",
    link: "/books",
    bg: "bg-gradient-to-r from-indigo-950/50 via-indigo-900/25 to-blue-950/50"
  },
];

// ---------------- Page ----------------
export default function Dashboard() {
  const kpis = { minutes: 64, tasks: 5, done: 3, streak: 6, progress: 72 };

  // Fix for Android white screen issue
  useEffect(() => {
    document.documentElement.style.colorScheme = "dark";
    document.body.style.backgroundColor = "#0b0d12";
    document.body.style.color = "#a1a1aa";
    return () => {
      document.documentElement.style.colorScheme = "";
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
    };
  }, []);

  return (
    <>
    <div className="fixed inset-0 -z-20 bg-[#0b0d12]" />

      <div className="fixed inset-0 -z-10 bg-gradient-to-tr from-zinc-950/90 via-zinc-950/60 to-indigo-950/80 animate-bg-gradient" />
      <style>{`
        @keyframes bg-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-bg-gradient {
          background-size: 200% 200%;
          animation: bg-gradient 25s ease infinite;
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative p-0 sm:p-4 min-h-screen grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-hidden"
        dir="rtl"
      >
        {/* ambient glows */}
        <Glow className="-z-10 -top-16 -left-10" color="#22d3ee" />
        <Glow className="-z-10 bottom-0 -right-10" color="#6366f1" size={420} />

        {/* HERO */}
        <div className="col-span-full lg:col-span-2 xl:col-span-3 relative z-10">
          <Panel className="p-6 sm:p-8">
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
                  <StatPill
                    label="پێشکەوتن"
                    value={`${kpis.progress}%`}
                    accent="text-yellow-300"
                    icon={() => (
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
                        transition={{
                          delay: 0.5,
                          duration: 0.6,
                          type: "keyframes",
                          ease: "easeInOut"
                        }}
                      >
                        <Trophy width={18} height={18} />
                      </motion.div>
                    )}
                  />
                </div>
              </div>

              <div className="hidden lg:flex items-center justify-center">
                <ProgressRing value={kpis.progress} size={120} />
              </div>
            </div>
          </Panel>
        </div>

        {/* COMPACT REKLAM SLIDER (text-only) */}
        <CompactPromoSlider ads={adsData} />

        {/* QUICK ACTIONS */}
        <div className="col-span-full lg:col-span-1 xl:col-span-2 grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 z-10">
          <QuickAction icon={Book} text="کتێبەکان" sub="هەموو وانەکان" to="/students/" />
          <QuickAction icon={NotebookText} text="مەلزمەکان" sub="خلاصە و تمرین" to="/students/t=booklet" />
          <QuickAction icon={Video} text="ڤیدیۆکان" sub="فیرکاری بەدەنگ" to="/students/t=videos" />
          <QuickAction icon={CalendarDays} text="خشتە" sub="کاتژمێری ئێمە" to="/schedule" />
        </div>

        {/* TODAY + NOTIFICATIONS */}
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
                    className="flex items-center justify-between border-b border-zinc-800/70 pb-3"
                  >
                    <span className="text-zinc-200 font-medium text-base">{s.subject}</span>
                    <span className="text-zinc-400 font-mono">{s.time}</span>
                  </motion.li>
                ))}
              </ul>
            </PanelBody>
            <PanelHeader className="flex-shrink-0 pt-0">
              <PanelTitle className="text-sky-300">
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 1.5,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                >
                  <Bell width={18} height={18} />
                </motion.div> ئاگادارییەکان
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
                      className="flex items-center justify-between rounded-xl px-3 py-2 bg-zinc-900/60 ring-1 ring-zinc-800/70"
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

        {/* EXAMS + SUGGESTIONS */}
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
                <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3 bg-zinc-900/60 ring-1 ring-zinc-800/70">
                  <div className="text-sm text-zinc-100 font-medium flex items-center gap-2">
                    <GraduationCap width={18} height={18} className="text-rose-300" /> {e.title}
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-zinc-400">{e.date}</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-900/20 text-rose-300 ring-1 ring-rose-900/30">{e.days ?? "?"} ڕۆژ ماوە</span>
                  </div>
                </div>
              ))}
            </PanelBody>
          </Panel>
          <Panel className="bg-gradient-to-r from-zinc-950/70 via-zinc-950/70 to-zinc-950/70">
            <PanelHeader>
              <PanelTitle>🧠 پێشنیارەکانی فێرکاری</PanelTitle>
              <PanelDesc>بابەتە گرنگەکان بۆ فێربوونی باشتر</PanelDesc>
            </PanelHeader>
            <PanelBody>
              <div className="space-y-3">
                {suggestions.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.a
                      key={i}
                      href={s.url}
                      whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}
                      className="block rounded-2xl p-4 bg-zinc-900/70 ring-1 ring-zinc-800/70 transition-transform duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <Icon width={26} height={26} className={s.color} />
                        <div>
                          <div className="text-zinc-100 font-semibold">{s.text}</div>
                          <div className="text-xs text-zinc-400 mt-0.5">{s.type}</div>
                        </div>
                      </div>
                    </motion.a>
                  );
                })}
              </div>
            </PanelBody>
          </Panel>
        </div>

        {/* QUOTE */}
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

        {/* MARQUEE */}
        <div className="col-span-full z-10">
          <Marquee items={["لیستەی کتێبە نوێکان", "وانەی فیزیا لەدوای نیوەڕ", "هاوکاری لە گرووپی خوێندن"]} />
        </div>
      </motion.div>
    </>
  );
}
