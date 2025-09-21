// src/App.jsx
import React, { createContext, useContext, useEffect, useMemo, useState, useRef } from "react";
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
import SubjectContent from "./pages/SubjectContent.jsx";

// Public
import WelcomePWA from "./pages/WelcomePWA.jsx";
import ExamsPage from "./pages/Exams.jsx";
import NotFound from "./pages/NotFound.jsx";

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
import Papers from "./pages/resources/papers/Paper.jsx";
import Gallery from "./pages/resources/Gallery.jsx";
import ExamQuiz from "./pages/ExamQuiz.jsx";
import EpisodePage from './pages/resources/EpisodePage.jsx';
import ScientistPage from "./pages/resources/ScientistPage.jsx";
import ScientistListPage from "./pages/resources/ScientistListPage.jsx";
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
        try {
          await u.getIdToken(true);
        } catch {}
      }
    }, 50 * 60 * 1000);

    return () => {
      unsubUser();
      unsubTok();
      clearInterval(iv);
    };
  }, []);

  const value = useMemo(
    () => ({ user, token, ready, signOut: () => signOut(auth) }),
    [user, token, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ─────────────────────────────
    Route Guards
    ───────────────────────────── */
function FullscreenLoader() {
  return (
    <div className="min-h-[100dvh] grid place-items-center bg-zinc-950 text-zinc-100">
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
    Animated App Shell (responsive + safe areas)
    ───────────────────────────── */
function AppShell() {
  const location = useLocation();
  const prefersReduced = useReducedMotion();
  const [headerH, setHeaderH] = useState(0);

  const pageMotion = useMemo(
    () =>
      prefersReduced
        ? { initial: false, animate: false, exit: false }
        : {
            initial: { opacity: 0, y: 8 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -8 },
            transition: { duration: 0.18, ease: [0.22, 0.61, 0.36, 1] },
          },
    [prefersReduced]
  );

  return (
    <div dir="rtl" className="bg-zinc-950 text-zinc-100 min-h-[100dvh] flex flex-col">
      <Header onHeightChange={setHeaderH} />
      <main
        className="flex-1 overflow-y-auto custom-scroll fix-ios px-3 md:px-6"
        style={{
          // Use CSS variables for safe area top and bottom.
          paddingTop: `calc(${headerH}px + env(safe-area-inset-top, 0px))`,
          paddingBottom: `calc(84px + env(safe-area-inset-bottom, 0px))`,
          marginInline: "auto",
          width: "100%",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} {...pageMotion}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <footer
        className="pb-[env(safe-area-inset-bottom,0px)] w-full"
        style={{ position: "sticky", bottom: 0 }}
      >
        <BottomNav />
      </footer>
    </div>
  );
}
function NoChromeLayout() {
  return (
    <div dir="rtl" className="bg-zinc-950 text-zinc-100 min-h-[100dvh]">
      {/* No Header / No BottomNav */}
      <main className="min-h-[100dvh] overflow-y-auto px-3 md:px-6">
        <Outlet />
      </main>
    </div>
  );
}

/* ─────────────────────────────
    Main App
    ───────────────────────────── */
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<RedirectIfAuthed />}>
          <Route path="/auth" element={<AuthWizard />} />
        </Route>

        <Route element={<RequireAuth />}>
          {/* Regular app pages WITH Header + BottomNav */}
          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/grammar" element={<GrammarPage />} />
            <Route path="/students/" element={<Students />} />
            <Route path="/exams/grade12" element={<ExamsGrade12 />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/exams" element={<ExamsHome />} />
            <Route path="/exams/bank" element={<ExamBank />} />
            <Route path="/settings" element={<ProfileSettings />} />
            <Route path="/exam" element={<ExamQuiz />} />
            <Route path="/study" element={<StudyHub />} />
            <Route path="/course" element={<CoursePage />} />
            <Route path="/subjects">
              <Route index element={<SubjectsHub />} />
              <Route path=":id" element={<SubjectDetail />} />
            </Route>
            {/* Keep other standard pages here */}
          </Route>

          {/* Exception pages WITHOUT Header + BottomNav */}
          <Route element={<NoChromeLayout />}>
            <Route path="/viewer" element={<ResourceViewer />} />
            <Route path="/resources">
              <Route path="books" element={<BooksAndBooklets />} />
              <Route path="books-literary" element={<BooksLiterary />} />
              <Route path="papers" element={<Papers />} />
              <Route path="notes" element={<ImportantNotes />} />
              <Route path="exams" element={<ImportantExams />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="texts" element={<EpisodePage />} />
              <Route path="scientist" element={<ScientistPage />} />
              <Route path="sounds" element={<SoundsPage />} />
            </Route>

            {/* Optional: also full-screen */}
            <Route path="/secure-viewer" element={<SecureResourceViewer />} />
            <Route path="/secure-video" element={<SecureVideo />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
