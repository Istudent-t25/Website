// src/App.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import { onAuthStateChanged, onIdTokenChanged, signOut } from "firebase/auth";
import { auth } from "./lib/firebase";

// Shell
import Header from "./components/Header.jsx";
import BottomNav from "./components/BottomNav.jsx";

// Pages
import Dashboard from "./pages/Dashboard.jsx";
import Students from "./pages/Students.jsx";
import ExamsGrade12 from "./pages/notneccery/ExamsGrade12.jsx";
import Schedule from "./pages/Schedule.jsx";
import SoundsPage from "./pages/Sounds.jsx";
import GrammarPage from "./pages/Grammers.jsx";
import ProfileSettings from "./pages/ProfileSettings.jsx";
import ExamBank from "./pages/notneccery/ExamBank.jsx";
import ExamsHome from "./pages/ExamsHome.jsx";
import ResourceViewer from "./pages/ResourceViewer.jsx";
import AuthWizard from "./pages/AuthWizard.jsx";
// import SubjectsPage from "./pages/notneccery/Subjects.jsx";
import SubjectContent from "./pages/SubjectContent.jsx";

// Public
import WelcomePWA from "./pages/WelcomePWA.jsx";
import ExamsPage from "./pages/Exams.jsx";
import NotFound from "./pages/NotFound.jsx";
// import CoursePage from "./pages/notneccery/CoursePage.jsx";


import SecureResourceViewer from "./pages/Courses/SecureResourceViewer";
import SecureVideo from "./pages/Courses/SecureVideo";
import SubjectPage from "./pages/Courses/SubjectPage";
import CoursePage from "./pages/Courses/CoursePage";
import StudyHub from "./pages/StudyHub.jsx";


import { SubjectsHub, SubjectDetail } from "@/pages/subjects"; 
import BooksAndBooklets from "@/pages/resources/books/BooksAndBooklets";
import ImportantNotes from "@/pages/resources/notes/ImportantNotes";
import ImportantExams from "@/pages/resources/exams/ImportantExams";
import BooksLiterary from "@/pages/resources/books/BooksLiterary";

/* ─────────────────────────────
   Auth Context
   ───────────────────────────── */
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const unsubUser = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setReady(true);
    });
    const unsubTok = onIdTokenChanged(auth, async (u) => {
      if (u) {
        try {
          const t = await u.getIdToken(false);
          setToken(t);
        } catch {
          setToken(null);
        }
      } else {
        setToken(null);
      }
    });
    const iv = setInterval(async () => {
      const u = auth.currentUser;
      if (u) {
        try { await u.getIdToken(true); } catch {}
      }
    }, 50 * 60 * 1000);

    return () => { unsubUser(); unsubTok(); clearInterval(iv); };
  }, []);

  const value = useMemo(() => ({ user, token, ready, signOut: () => signOut(auth) }), [user, token, ready]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ─────────────────────────────
   Welcome Gate
   ───────────────────────────── */
const LS_HIDE = "welcome_pwa_hide";
const LS_INSTALLED = "welcome_pwa_installed";

function isStandaloneDisplay() {
  try {
    return (
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      (navigator && navigator.standalone === true)
    );
  } catch {
    return false;
  }
}

function shouldShowWelcomeNow() {
  const hide = localStorage.getItem(LS_HIDE) === "1";
  const installedFlag = localStorage.getItem(LS_INSTALLED) === "1";
  const standalone = isStandaloneDisplay();
  return !(hide || installedFlag || standalone);
}

function WelcomeGate({ children }) {
  const location = useLocation();
  if (location.pathname !== "/welcome" && shouldShowWelcomeNow()) {
    return <Navigate to="/welcome" replace />;
  }
  return children;
}

/* ─────────────────────────────
   Route Guards
   ───────────────────────────── */
function FullscreenLoader() {
  return (
    <div className="min-h-[100svh] grid place-items-center bg-zinc-950 text-zinc-100">
      <div className="animate-pulse text-sm text-zinc-400">چاوەڕێ بکە...</div>
    </div>
  );
}

function RequireAuth() {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <FullscreenLoader />;
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;
  return <Outlet />;
}

function RedirectIfAuthed() {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <FullscreenLoader />;
  if (user) {
    const backTo = location.state?.from?.pathname || "/";
    return <Navigate to={backTo} replace />;
  }
  return <Outlet />;
}

/* ─────────────────────────────
   Animated App Shell
   ───────────────────────────── */
function AppShell() {
  const location = useLocation();
  const prefersReduced = useReducedMotion();
  const [headerH, setHeaderH] = useState(0);

  const pageMotion = useMemo(
    () => (prefersReduced
      ? { initial: false, animate: false, exit: false }
      : {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -8 },
          transition: { duration: 0.18, ease: [0.22, 0.61, 0.36, 1] },
        }),
    [prefersReduced]
  );

  return (
    // FIX: force dark shell with light text to avoid "black screen" in light mode
    <div dir="rtl" className="bg-zinc-950 text-zinc-100">
      <Header onHeightChange={setHeaderH} />

      <main
        className="min-h-[100svh] overflow-y-auto custom-scroll px-2 md:px-6"
        style={{
          paddingTop: 0, // or headerH if you want to push content below header
          paddingBottom: "calc(30px + env(safe-area-inset-bottom, 0px))",
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} {...pageMotion}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="pb-[env(safe-area-inset-bottom,0px)]">
        <BottomNav />
      </div>
    </div>
  );
}

/* ─────────────────────────────
   Main App
   ───────────────────────────── */
export default function App() {
  return (
    <AuthProvider>
      <WelcomeGate>
        <Routes>
          {/* Public: Welcome */}
          <Route path="/welcome" element={<WelcomePWA afterPath="/auth" />} />

          {/* Public: Auth */}
          <Route element={<RedirectIfAuthed />}>
            <Route path="/auth" element={<AuthWizard />} />
          </Route>

          {/* Private */}
          <Route element={<RequireAuth />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sounds" element={<SoundsPage />} />
              <Route path="/grammar" element={<GrammarPage />} />
              <Route path="/students/" element={<Students />} />
              <Route path="/exams/grade12" element={<ExamsGrade12 />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/exams" element={<ExamsHome />} />
              <Route path="/exams/bank" element={<ExamBank />} />
              <Route path="/settings" element={<ProfileSettings />} />
              {/* <Route path="/subjects" element={<ExamsPage />} /> */}
              {/* <Route path="/subjects/:subject/:category" element={<SubjectContent />} /> */}
              {/* <Route path="/course" element={<CoursePage />} /> */}
              <Route path="/secure-viewer" element={<SecureResourceViewer />} />
              <Route path="/secure-video" element={<SecureVideo />} />
              <Route path="/study" element={<StudyHub />} />
              {/* <Route path="/subjects/:slug" element={<SubjectPage />} /> */}
              <Route path="/course" element={<CoursePage />} />
            </Route>
            <Route path="/viewer" element={<ResourceViewer />} />
          </Route>
           <Route path="/subjects">
            <Route index element={<SubjectsHub />} />
            <Route path=":id" element={<SubjectDetail />} />
          </Route>
           <Route path="/resources">
            <Route path="books" element={<BooksAndBooklets />} />
            <Route path="books-literary" element={<BooksLiterary />} />
            <Route path="notes" element={<ImportantNotes />} />
            <Route path="exams" element={<ImportantExams />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </WelcomeGate>
    </AuthProvider>
  );
}
