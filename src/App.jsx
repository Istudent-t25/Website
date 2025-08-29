import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import Header from "./components/Header.jsx";        // desktop-only header
import BottomNav from "./components/BottomNav.jsx";  // mobile tabs

// pages...
import Dashboard from "./pages/Dashboard.jsx";
import Students from "./pages/Students.jsx";
import ExamsGrade12 from "./pages/ExamsGrade12.jsx";
import Schedule from "./pages/Schedule.jsx";
import SoundsPage from "./pages/Sounds.jsx";
import GrammarPage from "./pages/Grammers.jsx";
import ProfileSettings from "./pages/ProfileSettings.jsx";
import ExamBank from "./pages/ExamBank.jsx";
import DeveloperPage from "./pages/DeveloperPage.jsx";
import ExamsHome from "./pages/ExamsHome.jsx";
export default function App() {
  const location = useLocation();
  const prefersReduced = useReducedMotion();
  const [headerH, setHeaderH] = useState(0); // desktop header height only (hidden on mobile)

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
      {/* Desktop header (hidden on mobile inside the component) */}
      <Header onHeightChange={setHeaderH} />

      <div className="min-h-[100dvh] overflow-hidden">
        <main
          className="h-[100dvh] overflow-y-auto custom-scroll p-2 md:p-6"
          style={{
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorY: "contain",
            // paddingTop: headerH ? `${headerH}px` : "0px", // 0 on mobile
            paddingTop: "20px", // 0 on mobile
            paddingBottom: "90px", // for bottom nav
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} className="w-full" {...pageMotion}>
              <Routes location={location}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/sounds" element={<SoundsPage />} />
                <Route path="/grammar/" element={<GrammarPage />} />
                <Route path="/students/:grade" element={<Students />} />
                <Route path="/exams/grade12" element={<ExamsGrade12 />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/exams" element={<ExamsHome />} />
                <Route path="/exams/bank" element={<ExamBank />} />
                <Route path="/settings" element={<ProfileSettings />} />
                <Route path="/developer" element={<DeveloperPage />} />
                <Route path="*" element={<p className="text-center text-red-500">هەڵە: پەڕە نەدۆزرایەوە</p>} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile bottom tabs */}
      <BottomNav />
    </div>
  );
}
