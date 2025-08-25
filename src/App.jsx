// App.jsx — fixed header, fixed desktop sidebar, ONLY main container scrolls
import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Menu, Search, Sun, Moon } from "lucide-react";

import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Students from "./pages/Students.jsx";
import ExamsGrade12 from "./pages/ExamsGrade12.jsx";
import Schedule from "./pages/Schedule.jsx";
import SoundsPage from "./pages/Sounds.jsx";
import GrammarPage from "./pages/Grammers.jsx";

import LoginModal from "./components/LoginModal.jsx";
import RegisterModal from "./components/RegisterModal.jsx";
import UserDetailsModal from "./components/UserDetailsModal.jsx";
// import ProtectedRoute from "./components/ProtectedRoute.jsx"; // if needed

const HEADER_M = 56; // mobile header height (h-14)
const HEADER_D = 64; // desktop header height (md:h-16)

function Header({ onMenuClick }) {
  const [search, setSearch] = useState("");
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark") ||
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // keep browser top bar color in sync (Android, iOS Safari)
  useEffect(() => {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", dark ? "#0a0a0b" : "#ffffff");
  }, [dark]);

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 h-14 md:h-16 backdrop-blur bg-white/80 dark:bg-zinc-900/80 border-b border-white/10 px-4 flex items-center justify-between gap-4"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <button className="md:hidden text-zinc-700 dark:text-zinc-200" onClick={onMenuClick}>
        <Menu size={24} />
      </button>

      <h1 className="text-lg md:text-xl font-bold text-sky-600 dark:text-sky-400 whitespace-nowrap">
        من خوێندکارم
      </h1>

      <div className="relative flex-1 max-w-xs hidden sm:block">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="گەڕان..."
          className="w-full bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-800 dark:text-zinc-100 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <Search size={18} className="absolute left-3 top-2.5 text-zinc-400" />
      </div>

      <button
        onClick={() => setDark((v) => !v)}
        className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
        aria-label="toggle theme"
      >
        {dark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-zinc-700 dark:text-zinc-200" />}
      </button>
    </header>
  );
}

export default function App() {
  const location = useLocation();
  const prefersReduced = useReducedMotion();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Lock body when the mobile drawer is open
  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev || "");
  }, [sidebarOpen]);

  // page animation (short & smooth)
  const pageMotion = prefersReduced
    ? { initial: false, animate: false, exit: false }
    : {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -6 },
        transition: { duration: 0.18, ease: [0.22, 0.61, 0.36, 1] },
      };

  return (
    <div dir="rtl" className="bg-white text-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Reserve space under the FIXED header; prevent page/body scroll */}
      <div className="pt-14 md:pt-16 h-[100dvh] overflow-hidden">
        {/* Desktop layout: fixed sidebar under header + scrollable MAIN only */}
        <div className="relative h-full">
          {/* Fixed sidebar on the RIGHT (RTL) for md+ */}
          <div
            className="hidden md:block fixed right-0 top-14 md:top-16 z-40 w-72 xl:w-80 bg-white/90 dark:bg-zinc-900/80 backdrop-blur border-l border-white/10 shadow-xl"
            style={{
              height: `calc(100dvh - ${HEADER_D}px)`,
              overflow: "hidden", // no sidebar scroll
            }}
          >
            <Sidebar isOpen variant="desktop" />
          </div>

          {/* MAIN column: adds right margin to avoid being under the fixed sidebar; 
              MAIN is the ONLY scrollable area */}
          <div className="h-full md:mr-72 xl:mr-80">
            <main
              className="h-full overflow-y-auto custom-scroll p-4 md:p-6"
              style={{
                WebkitOverflowScrolling: "touch",
                overscrollBehaviorY: "contain",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div key={location.pathname} className="w-full" {...pageMotion}>
                  <Routes location={location}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/sounds" element={<SoundsPage />} />
                    <Route path="/grammar/:lang" element={<GrammarPage />} />
                    <Route path="/students/:grade" element={<Students />} />
                    <Route path="/exams/grade12" element={<ExamsGrade12 />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="*" element={<p className="text-center text-red-500">هەڵە: پەڕە نەدۆزرایەوە</p>} />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>

      {/* Mobile drawer (smooth, narrower, background locked) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="absolute inset-0 bg-black/35" onClick={() => setSidebarOpen(false)} />
            <motion.div
              className="absolute right-0 top-0 h-full w-[min(88vw,20rem)] bg-white dark:bg-zinc-900 shadow-2xl overflow-y-auto overflow-x-hidden rounded-l-2xl will-change-transform"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
              style={{
                paddingTop: `calc(env(safe-area-inset-top) + ${HEADER_M}px)`,
                WebkitOverflowScrolling: "touch",
              }}
            >
              <Sidebar isOpen variant="mobile" onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header must be last in DOM so it overlays fixed sidebar edge nicely on iOS */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

      {/* Modals (wire when needed) */}
      <LoginModal isOpen={false} />
      <RegisterModal isOpen={false} />
      <UserDetailsModal isOpen={false} />
    </div>
  );
}
